"use server";

import { db } from "@/db";
import { invoices, recoveries } from "@/db/schema";
import { LlamaParse } from "llama-parse";
import { parse } from "csv-parse/sync";
import { inngest } from "@/inngest/client";
import { getMe } from "./users";
import { getSignedUrl } from "@/lib/gcs";

interface CSVRecord {
  Tenant?: string;
  name?: string;
  Amount?: string;
  total?: string;
  Basic?: string;
  Usage?: string;
  Demand?: string;
  kVa?: string;
  Solar?: string;
  SolarProduced?: string;
}

export async function ingestAction(formData: FormData) {
  const user = await getMe();
  console.log(
    "Ingest Action - Full User Object:",
    JSON.stringify(user, null, 2),
  );

  if (!user) {
    console.log("Ingest Action - No user found in session");
    return { success: false, error: "Unauthorized: No active session found." };
  }

  if (!["admin", "editor"].includes(user.role)) {
    console.log(
      "Ingest Action - Insufficient Permissions. User Role:",
      user.role,
    );
    return {
      success: false,
      error: `Unauthorized: You do not have permission to ingest data. Your role is ${user.role || "none"}.`,
    };
  }

  const files = formData.getAll("files") as File[];
  const buildingId = formData.get("buildingId") as string;
  const documentType = (formData.get("documentType") as string) || "bill";
  const apiKey = process.env.LLAMA_CLOUD_API_KEY;

  if (!buildingId || buildingId === "all") {
    return { success: false, error: "A valid property must be selected." };
  }

  if (!apiKey) {
    return { success: false, error: "LLAMA_CLOUD_API_KEY is missing in .env" };
  }

  try {
    const extractedData: any[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileNameLower = file.name.toLowerCase();

      // Upload to GCS
      const { Storage } = await import("@google-cloud/storage");
      const storage = new Storage({
        projectId: process.env.GCS_PROJECT_ID,
        credentials: {
          client_email: process.env.GCS_CLIENT_EMAIL,
          private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
      });
      const bucket = storage.bucket(process.env.GCS_BUCKET_NAME || "");
      const gcsFilePath = `${buildingId}/${file.name}`;
      const gcsFile = bucket.file(gcsFilePath);
      await gcsFile.save(buffer, {
        metadata: { contentType: file.type },
      });
      const publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${gcsFilePath}`;

      if (fileNameLower.endsWith(".pdf")) {
        if (documentType === "recovery") {
          // Handle PDF Recovery Report
          const record = {
            id: crypto.randomUUID(),
            buildingId: buildingId,
            tenantName: "Bulk PDF Recovery", // Placeholder
            amountBilled: "0",
            period: new Date().toISOString().split("T")[0],
            pdfUrl: publicUrl,
          };
          await db.insert(recoveries).values(record);
          const signedUrl = await getSignedUrl(publicUrl);
          extractedData.push({
            fileName: file.name,
            type: "recovery-pdf",
            data: { ...record, pdfUrl: signedUrl },
          });
        } else {
          // Process Municipal Bill with LlamaParse
          const parser = new LlamaParse({
            apiKey,
          });

          const result = await parser.parseFile(file);
          console.log(
            "Ingest Action - LlamaParse result:",
            JSON.stringify(result, null, 2),
          );

          // Extract markdown text from LlamaParse MarkdownResult
          // LlamaParse returns { markdown: string, job_metadata: {...} }
          const parsedText = result.markdown || JSON.stringify(result);

          console.log("Ingest Action - Parsed text length:", parsedText.length);

          // ── Gemini extraction: pull real charges from bill text ──────
          const { GoogleGenerativeAI } = await import("@google/generative-ai");
          const { appSettings, utilityAccounts } = await import("@/db/schema");
          const { eq, and } = await import("drizzle-orm");

          const settingsResult = await db.select().from(appSettings).limit(1);
          const modelName =
            settingsResult[0]?.analysisModel || "gemini-3-flash-preview";

          const genAI = new GoogleGenerativeAI(
            process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
          );
          const model = genAI.getGenerativeModel({ model: modelName });

          const extractionPrompt = `
You are a South African municipal bill parser. Extract EVERY service/charge line from the following municipal bill text.

IMPORTANT RULES:
- Use the "Billed Amount" column (VAT exclusive). Do NOT use Billed VAT, Closing Balance, or any VAT-inclusive amount.
- Map each service to one of:
  - Electricity (Consumption)
  - Water (Consumption)
  - Sewerage (Consumption)
  - Refuse (Consumption - includes Waste, Refuse, Bin removals)
  - Assessment Rates (Fixed)
  - CID Levy (Fixed - includes Improvement District)
- For each service line, classify the charge:
  - If the service contains "Basic" or "Fixed" → basicCharge
  - If the service contains "Metered", "Usage", or "Consumption" → usageCharge
  - If the service contains "Demand" or "kVa" → demandCharge
  - Otherwise → usageCharge (default)
- Try to extract the billing period / statement date as YYYY-MM-DD.
- Extract any municipal account numbers, contract accounts, or utility account numbers found in the text as an array of strings.

Return ONLY valid JSON, no markdown fencing:
{
  "billingPeriod": "YYYY-MM-DD",
  "accountNumbers": ["123456789"],
  "services": [
    {
      "serviceName": "Electricity Metered",
      "utilityType": "Electricity",
      "billedAmount": 18300.98,
      "basicCharge": null,
      "usageCharge": 18300.98,
      "demandCharge": null
    },
    {
      "serviceName": "Refuse Charge",
      "utilityType": "Refuse",
      "billedAmount": 213.30,
      "basicCharge": null,
      "usageCharge": 213.30,
      "demandCharge": null
    }
  ]
}

BILL TEXT:
${parsedText}
`;

          let geminiExtraction: {
            billingPeriod?: string;
            accountNumbers?: string[];
            services: {
              serviceName: string;
              utilityType: string;
              billedAmount: number;
              basicCharge: number | null;
              usageCharge: number | null;
              demandCharge: number | null;
            }[];
          };

          try {
            const geminiResult = await model.generateContent(extractionPrompt);
            const responseText = geminiResult.response.text();
            console.log("Ingest Action - Gemini extraction response:", responseText);
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            geminiExtraction = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
          } catch (aiError) {
            console.error("Ingest Action - Gemini extraction failed:", aiError);
            // Fallback: insert a single zero-charge record so the pipeline doesn't break
            geminiExtraction = { services: [] };
          }

          const billingPeriod =
            geminiExtraction.billingPeriod ||
            new Date().toISOString().split("T")[0];
          
          const extractedAccounts = geminiExtraction.accountNumbers || [];

          // Fetch existing utility accounts for this building
          let accounts = await db
            .select()
            .from(utilityAccounts)
            .where(eq(utilityAccounts.buildingId, buildingId));

          // ── Validation: Check if uploaded invoice belongs to this building ──
          const registeredAccountNumbers = accounts
            .map((a) => a.accountNumber)
            .filter((acc) => acc && acc !== "AUTO-GENERATED");

          if (registeredAccountNumbers.length > 0 && extractedAccounts.length > 0) {
            // The building has at least one real account number registered.
            // Check if ANY of the extracted account numbers match ANY of the registered ones.
            const hasMatch = extractedAccounts.some((extracted) =>
              registeredAccountNumbers.some(
                (registered) =>
                  extracted.replace(/[^0-9a-zA-Z]/g, "") ===
                  registered.replace(/[^0-9a-zA-Z]/g, ""),
              ),
            );

            if (!hasMatch) {
              console.log(
                `Ingest Action - Validation Failed. Extracted: ${extractedAccounts.join(", ")}, Registered: ${registeredAccountNumbers.join(", ")}`,
              );
              return {
                success: false,
                error: `Validation Failed: The account number on this invoice does not match the registered accounts for this building.`,
              };
            }
          }

          const insertedRecords = [];

          if (geminiExtraction.services.length > 0) {
            // Group extracted services by utilityType
            const byType: Record<
              string,
              (typeof geminiExtraction.services)[number][]
            > = {};
            for (const svc of geminiExtraction.services) {
              if (!byType[svc.utilityType]) byType[svc.utilityType] = [];
              byType[svc.utilityType].push(svc);
            }

            for (const [utilityType, services] of Object.entries(byType)) {
              // Find or create utility account for this type
              let account = accounts.find((a) => a.type === utilityType);
              if (!account) {
                const newId = crypto.randomUUID();
                const validTypes = [
                  "Electricity",
                  "Solar",
                  "Water",
                  "Sewerage",
                  "Assessment Rates",
                  "CID Levy",
                  "Refuse",
                ] as const;
                const safeType = validTypes.includes(
                  utilityType as (typeof validTypes)[number],
                )
                  ? (utilityType as (typeof validTypes)[number])
                  : "Electricity";

                await db.insert(utilityAccounts).values({
                  id: newId,
                  buildingId: buildingId,
                  type: safeType,
                  accountNumber: "AUTO-GENERATED",
                });
                account = {
                  id: newId,
                  buildingId,
                  type: safeType,
                  accountNumber: "AUTO-GENERATED",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };
                accounts.push(account);
              }

              // Aggregate charges for this utility type
              let totalAmount = 0;
              let totalBasic = 0;
              let totalUsage = 0;
              let totalDemand = 0;
              for (const svc of services) {
                totalAmount += svc.billedAmount || 0;
                totalBasic += svc.basicCharge || 0;
                totalUsage += svc.usageCharge || 0;
                totalDemand += svc.demandCharge || 0;
              }

              // ── Upsert Logic ──────────────────────────────────────────────
              const existingInvoice = await db.query.invoices.findFirst({
                where: and(
                  eq(invoices.utilityAccountId, account.id),
                  eq(invoices.billingPeriod, billingPeriod),
                ),
              });

              if (existingInvoice) {
                // Update existing record
                await db
                  .update(invoices)
                  .set({
                    amount: totalAmount.toFixed(2),
                    basicCharge: totalBasic.toFixed(2),
                    usageCharge: totalUsage.toFixed(2),
                    demandCharge: totalDemand.toFixed(2),
                    updatedAt: new Date(),
                  })
                  .where(eq(invoices.id, existingInvoice.id));
                
                insertedRecords.push({ ...existingInvoice, amount: totalAmount.toFixed(2) });
                console.log(
                  `Ingest Action - Invoice UPDATED: ${utilityType} = R${totalAmount.toFixed(2)}`,
                );
              } else {
                // Insert new record
                const record = {
                  id: crypto.randomUUID(),
                  utilityAccountId: account.id,
                  billingPeriod,
                  amount: totalAmount.toFixed(2),
                  basicCharge: totalBasic.toFixed(2),
                  usageCharge: totalUsage.toFixed(2),
                  demandCharge: totalDemand.toFixed(2),
                  usage: "0",
                  pdfUrl: publicUrl,
                };
                await db.insert(invoices).values(record);
                insertedRecords.push(record);
                console.log(
                  `Ingest Action - Invoice inserted: ${utilityType} = R${totalAmount.toFixed(2)}`,
                );
              }
            }
          } else {
            // Fallback: Gemini returned no services, insert zero-charge placeholder
            console.warn(
              "Ingest Action - Gemini returned no services, inserting fallback.",
            );
            let fallbackAccountId = accounts[0]?.id;
            if (!fallbackAccountId) {
              const newId = crypto.randomUUID();
              await db.insert(utilityAccounts).values({
                id: newId,
                buildingId: buildingId,
                type: "Electricity",
                accountNumber: "AUTO-GENERATED",
              });
              fallbackAccountId = newId;
            }
            const record = {
              id: crypto.randomUUID(),
              utilityAccountId: fallbackAccountId,
              billingPeriod,
              amount: "0",
              basicCharge: "0",
              usageCharge: "0",
              demandCharge: "0",
              usage: "0",
              pdfUrl: publicUrl,
            };
            await db.insert(invoices).values(record);
            insertedRecords.push(record);
          }

          extractedData.push({
            fileName: file.name,
            type: "bill-pdf",
            llamaResult: parsedText.substring(0, 500),
            geminiExtraction,
            records: await Promise.all(insertedRecords.map(async r => ({ ...r, pdfUrl: await getSignedUrl(r.pdfUrl) }))),
          });
          console.log(
            `Ingest Action - ${insertedRecords.length} invoice(s) inserted for PDF.`,
          );
        }
      } else if (fileNameLower.endsWith(".csv")) {
        console.log("Ingest Action - Handling CSV file.");
        // Process Tenant Recoveries with csv-parse
        const content = buffer.toString();
        const records = parse(content, {
          columns: true,
          skip_empty_lines: true,
        }) as CSVRecord[];

        const insertedRecords = [];
        for (const record of records) {
          const insertData = {
            id: crypto.randomUUID(),
            buildingId: buildingId,
            tenantName: record.Tenant || record.name || "Unknown",
            amountBilled: record.Amount || record.total || "0",
            basicCharge: record.Basic || "0",
            usageCharge: record.Usage || "0",
            demandCharge: record.Demand || record.kVa || "0",
            solarProduced: record.Solar || record.SolarProduced || "0",
            period: new Date().toISOString().split("T")[0],
            pdfUrl: null, // No PDF for CSV entries
          };
          await db.insert(recoveries).values(insertData);
          insertedRecords.push(insertData);
        }
        extractedData.push({
          fileName: file.name,
          type: "recovery-csv",
          records: insertedRecords,
        });
      } else {
        // Unsupported format but uploaded to GCS
        extractedData.push({
          fileName: file.name,
          type: "unsupported",
          publicUrl,
          message: "Files of this type are uploaded to storage but not natively parsed into the registry.",
        });
      }
    }

    let targetPeriod = new Date().toISOString().split("T")[0];
    if (extractedData.length > 0) {
      // Find the earliest billingPeriod from all inserted records to trigger the analysis for that month
      const allPeriods: string[] = [];
      for (const ed of extractedData) {
        if (ed.records && Array.isArray(ed.records)) {
          allPeriods.push(...ed.records.map((r: any) => r.billingPeriod || r.period));
        }
      }
      const validPeriods = allPeriods.filter(Boolean).sort();
      if (validPeriods.length > 0) {
        targetPeriod = validPeriods[0];
      }
    }

    if (files.length > 0 && buildingId) {
      await inngest.send({
        name: "app/data.ingested",
        data: {
          buildingId,
          period: targetPeriod,
        },
      });
    }

    return { success: true, extractedData };
  } catch (error: unknown) {
    console.error("Ingestion error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

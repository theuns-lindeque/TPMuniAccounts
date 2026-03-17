import { inngest } from "./client";
import { db } from "@/db";
import {
  invoices,
  recoveries,
  analysisReports,
  feedbackLoop,
  utilityAccounts,
} from "@/db/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const analyzeUtilityData = inngest.createFunction(
  { id: "analyze-utility-data" },
  { event: "app/data.ingested" },
  async ({ event, step }) => {
    const { buildingId, period } = event.data;

    // 1. Fetch historical data (last 6 months)
    const historicalData = await step.run("fetch-historical-data", async () => {
      const sixMonthsAgo = new Date(period);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const startDate = sixMonthsAgo.toISOString().split("T")[0];

      const buildingInvoices = await db
        .select({
          amount: invoices.amount,
          basicCharge: invoices.basicCharge,
          usageCharge: invoices.usageCharge,
          demandCharge: invoices.demandCharge,
          billingPeriod: invoices.billingPeriod,
          type: utilityAccounts.type,
        })
        .from(invoices)
        .innerJoin(
          utilityAccounts,
          eq(invoices.utilityAccountId, utilityAccounts.id),
        )
        .where(
          and(
            eq(utilityAccounts.buildingId, buildingId),
            gte(invoices.billingPeriod, startDate),
          ),
        );

      const buildingRecoveries = await db
        .select({
          tenantName: recoveries.tenantName,
          amountBilled: recoveries.amountBilled,
          basicCharge: recoveries.basicCharge,
          usageCharge: recoveries.usageCharge,
          demandCharge: recoveries.demandCharge,
          solarProduced: recoveries.solarProduced,
          period: recoveries.period,
        })
        .from(recoveries)
        .where(
          and(
            eq(recoveries.buildingId, buildingId),
            gte(recoveries.period, startDate),
          ),
        );

      return { buildingInvoices, buildingRecoveries };
    });

    // 2. Fetch feedback loop context
    const feedbackContext = await step.run("fetch-feedback", async () => {
      return await db
        .select()
        .from(feedbackLoop)
        .innerJoin(
          analysisReports,
          eq(feedbackLoop.analysisReportId, analysisReports.id),
        )
        .where(eq(analysisReports.buildingId, buildingId))
        .orderBy(desc(feedbackLoop.createdAt))
        .limit(10);
    });

    // 3. Prompt Gemini
    const report = await step.run("generate-ai-report", async () => {
      const { appSettings } = await import("@/db/schema");
      const settingsResult = await db.select().from(appSettings).limit(1);
      const analysisModel =
        settingsResult[0]?.analysisModel || "gemini-1.5-pro";

      const genAI = new GoogleGenerativeAI(
        process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
      );
      const model = genAI.getGenerativeModel({ model: analysisModel });

      const prompt = `
        You are an expert utility auditor for commercial properties. 
        Analyze the following data for building ID: ${buildingId} for the period: ${period}.
        
        Historical Invoices: ${JSON.stringify(historicalData.buildingInvoices)}
        Historical Recoveries: ${JSON.stringify(historicalData.buildingRecoveries)}
        User Feedback/Corrections from past reports: ${JSON.stringify(feedbackContext)}

        Audit Parameters:
        - Expense Types: Electricity, Solar (Landlord only), Water, Sewerage, Assessment Rates, CID Levy.
        - Charges: Basic Charge, Usage Charge, kVa Demand (Demand Charge).
        - IMPORTANT: Solar production is provided via check meters but is a Landlord recovery ONLY. It should not be billed to tenants but recorded for building metrics.
        - Compare total invoice amounts against tenant recoveries for each utility type.
        - Flag deficits where recovery < expense (excluding Solar).

        Output a structured JSON response with the following fields:
        {
          "expenseTrend": "percentage change (e.g. +5.2%)",
          "recoveryTrend": "percentage change (e.g. -1.0%)",
          "netRecoveryDeficit": "total deficit/surplus value as a string",
          "risks": ["risk 1", "risk 2"],
          "riskLevel": "Low" | "Medium" | "High",
          "totalInvoiceAmount": "number",
          "totalRecoveryAmount": "number"
        }

        Be specific about which charges (Basic vs Usage vs kVa) are driving deficits. 
        Use the feedback context to avoid repeating previous errors.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      // Extract JSON if it's wrapped in markdown
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    });

    // 4. Save report
    await step.run("save-report", async () => {
      await db.insert(analysisReports).values({
        id: crypto.randomUUID(),
        buildingId,
        period,
        totalInvoiceAmount: report.totalInvoiceAmount.toString(),
        totalRecoveryAmount: report.totalRecoveryAmount.toString(),
        deficit: (
          parseFloat(report.totalInvoiceAmount) -
          parseFloat(report.totalRecoveryAmount)
        ).toString(),
        riskLevel: report.riskLevel,
        anomaliesFound: report.risks,
      });
    });

    return { success: true, reportId: buildingId }; // Simplified return
  },
);

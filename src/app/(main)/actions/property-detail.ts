"use server";

import { db } from "@/db";
import {
  buildings,
  invoices,
  recoveries,
  analysisReports,
  utilityAccounts,
} from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { getMe } from "./users";

export async function getPropertyDetail(
  buildingId: string,
  startDate: string,
  endDate: string,
) {
  const user = await getMe();
  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  try {
    // 1. Get building
    const building = await db.query.buildings.findFirst({
      where: eq(buildings.id, buildingId),
      with: { utilityAccounts: true },
    });

    if (!building) {
      return { success: false as const, error: "Property not found" };
    }

    // 2. Get invoices via utility accounts
    const accountIds = building.utilityAccounts.map((a) => a.id);

    let buildingInvoices: {
      id: string;
      billingPeriod: string;
      amount: string;
      basicCharge: string | null;
      usageCharge: string | null;
      demandCharge: string | null;
      usage: string | null;
      pdfUrl: string | null;
      utilityType: string;
      accountNumber: string;
    }[] = [];

    if (accountIds.length > 0) {
      // Fetch invoices for each utility account in the date range
      for (const accId of accountIds) {
        const acc = building.utilityAccounts.find((a) => a.id === accId)!;
        const accInvoices = await db
          .select({
            id: invoices.id,
            billingPeriod: invoices.billingPeriod,
            amount: invoices.amount,
            basicCharge: invoices.basicCharge,
            usageCharge: invoices.usageCharge,
            demandCharge: invoices.demandCharge,
            usage: invoices.usage,
            pdfUrl: invoices.pdfUrl,
          })
          .from(invoices)
          .where(
            and(
              eq(invoices.utilityAccountId, accId),
              gte(invoices.billingPeriod, startDate),
              lte(invoices.billingPeriod, endDate),
            ),
          )
          .orderBy(desc(invoices.billingPeriod));

        buildingInvoices.push(
          ...accInvoices.map((inv) => ({
            ...inv,
            utilityType: acc.type,
            accountNumber: acc.accountNumber,
          })),
        );
      }
    }

    // 3. Get recoveries
    const buildingRecoveries = await db
      .select()
      .from(recoveries)
      .where(
        and(
          eq(recoveries.buildingId, buildingId),
          gte(recoveries.period, startDate),
          lte(recoveries.period, endDate),
        ),
      )
      .orderBy(desc(recoveries.period));

    // 4. Get latest analysis report
    const latestReport = await db
      .select()
      .from(analysisReports)
      .where(eq(analysisReports.buildingId, buildingId))
      .orderBy(desc(analysisReports.createdAt))
      .limit(1);

    // 5. Collect all uploaded documents (PDFs) across all dates
    const allDocuments: {
      name: string;
      url: string;
      type: "bill" | "recovery";
      date: string;
    }[] = [];

    // From invoices (all time, not just filtered range)
    if (accountIds.length > 0) {
      for (const accId of accountIds) {
        const acc = building.utilityAccounts.find((a) => a.id === accId)!;
        const accInvoicesAll = await db
          .select({
            pdfUrl: invoices.pdfUrl,
            billingPeriod: invoices.billingPeriod,
          })
          .from(invoices)
          .where(eq(invoices.utilityAccountId, accId))
          .orderBy(desc(invoices.billingPeriod));

        for (const inv of accInvoicesAll) {
          if (
            inv.pdfUrl &&
            !allDocuments.some((d) => d.url === inv.pdfUrl)
          ) {
            // Extract filename from GCS URL
            const urlParts = inv.pdfUrl.split("/");
            const fileName = decodeURIComponent(
              urlParts[urlParts.length - 1] || "Document",
            );
            allDocuments.push({
              name: fileName,
              url: inv.pdfUrl,
              type: "bill",
              date: inv.billingPeriod,
            });
          }
        }
      }
    }

    // From recoveries (all time)
    const allRecoveries = await db
      .select({
        pdfUrl: recoveries.pdfUrl,
        period: recoveries.period,
        tenantName: recoveries.tenantName,
      })
      .from(recoveries)
      .where(eq(recoveries.buildingId, buildingId))
      .orderBy(desc(recoveries.period));

    for (const rec of allRecoveries) {
      if (rec.pdfUrl && !allDocuments.some((d) => d.url === rec.pdfUrl)) {
        const urlParts = rec.pdfUrl.split("/");
        const fileName = decodeURIComponent(
          urlParts[urlParts.length - 1] || "Document",
        );
        allDocuments.push({
          name: fileName,
          url: rec.pdfUrl,
          type: "recovery",
          date: rec.period,
        });
      }
    }

    // Serialize
    return {
      success: true as const,
      building: {
        id: building.id,
        name: building.name,
        address: building.address,
        region: building.region,
        municipalValue: building.municipalValue,
        utilityAccounts: building.utilityAccounts.map((a) => ({
          id: a.id,
          accountNumber: a.accountNumber,
          type: a.type,
        })),
      },
      invoices: buildingInvoices,
      recoveries: buildingRecoveries.map((r) => ({
        id: r.id,
        tenantName: r.tenantName,
        amountBilled: r.amountBilled,
        basicCharge: r.basicCharge,
        usageCharge: r.usageCharge,
        demandCharge: r.demandCharge,
        solarProduced: r.solarProduced,
        period: r.period,
        pdfUrl: r.pdfUrl,
      })),
      documents: allDocuments,
      analysisReport: latestReport[0]
        ? {
            id: latestReport[0].id,
            period: latestReport[0].period,
            totalInvoiceAmount: latestReport[0].totalInvoiceAmount,
            totalRecoveryAmount: latestReport[0].totalRecoveryAmount,
            deficit: latestReport[0].deficit,
            riskLevel: latestReport[0].riskLevel,
            anomaliesFound: latestReport[0].anomaliesFound as string[] | null,
          }
        : null,
    };
  } catch (error: unknown) {
    console.error("Property detail error:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

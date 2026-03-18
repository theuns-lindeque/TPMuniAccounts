"use server";

import { db } from "@/db";
import { invoices, recoveries, analysisReports, buildings } from "@/db/schema";
import { desc, gte, and, eq } from "drizzle-orm";
import { getMe } from "./users";

export async function getDashboardData() {
  const user = await getMe();
  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  try {
    // 1. Get last 12 months range for trends
    const now = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(now.getMonth() - 11);
    twelveMonthsAgo.setDate(1); // Start of month
    
    const startDateStr = twelveMonthsAgo.toISOString().split("T")[0];

    // 2. Fetch all invoices & recoveries in this range for aggregation
    const [allInvoices, allRecoveries] = await Promise.all([
      db.select().from(invoices).where(gte(invoices.billingPeriod, startDateStr)),
      db.select().from(recoveries).where(gte(recoveries.period, startDateStr)),
    ]);

    // Group by month YYYY-MM
    const chartMap: Record<string, { month: string; invoices: number; recoveries: number }> = {};
    
    // Initialize last 12 months with zeros
    for (let i = 0; i < 12; i++) {
        const d = new Date(twelveMonthsAgo);
        d.setMonth(twelveMonthsAgo.getMonth() + i);
        const monthKey = d.toLocaleString("en-US", { month: "short", year: "2-digit" }); // e.g. "Mar 26"
        const isoMonth = d.toISOString().split("T")[0].substring(0, 7); // YYYY-MM
        chartMap[isoMonth] = { month: monthKey, invoices: 0, recoveries: 0 };
    }

    allInvoices.forEach(inv => {
        const m = inv.billingPeriod.substring(0, 7);
        if (chartMap[m]) {
            chartMap[m].invoices += parseFloat(inv.amount);
        }
    });

    allRecoveries.forEach(rec => {
        const m = rec.period.substring(0, 7);
        if (chartMap[m]) {
            chartMap[m].recoveries += parseFloat(rec.amountBilled);
        }
    });

    const chartData = Object.values(chartMap).sort((a, b) => {
        // Rough sort by month string if needed, but they are already in order from initialization
        return 0; 
    });

    // 3. Fetch analysis reports to group for the table
    const rawReports = await db.query.analysisReports.findMany({
      orderBy: [desc(analysisReports.period)],
    });

    const reportGroups: Record<string, any> = {};

    rawReports.forEach((r) => {
      const p = r.period.substring(0, 7); // YYYY-MM
      if (!reportGroups[p]) {
        reportGroups[p] = {
          id: r.id, // Use the latest ID as reference
          period: p,
          totalInvoiceAmount: 0,
          totalRecoveryAmount: 0,
          deficit: 0,
          riskLevel: "Low",
          anomaliesFound: [],
        };
      }

      reportGroups[p].totalInvoiceAmount += Number(r.totalInvoiceAmount);
      reportGroups[p].totalRecoveryAmount += Number(r.totalRecoveryAmount);
      reportGroups[p].deficit += Number(r.deficit);

      // Determine highest risk level
      const risks = { Low: 1, Medium: 2, High: 3 };
      const currentRisk =
        risks[r.riskLevel as keyof typeof risks] || 1;
      const groupRisk =
        risks[reportGroups[p].riskLevel as keyof typeof risks] || 1;

      if (currentRisk > groupRisk) {
        reportGroups[p].riskLevel = r.riskLevel;
      }

      if (r.anomaliesFound && Array.isArray(r.anomaliesFound)) {
        reportGroups[p].anomaliesFound.push(...r.anomaliesFound);
      }
    });

    // Convert to array, sort descending by period, and take the top 20
    const aggregatedReports = Object.values(reportGroups)
      .sort((a, b) => b.period.localeCompare(a.period))
      .slice(0, 20);

    // 4. Get the latest record for Risks Panel (we can just use the first raw report)
    const latestReport = rawReports[0] || null;

    return {
      success: true as const,
      reports: aggregatedReports.map((r) => ({
        id: r.id,
        period: r.period,
        totalInvoiceAmount: r.totalInvoiceAmount,
        totalRecoveryAmount: r.totalRecoveryAmount,
        deficit: r.deficit,
        riskLevel: r.riskLevel,
        anomaliesFound: r.anomaliesFound,
      })),
      chartData,
      latestReport: latestReport
        ? {
            id: latestReport.id,
            anomaliesFound: latestReport.anomaliesFound as string[] | null,
          }
        : null,
    };
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return { success: false as const, error: "Failed to fetch dashboard data" };
  }
}

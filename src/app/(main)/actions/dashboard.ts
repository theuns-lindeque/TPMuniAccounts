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

    // 3. Fetch analysis reports for the table (latest 20)
    const reports = await db.query.analysisReports.findMany({
      orderBy: [desc(analysisReports.period)],
      limit: 20,
    });

    // 4. Get the latest record for Risks Panel
    const latestReport = reports[0] || null;

    return {
      success: true as const,
      reports: reports.map(r => ({
        id: r.id,
        period: r.period.substring(0, 7), // YYYY-MM
        totalInvoiceAmount: r.totalInvoiceAmount,
        totalRecoveryAmount: r.totalRecoveryAmount,
        deficit: r.deficit,
        riskLevel: r.riskLevel,
        anomaliesFound: r.anomaliesFound as string[] | null,
      })),
      chartData,
      latestReport: latestReport ? {
          id: latestReport.id,
          anomaliesFound: latestReport.anomaliesFound as string[] | null,
      } : null,
    };
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return { success: false as const, error: "Failed to fetch dashboard data" };
  }
}

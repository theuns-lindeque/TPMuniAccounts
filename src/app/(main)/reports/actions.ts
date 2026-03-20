"use server";

import { db } from "@/db";
import { invoices, recoveries, buildings, utilityAccounts } from "@/db/schema";
import { and, eq, gte, lte, asc } from "drizzle-orm";
import { getMe } from "../actions/users";

export async function getReportBuildings() {
  const user = await getMe();
  if (!user) return { success: false as const, error: "Unauthorized" };

  try {
    const data = await db.select().from(buildings).orderBy(asc(buildings.name));
    return { success: true as const, buildings: data };
  } catch (error) {
    console.error("Error fetching buildings:", error);
    return { success: false as const, error: "Failed to fetch buildings" };
  }
}

export async function getReportData(filters: {
  buildingId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const user = await getMe();
  if (!user) return { success: false as const, error: "Unauthorized" };

  try {
    const { buildingId, startDate, endDate } = filters;

    // 1. Fetch Invoices with Utility Account and Building join
    let invoiceQuery = db
      .select({
        id: invoices.id,
        amount: invoices.amount,
        billingPeriod: invoices.billingPeriod,
        type: utilityAccounts.type,
        buildingName: buildings.name,
        buildingId: buildings.id,
        basicCharge: invoices.basicCharge,
        usageCharge: invoices.usageCharge,
        usage: invoices.usage,
      })
      .from(invoices)
      .innerJoin(utilityAccounts, eq(invoices.utilityAccountId, utilityAccounts.id))
      .innerJoin(buildings, eq(utilityAccounts.buildingId, buildings.id));

    const invoiceConditions = [];
    if (buildingId && buildingId !== "all") {
      invoiceConditions.push(eq(buildings.id, buildingId));
    }
    if (startDate) {
      invoiceConditions.push(gte(invoices.billingPeriod, startDate));
    }
    if (endDate) {
      invoiceConditions.push(lte(invoices.billingPeriod, endDate));
    }

    const filteredInvoices = await (invoiceConditions.length > 0
      ? invoiceQuery.where(and(...invoiceConditions))
      : invoiceQuery);

    // 2. Fetch Recoveries
    let recoveryQuery = db
      .select({
        id: recoveries.id,
        tenantName: recoveries.tenantName,
        amountBilled: recoveries.amountBilled,
        period: recoveries.period,
        buildingName: buildings.name,
        buildingId: buildings.id,
        basicCharge: recoveries.basicCharge,
        usageCharge: recoveries.usageCharge,
      })
      .from(recoveries)
      .innerJoin(buildings, eq(recoveries.buildingId, buildings.id));

    const recoveryConditions = [];
    if (buildingId && buildingId !== "all") {
      recoveryConditions.push(eq(buildings.id, buildingId));
    }
    if (startDate) {
      recoveryConditions.push(gte(recoveries.period, startDate));
    }
    if (endDate) {
      recoveryConditions.push(lte(recoveries.period, endDate));
    }

    const filteredRecoveries = await (recoveryConditions.length > 0
      ? recoveryQuery.where(and(...recoveryConditions))
      : recoveryQuery);

    return {
      success: true as const,
      invoices: filteredInvoices,
      recoveries: filteredRecoveries,
    };
  } catch (error) {
    console.error("Error fetching report data:", error);
    return { success: false as const, error: "Failed to fetch report data" };
  }
}

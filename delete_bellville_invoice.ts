import { db } from "./src/db";
import { invoices, utilityAccounts, buildings } from "./src/db/schema";
import { eq, and, inArray } from "drizzle-orm";

async function run() {
  const building = await db.query.buildings.findFirst({
    where: eq(buildings.name, "Bellville Mall")
  });

  if (!building) {
    console.log("Bellville Mall not found!");
    return;
  }

  const accounts = await db.select().from(utilityAccounts).where(eq(utilityAccounts.buildingId, building.id));
  const accountIds = accounts.map(a => a.id);

  if (accountIds.length === 0) {
    console.log("No accounts found for Bellville Mall.");
    return;
  }

  const period = "2026-02-25"; // the incorrect entry

  console.log(`Deleting invoices for Bellville Mall (Building ID: ${building.id}) for period ${period}`);

  const result = await db.delete(invoices).where(
    and(
      eq(invoices.billingPeriod, period),
      inArray(invoices.utilityAccountId, accountIds)
    )
  ).returning();

  console.log(`Deleted ${result.length} invoices:`, result.map(r => ({ id: r.id, amount: r.amount })));
}

run().catch(console.error);

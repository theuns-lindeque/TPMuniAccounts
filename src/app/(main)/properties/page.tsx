import React from "react";
export const dynamic = "force-dynamic";
import { db } from "@/db";
import PropertiesClient from "./PropertiesClient";

export default async function PropertiesPage() {
  const allBuildings = await db.query.buildings.findMany({
    with: {
      utilityAccounts: true,
    },
    orderBy: (buildings, { asc }) => [asc(buildings.name)],
  });

  // Type assertion to match the client component's expectation if needed,
  // although Drizzle types should align well enough for serializing.
  const serializedBuildings = allBuildings.map((b) => ({
    ...b,
    region: b.region as
      | "Gauteng"
      | "Eastern Cape"
      | "Western Cape"
      | "Students",
    utilityAccounts: b.utilityAccounts.map((acc) => ({
      id: acc.id,
      accountNumber: acc.accountNumber,
      type: acc.type,
    })),
  }));

  return <PropertiesClient initialBuildings={serializedBuildings} />;
}

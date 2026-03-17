"use server";

import { db } from "@/db";
import { buildings } from "@/db/schema";
import { getMe } from "./users";
import { revalidatePath } from "next/cache";

export async function createBuildingAction(data: {
  name: string;
  address?: string;
  municipalValue?: string;
  region: "Gauteng" | "Eastern Cape" | "Western Cape" | "Students";
}) {
  const user = await getMe();
  if (!user || !["admin", "editor"].includes(user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.insert(buildings).values({
      id: crypto.randomUUID(),
      name: data.name,
      address: data.address,
      municipalValue: data.municipalValue,
      region: data.region,
    });
    revalidatePath("/properties");
    return { success: true };
  } catch (error: unknown) {
    console.error("Create building error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getAllBuildingsAction() {
  const user = await getMe();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const allBuildings = await db.query.buildings.findMany({
      orderBy: (buildings, { asc }) => [asc(buildings.name)],
    });
    return { success: true, buildings: allBuildings };
  } catch (error: unknown) {
    console.error("Fetch buildings error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

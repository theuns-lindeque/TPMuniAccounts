"use server";

import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAppSettings() {
  try {
    const settings = await db.select().from(appSettings).limit(1);
    if (settings.length === 0) {
      // Initialize with defaults if empty
      const [newSettings] = await db
        .insert(appSettings)
        .values({ id: crypto.randomUUID() })
        .returning();
      return newSettings;
    }
    return settings[0];
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return null;
  }
}

export async function updateAppSettings(data: {
  chatModel?: string;
  analysisModel?: string;
}) {
  try {
    const settings = await getAppSettings();
    if (!settings) throw new Error("Could not find settings to update");

    const [updated] = await db
      .update(appSettings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(appSettings.id, settings.id))
      .returning();

    revalidatePath("/settings");
    revalidatePath("/");
    return { success: true, settings: updated };
  } catch (error) {
    console.error("Failed to update settings:", error);
    return { success: false, error: "System failure during settings update." };
  }
}

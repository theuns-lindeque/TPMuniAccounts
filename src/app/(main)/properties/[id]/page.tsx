import React from "react";
export const dynamic = "force-dynamic";
import { getPropertyDetail } from "@/app/(main)/actions/property-detail";
import PropertyDetailClient from "./PropertyDetailClient";
import { redirect } from "next/navigation";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Default: last 6 months
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 6);

  const startDate = start.toISOString().split("T")[0];
  const endDate = end.toISOString().split("T")[0];

  const result = await getPropertyDetail(id, startDate, endDate);

  if (!result.success || !("building" in result)) {
    redirect("/properties");
  }

  return (
    <PropertyDetailClient
      building={result.building}
      initialInvoices={result.invoices}
      initialRecoveries={result.recoveries}
      analysisReport={result.analysisReport}
      defaultStartDate={startDate}
      defaultEndDate={endDate}
    />
  );
}

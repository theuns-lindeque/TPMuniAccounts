import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReportData {
  invoices: any[];
  recoveries: any[];
  filters: {
    buildingName: string;
    startDate: string;
    endDate: string;
  };
}

export async function generateExcelReport(data: ReportData) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TPMuniAccounts AI Engine";
  workbook.created = new Date();

  // 1. Summary Sheet
  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.columns = [
    { header: "Field", key: "field", width: 25 },
    { header: "Value", key: "value", width: 40 },
  ];

  const totalInvoices = data.invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
  const totalRecoveries = data.recoveries.reduce((sum, rec) => sum + parseFloat(rec.amountBilled), 0);

  summarySheet.addRows([
    { field: "Property", value: data.filters.buildingName },
    { field: "Period", value: `${data.filters.startDate} to ${data.filters.endDate}` },
    { field: "Total Municipal Invoices", value: totalInvoices.toFixed(2) },
    { field: "Total Tenant Recoveries", value: totalRecoveries.toFixed(2) },
    { field: "Net Deficit/Surplus", value: (totalInvoices - totalRecoveries).toFixed(2) },
  ]);

  summarySheet.getRow(1).font = { bold: true };

  // 2. Invoices Sheet
  const invSheet = workbook.addWorksheet("Municipal Invoices");
  invSheet.columns = [
    { header: "Building", key: "buildingName", width: 25 },
    { header: "Period", key: "billingPeriod", width: 15 },
    { header: "Utility Type", key: "type", width: 15 },
    { header: "Amount", key: "amount", width: 15 },
    { header: "Basic Charge", key: "basicCharge", width: 15 },
    { header: "Usage Charge", key: "usageCharge", width: 15 },
    { header: "Usage", key: "usage", width: 10 },
  ];
  invSheet.addRows(data.invoices);
  invSheet.getRow(1).font = { bold: true };

  // 3. Recoveries Sheet
  const recSheet = workbook.addWorksheet("Tenant Recoveries");
  recSheet.columns = [
    { header: "Building", key: "buildingName", width: 25 },
    { header: "Period", key: "period", width: 15 },
    { header: "Tenant Name", key: "tenantName", width: 30 },
    { header: "Amount Billed", key: "amountBilled", width: 15 },
    { header: "Basic Charge", key: "basicCharge", width: 15 },
    { header: "Usage Charge", key: "usageCharge", width: 15 },
  ];
  recSheet.addRows(data.recoveries);
  recSheet.getRow(1).font = { bold: true };

  // Generate Buffer and Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Report_${data.filters.buildingName.replace(/\s+/g, "_")}_${data.filters.startDate}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export async function generatePDFReport(data: ReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(20, 184, 166); // Teal-500
  doc.text("TPMuniAccounts Audit Report", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  // Summary Box
  doc.setDrawColor(230);
  doc.setFillColor(249, 250, 251);
  doc.rect(14, 35, pageWidth - 28, 35, "F");
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("Report Summary", 20, 45);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Property: ${data.filters.buildingName}`, 20, 52);
  doc.text(`Period: ${data.filters.startDate} to ${data.filters.endDate}`, 20, 58);
  
  const totalInvoices = data.invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
  const totalRecoveries = data.recoveries.reduce((sum, rec) => sum + parseFloat(rec.amountBilled), 0);
  
  doc.text(`Total Invoices: R ${totalInvoices.toLocaleString()}`, 120, 52);
  doc.text(`Total Recoveries: R ${totalRecoveries.toLocaleString()}`, 120, 58);
  doc.text(`Net Position: R ${(totalInvoices - totalRecoveries).toLocaleString()}`, 120, 64);

  // Invoices Table
  doc.setFontSize(14);
  doc.text("Municipal Invoices Breakdown", 14, 85);
  
  autoTable(doc, {
    startY: 90,
    head: [["Building", "Period", "Type", "Amount", "Basic", "Usage"]],
    body: data.invoices.map(inv => [
      inv.buildingName,
      inv.billingPeriod,
      inv.type,
      `R ${parseFloat(inv.amount).toLocaleString()}`,
      inv.basicCharge ? `R ${parseFloat(inv.basicCharge).toLocaleString()}` : "-",
      inv.usageCharge ? `R ${parseFloat(inv.usageCharge).toLocaleString()}` : "-",
    ]),
    theme: "striped",
    headStyles: { fillColor: [20, 184, 166] },
  });

  // Recoveries Table
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.text("Tenant Recoveries Breakdown", 14, finalY);

  autoTable(doc, {
    startY: finalY + 5,
    head: [["Building", "Period", "Tenant", "Amount Billed", "Basic", "Usage"]],
    body: data.recoveries.map(rec => [
      rec.buildingName,
      rec.period,
      rec.tenantName,
      `R ${parseFloat(rec.amountBilled).toLocaleString()}`,
      rec.basicCharge ? `R ${parseFloat(rec.basicCharge).toLocaleString()}` : "-",
      rec.usageCharge ? `R ${parseFloat(rec.usageCharge).toLocaleString()}` : "-",
    ]),
    theme: "striped",
    headStyles: { fillColor: [20, 184, 166] },
  });

  doc.save(`Report_${data.filters.buildingName.replace(/\s+/g, "_")}_${data.filters.startDate}.pdf`);
}

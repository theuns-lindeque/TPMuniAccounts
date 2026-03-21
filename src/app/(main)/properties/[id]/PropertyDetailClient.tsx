"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
  alpha,
  CircularProgress,
  useTheme,
  Divider,
} from "@mui/material";
import {
  FileText,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getPropertyDetail } from "@/app/(main)/actions/property-detail";
import { KPICard } from "@/components/ui/KPICard";
import {
  PropertyHeader,
  ExpenseAccordion,
  RecoveryTable,
  AIRiskPanel,
  MeterList,
  DocumentArchive,
  type Building,
  type Invoice,
  type Recovery,
  type AnalysisReport,
  type DocumentItem,
} from "./PropertyComponents";

const PERIOD_OPTIONS = [
  { label: "6 Months", months: 6 },
  { label: "12 Months", months: 12 },
  { label: "18 Months", months: 18 },
  { label: "24 Months", months: 24 },
] as const;

function currency(val: string | null | undefined): string {
  if (!val) return "—";
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  return `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PropertyDetailClient({
  building,
  initialInvoices,
  initialRecoveries,
  analysisReport: initialAnalysisReport,
  defaultStartDate,
  defaultEndDate,
}: {
  building: Building;
  initialInvoices: Invoice[];
  initialRecoveries: Recovery[];
  analysisReport: AnalysisReport | null;
  defaultStartDate: string;
  defaultEndDate: string;
}) {
  const theme = useTheme();
  const [invoiceData, setInvoiceData] = useState<Invoice[]>(initialInvoices);
  const [recoveryData, setRecoveryData] = useState<Recovery[]>(initialRecoveries);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(12);
  const [isPending, startTransition] = useTransition();

  const handlePeriodChange = (months: number) => {
    setSelectedPeriod(months);
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    refetch(start.toISOString().split("T")[0], end.toISOString().split("T")[0]);
  };

  const refetch = (startDate: string, endDate: string) => {
    startTransition(async () => {
      const result = await getPropertyDetail(building.id, startDate, endDate);
      if (result.success && "invoices" in result) {
        setInvoiceData(result.invoices);
        setRecoveryData(result.recoveries);
      }
    });
  };

  // ── Computed Stats ──
  const totalInvoiced = useMemo(() => invoiceData.reduce((acc, inv) => acc + parseFloat(inv.amount), 0), [invoiceData]);
  const totalRecoveries = useMemo(() => recoveryData.reduce((acc, rec) => acc + parseFloat(rec.amountBilled), 0), [recoveryData]);
  const netDeficit = totalInvoiced - totalRecoveries;
  const recoveryRate = totalInvoiced > 0 ? (totalRecoveries / totalInvoiced) * 100 : 0;

  const invoicesByType = useMemo(() => {
    return invoiceData.reduce((acc, inv) => {
      if (!acc[inv.utilityType]) acc[inv.utilityType] = [];
      acc[inv.utilityType].push(inv);
      return acc;
    }, {} as Record<string, Invoice[]>);
  }, [invoiceData]);

  const documents = useMemo(() => {
    const docs: DocumentItem[] = [];
    invoiceData.forEach((inv) => {
      if (inv.pdfUrl) docs.push({ name: `${inv.utilityType} Bill - ${inv.billingPeriod}`, url: inv.pdfUrl, type: "bill", date: inv.billingPeriod });
    });
    recoveryData.forEach((rec) => {
      if (rec.pdfUrl) docs.push({ name: `Recovery - ${rec.tenantName} (${rec.period})`, url: rec.pdfUrl, type: "recovery", date: rec.period });
    });
    return docs.sort((a, b) => b.date.localeCompare(a.date));
  }, [invoiceData, recoveryData]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: { xs: 4, sm: 6 } }}>
      <Container maxWidth="xl">
        {/* Loading Overlay */}
        <AnimatePresence>
          {isPending && (
            <Box
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              sx={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                bgcolor: alpha("#000", 0.2),
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <CircularProgress size={48} sx={{ mb: 2 }} />
                <Typography variant="caption" fontWeight={800} sx={{ display: "block", textTransform: "uppercase", letterSpacing: "0.1em", color: "white" }}>
                  Analyzing Data...
                </Typography>
              </Box>
            </Box>
          )}
        </AnimatePresence>

        <PropertyHeader
          building={building}
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          periodOptions={PERIOD_OPTIONS}
        />

        {/* ── KPI Grid ── */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KPICard label="Total Invoiced" value={currency(totalInvoiced.toString())} icon={<FileText />} accent="primary.main" bg="primary.main" border="primary.main" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KPICard label="Total Recoveries" value={currency(totalRecoveries.toString())} icon={<Users />} accent="#14b8a6" bg="#14b8a6" border="#14b8a6" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KPICard
              label="Recovery Rate"
              value={`${recoveryRate.toFixed(1)}%`}
              icon={recoveryRate >= 100 ? <TrendingUp /> : <TrendingDown />}
              accent={recoveryRate >= 95 ? "#14b8a6" : recoveryRate >= 80 ? "warning.main" : "error.main"}
              bg={recoveryRate >= 95 ? "#14b8a6" : recoveryRate >= 80 ? "warning.main" : "error.main"}
              border={recoveryRate >= 95 ? "#14b8a6" : recoveryRate >= 80 ? "warning.main" : "error.main"}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KPICard label="Net Deficit" value={currency(netDeficit.toString())} icon={<AlertTriangle />} accent={netDeficit > 0 ? "error.main" : "#14b8a6"} bg={netDeficit > 0 ? "error.main" : "#14b8a6"} border={netDeficit > 0 ? "error.main" : "#14b8a6"} />
          </Grid>
        </Grid>

        <Grid container spacing={6}>
          {/* ── Left Column: Breakdowns ── */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box sx={{ mb: 8 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
                <FileText size={16} color="#14b8a6" />
                <Typography variant="caption" fontWeight={800} sx={{ textTransform: "uppercase", letterSpacing: "0.15em", color: "text.secondary" }}>Expense Breakdown</Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>

              <Stack spacing={2}>
                {Object.entries(invoicesByType).map(([type, invoices]) => (
                  <ExpenseAccordion key={type} type={type} invoices={invoices} />
                ))}
              </Stack>
            </Box>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
                <Users size={16} color="#14b8a6" />
                <Typography variant="caption" fontWeight={800} sx={{ textTransform: "uppercase", letterSpacing: "0.15em", color: "text.secondary" }}>Recovery Details</Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>
              <RecoveryTable recoveries={recoveryData} totalRecoveries={totalRecoveries} />
            </Box>
          </Grid>

          {/* ── Right Column: AI & Meta ── */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ mb: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
                <TrendingUp size={16} color="#14b8a6" />
                <Typography variant="caption" fontWeight={800} sx={{ textTransform: "uppercase", letterSpacing: "0.15em", color: "text.secondary" }}>AI Risk Audit</Typography>
              </Box>
              <AIRiskPanel report={initialAnalysisReport} />
            </Box>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
                <FileText size={16} color="#14b8a6" />
                <Typography variant="caption" fontWeight={800} sx={{ textTransform: "uppercase", letterSpacing: "0.15em", color: "text.secondary" }}>Metered Accounts</Typography>
              </Box>
              <MeterList accounts={building.utilityAccounts} />
            </Box>
          </Grid>
        </Grid>

        <DocumentArchive documents={documents} />

        {/* ── Footer ── */}
        <Box sx={{ mt: 12, pt: 4, borderTop: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", opacity: 0.4 }}>
          <Typography variant="caption" sx={{ fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>Asset Node: {building.id.slice(0, 8)}</Typography>
          <Typography variant="caption" sx={{ fontFamily: "monospace" }}>&copy; 2026 TPMuniAccounts</Typography>
        </Box>
      </Container>
    </Box>
  );
}

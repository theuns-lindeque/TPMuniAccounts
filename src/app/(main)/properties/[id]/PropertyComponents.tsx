"use client";

import React from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  alpha,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Building2,
  ArrowLeft,
  MapPin,
  CircleDollarSign,
  Globe,
  ChevronDown,
  ShieldCheck,
  FileText,
  Zap,
  Sun,
  FolderOpen,
  File,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { KPICard } from "@/components/ui/KPICard";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ── Tailwind Class Merger ──
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Shared Types ────────────────────────────────────────────────────────────────

export interface Building {
  id: string;
  name: string;
  address: string | null;
  region: string;
  municipalValue: string | null;
  utilityAccounts: { id: string; accountNumber: string; type: string }[];
}

export interface Invoice {
  id: string;
  billingPeriod: string;
  amount: string;
  basicCharge: string | null;
  usageCharge: string | null;
  demandCharge: string | null;
  usage: string | null;
  pdfUrl: string | null;
  utilityType: string;
  accountNumber: string;
}

export interface Recovery {
  id: string;
  tenantName: string;
  amountBilled: string;
  basicCharge: string | null;
  usageCharge: string | null;
  demandCharge: string | null;
  solarProduced: string | null;
  period: string;
  pdfUrl: string | null;
}

export interface AnalysisReport {
  id: string;
  period: string;
  totalInvoiceAmount: string;
  totalRecoveryAmount: string;
  deficit: string;
  riskLevel: string;
  anomaliesFound: string[] | null;
}

export interface DocumentItem {
  name: string;
  url: string;
  type: "bill" | "recovery";
  date: string;
}

function currency(val: string | null | undefined): string {
  if (!val) return "—";
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  return `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

export function PropertyHeader({
  building,
  selectedPeriod,
  onPeriodChange,
  periodOptions,
}: {
  building: Building;
  selectedPeriod: number;
  onPeriodChange: (m: number) => void;
  periodOptions: readonly { label: string; months: number }[];
}) {
  return (
    <Box sx={{ mb: 6 }}>
      <Button
        component={Link}
        href="/properties"
        startIcon={<ArrowLeft size={16} />}
        sx={{
          mb: 4,
          color: "text.secondary",
          "&:hover": { color: "primary.main", bgcolor: "transparent" },
          fontSize: "0.75rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          p: 0,
        }}
      >
        Back to Properties
      </Button>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "flex-end" },
          gap: 4,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: "8px",
                bgcolor: alpha("#14b8a6", 0.1),
                color: "#14b8a6",
                display: "flex",
              }}
            >
              <Building2 size={20} />
            </Box>
            <Typography variant="caption" fontWeight={800} sx={{ textTransform: "uppercase", letterSpacing: "0.2em", color: "primary.main" }}>
              Real Estate Asset
            </Typography>
          </Stack>

          <Typography variant="h3" fontWeight={800} sx={{ mb: 2, letterSpacing: "-0.02em" }}>
            {building.name}
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 2, sm: 4 }} sx={{ opacity: 0.7 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <MapPin size={14} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>{building.address || "Address Not Recorded"}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Globe size={14} />
              <Typography variant="caption" sx={{ fontWeight: 800 }}>{building.region}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <CircleDollarSign size={14} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>Value: {currency(building.municipalValue)}</Typography>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ bgcolor: "background.paper", p: 0.5, borderRadius: "12px", border: "1px solid", borderColor: "divider", display: "inline-flex" }}>
          <ToggleButtonGroup
            value={selectedPeriod}
            exclusive
            onChange={(_, v) => v && onPeriodChange(v)}
            sx={{
              "& .MuiToggleButton-root": {
                border: "none",
                borderRadius: "8px !important",
                px: 2,
                py: 1,
                fontSize: "0.7rem",
                fontWeight: 800,
                textTransform: "uppercase",
                color: "text.secondary",
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                },
              },
            }}
          >
            {periodOptions.map((opt) => (
              <ToggleButton key={opt.months} value={opt.months}>{opt.label}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Box>
    </Box>
  );
}

export function ExpenseAccordion({ type, invoices }: { type: string; invoices: Invoice[] }) {
  const theme = useTheme();
  return (
    <Accordion
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "16px !important",
        overflow: "hidden",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ChevronDown size={18} />}>
        <Stack direction="row" spacing={4} alignItems="center" sx={{ width: "100%" }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ flex: 1 }}>{type}</Typography>
          <Typography variant="body2" fontWeight={700} sx={{ color: "primary.main", minWidth: 100, textAlign: "right" }}>
            {currency(invoices.reduce((s, i) => s + parseFloat(i.amount), 0).toString())}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: alpha(theme.palette.divider, 0.05) }}>
              <TableRow>
                <TableCell sx={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase" }}>Period</TableCell>
                <TableCell align="right" sx={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase" }}>Charge</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} hover>
                  <TableCell sx={{ fontSize: "0.75rem", fontFamily: "monospace" }}>{inv.billingPeriod}</TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.75rem", fontWeight: 700 }}>{currency(inv.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
}

export function RecoveryTable({ recoveries, totalRecoveries }: { recoveries: Recovery[]; totalRecoveries: number }) {
  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: "16px" }}>
      <Table>
        <TableHead sx={{ bgcolor: alpha("#f8fafc", 0.05) /* approximation of theme.palette.divider alpha */ }}>
          <TableRow>
            <TableCell sx={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase" }}>Tenant</TableCell>
            <TableCell sx={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase" }}>Period</TableCell>
            <TableCell align="right" sx={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase" }}>Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {recoveries.map((rec) => (
            <TableRow key={rec.id} hover>
              <TableCell sx={{ fontWeight: 700 }}>{rec.tenantName}</TableCell>
              <TableCell sx={{ fontSize: "0.75rem", fontFamily: "monospace", color: "text.secondary" }}>{rec.period}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, color: "#14b8a6" }}>{currency(rec.amountBilled)}</TableCell>
            </TableRow>
          ))}
          <TableRow sx={{ bgcolor: alpha("#14b8a6", 0.02) }}>
            <TableCell colSpan={2} sx={{ fontWeight: 800, textTransform: "uppercase", fontSize: "0.65rem" }}>Total Recovery</TableCell>
            <TableCell align="right" sx={{ fontWeight: 900, fontSize: "0.9rem", color: "#14b8a6" }}>{currency(totalRecoveries.toString())}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function AIRiskPanel({ report }: { report: AnalysisReport | null }) {
  const theme = useTheme();
  const riskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high": return theme.palette.error.main;
      case "medium": return theme.palette.warning.main;
      case "low": return theme.palette.success.main;
      default: return theme.palette.text.secondary;
    }
  };

  if (!report) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: "20px" }}>
        <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase" }}>No Audit Available</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: "20px", border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
      <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 2, bgcolor: alpha(riskColor(report.riskLevel), 0.05) }}>
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: riskColor(report.riskLevel) }} />
        <Typography variant="caption" fontWeight={800} sx={{ textTransform: "uppercase", color: riskColor(report.riskLevel) }}>Risk Level: {report.riskLevel}</Typography>
      </Box>
      <Box sx={{ p: 4 }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="caption" fontWeight={800} sx={{ color: "text.secondary", textTransform: "uppercase", display: "block", mb: 1 }}>Identified Deficit</Typography>
            <Typography variant="h5" fontWeight={800} color="error">{currency(report.deficit)}</Typography>
          </Box>
          {report.anomaliesFound && report.anomaliesFound.length > 0 && (
            <Box>
              <Typography variant="caption" fontWeight={800} sx={{ color: "text.secondary", textTransform: "uppercase", display: "block", mb: 2 }}>Audit Anomalies</Typography>
              <Stack spacing={1.5}>
                {report.anomaliesFound.map((a, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "divider", mt: 0.8 }} />
                    <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.5 }}>{a}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </Box>
    </Paper>
  );
}

export function MeterList({ accounts }: { accounts: Building["utilityAccounts"] }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: "20px", overflow: "hidden" }}>
      <List disablePadding>
        {accounts.map((acc, i) => (
          <ListItem key={acc.id} divider={i < accounts.length - 1} sx={{ py: 2, px: 3 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>{acc.type === "Electricity" ? <Zap size={18} /> : <FileText size={18} />}</ListItemIcon>
            <ListItemText
              primary={<Typography variant="subtitle2" fontWeight={800}>{acc.type}</Typography>}
              secondary={<Typography variant="caption" sx={{ fontFamily: "monospace", opacity: 0.6 }}>{acc.accountNumber}</Typography>}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export function DocumentArchive({ documents }: { documents: DocumentItem[] }) {
  const theme = useTheme();
  return (
    <Box sx={{ mt: 10 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <FolderOpen size={16} color="#14b8a6" />
        <Typography variant="caption" fontWeight={800} sx={{ textTransform: "uppercase", letterSpacing: "0.15em", color: "text.secondary" }}>Document Archive</Typography>
        <Typography variant="caption" sx={{ ml: "auto", fontFamily: "monospace", opacity: 0.5 }}>{documents.length} ITEMS</Typography>
      </Box>
      <Paper variant="outlined" sx={{ borderRadius: "20px", overflow: "hidden" }}>
        <List disablePadding>
          {documents.map((doc, i) => (
            <ListItem
              key={i}
              divider={i < documents.length - 1}
              component="a"
              href={doc.url}
              target="_blank"
              sx={{ py: 2.5, px: 3, "&:hover": { bgcolor: alpha("#14b8a6", 0.02) }, textDecoration: "none", color: "inherit" }}
            >
              <ListItemIcon sx={{ minWidth: 48 }}>
                <Box sx={{ p: 1, borderRadius: "10px", bgcolor: alpha(theme.palette.divider, 0.1), color: "text.secondary" }}>
                  <File size={18} />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={<Typography variant="body2" fontWeight={700}>{doc.name}</Typography>}
                secondary={
                  <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                    <Chip label={doc.type === "bill" ? "Bill" : "Recovery"} size="small" sx={{ height: 18, fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase" }} />
                    <Typography variant="caption" sx={{ fontFamily: "monospace", opacity: 0.5 }}>{doc.date}</Typography>
                  </Stack>
                }
              />
              <ExternalLink size={14} style={{ opacity: 0.3 }} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export function EmptyState({
  icon,
  message,
}: {
  icon?: React.ReactNode;
  message: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 8,
        border: "2px dashed",
        borderColor: "divider",
        borderRadius: "20px",
        bgcolor: (theme) => alpha(theme.palette.divider, 0.02),
        color: "text.secondary",
        textAlign: "center"
      }}
    >
      {icon && <Box sx={{ mb: 2, opacity: 0.4 }}>{icon}</Box>}
      <Typography variant="caption" sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {message}
      </Typography>
    </Box>
  );
}

export const riskColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case "high": return "text.error";
    case "medium": return "text.warning";
    case "low": return "text.success";
    default: return "text.secondary";
  }
};

export const riskGlow = (level: string) => {
  switch (level?.toLowerCase()) {
    case "high": return "error.main";
    case "medium": return "warning.main";
    case "low": return "success.main";
    default: return "text.secondary";
  }
};

"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import {
  Building2,
  ArrowLeft,
  MapPin,
  CircleDollarSign,
  Globe,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Users,
  Zap,
  Sun,
  FolderOpen,
  ExternalLink,
  File,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPropertyDetail } from "@/app/(main)/actions/property-detail";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Building {
  id: string;
  name: string;
  address: string | null;
  region: string;
  municipalValue: string | null;
  utilityAccounts: { id: string; accountNumber: string; type: string }[];
}

interface Invoice {
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

interface Recovery {
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

interface AnalysisReport {
  id: string;
  period: string;
  totalInvoiceAmount: string;
  totalRecoveryAmount: string;
  deficit: string;
  riskLevel: string;
  anomaliesFound: string[] | null;
}

interface DocumentItem {
  name: string;
  url: string;
  type: "bill" | "recovery";
  date: string;
}

const PERIOD_OPTIONS = [
  { label: "6 Months", months: 6 },
  { label: "12 Months", months: 12 },
  { label: "18 Months", months: 18 },
  { label: "24 Months", months: 24 },
] as const;

// ── Helpers ─────────────────────────────────────────────────────────────────────

function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(" ");
}

function currency(val: string | null | undefined): string {
  if (!val) return "—";
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  return `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function riskColor(level: string) {
  switch (level) {
    case "High":
      return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    case "Medium":
      return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    default:
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  }
}

function riskGlow(level: string) {
  switch (level) {
    case "High":
      return "shadow-rose-500/50 bg-rose-500";
    case "Medium":
      return "shadow-amber-500/50 bg-amber-500";
    default:
      return "shadow-emerald-500/50 bg-emerald-500";
  }
}

const CONSUMPTION_TYPES = ["Electricity", "Water", "Sewerage", "Refuse", "Solar"];
const FIXED_TYPES = ["Assessment Rates", "CID Levy"];

// ── Component ──────────────────────────────────────────────────────────────────

export default function PropertyDetailClient({
  building,
  initialInvoices,
  initialRecoveries,
  analysisReport,
  documents,
  defaultStartDate,
  defaultEndDate,
}: {
  building: Building;
  initialInvoices: Invoice[];
  initialRecoveries: Recovery[];
  analysisReport: AnalysisReport | null;
  documents: DocumentItem[];
  defaultStartDate: string;
  defaultEndDate: string;
}) {
  const [invoiceData, setInvoiceData] = useState(initialInvoices);
  const [recoveryData, setRecoveryData] = useState(initialRecoveries);
  const [selectedPeriod, setSelectedPeriod] = useState(12);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  // Initialize expandedTypes with the first utility type if available
  useMemo(() => {
    if (invoiceData.length > 0 && expandedTypes.size === 0) {
      const types = Array.from(new Set(invoiceData.map((inv) => inv.utilityType)));
      if (types.length > 0) {
        setExpandedTypes(new Set([types[0]]));
      }
    }
  }, [invoiceData]);

  const toggleType = (type: string) => {
    const next = new Set(expandedTypes);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    setExpandedTypes(next);
  };
const { consumptionInvoices, fixedInvoices } = useMemo(() => {
    return {
      consumptionInvoices: invoiceData.filter((inv) =>
        CONSUMPTION_TYPES.includes(inv.utilityType),
      ),
      fixedInvoices: invoiceData.filter((inv) =>
        FIXED_TYPES.includes(inv.utilityType),
      ),
    };
  }, [invoiceData]);

  const { consumptionRecoveries, fixedRecoveries } = useMemo(() => {
    // Note: In a real app, you might need a way to link recoveries to types.
    // For now, we'll follow a simplified grouping or assume recoveries relate to consumption.
    // If your recovery schema doesn't have type, we might need to update that too.
    // Assuming for now they roughly map to consumption unless specified.
    return {
      consumptionRecoveries: recoveryData,
      fixedRecoveries: [], // Placeholder until recovery categorization is implemented
    };
  }, [recoveryData]);

  const [isCustom, setIsCustom] = useState(false);
  const [customStart, setCustomStart] = useState(defaultStartDate);
  const [customEnd, setCustomEnd] = useState(defaultEndDate);
  const [isPending, startTransition] = useTransition();

  // ── Period change handler ────────────────────────────────────────────

  const handlePeriodChange = (months: number) => {
    setSelectedPeriod(months);
    setIsCustom(false);
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    refetch(start.toISOString().split("T")[0], end.toISOString().split("T")[0]);
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      refetch(customStart, customEnd);
    }
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

  // ── Computed stats ───────────────────────────────────────────────────

  const totalExpenses = invoiceData.reduce(
    (sum, inv) => sum + parseFloat(inv.amount || "0"),
    0,
  );
  const totalRecoveries = recoveryData.reduce(
    (sum, rec) => sum + parseFloat(rec.amountBilled || "0"),
    0,
  );
  const deficit = totalExpenses - totalRecoveries;

  // Solar calculations
  const totalElecUsageCharge = invoiceData
    .filter((inv) => inv.utilityType === "Electricity")
    .reduce((acc, inv) => acc + parseFloat(inv.usageCharge || "0"), 0);
  const totalElecUsageQty = invoiceData
    .filter((inv) => inv.utilityType === "Electricity")
    .reduce((acc, inv) => acc + parseFloat(inv.usage || "0"), 0);
  const municipalRate =
    totalElecUsageQty > 0 ? totalElecUsageCharge / totalElecUsageQty : 0;

  const totalSolarProducedKwh = recoveryData.reduce(
    (acc, rec) => acc + parseFloat(rec.solarProduced || "0"),
    0,
  );
  const solarRecoveryZAR = totalSolarProducedKwh * municipalRate;

  // Group invoices by utility type for the breakdown
  const invoicesByType: Record<string, Invoice[]> = {};
  for (const inv of invoiceData) {
    if (!invoicesByType[inv.utilityType]) invoicesByType[inv.utilityType] = [];
    invoicesByType[inv.utilityType].push(inv);
  }

  const utilityTypeIcons: Record<string, React.ReactNode> = {
    Electricity: <Zap size={14} className="text-amber-500" />,
    Solar: <Sun size={14} className="text-yellow-500" />,
    Water: <span className="text-blue-500 text-xs font-bold">💧</span>,
    Sewerage: <span className="text-slate-500 text-xs font-bold">🚿</span>,
    "Assessment Rates": <FileText size={14} className="text-purple-500" />,
    "CID Levy": <ShieldCheck size={14} className="text-teal-500" />,
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 p-4 sm:p-8 font-sans">
      {/* ── Loading overlay ──────────────────────────────────────────── */}
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
            <span className="text-[10px] font-mono tracking-widest text-slate-300 uppercase">
              Synchronizing Node Data...
            </span>
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="mb-6 sm:mb-10 flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-500 mb-1">
              <Building2 size={14} />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">
                Property Intelligence
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {building.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {building.address && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin size={12} className="text-teal-500" />
                  {building.address}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                <Globe size={10} className="text-teal-500" />
                {building.region}
              </span>
              {building.municipalValue && (
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  <CircleDollarSign size={12} />
                  {currency(building.municipalValue)}
                </span>
              )}
            </div>
          </div>
          <Link
            href="/properties"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded transition-all shadow-sm"
          >
            <ArrowLeft size={14} />
            Back to Registry
          </Link>
        </div>

        {/* ── Period Selector ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <Calendar size={14} className="text-teal-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mr-2">
            Analysis Period
          </span>
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.months}
              onClick={() => handlePeriodChange(opt.months)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                !isCustom && selectedPeriod === opt.months
                  ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
              )}
            >
              {opt.label}
            </button>
          ))}
          <button
            onClick={() => setIsCustom(true)}
            className={cn(
              "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
              isCustom
                ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
            )}
          >
            Custom
          </button>

          {isCustom && (
            <div className="flex items-center gap-2 ml-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs focus:ring-1 focus:ring-teal-500 outline-none"
              />
              <span className="text-[10px] text-slate-400 font-mono">→</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs focus:ring-1 focus:ring-teal-500 outline-none"
              />
              <button
                onClick={handleCustomApply}
                className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-all"
              >
                Apply
              </button>
            </div>
          )}
        </div>
        {/* ── Financial Health Analysis Grid ─────────────────────────── */}
        <section className="space-y-4">
          {/* Consumption Utilities Group */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-amber-500" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Consumption Analysis
              </h3>
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800 ml-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <KPICard
                variant="compact"
                label="Total Cost"
                value={currency(
                  consumptionInvoices.reduce((acc, inv) => acc + parseFloat(inv.amount), 0).toString()
                )}
                icon={<TrendingUp />}
                accent="text-blue-600 dark:text-blue-400"
                bg="bg-blue-500/10"
                border="border-blue-500/20"
              />
              <KPICard
                variant="compact"
                label="Recovered"
                value={currency(
                  consumptionRecoveries.reduce((acc, r: Recovery) => acc + parseFloat(r.amountBilled), 0).toString()
                )}
                icon={<CircleDollarSign />}
                accent="text-emerald-600 dark:text-emerald-400"
                bg="bg-emerald-500/10"
                border="border-emerald-500/20"
              />
              <KPICard
                variant="compact"
                label="Net Recovery"
                value={currency(
                  (
                    consumptionRecoveries.reduce((acc, r: Recovery) => acc + parseFloat(r.amountBilled), 0) -
                    consumptionInvoices.reduce((acc, inv) => acc + parseFloat(inv.amount), 0)
                  ).toString()
                )}
                icon={<ShieldCheck />}
                accent="text-teal-600 dark:text-teal-400"
                bg="bg-teal-500/10"
                border="border-teal-500/20"
              />
              <KPICard
                variant="compact"
                label="Recovery %"
                value={(() => {
                  const cost = consumptionInvoices.reduce((acc, inv) => acc + parseFloat(inv.amount), 0);
                  const recovery = consumptionRecoveries.reduce((acc, r: Recovery) => acc + parseFloat(r.amountBilled), 0);
                  return cost > 0 ? `${((recovery / cost) * 100).toFixed(1)}%` : "0.0%";
                })()}
                icon={<TrendingUp />}
                accent="text-indigo-600 dark:text-indigo-400"
                bg="bg-indigo-500/10"
                border="border-indigo-500/20"
              />
            </div>
          </div>

          {/* Fixed Charges and Solar Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fixed Group */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-slate-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Fixed Property Charges
                </h3>
                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800 ml-2" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <KPICard
                  variant="compact"
                  label="Rates & Levies"
                  value={currency(
                    fixedInvoices.reduce((acc, inv) => acc + parseFloat(inv.amount), 0).toString()
                  )}
                  icon={<TrendingDown />}
                  accent="text-slate-600 dark:text-slate-400"
                  bg="bg-slate-500/10"
                  border="border-slate-500/20"
                />
                <KPICard
                  variant="compact"
                  label="Recovered Share"
                  value={currency(
                    fixedRecoveries.reduce((acc, r: Recovery) => acc + parseFloat(r.amountBilled), 0).toString()
                  )}
                  icon={<CircleDollarSign />}
                  accent="text-slate-600 dark:text-slate-400"
                  bg="bg-slate-500/10"
                  border="border-slate-500/20"
                />
                <KPICard
                  variant="compact"
                  label="Net Operational"
                  value={currency(
                    (
                      fixedInvoices.reduce((acc, inv) => acc + parseFloat(inv.amount), 0) -
                      fixedRecoveries.reduce((acc, r: Recovery) => acc + parseFloat(r.amountBilled), 0)
                    ).toString()
                  )}
                  icon={<CircleDollarSign />}
                  accent="text-rose-600 dark:text-rose-400"
                  bg="bg-rose-500/10"
                  border="border-rose-500/20"
                />
              </div>
            </div>

            {/* Solar Group (if active) */}
            {totalSolarProducedKwh > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sun size={14} className="text-yellow-500" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                    Solar Energy Tracking
                  </h3>
                  <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800 ml-2" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <KPICard
                    variant="compact"
                    label="Solar Produced"
                    value={`${totalSolarProducedKwh.toLocaleString("en-US", { maximumFractionDigits: 1 })} kWh`}
                    icon={<Zap />}
                    accent="text-yellow-600 dark:text-yellow-400"
                    bg="bg-yellow-500/10"
                    border="border-yellow-500/20"
                  />
                  <KPICard
                    variant="compact"
                    label="Municipal Rate"
                    value={`R ${municipalRate.toFixed(2)}/kWh`}
                    icon={<TrendingUp />}
                    accent="text-slate-600 dark:text-slate-400"
                    bg="bg-slate-500/10"
                    border="border-slate-500/20"
                  />
                  <KPICard
                    variant="compact"
                    label="Solar Recovery"
                    value={currency(solarRecoveryZAR.toString())}
                    icon={<CircleDollarSign />}
                    accent="text-amber-600 dark:text-amber-400"
                    bg="bg-amber-500/10"
                    border="border-amber-500/20"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </header>

      {/* ── KPI Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Total Expenses"
          value={currency(totalExpenses.toString())}
          icon={<TrendingDown size={18} />}
          accent="text-rose-500"
          bg="bg-rose-500/5"
          border="border-rose-500/10"
        />
        <KPICard
          label="Total Recoveries"
          value={currency(totalRecoveries.toString())}
          icon={<TrendingUp size={18} />}
          accent="text-emerald-500"
          bg="bg-emerald-500/5"
          border="border-emerald-500/10"
        />
        <KPICard
          label={deficit >= 0 ? "Net Deficit" : "Net Surplus"}
          value={currency(Math.abs(deficit).toString())}
          icon={deficit >= 0 ? <AlertTriangle size={18} /> : <ShieldCheck size={18} />}
          accent={deficit >= 0 ? "text-amber-500" : "text-emerald-500"}
          bg={deficit >= 0 ? "bg-amber-500/5" : "bg-emerald-500/5"}
          border={deficit >= 0 ? "border-amber-500/10" : "border-emerald-500/10"}
        />
        <KPICard
          label="Risk Level"
          value={analysisReport?.riskLevel || "N/A"}
          icon={<ShieldCheck size={18} />}
          accent={
            analysisReport
              ? riskColor(analysisReport.riskLevel).split(" ")[0]
              : "text-slate-400"
          }
          bg={
            analysisReport
              ? riskColor(analysisReport.riskLevel).split(" ")[1]
              : "bg-slate-100"
          }
          border={
            analysisReport
              ? riskColor(analysisReport.riskLevel).split(" ")[2]
              : "border-slate-200"
          }
        />
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column: Tables ────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Expense Breakdown */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText size={14} className="text-teal-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Expense Breakdown
              </h2>
              <span className="ml-auto text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                {invoiceData.length} records
              </span>
            </div>

            {Object.keys(invoicesByType).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(invoicesByType).map(([type, invs]) => {
                  const isExpanded = expandedTypes.has(type);
                  return (
                    <div
                      key={type}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/50 shadow-sm overflow-hidden"
                    >
                      <button
                        onClick={() => toggleType(type)}
                        className="w-full flex items-center gap-2 px-5 py-3 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {utilityTypeIcons[type] || (
                          <Zap size={14} className="text-slate-400" />
                        )}
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          {type}
                        </span>
                        <span className="ml-auto text-[9px] font-mono text-slate-400">
                          {invs.length} invoice{invs.length !== 1 && "s"}
                        </span>
                        <ChevronDown
                          size={14}
                          className={cn(
                            "text-slate-400 transition-transform duration-200",
                            isExpanded ? "rotate-180" : "",
                          )}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-100 dark:border-slate-800/50">
                                    <th className="px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                      Period
                                    </th>
                                    <th className="px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">
                                      Basic
                                    </th>
                                    <th className="px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">
                                      Usage
                                    </th>
                                    <th className="px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">
                                      kVa Demand
                                    </th>
                                    <th className="px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">
                                      Total
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                                  {invs.map((inv) => (
                                    <tr
                                      key={inv.id}
                                      className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors"
                                    >
                                      <td className="px-5 py-3 text-xs font-mono text-slate-600 dark:text-slate-400">
                                        {inv.billingPeriod}
                                      </td>
                                      <td className="px-5 py-3 text-xs font-mono text-right text-slate-600 dark:text-slate-400">
                                        {currency(inv.basicCharge)}
                                      </td>
                                      <td className="px-5 py-3 text-xs font-mono text-right text-slate-600 dark:text-slate-400">
                                        {currency(inv.usageCharge)}
                                      </td>
                                      <td className="px-5 py-3 text-xs font-mono text-right text-slate-600 dark:text-slate-400">
                                        {currency(inv.demandCharge)}
                                      </td>
                                      <td className="px-5 py-3 text-xs font-mono text-right font-bold text-slate-900 dark:text-slate-100">
                                        {currency(inv.amount)}
                                      </td>
                                    </tr>
                                  ))}
                                  {/* Subtotal row */}
                                  <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800">
                                    <td className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                      Subtotal
                                    </td>
                                    <td className="px-5 py-3 text-xs font-mono text-right font-bold text-slate-700 dark:text-slate-300">
                                      {currency(
                                        invs
                                          .reduce(
                                            (s, i) =>
                                              s +
                                              parseFloat(i.basicCharge || "0"),
                                            0,
                                          )
                                          .toString(),
                                      )}
                                    </td>
                                    <td className="px-5 py-3 text-xs font-mono text-right font-bold text-slate-700 dark:text-slate-300">
                                      {currency(
                                        invs
                                          .reduce(
                                            (s, i) =>
                                              s +
                                              parseFloat(i.usageCharge || "0"),
                                            0,
                                          )
                                          .toString(),
                                      )}
                                    </td>
                                    <td className="px-5 py-3 text-xs font-mono text-right font-bold text-slate-700 dark:text-slate-300">
                                      {currency(
                                        invs
                                          .reduce(
                                            (s, i) =>
                                              s +
                                              parseFloat(i.demandCharge || "0"),
                                            0,
                                          )
                                          .toString(),
                                      )}
                                    </td>
                                    <td className="px-5 py-3 text-xs font-mono text-right font-bold text-teal-600 dark:text-teal-400">
                                      {currency(
                                        invs
                                          .reduce(
                                            (s, i) =>
                                              s + parseFloat(i.amount || "0"),
                                            0,
                                          )
                                          .toString(),
                                      )}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<FileText size={24} />}
                message="No expense records found for this period."
              />
            )}
          </section>

          {/* Recovery Breakdown */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Users size={14} className="text-teal-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Recovery Breakdown
              </h2>
              <span className="ml-auto text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                {recoveryData.length} records
              </span>
            </div>

            {recoveryData.length > 0 ? (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/50 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleType("RecoveryBreakdown")}
                  className="w-full flex items-center gap-2 px-5 py-3 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <Users size={14} className="text-teal-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Recovery Breakdown
                  </span>
                  <span className="ml-auto text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                    {recoveryData.length} records
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "text-slate-400 transition-transform duration-200",
                      expandedTypes.has("RecoveryBreakdown")
                        ? "rotate-180"
                        : "",
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {expandedTypes.has("RecoveryBreakdown") && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                          <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                Tenant
                              </th>
                              <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                Period
                              </th>
                              <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">
                                Basic
                              </th>
                              <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">
                                Usage
                              </th>
                              <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">
                                kVa Demand
                              </th>
                              <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">
                                Solar
                              </th>
                              <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">
                                Billed
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                            {recoveryData.map((rec) => (
                              <tr
                                key={rec.id}
                                className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors"
                              >
                                <td className="px-5 py-3 text-xs font-medium text-slate-900 dark:text-slate-100">
                                  {rec.tenantName}
                                </td>
                                <td className="px-5 py-3 text-xs font-mono text-slate-500">
                                  {rec.period}
                                </td>
                                <td className="px-5 py-3 text-xs font-mono text-right text-slate-600 dark:text-slate-400">
                                  {currency(rec.basicCharge)}
                                </td>
                                <td className="px-5 py-3 text-xs font-mono text-right text-slate-600 dark:text-slate-400">
                                  {currency(rec.usageCharge)}
                                </td>
                                <td className="px-5 py-3 text-xs font-mono text-right text-slate-600 dark:text-slate-400">
                                  {currency(rec.demandCharge)}
                                </td>
                                <td className="px-5 py-3 text-xs font-mono text-right text-yellow-600 dark:text-yellow-400">
                                  {currency(rec.solarProduced)}
                                </td>
                                <td className="px-5 py-3 text-xs font-mono text-right font-bold text-slate-900 dark:text-slate-100">
                                  {currency(rec.amountBilled)}
                                </td>
                              </tr>
                            ))}
                            {/* Grand total */}
                            <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800">
                              <td
                                colSpan={2}
                                className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500"
                              >
                                Grand Total
                              </td>
                              <td className="px-5 py-3 text-xs font-mono text-right font-bold text-slate-700 dark:text-slate-300">
                                {currency(
                                  recoveryData
                                    .reduce(
                                      (s, r) =>
                                        s +
                                        parseFloat(r.basicCharge || "0"),
                                      0,
                                    )
                                    .toString(),
                                )}
                              </td>
                              <td className="px-5 py-3 text-xs font-mono text-right font-bold text-slate-700 dark:text-slate-300">
                                {currency(
                                  recoveryData
                                    .reduce(
                                      (s, r) =>
                                        s +
                                        parseFloat(r.usageCharge || "0"),
                                      0,
                                    )
                                    .toString(),
                                )}
                              </td>
                              <td className="px-5 py-3 text-xs font-mono text-right font-bold text-slate-700 dark:text-slate-300">
                                {currency(
                                  recoveryData
                                    .reduce(
                                      (s, r) =>
                                        s +
                                        parseFloat(r.demandCharge || "0"),
                                      0,
                                    )
                                    .toString(),
                                )}
                              </td>
                              <td className="px-5 py-3 text-xs font-mono text-right font-bold text-yellow-600 dark:text-yellow-400">
                                {currency(
                                  recoveryData
                                    .reduce(
                                      (s, r) =>
                                        s +
                                        parseFloat(r.solarProduced || "0"),
                                      0,
                                    )
                                    .toString(),
                                )}
                              </td>
                              <td className="px-5 py-3 text-xs font-mono text-right font-bold text-teal-600 dark:text-teal-400">
                                {currency(totalRecoveries.toString())}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState
                icon={<Users size={24} />}
                message="No recovery records found for this period."
              />
            )}
          </section>
        </div>

        {/* ── Right Column: AI Analysis ──────────────────────────────── */}
        <div className="space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={14} className="text-teal-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                AI Analysis
              </h2>
            </div>

            {analysisReport ? (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/50 shadow-sm overflow-hidden">
                {/* Risk Header */}
                <div
                  className={cn(
                    "px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3",
                    riskColor(analysisReport.riskLevel),
                  )}
                >
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full shadow-[0_0_10px]",
                      riskGlow(analysisReport.riskLevel),
                    )}
                  />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Risk: {analysisReport.riskLevel}
                  </span>
                  <span className="ml-auto text-[9px] font-mono opacity-60">
                    {analysisReport.period}
                  </span>
                </div>

                {/* Stats */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Invoice Total
                      </div>
                      <div className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
                        {currency(analysisReport.totalInvoiceAmount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Recovery Total
                      </div>
                      <div className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
                        {currency(analysisReport.totalRecoveryAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Deficit
                    </div>
                    <div className="text-lg font-mono font-bold text-rose-500">
                      {currency(analysisReport.deficit)}
                    </div>
                  </div>

                  {/* Anomalies */}
                  {analysisReport.anomaliesFound &&
                    analysisReport.anomaliesFound.length > 0 && (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                          Identified Anomalies
                        </div>
                        <div className="space-y-2">
                          {analysisReport.anomaliesFound.map(
                            (anomaly, index) => (
                              <div
                                key={index}
                                className="flex gap-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed"
                              >
                                <span className="flex-shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-rose-500/60" />
                                {anomaly}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/50 p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-700 mx-auto mb-4">
                  <ShieldCheck size={24} />
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                  No AI Analysis Available
                </p>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                  Upload bills and trigger ingestion to generate a report.
                </p>
              </div>
            )}
          </section>

          {/* Utility Accounts */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={14} className="text-teal-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Utility Accounts
              </h2>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/50 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/50">
              {building.utilityAccounts.length > 0 ? (
                building.utilityAccounts.map((acc) => (
                  <div key={acc.id} className="px-5 py-3 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {acc.type}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {acc.accountNumber}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {utilityTypeIcons[acc.type] || <Zap size={12} className="text-slate-400" />}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-6 text-center text-xs text-slate-400">
                  No utility accounts registered.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ── Documents Card ─────────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen size={14} className="text-teal-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Uploaded Documents
          </h2>
          <span className="ml-auto text-[9px] font-mono text-slate-400 uppercase tracking-widest">
            {documents.length} file{documents.length !== 1 && "s"}
          </span>
        </div>

        {documents.length > 0 ? (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/50 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/50">
            {documents.map((doc, index) => (
              <a
                key={`${doc.url}-${index}`}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 group-hover:text-teal-500 group-hover:border-teal-500/30 transition-colors">
                  <File size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {doc.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest",
                        doc.type === "bill"
                          ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          : "bg-purple-500/10 text-purple-500 border border-purple-500/20",
                      )}
                    >
                      {doc.type === "bill" ? "Municipal Bill" : "Recovery"}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {doc.date}
                    </span>
                  </div>
                </div>
                <ExternalLink
                  size={14}
                  className="flex-shrink-0 text-slate-300 dark:text-slate-700 group-hover:text-teal-500 transition-colors"
                />
              </a>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FolderOpen size={24} />}
            message="No documents uploaded yet."
          />
        )}
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
        <div>
          Node: {building.id.slice(0, 8)} // {building.region}
        </div>
        <div>&copy; 2026 TPMuniAccounts. All rights reserved.</div>
      </footer>
    </div>
  );
}

function KPICard({
  label,
  value,
  icon,
  accent,
  bg,
  border,
  variant = "default",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  bg: string;
  border: string;
  variant?: "default" | "compact";
}) {
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <div
        className={cn(
          "rounded-xl border px-4 py-3 transition-all relative overflow-hidden group flex items-center justify-between",
          "bg-white dark:bg-slate-900 shadow-sm hover:shadow-md",
          border,
        )}
      >
        <div className="min-w-0">
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-0.5 truncate">
            {label}
          </div>
          <div
            className={cn(
              "text-base sm:text-lg font-mono font-bold tracking-tight",
              accent,
            )}
          >
            {value}
          </div>
        </div>
        <div className={cn("p-2 rounded-lg ml-3 opacity-70", bg, accent)}>
          {React.cloneElement(icon as React.ReactElement<any>, { size: 14 })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-4 sm:p-5 transition-all relative overflow-hidden group",
        "bg-white dark:bg-slate-900 shadow-sm hover:shadow-md",
        border,
      )}
    >
      <div
        className={cn(
          "absolute -top-2 -right-2 w-16 h-16 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rounded-full",
          bg,
        )}
      />

      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {label}
        </div>
        <div className={cn("p-1.5 rounded-lg opacity-80", bg, accent)}>
          {React.cloneElement(icon as React.ReactElement<any>, { size: 14 })}
        </div>
      </div>

      <div
        className={cn(
          "text-xl sm:text-2xl font-mono font-bold tracking-tight",
          accent,
        )}
      >
        {value}
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/50 p-12 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-700 mx-auto mb-4">
        {icon}
      </div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

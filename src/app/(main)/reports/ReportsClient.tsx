"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  FileText, 
  Download, 
  Calendar, 
  Building2, 
  Search, 
  ChevronRight,
  CircleDollarSign,
  TrendingDown,
  TrendingUp,
  Loader2,
  Table as TableIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { KPICard } from "@/components/ui/KPICard";
import { getReportData } from "./actions";
import { generateExcelReport, generatePDFReport } from "@/lib/export";

interface Building {
  id: string;
  name: string;
}

export default function ReportsClient({ buildings }: { buildings: Building[] }) {
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState({
    buildingId: "all",
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const [reportData, setReportData] = useState<{
    invoices: any[];
    recoveries: any[];
  }>({ invoices: [], recoveries: [] });

  const [activeTab, setActiveTab] = useState<"invoices" | "recoveries">("invoices");

  const fetchData = () => {
    startTransition(async () => {
      const result = await getReportData(filters);
      if (result.success) {
        setReportData({
          invoices: result.invoices,
          recoveries: result.recoveries,
        });
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalInvoices = reportData.invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
  const totalRecoveries = reportData.recoveries.reduce((sum, rec) => sum + parseFloat(rec.amountBilled), 0);
  const netPosition = totalInvoices - totalRecoveries;

  const handleExport = (type: "pdf" | "excel") => {
    const buildingName = filters.buildingId === "all" 
      ? "All Properties" 
      : buildings.find(b => b.id === filters.buildingId)?.name || "Property";

    const data = {
      ...reportData,
      filters: {
        ...filters,
        buildingName
      }
    };

    if (type === "pdf") generatePDFReport(data);
    else generateExcelReport(data);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <div className="flex items-center gap-2 text-teal-500 mb-2">
            <FileText size={16} />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Reporting Engine</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Advanced Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-light">
            Generate and export comprehensive audit reports for municipal accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport("excel")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <Download size={14} className="text-teal-500" />
            Excel Export
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20"
          >
            <FileText size={14} />
            PDF Report
          </button>
        </div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Property</label>
          <div className="relative">
            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={filters.buildingId}
              onChange={(e) => setFilters(f => ({ ...f, buildingId: e.target.value }))}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Properties</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Start Date</label>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">End Date</label>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={fetchData}
            disabled={isPending}
            className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Filter Reports
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          label="Total Municipal Invoices"
          value={`R ${totalInvoices.toLocaleString()}`}
          icon={<CircleDollarSign />}
          accent="text-rose-500"
          bg="bg-rose-500/10"
          border="border-rose-500/20"
        />
        <KPICard
          label="Total Tenant Recoveries"
          value={`R ${totalRecoveries.toLocaleString()}`}
          icon={<TrendingUp />}
          accent="text-emerald-500"
          bg="bg-emerald-500/10"
          border="border-emerald-500/20"
        />
        <KPICard
          label="Net Audit Position"
          value={`R ${netPosition.toLocaleString()}`}
          icon={<TrendingDown />}
          accent={netPosition > 0 ? "text-amber-500" : "text-teal-500"}
          bg={netPosition > 0 ? "bg-amber-500/10" : "bg-teal-500/10"}
          border={netPosition > 0 ? "border-amber-500/20" : "border-teal-500/20"}
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("invoices")}
            className={cn(
              "px-8 py-5 text-xs font-bold uppercase tracking-widest transition-all relative",
              activeTab === "invoices" ? "text-teal-500" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            )}
          >
            Municipal Invoices
            {activeTab === "invoices" && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("recoveries")}
            className={cn(
              "px-8 py-5 text-xs font-bold uppercase tracking-widest transition-all relative",
              activeTab === "recoveries" ? "text-teal-500" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            )}
          >
            Tenant Recoveries
            {activeTab === "recoveries" && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
            )}
          </button>
        </div>

        <div className="p-0 sm:p-4 overflow-x-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      {activeTab === "invoices" ? "Utility Type" : "Tenant Name"}
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      Property
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800 text-right">
                      Period
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800 text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeTab === "invoices" ? (
                    reportData.invoices.length > 0 ? (
                      reportData.invoices.map((inv) => (
                        <tr key={inv.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                            {inv.type}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {inv.buildingName}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400 font-mono text-right">
                            {inv.billingPeriod}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono font-bold text-teal-600 dark:text-teal-400 text-right">
                            R {parseFloat(inv.amount).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                          No invoice data found for the selected filters
                        </td>
                      </tr>
                    )
                  ) : (
                    reportData.recoveries.length > 0 ? (
                      reportData.recoveries.map((rec) => (
                        <tr key={rec.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                            {rec.tenantName}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {rec.buildingName}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400 font-mono text-right">
                            {rec.period}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono font-bold text-teal-600 dark:text-teal-400 text-right">
                            R {parseFloat(rec.amountBilled).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                          No recovery data found for the selected filters
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

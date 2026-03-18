import React from "react";
import { FinancialTable } from "@/components/dashboard/FinancialTable";
import { TrendsChart } from "@/components/dashboard/TrendsChart";
import { RisksPanel } from "@/components/dashboard/RisksPanel";
import {
  LayoutDashboard,
  TrendingUp,
  AlertCircle,
  FileText,
  Inbox,
} from "lucide-react";
import { getDashboardData } from "@/app/(main)/actions/dashboard";

export default async function DashboardPage() {
  const result = await getDashboardData();
  
  if (!result.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd] dark:bg-[#0d1117]">
        <div className="text-center p-8 border border-red-200 dark:border-red-900/50 rounded-xl bg-red-50 dark:bg-red-900/10">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
          <h2 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-widest">
            ERROR_FETCHING_DATA
          </h2>
          <p className="text-xs text-red-600/70 dark:text-red-400/50 mt-1 uppercase font-mono">
            {result.error}
          </p>
        </div>
      </div>
    );
  }

  const hasData = result.reports.length > 0 || result.chartData.some(d => d.invoices > 0 || d.recoveries > 0);

  if (!hasData) {
    return (
      <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#0d1117] p-6 font-sans">
        <header className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-teal-500 mb-1">
            <LayoutDashboard size={14} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">System Overview</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        </header>

        <main className="flex flex-col items-center justify-center h-[50vh] text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/30 dark:bg-slate-900/30">
          <Inbox className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
          <h2 className="text-lg font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">NO_DATA_AVAILABLE</h2>
          <p className="text-xs text-slate-500 mt-2 max-w-xs uppercase leading-relaxed font-mono">
             Upload municipal bills and recovery reports to see analytics here.
          </p>
        </main>
      </div>
    );
  }

  const reportsFormatted = result.reports.map(r => ({
      ...r,
      totalInvoiceAmount: r.totalInvoiceAmount.toString(),
      totalRecoveryAmount: r.totalRecoveryAmount.toString(),
      deficit: r.deficit.toString(),
  }));

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 p-4 sm:p-6 font-sans">
      <header className="mb-6 sm:mb-8 border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-500 mb-1">
            <LayoutDashboard size={14} className="sm:size-4" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">
              System Overview
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[10px] sm:text-xs text-slate-500 font-mono uppercase tracking-tighter">
            NODE_CLUSTER: AGGREGATE_ALL
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 font-mono uppercase tracking-tighter">
            TIMESTAMP: {new Date().toISOString().substring(0, 16).replace("T", " ")}
          </p>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Trends and Table */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-4 px-1">
              <TrendingUp size={14} className="text-teal-500" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 ">
                Financial Performance Trends
              </h2>
            </div>
            <TrendsChart data={result.chartData} />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 px-1">
              <FileText size={14} className="text-teal-500" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Building Audit History
              </h2>
            </div>
            <FinancialTable reports={reportsFormatted} />
          </section>
        </div>

        {/* Right Column: Risks Panel */}
        <div className="space-y-6">
          <section className="h-full">
            <div className="flex items-center gap-2 mb-4 px-1">
              <AlertCircle size={14} className="text-teal-500" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                AI Intelligence & Risks
              </h2>
            </div>
            <div className="lg:sticky lg:top-6">
              {result.latestReport ? (
                  <div className="h-[calc(100vh-250px)]">
                    <RisksPanel report={result.latestReport} />
                  </div>
              ) : (
                <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 flex flex-col items-center justify-center text-center opacity-60">
                    <AlertCircle size={24} className="text-slate-300 mb-2" />
                    <p className="text-[10px] font-mono uppercase text-slate-400">NO_ANOMALIES_DETECTED</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase tracking-widest">
        <div>Proprietary Utility AI Engine v1.5-Pro</div>
        <div>&copy; 2026 TPMuniAccounts. All rights reserved.</div>
      </footer>
    </div>
  );
}


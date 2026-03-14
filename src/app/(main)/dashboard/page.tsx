import React from 'react';
import { FinancialTable } from '@/components/dashboard/FinancialTable';
import { TrendsChart } from '@/components/dashboard/TrendsChart';
import { RisksPanel } from '@/components/dashboard/RisksPanel';
import { LayoutDashboard, TrendingUp, AlertCircle, FileText } from 'lucide-react';

// Mock Data for the demonstration
const mockReports = [
  { id: '1', period: '2026-03', totalInvoiceAmount: '125000', totalRecoveryAmount: '118000', deficit: '7000', riskLevel: 'High', anomaliesFound: ['Water usage spiked 42% compared to 4% recovery increase', 'Electricity recovery gap widened in Block B'] },
  { id: '2', period: '2026-02', totalInvoiceAmount: '110000', totalRecoveryAmount: '108000', deficit: '2000', riskLevel: 'Low', anomaliesFound: ['Refuse charges aligned with recoveries'] },
  { id: '3', period: '2026-01', totalInvoiceAmount: '115000', totalRecoveryAmount: '105000', deficit: '10000', riskLevel: 'Medium', anomaliesFound: ['HVAC maintenance costs not fully recovered from tenants'] },
];

const mockChartData = [
  { month: 'Apr 25', invoices: 95000, recoveries: 92000 },
  { month: 'May 25', invoices: 98000, recoveries: 94000 },
  { month: 'Jun 25', invoices: 105000, recoveries: 98000 },
  { month: 'Jul 25', invoices: 112000, recoveries: 100000 },
  { month: 'Aug 25', invoices: 108000, recoveries: 102000 },
  { month: 'Sep 25', invoices: 115000, recoveries: 108000 },
  { month: 'Oct 25', invoices: 120000, recoveries: 112000 },
  { month: 'Nov 25', invoices: 118000, recoveries: 115000 },
  { month: 'Dec 25', invoices: 130000, recoveries: 120000 },
  { month: 'Jan 26', invoices: 115000, recoveries: 105000 },
  { month: 'Feb 26', invoices: 110000, recoveries: 108000 },
  { month: 'Mar 26', invoices: 125000, recoveries: 118000 },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 p-4 sm:p-6 font-sans">
      <header className="mb-6 sm:mb-8 border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-500 mb-1">
            <LayoutDashboard size={14} className="sm:size-4" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">System Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[10px] sm:text-xs text-slate-500 font-mono uppercase tracking-tighter">BUILDING_ID: ALL_ACTIVE</p>
          <p className="text-[10px] sm:text-xs text-slate-500 font-mono uppercase tracking-tighter">LAST_SYNC: 2026-03-13T22:20</p>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Trends and Table */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-teal-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Financial Performance</h2>
            </div>
            <TrendsChart data={mockChartData} />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText size={14} className="text-teal-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Audit Reports</h2>
            </div>
            <FinancialTable reports={mockReports} />
          </section>
        </div>

        {/* Right Column: Risks Panel */}
        <div className="space-y-6">
          <section className="h-full">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={14} className="text-teal-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">AI Intelligence</h2>
            </div>
            <div className="h-[calc(100vh-250px)]">
              <RisksPanel report={mockReports[0]} />
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

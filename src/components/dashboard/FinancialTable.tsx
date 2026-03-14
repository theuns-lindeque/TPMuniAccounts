import React from 'react';

interface FinancialTableProps {
  reports: any[];
}

export const FinancialTable = ({ reports }: FinancialTableProps) => {
  return (
    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-md">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">Period</th>
            <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300 text-right">Invoices</th>
            <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300 text-right">Recoveries</th>
            <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300 text-right">Deficit</th>
            <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">Risk</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {reports.map((report, idx) => (
            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
              <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">{report.period}</td>
              <td className="px-4 py-2 text-right font-mono text-slate-900 dark:text-slate-100">
                R {parseFloat(report.totalInvoiceAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-2 text-right font-mono text-slate-900 dark:text-slate-100">
                R {parseFloat(report.totalRecoveryAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-2 text-right font-mono text-red-600 dark:text-red-400">
                R {parseFloat(report.deficit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                  report.riskLevel === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                  report.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {report.riskLevel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

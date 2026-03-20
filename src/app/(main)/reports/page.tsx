import dynamic from "next/dynamic";
import { getReportBuildings } from "./actions";
import { AlertCircle, Loader2 } from "lucide-react";

// Dynamically import ReportsClient with SSR disabled to avoid browser-only library issues (jspdf, exceljs)
const ReportsClient = dynamic(() => import("./ReportsClient"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Loading Report Engine...</p>
      </div>
    </div>
  )
});

export default async function ReportsPage() {
  const result = await getReportBuildings();

  if (!result.success) {
    return (
      <div className="p-8">
        <div className="p-8 border border-red-200 dark:border-red-900/50 rounded-2xl bg-red-50 dark:bg-red-900/10 flex items-center gap-4">
          <AlertCircle className="text-red-500" />
          <div>
            <h2 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-widest">
              REPORT_INIT_ERROR
            </h2>
            <p className="text-xs text-red-600/70 dark:text-red-400/50 mt-1 uppercase font-mono">
              {result.error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <ReportsClient buildings={result.buildings || []} />
    </div>
  );
}

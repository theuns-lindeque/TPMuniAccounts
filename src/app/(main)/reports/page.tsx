import { getReportBuildings } from "./actions";
import ReportsClient from "./ReportsClient";
import { AlertCircle } from "lucide-react";

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

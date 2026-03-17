"use client";

import { useState, Suspense, useEffect } from "react";
import {
  Building2,
  Upload,
  ArrowLeft,
  CheckCircle2,
  Terminal,
  Copy,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ingestAction } from "@/app/(main)/actions/ingest";
import { FileUpload } from "@/components/ui/file-upload";
import { getMe } from "@/app/(main)/actions/users";
import { getAllBuildingsAction } from "@/app/(main)/actions/buildings";

function UploadContent() {
  const searchParams = useSearchParams();
  const documentType = searchParams.get("type") || "bill";
  const initialBuildingId = searchParams.get("buildingId") || "";

  const [buildingId, setBuildingId] = useState(initialBuildingId);
  const [buildings, setBuildings] = useState<{ id: string; name: string }[]>(
    [],
  );

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [extractedData, setExtractedData] = useState<any[]>([]);
  const [showConsole, setShowConsole] = useState(false);

  const [user, setUser] = useState<{ role: string } | null>(null);

  useEffect(() => {
    getMe().then((u) => setUser(u as { role: string } | null));
    getAllBuildingsAction().then((res) => {
      if (res.success && res.buildings) {
        setBuildings(res.buildings);
        if (!initialBuildingId && res.buildings.length > 0) {
          setBuildingId(res.buildings[0].id);
        }
      }
    });
  }, [initialBuildingId]);

  const isReadOnly = user?.role === "contributor";

  const handleFileUpload = async (uploadedFiles: File[]) => {
    if (isReadOnly) return;
    setFiles(uploadedFiles);
    setIsSuccess(false);
  };

  const startIngestion = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setStatus(
      "Uploading and parsing " +
        (documentType === "recovery" ? "recovery reports" : "municipal bills") +
        "...",
    );

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("documentType", documentType);
    formData.append("buildingId", buildingId);

    try {
      const result = await ingestAction(formData);
      if (result.success) {
        setStatus("Ingestion complete! Data persisted to registry.");
        setIsSuccess(true);
        if (result.extractedData) {
          setExtractedData(result.extractedData);
          setShowConsole(true);
        }
      } else {
        setStatus("Error: " + result.error);
        setIsSuccess(false);
      }
    } catch (e) {
      console.error(e);
      setStatus("An unexpected system error occurred.");
      setIsSuccess(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 p-4 sm:p-8 font-sans">
      <header className="mb-6 sm:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-500 mb-1">
            <Building2 size={14} className="sm:size-4" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">
              Ingestion Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {documentType === "recovery" ? "Upload Recovery" : "Upload Bills"}
          </h1>
          {isReadOnly && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[9px] font-bold uppercase tracking-wider mt-1">
              Read Only Mode
            </div>
          )}
        </div>
        <div className="w-full sm:w-auto">
          <Link
            href="/properties"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded transition-all shadow-sm"
          >
            <ArrowLeft size={14} />
            Back to Registry
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/50 shadow-xl overflow-hidden p-6 sm:p-12">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-[1px] h-16 bg-teal-500/20 translate-x-[-1px]"></div>
            <div className="absolute top-0 right-0 w-16 h-[1px] bg-teal-500/20 translate-y-[-1px]"></div>
          </div>

          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-lg sm:text-xl font-bold mb-2">
              {documentType === "recovery"
                ? "Submit Recovery Data"
                : "Submit Municipal Bills"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {documentType === "recovery"
                ? "Select CSV or PDF recovery files to process for billing reconciliation."
                : "Upload scanned municipal bill PDFs for AI-driven extraction and analysis."}
            </p>

            <div className="max-w-xs mx-auto text-left">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Target Property Record
              </label>
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                disabled={isReadOnly || buildings.length === 0}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none appearance-none disabled:opacity-50"
              >
                {buildings.length === 0 ? (
                  <option value="">No properties registered</option>
                ) : (
                  buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div
            className={`border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 transition-colors ${!isReadOnly ? "hover:border-teal-500/30" : "opacity-50 cursor-not-allowed"}`}
          >
            {!isReadOnly ? (
              <FileUpload onChange={handleFileUpload} />
            ) : (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <Upload size={32} />
                </div>
                <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Upload Access Restricted
                </p>
                <p className="text-[10px] text-slate-500 max-w-[240px] leading-relaxed">
                  Your node profile (CONTRIBUTOR) does not have authorization to
                  ingest new data into the registry.
                </p>
              </div>
            )}
          </div>

          <div className="mt-12 flex flex-col items-center">
            {files.length > 0 && !isSuccess && (
              <button
                onClick={startIngestion}
                disabled={uploading || !buildingId}
                className={cn(
                  "px-10 py-4 rounded-lg bg-teal-500 text-white font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-teal-500/20 flex items-center gap-3",
                  (uploading || !buildingId)
                    ? "opacity-50 cursor-not-allowed scale-[0.98]"
                    : "hover:bg-teal-600",
                )}
              >
                {uploading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing Pipeline...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Deploy Ingestion
                  </>
                )}
              </button>
            )}

            {isSuccess && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 size={24} />
                </div>
                <Link
                  href="/properties"
                  className="px-8 py-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold uppercase tracking-widest transition-all"
                >
                  View in Registry
                </Link>
              </div>
            )}

            {status && (
              <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full shadow-[0_0_8px]",
                    uploading
                      ? "bg-amber-500 shadow-amber-500/50 animate-pulse"
                      : isSuccess
                        ? "bg-emerald-500 shadow-emerald-500/50"
                        : "bg-red-500 shadow-red-500/50",
                  )}
                ></div>
                <p className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                  System: {status}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-[10px] font-mono text-slate-400 uppercase tracking-widest text-center">
          Secure Payload Layer: GCS-HNS // AES-256
        </div>

        <AnimatePresence>
          {extractedData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-12 mb-12"
            >
              <div className="bg-[#0d1117] rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-900/50 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-teal-500/10 text-teal-500">
                      <Terminal size={14} />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-200">
                        Extraction Debug Console
                      </h3>
                      <p className="text-[8px] font-mono text-slate-500 uppercase">
                        Real-time Ingestion Logs // Extracted JSON
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const json = JSON.stringify(extractedData, null, 2);
                        navigator.clipboard.writeText(json);
                      }}
                      className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Copy JSON"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => setExtractedData([])}
                      className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                      title="Clear Console"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => setShowConsole(!showConsole)}
                      className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showConsole ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                  </div>
                </div>

                <motion.div
                  initial={false}
                  animate={{ height: showConsole ? "auto" : 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-black/40 backdrop-blur-sm">
                    <pre className="text-[11px] font-mono text-teal-400/90 overflow-x-auto selection:bg-teal-500/20 max-h-[400px]">
                      {JSON.stringify(extractedData, null, 2)}
                    </pre>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 pt-8 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em] flex flex-col gap-2">
        <div className="flex justify-between">
          <p>
            Ingestion Path: {documentType?.toUpperCase()} /{" "}
            {buildingId?.toUpperCase()}
          </p>
          <p>Node Status: ACTIVE</p>
        </div>
      </footer>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd] dark:bg-[#0d1117]">
          <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
        </div>
      }
    >
      <UploadContent />
    </Suspense>
  );
}

function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(" ");
}

import { getAppSettings } from "@/app/(main)/actions/settings";
import Link from "next/link";
import { Lock, ArrowRight, ShieldCheck, BarChart3, Zap } from "lucide-react";

export default async function Home() {
  const settings = await getAppSettings();
  const activeModel = settings?.analysisModel
    ? settings.analysisModel.replace("gemini-", "").toUpperCase()
    : "3.1-PRO";

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 font-sans selection:bg-teal-100 selection:text-teal-900 overflow-hidden relative">
      {/* Blueprint Pattern Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(#111827 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      ></div>
      <div className="absolute inset-0 pointer-events-none border-[1px] border-slate-200/50 dark:border-slate-800/50 m-8"></div>

      {/* Decorative Blueprint Lines */}
      <div className="absolute top-0 left-1/4 w-[1px] h-full bg-slate-200/50 dark:bg-slate-800/50 hidden lg:block"></div>
      <div className="absolute top-1/3 left-0 w-full h-[1px] bg-slate-200/50 dark:bg-slate-800/50 hidden lg:block"></div>

      <nav className="relative z-10 flex justify-between items-center px-6 lg:px-12 py-6 lg:py-8 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 border-2 border-teal-500 rounded-sm flex items-center justify-center font-mono font-bold text-teal-500 tracking-tighter">
            TP
          </div>
          <span className="text-[10px] lg:text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
            MuniAccounts
          </span>
        </div>
        <div className="hidden sm:flex gap-4 lg:gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span className="hover:text-teal-500 cursor-pointer transition-colors">
            Architecture
          </span>
          <span className="hover:text-teal-500 cursor-pointer transition-colors">
            Integrations
          </span>
        </div>
      </nav>

      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-80px)]">
        {/* Left Column: Hero Content */}
        <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 lg:py-20 lg:border-r border-slate-200/50 dark:border-slate-800/50">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/5 mb-6 lg:mb-8">
              <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
              <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                AI Engine {activeModel} Now Active
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 lg:mb-8 leading-[1] lg:leading-[0.9]">
              Utility <span className="text-teal-500">Auditing</span>
              <br />
              at Scale.
            </h1>

            <p className="text-base lg:text-lg text-slate-500 dark:text-slate-400 mb-8 lg:mb-10 leading-relaxed font-light">
              High-precision municipal analysis for commercial portfolios.
              Automatically identify recovery deficits and audit leaks with
              Self-Learning AI infrastructure.
            </p>

            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              <div className="space-y-2">
                <BarChart3 className="text-teal-500 w-5 h-5 mx-auto lg:mx-0" />
                <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Analytics
                </p>
              </div>
              <div className="space-y-2">
                <ShieldCheck className="text-teal-500 w-5 h-5 mx-auto lg:mx-0" />
                <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  AI Audit
                </p>
              </div>
              <div className="space-y-2">
                <Zap className="text-teal-500 w-5 h-5 mx-auto lg:mx-0" />
                <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Recovery
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div className="flex items-center justify-center p-6 sm:p-12 lg:p-8 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="max-w-md w-full p-8 lg:p-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xl relative overflow-hidden group">
            {/* Corner Decorative Lines */}
            <div className="absolute top-0 right-0 w-16 h-[1px] bg-teal-500/30"></div>
            <div className="absolute top-0 right-0 w-[1px] h-16 bg-teal-500/30"></div>

            <div className="mb-8 lg:mb-10 text-center">
              <div className="inline-flex p-3 rounded-md border border-slate-100 dark:border-slate-800 mb-4 bg-slate-50 dark:bg-slate-900">
                <Lock className="w-5 h-5 text-teal-500" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Portal Access
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-2 uppercase tracking-widest">
                Enter Credentials
              </p>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Username or Email
                </label>
                <input
                  type="text"
                  className="w-full h-12 px-4 bg-transparent border border-slate-200 dark:border-slate-800 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  placeholder="admin@tp-muni.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full h-12 px-4 bg-transparent border border-slate-200 dark:border-slate-800 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 font-mono"
                  placeholder="••••••••••••"
                />
              </div>

              <Link
                href="/dashboard"
                className="flex items-center justify-center w-full h-14 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold uppercase tracking-[0.2em] rounded transition-all shadow-lg shadow-teal-500/20 group"
              >
                Establish Link
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span className="hover:text-teal-500 cursor-pointer uppercase transition-colors">
                  Forgot Password
                </span>
                <span className="hover:text-teal-500 cursor-pointer uppercase transition-colors">
                  Request ID
                </span>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-6 lg:bottom-12 left-6 lg:left-12 right-6 lg:left-12 flex justify-between items-center text-[9px] font-mono text-slate-400 uppercase tracking-[0.3em] pointer-events-none">
        <div className="flex gap-4">
          <span>LAT: -26.2041</span>
          <span>LNG: 28.0473</span>
        </div>
        <div className="flex gap-4 pointer-events-auto">
          <span className="hover:text-teal-500 cursor-pointer transition-colors">
            Audit Node: 0x2A4F
          </span>
          <span className="hover:text-teal-500 cursor-pointer transition-colors">
            System v1.8
          </span>
        </div>
      </footer>
    </div>
  );
}

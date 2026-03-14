"use client";

import React, { useState, useEffect } from "react";
import { 
  Bot, 
  Sparkles, 
  Settings, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Cpu,
  Zap,
  Layout,
  MessageCircle,
  Database
} from "lucide-react";
import { getAppSettings, updateAppSettings } from "@/app/(main)/actions/settings";
import { motion, AnimatePresence } from "framer-motion";

const MODELS = [
  { id: "gemini-3-flash", name: "Gemini 3 Flash", description: "Fastest, optimized for interactive conversation.", badge: "Speed" },
  { id: "gemini-3.1-pro", name: "Gemini 3.1 Pro", description: "Advanced reasoning, best for complex auditing.", badge: "Pro" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "Legacy balanced model (Legacy).", badge: "Legacy" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Legacy reasoning model (Legacy).", badge: "Legacy" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    getAppSettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatus(null);
    const result = await updateAppSettings({
      chatModel: settings?.chatModel || "gemini-3-flash",
      analysisModel: settings?.analysisModel || "gemini-3.1-pro",
    });
    
    if (result.success) {
      setStatus({ type: 'success', message: 'System protocols updated successfully.' });
    } else {
      setStatus({ type: 'error', message: result.error || 'Failed to update protocols.' });
    }
    setIsSaving(false);
  };

  if (!settings) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Loading System Config...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-500">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">System Configuration</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 uppercase tracking-widest font-mono text-[10px]">Node Control & AI Protocol Management</p>
          </div>
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-teal-500/50 via-slate-200 dark:via-slate-800 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Cpu size={80} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Zap size={16} className="text-teal-500" />
              Core Infrastructure
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Adjust the artificial intelligence models powering your municipal auditing nodes. 
              Higher reasoning models increase accuracy but may affect processing latency.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono border-t border-slate-100 dark:border-slate-900 pt-3">
                <span className="text-slate-400">LATENCY_OPTIMIZED</span>
                <span className="text-emerald-500 font-bold uppercase">Active</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono border-t border-slate-100 dark:border-slate-900 pt-3">
                <span className="text-slate-400">ENCRYPTION_LAYER</span>
                <span className="text-teal-500 font-bold uppercase">AES-256</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Chat Model Selection */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={18} className="text-teal-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Interactive Chat Protocol</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4 font-mono uppercase tracking-tighter">powers the utility ai consultant sidebar</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSettings({ ...settings, chatModel: model.id })}
                  className={`
                    p-4 rounded-xl text-left transition-all border group
                    ${settings?.chatModel === model.id 
                      ? 'bg-teal-500/5 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.1)]' 
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-teal-500/30'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold">{model.name}</span>
                    <span className={`
                      text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest
                      ${settings?.chatModel === model.id ? 'bg-teal-500 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'}
                    `}>
                      {model.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{model.description}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Analysis Model Selection */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Database size={18} className="text-teal-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Audit Analysis Engine</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4 font-mono uppercase tracking-tighter">powers background report generation & deep auditing</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSettings({ ...settings, analysisModel: model.id })}
                  className={`
                    p-4 rounded-xl text-left transition-all border group
                    ${settings?.analysisModel === model.id 
                      ? 'bg-teal-500/5 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.1)]' 
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-teal-500/30'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold">{model.name}</span>
                    <span className={`
                      text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest
                      ${settings?.analysisModel === model.id ? 'bg-teal-500 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'}
                    `}>
                      {model.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{model.description}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Action Bar */}
          <div className="pt-6 mt-12 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between gap-4">
            <div className="flex-1">
              <AnimatePresence>
                {status && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${status.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}
                  >
                    {status.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {status.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-lg shadow-teal-500/20 active:scale-95"
            >
              {isSaving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save size={16} />}
              Synchronize Nodes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

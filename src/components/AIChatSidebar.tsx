"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  ChevronRight, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import { chatAction } from "@/app/actions/chat";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestions = [
  "Analyze electricity recovery for Block A",
  "How are solar charges calculated?",
  "Identify highest municipal deficit",
  "Summarize last month's utility audit"
];

export const AIChatSidebar = ({ isOpen, onClose }: AIChatSidebarProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Diagnostics Online. I am the TPMuni Analysis Engine. How can I assist with your municipal auditing today?",
      timestamp: new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string = input) => {
    const messageText = text.trim();
    if (!messageText || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Pass history for context
      const response = await chatAction(messageText, messages);
      
      const assistantMsg: Message = {
        role: 'assistant',
        content: response || "Analysis complete. No anomalies detected in current query.",
        timestamp: new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Error: AI System link interrupted. Please check network protocols.", 
        timestamp: new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full sm:w-[400px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-2xl shadow-teal-500/5"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">Utility AI Consultant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tighter">System Ready</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-teal-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth custom-scrollbar"
            >
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] space-y-1.5`}>
                    <div className={`
                      p-3 rounded-xl text-sm leading-relaxed relative
                      ${msg.role === 'user' 
                        ? 'bg-teal-500 text-white rounded-tr-none' 
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-tl-none'}
                    `}>
                      {msg.content}
                      {/* Message Tail Overlay for Assistant */}
                      {msg.role === 'assistant' && (
                        <div className="absolute top-0 -left-1 w-2 h-2 bg-slate-100 dark:bg-slate-900 border-l border-t border-slate-200 dark:border-slate-800 rotate-45 transform -translate-x-1/2"></div>
                      )}
                    </div>
                    <p className={`text-[9px] font-mono text-slate-400 uppercase ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.role === 'assistant' ? 'AUDIT_OUTPUT' : 'CLIENT_INPUT'} // {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl rounded-tl-none flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-teal-500 animate-spin" />
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Processing Data...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Input Area */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              {messages.length < 3 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s)}
                      className="px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-teal-500/30 hover:bg-teal-500/5 text-[10px] text-slate-500 dark:text-slate-400 transition-all font-medium"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative"
              >
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Consult AI Engine..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-4 pr-12 py-3 text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all placeholder:text-slate-400"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-teal-500 hover:text-teal-600 disabled:opacity-30 disabled:text-slate-400 transition-all"
                >
                  <Send size={18} />
                </button>
              </form>
              <div className="mt-3 flex justify-between items-center text-[9px] font-mono text-slate-400 opacity-50 uppercase tracking-widest">
                <span>Encryption: AES-256-GCM</span>
                <span>Node: GEN-IV-93</span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

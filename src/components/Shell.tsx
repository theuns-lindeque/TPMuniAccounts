"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Menu, X } from "lucide-react";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isPublicPage = pathname === "/" || pathname === "/login";

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex h-screen overflow-hidden flex-col md:flex-row">
        {/* Mobile Header - Only for authenticated pages */}
        {!isPublicPage && (
          <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 z-30">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-teal-500 rounded-sm flex items-center justify-center font-mono font-bold text-teal-500 text-[10px] tracking-tighter shrink-0">
                TP
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">MuniAccounts</span>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-500 hover:text-teal-500 transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        )}

        {!isPublicPage && (
          <div 
            className={`
              fixed inset-0 z-40 md:relative md:z-20 transform transition-transform duration-300 ease-in-out
              ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
          >
            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
              <div 
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm md:hidden" 
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}
            <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        <main className={`flex-1 overflow-y-auto ${!isPublicPage ? 'bg-[#fcfcfd] dark:bg-[#0d1117]' : ''}`}>
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}

"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  bg: string;
  border: string;
  variant?: "default" | "compact";
}

export function KPICard({
  label,
  value,
  icon,
  accent,
  bg,
  border,
  variant = "default",
}: KPICardProps) {
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <div
        className={cn(
          "rounded-xl border px-4 py-3 transition-all relative overflow-hidden group flex items-center justify-between",
          "bg-white dark:bg-slate-900 shadow-sm hover:shadow-md",
          border,
        )}
      >
        <div className="min-w-0">
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-0.5 truncate">
            {label}
          </div>
          <div
            className={cn(
              "text-base sm:text-lg font-mono font-bold tracking-tight",
              accent,
            )}
          >
            {value}
          </div>
        </div>
        <div className={cn("p-2 rounded-lg ml-3 opacity-70", bg, accent)}>
          {React.cloneElement(icon as React.ReactElement<any>, { size: 14 })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-4 sm:p-5 transition-all relative overflow-hidden group",
        "bg-white dark:bg-slate-900 shadow-sm hover:shadow-md",
        border,
      )}
    >
      <div
        className={cn(
          "absolute -top-2 -right-2 w-16 h-16 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rounded-full",
          bg,
        )}
      />

      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {label}
        </div>
        <div className={cn("p-2 rounded-lg", bg, accent)}>
          {React.cloneElement(icon as React.ReactElement<any>, { size: 16 })}
        </div>
      </div>

      <div
        className={cn(
          "text-xl sm:text-2xl font-mono font-bold tracking-tight",
          accent,
        )}
      >
        {value}
      </div>
    </div>
  );
}

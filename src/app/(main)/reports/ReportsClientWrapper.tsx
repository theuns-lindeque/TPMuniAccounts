"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

interface Building {
  id: string;
  name: string;
}

// 1. Move next/dynamic with ssr: false into a CLIENT component wrapper.
// This is the essential fix for the App Router to fully skip SSR and avoid Turbopack errors with libraries like fflate.
const ReportsClient = dynamic(() => import("./ReportsClient"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Initializing Report Engine...</p>
      </div>
    </div>
  )
});

export default function ReportsClientWrapper({ buildings }: { buildings: Building[] }) {
  return <ReportsClient buildings={buildings} />;
}

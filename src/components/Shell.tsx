"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === "/" || pathname === "/login";

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex h-screen overflow-hidden">
        {!isPublicPage && <Sidebar />}
        <main className={`flex-1 overflow-y-auto ${!isPublicPage ? 'bg-[#fcfcfd] dark:bg-[#0d1117]' : ''}`}>
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}

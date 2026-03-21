"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AIChatSidebar } from "@/components/AIChatSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MuiThemeProvider } from "@/components/MuiThemeProvider";
import { SideMenu } from "@/components/layout/SideMenu";
import { AppNavbar } from "@/components/layout/AppNavbar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const isPublicPage = pathname === "/" || pathname === "/login";

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MuiThemeProvider>
        <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
          {!isPublicPage && (
            <>
              {/* Desktop SideMenu */}
              <SideMenu />
              
              {/* Mobile SideMenu Drawer */}
              <Drawer
                anchor="left"
                open={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                sx={{
                  display: { xs: "block", md: "none" },
                  "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
                }}
              >
                <SideMenu onNavigate={() => setIsMobileMenuOpen(false)} />
              </Drawer>
            </>
          )}

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              height: "100vh",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              backgroundColor: (theme) => 
                !isPublicPage 
                  ? theme.palette.mode === "dark" ? "#0D1117" : "#FCFCFD"
                  : "transparent",
            }}
          >
            {!isPublicPage && <AppNavbar onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />}
            
            <Box sx={{ flexGrow: 1, p: isPublicPage ? 0 : 3, position: "relative" }}>
              {children}
            </Box>

            {/* Floating AI Trigger - Authenticated Pages Only */}
            {!isPublicPage && (
              <Box
                component="button"
                onClick={() => setIsAIChatOpen(true)}
                sx={{
                  fixed: "bottom",
                  position: "fixed",
                  bottom: 24,
                  right: 24,
                  p: 2,
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: "9999px",
                  boxShadow: (theme) => `0 10px 15px -3px ${alpha(theme.palette.primary.main, 0.3)}`,
                  zIndex: 1300,
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                  gap: 1.5,
                  transition: "all 0.2s",
                  border: "none",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "scale(1.1)",
                    bgcolor: "primary.dark",
                  },
                  "&:active": {
                    transform: "scale(0.95)",
                  },
                }}
              >
                <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
                   <div className="w-5 h-5 flex items-center justify-center">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path><path d="M19 3v4"></path><path d="M21 5h-4"></path></svg>
                   </div>
                </Box>
                <Typography component="span" sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Consulting AI
                </Typography>
              </Box>
            )}
          </Box>

          {!isPublicPage && (
            <AIChatSidebar
              isOpen={isAIChatOpen}
              onClose={() => setIsAIChatOpen(false)}
            />
          )}
        </Box>
      </MuiThemeProvider>
    </ThemeProvider>
  );
}

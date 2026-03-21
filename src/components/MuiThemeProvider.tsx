"use client";

import * as React from "react";
import { ThemeProvider as MuiProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme } from "@/lib/mui-theme";

export function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = (theme === "system" ? resolvedTheme : theme) === "dark" ? darkTheme : lightTheme;

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <MuiProvider theme={currentTheme}>
        <CssBaseline />
        <div className={!mounted ? "invisible" : ""}>
          {children}
        </div>
      </MuiProvider>
    </AppRouterCacheProvider>
  );
}

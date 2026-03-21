"use client";

import { createTheme, alpha } from "@mui/material/styles";
import { grey, blue } from "@mui/material/colors";

const brand = {
  50: "#F0F7FF",
  100: "#CEE5FD",
  200: "#9CCCFC",
  300: "#55A6F6",
  400: "#0A66C2",
  500: "#0959AA",
  600: "#064079",
  700: "#033363",
  800: "#02294F",
  900: "#021F3B",
};

const getDesignTokens = (mode: "light" | "dark") => ({
  palette: {
    mode,
    primary: {
      light: brand[200],
      main: brand[400],
      dark: brand[700],
      contrastText: brand[50],
      ...(mode === "dark" && {
        contrastText: brand[50],
        light: brand[300],
        main: brand[400],
        dark: brand[800],
      }),
    },
    secondary: {
      light: grey[100],
      main: grey[500],
      dark: grey[900],
      ...(mode === "dark" && {
        light: grey[300],
        main: grey[500],
        dark: grey[800],
      }),
    },
    warning: {
      main: "#F7B538",
      dark: "#F79F01",
    },
    error: {
      light: "#FF9494",
      main: "#FF5E5E",
      dark: "#AF1919",
    },
    success: {
      light: "#90D1A1",
      main: "#19752D",
      dark: "#0E4119",
    },
    divider: mode === "dark" ? alpha(grey[600], 0.3) : alpha(grey[300], 0.5),
    background: {
      default: mode === "dark" ? "#090E10" : "#F9FAFB",
      paper: mode === "dark" ? "#0B1214" : "#FFFFFF",
    },
    text: {
      primary: mode === "dark" ? grey[50] : grey[900],
      secondary: mode === "dark" ? grey[400] : grey[600],
    },
    action: {
      selected: `${alpha(brand[200], 0.2)}`,
      hover: `${alpha(brand[100], 0.4)}`,
      ...(mode === "dark" && {
        selected: `${alpha(brand[800], 0.2)}`,
        hover: `${alpha(brand[700], 0.4)}`,
      }),
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: "2.5rem", fontWeight: 600 },
    h2: { fontSize: "2rem", fontWeight: 600 },
    h3: { fontSize: "1.75rem", fontWeight: 600 },
    h4: { fontSize: "1.5rem", fontWeight: 600 },
    h5: { fontSize: "1.25rem", fontWeight: 600 },
    h6: { fontSize: "1.1rem", fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
});

export const lightTheme = createTheme(getDesignTokens("light"));
export const darkTheme = createTheme(getDesignTokens("dark"));

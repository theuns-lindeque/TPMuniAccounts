"use client";

import React from "react";
import { Box, Paper, Typography, alpha, useTheme } from "@mui/material";

interface KPICardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string; // e.g., "primary.main", "error.main", "warning.main"
  bg: string;     // e.g., "primary.main", "error.light", etc. (will use alpha)
  border: string; // e.g., "primary.main"
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
  const theme = useTheme();
  const isCompact = variant === "compact";

  // Note: We'll map previous Tailwind colors to MUI theme paths or direct colors
  // Mapping logic if needed, but we'll assume the caller passes MUI-compatible colors/paths
  
  const getMainColor = (color: string) => {
    if (color.includes("teal")) return theme.palette.primary.main;
    if (color.includes("rose") || color.includes("red")) return theme.palette.error.main;
    if (color.includes("yellow") || color.includes("amber")) return theme.palette.warning.main;
    if (color.includes("blue")) return theme.palette.info.main;
    return theme.palette.text.secondary;
  };

  const mainColor = getMainColor(accent);

  if (isCompact) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "background.paper",
          transition: "all 0.2s",
          "&:hover": {
            boxShadow: theme.shadows[2],
            borderColor: alpha(mainColor, 0.3),
          },
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            fontWeight={800}
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "text.secondary",
              mb: 0.5,
              display: "block",
              fontSize: "0.65rem",
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              fontFamily: "monospace",
              color: mainColor,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: "12px",
            bgcolor: alpha(mainColor, 0.1),
            color: mainColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {React.cloneElement(icon as React.ReactElement<any>, { size: 16 })}
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "20px",
        border: "1px solid",
        borderColor: "divider",
        p: { xs: 3, sm: 4 },
        position: "relative",
        overflow: "hidden",
        bgcolor: "background.paper",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          boxShadow: theme.shadows[4],
          borderColor: alpha(mainColor, 0.2),
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -16,
          right: -16,
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: alpha(mainColor, 0.03),
          transition: "all 0.3s",
          ".group:hover &": { bgcolor: alpha(mainColor, 0.08) },
        }}
      />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Typography
          variant="caption"
          fontWeight={800}
          sx={{
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "text.secondary",
            fontSize: "0.65rem",
          }}
        >
          {label}
        </Typography>
        <Box
          sx={{
            p: 1.8,
            borderRadius: "14px",
            bgcolor: alpha(mainColor, 0.1),
            color: mainColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
        </Box>
      </Box>

      <Typography
        variant="h4"
        fontWeight={800}
        sx={{
          fontFamily: "monospace",
          color: mainColor,
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

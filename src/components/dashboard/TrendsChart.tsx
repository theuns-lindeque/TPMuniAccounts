"use client";

import React from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

interface TrendsChartProps {
  data: { month: string; invoices: number; recoveries: number }[];
}

export const TrendsChart = ({ data }: TrendsChartProps) => {
  const theme = useTheme();

  const xData = data.map((d) => d.month);
  const expenseData = data.map((d) => d.invoices);
  const recoveryData = data.map((d) => d.recoveries);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: 340,
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ mb: 2, px: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: "0.05em" }}>
          EXPENDITURE VS RECOVERY (12 MONTHS)
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, width: "100%" }}>
        <LineChart
          xAxis={[
            {
              data: xData,
              scaleType: "point",
              tickLabelStyle: {
                fontSize: 10,
                fontFamily: "monospace",
              },
            },
          ]}
          series={[
            {
              data: expenseData,
              label: "Expenses",
              color: theme.palette.success.main,
              showMark: true,
              valueFormatter: (v) => `R ${v?.toLocaleString()}`,
            },
            {
              data: recoveryData,
              label: "Recoveries",
              color: theme.palette.primary.main,
              showMark: true,
              valueFormatter: (v) => `R ${v?.toLocaleString()}`,
            },
          ]}
          height={260}
          margin={{ left: 60, right: 20, top: 20, bottom: 30 }}
          slotProps={{
            legend: {
              direction: "horizontal",
              position: { vertical: "top", horizontal: "end" },
            },
          }}
        />
      </Box>
    </Paper>
  );
};

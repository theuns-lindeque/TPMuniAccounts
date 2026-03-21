import React from "react";
import { FinancialTable } from "@/components/dashboard/FinancialTable";
import { TrendsChart } from "@/components/dashboard/TrendsChart";
import { RisksPanel } from "@/components/dashboard/RisksPanel";
import {
  TrendingUp,
  AlertCircle,
  FileText,
  Inbox,
} from "lucide-react";
import { getDashboardData } from "@/app/(main)/actions/dashboard";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

export default async function DashboardPage() {
  const result = await getDashboardData();
  
  if (!result.success) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <AlertTitle>Error Fetching Data</AlertTitle>
          {result.error}
        </Alert>
      </Box>
    );
  }

  const hasData = result.reports.length > 0 || result.chartData.some(d => d.invoices > 0 || d.recoveries > 0);

  if (!hasData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Analytics Dashboard
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            height: '50vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderStyle: 'dashed',
            borderRadius: 4,
            bgcolor: 'background.default',
            textAlign: 'center',
            p: 4
          }}
        >
          <Inbox size={48} color="disabled" style={{ marginBottom: 16, opacity: 0.3 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.1em' }}>
            NO DATA AVAILABLE
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 300 }}>
            Upload municipal bills and recovery reports to see analytics here.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const reportsFormatted = result.reports.map(r => ({
      ...r,
      totalInvoiceAmount: r.totalInvoiceAmount.toString(),
      totalRecoveryAmount: r.totalRecoveryAmount.toString(),
      deficit: r.deficit.toString(),
  }));

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, tracking: -1 }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aggregated municipal and recovery performance oversight.
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', fontFamily: 'monospace' }}>
            NODE_CLUSTER: AGGREGATE_ALL
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', fontFamily: 'monospace' }}>
            TIMESTAMP: {new Date().toISOString().substring(0, 16).replace("T", " ")}
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* Main Content: Trends and Table */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            <section>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <TrendingUp size={16} color="#0A66C2" />
                <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.1em' }}>
                  Financial Performance Trends
                </Typography>
              </Stack>
              <TrendsChart data={result.chartData} />
            </section>

            <section>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <FileText size={16} color="#0A66C2" />
                <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.1em' }}>
                  Building Audit History
                </Typography>
              </Stack>
              <FinancialTable reports={reportsFormatted} />
            </section>
          </Stack>
        </Grid>

        {/* Sidebar Content: Risks Panel */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ position: { lg: 'sticky' }, top: 24 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <AlertCircle size={16} color="#0A66C2" />
              <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.1em' }}>
                AI Intelligence & Risks
              </Typography>
            </Stack>
            {result.latestReport ? (
              <RisksPanel report={result.latestReport} />
            ) : (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', opacity: 0.6, borderRadius: 2 }}>
                <AlertCircle size={32} color="disabled" style={{ marginBottom: 8, opacity: 0.3 }} />
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, letterSpacing: '0.1em' }}>
                  NO ANOMALIES DETECTED
                </Typography>
              </Paper>
            )}
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 8, pt: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', opacity: 0.5 }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>
          Proprietary Utility AI Engine v1.5-Pro
        </Typography>
        <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>
          &copy; 2026 TPMuniAccounts.
        </Typography>
      </Box>
    </Box>
  );
}


import { getAppSettings } from "@/app/(main)/actions/settings";
import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Paper,
  Stack,
  alpha,
  Divider,
} from "@mui/material";
import { Lock, ArrowRight, ShieldCheck, BarChart3, Zap } from "lucide-react";

export default async function Home() {
  const settings = await getAppSettings();
  const activeModel = settings?.analysisModel
    ? settings.analysisModel.replace("gemini-", "").toUpperCase()
    : "1.5-PRO";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Blueprint Pattern Background */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: (theme) => (theme.palette.mode === "dark" ? 0.05 : 0.03),
          backgroundImage: "radial-gradient(#111827 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 32,
          pointerEvents: "none",
          border: "1px solid",
          borderColor: "divider",
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 10 }}>
        <Box
          component="nav"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: { xs: 3, lg: 4 },
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                border: "2px solid",
                borderColor: "primary.main",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "primary.main",
                fontSize: "0.75rem",
              }}
            >
              TP
            </Box>
            <Typography
              variant="caption"
              fontWeight={800}
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.3em",
                color: "text.secondary",
                fontSize: "0.7rem",
              }}
            >
              MuniAccounts
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={4}
            sx={{
              display: { xs: "none", sm: "flex" },
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "text.secondary",
                cursor: "pointer",
                "&:hover": { color: "primary.main" },
                transition: "color 0.2s",
              }}
            >
              Architecture
            </Typography>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "text.secondary",
                cursor: "pointer",
                "&:hover": { color: "primary.main" },
                transition: "color 0.2s",
              }}
            >
              Integrations
            </Typography>
          </Stack>
        </Box>

        <Grid container sx={{ minHeight: "calc(100vh - 100px)" }}>
          {/* Left Column: Hero Content */}
          <Grid
            size={{ xs: 12, lg: 7 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              py: { xs: 8, lg: 12 },
              pr: { lg: 8 },
              borderRight: { lg: "1px solid" },
              borderColor: { lg: "divider" },
            }}
          >
            <Box sx={{ maxWidth: 640 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 0.5,
                  borderRadius: "20px",
                  border: "1px solid",
                  borderColor: alpha("#14b8a6", 0.2),
                  bgcolor: alpha("#14b8a6", 0.05),
                  mb: 4,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#14b8a6",
                    animation: "pulse 2s infinite",
                  }}
                />
                <Typography
                  variant="caption"
                  fontWeight={800}
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#14b8a6",
                  }}
                >
                  AI Engine {activeModel} Now Active
                </Typography>
              </Box>

              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2.5rem", sm: "3.5rem", lg: "4.5rem" },
                  lineHeight: { xs: 1.1, lg: 1 },
                  mb: 3,
                }}
              >
                Utility <span style={{ color: "#14b8a6" }}>Auditing</span>
                <br />
                at Scale.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "1rem", lg: "1.125rem" },
                  lineHeight: 1.6,
                  mb: 6,
                  fontWeight: 300,
                }}
              >
                High-precision municipal analysis for commercial portfolios.
                Automatically identify recovery deficits and audit leaks with
                Self-Learning AI infrastructure.
              </Typography>

              <Grid container spacing={4}>
                <Grid size={4}>
                  <Stack spacing={1}>
                    <BarChart3 size={20} color="#14b8a6" />
                    <Typography
                      variant="caption"
                      fontWeight={800}
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: "text.secondary",
                      }}
                    >
                      Analytics
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={4}>
                  <Stack spacing={1}>
                    <ShieldCheck size={20} color="#14b8a6" />
                    <Typography
                      variant="caption"
                      fontWeight={800}
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: "text.secondary",
                      }}
                    >
                      AI Audit
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={4}>
                  <Stack spacing={1}>
                    <Zap size={20} color="#14b8a6" />
                    <Typography
                      variant="caption"
                      fontWeight={800}
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: "text.secondary",
                      }}
                    >
                      Recovery
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Right Column: CTA/Login Link */}
          <Grid
            size={{ xs: 12, lg: 5 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: { xs: 8, lg: 0 },
              pl: { lg: 8 },
              bgcolor: (theme: any) =>
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.background.paper, 0.4)
                  : alpha(theme.palette.background.default, 0.4),
            }}
          >
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                maxWidth: 440,
                p: { xs: 4, lg: 6 },
                borderRadius: "2px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "none"
                    : "0 32px 64px rgba(0,0,0,0.05)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Corner Decorative Lines */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 64,
                  height: 1,
                  bgcolor: alpha("#14b8a6", 0.3),
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 1,
                  height: 64,
                  bgcolor: alpha("#14b8a6", 0.3),
                }}
              />

              <Stack spacing={4} sx={{ textAlign: "center" }}>
                <Box>
                  <Box
                    sx={{
                      display: "inline-flex",
                      p: 1.5,
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor: "divider",
                      mb: 3,
                      bgcolor: "background.default",
                    }}
                  >
                    <Lock size={20} color="#14b8a6" />
                  </Box>
                  <Typography variant="h5" fontWeight={800} gutterBottom>
                    Portal Access
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      color: "text.secondary",
                      fontFamily: "monospace",
                    }}
                  >
                    Authorization Required
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                  Enter the secure registry to manage your commercial utility
                  portfolio and perform real-time audits.
                </Typography>

                <Button
                  component={Link}
                  href="/login"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    height: 56,
                    borderRadius: "2px",
                    bgcolor: "#14b8a6",
                    "&:hover": { bgcolor: "#0d9488" },
                    textTransform: "uppercase",
                    fontWeight: 800,
                    letterSpacing: "0.2em",
                    fontSize: "0.75rem",
                  }}
                  endIcon={<ArrowRight size={16} />}
                >
                  Enter Registry
                </Button>

                <Divider sx={{ my: 1 }} />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{
                    "& > span": {
                      fontSize: "10px",
                      fontFamily: "monospace",
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      cursor: "pointer",
                      "&:hover": { color: "primary.main" },
                    },
                  }}
                >
                  <span>Request Access</span>
                  <span>System Support</span>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Corporate Metadata Footer */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 24, lg: 48 },
          left: { xs: 24, lg: 48 },
          right: { xs: 24, lg: 48 },
          display: { xs: "none", sm: "flex" },
          justifyContent: "space-between",
          alignItems: "center",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      >
        <Stack direction="row" spacing={4}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, letterSpacing: "0.3em", fontSize: "9px" }}
          >
            LAT: -26.2041
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, letterSpacing: "0.3em", fontSize: "9px" }}
          >
            LNG: 28.0473
          </Typography>
        </Stack>
        <Stack direction="row" spacing={4}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, letterSpacing: "0.3em", fontSize: "9px" }}
          >
            Audit Node: 0x2A4F
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, letterSpacing: "0.3em", fontSize: "9px" }}
          >
            System v1.8
          </Typography>
        </Stack>
      </Box>

      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.9);
          }
        }
      `}</style>
    </Box>
  );
}

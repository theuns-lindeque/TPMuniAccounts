import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Building2, Lock, Mail, ArrowRight } from "lucide-react";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(redirectTo);
        router.refresh();
      } else {
        setError(
          data.errors?.[0]?.message ||
            "Login failed. Please check your credentials.",
        );
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="xs">
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "16px",
              bgcolor: "primary.light",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
              mb: 3,
              mx: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Building2 size={32} />
          </Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to access the TrueProp MUNI Registry
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: "24px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative Blueprint Corner (CSS-based) */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 80,
              height: 80,
              opacity: 0.1,
              pointerEvents: "none",
              borderTop: "2px solid",
              borderRight: "2px solid",
              borderColor: "primary.main",
              transform: "translate(40px, -40px) rotate(45deg)",
            }}
          />

          <form onSubmit={handleLogin}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "text.secondary",
                    mb: 1,
                    display: "block",
                    ml: 0.5,
                  }}
                >
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  variant="outlined"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={18} color="rgba(0,0,0,0.4)" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: "12px" },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "text.secondary",
                    mb: 1,
                    display: "block",
                    ml: 0.5,
                  }}
                >
                  Password
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  variant="outlined"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={18} color="rgba(0,0,0,0.4)" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: "12px" },
                    },
                  }}
                />
              </Box>

              {error && (
                <Alert severity="error" sx={{ borderRadius: "12px" }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                size="large"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: "12px",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  "&:hover": {
                    boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                  },
                }}
                endIcon={!loading && <ArrowRight size={18} />}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Enter Registry"
                )}
              </Button>
            </Box>
          </form>
        </Paper>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography
            variant="caption"
            sx={{
              fontFamily: "monospace",
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
            }}
          >
            Secure Access Layer: TLS 1.3 // RSA 4096
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

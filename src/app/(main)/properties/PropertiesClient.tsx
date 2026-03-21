import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Stack,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  alpha,
  Chip,
  Tooltip,
  Grid,
} from "@mui/material";
import {
  Building2,
  Upload,
  MapPin,
  CircleDollarSign,
  Plus,
  X,
  Globe,
  ArrowRight,
} from "lucide-react";
import { createBuildingAction } from "@/app/(main)/actions/buildings";

const REGIONS = [
  "All",
  "Gauteng",
  "Eastern Cape",
  "Western Cape",
  "Students",
] as const;

interface Building {
  id: string;
  name: string;
  address: string | null;
  municipalValue: string | null;
  region: "Gauteng" | "Eastern Cape" | "Western Cape" | "Students";
  utilityAccounts: {
    id: string;
    accountNumber: string;
    type: string;
  }[];
}

export default function PropertiesClient({
  initialBuildings,
}: {
  initialBuildings: Building[];
}) {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] =
    useState<(typeof REGIONS)[number]>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredBuildings =
    selectedRegion === "All"
      ? initialBuildings
      : initialBuildings.filter((b) => b.region === selectedRegion);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      municipalValue: formData.get("municipalValue") as string,
      region: formData.get("region") as
        | "Gauteng"
        | "Eastern Cape"
        | "Western Cape"
        | "Students",
    };

    const result = await createBuildingAction(data);
    if (result.success) {
      setIsModalOpen(false);
      window.location.reload();
    } else {
      setError(result.error || "Failed to create building");
    }
    setIsSubmitting(false);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 6,
          pb: 4,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "flex-end" },
          gap: 4,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Building2 size={16} color="#14b8a6" />
            <Typography
              variant="caption"
              fontWeight={800}
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "primary.main",
              }}
            >
              Portfolio Management
            </Typography>
          </Stack>
          <Typography variant="h4" fontWeight={800} tracking-tight>
            Properties
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button
            variant="contained"
            disableElevation
            startIcon={<Plus size={16} />}
            onClick={() => setIsModalOpen(true)}
            sx={{
              bgcolor: "text.primary",
              color: "background.paper",
              "&:hover": { bgcolor: alpha("#000", 0.8) },
              px: 3,
              py: 1.2,
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Register Property
          </Button>
          <Button
            component={Link}
            href="/upload?type=recovery"
            variant="outlined"
            startIcon={<Upload size={16} color="#14b8a6" />}
            sx={{
              borderColor: "divider",
              color: "text.primary",
              "&:hover": { borderColor: "primary.main", bgcolor: "transparent" },
              px: 3,
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Upload Recovery
          </Button>
          <Button
            component={Link}
            href="/upload?type=bill"
            variant="contained"
            disableElevation
            startIcon={<Upload size={16} />}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
              px: 3,
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Upload Bills
          </Button>
        </Stack>
      </Box>

      {/* Region Filters */}
      <Stack direction="row" spacing={1} sx={{ mb: 4, flexWrap: "wrap", gap: 1 }}>
        {REGIONS.map((region) => (
          <Chip
            key={region}
            label={region}
            onClick={() => setSelectedRegion(region)}
            sx={{
              borderRadius: "100px",
              fontSize: "0.65rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              bgcolor: selectedRegion === region ? "primary.main" : "divider",
              color: selectedRegion === region ? "white" : "text.secondary",
              "&:hover": {
                bgcolor:
                  selectedRegion === region ? "primary.dark" : alpha("#000", 0.1),
              },
              transition: "all 0.2s",
              px: 1,
            }}
          />
        ))}
      </Stack>

      {/* Properties Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "16px",
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: alpha("#f8fafc", 0.5) }}>
            <TableRow>
              <TableCell
                sx={{
                  py: 2.5,
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "text.secondary",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Building2 size={14} color="#14b8a6" />
                  <span>Property Name</span>
                </Stack>
              </TableCell>
              <TableCell
                sx={{
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "text.secondary",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Globe size={14} color="#14b8a6" />
                  <span>Region</span>
                </Stack>
              </TableCell>
              <TableCell
                sx={{
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "text.secondary",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <MapPin size={14} color="#14b8a6" />
                  <span>Street Address</span>
                </Stack>
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "text.secondary",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  <CircleDollarSign size={14} color="#14b8a6" />
                  <span>Municipal Value</span>
                </Stack>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBuildings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 12 }}>
                  <Stack spacing={2} alignItems="center">
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "50%",
                        bgcolor: "divider",
                        color: "text.disabled",
                      }}
                    >
                      <Building2 size={32} />
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        No properties found in {selectedRegion}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Register a new property to get started.
                      </Typography>
                    </Box>
                    <Button
                      variant="text"
                      startIcon={<Plus size={16} />}
                      onClick={() => setIsModalOpen(true)}
                      sx={{
                        color: "primary.main",
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      Register Property
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              filteredBuildings.map((building) => (
                <TableRow
                  key={building.id}
                  hover
                  onClick={() => router.push(`/properties/${building.id}`)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": { bgcolor: alpha("#14b8a6", 0.02) },
                  }}
                >
                  <TableCell sx={{ py: 2.5 }}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ color: "text.primary" }}
                    >
                      {building.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "monospace",
                        color: "text.disabled",
                        fontSize: "0.6rem",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      UUID: {building.id.slice(0, 8)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={building.region}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        bgcolor: "divider",
                        borderRadius: "4px",
                        px: 0.5,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: 240,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: "0.8rem",
                      }}
                    >
                      {building.address || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={800}
                      sx={{
                        fontFamily: "monospace",
                        color: "primary.main",
                        fontSize: "0.8rem",
                      }}
                    >
                      {building.municipalValue
                        ? `R ${parseFloat(building.municipalValue).toLocaleString(
                            "en-ZA",
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                          )}`
                        : "—"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredBuildings.length > 0 && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 3, px: 2 }}
        >
          <Typography
            variant="caption"
            sx={{
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "text.disabled",
              fontSize: "0.6rem",
            }}
          >
            Showing {filteredBuildings.length} active nodes
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "#10b981",
                boxShadow: "0 0 8px rgba(16,185,129,0.5)",
              }}
            />
            <Typography
              variant="caption"
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "text.disabled",
                fontSize: "0.6rem",
              }}
            >
              System Synchronized
            </Typography>
          </Stack>
        </Stack>
      )}

      {/* Register Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "24px", p: 2, bgcolor: "background.paper" },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={800}>
              Register New Property
            </Typography>
            <IconButton onClick={() => setIsModalOpen(false)} size="small">
              <X size={20} />
            </IconButton>
          </Stack>
        </DialogTitle>
        <form onSubmit={handleRegister}>
          <DialogContent sx={{ px: 3, py: 2 }}>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "text.secondary",
                    mb: 1,
                    display: "block",
                  }}
                >
                  Property Name
                </Typography>
                <TextField
                  fullWidth
                  name="name"
                  required
                  placeholder="e.g. Oak Ridge Office Park"
                  variant="outlined"
                  slotProps={{ input: { sx: { borderRadius: "12px" } } }}
                />
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "text.secondary",
                    mb: 1,
                    display: "block",
                  }}
                >
                  Street Address
                </Typography>
                <TextField
                  fullWidth
                  name="address"
                  placeholder="e.g. 123 Main St, Cape Town"
                  variant="outlined"
                  slotProps={{ input: { sx: { borderRadius: "12px" } } }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "text.secondary",
                      mb: 1,
                      display: "block",
                    }}
                  >
                    Region
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    name="region"
                    defaultValue="Gauteng"
                    variant="outlined"
                    slotProps={{ input: { sx: { borderRadius: "12px" } } }}
                  >
                    {REGIONS.filter((r) => r !== "All").map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "text.secondary",
                      mb: 1,
                      display: "block",
                    }}
                  >
                    Municipal Value (ZAR)
                  </Typography>
                  <TextField
                    fullWidth
                    name="municipalValue"
                    type="number"
                    slotProps={{ input: { step: "0.01", sx: { borderRadius: "12px", fontFamily: "monospace" } } }}
                    placeholder="3200000.00"
                    variant="outlined"
                  />
                </Grid>
              </Grid>

              {error && (
                <Typography variant="caption" color="error" fontWeight={600}>
                  {error}
                </Typography>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 4, pt: 2 }}>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="contained"
              fullWidth
              sx={{
                py: 1.8,
                borderRadius: "12px",
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
                fontSize: "0.75rem",
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              {isSubmitting ? "Registering..." : "Complete Registration"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

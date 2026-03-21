"use client";

import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import { Search, Sun, Moon, Bell, ChevronRight, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import NextLink from "next/link";

const SearchWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.text.primary, 0.05),
  "&:hover": {
    backgroundColor: alpha(theme.palette.text.primary, 0.1),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
    fontSize: 12,
  },
}));

export function AppNavbar({ onMobileMenuToggle }: { onMobileMenuToggle: () => void }) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const pathParts = pathname.split("/").filter(Boolean);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        px: 2,
        height: 64,
        justifyContent: "center",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMobileMenuToggle}
            sx={{ display: { md: "none" } }}
          >
            <Menu size={20} />
          </IconButton>
          
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Breadcrumbs 
              aria-label="breadcrumb" 
              separator={<ChevronRight size={12} />}
              sx={{ "& .MuiBreadcrumbs-li": { fontSize: 12, fontWeight: 500 } }}
            >
              <Link
                component={NextLink}
                underline="hover"
                color="inherit"
                href="/dashboard"
              >
                MuniAccounts
              </Link>
              {pathParts.map((part, index) => {
                const href = `/${pathParts.slice(0, index + 1).join("/")}`;
                const isLast = index === pathParts.length - 1;
                return isLast ? (
                  <Typography key={part} color="text.primary" sx={{ fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                    {part}
                  </Typography>
                ) : (
                  <Link
                    key={part}
                    component={NextLink}
                    underline="hover"
                    color="inherit"
                    href={href}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {part}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center">
          <SearchWrapper>
            <SearchIconWrapper>
              <Search size={16} />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search..."
              inputProps={{ "aria-label": "search" }}
            />
          </SearchWrapper>

          <IconButton size="small" sx={{ ml: 1 }}>
            <Bell size={20} />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            sx={{ ml: 1 }}
          >
            {mounted && (theme === "dark" ? <Sun size={20} /> : <Moon size={20} />)}
          </IconButton>
        </Stack>
      </Stack>
    </AppBar>
  );
}

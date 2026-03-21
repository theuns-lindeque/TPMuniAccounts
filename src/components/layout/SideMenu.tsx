"use client";

import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {
  LayoutDashboard,
  Building2,
  Upload,
  FilePieChart,
  Settings,
  Users,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getMe, logoutUser } from "@/app/(main)/actions/users";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Properties", href: "/properties", icon: Building2 },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Reports", href: "/reports", icon: FilePieChart },
  { name: "Users", href: "/users", icon: Users, role: ["admin"] },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function SideMenu({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<{ name: string; email: string; role: string } | null>(null);

  React.useEffect(() => {
    getMe().then((u) => setUser(u as any));
  }, []);

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      router.push("/login");
      router.refresh();
    }
  };

  const filteredItems = menuItems.filter((item) => {
    if (!item.role) return true;
    return item.role.includes(user?.role || "");
  });

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      <Box sx={{ p: 3, display: "flex", itemsCenter: "center", gap: 1 }}>
        <Box
          sx={{
            width: 24,
            height: 24,
            border: "2px solid",
            borderColor: "primary.main",
            borderRadius: 0.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace",
            fontWeight: "bold",
            color: "primary.main",
            fontSize: 10,
          }}
        >
          TP
        </Box>
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", fontSize: 10, color: "text.secondary" }}
        >
          MuniAccounts
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ overflow: "auto", flexGrow: 1, px: 1, py: 2 }}>
        <List sx={{ gap: 0.5, display: "flex", flexDirection: "column" }}>
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <ListItem key={item.name} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={isActive}
                  onClick={() => onNavigate?.()}
                  sx={{
                    borderRadius: 1,
                    "&.Mui-selected": {
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                      "&:hover": {
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                      },
                      "& .MuiListItemIcon-root": {
                        color: "primary.main",
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Icon size={20} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.name} 
                    primaryTypographyProps={{ 
                      fontSize: 12, 
                      fontWeight: 700,
                      sx: { textTransform: 'uppercase', letterSpacing: '0.1em' }
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: 12,
            }}
          >
            {user?.name?.[0] || "U"}
          </Box>
          <Box sx={{ overflow: "hidden" }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
              {user?.name || "User"}
            </Typography>
            <Typography variant="caption" noWrap color="text.secondary">
              {user?.email || "user@example.com"}
            </Typography>
          </Box>
        </Stack>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 1,
            color: "error.main",
            "&:hover": {
              backgroundColor: (theme) => alpha(theme.palette.error.main, 0.05),
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
            <LogOut size={18} />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            primaryTypographyProps={{ 
              fontSize: 12, 
              fontWeight: 700,
              sx: { textTransform: 'uppercase', letterSpacing: '0.1em' }
            }} 
          />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}

import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Popper,
} from "@mui/material";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import SearchBar from "./SearchBar";
import ProductMegaMenu from "./ProductMegaMenu";

export default function Header() {
  const nav = useNavigate();
  const loc = useLocation();
  const { user, logout } = useAuth();

  // 🧭 Xác định trang hiện tại
  const isActive = (path: string) => loc.pathname === path;

  // === User Menu ===
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    handleClose();
    nav("/");
  };

  // === Mega Menu “Sản phẩm” ===
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null);
  let closeTimeout: NodeJS.Timeout | null = null;

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (closeTimeout) clearTimeout(closeTimeout);
    setAnchorElMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    closeTimeout = setTimeout(() => {
      setAnchorElMenu(null);
    }, 300);
  };

  // 🧭 Reset filters khi click "Sản phẩm"
  const handleGoProducts = () => {
    nav("/products");
    window.dispatchEvent(new Event("latn:resetFilters"));
  };

  return (
    <AppBar
      position="sticky"
      elevation={4}
      sx={{
        bgcolor: "#1C1C1C",
        color: "#FFD700",
        borderBottom: "1px solid rgba(255, 215, 0, 0.25)",
        px: { xs: 1, md: 3 },
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* 🌟 Logo + Nav */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Typography
            onClick={() => nav("/")}
            sx={{
              fontWeight: 900,
              fontSize: 22,
              letterSpacing: 1.5,
              cursor: "pointer",
              color: "#FFD700",
              textShadow: "0 0 8px rgba(255,215,0,0.6)",
              "&:hover": { color: "#FFF59D" },
            }}
          >
            LATN
          </Typography>

          {/* 🔗 Navigation */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 3,
              ml: 1,
            }}
          >
            {/* 🧭 Sản phẩm có Mega Menu */}
            <Typography
              onClick={handleGoProducts}
              onMouseEnter={handleOpenMenu}
              onMouseLeave={handleCloseMenu}
              sx={{
                position: "relative",
                fontWeight: isActive("/products") ? 700 : 600,
                fontSize: isActive("/products") ? 17 : 15,
                color: "#FFD700",
                cursor: "pointer",
                transition: "all 0.25s ease",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -4,
                  left: 0,
                  width: isActive("/products") ? "100%" : "0%",
                  height: "2px",
                  backgroundColor: "#FFD700",
                  transition: "width 0.25s ease",
                },
                "&:hover::after": {
                  width: "100%",
                },
              }}
            >
              Sản phẩm
            </Typography>

            {/* 🪄 Mega Menu */}
            <Popper
              open={Boolean(anchorElMenu)}
              anchorEl={anchorElMenu}
              placement="bottom-start"
              disablePortal={false}
              modifiers={[{ name: "offset", options: { offset: [0, 10] } }]}
            >
              <Box
                onMouseEnter={() => {
                  if (closeTimeout) clearTimeout(closeTimeout);
                }}
                onMouseLeave={() => setAnchorElMenu(null)}
                sx={{
                  mt: 1,
                  borderRadius: 2,
                  boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                  backgroundColor: "#fff",
                  zIndex: 2000,
                }}
              >
                <ProductMegaMenu />
              </Box>
            </Popper>

            {/* 🧩 Các mục còn lại */}
            {[
              { path: "/new-products", label: "Hàng mới" },
              { path: "/sale", label: "Sale" },
              { path: "/about", label: "Về chúng tôi" },
              { path: "/contact", label: "Liên hệ" },
            ].map((item) => (
              <Typography
                key={item.path}
                onClick={() => nav(item.path)}
                sx={{
                  position: "relative",
                  fontWeight: isActive(item.path) ? 700 : 600,
                  fontSize: isActive(item.path) ? 17 : 15,
                  color: "#FFD700",
                  cursor: "pointer",
                  textTransform: "none",
                  transition: "all 0.25s ease",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -4,
                    left: 0,
                    width: isActive(item.path) ? "100%" : "0%",
                    height: "2px",
                    backgroundColor: "#FFD700",
                    transition: "width 0.25s ease",
                  },
                  "&:hover::after": {
                    width: "100%",
                  },
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* 🔍 Search */}
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <SearchBar />
        </Box>

        {/* 👤 User + Wishlist + Cart */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {user ? (
            <>
              <Button
                variant="text"
                onClick={handleMenu}
                startIcon={<AccountCircleOutlined sx={{ color: "#FFD700" }} />}
                sx={{
                  color: "#FFD700",
                  display: { xs: "none", md: "inline-flex" },
                  fontWeight: 600,
                  "&:hover": { color: "#FFF59D" },
                }}
              >
                Xin chào, {user.name || "Khách"}
              </Button>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  onClick={() => {
                    handleClose();
                    nav("/profile");
                  }}
                >
                  Hồ sơ cá nhân
                </MenuItem>
                <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="text"
              onClick={() => nav("/login")}
              startIcon={<AccountCircleOutlined sx={{ color: "#FFD700" }} />}
              sx={{
                color: "#FFD700",
                display: { xs: "none", md: "inline-flex" },
                fontWeight: 600,
                "&:hover": { color: "#FFF59D" },
              }}
            >
              Đăng nhập
            </Button>
          )}

          {/* ❤️ Wishlist */}
          <Tooltip title="Danh sách yêu thích">
            <IconButton
              onClick={() => nav(user ? "/wishlist" : "/login")}
              sx={{
                color: "#FFD700",
                "&:hover": { color: "#FFCA28" },
              }}
            >
              <FavoriteBorderIcon />
            </IconButton>
          </Tooltip>

          {/* 🛍 Cart */}
          <IconButton
            onClick={() => nav("/cart")}
            sx={{
              color: "#FFD700",
              "&:hover": { color: "#FFCA28" },
            }}
          >
            <ShoppingBagOutlined />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

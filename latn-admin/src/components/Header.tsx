import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Thêm import này

interface HeaderProps {
  title: string;
  onLogout?: () => void;
}

export default function Header({ title, onLogout }: HeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate(); // 👈 Hook điều hướng

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  // 👉 Khi chọn “Hồ sơ cá nhân”
  const handleProfileClick = () => {
    handleMenuClose(); // Đóng menu trước
    navigate('/profile'); // Chuyển đến trang hồ sơ
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2', mb: 3 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>

        <Box>
          <Button
            color="inherit"
            startIcon={<AccountCircleIcon />}
            onClick={handleMenuOpen}
          >
            Quản trị viên
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {/* 👇 Thêm điều hướng Hồ sơ cá nhân */}
            <MenuItem onClick={handleProfileClick}>
              Hồ sơ cá nhân
            </MenuItem>

            <MenuItem onClick={onLogout}>
              <LogoutIcon fontSize="small" style={{ marginRight: 8 }} /> Đăng xuất
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

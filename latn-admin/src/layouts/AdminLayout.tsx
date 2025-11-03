import { Box } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar cố định bên trái */}
      <Sidebar />

      {/* Khu vực bên phải */}
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f9f9f9' }}>
        {/* Header cố định trên cùng */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 240, // 💡 đúng bằng width của Sidebar
            right: 0,
            zIndex: 1200,
          }}
        >
          <Header title="Hệ thống quản trị" onLogout={handleLogout} />
        </Box>

        {/* Nội dung cuộn bên dưới header */}
        <Box
          component="main"
          sx={{
            mt: 10, // 💡 chừa chỗ cho Header (AppBar cao ~64px + margin)
            p: 3,
            overflowY: 'auto',
            height: 'calc(100vh - 64px)', // tránh tràn chiều cao
            bgcolor: '#fff',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false); // ✅ popup khi bị khóa
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login-admin', { email, password });
      const { user, token } = res.data;

      // 🚫 Nếu bị khóa thì show popup
      if (user.isActive === false) {
        setOpenDialog(true);
        return;
      }

      // ⚠️ Nếu không phải admin/staff
      if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
        alert('Tài khoản này không có quyền truy cập trang quản trị.');
        return;
      }

      // ✅ Lưu token và chuyển hướng
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (e: any) {
      const msg =
        e.response?.data?.message ||
        'Đăng nhập thất bại. Kiểm tra email/mật khẩu.';
      console.error('Login error:', e.response?.data || e.message);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        p: 2,
      }}
    >
      <Card sx={{ width: 360 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
            Đăng nhập Admin
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              required
            />
            <TextField
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              required
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={22} /> : 'Đăng nhập'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 🧩 Popup thông báo khóa tài khoản */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            textAlign: 'center',
            p: 1,
            bgcolor: '#222',
            color: 'white',
            maxWidth: 360,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#ffb300' }}>
          THÔNG BÁO
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Tài khoản của bạn đã bị khóa.<br />
            Vui lòng liên hệ quản trị viên để được hỗ trợ.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            pb: 2,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setOpenDialog(false)}
          >
            Trợ giúp
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: '#ffb300' }}
            onClick={() => setOpenDialog(false)}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(null); setErr(null);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setOk(res.data?.message ?? 'Nếu email tồn tại, hệ thống đã gửi hướng dẫn.');
      // DEV: hiển thị link reset nếu backend trả về (chỉ trong dev)
      if (res.data?.resetLink) {
        setOk(`${res.data.message} | DEV link: ${res.data.resetLink}`);
      }
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? 'Có lỗi xảy ra');
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 420, mx: 'auto' }}>
      <Typography variant="h5" mb={2}>Quên mật khẩu</Typography>
      {ok && <Alert severity="success" sx={{ mb: 2 }}>{ok}</Alert>}
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
      <Box component="form" onSubmit={submit}>
        <TextField
          fullWidth
          label="Email đã đăng ký"
          value={email}
          onChange={e => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" fullWidth>Gửi yêu cầu</Button>
      </Box>
    </Box>
  );
}

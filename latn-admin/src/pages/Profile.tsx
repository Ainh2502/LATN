import { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import api from '../api/axios';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.get('/users/me')
      .then(res => setUser(res.data))
      .catch(() => setErr('Không tải được thông tin người dùng'));
  }, []);

  const save = async () => {
    setOk(null); setErr(null);
    try {
      await api.patch('/users/me', { name: user.name /* avatar... */ });
      setOk('Cập nhật thành công!');
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? 'Có lỗi xảy ra');
    }
  };

  if (!user) return null;

  return (
    <Box sx={{ p: 3, maxWidth: 520 }}>
      <Typography variant="h5" mb={2}>Thông tin cá nhân</Typography>
      {ok && <Alert severity="success" sx={{ mb: 2 }}>{ok}</Alert>}
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <TextField fullWidth label="Email" value={user.email} disabled sx={{ mb: 2 }} />
      <TextField
        fullWidth
        label="Tên hiển thị"
        value={user.name ?? ''}
        onChange={e => setUser({ ...user, name: e.target.value })}
        sx={{ mb: 2 }}
      />
      <TextField fullWidth label="Vai trò" value={user.role} disabled sx={{ mb: 2 }} />
      <Button variant="contained" onClick={save}>Lưu</Button>
    </Box>
  );
}

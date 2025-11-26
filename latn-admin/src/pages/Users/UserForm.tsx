import { useEffect, useState } from 'react';
import { Box, Button, TextField, MenuItem, Typography, FormControlLabel, Switch } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 🧩 Thêm isActive
  const [user, setUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'CUSTOMER',
    isActive: true, // ✅ mặc định là hoạt động
  });

  useEffect(() => {
    if (id) {
      api.get(`/users/${id}`).then((res) => setUser(res.data));
    }
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (id) {
        await api.patch(`/users/${id}`, user);
      } else {
        await api.post('/users', user);
      }
      navigate('/users');
    } catch (err) {
      console.error(err);
      alert('Lưu tài khoản thất bại!');
    }
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        {id ? '✏️ Cập nhật tài khoản' : '➕ Tạo mới tài khoản'}
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'grid', gap: 2, maxWidth: 400 }}
      >
        <TextField
          label="Email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          fullWidth
        />

        <TextField
          label="Tên"
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          fullWidth
        />

        {!id && (
          <TextField
            label="Mật khẩu"
            type="password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            fullWidth
          />
        )}

        <TextField
          select
          label="Vai trò"
          value={user.role}
          onChange={(e) => setUser({ ...user, role: e.target.value })}
          fullWidth
        >
          <MenuItem value="ADMIN">ADMIN</MenuItem>
          <MenuItem value="STAFF">STAFF</MenuItem>
          <MenuItem value="CUSTOMER">CUSTOMER</MenuItem>
        </TextField>

        {/* ✅ Chỉ hiển thị khi là chỉnh sửa */}
        {id && (
          <FormControlLabel
            control={
              <Switch
                checked={!!user.isActive}
                onChange={(e) =>
                  setUser({ ...user, isActive: e.target.checked })
                }
                color="primary"
              />
            }
            label={user.isActive ? 'Hoạt động' : 'Bị khóa'}
          />
        )}

        <Button variant="contained" type="submit">
          Lưu
        </Button>
        <Button variant="outlined" onClick={() => navigate('/users')}>
          Hủy
        </Button>
      </Box>
    </Box>
  );
}

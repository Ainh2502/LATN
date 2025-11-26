import { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, FormControlLabel, Switch } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

export default function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    email: '',
    name: '',
    isActive: true,
  });

  useEffect(() => {
    if (id) {
      api.get(`/customers/${id}`).then((res) => setCustomer(res.data));
    }
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.patch(`/customers/${id}`, customer);
      navigate('/customers');
    } catch (err) {
      console.error(err);
      alert('Lưu khách hàng thất bại!');
    }
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>✏️ Cập nhật khách hàng</Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'grid', gap: 2, maxWidth: 400 }}
      >
        <TextField
          label="Email"
          value={customer.email}
          onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
          fullWidth
        />

        <TextField
          label="Tên"
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          fullWidth
        />

        <FormControlLabel
          control={
            <Switch
              checked={!!customer.isActive}
              onChange={(e) =>
                setCustomer({ ...customer, isActive: e.target.checked })
              }
              color="primary"
            />
          }
          label={customer.isActive ? 'Hoạt động' : 'Bị khóa'}
        />

        <Button variant="contained" type="submit">
          Lưu
        </Button>
        <Button variant="outlined" onClick={() => navigate('/customers')}>
          Hủy
        </Button>
      </Box>
    </Box>
  );
}

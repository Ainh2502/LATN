import { useEffect, useState } from 'react';
import {
  Box, Typography, Button,
  Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

export default function CustomerList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    const res = await api.get('/customers');
    setCustomers(res.data.items || []);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa khách hàng này?')) {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    }
  };

  const isActiveOrDefault = (val: any) => (val === false ? false : true);

  return (
    <Box>
      <Typography variant="h5" mb={2}>👥 Quản lý khách hàng</Typography>

      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Tên</TableCell>
            <TableCell>Vai trò</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell align="center">Chi tiết địa chỉ</TableCell>
            <TableCell>Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((c) => {
            const active = isActiveOrDefault(c.isActive);
            return (
              <TableRow key={c.id}>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.role}</TableCell>
                <TableCell>
                  <span style={{ color: active ? 'green' : 'red', fontWeight: 500 }}>
                    {active ? 'Hoạt động' : 'Bị khóa'}
                  </span>
                </TableCell>
                <TableCell align="center">
                  <Button size="small" onClick={() => navigate(`/customers/${c.id}/addresses`)}>
                    📍
                  </Button>
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => navigate(`/customers/${c.id}`)}>Sửa</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(c.id)}>Xóa</Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}

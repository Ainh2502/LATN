import { useEffect, useState } from 'react';
import {
  Box, Typography, Button,
  Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

export default function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    const res = await api.get('/users');
    setUsers(res.data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa tài khoản này?')) {
      await api.delete(`/users/${id}`);
      fetchUsers();
    }
  };

  // ⚠️ Phòng trường hợp API cũ chưa trả isActive: mặc định coi là true
  const isActiveOrDefault = (val: any) => (val === false ? false : true);

  return (
    <Box>
      <Typography variant="h5" mb={2}>👤 Quản lý tài khoản</Typography>
      <Button variant="contained" onClick={() => navigate('/users/new')}>+ Thêm tài khoản</Button>

      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Tên</TableCell>
            <TableCell>Vai trò</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u) => {
            const active = isActiveOrDefault(u.isActive);
            return (
              <TableRow key={u.id}>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>
                  <span style={{ color: active ? 'green' : 'red', fontWeight: 500 }}>
                    {active ? 'Hoạt động' : 'Bị khóa'}
                  </span>
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => navigate(`/users/${u.id}`)}>Sửa</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(u.id)}>Xóa</Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}

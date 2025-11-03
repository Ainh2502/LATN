import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import api from '../../api/axios';

export default function SupplierList() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/suppliers')
      .then(res => setRows(res.data ?? []))
      .catch(err => console.error('Lỗi tải nhà cung cấp:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h5" mb={2}>Nhà cung cấp</Typography>
      {loading ? <CircularProgress /> : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Điện thoại</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

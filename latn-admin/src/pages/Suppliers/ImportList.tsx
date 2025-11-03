import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import api from '../../api/axios';

export default function ImportList() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/imports')
      .then(res => setRows(res.data ?? []))
      .catch(err => console.error('Lỗi tải phiếu nhập:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h5" mb={2}>Phiếu nhập hàng</Typography>
      {loading ? <CircularProgress /> : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Mã phiếu</TableCell>
              <TableCell>Nhà cung cấp</TableCell>
              <TableCell align="right">Tổng tiền</TableCell>
              <TableCell>Ngày</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell>{r.code ?? r.id}</TableCell>
                <TableCell>{r.supplier?.name ?? '-'}</TableCell>
                <TableCell align="right">{r.total?.toLocaleString('vi-VN') ?? 0}</TableCell>
                <TableCell>{r.createdAt ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

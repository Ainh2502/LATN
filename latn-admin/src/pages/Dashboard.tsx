import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../api/axios';

interface Overview {
  users: number;
  products: number;
  orders: number;
  revenue: number;
}

export default function Dashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const res = await api.get('/dashboard/overview');
        setData(res.data);
      } catch (error) {
        console.error('❌ Lỗi tải dữ liệu Dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/#/login';
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          // ✅ Dùng Box + CSS Grid thay thế Grid2
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6">Người dùng</Typography>
                <Typography variant="h4">{data?.users ?? 0}</Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6">Sản phẩm</Typography>
                <Typography variant="h4">{data?.products ?? 0}</Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6">Đơn hàng</Typography>
                <Typography variant="h4">{data?.orders ?? 0}</Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6">Doanh thu (VND)</Typography>
                <Typography variant="h4">
                  {data?.revenue?.toLocaleString('vi-VN') ?? 0}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
}

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import api from '../../api/axios';

export default function BrandList() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', email: '', phone: '', description: '' });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/brand');
      setBrands(Array.isArray(data) ? data : []);
    } catch {
      setAlert({ type: 'error', msg: 'Không thể tải danh sách thương hiệu!' });
    } finally {
      setLoading(false);
    }
  };
// 🧩 Hàm sinh slug tự động từ tên
  function generateSlug(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD') // loại bỏ dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '') // chỉ cho phép chữ, số và dấu cách
      .trim()
      .replace(/\s+/g, '-') // thay khoảng trắng bằng gạch ngang
      .replace(/-+/g, '-'); // bỏ gạch dư
  }

  useEffect(() => {
    loadBrands();
  }, []);

  const openAdd = () => {
    setForm({ name: '', slug: '', email: '', phone: '', description: '' });
    setEditing(null);
    setOpenForm(true);
  };

  const openEdit = (b: any) => {
    setEditing(b);
    setForm({
      name: b.name ?? '',
      slug: b.slug ?? '',
      email: b.email ?? '',
      phone: b.phone ?? '',
      description: b.description ?? '',
    });
    setOpenForm(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.patch(`/brand/${editing.id}`, form);
      } else {
        await api.post('/brand', form);
      }
      await loadBrands();
      setAlert({ type: 'success', msg: '✅ Lưu thương hiệu thành công!' });
      setOpenForm(false);
    } catch {
      setAlert({ type: 'error', msg: '❌ Không thể lưu thương hiệu!' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa thương hiệu này?')) return;
    try {
      await api.delete(`/brand/${id}`);
      await loadBrands();
      setAlert({ type: 'success', msg: '🗑️ Xóa thương hiệu thành công!' });
    } catch {
      setAlert({ type: 'error', msg: '❌ Lỗi khi xóa thương hiệu!' });
    }
  };

  const alertContent = alert ? (
    <Alert severity={alert.type}>{alert.msg}</Alert>
  ) : undefined;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Quản lý thương hiệu</Typography>
        <Button variant="contained" onClick={openAdd}>
          + Thêm thương hiệu
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : brands.length === 0 ? (
        <Typography>Chưa có thương hiệu nào.</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tên thương hiệu</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>SĐT</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell align="center">Sản phẩm</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brands.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.name}</TableCell>
                <TableCell>{b.slug}</TableCell>
                <TableCell>{b.email ?? '-'}</TableCell>
                <TableCell>{b.phone ?? '-'}</TableCell>
                <TableCell>{b.description ?? '-'}</TableCell>
                <TableCell align="center">{b._count?.products ?? 0}</TableCell>
                <TableCell align="center">
                  <Button size="small" variant="outlined" onClick={() => openEdit(b)}>
                    Sửa
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    sx={{ ml: 1 }}
                    onClick={() => handleDelete(b.id)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Sửa thương hiệu' : 'Thêm thương hiệu mới'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Tên"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm({
                  ...form,
                  name,
                  slug: generateSlug(name), // 🧠 tự động cập nhật slug
                });
              }}
              required
            />
            <TextField
              label="Slug (tự sinh)"
              value={form.slug}
              InputProps={{ readOnly: true }}
            />
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <TextField label="Mô tả" multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!alert}
        autoHideDuration={2500}
        onClose={() => setAlert(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {alertContent}
      </Snackbar>
    </Box>
  );
}

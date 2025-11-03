import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Stack,
  CircularProgress,
  TextField,
  MenuItem,
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

// 🧩 Hàm tạo slug tự động
function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD') // bỏ dấu
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function CategoryList() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', parentId: '' });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // 🧩 State xác nhận xóa
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/category');
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setAlert({ type: 'error', msg: '❌ Lỗi tải danh mục!' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', slug: '', parentId: '' });
    setOpenForm(true);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      name: c.name ?? '',
      slug: c.slug ?? '',
      parentId: c.parent?.id ?? '',
    });
    setOpenForm(true);
  };

  // 🧠 Tự động sinh slug khi người dùng nhập tên
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm({
      ...form,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSave = async () => {
    try {
      if (editing) await api.patch(`/category/${editing.id}`, form);
      else await api.post('/category', form);
      await loadCategories();
      setAlert({ type: 'success', msg: '✅ Lưu danh mục thành công!' });
      setOpenForm(false);
    } catch {
      setAlert({ type: 'error', msg: '❌ Không thể lưu danh mục!' });
    }
  };

  // 🧠 Mở dialog xác nhận xóa
  const handleDeleteClick = (category: any) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  // 🧩 Xác nhận xóa
  const confirmDelete = async () => {
    try {
      await api.delete(`/category/${categoryToDelete.id}`);
      await loadCategories();
      setAlert({ type: 'success', msg: '🗑️ Đã xóa danh mục cùng sản phẩm!' });
    } catch {
      setAlert({ type: 'error', msg: '❌ Lỗi khi xóa danh mục!' });
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Quản lý danh mục</Typography>
        <Button variant="contained" onClick={openAdd}>
          + Thêm danh mục
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : categories.length === 0 ? (
        <Typography>Chưa có danh mục nào.</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tên danh mục</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Danh mục cha</TableCell>
              <TableCell align="center">Sản phẩm</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.slug}</TableCell>
                <TableCell>{c.parent?.name ?? '-'}</TableCell>
                <TableCell align="center">{c._count?.products ?? 0}</TableCell>
                <TableCell align="center">
                  <Button size="small" variant="outlined" onClick={() => openEdit(c)}>
                    Sửa
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    sx={{ ml: 1 }}
                    onClick={() => handleDeleteClick(c)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* 🟢 Form Thêm/Sửa */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Sửa danh mục' : 'Thêm danh mục mới'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Tên danh mục"
              value={form.name}
              onChange={handleNameChange}
              required
            />
            <TextField label="Slug (tự sinh)" value={form.slug} InputProps={{ readOnly: true }} />
            <TextField
              select
              label="Danh mục cha"
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            >
              <MenuItem value="">(Không có)</MenuItem>
              {categories.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🧩 Dialog xác nhận xóa danh mục */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa danh mục <b>{categoryToDelete?.name}</b> và toàn bộ sản phẩm
            bên trong không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!alert}
        autoHideDuration={2500}
        onClose={() => setAlert(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {alert ? <Alert severity={alert.type}>{alert.msg}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
}

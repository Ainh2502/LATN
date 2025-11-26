import React, { useEffect, useState } from 'react';
import {
  Button, Card, CardContent, Typography, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  Switch, FormControlLabel, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Stack
} from '@mui/material';
import axios from 'axios';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position?: string;
  isActive: boolean;
}

const API_URL = 'http://localhost:3000/banner';

export default function BannerPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    position: '',
    isActive: true,
  });
  const [preview, setPreview] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const fetchBanners = async () => {
    const res = await axios.get(API_URL);
    setBanners(res.data);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ title: '', imageUrl: '', linkUrl: '', position: '', isActive: true });
    setPreview('');
    setFile(null);
    setOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      position: banner.position || '',
      isActive: banner.isActive,
    });
    setPreview(banner.imageUrl);
    setFile(null);
    setOpen(true);
  };

  // 🖼️ Upload file qua MinIO
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = res.data.url;
      setForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));
    } catch (err) {
      alert('Lỗi khi upload ảnh');
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.imageUrl) {
      alert('Vui lòng nhập đầy đủ Tiêu đề và Ảnh!');
      return;
    }
    if (editingId) {
      await axios.patch(`${API_URL}/${editingId}`, form);
    } else {
      await axios.post(API_URL, form);
    }
    setOpen(false);
    fetchBanners();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xác nhận xóa banner này?')) return;
    await axios.delete(`${API_URL}/${id}`);
    fetchBanners();
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>🎏 Quản lý Banner</Typography>
        <Button variant="contained" color="primary" onClick={handleOpenCreate}>
          + Thêm Banner
        </Button>

        {/* --- BẢNG DANH SÁCH --- */}
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ảnh mẫu</TableCell>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Liên kết</TableCell>
                <TableCell>Vị trí</TableCell>
                <TableCell align="center">Hiển thị</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banners.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell>
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      style={{ width: 120, height: 60, objectFit: 'cover', borderRadius: 8 }}
                    />
                  </TableCell>
                  <TableCell>{b.title}</TableCell>
                  <TableCell>
                    {b.linkUrl ? <a href={b.linkUrl} target="_blank" rel="noreferrer">{b.linkUrl}</a> : '-'}
                  </TableCell>
                  <TableCell>{b.position || '-'}</TableCell>
                  <TableCell align="center"><Switch checked={b.isActive} disabled /></TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button variant="outlined" size="small" onClick={() => handleEdit(b)}>Sửa</Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(b.id)}>Xóa</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {banners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">Chưa có banner nào</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* --- DIALOG THÊM/SỬA --- */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingId ? '🖊️ Cập nhật Banner' : '🖼️ Thêm Banner mới'}</DialogTitle>
          <DialogContent>
            <TextField
              label="Tiêu đề"
              fullWidth
              margin="dense"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            {/* --- KHU UPLOAD / NHẬP URL --- */}
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Ảnh banner</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button component="label" variant="outlined">Tải ảnh lên
                <input hidden accept="image/*" type="file" onChange={handleFileChange} />
              </Button>
              <TextField
                label="Hoặc nhập URL ảnh"
                fullWidth
                value={form.imageUrl}
                onChange={(e) => {
                  setForm({ ...form, imageUrl: e.target.value });
                  setPreview(e.target.value);
                }}
              />
            </Stack>

            {/* Preview ảnh */}
            {preview && (
              <img
                src={preview}
                alt="preview"
                style={{ marginTop: 10, width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }}
              />
            )}

            <TextField
              label="Liên kết (linkUrl)"
              fullWidth
              margin="dense"
              value={form.linkUrl}
              onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
            />
            <TextField
              label="Vị trí hiển thị"
              fullWidth
              margin="dense"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
              }
              label="Kích hoạt banner"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Hủy</Button>
            <Button variant="contained" onClick={handleSave}>
              {editingId ? 'Cập nhật' : 'Lưu'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}

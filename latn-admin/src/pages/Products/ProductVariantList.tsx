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
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

export default function ProductVariantList() {
  const { id } = useParams(); // productId
  const navigate = useNavigate();
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [form, setForm] = useState({
    sku: '',
    priceOverride: '',
    optionJson: '',
    stockOnHand: '',
    stockReserved: '',
  });

  // 🧠 Lấy danh sách biến thể
  useEffect(() => {
    if (!id) return;
    api
      .get(`/product-variant?productId=${id}`)
      .then((res) => setVariants(res.data ?? []))
      .catch((err) => console.error('❌ Lỗi tải biến thể:', err))
      .finally(() => setLoading(false));
  }, [id]);

  // 🧩 Mở form thêm/sửa
  const openAddForm = () => {
    setForm({
      sku: '',
      priceOverride: '',
      optionJson: '',
      stockOnHand: '',
      stockReserved: '',
    });
    setEditingVariant(null);
    setOpenForm(true);
  };

  const openEditForm = (variant: any) => {
    setForm({
      sku: variant.sku ?? '',
      priceOverride: variant.priceOverride ?? '',
      optionJson: JSON.stringify(variant.optionJson ?? {}, null, 2),
      stockOnHand: variant.inventory?.stockOnHand ?? '',
      stockReserved: variant.inventory?.stockReserved ?? '',
    });
    setEditingVariant(variant);
    setOpenForm(true);
  };

  // 🧩 Lưu (thêm hoặc sửa)
  const handleSave = async () => {
    try {
      if (!id) return;
      let optionParsed = {};
      try {
        optionParsed =
          typeof form.optionJson === 'string'
            ? JSON.parse(form.optionJson)
            : form.optionJson;
      } catch {
        alert('❌ JSON không hợp lệ trong trường "Thuộc tính"!');
        return;
      }

      const payload = {
        productId: id,
        sku: form.sku,
        priceOverride: form.priceOverride
          ? Number(form.priceOverride)
          : undefined,
        optionJson: optionParsed,
        inventory: {
          stockOnHand: Number(form.stockOnHand) || 0,
          stockReserved: Number(form.stockReserved) || 0,
        },
      };

      if (editingVariant) {
        await api.patch(`/product-variant/${editingVariant.id}`, payload);
      } else {
        await api.post(`/product-variant`, payload);
      }

      const { data } = await api.get(`/product-variant?productId=${id}`);
      setVariants(data ?? []);
      setOpenForm(false);
    } catch (err) {
      console.error('❌ Lỗi lưu biến thể:', err);
      alert('Lỗi khi lưu biến thể!');
    }
  };

  // 🧨 Xóa biến thể
  const handleDelete = async (variantId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa biến thể này không?')) return;
    try {
      await api.delete(`/product-variant/${variantId}`);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
    } catch (err) {
      console.error('❌ Lỗi khi xóa biến thể:', err);
      alert('Không thể xóa biến thể!');
    }
  };

  // 🧩 Helper hiển thị optionJson gọn gàng
  const renderOptions = (opt: any) => {
    if (!opt) return '-';
    if (typeof opt === 'object') {
      return Object.entries(opt)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
    }
    return String(opt);
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h5">Biến thể sản phẩm</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/products')}>
            ← Quay lại
          </Button>
          <Button variant="contained" onClick={openAddForm}>
            + Thêm biến thể
          </Button>
        </Stack>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : variants.length === 0 ? (
        <Typography>Chưa có biến thể nào.</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Thuộc tính</TableCell>
              <TableCell align="right">Giá override</TableCell>
              <TableCell align="right">Tồn kho</TableCell>
              <TableCell align="right">Đặt giữ</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {variants.map((v) => (
              <TableRow key={v.id}>
                <TableCell>{v.id}</TableCell>
                <TableCell>{v.sku}</TableCell>
                <TableCell>{renderOptions(v.optionJson)}</TableCell>
                <TableCell align="right">
                  {v.priceOverride
                    ? v.priceOverride.toLocaleString('vi-VN')
                    : '-'}
                </TableCell>
                <TableCell align="right">
                  {v.inventory?.stockOnHand ?? 0}
                </TableCell>
                <TableCell align="right">
                  {v.inventory?.stockReserved ?? 0}
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => openEditForm(v)}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    sx={{ ml: 1 }}
                    onClick={() => handleDelete(v.id)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* 🟩 Dialog thêm/sửa */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingVariant ? 'Sửa biến thể' : 'Thêm biến thể mới'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            <TextField
              label="Giá override"
              type="number"
              value={form.priceOverride}
              onChange={(e) =>
                setForm({ ...form, priceOverride: e.target.value })
              }
            />
            <TextField
              label="Thuộc tính (JSON)"
              multiline
              minRows={3}
              value={form.optionJson}
              onChange={(e) =>
                setForm({ ...form, optionJson: e.target.value })
              }
              helperText='VD: {"size":"M","color":"Red"}'
            />
            <TextField
              label="Tồn kho (stockOnHand)"
              type="number"
              value={form.stockOnHand}
              onChange={(e) =>
                setForm({ ...form, stockOnHand: e.target.value })
              }
            />
            <TextField
              label="Đặt giữ (stockReserved)"
              type="number"
              value={form.stockReserved}
              onChange={(e) =>
                setForm({ ...form, stockReserved: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

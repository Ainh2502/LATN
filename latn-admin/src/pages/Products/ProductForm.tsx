import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogActions,
  IconButton,
  Tooltip,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../api/axios';

// 🧩 Tạo slug tự động
function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    price: '',
    compareAt: '',
    shortDesc: '',
    longDesc: '',
    brandId: '',
    categoryId: '',
    status: 'PUBLISHED',
  });

  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<{ id?: string; url: string }[]>([]);
  const [imageInputs, setImageInputs] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // 🧠 Tải sản phẩm khi chỉnh sửa
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/product/${id}`);
        setForm({
          name: data.name ?? '',
          slug: data.slug ?? '',
          price: data.price ?? '',
          compareAt: data.compareAt ?? '',
          shortDesc: data.shortDesc ?? '',
          longDesc: data.longDesc ?? '',
          brandId: data.brandId ?? '',
          categoryId: data.categoryId ?? '',
          status: data.status ?? 'PUBLISHED',
        });
        setImages(data.images ?? []);
      } catch (err) {
        console.error('❌ Lỗi tải sản phẩm:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  // 🧩 Load brand & category
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandRes, categoryRes] = await Promise.all([
          api.get('/brand'),
          api.get('/category'),
        ]);
        setBrands(brandRes.data);
        setCategories(categoryRes.data);
      } catch (err) {
        console.error('❌ Lỗi load brand/category:', err);
      }
    };
    fetchData();
  }, []);

  // 🧠 Tự sinh slug khi nhập tên
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      const slug = generateSlug(value);
      setForm((prev) => ({ ...prev, name: value, slug }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 🧩 Xử lý ảnh link động
  const handleImageLinkChange = (index: number, value: string) => {
    const newImages = [...imageInputs];
    newImages[index] = value;

    if (index === newImages.length - 1 && value.trim() !== '') newImages.push('');
    if (value.trim() === '' && index < newImages.length - 1) {
      while (newImages.length > 1 && newImages[newImages.length - 1] === '') {
        newImages.pop();
      }
    }
    setImageInputs(newImages);
  };

  // 🧩 Upload ảnh từ máy
const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFiles = e.target.files;
  if (!selectedFiles || selectedFiles.length === 0) return;

  try {
    setLoading(true);

    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => formData.append('files', file));

    // ⚙️ Nếu chưa tạo sản phẩm thì chỉ preview tạm
    if (!id) {
      const previewUrls = Array.from(selectedFiles).map((file) =>
        URL.createObjectURL(file)
      );

      setImages((prev) => {
        const existing = new Set(prev.map((img) => img.url));
        const unique = previewUrls.filter((url) => !existing.has(url));
        return [...prev, ...unique.map((url) => ({ id: crypto.randomUUID(), url }))];
      });

      return;
    }

    // ⚙️ Nếu đang chỉnh sửa → upload thật
    const res = await api.post(`/product/${id}/images/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const newUrls: string[] = res.data.urls || [];

    // ✅ Thêm ảnh mới, tránh trùng
    setImages((prev) => {
      const existing = new Set(prev.map((img) => img.url));
      const uniqueNew = newUrls.filter((url) => !existing.has(url));
      return [
        ...prev,
        ...uniqueNew.map((url) => ({ id: crypto.randomUUID(), url })),
      ];
    });
  } catch (err) {
    console.error('❌ Lỗi upload ảnh:', err);
    alert('Upload thất bại, vui lòng thử lại!');
  } finally {
    setLoading(false);
  }
};

// 🧩 Lưu sản phẩm + thêm ảnh link
const handleSubmit = async () => {
  try {
    setLoading(true);

    let productId = id;
    let res;

    const payload = {
      ...form,
      price: Number(form.price),
      compareAt: form.compareAt ? Number(form.compareAt) : null,
    };

    // 🟢 1️⃣ Lưu hoặc cập nhật sản phẩm
    if (isEdit) {
      await api.patch(`/product/${productId}`, payload);
    } else {
      res = await api.post('/product', payload);
      productId = res.data.id; // ✅ Lấy id mới khi tạo sản phẩm mới
    }

    // 🟡 2️⃣ Gửi link ảnh lên backend (nếu có)
    const validLinks = imageInputs.filter((url) => url.trim() !== '');
    if (validLinks.length > 0) {
      await api.post(`/product/${productId}/images/add-link`, {
        urls: validLinks,
      });
    }

    // ✅ 3️⃣ Thông báo và điều hướng
    setSuccess(true);
    setTimeout(() => navigate('/products'), 1500);
  } catch (err) {
    console.error('❌ Lỗi lưu sản phẩm:', err);
    setError(true);
  } finally {
    setLoading(false);
  }
};




  // 🧨 Xóa sản phẩm
  const handleDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/product/${id}`);
      setOpenDelete(false);
      alert('🗑️ Đã xóa sản phẩm thành công!');
      navigate('/products');
    } catch (err) {
      console.error('❌ Lỗi khi xóa sản phẩm:', err);
      alert('Lỗi khi xóa sản phẩm!');
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Xóa ảnh
  const handleDeleteImage = async (imageId?: string) => {
    if (!id || !imageId) return;
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này không?')) return;
    try {
      await api.delete(`/product/${id}/images/${imageId}`);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error('❌ Lỗi khi xóa ảnh:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
      </Typography>

      <Stack spacing={2} sx={{ maxWidth: 600 }}>
        {/* ===== Thông tin cơ bản ===== */}
        <TextField label="Tên sản phẩm" name="name" value={form.name} onChange={handleChange} required />
        <TextField label="Slug (tự sinh)" name="slug" value={form.slug} InputProps={{ readOnly: true }} />
        <TextField label="Giá bán" name="price" type="number" value={form.price} onChange={handleChange} />
        <TextField label="Giá gốc (so sánh)" name="compareAt" type="number" value={form.compareAt} onChange={handleChange} />
        <TextField label="Mô tả ngắn" name="shortDesc" value={form.shortDesc} onChange={handleChange} multiline rows={2} />
        <TextField label="Mô tả chi tiết" name="longDesc" value={form.longDesc} onChange={handleChange} multiline rows={4} />

        {/* 🏷️ Dropdown chọn Thương hiệu */}
        <FormControl fullWidth>
          <InputLabel>Thương hiệu</InputLabel>
          <Select
            value={form.brandId || ''}
            label="Thương hiệu"
            onChange={(e) => setForm({ ...form, brandId: e.target.value })}
          >
            {brands.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 🗂️ Dropdown chọn Danh mục */}
        <FormControl fullWidth>
          <InputLabel>Danh mục</InputLabel>
          <Select
            value={form.categoryId || ''}
            label="Danh mục"
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 🏷️ Trạng thái */}
        <TextField select label="Trạng thái" name="status" value={form.status} onChange={handleChange}>
          <MenuItem value="DRAFT">Nháp</MenuItem>
          <MenuItem value="PUBLISHED">Công khai</MenuItem>
          <MenuItem value="HIDDEN">Ẩn</MenuItem>
        </TextField>

        {/* ===== Ảnh từ link ===== */}
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Ảnh từ link (tự thêm ô khi nhập hoặc khi upload)
        </Typography>

        <Stack spacing={1}>
          {imageInputs.map((link, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                label={`Ảnh ${index + 1}`}
                value={link}
                onChange={(e) => handleImageLinkChange(index, e.target.value)}
                placeholder="Dán link ảnh vào đây"
                fullWidth
              />
              {link.trim() && (
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={link}
                    alt={`Ảnh ${index + 1}`}
                    width="100%"
                    height="100%"
                    style={{ objectFit: 'cover' }}
                    onError={(e) =>
                      ((e.currentTarget as HTMLImageElement).src =
                        'https://via.placeholder.com/60x60?text=Error')
                    }
                  />
                </Box>
              )}
            </Box>
          ))}
        </Stack>

{/* 🖼️ Upload file */}
<Button variant="outlined" component="label">
  Chọn ảnh từ máy
  <input type="file" hidden multiple onChange={handleFileSelect} />
</Button>

{/* 🖼️ Hiển thị ảnh hiện có */}
{images.length > 0 && (
  <Stack direction="row" spacing={1} flexWrap="wrap" mt={2}>
    {images.map((img) => (
      <Box key={img.id} sx={{ position: 'relative' }}>
        <img
          src={img.url}
          alt="product"
          width={90}
          height={90}
          style={{
            borderRadius: 6,
            objectFit: 'cover',
            border: '1px solid #ccc',
          }}
        />
        <Tooltip title="Xóa ảnh này">
          <IconButton
            size="small"
            color="error"
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: '#fff',
            }}
            onClick={() => handleDeleteImage(img.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ))}
  </Stack>
)}


        {/* ===== Nút hành động ===== */}
        <Stack direction="row" spacing={2} mt={2}>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : isEdit ? 'Cập nhật' : 'Tạo sản phẩm'}
          </Button>

          {isEdit && (
            <Button variant="outlined" color="error" onClick={() => setOpenDelete(true)}>
              Xóa
            </Button>
          )}

          <Button variant="text" onClick={() => navigate('/products')}>
            Hủy
          </Button>
        </Stack>
      </Stack>

      {/* Snackbar */}
      <Snackbar open={success} autoHideDuration={2000} onClose={() => setSuccess(false)}>
        <Alert severity="success">✅ Lưu sản phẩm thành công!</Alert>
      </Snackbar>

      <Snackbar open={error} autoHideDuration={2000} onClose={() => setError(false)}>
        <Alert severity="error">❌ Lỗi khi lưu sản phẩm!</Alert>
      </Snackbar>

      {/* Dialog xác nhận xóa */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Bạn có chắc muốn xóa sản phẩm này không?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Hủy</Button>
          <Button color="error" onClick={handleDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

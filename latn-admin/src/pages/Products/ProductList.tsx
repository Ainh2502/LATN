// src/pages/Products/ProductList.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InventoryIcon from "@mui/icons-material/Inventory";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";

export default function ProductList() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    name: "",
    brand: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    sortOrder: "desc",
  });

  // 🧭 Nạp thương hiệu & danh mục
  useEffect(() => {
    (async () => {
      try {
        const [b, c] = await Promise.all([api.get("/brand"), api.get("/category")]);
        setBrands(b.data);
        setCategories(c.data);
      } catch (e) {
        console.error("Lỗi tải danh mục/brand:", e);
      }
    })();
  }, []);

  // 📦 Gọi API sản phẩm
  const fetchProducts = async (params: Record<string, any> = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/product", { params });
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setProducts(data);
    } catch (err) {
      console.error("❌ Lỗi tải sản phẩm:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Lần đầu load
  useEffect(() => {
    fetchProducts();
  }, []);

  // 🎯 Khi bấm lọc
  const handleFilter = () => {
    const params: Record<string, any> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    fetchProducts(params);
  };

  // 🔄 Làm mới
  const handleReset = () => {
    setFilters({
      name: "",
      brand: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      sortOrder: "desc",
    });
    fetchProducts();
  };

  // 🗑️ Xóa sản phẩm
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này không?")) return;
    try {
      await api.delete(`/product/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert("❌ Không thể xóa sản phẩm!");
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Quản lý sản phẩm
      </Typography>
  <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("new")} // ✅ tương đối, khớp route "products/new"
        >
          Thêm mới
        </Button>
      {/* 🎛️ Bộ lọc */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
            <TextField
              placeholder="Tên sản phẩm"
              size="small"
              value={filters.name}
              onChange={(e) => setFilters((s) => ({ ...s, name: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 240 }}
            />

            <TextField
              select
              size="small"
              label="Thương hiệu"
              value={filters.brand}
              onChange={(e) => setFilters((s) => ({ ...s, brand: e.target.value }))}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {brands.map((b) => (
                <MenuItem key={b.id} value={b.name}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Danh mục"
              value={filters.category}
              onChange={(e) => setFilters((s) => ({ ...s, category: e.target.value }))}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              label="Giá từ"
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters((s) => ({ ...s, minPrice: e.target.value }))}
              sx={{ width: 130 }}
            />
            <TextField
              size="small"
              label="Đến"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters((s) => ({ ...s, maxPrice: e.target.value }))}
              sx={{ width: 130 }}
            />

            <Button variant="contained" startIcon={<FilterAltIcon />} onClick={handleFilter}>
              LỌC
            </Button>
            <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={handleReset}>
              LÀM MỚI
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* 🧾 Danh sách sản phẩm */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box py={8} textAlign="center">
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ảnh</TableCell>
                  <TableCell>Tên sản phẩm</TableCell>
                  <TableCell>Thương hiệu</TableCell>
                  <TableCell>Danh mục</TableCell>
                  <TableCell align="right">Giá bán</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell align="center">Tùy chọn</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length > 0 ? (
                  products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <img
                          src={p.images?.[0]?.url ?? "https://via.placeholder.com/80"}
                          alt={p.name}
                          style={{ width: 70, height: 70, borderRadius: 8, objectFit: "cover" }}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 240 }}>
                        <Typography fontWeight={600}>{p.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {p.shortDesc || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>{p.brand?.name ?? "-"}</TableCell>
                      <TableCell>{p.category?.name ?? "-"}</TableCell>
                      <TableCell align="right">
                        {p.price?.toLocaleString("vi-VN")} ₫
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={p.status}
                          color={p.status === "PUBLISHED" ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<InventoryIcon />}
                            onClick={() => navigate(`/products/${p.id}/variants`)}
                          >
                            Biến thể
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => navigate(`${p.id}`)}
                          >
                            Sửa
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(p.id)}
                          >
                            Xóa
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      Không có sản phẩm phù hợp.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

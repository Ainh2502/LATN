import React, { useEffect, useState } from "react";
import {
  Drawer, Box, Typography, TextField, MenuItem, Button,
  Autocomplete, Stack, Divider, IconButton,
} from "@mui/material";
import { Close, FilterAlt } from "@mui/icons-material";
import api from "../api/axios";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, any>) => void;
  initialFilters?: Record<string, any>;          // ✅ nhận initial filters (theo TÊN)
}

export default function FilterDrawer({ open, onClose, onApply, initialFilters }: FilterDrawerProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    name: "",
    category: "",
    brand: "",
    color: "",
    size: "",
    minPrice: "",
    maxPrice: "",
    sortOrder: "desc",
  });

  // ✅ đổ initialFilters (toàn bộ là TÊN) vào form khi mở
  useEffect(() => {
    if (initialFilters) {
      setFilters((prev) => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  useEffect(() => {
    Promise.all([api.get("/category"), api.get("/brand"), api.get("/product/colors"), api.get("/product/sizes")])
      .then(([cat, br, co, si]) => {
        setCategories((cat.data || []).map((c: any) => c.name));
        setBrands((br.data || []).map((b: any) => b.name));
        setColors(co.data ?? []);
        setSizes(si.data ?? []);
      })
      .catch(console.error);
  }, []);

  const handleApply = () => {
    const clean: Record<string, any> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== "" && v != null) clean[k] = v;
    });
    onApply(clean);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      name: "",
      category: "",
      brand: "",
      color: "",
      size: "",
      minPrice: "",
      maxPrice: "",
      sortOrder: "desc",
    });
    onApply({});
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 400 }, p: 3, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 } }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight="bold">Bộ lọc sản phẩm</Typography>
        <IconButton onClick={onClose}><Close /></IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={2}>
        <TextField
          label="Tên sản phẩm"
          placeholder="Nhập tên sản phẩm"
          value={filters.name}
          onChange={(e) => setFilters((p) => ({ ...p, name: e.target.value }))}
          fullWidth
        />

        <Autocomplete
          options={categories}
          value={filters.category || null}
          onChange={(_, v) => setFilters((p) => ({ ...p, category: v || "" }))}
          renderInput={(params) => <TextField {...params} label="Danh mục" placeholder="Chọn danh mục" />}
        />

        <Autocomplete
          options={brands}
          value={filters.brand || null}
          onChange={(_, v) => setFilters((p) => ({ ...p, brand: v || "" }))}
          renderInput={(params) => <TextField {...params} label="Thương hiệu" placeholder="Chọn thương hiệu" />}
        />

        <Box display="flex" gap={2}>
          <TextField
            label="Giá từ" type="number" value={filters.minPrice}
            onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value }))} fullWidth
          />
          <TextField
            label="Đến" type="number" value={filters.maxPrice}
            onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value }))} fullWidth
          />
        </Box>

        <Autocomplete
          options={colors}
          value={filters.color || null}
          onChange={(_, v) => setFilters((p) => ({ ...p, color: v || "" }))}
          renderInput={(params) => <TextField {...params} label="Màu sắc" placeholder="Chọn màu sắc" />}
        />

        <Autocomplete
          options={sizes}
          value={filters.size || null}
          onChange={(_, v) => setFilters((p) => ({ ...p, size: v || "" }))}
          renderInput={(params) => <TextField {...params} label="Kích thước" placeholder="Chọn kích thước" />}
        />

        <TextField
          select label="Sắp xếp theo ngày tạo" value={filters.sortOrder}
          onChange={(e) => setFilters((p) => ({ ...p, sortOrder: e.target.value }))}
          fullWidth
        >
          <MenuItem value="desc">Mới nhất</MenuItem>
          <MenuItem value="asc">Cũ nhất</MenuItem>
        </TextField>
      </Stack>

      <Box mt={4}>
        <Button variant="contained" startIcon={<FilterAlt />} fullWidth sx={{ py: 1.4, fontWeight: 600, borderRadius: 2 }}
          onClick={handleApply}>
          Áp dụng bộ lọc
        </Button>

        <Button variant="outlined" fullWidth sx={{ py: 1.3, mt: 1.2, fontWeight: 600, borderRadius: 3 }}
          onClick={handleReset}>
          Đặt lại bộ lọc
        </Button>
      </Box>
    </Drawer>
  );
}

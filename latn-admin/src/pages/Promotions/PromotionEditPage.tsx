import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  MenuItem,
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Autocomplete } from "@mui/material";
import api from "../../api/axios";

export default function PromotionEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    name: "",
    type: "fixed",
    value: 0,
    startAt: "",
    endAt: "",
    usageLimit: null,
    status: "ACTIVE",
    scopeJson: {
      categoryIds: [],
      brandIds: [],
      minPrice: "",
      maxPrice: "",
    },
  });

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const isHtmlResponse = (data: any) =>
    typeof data === "string" && data.startsWith("<!doctype html>");

  // ===== FETCH DATA (create / edit) =====
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // luôn tải brand + category cho cả chế độ tạo mới
        const [catRes, brandRes] = await Promise.all([
          api.get("/category"),
          api.get("/brand"),
        ]);
        const catList = Array.isArray(catRes.data) ? catRes.data : [];
        const brandList = Array.isArray(brandRes.data) ? brandRes.data : [];
        setCategories(catList);
        setBrands(brandList);

        // nếu có id => chế độ chỉnh sửa: tải thêm chi tiết promotion
        if (id) {
          const promoRes = await api.get(`/promotions/${id}`);
          if (isHtmlResponse(promoRes.data))
            throw new Error("Invalid API response");

          const p = promoRes.data;
          setForm({
            name: p.name ?? "",
            type: p.type ?? "fixed",
            value: p.value ?? 0,
            startAt: p.startAt?.substring(0, 10) ?? "",
            endAt: p.endAt?.substring(0, 10) ?? "",
            usageLimit: p.usageLimit ?? null,
            status: p.status ?? "ACTIVE",
            scopeJson: {
              categoryIds: p.scopeJson?.categoryIds ?? [],
              brandIds: p.scopeJson?.brandIds ?? [],
              minPrice: p.scopeJson?.minPrice ?? "",
              maxPrice: p.scopeJson?.maxPrice ?? "",
            },
          });
        }
      } catch (e) {
        console.error(e);
        setErr("Không thể tải dữ liệu khuyến mãi.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ===== HANDLERS =====
  const handleChange = (key: string, val: any) => {
    setForm((prev: any) => ({ ...prev, [key]: val }));
  };

  const handleScopeChange = (key: string, val: any) => {
    setForm((prev: any) => ({
      ...prev,
      scopeJson: { ...prev.scopeJson, [key]: val },
    }));
  };

  const handleSave = async () => {
    try {
      setMsg(null);
      setErr(null);

      const payload = {
        ...form,
        value: Number(form.value),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      };

      if (id) {
        // edit
        await api.patch(`/promotions/${id}`, payload);
        setMsg("✅ Đã cập nhật khuyến mãi!");
      } else {
        // create
        await api.post(`/promotions`, payload);
        setMsg("✅ Đã tạo khuyến mãi mới!");
      }

      setTimeout(() => navigate("/promotions"), 1200);
    } catch (e: any) {
      console.error(e);
      setErr(e?.response?.data?.message ?? "Lỗi khi lưu khuyến mãi.");
    }
  };

  // ===== SELECTED =====
  const selectedCategories = useMemo(
    () =>
      categories.filter((c) => form.scopeJson.categoryIds.includes(c.id)),
    [categories, form.scopeJson.categoryIds]
  );

  const selectedBrands = useMemo(
    () => brands.filter((b) => form.scopeJson.brandIds.includes(b.id)),
    [brands, form.scopeJson.brandIds]
  );

  // ===== RENDER =====
  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={3}>
      <Paper sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h5" mb={2}>
          {id ? "Chỉnh sửa khuyến mãi" : "Tạo khuyến mãi mới"}
        </Typography>

        {msg && <Alert severity="success">{msg}</Alert>}
        {err && <Alert severity="error">{err}</Alert>}

        <TextField
          label="Tên chương trình"
          fullWidth
          sx={{ mt: 2 }}
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />

        <TextField
          label="Loại giảm giá"
          select
          fullWidth
          sx={{ mt: 2 }}
          value={form.type}
          onChange={(e) => handleChange("type", e.target.value)}
        >
          <MenuItem value="fixed">Giảm cố định (₫)</MenuItem>
          <MenuItem value="percentage">Giảm phần trăm (%)</MenuItem>
        </TextField>

        <TextField
          label="Giá trị giảm"
          type="number"
          fullWidth
          sx={{ mt: 2 }}
          value={form.value}
          onChange={(e) => handleChange("value", e.target.value)}
        />

      <TextField
  label="Ngày bắt đầu"
  type="date"
  fullWidth
  sx={{ mt: 2 }}
  value={form.startAt}
  onChange={(e) => handleChange("startAt", e.target.value)}
  InputLabelProps={{ shrink: true }} // ✅ thêm dòng này
/>

<TextField
  label="Ngày kết thúc"
  type="date"
  fullWidth
  sx={{ mt: 2 }}
  value={form.endAt}
  onChange={(e) => handleChange("endAt", e.target.value)}
  InputLabelProps={{ shrink: true }} // ✅ thêm dòng này
/>


        <TextField
          label="Giới hạn lượt dùng"
          type="number"
          fullWidth
          sx={{ mt: 2 }}
          value={form.usageLimit ?? ""}
          onChange={(e) => handleChange("usageLimit", e.target.value)}
        />

        <TextField
          label="Trạng thái"
          select
          fullWidth
          sx={{ mt: 2 }}
          value={form.status}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <MenuItem value="ACTIVE">ACTIVE</MenuItem>
          <MenuItem value="INACTIVE">INACTIVE</MenuItem>
          <MenuItem value="EXPIRED">EXPIRED</MenuItem>
        </TextField>

        <Typography variant="h6" mt={4}>
          Điều kiện áp dụng
        </Typography>

        <Autocomplete
          multiple
          options={categories}
          getOptionLabel={(o) => o.name}
          disableCloseOnSelect
          value={selectedCategories}
          onChange={(_, val) =>
            handleScopeChange("categoryIds", val.map((v) => v.id))
          }
          renderTags={(value, getTagProps) =>
            value.map((opt, i) => (
              <Chip label={opt.name} {...getTagProps({ index: i })} key={opt.id} />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} label="Danh mục áp dụng" sx={{ mt: 2 }} />
          )}
        />

        <Autocomplete
          multiple
          options={brands}
          getOptionLabel={(o) => o.name}
          disableCloseOnSelect
          value={selectedBrands}
          onChange={(_, val) =>
            handleScopeChange("brandIds", val.map((v) => v.id))
          }
          renderTags={(value, getTagProps) =>
            value.map((opt, i) => (
              <Chip label={opt.name} {...getTagProps({ index: i })} key={opt.id} />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} label="Thương hiệu áp dụng" sx={{ mt: 2 }} />
          )}
        />

        <TextField
          label="Giá tối thiểu (Min Price)"
          type="number"
          fullWidth
          sx={{ mt: 2 }}
          value={form.scopeJson.minPrice}
          onChange={(e) => handleScopeChange("minPrice", e.target.value)}
        />

        <TextField
          label="Giá tối đa (Max Price)"
          type="number"
          fullWidth
          sx={{ mt: 2 }}
          value={form.scopeJson.maxPrice}
          onChange={(e) => handleScopeChange("maxPrice", e.target.value)}
        />

        <Box textAlign="right" mt={3}>
          <Button onClick={() => navigate("/promotions")}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>
            Lưu
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

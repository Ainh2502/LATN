import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import api from "../../api/axios";
import dayjs from "dayjs";

export default function CouponEditPage() {
  const { id } = useParams(); // id ở đây chính là code (VD: /coupons/AIAH9OFF/edit)
  const nav = useNavigate();

  const [loading, setLoading] = useState<boolean>(!!id);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [coupon, setCoupon] = useState<any>({
    code: "",
    type: "fixed",
    value: "",
    minOrderTotal: "",
    startAt: "",
    endAt: "",
    maxUses: "",
    userLimit: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/coupon/${id}`); // ✅ backend dùng code
        const c = res.data;
        if (!c) throw new Error("Không tìm thấy voucher");

        setCoupon({
          code: c.code ?? "",
          type: c.type ?? "fixed",
          value: c.value ?? "",
          minOrderTotal: c.minOrderTotal ?? "",
          startAt: c.startAt ? dayjs(c.startAt).format("YYYY-MM-DD") : "",
          endAt: c.endAt ? dayjs(c.endAt).format("YYYY-MM-DD") : "",
          maxUses: c.maxUses ?? "",
          userLimit: c.userLimit ?? "",
          status: c.status ?? "ACTIVE",
        });
      } catch (e) {
        console.error(e);
        setErr("Không thể tải voucher hoặc không tồn tại.");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
    else setLoading(false);
  }, [id]);

  const handleChange = (key: string, val: any) =>
    setCoupon((prev: any) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    try {
      setMsg(null);
      setErr(null);

      const payload = {
        ...coupon,
        value: Number(coupon.value),
        minOrderTotal: coupon.minOrderTotal ? Number(coupon.minOrderTotal) : null,
        maxUses: coupon.maxUses ? Number(coupon.maxUses) : null,
        userLimit: coupon.userLimit ? Number(coupon.userLimit) : null,
      };

      if (id) {
        // ✅ Cập nhật theo code
        await api.patch(`/coupon/${id}`, payload);
        setMsg("✅ Đã lưu voucher thành công!");
      } else {
        // ✅ Tạo mới
        await api.post(`/coupon`, payload);
        setMsg("✅ Đã tạo voucher mới!");
      }

      setTimeout(() => nav("/promotions"), 900);
    } catch (e: any) {
      console.error(e);
      setErr(e?.response?.data?.message ?? "Không thể lưu voucher.");
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={3}>
      <Paper sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          {id ? "Chỉnh sửa Voucher / Mã giảm giá" : "Tạo Voucher mới"}
        </Typography>

        {msg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {msg}
          </Alert>
        )}
        {err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err}
          </Alert>
        )}

        <TextField
          label="Mã voucher"
          fullWidth
          sx={{ mb: 2 }}
          value={coupon.code}
          onChange={(e) => handleChange("code", e.target.value)}
          disabled={!!id} // ✅ không cho đổi mã khi đang sửa
        />

        <TextField
          select
          label="Loại giảm giá"
          fullWidth
          sx={{ mb: 2 }}
          value={coupon.type}
          onChange={(e) => handleChange("type", e.target.value)}
        >
          <MenuItem value="fixed">Giảm cố định (VNĐ)</MenuItem>
          <MenuItem value="percentage">Giảm phần trăm (%)</MenuItem>
        </TextField>

        <TextField
          label="Giá trị giảm"
          fullWidth
          type="number"
          sx={{ mb: 2 }}
          value={coupon.value}
          onChange={(e) => handleChange("value", e.target.value)}
        />

        <TextField
          label="Đơn hàng tối thiểu (minOrderTotal)"
          fullWidth
          type="number"
          sx={{ mb: 2 }}
          value={coupon.minOrderTotal}
          onChange={(e) => handleChange("minOrderTotal", e.target.value)}
        />

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Ngày bắt đầu"
            type="date"
            fullWidth
            value={coupon.startAt}
            onChange={(e) => handleChange("startAt", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Ngày kết thúc"
            type="date"
            fullWidth
            value={coupon.endAt}
            onChange={(e) => handleChange("endAt", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Giới hạn tổng lượt (maxUses)"
            fullWidth
            type="number"
            value={coupon.maxUses}
            onChange={(e) => handleChange("maxUses", e.target.value)}
          />
          <TextField
            label="Giới hạn mỗi user (userLimit)"
            fullWidth
            type="number"
            value={coupon.userLimit}
            onChange={(e) => handleChange("userLimit", e.target.value)}
          />
        </Box>

        <TextField
          select
          label="Trạng thái"
          fullWidth
          sx={{ mb: 2 }}
          value={coupon.status}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <MenuItem value="ACTIVE">ACTIVE</MenuItem>
          <MenuItem value="EXPIRED">EXPIRED</MenuItem>
          <MenuItem value="DISABLED">DISABLED</MenuItem>
        </TextField>

        <Box textAlign="right">
          <Button onClick={() => nav("/promotions")}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>
            Lưu
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

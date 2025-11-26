import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import AddLocationAltOutlined from "@mui/icons-material/AddLocationAltOutlined";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { formatCurrency } from "../utils/formatCurrency";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressId, setAddressId] = useState<string>("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [payMethod, setPayMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });

  const { user } = useAuth();
  const { clear } = useCart();
  const navigate = useNavigate();

  // 🧩 Load giỏ hàng + địa chỉ
  const loadAll = async () => {
    setLoading(true);
    try {
      const [cartRes, addrRes] = await Promise.all([
        api.get("/cart"),
        api.get("/address"),
      ]);
      setCart(cartRes.data);
      setAddresses(addrRes.data);

      const def =
        addrRes.data.find((a: any) => a.isDefault) || addrRes.data[0];
      if (def) {
        console.log("📍 Địa chỉ mặc định:", def.id);
        setAddressId(def.id);
      }
    } catch (e: any) {
      setSnack({
        open: true,
        message: e?.response?.data?.message || "Lỗi tải dữ liệu",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // 🧮 Tổng tiền gốc
  const subtotal = useMemo(() => {
    if (!cart) return 0;
    return cart.items.reduce((sum: number, i: any) => {
      const product = i.variant?.product;
      const price =
        i.priceSnap === 0 || product?.price === 0
          ? 0
          : i.priceSnap ?? product?.price ?? 0;
      return sum + price * (i.quantity ?? 1);
    }, 0);
  }, [cart]);

  // 💸 Tính tổng sau khi giảm
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "percentage") {
      return Math.round(subtotal * (appliedCoupon.value / 100));
    } else if (appliedCoupon.type === "fixed") {
      return Math.min(appliedCoupon.value, subtotal);
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  const total = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);

  // 🎟️ Áp mã giảm giá
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setSnack({
        open: true,
        message: "Nhập mã coupon trước đã.",
        severity: "info",
      });
      return;
    }

    // 🚫 Đã có coupon rồi thì chặn
    if (appliedCoupon) {
      setSnack({
        open: true,
        message: "⚠️ Chỉ được áp dụng 1 mã giảm giá mỗi đơn hàng",
        severity: "warning" as any,
      });
      return;
    }

    setCheckingCoupon(true);
    try {
      const { data } = await api.get(`/coupon/${encodeURIComponent(couponCode.trim())}`);
      setAppliedCoupon(data);
      setSnack({
        open: true,
        message: `Đã áp mã ${data.code}`,
        severity: "success",
      });
    } catch (e: any) {
      setAppliedCoupon(null);
      setSnack({
        open: true,
        message: e?.response?.data?.message || "Mã không hợp lệ",
        severity: "error",
      });
    } finally {
      setCheckingCoupon(false);
    }
  };

  // ❌ Xóa mã giảm giá
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setSnack({
      open: true,
      message: "Đã gỡ mã giảm giá",
      severity: "info",
    });
  };

  // 🧾 Đặt hàng
  const placeOrder = async () => {
    if (!user) {
      setSnack({
        open: true,
        message: "Vui lòng đăng nhập để đặt hàng.",
        severity: "info",
      });
      navigate("/login");
      return;
    }

    if (!cart || cart.items.length === 0) {
      setSnack({
        open: true,
        message: "Giỏ hàng trống.",
        severity: "info",
      });
      return;
    }

    if (!addressId) {
      setSnack({
        open: true,
        message: "Vui lòng chọn địa chỉ giao hàng.",
        severity: "info",
      });
      return;
    }

    const items = (cart.items || [])
      .filter((i: any) => i.variantId && i.quantity > 0)
      .map((i: any) => ({
        variantId: i.variantId,
        quantity: Number(i.quantity),
      }));

    const body = {
      addressId,
      items,
      paymentMethod: payMethod,
      couponCode: appliedCoupon?.code || undefined,
    };

    console.log("📦 Body gửi đi /order:", JSON.stringify(body, null, 2));

    if (!items.length) {
      setSnack({
        open: true,
        message: "Không có sản phẩm hợp lệ trong giỏ hàng.",
        severity: "error",
      });
      return;
    }

        setPlacing(true);
    try {
      const orderRes = await api.post("/order", body);
      const order = orderRes.data?.order ?? orderRes.data;

      // 💳 Nếu chọn thanh toán online → gọi VNPAY
      if (payMethod === "ONLINE") {
        const payRes = await api.post("/payment/public/vnpay/create", {
          orderId: order.id,
          amount: total,
        });

        // ✅ Dùng đúng link backend trả về (chuẩn service PaymentController)
        const paymentUrl = payRes.data?.paymentUrl;

        if (paymentUrl) {
          console.log("🔗 Redirecting to VNPAY:", paymentUrl);
          window.location.href = paymentUrl; // chuyển sang sandbox
          return;
        } else {
          throw new Error("Không nhận được paymentUrl từ server");
        }
      }

      // 🧺 Nếu là COD → clear giỏ hàng + chuyển trang
      await clear();
      setSnack({
        open: true,
        message: "🧾 Đặt hàng thành công!",
        severity: "success",
      });
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (e: any) {
      console.error("❌ Lỗi tạo đơn hàng:", e.response?.data || e.message);
      setSnack({
        open: true,
        message: e?.response?.data?.message || "Không thể tạo đơn hàng",
        severity: "error",
      });
    } finally {
      setPlacing(false);
    }

  };

  // 🌀 Loading
  if (loading)
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );

  // ======================== Giao diện ========================
  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", px: 2, py: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
        Xác nhận thanh toán
      </Typography>

      {/* === ĐỊA CHỈ === */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            Địa chỉ giao hàng
          </Typography>
          <Box>
            <IconButton size="small" onClick={loadAll}>
              <RefreshOutlined />
            </IconButton>
            <Button
              startIcon={<AddLocationAltOutlined />}
              size="small"
              sx={{ ml: 1 }}
              onClick={() => navigate("/profile?tab=addresses")}
            >
              Quản lý địa chỉ
            </Button>
          </Box>
        </Box>

        <RadioGroup
          sx={{ mt: 1 }}
          value={addressId}
          onChange={(e) => setAddressId(e.target.value)}
        >
          {addresses.length === 0 ? (
            <Typography color="text.secondary">
              Chưa có địa chỉ. Hãy thêm địa chỉ giao hàng.
            </Typography>
          ) : (
            addresses.map((a) => (
              <FormControlLabel
                key={a.id}
                value={a.id}
                control={<Radio />}
                label={`${a.recipient} • ${a.phone} — ${a.street}, ${a.ward}, ${a.district}, ${a.province}`}
              />
            ))
          )}
        </RadioGroup>
      </Paper>

      {/* === COUPON & THANH TOÁN === */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={1}>
          Mã giảm giá & Phương thức thanh toán
        </Typography>
        <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            label="Nhập mã coupon"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            disabled={!!appliedCoupon}
          />
          <Button
            variant="outlined"
            onClick={appliedCoupon ? removeCoupon : applyCoupon}
            disabled={checkingCoupon}
          >
            {appliedCoupon ? "Gỡ mã" : "Áp mã"}
          </Button>
          {appliedCoupon && (
            <Typography ml={1} color="success.main">
              Đã áp dụng: <b>{appliedCoupon.code}</b>
            </Typography>
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
        <RadioGroup
          row
          value={payMethod}
          onChange={(e) => setPayMethod(e.target.value)}
        >
          <FormControlLabel
            value="COD"
            control={<Radio />}
            label="Thanh toán khi nhận hàng (COD)"
          />
          <FormControlLabel
            value="ONLINE"
            control={<Radio />}
            label="Thanh toán online"
          />
        </RadioGroup>
      </Paper>

      {/* === TÓM TẮT ĐƠN HÀNG === */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={1}>
          Tóm tắt đơn hàng
        </Typography>

        {cart && cart.items.length > 0 ? (
          <>
            {cart.items.map((item: any) => {
              const product = item.variant?.product;
              const color = item.variant?.optionJson?.color;
              const size = item.variant?.optionJson?.size;

              const displayPrice =
                item.priceSnap === 0 || product?.price === 0
                  ? 0
                  : item.priceSnap ?? product?.price ?? 0;

              return (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 1,
                        overflow: "hidden",
                        bgcolor: "#f8f8f8",
                      }}
                    >
                      <img
                        src={
                          product?.images?.[0]?.url ||
                          "https://via.placeholder.com/60"
                        }
                        alt={product?.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography fontWeight={600}>
                        {product?.name} ×{item.quantity}
                      </Typography>
                      <Typography color="text.secondary" fontSize={14}>
                        {color && <>Màu: {color}</>}
                        {size && <> — Size: {size}</>}
                      </Typography>
                      <Typography color="primary" fontWeight={600}>
                        {formatCurrency(displayPrice)}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography fontWeight={700}>
                    {formatCurrency(displayPrice * (item.quantity ?? 1))}
                  </Typography>
                </Box>
              );
            })}

            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography>Tạm tính</Typography>
              <Typography>{formatCurrency(subtotal)}</Typography>
            </Box>
            {appliedCoupon && (
              <Box display="flex" justifyContent="space-between" color="success.main">
                <Typography>Giảm giá ({appliedCoupon.code})</Typography>
                <Typography>-{formatCurrency(discount)}</Typography>
              </Box>
            )}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={1}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Tổng cộng
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatCurrency(total)}
              </Typography>
            </Box>
          </>
        ) : (
          <Typography color="text.secondary">Giỏ hàng trống.</Typography>
        )}
      </Paper>

      {/* === NÚT === */}
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="outlined" onClick={() => navigate("/cart")}>
          Quay lại giỏ hàng
        </Button>
        <Button
          variant="contained"
          onClick={placeOrder}
          disabled={placing || !cart || cart.items.length === 0}
        >
          {placing ? "Đang tạo đơn…" : "Xác nhận đặt hàng"}
        </Button>
      </Box>

      {/* === THÔNG BÁO === */}
      <Snackbar
        open={snack.open}
        autoHideDuration={snack.severity === "error" ? 5000 : 3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{
            bgcolor:
              snack.severity === "success" ? "#e8f5e9" : "#ffebee",
            color:
              snack.severity === "success" ? "#2e7d32" : "#c62828",
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
          variant="filled"
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

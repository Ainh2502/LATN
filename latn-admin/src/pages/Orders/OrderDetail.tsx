import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Stack,
  CircularProgress,
  Chip,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";

interface Props {
  orderId: string;
  onClose: () => void;
}

export default function OrderDetail({ orderId, onClose }: Props) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/order/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      console.error("❌ Lỗi tải chi tiết đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchData();
  }, [orderId]);

  if (!order) return null;

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        component: motion.div,
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.3 },
        sx: { borderRadius: 3, overflow: "hidden" },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(90deg,#007bff,#00c4ff)",
          color: "white",
          fontWeight: 700,
          fontSize: "1.2rem",
        }}
      >
        Chi tiết đơn hàng
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "#f9fafc" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* === Header info === */}
            <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Mã đơn: <b>{order?.code}</b>
              </Typography>
              <Typography color="text.secondary">
                Khách hàng: {order?.user?.name} ({order?.user?.email})
              </Typography>
              <Typography color="text.secondary">
                Địa chỉ: {order?.address?.street}, {order?.address?.ward},{" "}
                {order?.address?.district}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  icon={<PaymentIcon />}
                  label={`Thanh toán: ${order.paymentStatus}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<LocalShippingIcon />}
                  label={`Vận chuyển: ${order.fulfillmentStatus}`}
                  color="secondary"
                  variant="outlined"
                />
              </Stack>
            </Paper>

            {/* === Items === */}
            {order.items?.map((it: any) => (
              <Paper
                key={it.id}
                component={motion.div}
                whileHover={{ scale: 1.02 }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 1.5,
                  mb: 1.5,
                  borderRadius: 2,
                }}
              >
                <img
                  src={
                    it.productImage ||
                    "https://via.placeholder.com/90x90?text=No+Image"
                  }
                  alt={it.name}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 8,
                    objectFit: "cover",
                    border: "1px solid #ddd",
                  }}
                />
                <Box ml={2} flex={1}>
                  <Typography fontWeight={600}>{it.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    SKU: {it.sku} | SL: {it.qty}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Giá: {it.price.toLocaleString("vi-VN")} ₫
                  </Typography>
                </Box>
                <Typography fontWeight={700} color="primary.main">
                  {(it.total ?? it.price * it.qty).toLocaleString("vi-VN")} ₫
                </Typography>
              </Paper>
            ))}

            {/* === Tổng kết === */}
            <Divider sx={{ my: 2 }} />
            <Box textAlign="right">
              <Typography>
                Tổng tiền hàng: {order.subtotal?.toLocaleString("vi-VN")} ₫
              </Typography>
              <Typography color="error">
                Giảm giá: -{order.discountTotal?.toLocaleString("vi-VN")} ₫
              </Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                Thành tiền: {order.grandTotal?.toLocaleString("vi-VN")} ₫
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="contained" color="primary" onClick={onClose}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}

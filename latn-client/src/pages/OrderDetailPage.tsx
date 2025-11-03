import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Button,
  Chip,
  Stack,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";
import { LocalShipping, Payment, CheckCircle, Error } from "@mui/icons-material";
import dayjs from "dayjs";
import api from "../api/axios";
import { formatCurrency } from "../utils/formatCurrency";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await api.get(`/order/${id}`);
        setOrder(data);
      } catch (e: any) {
        console.error("❌ Lỗi tải đơn hàng:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
      case "DELIVERED":
        return "success";
      case "PROCESSING":
      case "SHIPPED":
        return "info";
      case "PENDING":
        return "warning";
      case "FAILED":
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          minHeight: 400,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );

  if (!order)
    return (
      <Box textAlign="center" mt={5}>
        <Typography variant="h6" color="error">
          Không tìm thấy đơn hàng.
        </Typography>
        <Button onClick={() => navigate("/")} sx={{ mt: 2 }}>
          Quay lại trang chủ
        </Button>
      </Box>
    );

  return (
    <Box
      sx={{
        maxWidth: 1000,
        mx: "auto",
        p: { xs: 2, md: 4 },
        backgroundColor: "#f9fbff",
        minHeight: "100vh",
      }}
    >
      {/* 🧾 Header */}
      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          mb: 3,
          background:
            "linear-gradient(90deg, #007bff 0%, #00c4ff 100%)",
          color: "white",
          textAlign: "center",
          boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Chi tiết đơn hàng
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Cảm ơn bạn đã mua sắm tại <b>LATN</b> 💙
        </Typography>
      </Box>

      {/* 🧩 Thông tin đơn hàng */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={1}>
          Mã đơn: {order.code}
        </Typography>
        <Typography color="text.secondary" mb={1}>
          Ngày đặt: {dayjs(order.createdAt).format("HH:mm:ss DD/MM/YYYY")}
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Chip
            icon={<Payment fontSize="small" />}
            label={`Thanh toán: ${order.paymentStatus}`}
            color={getStatusColor(order.paymentStatus)}
          />
          <Chip
            icon={<LocalShipping fontSize="small" />}
            label={`Giao hàng: ${order.fulfillmentStatus}`}
            color={getStatusColor(order.fulfillmentStatus)}
          />
        </Stack>
      </Paper>

      {/* 🛍️ Sản phẩm */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={2}>
          Sản phẩm
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {order.items?.map((item: any) => (
          <Card
            key={item.id}
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <CardMedia
              component="img"
              sx={{
                width: 120,
                height: 120,
                objectFit: "cover",
                backgroundColor: "#f1f1f1",
              }}
              image={
                item.productImage ||
                item.product?.images?.find((img: any) => img.isPrimary)?.url ||
                "https://via.placeholder.com/120x120?text=No+Image"
              }
              alt={item.name}
            />
            <CardContent sx={{ flex: 1 }}>
              <Typography fontWeight={600}>{item.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                SKU: {item.sku}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Số lượng: {item.qty}
              </Typography>
            </CardContent>
            <Box pr={3}>
              <Typography fontWeight={700} color="primary.main">
                {formatCurrency(item.price * item.qty)}
              </Typography>
            </Box>
          </Card>
        ))}

        <Divider sx={{ my: 2 }} />
        <Box textAlign="right">
          <Typography>
            Tổng tiền hàng: {formatCurrency(order.subtotal)}
          </Typography>
          <Typography>
            Giảm giá: -{formatCurrency(order.discountTotal ?? 0)}
          </Typography>
          <Typography>
            Phí vận chuyển: {formatCurrency(order.shippingFee ?? 0)}
          </Typography>
          <Typography variant="h6" fontWeight={700} color="primary">
            Thành tiền: {formatCurrency(order.grandTotal)}
          </Typography>
        </Box>
      </Paper>

      {/* 🏠 Địa chỉ giao hàng */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={1}>
          Địa chỉ giao hàng
        </Typography>
        <Typography fontWeight={600}>
          {order.address?.recipient} — {order.address?.phone}
        </Typography>
        <Typography color="text.secondary">
          {order.address?.street}, {order.address?.ward},{" "}
          {order.address?.district}, {order.address?.province}
        </Typography>
      </Paper>

      {/* ✅ Nút hành động */}
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          startIcon={<CheckCircle />}
          onClick={() => navigate("/")}
        >
          Tiếp tục mua sắm
        </Button>
      </Box>
    </Box>
  );
}

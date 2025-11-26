import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import api from "../api/axios";

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"pending" | "success" | "failed">("pending");
  const [orderId, setOrderId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
    const orderIdParam = searchParams.get("orderId") || searchParams.get("vnp_TxnRef");
    setOrderId(orderIdParam || null);

    // ✅ VNPAY trả về vnp_ResponseCode=00 khi thanh toán thành công
    if (vnp_ResponseCode === "00") {
      setStatus("success");

      // Gọi backend xác nhận trạng thái (dùng chung logic với IPN)
      api
        .get(`/payment/confirm?${searchParams.toString()}`)
        .then((res) => {
          console.log("✅ Xác nhận thanh toán:", res.data);
        })
        .catch((e) => console.error("❌ Lỗi xác nhận thanh toán:", e));
    } else {
      setStatus("failed");
    }
  }, [searchParams]);

  if (status === "pending")
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        p: 3,
      }}
    >
      {status === "success" ? (
        <>
          <CheckCircleOutline sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Thanh toán thành công 🎉
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Cảm ơn bạn đã mua sắm tại LATN!  
            Đơn hàng của bạn đã được ghi nhận.
          </Typography>
          <Button
            variant="contained"
            onClick={() => orderId && navigate(`/orders/${orderId}`)}
          >
            Xem chi tiết đơn hàng
          </Button>
        </>
      ) : (
        <>
          <ErrorOutline sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Thanh toán thất bại 😢
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
          </Typography>
          <Button variant="outlined" onClick={() => navigate("/checkout")}>
            Quay lại thanh toán
          </Button>
        </>
      )}
    </Box>
  );
}

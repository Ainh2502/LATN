import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ErrorOutline from "@mui/icons-material/ErrorOutline";

export default function PaymentReturn() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const code = params.get("vnp_ResponseCode");
    const orderId = params.get("vnp_TxnRef");

    if (!orderId) {
      setStatus("failed");
      return;
    }

    // ✅ Nếu thanh toán thành công (00)
    if (code === "00") {
      setStatus("success");
      // Chờ 2s cho IPN xử lý backend xong, rồi điều hướng
      setTimeout(() => {
        navigate(`/orders/${orderId}`, { replace: true });
      }, 2000);
    } else {
      setStatus("failed");
    }
  }, [search, navigate]);

  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {status === "loading" && (
        <>
          <CircularProgress />
          <Typography mt={2}>Đang xử lý thanh toán...</Typography>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircleOutline color="success" sx={{ fontSize: 80 }} />
          <Typography variant="h5" fontWeight={600} mt={2}>
            Thanh toán thành công 🎉
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hệ thống đang chuyển bạn về trang chi tiết đơn hàng...
          </Typography>
        </>
      )}

      {status === "failed" && (
        <>
          <ErrorOutline color="error" sx={{ fontSize: 80 }} />
          <Typography variant="h5" fontWeight={600} mt={2}>
            Thanh toán thất bại ❌
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vui lòng thử lại hoặc liên hệ hỗ trợ.
          </Typography>
        </>
      )}
    </Box>
  );
}

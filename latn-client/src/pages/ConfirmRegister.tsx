import { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Button } from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ConfirmRegister() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Đang xác nhận tài khoản...");
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Liên kết không hợp lệ hoặc thiếu token!");
      return;
    }

    api
      .get(`/auth/confirm-register?token=${token}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "🎉 Tài khoản đã được kích hoạt thành công!");
      })
      .catch(() => {
        setStatus("error");
        setMessage("❌ Xác nhận thất bại hoặc liên kết đã hết hạn!");
      });
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 5,
          textAlign: "center",
          borderRadius: 3,
          maxWidth: 420,
          background:
            status === "success"
              ? "linear-gradient(145deg, #e6ffe6, #ccffcc)"
              : status === "error"
              ? "linear-gradient(145deg, #ffe6e6, #ffcccc)"
              : "white",
        }}
      >
        {status === "loading" ? (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>{message}</Typography>
          </>
        ) : (
          <>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {status === "success"
                ? "🎉 XÁC NHẬN THÀNH CÔNG"
                : "⚠️ XÁC NHẬN THẤT BẠI"}
            </Typography>
            <Typography color="text.secondary" mb={3}>
              {message}
            </Typography>
            <Button
              variant="contained"
              color={status === "success" ? "success" : "error"}
              onClick={() => navigate("/login")}
            >
              Quay lại đăng nhập
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}

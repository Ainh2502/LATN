import { useEffect, useState } from "react";
import { Box, Typography, Button, Paper, CircularProgress } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

export default function ConfirmEmail() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Đang xác nhận email mới...");
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Liên kết xác nhận không hợp lệ!");
      return;
    }

    const confirmEmail = async () => {
      try {
        // Gọi xác nhận token
        const res = await api.get(`/users/confirm-email?token=${token}`);
        console.log("✅ Kết quả xác nhận:", res.data);

        // Lấy email mới nhất trong hồ sơ
        const me = await api.get("/users/me");
        console.log("📬 Email hiện tại sau xác nhận:", me.data.email);

        // Nếu backend có trả email mới thì so sánh
        const updatedEmail = res.data?.email || null;
        const currentEmail = me.data?.email || null;

        if (updatedEmail && updatedEmail === currentEmail) {
          setStatus("success");
          setMessage("✅ Email của bạn đã được cập nhật thành công!");
        } else if (updatedEmail && updatedEmail !== currentEmail) {
          setStatus("error");
          setMessage("⚠️ Có lỗi xảy ra khi cập nhật email, vui lòng thử lại!");
        } else {
          setStatus("success");
          setMessage("✅ Đã xác nhận email, vui lòng đăng nhập lại!");
        }
      } catch (err: any) {
        console.error("❌ Lỗi xác nhận:", err.response?.data || err.message);
        const msg =
          err.response?.data?.message ||
          "❌ Xác nhận thất bại hoặc liên kết đã hết hạn!";
        setStatus("error");
        setMessage(msg);
      }
    };

    confirmEmail();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
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
            <Typography variant="h6">{message}</Typography>
          </>
        ) : (
          <>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {status === "success" ? "🎉 XÁC NHẬN THÀNH CÔNG" : "⚠️ XÁC NHẬN THẤT BẠI"}
            </Typography>
            <Typography color="text.secondary" mb={3}>
              {message}
            </Typography>
            <Button
              variant="contained"
              color={status === "success" ? "success" : "error"}
              onClick={() => navigate("/profile")}
            >
              Quay lại hồ sơ cá nhân
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}

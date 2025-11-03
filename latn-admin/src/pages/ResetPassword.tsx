import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import api from "../api/axios";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [pwd, setPwd] = useState("");
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(null);
    setErr(null);
    try {
      const res = await api.post("/auth/reset-password", {
        token,
        newPassword: pwd,
      });

      const { role, email } = res.data;
      setOk("✅ Đặt lại mật khẩu thành công! Đang chuyển hướng...");

      setTimeout(() => {
        if (role === "CUSTOMER") {
          window.location.href = `http://localhost:5174/login?email=${encodeURIComponent(
            email
          )}`;
        } else {
          navigate("/login");
        }
      }, 1200);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #ece9e6, #ffffff)",
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          maxWidth: 420,
          width: "100%",
          borderRadius: 4,
          textAlign: "center",
          backdropFilter: "blur(6px)",
        }}
      >
        <Box sx={{ mb: 2 }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/9/94/Emblem_VPA.svg"
            alt="Shop Logo"
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              marginBottom: 8,
            }}
          />
          <Typography variant="h5" fontWeight="bold">
            Đặt lại mật khẩu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nhập mật khẩu mới để tiếp tục đăng nhập
          </Typography>
        </Box>

        {!token && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Token không hợp lệ
          </Alert>
        )}
        {ok && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {ok}
          </Alert>
        )}
        {err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err}
          </Alert>
        )}

        <Box component="form" onSubmit={submit}>
          <TextField
            fullWidth
            label="Mật khẩu mới (≥ 6 ký tự)"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!token}
            sx={{
              py: 1.2,
              fontWeight: "bold",
              borderRadius: 3,
              background:
                "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
              "&:hover": {
                background:
                  "linear-gradient(90deg, #1565c0 0%, #1e88e5 100%)",
              },
            }}
          >
            Xác nhận
          </Button>
        </Box>

        <Typography
          variant="caption"
          display="block"
          mt={3}
          color="text.secondary"
        >
          © 2025 UAN163 Fashion | Bảo mật tuyệt đối
        </Typography>
      </Paper>
    </Box>
  );
}

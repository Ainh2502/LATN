import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Backdrop,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Close } from "@mui/icons-material";
import api from "../api/axios";

export default function ForgotPassword() {
  const nav = useNavigate();
  const [open, setOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => nav(-1), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSnack({
        open: true,
        message: "📧 Vui lòng kiểm tra email để đặt lại mật khẩu!",
        severity: "success",
      });
      setEmail("");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Không thể gửi yêu cầu, vui lòng thử lại.";
      setSnack({ open: true, message: msg, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        BackdropComponent={Backdrop}
        BackdropProps={{ sx: { backdropFilter: "blur(6px)" } }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "rgba(255,255,255,0.95)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            overflow: "visible",
            p: 2,
          },
        }}
      >
        <Box position="absolute" top={10} right={10}>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>

        <DialogTitle sx={{ textAlign: "center", fontWeight: 800, mt: 1 }}>
          🔑 Quên mật khẩu
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 2, color: "#444", textAlign: "center" }}>
            Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                bgcolor: "#00b0ff",
                fontWeight: 700,
                borderRadius: 2,
                height: 50,
                "&:hover": { bgcolor: "#0288d1" },
              }}
            >
              {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
            </Button>

            <Button
              variant="text"
              fullWidth
              onClick={() => nav("/login")}
              sx={{
                mt: 0.5,
                color: "#007BFF",
                fontWeight: 500,
                textTransform: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Quay lại đăng nhập
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity as any}>{snack.message}</Alert>
      </Snackbar>
    </>
  );
}

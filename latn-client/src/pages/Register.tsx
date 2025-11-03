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
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Close } from "@mui/icons-material";
import api from "../api/axios";

export default function Register() {
  const nav = useNavigate();
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => nav(-1), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      setSnack({
        open: true,
        message: res.data.message || "📨 Vui lòng kiểm tra email để xác nhận tài khoản.",
        severity: "success",
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || "❌ Đăng ký thất bại. Vui lòng thử lại!";
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
          📝 Đăng ký tài khoản
        </DialogTitle>

        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <TextField
              label="Họ và tên"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              label="Mật khẩu"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <Button
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{
                bgcolor: "#00b0ff",
                fontWeight: 700,
                borderRadius: 2,
                height: 50,
                "&:hover": { bgcolor: "#0288d1" },
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Đăng ký"}
            </Button>

            <Typography align="center" sx={{ fontSize: 14 }}>
              Đã có tài khoản?{" "}
              <Button
                variant="text"
                sx={{ color: "#007BFF", textTransform: "none" }}
                onClick={() => nav("/login")}
              >
                Đăng nhập
              </Button>
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity as any}>{snack.message}</Alert>
      </Snackbar>
    </>
  );
}

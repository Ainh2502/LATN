import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  InputAdornment,
  Backdrop,
} from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Visibility, VisibilityOff, Close } from "@mui/icons-material";
import { gsap } from "gsap";

export default function Login() {
  const [open, setOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  // 🔙 Khi bấm đóng sẽ quay lại trang trước
  const handleClose = () => {
    setOpen(false);
    setTimeout(() => nav(-1), 300); // back nhẹ nhàng
  };

  // 🧸 Animation Yeti (placeholder)
  const svgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.fromTo(
      svgRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  // 🧩 Submit form login
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // 🔒 Kiểm tra trạng thái tài khoản
      if (user.isActive === false) {
        setDialogMessage("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.");
        setOpenDialog(true);
        localStorage.clear();
        return;
      }
      // 🔐 Chỉ cho phép CUSTOMER đăng nhập client
      if (user.role !== "CUSTOMER") {
        setDialogMessage("Chỉ tài khoản khách hàng (CUSTOMER) mới được đăng nhập.");
        setOpenDialog(true);
        localStorage.clear();
        return;
      }

      // ✅ Nếu có trang được lưu từ trước (Wishlist/Cart)
      const redirectPath = localStorage.getItem("redirectAfterLogin");
      setOpen(false);
      if (redirectPath) {
        localStorage.removeItem("redirectAfterLogin");
        nav(redirectPath);
      } else {
        nav("/");
      }
    } catch (err) {
      setDialogMessage("Email hoặc mật khẩu không hợp lệ.");
      setOpenDialog(true);
    }
  };

  return (
    <>
      {/* 🧱 Form login */}
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
        {/* ❌ Nút đóng */}
        <Box position="absolute" top={10} right={10}>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>

        <DialogTitle sx={{ textAlign: "center", fontWeight: 800, mt: 1 }}>
          🎯 Đăng nhập LATN
        </DialogTitle>

        <DialogContent>
          {/* Yeti icon / animation */}
          <Box
            ref={svgRef}
            sx={{
              width: 150,
              height: 150,
              mx: "auto",
              borderRadius: "50%",
              border: "2px solid #3A5E77",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#3A5E77",
              fontWeight: 700,
              mb: 2,
            }}
          >
            (Yeti ở đây)
          </Box>

          {/* Form fields */}
          <Box
            component="form"
            onSubmit={submit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Email hoặc SĐT"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                bgcolor: "#00b0ff",
                fontWeight: 700,
                borderRadius: 2,
                height: 50,
                "&:hover": { bgcolor: "#0288d1" },
              }}
            >
              Đăng nhập
            </Button>

            {/* Forgot password / Register */}
            <Typography align="center" sx={{ mt: 1, fontSize: 14 }}>
              <Button
                variant="text"
                sx={{
                  color: "#007BFF",
                  textTransform: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => nav("/forgot-password")}
              >
                Quên mật khẩu?
              </Button>
              {" • "}
              <Button
                variant="text"
                sx={{
                  color: "#007BFF",
                  textTransform: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => nav("/register")}
              >
                Đăng ký tài khoản
              </Button>
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ⚠️ Dialog cảnh báo */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "linear-gradient(180deg, #1b093a, #2b1560)",
            border: "2px solid #d9b35f",
            boxShadow: "0 0 25px rgba(255,215,128,0.6)",
            color: "white",
            textAlign: "center",
          },
        }}
      >
        <DialogTitle sx={{ color: "#FFD700", fontWeight: 900 }}>
          🔒 THÔNG BÁO
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>{dialogMessage}</Typography>
        </DialogContent>
        <Box textAlign="center" pb={2}>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#FFD700",
              color: "#3a1e68",
              fontWeight: 700,
              px: 3,
              "&:hover": { bgcolor: "#ffea94" },
            }}
            onClick={() => setOpenDialog(false)}
          >
            Xác nhận
          </Button>
        </Box>
      </Dialog>
    </>
  );
}

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  Paper,
  Fade,
  Autocomplete,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Add, Edit, Delete, Home } from "@mui/icons-material";
import api from "../api/axios";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

export default function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ email: "", name: "" });
  const [addresses, setAddresses] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(true);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // Lấy danh sách tỉnh/thành có cache
  useEffect(() => {
    const cached = localStorage.getItem("vn_provinces");
    if (cached) {
      setProvinces(JSON.parse(cached));
    } else {
      axios.get("https://provinces.open-api.vn/api/p/").then((res) => {
        setProvinces(res.data);
        localStorage.setItem("vn_provinces", JSON.stringify(res.data));
      });
    }
  }, []);

  const handleProvinceChange = async (value: any) => {
    const selected = provinces.find((p) => p.name === value);
    setEditing({ ...editing, province: value, district: "", ward: "" });
    if (selected) {
      const res = await axios.get(
        `https://provinces.open-api.vn/api/p/${selected.code}?depth=2`
      );
      setDistricts(res.data.districts);
      setWards([]);
    }
  };

  const handleDistrictChange = async (value: any) => {
    const selected = districts.find((d) => d.name === value);
    setEditing({ ...editing, district: value, ward: "" });
    if (selected) {
      const res = await axios.get(
        `https://provinces.open-api.vn/api/d/${selected.code}?depth=2`
      );
      setWards(res.data.wards);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/me");
      setProfile({
        email: res.data.email || "",
        name: res.data.name || "",
      });
    } catch (err) {
      console.error("❌ Lỗi lấy profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    const res = await api.get("/address");
    setAddresses(res.data);
  };

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, []);

  // =================== PROFILE ===================
  const [isEditing, setIsEditing] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setPendingEmail(profile.email);
  };

  const handleSaveProfile = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const emailChanged = pendingEmail.trim() !== profile.email.trim();
      const nameChanged = profile.name.trim() !== user?.name?.trim();

      if (nameChanged) {
        await api.patch("/users/me", { name: profile.name.trim() });
        const updated = await api.get("/users/me");
        setUser(updated.data);
        localStorage.setItem("user", JSON.stringify(updated.data));
      }

      if (emailChanged) {
        await api.post("/users/request-email-change", {
          newEmail: pendingEmail.trim(),
        });
        setSnack({
          open: true,
          message:
            "📨 Đã gửi email xác nhận. Vui lòng kiểm tra hộp thư để xác nhận email mới.",
          severity: "info",
        });
        setPendingEmail(profile.email);
      } else {
        await api.patch("/users/me", { name: profile.name.trim() });
        const updated = await api.get("/users/me");
        setUser(updated.data);
        localStorage.setItem("user", JSON.stringify(updated.data));
        setSnack({
          open: true,
          message: "✅ Cập nhật hồ sơ thành công!",
          severity: "success",
        });
      }

      setIsEditing(false);
    } catch (err: any) {
      console.error("❌ Lỗi lưu hồ sơ:", err.response?.data || err.message);
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 400
          ? "⚠️ Dữ liệu không hợp lệ hoặc email đã tồn tại!"
          : "❌ Lưu hồ sơ thất bại!");
      setSnack({ open: true, message: msg, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  // =================== ADDRESS ===================
  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá địa chỉ này?")) return;
    await api.delete(`/address/${id}`);
    fetchAddresses();
    setSnack({ open: true, message: "🗑️ Đã xoá địa chỉ!", severity: "info" });
  };

  const handleOpenForm = (addr?: any) => {
    setEditing(
      addr || {
        recipient: profile.name || user?.name || "",
        phone: "",
        province: "",
        district: "",
        ward: "",
        street: "",
        isDefault: false,
      }
    );
    setDistricts([]);
    setWards([]);
    setOpen(true);
  };

  const handleSaveAddress = async () => {
    if (!user || !user.id) {
      setSnack({
        open: true,
        message: "❌ Không xác định được người dùng. Vui lòng đăng nhập lại!",
        severity: "error",
      });
      return;
    }

    const payload = {
      userId: user.id,
      recipient: editing.recipient?.trim() || user.name || "",
      phone: editing.phone?.trim(),
      province:
        typeof editing.province === "object"
          ? editing.province.name
          : editing.province?.trim(),
      district:
        typeof editing.district === "object"
          ? editing.district.name
          : editing.district?.trim(),
      ward:
        typeof editing.ward === "object"
          ? editing.ward.name
          : editing.ward?.trim(),
      street: editing.street?.trim(),
      isDefault: !!editing.isDefault,
    };

    if (
      !payload.recipient ||
      !payload.phone ||
      !payload.province ||
      !payload.district ||
      !payload.ward ||
      !payload.street
    ) {
      setSnack({
        open: true,
        message: "⚠️ Vui lòng điền đầy đủ thông tin địa chỉ!",
        severity: "warning",
      });
      return;
    }

    try {
      if (editing.id) {
        await api.patch(`/address/${editing.id}`, payload);
        setSnack({
          open: true,
          message: "✅ Cập nhật địa chỉ thành công!",
          severity: "success",
        });
      } else {
        await api.post("/address", payload);
        setSnack({
          open: true,
          message: "✅ Thêm địa chỉ mới thành công!",
          severity: "success",
        });
      }

      setOpen(false);
      fetchAddresses();
    } catch (err: any) {
      console.error("❌ Lỗi lưu địa chỉ:", err.response?.data || err.message);
      let msg = "❌ Lưu địa chỉ thất bại!";
      if (err.response?.data?.message?.includes("userId"))
        msg = "⚠️ Không tìm thấy userId — vui lòng đăng nhập lại!";
      setSnack({ open: true, message: msg, severity: "error" });
    }
  };

  // =================== UI ===================
  return (
    <Fade in>
      <Box sx={{ maxWidth: 700, mx: "auto", mt: 5, p: 3 }}>
        {/* === Hồ sơ cá nhân === */}
        <Typography variant="h5" fontWeight={700} mb={2}>
          Hồ sơ cá nhân
        </Typography>

        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 3,
            transition: "all .2s ease-in-out",
            "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
          }}
        >
          <Box
            component="form"
            onSubmit={handleSaveProfile}
            sx={{ display: "grid", gap: 2, mb: 2 }}
          >
            <TextField
              label="Email"
              value={pendingEmail || profile.email}
              onChange={(e) => setPendingEmail(e.target.value)}
              disabled={!isEditing}
              fullWidth
            />

            <TextField
              label="Tên hiển thị"
              value={profile.name}
              onChange={(e) =>
                isEditing && setProfile({ ...profile, name: e.target.value })
              }
              disabled={!isEditing}
              fullWidth
            />

            {!isEditing ? (
              <Button
                variant="outlined"
                onClick={handleEditToggle}
                sx={{ width: 150 }}
              >
                Sửa hồ sơ
              </Button>
            ) : (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={saving}
                  sx={{ width: 150 }}
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => {
                    setIsEditing(false);
                    setPendingEmail(profile.email);
                  }}
                >
                  Hủy
                </Button>
              </Box>
            )}
          </Box>

          {/* ✅ Hai nút chức năng mới */}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate("/voucher-wallet")}
            >
              🎟️ Ví voucher
            </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/my-orders")}
                startIcon={<ReceiptLongIcon />} // cần import icon
              >
                Đơn hàng của bạn
              </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate("/lucky-wheel")}
            >
              🎡 Trò chơi may mắn
            </Button>
          </Box>
        </Paper>

        {/* === Danh sách địa chỉ === */}
        <Typography variant="h6" fontWeight={700} mt={4} mb={1}>
          Địa chỉ liên hệ
        </Typography>

        <Button
          variant="outlined"
          startIcon={<Add />}
          sx={{ mb: 2 }}
          onClick={() => handleOpenForm()}
        >
          Thêm địa chỉ
        </Button>

        {addresses.length === 0 && (
          <Typography color="text.secondary">
            Chưa có địa chỉ nào.
          </Typography>
        )}

        {addresses.map((a) => (
          <Paper
            key={a.id}
            elevation={1}
            sx={{
              p: 2,
              mb: 1.5,
              borderLeft: a.isDefault
                ? "4px solid #4caf50"
                : "4px solid transparent",
              borderRadius: 2,
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              },
              transition: "0.15s ease",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography fontWeight={600}>
                  <Home
                    sx={{
                      verticalAlign: "middle",
                      fontSize: 20,
                      mr: 0.5,
                    }}
                  />
                  {a.recipient} — {a.phone}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {a.street}, {a.ward}, {a.district}, {a.province}
                </Typography>
                {a.isDefault && (
                  <Typography variant="caption" color="green" fontWeight={600}>
                    (Mặc định)
                  </Typography>
                )}
              </Box>
              <Box>
                <Tooltip title="Sửa">
                  <IconButton onClick={() => handleOpenForm(a)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Xoá">
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteAddress(a.id)}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        ))}

        {/* === Dialog thêm/sửa === */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editing?.id ? "✏️ Sửa địa chỉ" : "➕ Thêm địa chỉ"}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Người nhận"
                  value={editing?.recipient || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, recipient: e.target.value })
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Số điện thoại"
                  value={editing?.phone || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, phone: e.target.value })
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={provinces.map((p) => p.name)}
                  value={editing?.province || ""}
                  onChange={(_, v) => handleProvinceChange(v)}
                  renderInput={(params) => (
                    <TextField {...params} label="Tỉnh / Thành phố" fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={districts.map((d) => d.name)}
                  value={editing?.district || ""}
                  onChange={(_, v) => handleDistrictChange(v)}
                  renderInput={(params) => (
                    <TextField {...params} label="Quận / Huyện" fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={wards.map((w) => w.name)}
                  value={editing?.ward || ""}
                  onChange={(_, v) => setEditing({ ...editing, ward: v || "" })}
                  renderInput={(params) => (
                    <TextField {...params} label="Phường / Xã" fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Đường / Số nhà"
                  value={editing?.street || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, street: e.target.value })
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!editing?.isDefault}
                      onChange={(e) =>
                        setEditing({ ...editing, isDefault: e.target.checked })
                      }
                      color="primary"
                    />
                  }
                  label="Đặt làm mặc định"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Hủy</Button>
            <Button onClick={handleSaveAddress} variant="contained">
              Lưu
            </Button>
          </DialogActions>
        </Dialog>

        {/* === Snackbar === */}
        <Snackbar
          open={snack.open}
          autoHideDuration={2500}
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snack.severity as any} sx={{ width: "100%" }}>
            {snack.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
}

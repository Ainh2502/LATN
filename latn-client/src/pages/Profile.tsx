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
import { useNavigate } from "react-router-dom";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

type Address = {
  id?: string;
  recipient: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
};

export default function Profile() {
  const { user, setUser } = useAuth();
  const nav = useNavigate();

  // 🧩 State
  const [profile, setProfile] = useState({ email: "", name: "" });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editing, setEditing] = useState<Partial<Address> | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const [saving, setSaving] = useState(false);

  // 🗺️ Location data
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // 📥 Fetch profile & address
  useEffect(() => {
    Promise.all([api.get("/users/me"), api.get("/address")])
      .then(([userRes, addrRes]) => {
        setProfile({
          email: userRes.data.email || "",
          name: userRes.data.name || "",
        });
        setAddresses(addrRes.data || []);
      })
      .catch((err) => console.error("❌ Lỗi lấy dữ liệu:", err));
  }, []);

  // 📦 Load provinces (with cache)
  useEffect(() => {
    const cached = localStorage.getItem("vn_provinces");
    if (cached) {
      setProvinces(JSON.parse(cached));
      return;
    }
    fetch("/data/vietnam_provinces.json")
      .then((r) => r.json())
      .then((data) => {
        setProvinces(data);
        localStorage.setItem("vn_provinces", JSON.stringify(data));
      });
  }, []);

  // 📋 Functions
  const showSnack = (
  msg: string,
  severity: "success" | "error" | "info" | "warning" = "success"
) => {
  setSnack({ open: true, message: msg, severity });
};


  const reloadAddresses = () =>
    api.get("/address").then((r) => setAddresses(r.data));

  const handleProvinceSelect = (_: any, selected: any) => {
    if (!selected) {
      setEditing({ ...editing, province: "", district: "", ward: "" });
      setDistricts([]);
      setWards([]);
      return;
    }
    setEditing({
      ...editing,
      province: selected.name,
      district: "",
      ward: "",
    });
    setDistricts(selected.districts || []);
    setWards([]);
  };

  const handleDistrictSelect = (_: any, selected: any) => {
    if (!selected) {
      setEditing({ ...editing, district: "", ward: "" });
      setWards([]);
      return;
    }
    setEditing({
      ...editing,
      district: selected.name,
      ward: "",
    });
    setWards(selected.wards || []);
  };

  const handleWardSelect = (_: any, selected: any) =>
    setEditing({ ...editing, ward: selected?.name || "" });

  const handleSaveAddress = async () => {
    if (!editing) return;
    const payload = {
      ...editing,
      recipient: editing.recipient?.trim() || user?.name || "",
      phone: editing.phone?.trim(),
      province: editing.province?.trim(),
      district: editing.district?.trim(),
      ward: editing.ward?.trim(),
      street: editing.street?.trim(),
      isDefault: !!editing.isDefault,
      userId: user?.id,
    };

    if (
      !payload.recipient ||
      !payload.phone ||
      !payload.province ||
      !payload.district ||
      !payload.ward ||
      !payload.street
    ) {
      showSnack("⚠️ Vui lòng điền đầy đủ thông tin địa chỉ!", "warning");
      return;
    }

    try {
      setSaving(true);
      if (editing.id) {
        await api.patch(`/address/${editing.id}`, payload);
        showSnack("✅ Cập nhật địa chỉ thành công!");
      } else {
        await api.post("/address", payload);
        showSnack("✅ Thêm địa chỉ mới thành công!");
      }
      setOpenDialog(false);
      reloadAddresses();
    } catch (err) {
      console.error("❌ Lưu địa chỉ thất bại:", err);
      showSnack("❌ Lưu địa chỉ thất bại!", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá địa chỉ này?")) return;
    await api.delete(`/address/${id}`);
    reloadAddresses();
    showSnack("🗑️ Đã xoá địa chỉ!", "info");
  };

  // ==================== UI ====================

  return (
    <Fade in>
      <Box sx={{ maxWidth: 700, mx: "auto", mt: 5, p: 3 }}>
        {/* 🧍 Hồ sơ cá nhân */}
        <Typography variant="h5" fontWeight={700} mb={2}>
          Hồ sơ cá nhân
        </Typography>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography>Email: {profile.email}</Typography>
          <Typography>Họ tên: {profile.name}</Typography>

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => nav("/voucher-wallet")}
            >
              🎟️ Ví voucher
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => nav("/my-orders")}
              startIcon={<ReceiptLongIcon />}
            >
              Đơn hàng
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => nav("/lucky-wheel")}
            >
              🎡 Trò chơi may mắn
            </Button>
          </Box>
        </Paper>

        {/* 🏠 Địa chỉ */}
        <Typography variant="h6" fontWeight={700} mt={4} mb={1}>
          Địa chỉ liên hệ
        </Typography>

        <Button
          variant="outlined"
          startIcon={<Add />}
          sx={{ mb: 2 }}
          onClick={() => {
            setEditing({
              recipient: user?.name || "",
              phone: "",
              province: "",
              district: "",
              ward: "",
              street: "",
              isDefault: false,
            });
            setDistricts([]);
            setWards([]);
            setOpenDialog(true);
          }}
        >
          Thêm địa chỉ
        </Button>

        {addresses.length === 0 ? (
          <Typography color="text.secondary">Chưa có địa chỉ nào.</Typography>
        ) : (
          addresses.map((a) => (
            <Paper
              key={a.id}
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
                      sx={{ verticalAlign: "middle", fontSize: 20, mr: 0.5 }}
                    />
                    {a.recipient} — {a.phone}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {a.street}, {a.ward}, {a.district}, {a.province}
                  </Typography>
                  {a.isDefault && (
                    <Typography
                      variant="caption"
                      color="green"
                      fontWeight={600}
                    >
                      (Mặc định)
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Tooltip title="Sửa">
                    <IconButton
                      onClick={() => {
                        setEditing(a);
                        const p = provinces.find((x) => x.name === a.province);
                        if (p) setDistricts(p.districts);
                        const d = p?.districts.find(
                          (x: any) => x.name === a.district
                        );
                        if (d) setWards(d.wards);
                        setOpenDialog(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xoá">
                    <IconButton color="error" onClick={() => handleDeleteAddress(a.id!)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Paper>
          ))
        )}

        {/* 🟢 Dialog Thêm / Sửa địa chỉ */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
          <DialogTitle>
            {editing?.id ? "✏️ Sửa địa chỉ" : "➕ Thêm địa chỉ"}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} mt={1}>
              {[
                { label: "Người nhận", key: "recipient" },
                { label: "Số điện thoại", key: "phone" },
              ].map((f) => (
                <Grid item xs={12} sm={6} key={f.key}>
                  <TextField
                    label={f.label}
                    value={(editing as any)?.[f.key] || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, [f.key]: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>
              ))}

              {/* Địa lý */}
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={provinces}
                  getOptionLabel={(o) => o.name}
                  value={
                    provinces.find((p) => p.name === editing?.province) || null
                  }
                  onChange={handleProvinceSelect}
                  renderInput={(p) => (
                    <TextField {...p} label="Tỉnh / Thành phố" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={districts}
                  getOptionLabel={(o) => o.name}
                  value={
                    districts.find((d) => d.name === editing?.district) || null
                  }
                  onChange={handleDistrictSelect}
                  renderInput={(p) => <TextField {...p} label="Quận / Huyện" />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={wards}
                  getOptionLabel={(o) => o.name}
                  value={wards.find((w) => w.name === editing?.ward) || null}
                  onChange={handleWardSelect}
                  renderInput={(p) => <TextField {...p} label="Phường / Xã" />}
                />
              </Grid>

              {/* Đường / Số nhà */}
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

              {/* Mặc định */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!editing?.isDefault}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          isDefault: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Đặt làm mặc định"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button
              variant="contained"
              onClick={handleSaveAddress}
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snack.severity}>{snack.message}</Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
}

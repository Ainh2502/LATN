import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Button,
  Fade,
  TextField,
  Stack,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { motion } from "framer-motion";
import api from "../../api/axios";
import OrderDetail from "./OrderDetail";

export default function OrderList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [chooseDialog, setChooseDialog] = useState<{
    open: boolean;
    orderId: string | null;
    providers: string[];
  }>({
    open: false,
    orderId: null,
    providers: [],
  });

  /** 🔁 Lấy danh sách đơn hàng */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/order");
      const data = res.data ?? [];
      setOrders(data);
      setFiltered(data);
    } catch (err) {
      console.error("Lỗi lấy đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /** 🔎 Lọc đơn theo ngày (client-side) */
  const handleFilter = () => {
    if (!fromDate && !toDate) {
      setFiltered(orders);
      return;
    }
    const f = fromDate ? new Date(fromDate).getTime() : 0;
    const t = toDate ? new Date(toDate).getTime() + 86400000 : Date.now() + 86400000;

    const filteredList = orders.filter((o) => {
      const created = new Date(o.createdAt).getTime();
      return created >= f && created <= t;
    });
    setFiltered(filteredList);
  };

  /** ❌ Xóa đơn */
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này không?")) return;
    try {
      await api.delete(`/order/${id}`);
      setSnack({ open: true, message: "🗑️ Đã xóa đơn hàng", severity: "success" });
      fetchOrders();
    } catch {
      setSnack({ open: true, message: "❌ Lỗi khi xóa đơn hàng", severity: "error" });
    }
  };

  /** ⚙️ Cập nhật trạng thái */
  const handleStatusChange = async (
    order: any,
    field: "paymentStatus" | "fulfillmentStatus",
    value: string
  ) => {
    try {
      // 🚨 Nếu hủy đơn hoặc hoàn tiền → gọi cancelOrder
      if (
        (field === "fulfillmentStatus" && value === "CANCELLED") ||
        (field === "paymentStatus" && value === "REFUNDED")
      ) {
        if (
          window.confirm(
            "Bạn có chắc muốn hủy / hoàn tiền đơn hàng này? Tồn kho sẽ được hoàn lại."
          )
        ) {
          await api.patch(`/order/${order.id}/cancel`);
          setSnack({
            open: true,
            message:
              value === "REFUNDED"
                ? "💰 Đã hoàn tiền và hoàn kho đơn hàng."
                : "🛑 Đã hủy đơn hàng và hoàn kho.",
            severity: "success",
          });
          fetchOrders();
          return;
        } else return;
      }

      // ✅ Giữ logic cũ cho các trạng thái khác
      if (field === "paymentStatus") {
        const paymentId = order.payments?.[0]?.id;
        if (!paymentId) throw new Error("Không tìm thấy bản ghi thanh toán");
        await api.patch(`/payment/${paymentId}`, { status: value });
      } else if (field === "fulfillmentStatus") {
        const shipmentId = order.shipments?.[0]?.id;
        if (!shipmentId) throw new Error("Không tìm thấy bản ghi giao hàng");

        const currentProvider = order.shipments?.[0]?.provider ?? "STANDARD";
        if (value === "SHIPPED" && (currentProvider === "STANDARD" || !currentProvider)) {
          setChooseDialog({
            open: true,
            orderId: order.id,
            providers: ["GHN", "GHTK", "VIETTELPOST", "BESTEXPRESS"],
          });
          return;
        }

        await api.patch(`/shipment/${shipmentId}`, { status: value });
      }

      await api.patch(`/order/${order.id}`, { [field]: value });
      setSnack({
        open: true,
        message: "✅ Cập nhật trạng thái thành công",
        severity: "success",
      });
      fetchOrders();
    } catch (err) {
      console.error("❌ Lỗi cập nhật trạng thái:", err);
      setSnack({
        open: true,
        message: "❌ Không thể cập nhật trạng thái",
        severity: "error",
      });
    }
  };

  /** ✅ Chọn provider */
  const handleProviderSelect = async (provider: string) => {
    try {
      if (!chooseDialog.orderId) return;
      await api.patch(`/shipment/by-order/${chooseDialog.orderId}/set-provider`, {
        provider,
      });
      await api.patch(`/order/${chooseDialog.orderId}`, {
        fulfillmentStatus: "SHIPPED",
      });

      setSnack({
        open: true,
        message: `🚀 Đã gán đối tác vận chuyển: ${provider}`,
        severity: "success",
      });
      setChooseDialog({ open: false, orderId: null, providers: [] });
      fetchOrders();
    } catch (err) {
      console.error("❌ Lỗi chọn provider:", err);
      setSnack({
        open: true,
        message: "❌ Lỗi khi chọn nhà vận chuyển",
        severity: "error",
      });
    }
  };

  /** 🎨 Màu trạng thái */
  const getPaymentColor = (status: string) => {
    switch (status) {
      case "PAID":
        return { color: "white", bg: "#4caf50" };
      case "FAILED":
      case "REFUNDED":
        return { color: "white", bg: "#f44336" };
      default:
        return { color: "black", bg: "#ffb74d" };
    }
  };

  const getShipmentColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return { color: "white", bg: "#4caf50" };
      case "CANCELLED":
        return { color: "white", bg: "#f44336" };
      case "SHIPPED":
      case "PROCESSING":
        return { color: "black", bg: "#ffb74d" };
      default:
        return { color: "black", bg: "#eeeeee" };
    }
  };

  return (
    <Box>
      <Typography
        variant="h5"
        mb={2}
        component={motion.div}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        🧾 Quản lý đơn hàng
      </Typography>

      {/* 📅 Bộ lọc ngày */}
      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <TextField
          type="date"
          label="Từ ngày"
          InputLabelProps={{ shrink: true }}
          size="small"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <TextField
          type="date"
          label="Đến ngày"
          InputLabelProps={{ shrink: true }}
          size="small"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleFilter}
          sx={{
            background: "linear-gradient(45deg,#007bff,#00c4ff)",
            fontWeight: "bold",
          }}
        >
          Lọc đơn hàng
        </Button>
        <Button variant="outlined" onClick={() => {
          setFromDate("");
          setToDate("");
          setFiltered(orders);
        }}>
          Xóa lọc
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : (
        <Fade in>
          <Table size="small" sx={{ bgcolor: "#fff", borderRadius: 2 }}>
            <TableHead>
              <TableRow sx={{ background: "linear-gradient(90deg,#007bff,#00c4ff)" }}>
                {[
                  "Mã đơn",
                  "Khách hàng",
                  "Địa chỉ giao",
                  "Tổng tiền (₫)",
                  "Thanh toán",
                  "Giao hàng",
                  "Chi tiết",
                  "Ngày tạo",
                  "Xóa",
                ].map((h) => (
                  <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map((o, i) => {
                const paymentStatus =
                  o.paymentStatus ?? o.payments?.[0]?.status ?? "PENDING";
                const shipmentStatus =
                  o.shipments?.[0]?.status ?? o.fulfillmentStatus ?? "DRAFT";
                const providerName = o.shipments?.[0]?.provider ?? "STANDARD";

                const payColor = getPaymentColor(paymentStatus);
                const shipColor = getShipmentColor(shipmentStatus);

                return (
                  <TableRow
                    key={o.id}
                    hover
                    component={motion.tr}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <TableCell>{o.code}</TableCell>
                    <TableCell>{o.user?.name ?? "-"}</TableCell>
                    <TableCell>
                      {o.address
                        ? `${o.address.street}, ${o.address.ward}, ${o.address.district}`
                        : "-"}
                    </TableCell>
                    <TableCell align="right">
                      {o.grandTotal?.toLocaleString("vi-VN")}
                    </TableCell>

                    {/* ===== Thanh toán ===== */}
                    <TableCell>
                      <Select
                        size="small"
                        value={paymentStatus}
                        onChange={(e) =>
                          handleStatusChange(o, "paymentStatus", e.target.value)
                        }
                        sx={{
                          minWidth: 120,
                          bgcolor: payColor.bg,
                          color: payColor.color,
                          fontWeight: "bold",
                          borderRadius: 1,
                        }}
                      >
                        <MenuItem value="PENDING">PENDING</MenuItem>
                        <MenuItem value="PAID">PAID</MenuItem>
                        <MenuItem value="FAILED">FAILED</MenuItem>
                        <MenuItem value="REFUNDED">REFUNDED</MenuItem>
                      </Select>
                    </TableCell>

                    {/* ===== Giao hàng ===== */}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Select
                          size="small"
                          value={shipmentStatus}
                          onChange={(e) =>
                            handleStatusChange(o, "fulfillmentStatus", e.target.value)
                          }
                          sx={{
                            minWidth: 130,
                            bgcolor: shipColor.bg,
                            color: shipColor.color,
                            fontWeight: "bold",
                            borderRadius: 1,
                          }}
                        >
                          <MenuItem value="DRAFT">DRAFT</MenuItem>
                          <MenuItem value="PENDING">PENDING</MenuItem>
                          <MenuItem value="PROCESSING">PROCESSING</MenuItem>
                          <MenuItem value="SHIPPED">SHIPPED</MenuItem>
                          <MenuItem value="DELIVERED">DELIVERED</MenuItem>
                          <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                        </Select>
                        <Typography
                          variant="body2"
                          sx={{ fontStyle: "italic", opacity: 0.7 }}
                        >
                          {providerName !== "STANDARD" && `(${providerName})`}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <IconButton
                        onClick={() => setSelectedOrderId(o.id)}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>

                    <TableCell>
                      {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>

                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(o.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Fade>
      )}

      {/* 🚀 Popup chọn đối tác giao hàng */}
      <Dialog
        open={chooseDialog.open}
        onClose={() =>
          setChooseDialog({ open: false, orderId: null, providers: [] })
        }
        maxWidth="xs"
        fullWidth
        PaperProps={{
          component: motion.div,
          initial: { scale: 0.6, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { duration: 0.4 },
          sx: {
            borderRadius: 3,
            background:
              "radial-gradient(circle at top left, #001e3c 0%, #0a1929 100%)",
            color: "white",
            textAlign: "center",
            boxShadow: "0 0 25px rgba(0, 255, 255, 0.4)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.3rem" }}>
          🚚 CHỌN ĐỐI TÁC GIAO HÀNG
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} justifyContent="center" mt={1}>
            {chooseDialog.providers.map((p) => (
              <Grid item xs={6} key={p}>
                <Button
                  fullWidth
                  component={motion.button}
                  whileHover={{ scale: 1.1, rotate: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleProviderSelect(p)}
                  startIcon={<LocalShippingIcon />}
                  sx={{
                    background:
                      p === "GHN"
                        ? "linear-gradient(45deg,#1976d2,#42a5f5)"
                        : p === "GHTK"
                        ? "linear-gradient(45deg,#2e7d32,#66bb6a)"
                        : p === "VIETTELPOST"
                        ? "linear-gradient(45deg,#f39c12,#fdd835)"
                        : "linear-gradient(45deg,#8e24aa,#ba68c8)",
                    fontWeight: "bold",
                    color: "white",
                    borderRadius: 3,
                    py: 1.2,
                    boxShadow: "0 0 15px rgba(255,255,255,0.2)",
                    "&:hover": { boxShadow: "0 0 30px rgba(0,255,255,0.5)" },
                  }}
                >
                  {p}
                </Button>
              </Grid>
            ))}
          </Grid>
          <Typography variant="body2" sx={{ mt: 3, opacity: 0.7 }}>
            💡 Chỉ áp dụng khi provider hiện tại là STANDARD hoặc chưa gán.
          </Typography>
        </DialogContent>
      </Dialog>

      {selectedOrderId && (
        <OrderDetail
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snack.severity as any}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

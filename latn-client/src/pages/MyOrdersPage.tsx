import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Divider,
  Fade,
} from "@mui/material";
import {
  Visibility,
  LocalShipping,
  Payment,
  CheckCircle,
  CancelOutlined,
  WarningAmberRounded,
} from "@mui/icons-material";
import api from "../api/axios";
import dayjs from "dayjs";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ✅ Trạng thái dialog xác nhận hủy
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // 🧩 Mở hộp thoại xác nhận
  const openCancelConfirm = (id: string) => {
    setPendingCancelId(id);
    setConfirmOpen(true);
  };

  // 🧩 Xác nhận hủy / hoàn tiền
  const confirmCancelOrder = async () => {
    if (!pendingCancelId) return;
    try {
      setCancelLoading(true);
      await api.patch(`/order/${pendingCancelId}/cancel`);
      setConfirmOpen(false);
      fetchOrders();
    } catch (err) {
      alert("❌ Không thể hủy đơn hàng này. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setCancelLoading(false);
    }
  };

  // 🧩 Tải danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/order");
      setOrders(res.data);
    } catch (err) {
      console.error("❌ Lỗi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Tải chi tiết đơn
  const fetchDetail = async (id: string) => {
    try {
      setDetailLoading(true);
      const res = await api.get(`/order/${id}`);
      setSelected(res.data);
    } catch (err) {
      console.error("❌ Lỗi tải chi tiết đơn hàng:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
      case "DELIVERED":
        return "success";
      case "PROCESSING":
      case "SHIPPED":
        return "info";
      case "PENDING":
        return "warning";
      case "FAILED":
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box
      sx={{
        background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
        minHeight: "100vh",
        p: { xs: 2, md: 4 },
      }}
    >
      {/* 🌈 Header */}
      <Box
        sx={{
          mb: 3,
          textAlign: "center",
          p: 2,
          borderRadius: 2,
          background: "linear-gradient(90deg, #007bff, #00c4ff)",
          color: "white",
          boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          🧾 Lịch sử đơn hàng của bạn
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Cảm ơn bạn đã mua sắm tại <b>LATN</b> 💙
        </Typography>
      </Box>

      {/* 🧮 Bảng đơn hàng */}
      {orders.length === 0 ? (
        <Typography textAlign="center" color="text.secondary" mt={5}>
          Bạn chưa có đơn hàng nào.
        </Typography>
      ) : (
        <Fade in>
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: 2,
              boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
              overflowX: "auto",
            }}
          >
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f4f7ff" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Mã đơn hàng</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ngày tạo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tổng tiền</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Thanh toán</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Giao hàng</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {orders.map((o) => {
                  const created = new Date(o.createdAt);
                  const daysSince =
                    (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
                  const canCancel =
                    daysSince <= 1 ||
                    (daysSince > 7 &&
                      ["DRAFT", "PENDING"].includes(o.fulfillmentStatus));

                  return (
                    <TableRow
                      key={o.id}
                      hover
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f9fcff",
                          transition: "0.2s",
                        },
                      }}
                    >
                      <TableCell>
                        <Typography fontWeight={600} color="primary">
                          {o.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {dayjs(o.createdAt).format("DD/MM/YYYY HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={700}>
                          {o.grandTotal?.toLocaleString("vi-VN")} ₫
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={o.paymentStatus}
                          color={getStatusColor(o.paymentStatus)}
                          size="small"
                          icon={<Payment fontSize="small" />}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={o.fulfillmentStatus}
                          color={getStatusColor(o.fulfillmentStatus)}
                          size="small"
                          icon={<LocalShipping fontSize="small" />}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                          alignItems="center"
                        >
                          {/* 👁 Xem chi tiết */}
                          <IconButton
                            color="primary"
                            onClick={() => fetchDetail(o.id)}
                            sx={{
                              "&:hover": {
                                backgroundColor: "rgba(25,118,210,0.1)",
                              },
                            }}
                          >
                            <Visibility />
                          </IconButton>

                          {/* ❌ Nút Hủy / Hoàn tiền */}
                         {canCancel && o.fulfillmentStatus !== "CANCELLED" && (
  <IconButton
    color="error"
    onClick={() => openCancelConfirm(o.id)}
    sx={{
      "&:hover": {
        backgroundColor: "rgba(211,47,47,0.1)",
      },
    }}
    title="Yêu cầu hủy / hoàn tiền"
  >
    <CancelOutlined />
  </IconButton>
)}

                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </Fade>
      )}

      {/* 🧩 Dialog Chi tiết đơn hàng */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle fontWeight={700}>
          <CheckCircle sx={{ color: "primary.main", mr: 1 }} />
          Chi tiết đơn hàng
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            selected && (
              <>
                <Typography>
                  <b>Mã đơn:</b> {selected.code}
                </Typography>
                <Typography color="text.secondary">
                  Ngày tạo:{" "}
                  {dayjs(selected.createdAt).format("DD/MM/YYYY HH:mm")}
                </Typography>
                <Typography color="text.secondary" mb={2}>
                  Trạng thái:{" "}
                  <b>
                    {selected.fulfillmentStatus} / {selected.paymentStatus}
                  </b>
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {selected.items?.map((it: any) => (
                  <Box
                    key={it.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 1.5,
                      borderRadius: 2,
                      mb: 1,
                      backgroundColor: "#f9fafb",
                      "&:hover": { backgroundColor: "#f1f7ff" },
                      transition: "0.2s",
                    }}
                  >
                    <img
                      src={
                        it.productImage ||
                        "https://via.placeholder.com/80x80?text=No+Image"
                      }
                      alt={it.name}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 8,
                        objectFit: "cover",
                        border: "1px solid #ddd",
                      }}
                    />
                    <Box flex={1}>
                      <Typography fontWeight={600}>{it.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        SKU: {it.sku} | SL: {it.qty} | Giá:{" "}
                        {it.price.toLocaleString("vi-VN")} ₫
                      </Typography>
                    </Box>
                    <Typography fontWeight={700} color="primary.main">
                      {(it.total ?? it.price * it.qty).toLocaleString("vi-VN")} ₫
                    </Typography>
                  </Box>
                ))}

                <Divider sx={{ my: 2 }} />
                <Box textAlign="right">
                  <Typography>
                    Tổng tiền hàng:{" "}
                    {selected.subtotal?.toLocaleString("vi-VN")} ₫
                  </Typography>
                  <Typography>
                    Giảm giá: -{(selected.discountTotal ?? 0).toLocaleString("vi-VN")} ₫
                  </Typography>
                  <Typography>
                    Phí vận chuyển:{" "}
                    {(selected.shippingFee ?? 0).toLocaleString("vi-VN")} ₫
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    Thành tiền: {selected.grandTotal?.toLocaleString("vi-VN")} ₫
                  </Typography>
                </Box>
              </>
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* ⚠️ Dialog xác nhận hủy / hoàn tiền */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 3,
            background: "linear-gradient(180deg, #ffffff, #f9fbff 90%)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            textAlign: "center",
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <WarningAmberRounded
            sx={{ color: "#ff9800", fontSize: 55, mb: 1 }}
          />
          <Typography variant="h6" fontWeight={700}>
            Xác nhận hủy / hoàn tiền
          </Typography>
          <Typography color="text.secondary" mt={1}>
            Bạn có chắc chắn muốn <b>yêu cầu hủy hoặc hoàn tiền</b> cho đơn hàng
            này không?
          </Typography>

          <Stack
            direction="row"
            justifyContent="center"
            spacing={2}
            mt={3}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setConfirmOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmCancelOrder}
              disabled={cancelLoading}
              startIcon={<CancelOutlined />}
            >
              {cancelLoading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
}

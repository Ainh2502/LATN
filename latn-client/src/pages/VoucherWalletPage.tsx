import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Chip,
} from "@mui/material";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency } from "../utils/formatCurrency";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderTotal: number;
  startAt: string;
  endAt: string;
  maxUses: number;
  used: number;
  userLimit: number;
  status: string;
}

interface Voucher {
  id: string;
  userId: string;
  couponCode: string;
  obtainedAt: string;
  coupon?: Coupon;
}

export default function VoucherWalletPage() {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadVouchers();
  }, [user]);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user-coupon");
      const baseList: Voucher[] = Array.isArray(res.data) ? res.data : [];

      // 🔁 Gọi tiếp API /coupon/{code} cho từng voucher
      const enriched = await Promise.all(
        baseList.map(async (v) => {
          try {
            const detail = await api.get(`/coupon/${v.couponCode}`);
            return { ...v, coupon: detail.data };
          } catch (err) {
            console.warn("Không lấy được thông tin coupon:", v.couponCode);
            return v;
          }
        })
      );

      setVouchers(enriched);
    } catch (err) {
      console.error("❌ Lỗi tải voucher:", err);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={1}>
        🎟️ Ví Voucher của bạn
      </Typography>
      <Typography color="text.secondary" mb={3}>
        (Trang này hiển thị các voucher bạn đã trúng)
      </Typography>

      {vouchers.length === 0 ? (
        <Typography color="text.secondary">
          Bạn chưa có voucher nào, hãy thử vận may ở 🎡{" "}
          <strong>Vòng quay may mắn</strong> nhé!
        </Typography>
      ) : (
        <Stack spacing={2}>
          {vouchers.map((v) => {
            const c = v.coupon;
            if (!c) {
              return (
                <Card key={v.id}>
                  <CardContent>
                    <Typography fontWeight={700}>🎁 {v.couponCode}</Typography>
                    <Typography color="text.secondary">
                      Không tìm thấy thông tin chi tiết mã này.
                    </Typography>
                  </CardContent>
                </Card>
              );
            }

            const isExpired =
              new Date(c.endAt) < new Date() || c.status !== "ACTIVE";

            return (
              <Card
                key={v.id}
                sx={{
                  borderLeft: "5px solid #1976d2",
                  opacity: isExpired ? 0.6 : 1,
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        🎁 {c.code}
                      </Typography>
                      <Typography color="text.secondary" fontSize={14}>
                        Loại: <b>{c.type}</b>
                      </Typography>
                      <Typography color="text.secondary" fontSize={14}>
                        Giá trị:{" "}
                        {c.type === "fixed"
                          ? formatCurrency(c.value)
                          : `${c.value}%`}
                      </Typography>
                      <Typography color="text.secondary" fontSize={14}>
                        Đơn tối thiểu: {formatCurrency(c.minOrderTotal)}
                      </Typography>
                      <Typography color="text.secondary" fontSize={13}>
                        Hiệu lực:{" "}
                        {new Date(c.startAt).toLocaleDateString("vi-VN")} -{" "}
                        {new Date(c.endAt).toLocaleDateString("vi-VN")}
                      </Typography>
                      <Typography color="text.secondary" fontSize={13}>
                        Lượt dùng: {c.used} / {c.maxUses}{" "}
                        (Giới hạn {c.userLimit}/người)
                      </Typography>
                  
                    </Box>
                    <Box textAlign="right">
                      <Chip
                        label={isExpired ? "Hết hạn" : "Còn hiệu lực"}
                        color={isExpired ? "default" : "success"}
                        size="small"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

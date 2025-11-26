import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import api from "../api/axios";

type Promotion = {
  id: string;
  name: string;
  type: "fixed" | "percentage";
  value: number;
  minOrderTotal: number | null;
  startAt: string;
  endAt: string;
  usageLimit: number;
  used: number;
  status: "ACTIVE" | "INACTIVE";
  scopeJson: {
    brandIds: string[];
    categoryIds: string[];
    minPrice: string | number;
    maxPrice: string | number;
  };
};

type Brand = { id: string; name: string };
type Category = { id: string; name: string };

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      // 🧩 Gọi song song 3 API
      const [promoRes, brandRes, catRes] = await Promise.all([
        api.get("/promotions"),
        api.get("/brand"),
        api.get("/category"),
      ]);
      const list = Array.isArray(promoRes.data) ? promoRes.data : [];
      setPromotions(list.filter((p) => p.status === "ACTIVE"));
      setBrands(brandRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error("❌ Lỗi tải khuyến mãi:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const renderCondition = (p: Promotion) => {
    const bnames = p.scopeJson.brandIds
      .map((id) => brands.find((b) => b.id === id)?.name)
      .filter(Boolean);
    const cnames = p.scopeJson.categoryIds
      .map((id) => categories.find((c) => c.id === id)?.name)
      .filter(Boolean);

    const parts: string[] = [];

    if (cnames.length)
      parts.push(`Danh mục áp dụng: ${cnames.join(", ")}`);
    if (bnames.length)
      parts.push(`Thương hiệu áp dụng: ${bnames.join(", ")}`);
    if (p.scopeJson.minPrice)
      parts.push(`Giá tối thiểu: ${Number(p.scopeJson.minPrice).toLocaleString()}₫`);
    if (p.scopeJson.maxPrice)
      parts.push(`Giá tối đa: ${Number(p.scopeJson.maxPrice).toLocaleString()}₫`);

    return parts.length
      ? parts.join(" • ")
      : "Áp dụng cho toàn bộ sản phẩm";
  };

  const renderDiscount = (p: Promotion) =>
    p.type === "fixed"
      ? `Giảm ${p.value.toLocaleString()}₫`
      : `Giảm ${p.value}%`;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 6, px: 2 }}>
      <Typography
        variant="h4"
        fontWeight={800}
        textAlign="center"
        sx={{
          mb: 5,
          color: "#d32f2f",
          textTransform: "uppercase",
          textShadow: "0 0 10px rgba(255,0,0,0.5)",
        }}
      >
        🎁 Các chương trình khuyến mãi đang diễn ra
      </Typography>

      {loading ? (
        <Box textAlign="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : promotions.length === 0 ? (
        <Typography textAlign="center" color="text.secondary">
          Hiện chưa có chương trình khuyến mãi nào đang hoạt động.
        </Typography>
      ) : (
        <Stack spacing={3}>
          {promotions.map((p) => (
            <Card
              key={p.id}
              sx={{
                borderRadius: 4,
                boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 30px rgba(255,0,0,0.2)",
                },
                transition: "all 0.3s",
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                  spacing={2}
                >
                  <Box flex={1}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{ color: "#b71c1c", mb: 1 }}
                    >
                      {p.name}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      {renderDiscount(p)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Thời gian áp dụng:{" "}
                      <strong>
                        {formatDate(p.startAt)} → {formatDate(p.endAt)}
                      </strong>
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ mt: 0.5, color: "#444", whiteSpace: "pre-line" }}
                    >
                      {renderCondition(p)}
                    </Typography>

                    {p.minOrderTotal && (
                      <Typography variant="body2" color="text.secondary">
                        Đơn hàng tối thiểu:{" "}
                        <strong>
                          {p.minOrderTotal.toLocaleString()}₫
                        </strong>
                      </Typography>
                    )}
                  </Box>

                  <Stack spacing={1} alignItems="flex-end">
                    <Chip
                      label="Đang diễn ra"
                      color="success"
                      sx={{ fontWeight: 600 }}
                    />
                    <Button
                      variant="outlined"
                      color="error"
                      href="#/voucher-wallet"
                      size="small"
                    >
                      Xem voucher
                    </Button>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  Giới hạn lượt dùng: {p.used}/{p.usageLimit}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

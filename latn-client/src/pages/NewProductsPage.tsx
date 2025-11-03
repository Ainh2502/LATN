import { useEffect, useState } from "react";
import api from "../api/axios";
import { Box, Typography, CircularProgress } from "@mui/material";
import ProductCard, { Product as ProductCardType } from "../components/ProductCard";

export default function NewProductsPage() {
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/product")
      .then((res) => {
        const data: any[] = Array.isArray(res.data)
          ? res.data
          : res.data.items ?? [];

        // ✅ Sắp xếp theo ngày tạo mới nhất
        const sorted = [...data].sort((a, b) => {
          const dateA = new Date(a.createdAt ?? "").getTime();
          const dateB = new Date(b.createdAt ?? "").getTime();
          return dateB - dateA;
        });

        // ✅ Chuẩn hóa sang định dạng ProductCard
        const mapped: ProductCardType[] = sorted.slice(0, 10).map((p, i) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          finalPrice: p.finalPrice ?? p.price, // 🔹 kế thừa logic giá đúng
          appliedPromotion: p.appliedPromotion ?? null,
          compareAt: p.compareAt,
          shortDesc: p.shortDesc,
          images: (p.images ?? []).map((img: any, idx: number) => ({
            id: img.id ?? `${i}-${idx}`,
            url: img.url,
            isPrimary: img.isPrimary ?? idx === 0,
          })),
        }));

        setProducts(mapped);
      })
      .catch((err) => console.error("Không thể tải sản phẩm:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ px: 3, py: 4, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        🆕 Sản phẩm mới nhất
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : products.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "flex-start",
          }}
        >
          {products.map((p) => (
            <Box key={p.id} sx={{ flex: "1 1 200px", maxWidth: 250 }}>
              <ProductCard p={p} />
            </Box>
          ))}
        </Box>
      ) : (
        <Typography color="text.secondary">Không có sản phẩm mới.</Typography>
      )}
    </Box>
  );
}

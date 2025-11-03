import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import ProductCard, { Product as ProductCardType } from "../components/ProductCard";
import FilterDrawer from "../components/FilterDrawer";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";

export default function SalePage() {
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  // Bộ lọc
  const [filters, setFilters] = useState({
    brandId: "",
    categoryId: "",
    minPrice: "",
    maxPrice: "",
    sort: "",
  });

  /**
   * 🧠 Hàm lấy danh sách sản phẩm đang giảm giá
   * - Có compareAt > price  → giảm giá gốc
   * - Hoặc finalPrice < price → giảm do promotion
   */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/product", { params: filters });
      const data: any[] = Array.isArray(res.data)
        ? res.data
        : res.data.items ?? [];

      // ✅ Lọc sản phẩm đang giảm giá (đúng chuẩn ProductCard)
      const saleProducts = data.filter((p) => {
        const base = Number(p.price ?? 0);
        const compare = Number(p.compareAt ?? 0);
        const final = Number(p.finalPrice ?? base);
        return (compare > base && compare > 0) || final < base;
      });

      // ✅ Chuẩn hóa theo interface ProductCard
      const mapped: ProductCardType[] = saleProducts.map((p, i) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        finalPrice: p.finalPrice ?? p.price,
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
    } catch (err) {
      console.error("Không thể tải sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🌀 Gọi API mỗi khi bộ lọc thay đổi
  useEffect(() => {
    fetchProducts();
  }, [filters]);

  return (
    <Box sx={{ px: 3, py: 4, maxWidth: 1200, mx: "auto" }}>
      {/* Header + Nút Bộ lọc */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          🔥 Sản phẩm đang giảm giá
        </Typography>

{/* 🔘 Nút bộ lọc nổi (ẩn khi Drawer mở) */}
{!filterOpen && (
  <Box
    sx={{
      position: "fixed",
      top: 90, // khoảng cách từ top xuống, điều chỉnh theo layout header của bạn
      right: 40,
      zIndex: 2000,
    }}
  >
    <Button
      variant="contained"
      startIcon={<FilterAltOutlinedIcon sx={{ fontSize: 20 }} />}
      onClick={() => setFilterOpen(true)}
      sx={{
        borderRadius: 999,
        px: 3,
        py: 1.2,
        fontWeight: 700,
        textTransform: "none",
        backgroundColor: "#000", // nền đen
        color: "#FFD700", // ✨ vàng kim sang trọng
        boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
        "&:hover": {
          backgroundColor: "#111",
          color: "#ffea70", // vàng sáng hơn khi hover
          transform: "translateY(-2px)",
          boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
        },
        transition: "all 0.25s ease",
      }}
    >
      Bộ lọc
    </Button>
  </Box>
)}

      </Box>

      {/* Nội dung danh sách */}
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
        <Typography color="text.secondary">
          Hiện chưa có sản phẩm giảm giá.
        </Typography>
      )}

      {/* Drawer bộ lọc */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(values) =>
          setFilters(values as {
            brandId: string;
            categoryId: string;
            minPrice: string;
            maxPrice: string;
            sort: string;
          })
        }
      />
    </Box>
  );
}

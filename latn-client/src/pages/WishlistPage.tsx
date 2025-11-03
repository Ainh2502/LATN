import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";
import { Product } from "../components/ProductCard";

export default function WishlistPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      nav("/login");
      return;
    }

    const fetchWishlist = async () => {
      try {
        // 🔹 gọi API trực tiếp như ProductList.tsx
        const res = await api.get("/wishlist", { params: { userId: user.id } });

        // backend trả về danh sách wishlist (có product)
        const list = Array.isArray(res.data) ? res.data : [];
        // nếu bạn include product trong service thì dùng:
        const productList = list.map((w) => w.product || w);
        setProducts(productList);
      } catch (err) {
        console.error("❌ Lỗi tải wishlist:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ px: 4, py: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        💖 Danh sách yêu thích
      </Typography>

      {products.length === 0 ? (
        <Typography color="text.secondary">
          Bạn chưa thêm sản phẩm nào vào wishlist.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          {products.map((p) => (
            <Box key={p.id} sx={{ width: { xs: "48%", sm: "31%", md: "23%" } }}>
              <ProductCard p={p} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

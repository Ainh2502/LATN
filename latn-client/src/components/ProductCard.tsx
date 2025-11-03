import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency } from "../utils/formatCurrency";
import api from "../api/axios";

export interface Product {
  id: string;
  name: string;
  price: number;
  finalPrice?: number;
  appliedPromotion?: {
    id: string;
    name: string;
    type: string;
    value: number;
  } | null;
  compareAt?: number;
  shortDesc?: string;
  images?: { id: string; url: string; isPrimary: boolean }[];
}

export default function ProductCard({ p }: { p: Product }) {
  const nav = useNavigate();
  const { user, token } = useAuth();
  const img =
    p.images?.[0]?.url || "https://via.placeholder.com/600x800?text=Product";

  const [inWishlist, setInWishlist] = useState(false);

  // 🧩 Tải trạng thái yêu thích ban đầu
  useEffect(() => {
    if (user && token) {
      checkWishlist();
    }
  }, [user?.id, token, p.id]);

  const checkWishlist = async () => {
    try {
      const res = await api.get("/wishlist");
      const found = Array.isArray(res.data)
        ? res.data.some((item: any) => item.productId === p.id)
        : false;
      setInWishlist(found);
    } catch (err) {
      console.warn("❌ Lỗi tải wishlist:", err);
    }
  };

  const toggleWishlist = async () => {
  if (!user || !token) {
    alert("⚠️ Vui lòng đăng nhập để thêm vào yêu thích.");
    nav("/login");
    return;
  }

  try {
    if (inWishlist) {
      await api.delete("/wishlist", {
        data: { userId: user.id, productId: p.id },
      });
      setInWishlist(false);
    } else {
      await api.post("/wishlist", { userId: user.id, productId: p.id });
      setInWishlist(true);
    }
  } catch (err) {
    console.error("❌ Lỗi khi thao tác wishlist:", err);
  }
};


  // ✅ Logic hiển thị giá & khuyến mãi
  const basePrice = Number(p.price ?? 0);
  const finalPrice = Number(p.finalPrice ?? p.price ?? 0);
  const compareAt = Number(p.compareAt ?? 0);

  const hasPromotion = finalPrice < basePrice;
  const hasCompareDiscount = !hasPromotion && compareAt > basePrice;

  const percentByPromotion = hasPromotion
    ? Math.round(((basePrice - finalPrice) / basePrice) * 100)
    : 0;
  const percentByCompare = hasCompareDiscount
    ? Math.round(((compareAt - basePrice) / compareAt) * 100)
    : 0;

  const discountPercent = hasPromotion ? percentByPromotion : percentByCompare;
  const displayPrice = hasPromotion ? finalPrice : basePrice;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {/* 🖼 Hình ảnh sản phẩm */}
      <Box
        sx={{
          position: "relative",
          borderRadius: 2,
          overflow: "hidden",
          aspectRatio: "3/4",
          bgcolor: "#f5f5f5",
          cursor: "pointer",
          transition: "all 0.4s ease",
          "& img": {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease, filter 0.3s ease",
          },
          "&:hover img": {
            transform: "scale(1.08)",
            filter: "brightness(1.08)",
          },
          "&:hover": {
            boxShadow: "0 0 15px 3px rgba(0, 123, 255, 0.45)",
            border: "2px solid #007BFF",
          },
        }}
        onClick={() => nav("/product/" + p.id)}
      >
        <img alt={p.name} src={img} />

        {/* ❤️ Wishlist */}
        <Tooltip title={inWishlist ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist();
            }}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(255,255,255,0.9)",
              "&:hover": { bgcolor: "#fff" },
            }}
          >
            {inWishlist ? (
              <Favorite sx={{ color: "#e53935" }} />
            ) : (
              <FavoriteBorder sx={{ color: "#555" }} />
            )}
          </IconButton>
        </Tooltip>

        {/* 🔥 Badge giảm giá */}
        {discountPercent > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              bgcolor: "#d32f2f",
              color: "#fff",
              px: 1.2,
              py: 0.4,
              fontSize: 13,
              fontWeight: 700,
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            -{discountPercent}%
          </Box>
        )}

        {/* 🏷 Tên khuyến mãi */}
        {p.appliedPromotion && (
          <Chip
            label={p.appliedPromotion.name}
            color="primary"
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              left: 8,
              bgcolor: "#1976d2",
              color: "#fff",
              fontSize: 12,
            }}
          />
        )}
      </Box>

      {/* 🏷 Tên sản phẩm */}
      <Typography sx={{ fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>
        {p.name}
      </Typography>

      {/* 💰 Giá */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {(hasPromotion || hasCompareDiscount) && (
          <Typography
            sx={{
              color: "#999",
              textDecoration: "line-through",
              fontSize: 14,
            }}
          >
            {formatCurrency(hasPromotion ? basePrice : compareAt)}
          </Typography>
        )}
        <Typography
          sx={{
            color: hasPromotion || hasCompareDiscount ? "#d32f2f" : "#111",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {formatCurrency(displayPrice)}
        </Typography>
      </Box>

      <Button
        variant="outlined"
        onClick={() => nav("/product/" + p.id)}
        sx={{
          alignSelf: "flex-start",
          mt: 0.5,
          textTransform: "none",
          borderRadius: 2,
        }}
      >
        Xem chi tiết
      </Button>
    </Box>
  );
}

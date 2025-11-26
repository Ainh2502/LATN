import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { FilterAlt } from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard, { Product } from "../components/ProductCard";
import FilterDrawer from "../components/FilterDrawer";
import FashionIconSet from "../components/FashionIconSet";

type Category = {
  id: string;
  name: string;
  imageUrl?: string;
};

export default function ProductList() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [sort, setSort] = useState("new");
  const [openFilter, setOpenFilter] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});

  /** 🎬 Banner animation */
  const banner =
    "https://sohanews.sohacdn.com/thumb_w/640/160588918557773824/2021/9/7/photo1630987380254-16309873819061200919572.gif";

  /** 📦 Load categories */
  useEffect(() => {
    api
      .get("/category")
      .then((res) => setCategories(res.data || []))
      .catch(() => {})
      .finally(() => setLoadingCat(false));
  }, []);

  /** 🔁 Đồng bộ filters từ URL (ví dụ: /products?category=Áo thun&brand=Nike) */
  useEffect(() => {
    const fromUrl: Record<string, any> = {};
    params.forEach((v, k) => {
      if (v !== "" && v != null) fromUrl[k] = v;
    });
    setFilters((prev) => ({ ...prev, ...fromUrl }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  /** 📡 Lắng nghe sự kiện "latn:search" từ SearchBar (không cần reload trang) */
  useEffect(() => {
    const onSearch = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const keyword = (typeof detail === "string" ? detail : "").trim();
      if (!keyword) return;
      setFilters((prev) => ({ ...prev, name: keyword }));
    };
    window.addEventListener("latn:search", onSearch as EventListener);
    return () => window.removeEventListener("latn:search", onSearch as EventListener);
  }, []);
/** 🧹 Reset toàn bộ filters khi click lại "Sản phẩm" */
useEffect(() => {
  const onReset = () => setFilters({});
  window.addEventListener("latn:resetFilters", onReset);
  return () => window.removeEventListener("latn:resetFilters", onReset);
}, []);

  /** 🔍 Load products khi filters/sort thay đổi */
  useEffect(() => {
    const query: Record<string, any> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== "" && v != null) query[k] = v;
    });

    // map sort -> orderBy (theo backend)
    if (sort === "new") query.orderBy = "createdAt:desc";
    if (sort === "price-asc") query.orderBy = "price:asc";
    if (sort === "price-desc") query.orderBy = "price:desc";

    api
      .get("/product", { params: query })
      .then((res) => setProducts(res.data?.items ?? res.data))
      .catch(() => {});
  }, [filters, sort]);

  /** 🧰 Áp dụng khi bấm “Áp dụng bộ lọc” trong Drawer */
  const handleApplyFilter = (f: Record<string, any>) => setFilters(f);

  /** 🖱 Khi click danh mục trong phần “Danh mục” bên dưới */
  const handleClickCategory = (catName: string) => {
    setFilters((prev) => ({ ...prev, category: catName }));
  };

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", px: 3, py: 4 }}>
      {/* 🎥 Banner video full màn hình (LATN Hero Section) */}
<Box
  sx={{
    position: "relative",
    width: "100vw",
    height: "100vh",
    left: "50%",
    right: "50%",
    ml: "-50vw",
    overflow: "hidden",
    mb: 6,
    zIndex: 0,
  }}
>
  {/* 🎬 YouTube background video */}
  <Box
    sx={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      overflow: "hidden",
    }}
  >
    <iframe
      src="https://www.youtube.com/embed/BBJB6RFRX8U?autoplay=1&mute=1&loop=1&controls=0&playlist=BBJB6RFRX8U&modestbranding=1"
      title="LATN Product Banner"
      allow="autoplay; fullscreen"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "100vw",
        height: "56.25vw", // 16:9 ratio
        minHeight: "100vh",
        minWidth: "177.78vh",
        transform: "translate(-50%, -50%)",
        border: "none",
        objectFit: "cover",
      }}
    />
  </Box>

  {/* 🌟 Overlay + Slogan */}
  <Box
    sx={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      color: "#fff",
      background:
        "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.75) 100%)",
      px: 3,
      zIndex: 2,
    }}
  >
    {/* 🩶 Slogan chính (to, đậm, ở trên) */}
    <Typography
      variant="h2"
      sx={{
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.15vw",
        fontSize: "clamp(2rem, 4vw, 4.5rem)",
        lineHeight: 1.2,
        mb: 2,
        textShadow: "0 0 20px rgba(0,0,0,0.6)",
      }}
    >
      KHÁC BIỆT TRONG TỪNG ĐƯỜNG NÉT
    </Typography>

    {/* ✨ Slogan phụ (nhỏ hơn, dài hơn, ở dưới) */}
    <Typography
      variant="h6"
      sx={{
        maxWidth: "70vw",
        fontWeight: 400,
        fontSize: "clamp(1rem, 1.3vw, 1.4rem)",
        opacity: 0.9,
        lineHeight: 1.6,
        textShadow: "0 0 12px rgba(0,0,0,0.5)",
      }}
    >
      LATN – Không chỉ là thời trang, mà là phong cách sống.  
      Nơi bạn tự tin thể hiện bản sắc và sáng tạo giới hạn của chính mình.
    </Typography>
  </Box>
</Box>


      {/* 🧭 Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#111", letterSpacing: -0.5 }}>
          Tất cả sản phẩm
        </Typography>

        {/* 🔘 Nút bộ lọc nổi cố định góc phải */}
        {!openFilter && (
          <Box
            sx={{
              position: "fixed",
              top: 90,
              right: 40,
              zIndex: 2000,
            }}
          >
            <Button
              variant="contained"
              startIcon={<FilterAlt />}
              onClick={() => setOpenFilter(true)}
              sx={{
                borderRadius: 999,
                px: 3,
                py: 1.2,
                fontWeight: 700,
                textTransform: "none",
                backgroundColor: "#000",
                color: "#FFD700",
                boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                "&:hover": {
                  backgroundColor: "#111",
                  color: "#ffea70",
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

      {/* 🧭 Danh mục */}
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, mb: 2, color: "#222", textAlign: "center" }}
      >
        Danh mục
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 3,
          mb: 5,
        }}
      >
        {loadingCat ? (
          <CircularProgress size={28} />
        ) : (
          categories.map((cat) => (
            <Box
              key={cat.id}
              onClick={() => handleClickCategory(cat.name)} // ✅ lọc theo TÊN, không phải ID
              sx={{
                textAlign: "center",
                cursor: "pointer",
                transition: "0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <Box
                sx={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  background: "#f3f3f3",
                  border: "2px solid #ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.2,
                }}
              >
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    style={{
                      width: "70%",
                      height: "70%",
                      objectFit: "contain",
                      filter: "grayscale(0.5)",
                    }}
                  />
                ) : (
                  <FashionIconSet name={cat.name} size={40} />
                )}
              </Box>

              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#333",
                  maxWidth: 90,
                }}
              >
                {cat.name}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      {/* 🧩 Danh sách sản phẩm */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: { xs: "center", sm: "flex-start" },
        }}
      >
        {products.length > 0 ? (
          products.map((p) => (
            <Box key={p.id} sx={{ width: { xs: "48%", sm: "31%", md: "23%" } }}>
              <ProductCard p={p} />
            </Box>
          ))
        ) : (
          <Typography color="text.secondary" sx={{ mt: 4 }}>
            Không tìm thấy sản phẩm nào.
          </Typography>
        )}
      </Box>

      {/* 🧰 Drawer lọc */}
      <FilterDrawer
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        onApply={handleApplyFilter}
        initialFilters={filters} // ✅ truyền để hiển thị tên trong form
      />
    </Box>
  );
}

import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Divider, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ProductMegaMenu() {
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    Promise.all([api.get("/category"), api.get("/brand")])
      .then(([catRes, brRes]) => {
        setCategories(catRes.data || []);
        setBrands(brRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center", width: 800, color: "#FFD700" }}>
        <CircularProgress size={24} sx={{ color: "#FFD700" }} />
      </Box>
    );
  }

  /** 🧮 Chia mảng thành nhiều cột */
  const chunkArray = (arr: any[], size: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
    return chunks;
  };

  const categoryChunks = chunkArray(categories, 7);
  const brandChunks = chunkArray(brands, 7);

  // ✅ Helper: điều hướng /products với query theo TÊN
const goProducts = (q: Record<string, string>) => {
  // 🧹 1️⃣ Reset toàn bộ bộ lọc đang có
  window.dispatchEvent(new Event("latn:resetFilters"));

  // ⏳ 2️⃣ Chờ reset xong rồi mới gửi filter mới
  setTimeout(() => {
    const usp = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => usp.set(k, v));
    nav(`/products?${usp.toString()}`);
  }, 200);
};


  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 5,
        px: 6,
        py: 4,
        minWidth: "900px",
        maxWidth: "1200px",
        bgcolor: "#fff",
        color: "#111",
        borderRadius: 3,
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        animation: "fadeIn 0.25s ease",
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      {/* ===== DANH MỤC ===== */}
      <Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 800, mb: 1, color: "#0a192f", textTransform: "uppercase", fontSize: 15, letterSpacing: 0.5 }}
        >
          Danh mục
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          {categoryChunks.map((chunk, colIndex) => (
            <Grid item xs key={colIndex}>
              {chunk.map((c: any) => (
                <Typography
                  key={c.id}
                  onClick={() => goProducts({ category: c.name })}   // ✅ gửi TÊN category
                  sx={{
                    fontSize: 14,
                    color: "#333",
                    py: 0.5,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    "&:hover": { color: "#FFD700", fontWeight: 600 },
                  }}
                >
                  {c.name}
                </Typography>
              ))}
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ===== THƯƠNG HIỆU ===== */}
      <Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 800, mb: 1, color: "#0a192f", textTransform: "uppercase", fontSize: 15, letterSpacing: 0.5 }}
        >
          Thương hiệu
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          {brandChunks.map((chunk, colIndex) => (
            <Grid item xs key={colIndex}>
              {chunk.map((b: any) => (
                <Typography
                  key={b.id}
                  onClick={() => goProducts({ brand: b.name })}       // ✅ gửi TÊN brand
                  sx={{
                    fontSize: 14,
                    color: "#333",
                    py: 0.5,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    "&:hover": { color: "#FFD700", fontWeight: 600 },
                  }}
                >
                  {b.name}
                </Typography>
              ))}
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

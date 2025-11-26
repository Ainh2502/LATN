import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  InputBase,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  ClickAwayListener,
} from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom"; // ✅ thêm dòng này
import api from "../api/axios";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<any>(null);
  const navigate = useNavigate(); // ✅ hook điều hướng

  // Debounce gợi ý
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      api
        .get("/product", { params: { name: q } })
        .then((r) => {
          const data = r.data?.items ?? r.data;
          setSuggestions(Array.isArray(data) ? data.slice(0, 5) : []);
          setShowSuggestions(true);
        })
        .catch(() => setSuggestions([]));
    }, 300);
  }, [query]);

  const fireSearch = (keyword: string) => {
    window.dispatchEvent(new CustomEvent("latn:search", { detail: keyword }));
  };

const handleSubmit = (e?: React.FormEvent) => {
  e?.preventDefault();
  const keyword = query.trim();
  if (!keyword) return;

  // ✅ Phát sự kiện tìm kiếm toàn cục cho ProductList (nếu đang mở)
  fireSearch(keyword);

  // ✅ Điều hướng sang trang ProductList và truyền param `name`
  navigate(`/products?name=${encodeURIComponent(keyword)}`);

  setShowSuggestions(false);
};


const handleSelect = (p: any) => {
  // ✅ Tắt gợi ý ngay khi chọn
  setShowSuggestions(false);
  setQuery(""); // reset input

  // ✅ Điều hướng sang trang chi tiết sản phẩm đúng route
  navigate(`/product/${p.id}`);
};


  return (
    <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ position: "relative", flex: 1, maxWidth: 520, mx: 2 }}
      >
        <Paper
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 0.5,
            borderRadius: 999,
            border: "1px solid #ddd",
            boxShadow: "none",
          }}
        >
          <SearchOutlined sx={{ mr: 1, color: "#555" }} />
          <InputBase
            placeholder="Search sản phẩm..."
            sx={{ flex: 1 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </Paper>

     {showSuggestions && suggestions.length > 0 && (
  <Paper
    sx={{
      position: "absolute",
      top: "105%",
      left: 0,
      right: 0,
      zIndex: 1000,
      borderRadius: 2,
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    }}
  >
    <List dense disablePadding>
      {suggestions.map((p) => (
        <ListItemButton
          key={p.id}
          onMouseDown={(e) => {
            e.preventDefault();
            handleSelect(p);
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            py: 1,
            px: 1.5,
            transition: "background-color 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.04)", // ✅ hiệu ứng hover
            },
          }}
        >
          {/* 🖼️ Ảnh sản phẩm */}
          <Box
            component="img"
            src={
              p.images?.[0]?.url ||
              "https://via.placeholder.com/60x60?text=No+Image"
            }
            alt={p.name}
            sx={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 1,
              flexShrink: 0,
              bgcolor: "#f5f5f5",
            }}
          />

          {/* 📄 Tên + Giá */}
          <ListItemText
            primary={p.name}
            secondary={p.price ? `${p.price.toLocaleString()} đ` : ""}
            sx={{
              "& .MuiListItemText-primary": {
                fontWeight: 500,
                fontSize: 15,
                color: "#111",
              },
              "& .MuiListItemText-secondary": {
                color: "#666",
                fontSize: 13,
                mt: 0.3,
              },
            }}
          />
        </ListItemButton>
      ))}
    </List>
  </Paper>
)}

      </Box>
    </ClickAwayListener>
  );
}

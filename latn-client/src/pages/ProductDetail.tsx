import {
  Box,
  Typography,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Rating,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { formatCurrency } from "../utils/formatCurrency";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";

/* =====================================================
   🟡 Review Summary
===================================================== */
function ReviewSummary({ productId }: { productId: string }) {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    api
      .get(`/review/product/${productId}/summary`)
      .then((res) => setSummary(res.data))
      .catch(() => {});
  }, [productId]);

  if (!summary) return null;

  const { average, count, breakdown } = summary;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h3" fontWeight={800}>
          {average}
        </Typography>
        <Rating value={Number(average)} readOnly precision={0.5} />
        <Typography color="text.secondary">{count} lượt đánh giá</Typography>
      </Box>

      <Box sx={{ flex: 1 }}>
        {[5, 4, 3, 2, 1].map((s) => (
          <Box
            key={s}
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
          >
            <Typography width={40}>{s}★</Typography>
            <Box
              sx={{
                flex: 1,
                height: 8,
                borderRadius: 5,
                backgroundColor: "#eee",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  bgcolor: "#fbc02d",
                  width:
                    count > 0
                      ? `${(breakdown[s] / count) * 100}%`
                      : "0%",
                  transition: "0.4s",
                }}
              />
            </Box>
            <Typography color="text.secondary">
              {breakdown[s] ?? 0}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* =====================================================
   🟡 Review Form
===================================================== */
function ReviewForm({
  productId,
  onSuccess,
}: {
  productId: string;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState<number | null>(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return alert("Vui lòng chọn số sao!");
    setLoading(true);
    try {
      await api.post("/review", {
        productId,
        rating,
        title,
        content,
        userId: user?.id,
      });
      alert("✅ Gửi đánh giá thành công!");
      onSuccess();
      setRating(5);
      setTitle("");
      setContent("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể gửi đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2, p: 2, border: "1px solid #eee", borderRadius: 2 }}>
      <Stack spacing={2}>
        <Typography fontWeight={700}>Viết đánh giá của bạn</Typography>
        <Rating value={rating} onChange={(_, v) => setRating(v)} size="large" />
        <TextField
          label="Tiêu đề"
          size="small"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="Nội dung"
          size="small"
          multiline
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button
          variant="contained"
          disabled={loading}
          onClick={handleSubmit}
          sx={{ alignSelf: "flex-end" }}
        >
          {loading ? "Đang gửi..." : "Gửi đánh giá"}
        </Button>
      </Stack>
    </Box>
  );
}

/* =====================================================
   🟡 Review List + sửa / xóa review
===================================================== */
function ReviewList({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sort, setSort] = useState<"newest" | "oldest" | "highest" | "lowest">(
    "newest"
  );
  const [showForm, setShowForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const { user, getUserRole } = useAuth();

  // Dialog edit
  const [editDialog, setEditDialog] = useState({
    open: false,
    review: null as any,
    title: "",
    content: "",
    rating: 5,
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params: any = { productId, sort };
      if (ratingFilter) params.rating = ratingFilter;
      const res = await api.get("/review", { params });
      setReviews(res.data.items ?? res.data ?? []);
    } catch (err) {
      console.error("Lỗi tải đánh giá:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkPurchased = async () => {
    if (!user || getUserRole() !== "CUSTOMER") return;
    try {
      const res = await api.get("/order", {
        params: { userId: user.id, status: "DELIVERED" },
      });
      const orders = res.data?.items ?? res.data ?? [];
      const purchased = orders.some((o: any) =>
        o.items?.some((i: any) => i.productId === productId)
      );
      setCanReview(purchased);
    } catch {
      setCanReview(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    checkPurchased();
  }, [productId, sort, ratingFilter, user]);

  // 🗑️ Xóa review
  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này không?")) return;
    try {
      await api.delete(`/review/${id}`);
      alert("🗑️ Đã xóa đánh giá!");
      fetchReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể xóa đánh giá.");
    }
  };

  // ✏️ Sửa review
  const handleEditReview = (r: any) => {
    setEditDialog({
      open: true,
      review: r,
      title: r.title || "",
      content: r.content || "",
      rating: r.rating || 5,
    });
  };

  const handleEditSubmit = async () => {
    const { review, title, content, rating } = editDialog;
    try {
      await api.patch(`/review/${review.id}`, { title, content, rating });
      alert("✅ Cập nhật đánh giá thành công!");
      setEditDialog({ ...editDialog, open: false });
      fetchReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể cập nhật đánh giá.");
    }
  };

  return (
    <Box>
      {/* Filter & Sort */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          {[5, 4, 3, 2, 1].map((s) => (
            <Button
              key={s}
              size="small"
              variant={ratingFilter === s ? "contained" : "outlined"}
              onClick={() => setRatingFilter(ratingFilter === s ? null : s)}
            >
              {s}★
            </Button>
          ))}
        </Box>

        <Button
          size="small"
          onClick={() =>
            setSort((prev) =>
              prev === "newest"
                ? "oldest"
                : prev === "oldest"
                ? "highest"
                : prev === "highest"
                ? "lowest"
                : "newest"
            )
          }
        >
          Sắp xếp:{" "}
          {sort === "newest"
            ? "Mới nhất"
            : sort === "oldest"
            ? "Cũ nhất"
            : sort === "highest"
            ? "Điểm cao nhất"
            : "Điểm thấp nhất"}
        </Button>
      </Box>

      {/* Review list */}
      {loading ? (
        <Typography>Đang tải đánh giá...</Typography>
      ) : reviews.length === 0 ? (
        <Typography color="text.secondary">
          Chưa có đánh giá nào cho sản phẩm này.
        </Typography>
      ) : (
        reviews.map((r) => {
          const isOwner = user && r.user?.id === user.id;
          return (
            <Box
              key={r.id}
              sx={{
                borderBottom: "1px solid #eee",
                py: 2,
                opacity: r.status === "REJECTED" ? 0.6 : 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 0.5,
                }}
              >
                <Rating value={r.rating} readOnly size="small" />
                <Typography fontWeight={600}>{r.user?.name ?? "Ẩn danh"}</Typography>
                <Typography color="text.secondary" fontSize={13}>
                  {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                </Typography>

                {isOwner && (
                  <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="info"
                      onClick={() => handleEditReview(r)}
                    >
                      ✏️ Sửa
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteReview(r.id)}
                    >
                      🗑️ Xóa
                    </Button>
                  </Box>
                )}
              </Box>

              {r.title && (
                <Typography
                  fontWeight={600}
                  color={r.status === "REJECTED" ? "text.secondary" : undefined}
                >
                  {r.title}
                </Typography>
              )}
              {r.content && (
                <Typography color="text.secondary">{r.content}</Typography>
              )}
            </Box>
          );
        })
      )}

      {/* Form tạo mới */}
      {getUserRole() === "CUSTOMER" && (
        <Box sx={{ mt: 3 }}>
          {canReview ? (
            !showForm ? (
              <Button
                variant="outlined"
                onClick={() => setShowForm(true)}
                sx={{ fontWeight: 600 }}
              >
                ✍️ Viết đánh giá
              </Button>
            ) : (
              <ReviewForm
                productId={productId}
                onSuccess={() => {
                  setShowForm(false);
                  fetchReviews();
                }}
              />
            )
          ) : (
            <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
              Bạn chỉ có thể đánh giá sau khi đã mua và nhận hàng sản phẩm này.
            </Typography>
          )}
        </Box>
      )}

      {/* 🪄 Popup sửa review */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ ...editDialog, open: false })}>
        <DialogTitle>✏️ Chỉnh sửa đánh giá</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <Stack spacing={2} mt={1}>
            <Rating
              value={editDialog.rating}
              onChange={(_, v) => setEditDialog({ ...editDialog, rating: v || 5 })}
            />
            <TextField
              label="Tiêu đề"
              size="small"
              value={editDialog.title}
              onChange={(e) => setEditDialog({ ...editDialog, title: e.target.value })}
            />
            <TextField
              label="Nội dung"
              multiline
              minRows={3}
              value={editDialog.content}
              onChange={(e) => setEditDialog({ ...editDialog, content: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ ...editDialog, open: false })}>
            Hủy
          </Button>
          <Button variant="contained" onClick={handleEditSubmit}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* =====================================================
   🟢 Product Detail main
===================================================== */
export default function ProductDetail() {
  const { id } = useParams();
  const [p, setP] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [error, setError] = useState<string>("");
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const { add } = useCart();
  const { getUserRole, user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!id) return;
    api.get(`/product/${id}`).then((r) => setP(r.data)).catch(() => {});
    api
      .get("/product-variant", { params: { productId: id } })
      .then((r) => setVariants(r.data?.items ?? r.data ?? []))
      .catch(() => {});
  }, [id]);

  if (!p) return null;

  const basePrice = Number(p.price ?? 0);
  const finalPrice = Number(p.finalPrice ?? p.price ?? 0);
  const compareAt = Number(p.compareAt ?? 0);
  const hasPromotion = finalPrice < basePrice;
  const showCompareFallback = !hasPromotion && compareAt > basePrice;
  const percentByPromotion = hasPromotion
    ? Math.round(((basePrice - finalPrice) / basePrice) * 100)
    : 0;
  const percentByCompareAt = showCompareFallback
    ? Math.round(((compareAt - basePrice) / compareAt) * 100)
    : 0;
  const displayPercent = hasPromotion ? percentByPromotion : percentByCompareAt;
  const images: string[] =
    p.images?.map((img: any) => img.url) ??
    ["https://via.placeholder.com/800x1000?text=Product"];

  const handlePrev = () =>
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNext = () =>
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  const handleAddToCart = async () => {
    const role = getUserRole();
    if (!user) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      nav("/login");
      return;
    }
    if (role !== "CUSTOMER") {
      alert("Chỉ tài khoản khách hàng mới có thể thêm sản phẩm vào giỏ.");
      return;
    }
    if (variants.length > 0 && !selected) {
      setError("Vui lòng chọn phiên bản sản phẩm trước khi thêm vào giỏ hàng.");
      return;
    }

    try {
      await add({
        productId: p.id,
        quantity: 1,
        variantId: selected ?? undefined,
      });
      setError("");
      setSnack({
        open: true,
        message: "🛒 Thêm vào giỏ hàng thành công!",
        severity: "success",
      });
    } catch (err) {
      setSnack({
        open: true,
        message: "❌ Không thể thêm sản phẩm vào giỏ hàng.",
        severity: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        px: 2,
        py: 3,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 3,
      }}
    >
      {/* ẢNH SẢN PHẨM */}
      <Box sx={{ flex: 1 }}>
        <Box
          sx={{
            position: "relative",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#f5f5f5",
          }}
        >
          <img
            alt={p.name}
            src={images[currentImage]}
            style={{
              width: "100%",
              objectFit: "cover",
              display: "block",
              transition: "0.5s ease",
            }}
          />
          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 10,
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(255,255,255,0.8)",
                }}
              >
                <ArrowBackIosNew fontSize="small" />
              </IconButton>
              <IconButton
                onClick={handleNext}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 10,
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(255,255,255,0.8)",
                }}
              >
                <ArrowForwardIos fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      </Box>

      {/* THÔNG TIN */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" fontWeight={800}>
          {p.name}
        </Typography>
        <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
          {(hasPromotion || showCompareFallback) && (
            <Typography
              sx={{
                color: "#999",
                textDecoration: "line-through",
                fontSize: 18,
              }}
            >
              {formatCurrency(hasPromotion ? basePrice : compareAt)}
            </Typography>
          )}
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 800,
              color: hasPromotion ? "#d32f2f" : "#111",
            }}
          >
            {formatCurrency(hasPromotion ? finalPrice : basePrice)}
          </Typography>
          {displayPercent > 0 && (
            <Typography
              sx={{
                fontSize: 14,
                bgcolor: "#d32f2f",
                color: "white",
                px: 1.2,
                py: 0.2,
                borderRadius: 1,
                fontWeight: 600,
              }}
            >
              -{displayPercent}%
            </Typography>
          )}
        </Box>

        {p.shortDesc && (
          <Typography sx={{ mt: 1, color: "#555" }}>{p.shortDesc}</Typography>
        )}
{/* 🔹 BIẾN THỂ SẢN PHẨM */}
{variants.length > 0 && (
  <Box sx={{ mt: 2 }}>
    <Typography fontWeight={600} mb={1}>
      Chọn phiên bản:
    </Typography>
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {variants.map((v) => {
        const opts = v.optionJson || {};
        const labelParts = [
          opts.color && `Màu: ${opts.color}`,
          opts.size && `Size: ${opts.size}`,
        ].filter(Boolean);
        const label = labelParts.length ? labelParts.join(" • ") : v.sku;

        const disabled = v.inventory?.stockOnHand === 0;

        return (
          <Button
            key={v.id}
            variant={selected === v.id ? "contained" : "outlined"}
            disabled={disabled}
            onClick={() => setSelected(v.id)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              opacity: disabled ? 0.6 : 1,
              bgcolor: selected === v.id ? "#1976d2" : "transparent",
              color: selected === v.id ? "white" : "#333",
              "&:hover": {
                bgcolor: disabled
                  ? "transparent"
                  : selected === v.id
                  ? "#1565c0"
                  : "#e3f2fd",
              },
            }}
          >
            {label}
          </Button>
        );
      })}
    </Box>
  </Box>
)}

        <Button
          variant="contained"
          size="large"
          sx={{ mt: 3, borderRadius: 2, px: 3, py: 1.2, fontWeight: 600 }}
          onClick={handleAddToCart}
        >
          Thêm vào giỏ
        </Button>

        {/* ĐÁNH GIÁ */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" fontWeight={700} mb={2}>
            Đánh giá sản phẩm
          </Typography>
          <ReviewSummary productId={p.id} />
          <ReviewList productId={p.id} />
        </Box>

        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity={snack.severity} variant="filled">
            {snack.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

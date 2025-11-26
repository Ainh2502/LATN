import { Box, Typography, IconButton, Button } from '@mui/material';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/formatCurrency';
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { items, updateQty, remove, clear } = useCart();
  const navigate = useNavigate();

  // ✅ Giữ nguyên logic tính tổng tiền
  const total = items.reduce((sum, i) => {
    const product = i.variant?.product;
    const basePrice =
      i.priceSnap === 0 || product?.price === 0
        ? 0
        : i.priceSnap ?? product?.price ?? 0;

    return sum + basePrice * (i.quantity ?? 1);
  }, 0);

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2, py: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
        Giỏ hàng
      </Typography>

      {items.length === 0 ? (
        <Typography color="text.secondary">🛒 Giỏ hàng của bạn đang trống.</Typography>
      ) : (
        <>
          {items.map((item) => {
            const product = item.variant?.product;
            const color = item.variant?.optionJson?.color;
            const size = item.variant?.optionJson?.size;

            // ✅ Tính giá hiển thị
            const displayPrice =
              item.priceSnap === 0 || product?.price === 0
                ? 0
                : item.priceSnap ?? product?.price ?? 0;

            const basePrice = Number(product?.price ?? 0);
            const discountPercent =
              basePrice > displayPrice
                ? Math.round(((basePrice - displayPrice) / basePrice) * 100)
                : 0;

            return (
              <Box
                key={item.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #eee',
                  borderRadius: 2,
                  p: 2,
                  mb: 2,
                }}
              >
                {/* Ảnh + thông tin */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: '#f8f8f8',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={product?.images?.[0]?.url || 'https://via.placeholder.com/80'}
                      alt={product?.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>

                  <Box>
                    <Typography fontWeight={600}>
                      {product?.name} {product?.brand && `(${product.brand.name})`}
                    </Typography>
                    <Typography color="text.secondary">
                      {color && <>Màu: {color} </>}
                      {size && <> - Size: {size}</>}
                    </Typography>

                    {/* 💰 Hiển thị giá + giảm giá */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                      {discountPercent > 0 && (
                        <Typography
                          sx={{
                            textDecoration: 'line-through',
                            color: '#999',
                            fontSize: 14,
                          }}
                        >
                          {formatCurrency(basePrice)}
                        </Typography>
                      )}

                      <Typography
                        color="primary"
                        fontWeight={700}
                        sx={{ fontSize: 16 }}
                      >
                        {formatCurrency(displayPrice)}
                      </Typography>

                      {discountPercent > 0 && (
                        <Box
                          sx={{
                            bgcolor: '#d32f2f',
                            color: '#fff',
                            px: 1,
                            fontSize: 12,
                            borderRadius: '6px',
                            fontWeight: 700,
                          }}
                        >
                          -{discountPercent}%
                        </Box>
                      )}
                    </Box>

                    {/* 🎁 Quà miễn phí */}
                    {(item.priceSnap === 0 || product?.price === 0) && (
                      <Typography
                        color="success.main"
                        fontSize={14}
                        fontWeight={500}
                      >
                        🎁 Quà tặng miễn phí
                      </Typography>
                    )}

                    {/* 🏷️ Tên khuyến mãi */}
                    {product?.appliedPromotion && (
                      <Typography
                        variant="caption"
                        sx={{
                          bgcolor: '#1976d2',
                          color: '#fff',
                          px: 1,
                          py: 0.2,
                          borderRadius: '6px',
                          mt: 0.5,
                          display: 'inline-block',
                        }}
                      >
                        {product.appliedPromotion.name}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Số lượng + Xóa */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                    disabled={item.priceSnap === 0 || product?.price === 0}
                  >
                    -
                  </Button>
                  <Typography>{item.quantity}</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    disabled={item.priceSnap === 0 || product?.price === 0}
                  >
                    +
                  </Button>

                  <IconButton color="error" onClick={() => remove(item.id)}>
                    <DeleteOutline />
                  </IconButton>
                </Box>
              </Box>
            );
          })}

          {/* Tổng tiền */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2,
            }}
          >
            <Button color="error" onClick={clear}>
              Xóa tất cả
            </Button>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Tổng: {formatCurrency(total)}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/checkout")}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Thanh toán
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}

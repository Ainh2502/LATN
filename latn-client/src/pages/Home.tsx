import { Box, Typography, Stack, Fade, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import Banner from '../components/Banner';
import ProductCard, { Product } from '../components/ProductCard';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export default function Home() {
  const [top, setTop] = useState<Product[]>([]);
  const [newest, setNewest] = useState<Product[]>([]);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    api.get('/product/top-popular').then(r => setTop(r.data)).catch(() => {});
    api.get('/product/newest').then(r => setNewest(r.data)).catch(() => {});
    const t = setTimeout(() => setFadeIn(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <Box sx={{ bgcolor: '#fafafa', pb: '6vw' }}>
      {/* 🖼 Banner chính */}
      <Banner />

      {/* 🔥 Tiêu đề giới thiệu (Red Glow, auto scale) */}
      <Box
        sx={{
          maxWidth: '90vw',
          mx: 'auto',
          mt: '5vw',
          mb: '6vw',
          textAlign: 'center',
          px: '2vw',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Cinzel Decorative", serif',
            fontSize: 'clamp(1.5rem, 3vw, 3rem)',
            color: '#d32f2f',
            textShadow: `
              0 0 8px #ff1744,
              0 0 16px #ff5252,
              0 0 24px #ff8a80,
              0 0 40px rgba(255,23,68,0.8)
            `,
            letterSpacing: '0.3vw',
            fontWeight: 900,
            textTransform: 'uppercase',
            mb: '1vw',
          }}
        >
          LATN — Nơi thời trang và phong cách gặp nhau
        </Typography>

        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            color: '#4a4a4a',
            fontSize: 'clamp(0.9rem, 1.2vw, 1.25rem)',
            maxWidth: '60ch',
            mx: 'auto',
            mt: '0.8vw',
            textShadow: `
              0 0 3px #ff8a65,
              0 0 6px rgba(255, 111, 97, 0.5)
            `,
          }}
        >
          Khám phá bộ sưu tập mới nhất với những thiết kế hiện đại, năng động và đậm chất riêng.
        </Typography>
      </Box>

      {/* 🎬 Intro video kiểu Nike — auto-scale toàn màn hình */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100vh', // luôn full viewport
          overflow: 'hidden',
          mb: '10vw',
        }}
      >
        {/* Video YouTube tự scale 16:9 */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <iframe
            src="https://www.youtube.com/embed/_ni7ZmJHN84?autoplay=1&mute=1&loop=1&controls=0&playlist=_ni7ZmJHN84"
            title="LATN Intro"
            allow="autoplay; fullscreen"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100vw',
              height: '56.25vw',
              minHeight: '100vh',
              minWidth: '177.78vh',
              transform: 'translate(-50%, -50%)',
              border: 'none',
              objectFit: 'cover',
            }}
          ></iframe>
        </Box>

        {/* Overlay chữ auto-scale */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
            textAlign: 'center',
            px: '2vw',
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.15) 20%, rgba(0,0,0,0.8) 90%)',
          }}
        >
          <Typography
            variant="overline"
            sx={{
              fontSize: 'clamp(0.9rem, 1.2vw, 1.4rem)',
              letterSpacing: '0.4vw',
              mb: '1vw',
              opacity: 0.85,
            }}
          >
            LATN ORIGINAL
          </Typography>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              letterSpacing: '0.15vw',
              textTransform: 'uppercase',
              maxWidth: '70vw',
              fontSize: 'clamp(1.8rem, 3vw, 3.5rem)',
              lineHeight: 1.2,
              mb: '1.5vw',
            }}
          >
            “ĐƯỢC CHỌN VÀ CHỌN PHONG CÁCH CỦA RIÊNG MÌNH”
          </Typography>

          <Typography
            sx={{
              fontSize: 'clamp(1rem, 1.4vw, 1.2rem)',
              maxWidth: '60ch',
              opacity: 0.9,
            }}
          >
            Nơi thời trang không chỉ là quần áo — mà là tuyên ngôn cá tính.
          </Typography>
        </Box>
      </Box>

      {/* 🔥 Bán chạy nhất */}
      <Fade in={fadeIn} timeout={700}>
        <Box sx={{ maxWidth: '90vw', mx: 'auto', px: '2vw', mb: '8vw' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight={800} sx={{ fontSize: 'clamp(1.2rem, 2vw, 1.8rem)' }}>
              🔥 Bán chạy nhất
            </Typography>
            <Button
              variant="text"
              endIcon={<ArrowForwardIosIcon fontSize="small" />}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: 'clamp(0.8rem, 1vw, 1rem)' }}
              href="/products#/products"
            >
              Xem thêm
            </Button>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2vw',
              justifyContent: { xs: 'center', md: 'flex-start' },
            }}
          >
            {top.length === 0 ? (
              <Typography color="text.secondary">Chưa có sản phẩm bán chạy.</Typography>
            ) : (
              top.map((p) => (
                <Box
                  key={p.id}
                  sx={{
                    width: { xs: '46%', sm: '30%', md: '22%' },
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                >
                  <ProductCard p={p} />
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Fade>

      {/* 🪄 Banner phụ giữa (giữ tỷ lệ và scale chữ) */}
      <Box
        sx={{
          maxWidth: '92vw',
          mx: 'auto',
          borderRadius: '2vw',
          overflow: 'hidden',
          mb: '10vw',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1521335629791-ce4aec67ddaf?auto=format&fit=crop&w=1350&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: { xs: '35vw', md: '24vw' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            textShadow: '0 2px 6px rgba(0,0,0,0.4)',
          }}
        >
{/* 🎁 Banner khuyến mãi full màn hình */}
<Box
  sx={{
    position: 'relative',
    width: '100%',
    borderRadius: 0,
    overflow: 'hidden',
    my: '6vw',
  }}
>
  <Box
    sx={{
      backgroundImage:
        'url(https://anhdepfree.com/wp-content/uploads/2022/09/3d-background-red-black_24546966701.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed', // tạo cảm giác parallax nhẹ
      height: { xs: '45vw', md: '35vw' },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      color: '#fff',
      textShadow: '0 0 12px rgba(255,0,0,0.7)',
    }}
  >
    <Box
      sx={{
        bgcolor: 'rgba(0,0,0,0.5)',
        p: { xs: 3, md: 5 },
        borderRadius: 3,
        backdropFilter: 'blur(4px)',
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontFamily: '"Cinzel Decorative", serif',
          fontWeight: 900,
          mb: 3,
          fontSize: { xs: '1.5rem', md: '2.5rem' },
          letterSpacing: '0.15vw',
          textTransform: 'uppercase',
          color: '#ff4d4d',
          textShadow: `
            0 0 10px #ff1744,
            0 0 25px #f44336,
            0 0 40px rgba(255,23,68,0.8)
          `,
        }}
      >
        Hãy khám phá các chương trình khuyến mãi tuyệt vời ở đây
      </Typography>
      <Button
        variant="contained"
        size="large"
        href="#/promotions"
        sx={{
          mt: 1,
          px: { xs: 4, md: 6 },
          py: { xs: 1.2, md: 1.5 },
          borderRadius: 10,
          fontSize: { xs: '1rem', md: '1.2rem' },
          fontWeight: 700,
          letterSpacing: 1,
          background: 'linear-gradient(90deg, #ff1744, #b71c1c)',
          boxShadow: '0 0 20px rgba(255,23,68,0.6)',
          '&:hover': {
            background: 'linear-gradient(90deg, #d50000, #7f0000)',
            boxShadow: '0 0 25px rgba(255,0,0,0.8)',
          },
        }}
      >
        Khám phá ngay
      </Button>
    </Box>
  </Box>
</Box>

        </Box>
      </Box>

      {/* 🆕 Hàng mới về */}
      <Fade in={fadeIn} timeout={900}>
        <Box sx={{ maxWidth: '90vw', mx: 'auto', px: '2vw' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight={800} sx={{ fontSize: 'clamp(1.2rem, 2vw, 1.8rem)' }}>
              🆕 Hàng mới về
            </Typography>
            <Button
              variant="text"
              endIcon={<ArrowForwardIosIcon fontSize="small" />}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: 'clamp(0.8rem, 1vw, 1rem)' }}
              href="/products#/products"
            >
              Xem thêm
            </Button>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2vw',
              justifyContent: { xs: 'center', md: 'flex-start' },
            }}
          >
            {newest.length === 0 ? (
              <Typography color="text.secondary">Chưa có sản phẩm mới.</Typography>
            ) : (
              newest.map((p) => (
                <Box
                  key={p.id}
                  sx={{
                    width: { xs: '46%', sm: '30%', md: '22%' },
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                >
                  <ProductCard p={p} />
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Fade>
    </Box>
  );
}

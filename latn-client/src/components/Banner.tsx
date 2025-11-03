import { Box, Typography, Button } from '@mui/material';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material';
import api from '../api/axios';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface BannerItem {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
}

export default function Banner() {
  const nav = useNavigate();
  const sliderRef = useRef<Slider | null>(null);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/banner')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.items ?? [];
        setBanners(data.filter((b: BannerItem) => b.isActive));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 2, // ✅ hiển thị 2 banner cùng lúc
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 900,
        settings: { slidesToShow: 1, slidesToScroll: 1 }, // Mobile: 1 banner
      },
    ],
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1300,
        mx: 'auto',
        position: 'relative',
        borderRadius: 3,
        mt: 3,
        mb: 5,
        overflow: 'hidden',
      }}
    >
      {!loading && banners.length > 0 ? (
        <Slider ref={sliderRef} {...settings}>
          {banners.map((b) => (
            <Box
              key={b.id}
              sx={{
                px: 1.5,
                outline: 'none',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (b.linkUrl?.startsWith('http')) window.open(b.linkUrl, '_blank');
                else if (b.linkUrl) nav(b.linkUrl);
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: 260, md: 400 },
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.4s ease',
                  '&:hover img': { transform: 'scale(1.05)' },
                  '&:hover .overlay': { opacity: 1 },
                }}
              >
                {/* Ảnh */}
                <Box
                  component="img"
                  src={b.imageUrl}
                  alt={b.title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 1.8s ease',
                  }}
                />

                {/* Lớp phủ & text */}
                <Box
                  className="overlay"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%)',
                    opacity: 0.8,
                    display: 'flex',
                    alignItems: 'flex-end',
                    p: { xs: 2, md: 4 },
                    color: '#fff',
                    transition: 'opacity 0.4s ease',
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        opacity: 0.9,
                      }}
                    >
                      {b.linkUrl ? 'LATN Featured' : ''}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        lineHeight: 1.2,
                        textShadow: '0 2px 6px rgba(0,0,0,0.4)',
                      }}
                    >
                      {b.title}
                    </Typography>
                    {b.linkUrl && (
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          background: '#fff',
                          color: '#000',
                          borderRadius: 6,
                          textTransform: 'none',
                          px: 2.5,
                          py: 0.7,
                          fontWeight: 600,
                          '&:hover': { background: '#f2f2f2' },
                        }}
                      >
                        Mua ngay
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Slider>
      ) : (
        <Box
          sx={{
            height: { xs: 260, md: 400 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f5f5f5',
            borderRadius: 3,
          }}
        >
          <Typography color="text.secondary">
            {loading ? 'Đang tải banner...' : 'Không có banner nào hiển thị.'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

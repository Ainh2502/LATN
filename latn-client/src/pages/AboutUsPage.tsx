// src/pages/AboutUsPage.tsx
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Stack,
  Divider,
  Button,
  IconButton,
} from "@mui/material";
import { Facebook, Instagram, GitHub, ArrowForward } from "@mui/icons-material";

const members = [
  {
    name: "2001220163 - Trần Hữu Ái Anh",
    role: "Backend & Mobile Developer",
    avatar:
      "https://cdn.giaoducthoidai.vn/images/5ff2552195f776d2e1eb49d261d05ab8123c90945897e65cdbe24dee630e80705141f421015035c4d5d2b06cf51021194ce295dc63f3ce859fc177fdbf84aebc41a8c17ff6f337cb8f60f0d9079e72e8a38e216b87514bd4f4883705fc579308cf73f2d975e8fd997c11cc880ba480c4/thomas-muller-gia-tu-doi-tuyen-duc-huyen-thoai-tu-cau-be-nhat-bong-9361.jpg",
  },
  {
    name: "2001220334 - Kim Quốc Bảo",
    role: "Frontend Web Developer",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEc0gdxNaQCd_GlziB9mBpkSFl1upP7bRprw&s",
  },
  {
    name: "2001220312 - Trần Gia Bảo",
    role: "Data & Cloud Engineer",
    avatar:
      "https://vcdn1-thethao.vnecdn.net/2025/10/15/messi-1760501152-6707-1760501435.jpg?w=460&h=0&q=100&dpr=2&fit=crop&s=UQy5pRoAHQuL3uDeC7rE7A",
  },
];

export default function AboutUsPage() {
  return (
    <Box sx={{ width: "100%", bgcolor: "#fafafa", color: "#111" }}>
      {/* 🎥 Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 300, md: 400 },
          backgroundImage:
            "url(https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1400&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textAlign: "center",
          px: 2,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.45)",
          }}
        />
        <Box sx={{ position: "relative", zIndex: 2, maxWidth: 800 }}>
          <Typography variant="h3" fontWeight={700} mb={2}>
            LATN – Be Yourself, Be Timeless
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Chúng tôi kết hợp công nghệ và phong cách để mang lại trải nghiệm
            thời trang hiện đại và cá nhân hóa nhất.
          </Typography>
        </Box>
      </Box>

      {/* 🌱 Sứ mệnh và giá trị */}
      <Box sx={{ py: 6, px: 3, maxWidth: 1000, mx: "auto", textAlign: "center" }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
          🌟 Sứ Mệnh & Giá Trị Cốt Lõi
        </Typography>
        <Typography color="text.secondary" mb={4}>
          LATN hướng đến việc kết nối con người thông qua thời trang và công
          nghệ. Chúng tôi không chỉ bán sản phẩm – mà mang đến phong cách sống.
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          justifyContent="center"
        >
          {[
            { icon: "💎", title: "Chất Lượng Hàng Đầu", desc: "Cam kết sản phẩm được chọn lọc kỹ lưỡng, đạt chuẩn quốc tế." },
            { icon: "🌿", title: "Bền Vững", desc: "Phát triển thời trang thân thiện môi trường và cộng đồng." },
            { icon: "💬", title: "Khách Hàng Là Trung Tâm", desc: "Cá nhân hóa trải nghiệm, lắng nghe và thấu hiểu bạn." },
            { icon: "🚀", title: "Công Nghệ Dẫn Đầu", desc: "Ứng dụng AI & Big Data tối ưu hoá mua sắm thông minh." },
          ].map((v) => (
            <Card
              key={v.title}
              sx={{
                flex: 1,
                minWidth: 230,
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                p: 3,
                transition: "0.3s",
                "&:hover": { transform: "translateY(-5px)" },
              }}
            >
              <Typography fontSize={40}>{v.icon}</Typography>
              <Typography variant="h6" fontWeight={700} mt={1}>
                {v.title}
              </Typography>
              <Typography color="text.secondary" mt={1}>
                {v.desc}
              </Typography>
            </Card>
          ))}
        </Stack>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* 👥 Đội ngũ phát triển */}
      <Box sx={{ px: 3, py: 4, maxWidth: 1000, mx: "auto", textAlign: "center" }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
          👥 Đội Ngũ Phát Triển
        </Typography>
        <Typography color="text.secondary" mb={4}>
          Chúng tôi là những sinh viên đam mê công nghệ và thời trang – cùng
          xây dựng hệ thống thương mại điện tử LATN từ backend, web đến mobile.
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 3,
          }}
        >
          {members.map((m) => (
            <Card
              key={m.name}
              sx={{
                width: 260,
                borderRadius: 3,
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                transition: "0.3s",
                "&:hover": { transform: "translateY(-5px)" },
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Avatar
                  src={m.avatar}
                  alt={m.name}
                  sx={{
                    width: 120,
                    height: 120,
                    mx: "auto",
                    mb: 2,
                    border: "3px solid #0a1929",
                  }}
                />
                <Typography fontWeight={600}>{m.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {m.role}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* 📩 Liên hệ */}
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          Kết Nối Với Chúng Tôi
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Mọi ý kiến đóng góp, hợp tác hoặc thắc mắc – chúng tôi luôn sẵn sàng
          lắng nghe.
        </Typography>

        <Stack direction="row" justifyContent="center" spacing={2} mb={4}>
          <IconButton href="https://facebook.com" target="_blank">
            <Facebook />
          </IconButton>
          <IconButton href="https://instagram.com" target="_blank">
            <Instagram />
          </IconButton>
          <IconButton href="https://github.com" target="_blank">
            <GitHub />
          </IconButton>
        </Stack>

        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForward />}
          href="/products"
          sx={{ borderRadius: 3, px: 4, py: 1.5 }}
        >
          Khám Phá Bộ Sưu Tập Mới
        </Button>
      </Box>
    </Box>
  );
}

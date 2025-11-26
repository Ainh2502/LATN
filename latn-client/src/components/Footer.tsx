import { Box, Typography, Button, Link } from "@mui/material";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";

export default function Footer() {
  return (
    <Box
      sx={{
        bgcolor: "#f9f9f9",
        color: "#111",
        mt: 6,
        borderTop: "1px solid #ddd",
        pt: 4,
        pb: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: 2,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "center", md: "flex-start" },
          gap: 4,
        }}
      >
        {/* LEFT - Liên hệ */}
        <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
          <Typography variant="h6" fontWeight={700} mb={1}>
            LATN Store
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <EmailOutlinedIcon sx={{ fontSize: 20, mr: 1 }} />
            <Typography>
              <Link
                href="mailto:tranhuuaianh1602@gmail.com"
                underline="hover"
                color="inherit"
              >
                tranhuuaianh1602@gmail.com
              </Link>
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <RoomOutlinedIcon sx={{ fontSize: 20, mr: 1 }} />
            <Typography>
              Trụ sở chính: 140 Lê Trọng Tấn, Tây Thạnh, Tân Phú, TP. Hồ Chí Minh
            </Typography>
          </Box>

          {/* Nút Facebook */}
          <Button
            fullWidth
            variant="contained"
            startIcon={<FacebookOutlinedIcon />}
            href="https://www.facebook.com/tranhuu.aianh"
            target="_blank"
            sx={{
              bgcolor: "#1877F2",
              textTransform: "none",
              borderRadius: 20,
              py: 1.2,
              mb: 1.5,
              maxWidth: 300,
              "&:hover": { bgcolor: "#145DBF" },
            }}
          >
            Liên hệ chuyên viên tư vấn
          </Button>

          {/* Nút Zalo */}
          <Button
            fullWidth
            variant="contained"
            startIcon={<ChatOutlinedIcon />}
            href="https://zalo.me/0866974996"
            target="_blank"
            sx={{
              bgcolor: "#0068FF",
              textTransform: "none",
              borderRadius: 20,
              py: 1.2,
              maxWidth: 300,
              "&:hover": { bgcolor: "#0050C8" },
            }}
          >
            Liên hệ qua Zalo
          </Button>
        </Box>

        {/* RIGHT - Google Map */}
        <Box
          sx={{
            width: { xs: "100%", md: 500 },
            height: 260,
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <iframe
            title="Google Map LATN"
            src="https://www.google.com/maps?q=140%20L%C3%AA%20Tr%E1%BB%8Dng%20T%E1%BA%A5n,%20T%C3%A2y%20Th%E1%BA%A1nh,%20T%C3%A2n%20Ph%C3%BA,%20Th%C3%A0nh%20ph%E1%BB%91%20H%E1%BB%93%20Ch%C3%AD%20Minh,%20Vi%E1%BB%87t%20Nam&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
          ></iframe>
        </Box>
      </Box>

      {/* Copyright */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: "center", mt: 3 }}
      >
        © 2025 LATN. All rights reserved.
      </Typography>
    </Box>
  );
}

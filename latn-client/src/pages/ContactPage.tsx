import { Box, Typography, Card, CardContent } from "@mui/material";

export default function ContactPage() {
  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        📞 Liên hệ
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={1}>
            Trần Hữu Ái Anh
          </Typography>
          <Typography color="text.secondary" mb={1}>
            Điện thoại: <strong>0866 974 996</strong>
          </Typography>
          <Typography color="text.secondary">
            Email:{" "}
            <a
              href="mailto:tranhuuaianh1602@gmail.com"
              style={{ color: "#0a1929", textDecoration: "none" }}
            >
              tranhuuaianh1602@gmail.com
            </a>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

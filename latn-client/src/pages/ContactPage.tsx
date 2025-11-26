import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Email,
  Phone,
  GitHub,
  LocationOn,
  Cake,
  Person,
  School,
  Work,
  Star,
  Favorite,
} from "@mui/icons-material";

export default function ContactPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f9fafb",
        py: 6,
        px: { xs: 2, sm: 4, md: 8 },
      }}
    >
      <Card
        sx={{
          maxWidth: 900,
          mx: "auto",
          borderRadius: 4,
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(90deg, #1976d2, #42a5f5)",
            color: "white",
            py: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" fontWeight={800}>
            Trần Hữu Ái Anh
          </Typography>
          <Typography variant="h6">💻 Lập trình viên</Typography>
        </Box>

        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Grid container spacing={4}>
            {/* ========== Cột trái ========= */}
            <Grid item xs={12} md={5}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                📇 Thông tin liên hệ
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Phone color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="0866 974 996" />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Email color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <a
                        href="mailto:tranhuuaianh1602@gmail.com"
                        style={{ color: "#1976d2", textDecoration: "none" }}
                      >
                        tranhuuaianh1602@gmail.com
                      </a>
                    }
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <LocationOn color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="26B Thân Nhân Trung, P.13, Q.Tân Bình, TP.HCM" />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Cake color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="25/02/2004" />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Person color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Nam" />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <GitHub color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <a
                        href="https://github.com/Ainh2502"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#1976d2", textDecoration: "none" }}
                      >
                        github.com/Ainh2502
                      </a>
                    }
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" fontWeight={700} mb={1}>
                🎯 Mục tiêu nghề nghiệp
              </Typography>
              <Typography color="text.secondary" fontSize={15}>
                Sinh viên năm 3 ngành CNTT, định hướng phát triển phần mềm di
                động và web. Mong muốn được thực tập tại công ty công nghệ để
                rèn luyện kỹ năng lập trình mobile (Flutter/Android) và phát
                triển web với C#, ASP.NET. Luôn sẵn sàng học hỏi, làm việc nhóm
                và tiếp nhận công nghệ mới.
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" fontWeight={700} mb={1}>
                ✏️ Kỹ năng
              </Typography>
              <Typography color="text.secondary" fontSize={15}>
                • Java, Dart, C# <br />
                • Flutter, Android Studio <br />
                • ASP.NET Core MVC, Razor Pages <br />
                • SQL Server, Firebase, SQLite <br />
                • Visual Studio, VS Code, Git, GitHub <br />
                • OOP, RESTful API, MVC, Git
              </Typography>
            </Grid>

            {/* ========== Cột phải ========= */}
            <Grid item xs={12} md={7}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                🎓 Học vấn
              </Typography>
              <Typography fontWeight={600}>
                Đại học Công Thương TP. HCM
              </Typography>
              <Typography color="text.secondary" mb={2}>
                Cử nhân Công nghệ Thông tin (2022 – nay) • GPA: 3.13/4.0
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" fontWeight={700} mb={2}>
                💼 Kinh nghiệm làm việc
              </Typography>

              <Typography fontWeight={600}>Flutter Developer (2024 - nay)</Typography>
              <Typography color="text.secondary" fontSize={15} mb={1}>
                Dự án cá nhân • Thời gian: 02/2025 – 05/2025
              </Typography>
              <Typography color="text.secondary" fontSize={15}>
                Ứng dụng luyện thi GPLX với hơn 600 câu hỏi, thi thử, giải thích
                chi tiết, thống kê điểm và lịch sử làm bài.  
                <br />💻 Công nghệ: Flutter, Dart, JSON, SharedPreferences.  
                <br />🎯 Vai trò: Full-stack mobile developer.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography fontWeight={600}>Web Developer (2024 - nay)</Typography>
              <Typography color="text.secondary" fontSize={15} mb={1}>
                Dự án cá nhân • Thời gian: 09/2024 – 12/2024
              </Typography>
              <Typography color="text.secondary" fontSize={15}>
                Website quản lý bán hàng nội bộ (ASP.NET Core, Entity Framework,
                SQL Server, Bootstrap 5) — quản lý sản phẩm, đơn hàng, khách
                hàng, báo cáo doanh thu.  
                <br />🎯 Vai trò: Backend & Frontend Developer.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" fontWeight={700} mb={2}>
                ⭐ Hoạt động
              </Typography>
              <Typography fontWeight={600}>CLB HSS (HUIT Soft Skill) • 2022 - 2023</Typography>
              <Typography color="text.secondary" fontSize={15}>
                Tham gia workshop về giao tiếp, làm việc nhóm, quản lý thời gian
                và thuyết trình. Rèn luyện kỹ năng mềm, tư duy phản biện, tăng
                tự tin khi trình bày trước đám đông.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" fontWeight={700} mb={1}>
                ❤️ Sở thích
              </Typography>
              <Typography color="text.secondary" fontSize={15}>
                • Đọc sách <br />• Xem phim <br />• Nghe nhạc
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

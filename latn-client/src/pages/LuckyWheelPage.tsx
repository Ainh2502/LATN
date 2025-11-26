import { useRef, useState, useEffect } from "react";
import { Box, Button, Typography, Snackbar, Alert } from "@mui/material";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

const prizes = [
  { icon: "🎟️", label: "Voucher đặc biệt", color: "#002b5c", type: "voucher" },
  { icon: "🎁", label: "Quà bí ẩn", color: "#003c82", type: "gift" },
  { icon: "🎟️", label: "Voucher cao cấp", color: "#004ba0", type: "voucher" },
  { icon: "😢", label: "Chúc bạn\nmay mắn\nlần sau", color: "#001f3f", type: "lose" },
  { icon: "🎟️", label: "Voucher ngẫu nhiên", color: "#005bbb", type: "voucher" },
  { icon: "🎁", label: "Quà bất ngờ", color: "#006ee6", type: "gift" },
];

export default function LuckyWheelPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });
  const { user } = useAuth();

  const radius = 230;
  const center = { x: 250, y: 250 };

  // 🎨 Vẽ bánh xe
  const drawWheel = (ctx: CanvasRenderingContext2D, rotation: number) => {
    const sliceAngle = (2 * Math.PI) / prizes.length;
    ctx.clearRect(0, 0, 500, 500);
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);

    prizes.forEach((p, i) => {
      const start = i * sliceAngle;
      const end = start + sliceAngle;
      const gradient = ctx.createLinearGradient(0, 0, radius, radius);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(1, "#0077ff");
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#00bfff";
      ctx.stroke();

      const mid = start + sliceAngle / 2;
      ctx.save();
      ctx.rotate(mid);
      ctx.translate(radius * 0.72, 0);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = "#fff";
      ctx.font = "22px 'Poppins', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.icon, 0, -10);
      ctx.font = "bold 13px 'Poppins', sans-serif";
      p.label.split("\n").forEach((line, idx) => {
        ctx.fillText(line, 0, 18 + idx * 14);
      });
      ctx.restore();
    });

    // Viền phát sáng xanh điện
    ctx.beginPath();
    ctx.arc(0, 0, radius + 8, 0, 2 * Math.PI);
    ctx.strokeStyle = "#00c8ff";
    ctx.lineWidth = 6;
    ctx.shadowBlur = 25;
    ctx.shadowColor = "#00e5ff";
    ctx.stroke();
    ctx.restore();
  };

  // 🔄 Animation quay
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    let currentAngle = angle;
    let currentVelocity = velocity;
    let frame: number;

    const animate = () => {
      if (!spinning) {
        drawWheel(ctx, currentAngle);
        return;
      }

      currentAngle += currentVelocity;
      currentVelocity *= 0.985;
      if (currentVelocity < 0.002) {
        setSpinning(false);
        const totalDeg = (currentAngle * 180) / Math.PI;
        const slice = 360 / prizes.length;
        const prizeIndex =
          Math.floor(((totalDeg % 360) / slice + 0.5)) % prizes.length; // ✅ FIXED
        handlePrize(prizes[prizeIndex]);
        return;
      }

      drawWheel(ctx, currentAngle);
      frame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frame);
  }, [spinning]);

  // 🌀 Quay bánh xe
  const spinWheel = () => {
    if (spinning) return;
    if (!user) {
      setSnack({
        open: true,
        message: "⚠️ Hãy đăng nhập để quay thưởng!",
        severity: "warning",
      });
      return;
    }
    setVelocity(0.35 + Math.random() * 0.25);
    setSpinning(true);
  };

  // 🎁 Phần thưởng
  const handlePrize = async (prize: any) => {
    try {
      if (prize.type === "lose") {
        setSnack({ open: true, message: "😢 Chúc bạn may mắn lần sau!", severity: "info" });
      } else if (prize.type === "voucher") {
        const res = await api.get("/coupon/random");
        setSnack({
          open: true,
          message: `🎟️ Voucher: ${res.data.coupon?.code || res.data.code || "Bí mật!"}`,
          severity: "success",
        });
      } else if (prize.type === "gift") {
        const prodRes = await api.get("/product");
        const randomProduct = prodRes.data[Math.floor(Math.random() * prodRes.data.length)];
        await api.post(`/cart/free/${randomProduct.id}`);
        setSnack({
          open: true,
          message: `🎁 Bạn nhận miễn phí: ${randomProduct.name}`,
          severity: "success",
        });
      }
    } catch {
      setSnack({ open: true, message: "❌ Có lỗi xảy ra!", severity: "error" });
    }
  };

  // 🔻 Kim vàng trỏ xuống
  const Pointer = () => (
    <Box
      sx={{
        position: "absolute",
        top: "calc(50% - 250px)",
        left: "50%",
        transform: "translate(-50%, -45%)",
        width: 0,
        height: 0,
        borderLeft: "22px solid transparent",
        borderRight: "22px solid transparent",
        borderTop: "38px solid #ffcc00",
        filter: "drop-shadow(0 0 10px #ffeb3b)",
        zIndex: 10,
      }}
    />
  );

  // 💡 LED chạy vòng quanh
  const LEDRing = () => (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24;
        const x = 250 + 220 * Math.cos((angle * Math.PI) / 180);
        const y = 250 + 220 * Math.sin((angle * Math.PI) / 180);
        return (
          <Box
            key={i}
            sx={{
              position: "absolute",
              top: y,
              left: x,
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#00e5ff",
              boxShadow: "0 0 12px #00e5ff",
              transform: "translate(-50%, -50%)",
              animation: `blink ${1 + i * 0.05}s linear infinite`,
              "@keyframes blink": {
                "0%, 100%": { opacity: 0.2 },
                "50%": { opacity: 1 },
              },
            }}
          />
        );
      })}
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        bgcolor: "#000915",
        background: "radial-gradient(circle at center, #001a33 0%, #000915 100%)",
        color: "white",
        overflowX: "hidden",
        pt: 6,
        pb: 8,
      }}
    >
      <Box textAlign="center" mb={3}>
        <Typography variant="h3" fontWeight={900} sx={{ color: "#00e5ff" }}>
          🎯 VÒNG QUAY MAY MẮN LATN
        </Typography>
        <Typography color="rgba(255,255,255,0.7)">
          CHẮC CHẮN CÓ QUÀ — Quay để nhận phần thưởng hấp dẫn từ LATN
        </Typography>
      </Box>

      <Box
        sx={{
          position: "relative",
          width: { xs: 320, sm: 400, md: 500 },
          height: { xs: 320, sm: 400, md: 500 },
          mx: "auto",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #001a33 30%, #004ba0 90%, #001f3f 100%)",
          boxShadow:
            "0 0 50px rgba(0, 200, 255, 0.6), inset 0 0 80px rgba(0, 50, 100, 0.8)",
        }}
      >
        <canvas ref={canvasRef} width={500} height={500} />
        <LEDRing />
        <Pointer />
        <Button
          onClick={spinWheel}
          disabled={spinning}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            width: { xs: 100, sm: 120, md: 130 },
            height: { xs: 100, sm: 120, md: 130 },
            fontWeight: 800,
            fontSize: "1.3rem",
            background: "radial-gradient(circle, #ff1744 30%, #b71c1c 90%)",
            color: "white",
            boxShadow: "0 0 25px rgba(255,0,0,0.7)",
            textShadow: "0 2px 4px rgba(0,0,0,0.4)",
            "&:hover": {
              background: "radial-gradient(circle, #ff5252, #d50000)",
              boxShadow: "0 0 40px rgba(255,0,0,1)",
            },
          }}
        >
          {spinning ? "⏳" : "QUAY"}
        </Button>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity as any}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Stack,
  TextField,
  MenuItem,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InventoryIcon from "@mui/icons-material/Inventory";
import PaidIcon from "@mui/icons-material/Paid";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import api from "../api/axios";

export default function ReportDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<"day" | "month" | "year">("day");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [stockThreshold, setStockThreshold] = useState<number>(20);

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [stockData, setStockData] = useState<any[]>([]);
  const [brandData, setBrandData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [allProductsSales, setAllProductsSales] = useState<any[]>([]);
  const [sortKey, setSortKey] = useState<string>("totalRevenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [compareMonths, setCompareMonths] = useState<number[]>([]);
  const [compareData, setCompareData] = useState<any[]>([]);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedProducts = [...allProductsSales].sort((a, b) => {
    const dir = sortOrder === "asc" ? 1 : -1;
    if (sortKey === "productName") return a.productName.localeCompare(b.productName) * dir;
    else if (sortKey === "totalQty" || sortKey === "totalRevenue")
      return (a[sortKey] - b[sortKey]) * dir;
    return 0;
  });

  const handleOpenAllProducts = async () => {
    setDialogOpen(true);
    try {
      const res = await api.get(`/report/all-products-sales?from=${fromDate}&to=${toDate}`);
      setAllProductsSales(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("❌ Lỗi tải toàn bộ sản phẩm:", e);
      setAllProductsSales([]);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [period, fromDate, toDate, stockThreshold]);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const q = (p: Record<string, any>) =>
        Object.entries(p)
          .filter(([, v]) => v !== undefined && v !== "" && v !== null)
          .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
          .join("&");

      const [rev, top, stock, byBrand, byCat, total] = await Promise.all([
        api.get(`/report/revenue?${q({ period, from: fromDate, to: toDate })}`),
        api.get(`/report/top-products?${q({ from: fromDate, to: toDate, limit: 10 })}`),
        api.get(`/report/stock?${q({ threshold: stockThreshold })}`),
        api.get(`/report/revenue-by-brand?${q({ from: fromDate, to: toDate })}`),
        api.get(`/report/revenue-by-category?${q({ from: fromDate, to: toDate })}`),
        api.get(`/report/total-revenue`),
      ]);

      setRevenueData(rev.data ?? []);
      setTopProducts(top.data ?? []);
      setStockData(stock.data ?? []);
      setBrandData(byBrand.data ?? []);
      setCategoryData(byCat.data ?? []);
      setTotalRevenue(total.data?.totalRevenue ?? 0);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu báo cáo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCompareMonths(months: number[]) {
    if (months.length === 0) return setCompareData([]);
    try {
      const res = await api.get(`/report/compare-months?months=${months.join(",")}`);
      setCompareData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Lỗi tải dữ liệu so sánh tháng:", err);
    }
  }

  useEffect(() => {
    fetchCompareMonths(compareMonths);
  }, [compareMonths]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        📊 Báo cáo & Thống kê
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* 💰 Tổng doanh thu toàn shop */}
      <Card sx={{ mb: 4, p: 2, backgroundColor: "#e3f2fd", borderLeft: "6px solid #1976d2" }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <PaidIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                Tổng doanh thu toàn shop (PAID)
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary">
                {totalRevenue.toLocaleString("vi-VN")} ₫
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Bộ lọc */}
      <Box display="flex" flexWrap="wrap" justifyContent="flex-end" alignItems="center" gap={2} mb={3}>
        <TextField
          type="date"
          size="small"
          label="Từ ngày"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <TextField
          type="date"
          size="small"
          label="Đến ngày"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <TextField
          select
          size="small"
          label="Chu kỳ thống kê"
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          sx={{ width: 160 }}
        >
          <MenuItem value="day">Theo ngày</MenuItem>
          <MenuItem value="month">Theo tháng</MenuItem>
          <MenuItem value="year">Theo năm</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Dạng biểu đồ"
          value={chartType}
          onChange={(e) => setChartType(e.target.value as any)}
          sx={{ width: 160 }}
        >
          <MenuItem value="bar">Cột (Bar)</MenuItem>
          <MenuItem value="line">Đường (Line)</MenuItem>
        </TextField>
        <TextField
          size="small"
          type="number"
          label="Ngưỡng tồn kho thấp"
          value={stockThreshold}
          onChange={(e) => setStockThreshold(Math.max(0, Number(e.target.value)))}
          sx={{ width: 200 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={fetchAll} edge="end" size="small">
                  <FilterAltIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Doanh thu theo thời gian */}
      <Card sx={{ mb: 4, p: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <PaidIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight={600}>
              Doanh thu theo {period === "day" ? "ngày" : period === "month" ? "tháng" : "năm"}
            </Typography>
          </Box>

          {revenueData.length === 0 ? (
            <Typography color="text.secondary">Không có dữ liệu.</Typography>
          ) : (
            <Box sx={{ width: "100%", height: 340 }}>
              <ResponsiveContainer>
                {chartType === "bar" ? (
                  <BarChart data={revenueData}>
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" name="Doanh thu (VND)" fill="#1976d2" />
                  </BarChart>
                ) : (
                  <LineChart data={revenueData}>
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#1976d2" strokeWidth={3} dot />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* So sánh tháng */}
      <Card sx={{ mb: 4, p: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              So sánh doanh thu giữa các tháng
            </Typography>
            <TextField
              select
              size="small"
              label="Chọn tháng"
              value={compareMonths}
              onChange={(e) =>
                setCompareMonths(
                  typeof e.target.value === "string"
                    ? e.target.value.split(",").map(Number)
                    : e.target.value
                )
              }
              slotProps={{
                select: {
                  multiple: true,
                  renderValue: (selected) => (selected as number[]).join(", "),
                },
              }}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {compareData.length === 0 ? (
            <Typography color="text.secondary">Chưa chọn tháng để so sánh.</Typography>
          ) : (
            <Box sx={{ width: "100%", height: 350 }}>
              <ResponsiveContainer>
                <LineChart>
                  <XAxis dataKey="day" type="number" domain={[1, 31]} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {compareData.map((m, idx) => (
                    <Line
                      key={m.month}
                      type="monotone"
                      data={m.data}
                      dataKey="total"
                      name={`Tháng ${m.month}`}
                      stroke={`hsl(${(idx * 60) % 360}, 70%, 50%)`}
                      strokeWidth={3}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Doanh thu theo thương hiệu */}
      <Card sx={{ mb: 4, p: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Doanh thu theo Thương hiệu
          </Typography>
          {brandData.length === 0 ? (
            <Typography color="text.secondary">Không có dữ liệu.</Typography>
          ) : (
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={brandData}>
                  <XAxis dataKey="brand" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#0288d1" name="Doanh thu (VND)" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Doanh thu theo Danh mục */}
      <Card sx={{ mb: 4, p: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Doanh thu theo Danh mục
          </Typography>
          {categoryData.length === 0 ? (
            <Typography color="text.secondary">Không có dữ liệu.</Typography>
          ) : (
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={categoryData}>
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#43a047" name="Doanh thu (VND)" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Top sản phẩm */}
      <Card sx={{ mb: 4, p: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center">
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight={600}>
                Top sản phẩm bán chạy
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={handleOpenAllProducts}
            >
              Xem tất cả
            </Button>
          </Box>

          {topProducts.length === 0 ? (
            <Typography color="text.secondary">Chưa có dữ liệu bán hàng.</Typography>
          ) : (
            <Stack spacing={1.2}>
              {topProducts.map((p: any, i: number) => (
                <Box
                  key={p.productId || i}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={1.2}
                  border="1px solid #eee"
                  borderRadius={2}
                  bgcolor={i % 2 === 0 ? "#fafafa" : "white"}
                >
                  <Typography>
                    {i + 1}. {p.productName}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography fontWeight={600} color="primary">
                      {p.totalQty} sp
                    </Typography>
                    <Typography fontWeight={600}>
                      {p.totalRevenue.toLocaleString()} đ
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Popup toàn bộ sản phẩm */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>📦 Toàn bộ sản phẩm & Doanh thu</DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell onClick={() => handleSort("productName")} sx={{ cursor: "pointer", fontWeight: 600 }}>
                  Tên sản phẩm {sortKey === "productName" && (sortOrder === "asc" ? " ▲" : " ▼")}
                </TableCell>
                <TableCell align="right" onClick={() => handleSort("totalQty")} sx={{ cursor: "pointer", fontWeight: 600 }}>
                  Số lượng bán {sortKey === "totalQty" && (sortOrder === "asc" ? " ▲" : " ▼")}
                </TableCell>
                <TableCell align="right" onClick={() => handleSort("totalRevenue")} sx={{ cursor: "pointer", fontWeight: 600 }}>
                  Doanh thu (VND) {sortKey === "totalRevenue" && (sortOrder === "asc" ? " ▲" : " ▼")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedProducts.map((p: any, i: number) => (
                <TableRow key={p.productId || i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{p.productName}</TableCell>
                  <TableCell align="right">{p.totalQty}</TableCell>
                  <TableCell align="right">{p.totalRevenue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Tồn kho thấp */}
      <Card sx={{ p: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <InventoryIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight={600}>
              Sản phẩm tồn kho thấp (&lt; {stockThreshold})
            </Typography>
          </Box>

          {stockData.length === 0 ? (
            <Typography color="text.secondary">Không có sản phẩm tồn kho thấp.</Typography>
          ) : (
            <Stack divider={<Divider flexItem />} spacing={1.2}>
              {stockData.map((s: any, i: number) => (
                <Box
                  key={s.variantId || i}
                  display="flex"
                  justifyContent="space-between"
                  p={1}
                  sx={{
                    borderRadius: 2,
                    bgcolor:
                      s.stockOnHand < 5
                        ? "#ffebee"
                        : s.stockOnHand < 10
                        ? "#fffde7"
                        : "transparent",
                  }}
                >
                  <Box>
                    <Typography fontWeight={600}>{s.productName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {s.variantDesc}
                    </Typography>
                  </Box>
                  <Typography
                    fontWeight={600}
                    color={
                      s.stockOnHand < 5
                        ? "error.main"
                        : s.stockOnHand < 10
                        ? "warning.main"
                        : "text.primary"
                    }
                  >
                    {s.stockOnHand}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

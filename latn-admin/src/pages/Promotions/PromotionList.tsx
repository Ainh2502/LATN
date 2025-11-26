import React, { useEffect, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Alert,
} from "@mui/material";
import { Add, Delete, Visibility } from "@mui/icons-material";
import api from "../../api/axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

export default function PromotionList() {
  const [tab, setTab] = useState(0);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  const isCoupon = tab === 1;

  const fetchData = async () => {
    try {
      const url = isCoupon ? "/coupons" : "/promotions";
      const res = await api.get(url);
      if (isCoupon) setCoupons(res.data);
      else setPromotions(res.data);
    } catch (e) {
      console.error(e);
      setErr("Không thể tải dữ liệu.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Xác nhận xoá?")) return;
    try {
      const url = isCoupon ? "/coupons" : "/promotions";
      await api.delete(`${url}/${id}`);
      setMsg("🗑️ Đã xoá thành công");
      fetchData();
    } catch {
      setErr("Không thể xoá.");
    }
  };

  const list = isCoupon ? coupons : promotions;

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Quản lý khuyến mãi & voucher
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Chương trình khuyến mãi" />
        <Tab label="Mã giảm giá (Voucher)" />
      </Tabs>

      {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <Box textAlign="right" mb={2}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() =>
            navigate(isCoupon ? "/coupons/new" : "/promotions/new")
          }
        >
          {isCoupon ? "Thêm voucher" : "Thêm khuyến mãi"}
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tên / Mã</TableCell>
            <TableCell>Loại</TableCell>
            <TableCell>Giá trị</TableCell>
            <TableCell>Hiệu lực</TableCell>
            {isCoupon && <TableCell>Giới hạn</TableCell>}
            {!isCoupon && <TableCell>Điều kiện</TableCell>}
            <TableCell>Trạng thái</TableCell>
            <TableCell align="right">Thao tác</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {list.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{isCoupon ? row.code : row.name}</TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell>
                {row.type === "percentage"
                  ? `${row.value}%`
                  : `${row.value.toLocaleString("vi-VN")} ₫`}
              </TableCell>
              <TableCell>
                {row.startAt
                  ? `${dayjs(row.startAt).format("DD/MM/YYYY")} - ${dayjs(
                      row.endAt
                    ).format("DD/MM/YYYY")}`
                  : "Không giới hạn"}
              </TableCell>

              {isCoupon ? (
                <TableCell>{`${row.used ?? 0} / ${row.maxUses ?? "∞"}`}</TableCell>
              ) : (
                <TableCell>
                  {row.scopeJson
                    ? "Có điều kiện"
                    : "Tất cả sản phẩm"}
                </TableCell>
              )}

              <TableCell>{row.status}</TableCell>

              <TableCell align="right">
                <IconButton
                  color="primary"
                  onClick={() =>
                    navigate(
                      isCoupon
                        ? `/coupons/${row.code}/edit`
                        : `/promotions/${row.id}/edit`
                    )
                  }
                >
                  <Visibility />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(row.id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

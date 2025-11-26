import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogActions,
  Rating,
  Chip,
} from '@mui/material';
import api from '../../api/axios';

export default function ReviewList() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // 🧠 Lấy danh sách review
  useEffect(() => {
    api
      .get('/review')
      .then((res) => {
        const items = res.data?.items ?? res.data ?? [];
        setRows(items);
      })
      .catch((err) => console.error('❌ Lỗi tải danh sách review:', err))
      .finally(() => setLoading(false));
  }, []);

  // 🧨 Hàm xóa review
  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      setDeleting(true);
      await api.delete(`/review/${selectedId}`);
      setRows((prev) => prev.filter((item) => item.id !== selectedId));
    } catch (err) {
      console.error('❌ Lỗi khi xóa review:', err);
      alert('Lỗi khi xóa review!');
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setSelectedId(null);
    }
  };

  // ✅ Duyệt review
  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/review/${id}/approve`);
      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: 'APPROVED' } : r
        )
      );
    } catch (err) {
      console.error('❌ Lỗi duyệt review:', err);
      alert('Không thể duyệt đánh giá!');
    }
  };

  // 🚫 Từ chối review
  const handleReject = async (id: string) => {
    try {
      await api.patch(`/review/${id}/reject`);
      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: 'REJECTED' } : r
        )
      );
    } catch (err) {
      console.error('❌ Lỗi từ chối review:', err);
      alert('Không thể từ chối đánh giá!');
    }
  };

  const renderStatus = (status: string) => {
    const color =
      status === 'APPROVED'
        ? 'success'
        : status === 'REJECTED'
        ? 'error'
        : 'warning';
    const label =
      status === 'APPROVED'
        ? 'Đã duyệt'
        : status === 'REJECTED'
        ? 'Từ chối'
        : 'Chờ duyệt';
    return <Chip label={label} color={color as any} size="small" />;
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h5">Quản lý đánh giá sản phẩm</Typography>
      </Box>

      {/* Bảng review */}
      {loading ? (
        <CircularProgress />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Sản phẩm</TableCell>
              <TableCell>Người dùng</TableCell>
              <TableCell>Điểm</TableCell>
              <TableCell>Nội dung</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Không có đánh giá nào
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.product?.name ?? '-'}</TableCell>
                  <TableCell>{r.user?.name ?? 'Ẩn danh'}</TableCell>
                  <TableCell>
                    <Rating value={r.rating} readOnly size="small" />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    {r.content || '(Không có nội dung)'}
                  </TableCell>
                  <TableCell>
  {new Date(r.createdAt).toLocaleString('vi-VN', {
    hour12: false,
    dateStyle: 'short',
    timeStyle: 'short',
  })}
</TableCell>

                  <TableCell>{renderStatus(r.status)}</TableCell>
                  <TableCell align="center">
                    {r.status !== 'APPROVED' && (
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleApprove(r.id)}
                      >
                        Duyệt
                      </Button>
                    )}
                    {r.status !== 'REJECTED' && (
                      <Button
                        size="small"
                        color="warning"
                        sx={{ ml: 1 }}
                        onClick={() => handleReject(r.id)}
                      >
                        Từ chối
                      </Button>
                    )}
                    <Button
                      size="small"
                      color="error"
                      sx={{ ml: 1 }}
                      onClick={() => {
                        setSelectedId(r.id);
                        setConfirmOpen(true);
                      }}
                    >
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* 🔴 Hộp thoại xác nhận xóa */}
      <Dialog
        open={confirmOpen}
        onClose={() => !deleting && setConfirmOpen(false)}
      >
        <DialogTitle>Bạn có chắc chắn muốn xóa review này?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
            Hủy
          </Button>
          <Button
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {deleting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Xóa'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

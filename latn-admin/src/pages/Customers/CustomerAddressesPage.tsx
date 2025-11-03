import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

export default function CustomerAddressesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);

  const fetchData = async () => {
    const [uRes, aRes] = await Promise.all([
      api.get(`/customers/${id}`),
      api.get(`/customers/${id}/addresses`),
    ]);
    setUser(uRes.data);
    setAddresses(aRes.data);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return (
    <Box p={2}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
        Quay lại
      </Button>

      <Typography variant="h5" fontWeight={700} mt={2} mb={1}>
        Danh sách địa chỉ của khách hàng
      </Typography>

      {user && (
        <Typography variant="subtitle1" color="text.secondary" mb={2}>
          {user.name} ({user.email})
        </Typography>
      )}

      <TableContainer sx={{ border: "1px solid #eee", borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Người nhận</TableCell>
              <TableCell>SĐT</TableCell>
              <TableCell>Tỉnh/Thành</TableCell>
              <TableCell>Quận/Huyện</TableCell>
              <TableCell>Phường/Xã</TableCell>
              <TableCell>Đường / Số nhà</TableCell>
              <TableCell align="center">Mặc định</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {addresses.map((a) => (
              <TableRow key={a.id} hover>
                <TableCell>{a.recipient}</TableCell>
                <TableCell>{a.phone}</TableCell>
                <TableCell>{a.province}</TableCell>
                <TableCell>{a.district}</TableCell>
                <TableCell>{a.ward}</TableCell>
                <TableCell>{a.street}</TableCell>
                <TableCell align="center">
                  {a.isDefault ? (
                    <Typography color="success.main" fontWeight={500}>
                      ✓
                    </Typography>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))}
            {addresses.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  Chưa có địa chỉ nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

import { Box, Typography, TextField, Stack, Button } from '@mui/material';

export default function PaymentConfig() {
  return (
    <Box>
      <Typography variant="h5" mb={2}>Cấu hình thanh toán</Typography>
      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <TextField label="Stripe Secret Key" />
        <TextField label="VNPAY TMNCode" />
        <TextField label="Momo Access Key" />
        <Button variant="contained">Lưu</Button>
      </Stack>
    </Box>
  );
}

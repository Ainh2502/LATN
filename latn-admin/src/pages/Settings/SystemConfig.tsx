import { Box, Typography, TextField, Stack, Button } from '@mui/material';

export default function SystemConfig() {
  return (
    <Box>
      <Typography variant="h5" mb={2}>Cấu hình hệ thống</Typography>
      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <TextField label="Tên website" />
        <TextField label="Email hệ thống" />
        <TextField label="Múi giờ" />
        <Button variant="contained">Lưu</Button>
      </Stack>
    </Box>
  );
}

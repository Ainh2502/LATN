import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const nav = useNavigate();
  return (
    <Box sx={{ textAlign:'center', py:8 }}>
      <Typography variant="h3" gutterBottom>404</Typography>
      <Typography color="text.secondary" gutterBottom>Trang không tồn tại</Typography>
      <Button variant="contained" onClick={()=>nav('/')}>Về trang chủ</Button>
    </Box>
  );
}

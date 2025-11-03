import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h3" gutterBottom>404</Typography>
      <Typography color="text.secondary" gutterBottom>Trang không tồn tại</Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')}>Về Dashboard</Button>
    </Box>
  );
}

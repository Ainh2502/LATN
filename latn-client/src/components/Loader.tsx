import { Box, CircularProgress } from '@mui/material';

export default function Loader() {
  return (
    <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:200 }}>
      <CircularProgress />
    </Box>
  );
}

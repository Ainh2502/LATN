import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import AppRouter from './routes/AppRouter';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0a192f' },
    secondary: { main: '#111' }
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Helvetica Neue", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 }
  },
  shape: { borderRadius: 10 }
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  );
}

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#111827' }, 
    secondary: { main: '#10b981' }, 
    background: { default: '#fafafa', paper: '#ffffff' }
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { border: '1px solid #e5e7eb' }
      }
    },
    MuiButton: {
      defaultProps: { variant: 'contained' }
    }
  },
  typography: {
    fontFamily: [
      'Inter',
      'system-ui',
      'Avenir',
      'Helvetica',
      'Arial',
      'sans-serif'
    ].join(','),
  }
});

export default theme;

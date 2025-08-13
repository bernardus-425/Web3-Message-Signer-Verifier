import { PropsWithChildren } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '../theme'; // adjust path if your theme file differs

export default function TestProviders({ children }: PropsWithChildren<{}>) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

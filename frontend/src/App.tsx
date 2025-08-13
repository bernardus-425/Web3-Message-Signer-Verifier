import { useEffect, useState } from 'react';
import { useDynamicContext, useIsLoggedIn, DynamicWidget } from '@dynamic-labs/sdk-react-core';
import Auth from './components/Auth';
import Signer from './components/Signer';
import History from './components/History';
import MfaView from './components/MfaView';
import type { HistoryItem } from './types';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';

export default function App() {
  const isLoggedIn = useIsLoggedIn();
  const { handleLogOut } = useDynamicContext();

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const s = localStorage.getItem('history');
    return s ? JSON.parse(s) : [];
  });

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  return (
    <>
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Web3 Message Signer & Verifier
          </Typography>

          {isLoggedIn && (
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <DynamicWidget />
            </Box>
          )}

          {isLoggedIn && (
            <Button color="inherit" onClick={() => handleLogOut()}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>
        {isLoggedIn && (
          <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 2 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <DynamicWidget />
            </Paper>
          </Box>
        )}

        <Collapse in={!isLoggedIn} unmountOnExit>
          <Grid container spacing={3} sx={{ mb: 1 }}>
            <Grid>
              <Auth />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
        </Collapse>

        <Grid container spacing={3}>
          <Grid>
            <Collapse in={isLoggedIn} unmountOnExit>
              <MfaView />
            </Collapse>
          </Grid>

          <Grid>
            <Signer onAdd={(item) => setHistory([item, ...history])} />
          </Grid>

          <Grid>
            <History items={history} onClear={() => setHistory([])} />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

const envId = import.meta.env.VITE_DYNAMIC_ENV_ID as string;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DynamicContextProvider
      settings={{
        environmentId: envId,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </DynamicContextProvider>
  </React.StrictMode>
);

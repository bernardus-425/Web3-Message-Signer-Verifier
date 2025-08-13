import { useState, useMemo } from 'react';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import type { VerifyResponse, HistoryItem } from '../types';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import KeyIcon from '@mui/icons-material/Key';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';

const API_BASE = import.meta.env.VITE_API_BASE as string;

function shorten(addr?: string | null) {
  if (!addr) return '—';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function Signer({ onAdd }: { onAdd: (item: HistoryItem) => void }) {
  const { primaryWallet } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();

  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openResult, setOpenResult] = useState(false);

  const address = primaryWallet?.address ?? null;
  const chars = message.length;
  const maxChars = 1000;
  const canSign = isLoggedIn && !!primaryWallet && !!message && !busy && chars <= maxChars;

  const helperText = useMemo(() => `${chars}/${maxChars} characters`, [chars]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopied(false);
    }
  };

  const sign = async () => {
    if (!canSign) return;
    setBusy(true);
    setOpenResult(false);
    try {
      const sig = await primaryWallet!.signMessage(message);
      if (!sig) throw new Error('Failed to sign message');
      setSignature(sig);

      const res = await fetch(`${API_BASE}/verify-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature: sig })
      });
      const json: VerifyResponse = await res.json();
      setResult(json);
      setOpenResult(true);

      onAdd({
        message,
        signature: sig,
        result: json,
        at: new Date().toISOString()
      });

      setMessage('');
    } catch (error: any) {
      setResult({
        isValid: false,
        signer: null,
        error: error?.message ?? 'Unknown error'
      });
      setOpenResult(true);
    } finally {
      setBusy(false);
    }
  };

  if (!isLoggedIn || !primaryWallet) {
    return (
      <Card variant="outlined">
        <CardHeader
          title="Sign a Message"
          subheader="Connect or sign in to get your embedded wallet"
        />
        <CardContent>
          <Alert severity="info">
            Please sign in (top-right) to receive an embedded wallet via Dynamic and start signing.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardHeader
        title="Sign a Message"
        subheader="Create an off-chain signature and verify it on the backend"
      />
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<KeyIcon />}
            color="primary"
            variant="outlined"
            label={`Wallet: ${shorten(address)}`}
          />
          {result && (
            <Chip
              icon={<DoneAllIcon />}
              color={result.isValid ? 'success' : 'error'}
              label={result.isValid ? 'Last verification: valid' : 'Last verification: invalid'}
            />
          )}
        </Stack>

        <TextField
          label="Message to sign"
          placeholder="Type any message…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
          multiline
          minRows={4}
          inputProps={{ maxLength: maxChars }}
          helperText={helperText}
        />

        <Collapse in={!!signature || !!result}>
          <Divider sx={{ my: 2 }} />
          {signature && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Signature (hex)
              </Typography>
              <TextField
                value={signature}
                fullWidth
                multiline
                minRows={2}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <Tooltip title="Copy signature">
                      <IconButton onClick={() => copy(signature)} edge="end" aria-label="copy signature">
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Box>
          )}

          {result && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Backend response
              </Typography>
              {result.error ? (
                <Alert severity="error" onClose={() => setOpenResult(false)}>
                  {result.error}
                </Alert>
              ) : (
                <Alert
                  severity={result.isValid ? 'success' : 'warning'}
                  onClose={() => setOpenResult(false)}
                >
                  {result.isValid ? 'Signature is valid.' : 'Signature failed verification.'}
                  {result.signer && <>&nbsp;Signer: <strong>{result.signer}</strong></>}
                </Alert>
              )}
            </>
          )}
        </Collapse>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Ethers.js will recover the address from your signed message on the server.
        </Typography>
        <Button
          onClick={sign}
          disabled={!canSign}
          startIcon={busy ? <CircularProgress size={18} /> : undefined}
        >
          {busy ? 'Signing…' : 'Sign & Verify'}
        </Button>
      </CardActions>

      <Snackbar
        open={copied}
        autoHideDuration={1800}
        onClose={() => setCopied(false)}
        message="Copied to clipboard"
      />
      <Snackbar
        open={openResult && !!result}
        autoHideDuration={2500}
        onClose={() => setOpenResult(false)}
        message={result?.isValid ? 'Verification: valid' : 'Verification: invalid'}
      />
    </Card>
  );
}

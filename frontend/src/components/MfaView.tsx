import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useDynamicContext,
  useIsLoggedIn,
  useMfa,
  useSyncMfaFlow
} from '@dynamic-labs/sdk-react-core';
import type { MFADevice } from '@dynamic-labs/sdk-api-core';
import QRCode from 'qrcode';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

type MfaRegisterData = {
  uri: string;
  secret: string;
};

type View = 'devices' | 'qr-code' | 'otp' | 'backup-codes';

const steps: View[] = ['devices', 'qr-code', 'otp', 'backup-codes'];

export default function MfaView() {
  const isLogged = useIsLoggedIn();
  const { userWithMissingInfo } = useDynamicContext();

  const {
    addDevice,
    authenticateDevice,
    getUserDevices,
    getRecoveryCodes,
    completeAcknowledgement
  } = useMfa();

  const [devices, setDevices] = useState<MFADevice[]>([]);
  const [registerData, setRegisterData] = useState<MfaRegisterData>();
  const [view, setView] = useState<View>('devices');
  const [codes, setCodes] = useState<string[]>([]);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const activeStep = useMemo(() => steps.indexOf(view), [view]);

  const hasVerifiedTotp = useMemo(
    () =>
      devices.some((d: any) => {
        const t = (d.type ?? d.deviceType)?.toString?.().toLowerCase?.();
        return d.isVerified && (t ? t === 'totp' : true);
      }),
    [devices]
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const refreshDevices = async () => {
    const list = await getUserDevices();
    setDevices(list);
  };

  useEffect(() => {
    if (!isLogged) return;
    refreshDevices();
  }, [isLogged]);

  useEffect(() => {
    if (view !== 'qr-code' || !registerData?.uri || !canvasRef.current) return;
    (async () => {
      try {
        await QRCode.toCanvas(canvasRef.current!, registerData.uri, { width: 280 });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [view, registerData]);

  useSyncMfaFlow({
    handler: async () => {
      if (userWithMissingInfo?.scope?.includes('requiresAdditionalAuth')) {
        const list = await getUserDevices();
        if (list.length === 0) {
          setError(undefined);
          const { uri, secret } = await addDevice();
          setRegisterData({ uri, secret });
          setView('qr-code');
        } else {
          setError(undefined);
          setRegisterData(undefined);
          setView('otp');
        }
      } else {
        const newCodes = await getRecoveryCodes();
        setCodes(newCodes);
        setView('backup-codes');
      }
    }
  });

  const onAddDevice = async () => {
    if (hasVerifiedTotp) return;
    setBusy(true);
    setError(undefined);
    try {
      const { uri, secret } = await addDevice();
      setRegisterData({ secret, uri });
      setView('qr-code');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to start device registration');
    } finally {
      setBusy(false);
    }
  };

  const onQRCodeContinue = () => {
    setRegisterData(undefined);
    setView('otp');
  };

  const onOtpSubmit = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await authenticateDevice({ code: otp });
      const newCodes = await getRecoveryCodes();
      setCodes(newCodes);
      setView('backup-codes');
      setOtp('');
      await refreshDevices();
    } catch (e: any) {
      setError(e?.message ?? 'Invalid code');
    } finally {
      setBusy(false);
    }
  };

  const onGenerateCodes = async () => {
    setBusy(true);
    try {
      const newCodes = await getRecoveryCodes(true);
      setCodes(newCodes);
      setView('backup-codes');
    } finally {
      setBusy(false);
    }
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
    } catch (error) {
      setError('Failed to copy codes to clipboard. Please copy manually.');
    }
  };

  const stepLabel = (v: View) => {
    switch (v) {
      case 'devices': return 'Devices';
      case 'qr-code': return 'Scan QR';
      case 'otp': return 'Confirm OTP';
      case 'backup-codes': return 'Backup Codes';
    }
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title="Multi-Factor Authentication"
        subheader="Secure your account by adding an authenticator app and storing recovery codes"
        avatar={<VerifiedUserIcon color="primary" />}
      />

      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {hasVerifiedTotp && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You already have a <strong>verified TOTP</strong> device. Only one TOTP device is supported.
          </Alert>
        )}

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
          {steps.map((s) => (
            <Step key={s}>
              <StepLabel>{stepLabel(s)}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {view === 'devices' && (
          <Stack spacing={2}>
            <Typography variant="subtitle1">Registered devices</Typography>
            {devices.length === 0 ? (
              <Alert severity="info">No devices yet. Add one to get started.</Alert>
            ) : (
              <List dense>
                {devices.map((d: any) => {
                  const t = (d.type ?? d.deviceType) ?? 'Authenticator App';
                  return (
                    <ListItem key={d.id} divider>
                      <ListItemText
                        primary={d.name || 'Authenticator App'}
                        secondary={`Type: ${t} • Added: ${new Date(d.createdAt).toLocaleString()}`}
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                      <Chip
                        size="small"
                        color={d.verified ? 'success' : 'warning'}
                        label={d.verified ? 'verified' : 'pending'}
                        sx={{ ml: 1 }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Stack>
        )}

        {view === 'qr-code' && registerData && (
          <Grid container spacing={2} alignItems="center">
            <Grid>
              <Paper variant="outlined" sx={{ p: 2, display: 'inline-block' }}>
                <canvas ref={canvasRef} />
              </Paper>
            </Grid>
            <Grid>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Scan this QR code with your authenticator app
              </Typography>
              <Typography variant="body2" color="text.secondary">
                If you can’t scan, enter this secret manually:
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mt: 1,
                  flexWrap: 'wrap'
                }}
              >
                <Paper variant="outlined" sx={{ p: 1.2 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {registerData.secret}
                  </Typography>
                </Paper>
                <IconButton
                  size="small"
                  aria-label="copy secret"
                  onClick={() => navigator.clipboard.writeText(registerData.secret)}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        )}

        {view === 'otp' && (
          <Stack spacing={2}>
            <Typography variant="subtitle1">Enter the 6-digit code</Typography>
            <TextField
              label="One-time code"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
              sx={{ maxWidth: 300 }}
            />
          </Stack>
        )}

        {view === 'backup-codes' && (
          <Stack spacing={2}>
            <Typography variant="subtitle1">Save your recovery codes</Typography>
            <Typography variant="body2" color="text.secondary">
              Store these codes in a safe place. Each code can be used once if you lose access to your device.
            </Typography>

            <Grid container spacing={1}>
              {codes.map((code) => (
                <Grid key={code}>
                  <Paper variant="outlined" sx={{ p: 1.2, textAlign: 'center' }}>
                    <Typography sx={{ fontFamily: 'monospace' }}>{code}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Stack direction="row" spacing={1}>
              <Button onClick={copyAll} startIcon={<ContentCopyIcon />}>
                Copy all
              </Button>
              <Button color="secondary" onClick={onGenerateCodes} startIcon={<RefreshIcon />}>
                Generate new
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button variant="contained" onClick={completeAcknowledgement}>
                I’ve saved them
              </Button>
            </Stack>
          </Stack>
        )}
      </CardContent>

      <Divider />

      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Protect your account with an extra layer of security.
        </Typography>

        {view === 'devices' && (
          <Tooltip
            title={
              hasVerifiedTotp
                ? 'Only one verified TOTP device is supported.'
                : ''
            }
          >
            <span>
              <Button
                onClick={onAddDevice}
                startIcon={busy ? <CircularProgress size={18} /> : <AddIcon />}
                disabled={busy || hasVerifiedTotp}
              >
                {busy ? 'Starting…' : 'Add device'}
              </Button>
            </span>
          </Tooltip>
        )}

        {view === 'qr-code' && (
          <Button onClick={onQRCodeContinue} variant="contained">
            I’ve scanned it
          </Button>
        )}

        {view === 'otp' && (
          <Button
            onClick={onOtpSubmit}
            variant="contained"
            disabled={!otp || busy}
            startIcon={busy ? <CircularProgress size={18} /> : undefined}
          >
            {busy ? 'Verifying…' : 'Verify'}
          </Button>
        )}

        {view === 'backup-codes' && (
          <Button onClick={completeAcknowledgement} variant="contained">
            Done
          </Button>
        )}
      </CardActions>
    </Card>
  );
}


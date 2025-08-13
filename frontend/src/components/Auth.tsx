import { useState } from 'react';
import { useConnectWithOtp, useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import EmailIcon from '@mui/icons-material/Email';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

type Stage = 'email' | 'otp';

export default function Auth() {
  const isLoggedIn = useIsLoggedIn();
  const { handleLogOut } = useDynamicContext();
  const { connectWithEmail, verifyOneTimePassword } = useConnectWithOtp();

  const [stage, setStage] = useState<Stage>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isValidEmail = (v: string) => /\S+@\S+\.\S+/.test(v);

  const submitEmail = async () => {
    setError(null);
    setInfo(null);
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setBusy(true);
    try {
      await connectWithEmail(email);
      setInfo(`We sent a one-time code to ${email}.`);
      setStage('otp');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to send code. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const submitOtp = async () => {
    setError(null);
    setBusy(true);
    try {
      await verifyOneTimePassword(otp);
      setInfo('You are now signed in.');
    } catch (e: any) {
      setError(e?.message ?? 'Invalid code. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!email || !isValidEmail(email)) return;
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      await connectWithEmail(email);
      setInfo(`We re-sent a one-time code to ${email}.`);
    } catch (e: any) {
      setError(e?.message ?? 'Could not resend code.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card variant="outlined">
      <CardHeader
        avatar={<VerifiedUserIcon color="primary" />}
        title="Sign in with Email"
        subheader="Use a one-time code to quickly sign in and get your embedded wallet"
      />
      <CardContent>
        {isLoggedIn && (
          <Alert severity="success" sx={{ mb: 2 }}>
            You’re already signed in.
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {info && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {info}
          </Alert>
        )}

        {stage === 'email' && (
          <Stack spacing={2} sx={{ maxWidth: 420 }}>
            <TextField
              label="Email address"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!email && !isValidEmail(email)}
              helperText={email && !isValidEmail(email) ? 'Enter a valid email' : ' '}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              fullWidth
            />
            <Typography variant="body2" color="text.secondary">
              We’ll send a one-time passcode (OTP) to your email.
            </Typography>
          </Stack>
        )}

        {stage === 'otp' && (
          <Stack spacing={2} sx={{ maxWidth: 360 }}>
            <TextField
              label="One-time code"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
              fullWidth
            />
            <Stack direction="row" spacing={1}>
              <Button onClick={resend} disabled={busy}>
                Resend code
              </Button>
              <Button onClick={() => setStage('email')} disabled={busy}>
                Change email
              </Button>
            </Stack>
          </Stack>
        )}
      </CardContent>

      <Divider />

      <CardActions sx={{ justifyContent: 'space-between' }}>
        {!isLoggedIn ? (
          <>
            {stage === 'email' ? (
              <Button
                onClick={submitEmail}
                variant="contained"
                disabled={busy || !isValidEmail(email)}
                startIcon={busy ? <CircularProgress size={18} /> : undefined}
              >
                {busy ? 'Sending…' : 'Send code'}
              </Button>
            ) : (
              <Button
                onClick={submitOtp}
                variant="contained"
                disabled={busy || otp.length < 4}
                startIcon={busy ? <CircularProgress size={18} /> : undefined}
              >
                {busy ? 'Verifying…' : 'Verify & Sign in'}
              </Button>
            )}
          </>
        ) : (
          <Button onClick={() => handleLogOut()} color="inherit">
            Logout
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

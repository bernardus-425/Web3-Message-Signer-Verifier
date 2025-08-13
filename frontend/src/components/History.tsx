import type { HistoryItem } from '../types';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import HistoryIcon from '@mui/icons-material/History';
import Divider from '@mui/material/Divider';

function shorten(addr?: string | null) {
  if (!addr) return '—';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function History({ items, onClear }: { items: HistoryItem[]; onClear: () => void }) {
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title="Local History"
        action={
          <Tooltip title="Clear history">
            <IconButton onClick={onClear} aria-label="clear history">
              <DeleteSweepIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <Divider />
      <CardContent sx={{ flexGrow: 1 }}>
        {items.length === 0 ? (
          <Box
            sx={{
              minHeight: 200,
              display: 'grid',
              placeItems: 'center',
              color: 'text.secondary',
              textAlign: 'center'
            }}
          >
            <Box>
              <HistoryIcon fontSize="large" />
              <Typography variant="body2" sx={{ mt: 1 }}>
                No messages yet. Sign something to see it here.
              </Typography>
            </Box>
          </Box>
        ) : (
          <List dense disablePadding>
            {items.map((h, i) => (
              <ListItem key={i} divider sx={{ alignItems: 'flex-start' }}>
                <ListItemText
                  primaryTypographyProps={{ component: 'div' }}
                  secondaryTypographyProps={{ component: 'div' }}
                  primary={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography variant="subtitle2" component="span">
                        {new Date(h.at).toLocaleString()}
                      </Typography>
                      <Chip
                        size="small"
                        color={h.result.isValid ? 'success' : 'warning'}
                        label={h.result.isValid ? 'valid' : 'invalid'}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        component="div"
                        color="text.primary"
                        sx={{ mt: 0.5 }}
                      >
                        <em>Message:</em> {h.message}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="div"
                        color="text.secondary"
                        sx={{ mt: 0.25 }}
                      >
                        <em>Signer:</em> {shorten(h.result.signer)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
      <CardActions />
    </Card>
  );
}

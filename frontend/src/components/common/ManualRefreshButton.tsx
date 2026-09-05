import React, { useState } from 'react';
import {
  Button, IconButton, Tooltip, Box, Typography, Snackbar, Alert, keyframes,
} from '@mui/material';
import { Refresh as RefreshIcon, CheckCircleOutline } from '@mui/icons-material';
import { useMarketEngine } from '../../hooks/useLiveMarketData';
import { clearCache } from '../../services/api';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulseBlink = keyframes`
  0%   { box-shadow: 0 0 0 0px rgba(0, 229, 255, 0.8), 0 3px 14px rgba(0,176,255,0.5); transform: scale(1); }
  50%  { box-shadow: 0 0 0 10px rgba(0, 229, 255, 0), 0 6px 22px rgba(0,229,255,0.85); transform: scale(1.03); }
  100% { box-shadow: 0 0 0 0px rgba(0, 229, 255, 0), 0 3px 14px rgba(0,176,255,0.5); transform: scale(1); }
`;

interface ManualRefreshButtonProps {
  variant?: 'button' | 'icon' | 'chip';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'inherit' | 'success' | 'warning';
  showLabel?: boolean;
  highlightBlink?: boolean;
}

export const ManualRefreshButton: React.FC<ManualRefreshButtonProps> = ({
  variant = 'button',
  size = 'small',
  color = 'primary',
  showLabel = true,
  highlightBlink = true,
}) => {
  const { manualRefresh, isRefreshing, lastRefreshedAt } = useMarketEngine();
  const [toastOpen, setToastOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    if (loading || isRefreshing) return;
    setLoading(true);
    try {
      // Clear backend API cache first
      await clearCache().catch(() => {});
      // Invalidate frontend React Query cache
      await manualRefresh();
      setToastOpen(true);
    } catch (err) {
      console.warn("Manual refresh triggered with fallback:", err);
      await manualRefresh();
      setToastOpen(true);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const isLoading = loading || isRefreshing;
  const tooltipText = lastRefreshedAt
    ? `Click to fetch latest prices (Last refreshed: ${lastRefreshedAt})`
    : 'Click to fetch latest real-time stock prices';

  if (variant === 'icon') {
    return (
      <>
        <Tooltip title={tooltipText} arrow>
          <IconButton
            size={size}
            color={color}
            onClick={handleRefresh}
            disabled={isLoading}
            sx={{
              transition: 'all 0.2s',
              '&:hover': { transform: 'scale(1.1)' },
            }}
          >
            <RefreshIcon
              sx={{
                fontSize: size === 'small' ? 18 : 22,
                animation: isLoading ? `${spin} 0.8s linear infinite` : 'none',
              }}
            />
          </IconButton>
        </Tooltip>
        <Snackbar
          open={toastOpen}
          autoHideDuration={2500}
          onClose={() => setToastOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setToastOpen(false)}
            severity="success"
            icon={<CheckCircleOutline fontSize="inherit" />}
            sx={{ width: '100%', fontWeight: 700, borderRadius: 2 }}
          >
            Latest prices updated!
          </Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <>
      <Tooltip title={tooltipText} arrow>
        <Button
          variant="contained"
          color={color}
          size={size}
          onClick={handleRefresh}
          disabled={isLoading}
          startIcon={
            <RefreshIcon
              sx={{
                animation: isLoading ? `${spin} 0.8s linear infinite` : 'none',
                fontSize: size === 'small' ? 16 : 20,
              }}
            />
          }
          sx={{
            fontWeight: 900,
            borderRadius: '999px',
            textTransform: 'none',
            fontSize: size === 'small' ? '0.78rem' : size === 'medium' ? '0.85rem' : '0.95rem',
            px: size === 'small' ? 1.5 : size === 'medium' ? 2.2 : 3.0,
            py: size === 'small' ? 0.5 : size === 'medium' ? 0.75 : 1.0,
            minHeight: size === 'medium' ? 36 : undefined,
            letterSpacing: 0.3,
            boxShadow: '0 3px 14px rgba(0,176,255,0.45)',
            background: 'linear-gradient(135deg, #00b0ff 0%, #0072ff 100%)',
            border: '1.5px solid rgba(255,255,255,0.4)',
            color: '#fff',
            animation: highlightBlink && !isLoading ? `${pulseBlink} 2.2s ease-in-out infinite` : 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'linear-gradient(135deg, #33c9ff 0%, #0059e6 100%)',
              boxShadow: '0 5px 22px rgba(0,176,255,0.7)',
              transform: 'translateY(-1.5px) scale(1.04)',
              animation: 'none',
            },
            '&:active': {
              transform: 'translateY(0) scale(0.98)',
            },
          }}
        >
          {showLabel ? (isLoading ? 'Refreshing…' : '🔄 Refresh Prices') : ''}
          {lastRefreshedAt && showLabel && (
            <Box
              component="span"
              sx={{
                ml: 1,
                opacity: 0.9,
                fontSize: size === 'medium' ? '0.72rem' : '0.68rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                display: { xs: 'none', md: 'inline' },
              }}
            >
              • {lastRefreshedAt}
            </Box>
          )}
        </Button>
      </Tooltip>

      <Snackbar
        open={toastOpen}
        autoHideDuration={2500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          icon={<CheckCircleOutline fontSize="inherit" />}
          sx={{ width: '100%', fontWeight: 700, borderRadius: 2 }}
        >
          Latest market prices updated!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ManualRefreshButton;

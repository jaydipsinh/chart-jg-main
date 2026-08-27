import React, { useState, useEffect } from 'react';
import {
  Box, Button, Menu, MenuItem, Typography, Chip, Tooltip,
  ListItemIcon, ListItemText, useTheme,
} from '@mui/material';
import {
  RocketLaunch, ShowChart, CheckCircle, SwapHoriz, FlashOn,
} from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';

export type DataProviderType = 'angel_one' | 'yfinance';

export const getPreferredDataProvider = (): DataProviderType => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('PREFERRED_DATA_PROVIDER');
    if (saved === 'angel_one' || saved === 'yfinance') {
      return saved as DataProviderType;
    }
  }
  return 'angel_one'; // Default to Angel One as primary
};

export const setPreferredDataProvider = (provider: DataProviderType) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('PREFERRED_DATA_PROVIDER', provider);
    window.dispatchEvent(new CustomEvent('data-provider-changed', { detail: provider }));
  }
};

export const DataSourceSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const queryClient = useQueryClient();

  const [provider, setProvider] = useState<DataProviderType>(getPreferredDataProvider());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const handleProviderChange = (e: Event) => {
      const custom = e as CustomEvent<DataProviderType>;
      if (custom.detail) {
        setProvider(custom.detail);
      }
    };
    window.addEventListener('data-provider-changed', handleProviderChange);
    return () => window.removeEventListener('data-provider-changed', handleProviderChange);
  }, []);

  const handleSelect = (selected: DataProviderType) => {
    setProvider(selected);
    setPreferredDataProvider(selected);
    setAnchorEl(null);
    queryClient.invalidateQueries();
  };

  const isAngel = provider === 'angel_one';

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Tooltip title={`Current Data Feed: ${isAngel ? 'Angel One SmartAPI (Live Institutional Feed)' : 'Yahoo Finance API (Standard Feed)'}. Click to switch.`}>
        <Button
          onClick={(e) => setAnchorEl(e.currentTarget)}
          variant={isAngel ? 'contained' : 'outlined'}
          size="small"
          color={isAngel ? 'secondary' : 'info'}
          startIcon={isAngel ? <RocketLaunch sx={{ fontSize: 16 }} /> : <ShowChart sx={{ fontSize: 16 }} />}
          endIcon={<SwapHoriz sx={{ fontSize: 14, opacity: 0.7 }} />}
          sx={{
            height: compact ? 30 : 34,
            px: 1.5,
            fontSize: compact ? '0.7rem' : '0.75rem',
            fontWeight: 800,
            borderRadius: '8px',
            textTransform: 'none',
            letterSpacing: 0.3,
            background: isAngel
              ? 'linear-gradient(135deg, #7c4dff 0%, #651fff 100%)'
              : (isDark ? 'rgba(0,176,255,0.08)' : 'rgba(2,136,209,0.08)'),
            borderColor: isAngel ? 'transparent' : (isDark ? '#00b0ff' : '#0288d1'),
            color: isAngel ? '#fff' : (isDark ? '#00b0ff' : '#0288d1'),
            boxShadow: isAngel ? '0 2px 10px rgba(124,77,255,0.35)' : 'none',
            '&:hover': {
              background: isAngel
                ? 'linear-gradient(135deg, #651fff 0%, #6200ea 100%)'
                : (isDark ? 'rgba(0,176,255,0.18)' : 'rgba(2,136,209,0.18)'),
            },
          }}
        >
          {isAngel ? 'Angel One Feed' : 'Yahoo Feed'}
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          elevation: 6,
          sx: {
            mt: 1,
            borderRadius: 2,
            minWidth: 260,
            bgcolor: isDark ? '#0b1120' : '#ffffff',
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Box sx={{ px: 2, py: 1, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
          <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: 0.8 }}>
            Select Data Engine
          </Typography>
        </Box>

        <MenuItem
          selected={isAngel}
          onClick={() => handleSelect('angel_one')}
          sx={{ py: 1.2, px: 2 }}
        >
          <ListItemIcon sx={{ color: '#7c4dff' }}>
            <RocketLaunch fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>Angel One SmartAPI</Typography>
                <Chip label="PRIMARY" size="small" color="secondary" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 900 }} />
              </Box>
            }
            secondary="Live SmartAPI Feed (Client ID: A291133)"
            secondaryTypographyProps={{ fontSize: '0.7rem' }}
          />
          {isAngel && <CheckCircle sx={{ color: '#7c4dff', fontSize: 18, ml: 1 }} />}
        </MenuItem>

        <MenuItem
          selected={!isAngel}
          onClick={() => handleSelect('yfinance')}
          sx={{ py: 1.2, px: 2 }}
        >
          <ListItemIcon sx={{ color: '#00b0ff' }}>
            <ShowChart fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>Yahoo Finance API</Typography>
                <Chip label="STANDARD" size="small" color="info" variant="outlined" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 900 }} />
              </Box>
            }
            secondary="Public Market Feed & Fallback"
            secondaryTypographyProps={{ fontSize: '0.7rem' }}
          />
          {!isAngel && <CheckCircle sx={{ color: '#00b0ff', fontSize: 18, ml: 1 }} />}
        </MenuItem>
      </Menu>
    </Box>
  );
};

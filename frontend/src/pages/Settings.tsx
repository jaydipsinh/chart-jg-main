import React, { useState } from 'react';
import {
  Box, Typography, Stack, Switch, FormControlLabel, Slider,
  Paper, Grid, Button, Divider, Chip, Alert, TextField,
  CircularProgress,
} from '@mui/material';
import {
  Settings, Refresh, Delete, CheckCircle, Warning,
  Storage, Public, Bolt,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setTheme, setRefreshInterval } from '../store';
import { clearCache, getApiBaseUrl } from '../services/api';
import axios from 'axios';

export default function SettingsPage() {
  const dispatch      = useAppDispatch();
  const themeMode     = useAppSelector(s => s.ui.themeMode);
  const refreshInt    = useAppSelector(s => s.ui.refreshInterval);
  const [cleared, setCleared] = useState(false);

  // Backend API URL Configuration
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem('CUSTOM_API_URL') || getApiBaseUrl();
  });
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleClearCache = async () => {
    try { await clearCache(); setCleared(true); setTimeout(() => setCleared(false), 3000); }
    catch {}
  };

  const handleSaveApiUrl = () => {
    if (apiUrl.trim()) {
      let formatted = apiUrl.trim().replace(/\/+$/, '');
      if (!formatted.endsWith('/api')) formatted += '/api';
      localStorage.setItem('CUSTOM_API_URL', formatted);
      setApiUrl(formatted);
    } else {
      localStorage.removeItem('CUSTOM_API_URL');
      setApiUrl(getApiBaseUrl());
    }
    setTestStatus('success');
    setTestMessage('API URL saved successfully! All screens will now connect to this server.');
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('');
    try {
      let target = apiUrl.trim().replace(/\/+$/, '');
      if (!target.endsWith('/api')) target += '/api';
      const rootUrl = target.replace(/\/api$/, '');
      const res = await axios.get(rootUrl, { timeout: 8000 });
      if (res.status === 200) {
        setTestStatus('success');
        setTestMessage(`✓ Successfully connected to live backend server! (${res.data?.name || 'FastAPI Online'})`);
      } else {
        setTestStatus('error');
        setTestMessage(`Server returned HTTP ${res.status}`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err?.message || 'Could not connect to backend server. Make sure Railway service is active.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
        <Settings color="primary" sx={{ fontSize: 30 }} />
        <Box>
          <Typography variant="h5" fontWeight={900}>Settings &amp; Live Server Config</Typography>
          <Typography variant="caption" color="text.secondary">
            Manage your Vercel frontend, Railway backend connections, data refresh rates, and appearance
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* ── Backend Live Server Configuration ── */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'primary.main',
              background: themeMode === 'dark' ? 'rgba(0,229,255,0.04)' : '#f0f9ff',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
              <Public color="primary" />
              <Typography variant="subtitle1" fontWeight={800}>
                Live Backend API Server (Railway / Render / Local)
              </Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary" mb={2}>
              Enter your Railway public domain (e.g. <code>https://your-backend.up.railway.app</code>). The app will automatically connect and stream live NSE market data to all 34 screens.
            </Typography>

            <TextField
              fullWidth
              size="small"
              label="Backend Server URL"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://chart-jg-main-production.up.railway.app"
              sx={{ mb: 2 }}
            />

            {testStatus === 'success' && (
              <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2, borderRadius: 2 }}>
                {testMessage}
              </Alert>
            )}

            {testStatus === 'error' && (
              <Alert severity="error" icon={<Warning />} sx={{ mb: 2, borderRadius: 2 }}>
                {testMessage}
              </Alert>
            )}

            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Button
                variant="contained"
                onClick={handleSaveApiUrl}
                sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
              >
                Save Server URL
              </Button>
              <Button
                variant="outlined"
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                startIcon={testStatus === 'testing' ? <CircularProgress size={16} /> : <Bolt />}
                sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
              >
                {testStatus === 'testing' ? 'Testing Connection...' : 'Test Live Connection'}
              </Button>
              <Button
                variant="text"
                color="inherit"
                onClick={() => {
                  localStorage.removeItem('CUSTOM_API_URL');
                  setApiUrl(getApiBaseUrl());
                  setTestStatus('idle');
                  setTestMessage('');
                }}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Reset to Default
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }} elevation={0}>
            <Typography variant="subtitle1" fontWeight={800} mb={1.5}>Appearance</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={themeMode === 'dark'}
                  onChange={() => dispatch(setTheme(themeMode === 'dark' ? 'light' : 'dark'))}
                />
              }
              label={`${themeMode === 'dark' ? 'Dark' : 'Light'} Mode`}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }} elevation={0}>
            <Typography variant="subtitle1" fontWeight={800} mb={1}>Data Refresh Rate</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Current interval: <strong>{refreshInt}s</strong>
            </Typography>
            <Slider
              value={refreshInt}
              min={60} max={600} step={60}
              marks={[
                { value: 60, label: '1m' },
                { value: 180, label: '3m' },
                { value: 300, label: '5m' },
                { value: 600, label: '10m' },
              ]}
              onChange={(_, v) => dispatch(setRefreshInterval(v as number))}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }} elevation={0}>
            <Typography variant="subtitle1" fontWeight={800} mb={1}>Cache &amp; Storage</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Clear cached market sessions to force fresh fetch from Yahoo Finance and NSE data feeds.
            </Typography>
            {cleared && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Cache cleared successfully!</Alert>}
            <Button variant="outlined" color="warning" startIcon={<Refresh />} onClick={handleClearCache} sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}>
              Clear Data Cache
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

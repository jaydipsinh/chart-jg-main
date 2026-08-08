import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  TextField, Chip, IconButton, Tooltip, Stack,
  Card, CardContent, Divider, LinearProgress, useTheme,
  Button, MenuItem, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import {
  TableChart, Search, FileDownload, Refresh, Bolt,
  CheckCircle, Cancel, RemoveCircle, EmojiEvents,
  Shield, MonetizationOn,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { fetchTargetMatrix, TargetMatrixItem } from '../services/api';

const SMC_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'INSTITUTIONAL BUY FLOW': { bg: 'rgba(21,101,192,0.15)', text: '#1565c0', border: '#1565c0' },
  'INSTITUTIONAL SELLING': { bg: 'rgba(183,28,28,0.15)', text: '#b71c1c', border: '#b71c1c' },
  'SMART MONEY ACCUMULATION': { bg: 'rgba(46,125,50,0.15)', text: '#2e7d32', border: '#2e7d32' },
  'SMART MONEY DISTRIBUTION': { bg: 'rgba(230,81,0,0.15)', text: '#e65100', border: '#e65100' },
  'LIQUIDITY GRAB': { bg: 'rgba(69,39,160,0.15)', text: '#4527a0', border: '#4527a0' },
  'ORDER BLOCK SUPPORT': { bg: 'rgba(27,94,32,0.15)', text: '#1b5e20', border: '#1b5e20' },
  'ORDER BLOCK RESISTANCE': { bg: 'rgba(191,54,12,0.15)', text: '#bf360c', border: '#bf360c' },
  'BULLISH BREAKOUT': { bg: 'rgba(0,105,92,0.15)', text: '#00695c', border: '#00695c' },
  'BEARISH BREAKDOWN': { bg: 'rgba(136,14,79,0.15)', text: '#880e4f', border: '#880e4f' },
  'RETAIL CONSOLIDATION': { bg: 'rgba(84,110,122,0.15)', text: '#546e7a', border: '#546e7a' },
};

const VERDICT_COLORS: Record<string, { bg: string; text: string; chipColor: 'success' | 'warning' | 'error' | 'primary' | 'default' }> = {
  'BUY / ACCUMULATE': { bg: '#e8f5e9', text: '#2e7d32', chipColor: 'success' },
  'HOLD': { bg: '#fff8e1', text: '#f57f17', chipColor: 'warning' },
  'SELL / BOOK PROFIT': { bg: '#ffebee', text: '#c62828', chipColor: 'error' },
  'BUY': { bg: '#e3f2fd', text: '#1565c0', chipColor: 'primary' },
  'AVOID': { bg: '#f5f5f5', text: '#757575', chipColor: 'default' },
};

export default function TargetMatrixPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [sortField, setSortField] = useState<keyof TargetMatrixItem>('current_price');
  const [sortAsc, setSortAsc] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['target-matrix', actionFilter],
    queryFn: () => fetchTargetMatrix({ action: actionFilter === 'ALL' ? undefined : actionFilter }),
    refetchInterval: 60000,
  });

  const rawStocks: TargetMatrixItem[] = data?.stocks || [];

  const filtered = rawStocks.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.symbol.toLowerCase().includes(q) || s.smc_signal.toLowerCase().includes(q) || s.action_verdict.toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortField] ?? 0;
    const valB = b[sortField] ?? 0;
    if (typeof valA === 'string') {
      return sortAsc ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
    }
    return sortAsc ? ((valA as number) > (valB as number) ? 1 : -1) : ((valA as number) < (valB as number) ? 1 : -1);
  });

  const paginated = sorted.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleSort = (field: keyof TargetMatrixItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Stock Ticker', 'Current Price (₹)', 'RSI Indicators', 'Smart Money (SMC) Signal', 'Action Verdict', 'Stop Loss', 'Target 1 (1M)', 'Target 2 (1M)', 'Target 3 (1M)'];
    const rows = sorted.map(s => [
      s.symbol,
      s.current_price,
      s.rsi,
      `"${s.smc_signal}"`,
      `"${s.action_verdict}"`,
      s.stop_loss,
      s.target1,
      s.target2,
      s.target3,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nse_target_smc_matrix_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* ── Header ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(255,214,0,0.12) 0%, rgba(255,109,0,0.06) 100%)'
            : 'linear-gradient(135deg, #fffde7 0%, #fff8e1 100%)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,214,0,0.3)' : 'rgba(255,193,7,0.4)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42, height: 42, borderRadius: 2,
                bgcolor: '#ffd600', color: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(255,214,0,0.5)',
              }}
            >
              <TableChart sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={900} letterSpacing={0.5}>
                TARGET & SMC ACTION MATRIX
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                Spreadsheet Quantitative Model • RSI, Smart Money (SMC) Signal, Action Verdict & 1-Month Target Levels (T1, T2, T3)
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Chip
            icon={<Bolt sx={{ fontSize: '16px !important', color: '#ffd600' }} />}
            label="SCREENSHOT MODEL LIVE"
            size="small"
            sx={{ fontWeight: 800, bgcolor: isDark ? 'rgba(255,214,0,0.15)' : '#fffde7', color: '#ffd600' }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={() => refetch()}
            disabled={isFetching}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            {isFetching ? 'Scanning...' : 'Refresh'}
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownload />}
            onClick={handleExportCSV}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 800,
              color: '#000',
              bgcolor: '#ffd600',
              '&:hover': { bgcolor: '#ffea00' },
            }}
          >
            Export Excel/CSV
          </Button>
        </Stack>
      </Paper>

      {/* ── Filters & Search ── */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search stock ticker, SMC signal..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            sx={{ width: { xs: '100%', md: 300 } }}
            InputProps={{
              startAdornment: <Search sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />,
            }}
          />

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {['ALL', 'BUY / ACCUMULATE', 'HOLD', 'SELL / BOOK PROFIT'].map(act => (
              <Chip
                key={act}
                label={act === 'ALL' ? 'All Verdicts' : act}
                clickable
                onClick={() => { setActionFilter(act); setPage(0); }}
                color={actionFilter === act ? 'warning' : 'default'}
                variant={actionFilter === act ? 'filled' : 'outlined'}
                sx={{ fontWeight: 800, fontSize: '0.72rem' }}
              />
            ))}
          </Stack>
        </Stack>
      </Paper>

      {/* ── Exact Screenshot Spreadsheet Format Table ── */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        {isLoading && <LinearProgress color="warning" />}
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead
            sx={{
              background: isDark
                ? 'linear-gradient(180deg, rgba(255,214,0,0.25) 0%, rgba(255,214,0,0.12) 100%)'
                : 'linear-gradient(180deg, #fff59d 0%, #fff176 100%)',
              borderBottom: '2px solid',
              borderColor: '#ffd600',
            }}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: 900, fontSize: 12, color: isDark ? '#ffd600' : '#212121', cursor: 'pointer' }} onClick={() => handleSort('symbol')}>
                Stock Ticker {sortField === 'symbol' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, fontSize: 12, color: isDark ? '#ffd600' : '#212121', cursor: 'pointer' }} onClick={() => handleSort('current_price')}>
                Current Price (₹) {sortField === 'current_price' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 900, fontSize: 12, color: isDark ? '#ffd600' : '#212121', cursor: 'pointer' }} onClick={() => handleSort('rsi')}>
                RSI Indicators {sortField === 'rsi' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell sx={{ fontWeight: 900, fontSize: 12, color: isDark ? '#ffd600' : '#212121', cursor: 'pointer' }} onClick={() => handleSort('smc_signal')}>
                Smart Money (SMC) Signal {sortField === 'smc_signal' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 900, fontSize: 12, color: isDark ? '#ffd600' : '#212121', cursor: 'pointer' }} onClick={() => handleSort('action_verdict')}>
                Action Verdict {sortField === 'action_verdict' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, fontSize: 12, color: isDark ? '#ffd600' : '#212121', cursor: 'pointer' }} onClick={() => handleSort('stop_loss')}>
                Stop Loss {sortField === 'stop_loss' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, fontSize: 12, color: isDark ? '#ffd600' : '#212121', cursor: 'pointer' }} onClick={() => handleSort('target1')}>
                Target 1 (1M) {sortField === 'target1' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, fontSize: 12, color: isDark ? '#ffd600' : '#212121', cursor: 'pointer' }} onClick={() => handleSort('target2')}>
                Target 2 (1M) {sortField === 'target2' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, fontSize: 12, color: isDark ? '#ffd600' : '#212121', cursor: 'pointer' }} onClick={() => handleSort('target3')}>
                Target 3 (1M) {sortField === 'target3' && (sortAsc ? '▲' : '▼')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((st) => {
              const smcStyle = SMC_COLORS[st.smc_signal] || { bg: 'action.hover', text: 'inherit', border: 'transparent' };
              const verdictStyle = VERDICT_COLORS[st.action_verdict] || { bg: 'action.hover', text: 'inherit', chipColor: 'default' };

              return (
                <TableRow
                  key={st.symbol}
                  hover
                  onClick={() => navigate(`/stock/${st.symbol}`)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(255,214,0,0.06)' : 'rgba(255,245,157,0.3)',
                    },
                  }}
                >
                  <TableCell sx={{ fontSize: 13, fontWeight: 900 }}>
                    {st.symbol}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 13, fontWeight: 900 }}>
                    {st.current_price?.toLocaleString('en-IN', { minimumFractionDigits: st.current_price % 1 === 0 ? 0 : 2 })}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: 12, fontWeight: 800 }}>
                    <Chip
                      label={st.rsi}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        bgcolor: st.rsi >= 70 ? '#ef5350' : st.rsi >= 60 ? '#ffa726' : st.rsi >= 40 ? '#42a5f5' : '#66bb6a',
                        color: '#fff',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1, py: 0.25,
                        borderRadius: 1,
                        bgcolor: smcStyle.bg,
                        border: `1px solid ${smcStyle.border}55`,
                      }}
                    >
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: smcStyle.text }}>
                        {st.smc_signal}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={st.action_verdict}
                      size="small"
                      color={verdictStyle.chipColor}
                      sx={{ height: 22, fontSize: '0.68rem', fontWeight: 900 }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: 800, color: 'error.main' }}>
                    {st.stop_loss?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: 800, color: '#00897b' }}>
                    {st.target1?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: 800, color: '#2e7d32' }}>
                    {st.target2?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: 900, color: '#1565c0' }}>
                    {st.target3?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={sorted.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 20, 25, 50, 100]}
        />
      </TableContainer>
    </Box>
  );
}

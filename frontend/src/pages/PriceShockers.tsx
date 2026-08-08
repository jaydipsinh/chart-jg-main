import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  TextField, Chip, IconButton, Tooltip, Stack,
  Card, CardContent, Divider, Drawer, LinearProgress, useTheme,
  Button, MenuItem,
} from '@mui/material';
import {
  Whatshot, TrendingUp, Search, FileDownload,
  InfoOutlined, Close, Bolt, ArrowUpward, ArrowDownward,
  CheckCircle, Refresh, MonetizationOn,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { fetchPriceShockers, ShockerStock } from '../services/api';

export default function PriceShockersPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedStock, setSelectedStock] = useState<ShockerStock | null>(null);
  const [sortField, setSortField] = useState<keyof ShockerStock>('gain_3d_pct');
  const [sortAsc, setSortAsc] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['price-shockers', sector],
    queryFn: () => fetchPriceShockers({ page: 1, limit: 100, sector: sector === 'ALL' ? undefined : sector }),
    refetchInterval: 60000,
  });

  const rawStocks: ShockerStock[] = data?.stocks || [];
  const top10: ShockerStock[] = data?.top10 || rawStocks.slice(0, 10);

  // Client-side search and sort
  const filtered = rawStocks.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    const valA = (a[sortField] as number) ?? 0;
    const valB = (b[sortField] as number) ?? 0;
    return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  const paginated = sorted.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleSort = (field: keyof ShockerStock) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Rank', 'Stock', 'Company', 'Current Price', '3-Day Start Price', '3-Day Gain %', "Today's Change %", 'Volume Ratio (3D)', 'Buyer %', 'Delivery %', 'Day High Strength %', 'Score', 'Signal'];
    const rows = sorted.map((s, idx) => [
      idx + 1,
      s.symbol,
      `"${s.name}"`,
      s.current_price,
      s.start_price_3d,
      s.gain_3d_pct,
      s.change_pct,
      `${s.volume_ratio}x`,
      `${s.buyer_pct}%`,
      `${s.delivery_pct}%`,
      `${s.day_high_strength_pct}%`,
      s.score,
      s.signal,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nse_price_shockers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sectors = ['ALL', ...Array.from(new Set(rawStocks.map(s => s.sector))).filter(Boolean)];

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
            ? 'linear-gradient(135deg, rgba(255,112,67,0.12) 0%, rgba(213,0,249,0.05) 100%)'
            : 'linear-gradient(135deg, #fff3e0 0%, #ede7f6 100%)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,112,67,0.3)' : 'rgba(255,152,0,0.3)',
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
                bgcolor: '#ff6d00', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(255,109,0,0.5)',
              }}
            >
              <Whatshot sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={900} letterSpacing={0.5}>
                PRICE SHOCKERS
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                Maximum 3-Trading-Session Price Gain % • Formula: ((Current Price / Close 3 Sessions Ago) - 1) × 100
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Chip
            icon={<Bolt sx={{ fontSize: '16px !important', color: '#ff9100' }} />}
            label="REAL-TIME NSE"
            size="small"
            sx={{ fontWeight: 800, bgcolor: isDark ? 'rgba(255,145,0,0.15)' : '#fff3e0', color: '#ff9100' }}
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
              background: 'linear-gradient(135deg, #ff6d00 0%, #f50057 100%)',
            }}
          >
            Export CSV
          </Button>
        </Stack>
      </Paper>

      {/* ── Top 10 Price Shockers Carousel/Cards ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ mb: 1.5, letterSpacing: 1 }}>
          TOP 10 PRICE SHOCKERS – 3 TRADING SESSIONS
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' },
            gap: 1.5,
          }}
        >
          {top10.slice(0, 10).map((st, idx) => (
            <Card
              key={st.symbol}
              elevation={0}
              onClick={() => setSelectedStock(st)}
              sx={{
                cursor: 'pointer',
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: idx === 0 ? '#ff6d00' : 'divider',
                background: isDark
                  ? idx === 0 ? 'linear-gradient(135deg, rgba(255,109,0,0.18) 0%, rgba(11,17,32,0.9) 100%)' : 'rgba(11,17,32,0.6)'
                  : idx === 0 ? '#fff8e1' : '#ffffff',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 24px rgba(255,109,0,0.25)',
                  borderColor: '#ff6d00',
                },
              }}
            >
              <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                  <Box>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Typography sx={{ fontSize: 11, fontWeight: 900, color: 'text.secondary' }}>
                        #{idx + 1}
                      </Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 900 }}>
                        {st.symbol}
                      </Typography>
                    </Stack>
                    <Typography noWrap sx={{ fontSize: 10, color: 'text.secondary', maxWidth: 110 }}>
                      {st.sector}
                    </Typography>
                  </Box>
                  <Chip
                    label={`+${st.gain_3d_pct}%`}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      bgcolor: '#00c853',
                      color: '#000',
                    }}
                  />
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="baseline" mt={1}>
                  <Typography sx={{ fontSize: 16, fontWeight: 900 }}>
                    ₹{st.current_price?.toLocaleString('en-IN')}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: (st.change_pct ?? 0) >= 0 ? 'success.main' : 'error.main',
                    }}
                  >
                    {(st.change_pct ?? 0) >= 0 ? '▲' : '▼'} {Math.abs(st.change_pct ?? 0)}%
                  </Typography>
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" justifyContent="space-between" sx={{ fontSize: 10, color: 'text.secondary' }}>
                  <span>3D Vol: <b>{st.volume_ratio}x</b></span>
                  <span>Buyer: <b>{st.buyer_pct}%</b></span>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* ── Filters & Search Bar ── */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search symbol, company or sector..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            sx={{ width: { xs: '100%', sm: 300 } }}
            InputProps={{
              startAdornment: <Search sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />,
            }}
          />
          <TextField
            select
            size="small"
            label="Sector Filter"
            value={sector}
            onChange={e => { setSector(e.target.value); setPage(0); }}
            sx={{ width: { xs: '100%', sm: 200 } }}
          >
            {sectors.map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            Showing {sorted.length} stocks sorted by 3-Day Price Gain %
          </Typography>
        </Stack>
      </Paper>

      {/* ── Master Price Shockers Table ── */}
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
        <Table size="small">
          <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, fontSize: 11, width: 50 }}>RANK</TableCell>
              <TableCell sx={{ fontWeight: 800, fontSize: 11, cursor: 'pointer' }} onClick={() => handleSort('symbol')}>
                STOCK {sortField === 'symbol' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11, cursor: 'pointer' }} onClick={() => handleSort('current_price')}>
                CURRENT PRICE (₹) {sortField === 'current_price' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11, cursor: 'pointer', color: '#ff6d00' }} onClick={() => handleSort('gain_3d_pct')}>
                3-DAY GAIN % {sortField === 'gain_3d_pct' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11 }}>
                3-DAY START (₹)
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11, cursor: 'pointer' }} onClick={() => handleSort('change_pct')}>
                TODAY'S CHANGE % {sortField === 'change_pct' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11, cursor: 'pointer' }} onClick={() => handleSort('volume_ratio')}>
                3D VOL RATIO {sortField === 'volume_ratio' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11, cursor: 'pointer' }} onClick={() => handleSort('buyer_pct')}>
                BUYER % {sortField === 'buyer_pct' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11, cursor: 'pointer' }} onClick={() => handleSort('delivery_pct')}>
                DELIVERY % {sortField === 'delivery_pct' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11 }}>
                DAY HIGH STRENGTH %
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, fontSize: 11, cursor: 'pointer' }} onClick={() => handleSort('score')}>
                SCORE /100 {sortField === 'score' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, fontSize: 11 }}>SIGNAL</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, fontSize: 11 }}>ACTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((st, idx) => {
              const globalIdx = page * rowsPerPage + idx + 1;
              const isPVol = st.is_price_vol_shocker;

              return (
                <TableRow
                  key={st.symbol}
                  hover
                  onClick={() => setSelectedStock(st)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: isPVol ? (isDark ? 'rgba(255,109,0,0.06)' : 'rgba(255,109,0,0.04)') : 'inherit',
                  }}
                >
                  <TableCell sx={{ fontSize: 11, fontWeight: 800, color: 'text.secondary' }}>
                    #{globalIdx}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 900, color: isDark ? '#fff' : '#000' }}>
                          {st.symbol}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                          {st.name}
                        </Typography>
                      </Box>
                      {isPVol && (
                        <Tooltip title="🔥 Price + Volume Shocker (Gain > 3%, Vol > 3D Avg, Buyer % > 75%)">
                          <Chip label="🔥 P+V" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 900, bgcolor: '#ff3d00', color: '#fff' }} />
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 13, fontWeight: 900 }}>
                    ₹{st.current_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`+${st.gain_3d_pct}%`}
                      size="small"
                      sx={{
                        fontWeight: 900,
                        fontSize: '0.75rem',
                        bgcolor: (st.gain_3d_pct ?? 0) >= 10 ? '#00c853' : (st.gain_3d_pct ?? 0) >= 5 ? '#64dd17' : '#aeea00',
                        color: '#000',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>
                    ₹{st.start_price_3d?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: 800, color: (st.change_pct ?? 0) >= 0 ? 'success.main' : 'error.main' }}>
                    {(st.change_pct ?? 0) >= 0 ? '+' : ''}{st.change_pct}%
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: 800 }}>
                    <Chip
                      label={`${st.volume_ratio}x`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        bgcolor: (st.volume_ratio ?? 1) >= 2 ? 'rgba(0,229,255,0.2)' : 'action.hover',
                        color: (st.volume_ratio ?? 1) >= 2 ? '#00b0ff' : 'text.primary',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: 800 }}>
                    <span style={{ color: (st.buyer_pct ?? 0) >= 80 ? '#00c853' : (st.buyer_pct ?? 0) >= 75 ? '#64dd17' : 'inherit' }}>
                      {st.buyer_pct}%
                    </span>
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: 700 }}>
                    <span style={{ color: (st.delivery_pct ?? 0) >= 50 ? '#00e5ff' : 'inherit' }}>
                      {st.delivery_pct}%
                    </span>
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: 700 }}>
                    +{st.day_high_strength_pct}%
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${st.score}/100`}
                      size="small"
                      sx={{
                        fontWeight: 900,
                        fontSize: '0.72rem',
                        bgcolor: (st.score ?? 0) >= 80 ? 'rgba(0,200,83,0.15)' : 'rgba(255,152,0,0.15)',
                        color: (st.score ?? 0) >= 80 ? '#00c853' : '#ff9800',
                        border: '1px solid',
                        borderColor: (st.score ?? 0) >= 80 ? '#00c853' : '#ff9800',
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={st.signal}
                      size="small"
                      color={st.signal === 'STRONG BUY' ? 'success' : st.signal === 'BUY' ? 'primary' : 'warning'}
                      sx={{ height: 20, fontSize: '0.62rem', fontWeight: 900 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => { e.stopPropagation(); navigate(`/stock/${st.symbol}`); }}
                      sx={{ fontSize: '0.65rem', py: 0.2, px: 1, textTransform: 'none', borderRadius: 1.5 }}
                    >
                      Analyze
                    </Button>
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
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>

      {/* ── Moneycontrol-Style Stock Detail Drawer ── */}
      <Drawer
        anchor="right"
        open={Boolean(selectedStock)}
        onClose={() => setSelectedStock(null)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 440 },
            p: 3,
            bgcolor: isDark ? '#0b1120' : '#fff',
          },
        }}
      >
        {selectedStock && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  {selectedStock.symbol}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedStock.name} • {selectedStock.sector}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedStock(null)} size="small">
                <Close />
              </IconButton>
            </Stack>

            <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: isDark ? 'rgba(0,176,255,0.06)' : '#f0f8ff', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="overline" color="text.secondary" fontWeight={800}>
                PRICE SNAPSHOT
              </Typography>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline" mt={0.5}>
                <Typography variant="h5" fontWeight={900}>
                  ₹{selectedStock.current_price?.toLocaleString('en-IN')}
                </Typography>
                <Chip
                  label={`${(selectedStock.change_pct ?? 0) >= 0 ? '+' : ''}${selectedStock.change_pct}% Today`}
                  size="small"
                  color={(selectedStock.change_pct ?? 0) >= 0 ? 'success' : 'error'}
                  sx={{ fontWeight: 800 }}
                />
              </Stack>
              <Typography variant="body2" sx={{ mt: 1, fontSize: 12, color: 'text.secondary' }}>
                Previous Close: ₹{selectedStock.prev_close} • Day High: ₹{selectedStock.high} (+{selectedStock.day_high_strength_pct}%)
              </Typography>
            </Paper>

            <Typography variant="subtitle2" fontWeight={800} mb={1}>
              PRICE SHOCKER METRICS
            </Typography>
            <Stack spacing={1.5} mb={3}>
              <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">3-Day Starting Price (3 Sessions Ago)</Typography>
                <Typography variant="subtitle1" fontWeight={800}>₹{selectedStock.start_price_3d?.toLocaleString('en-IN')}</Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(0,200,83,0.08)' }}>
                <Typography variant="caption" color="success.main" fontWeight={700}>3-Day Total Gain %</Typography>
                <Typography variant="h6" fontWeight={900} color="success.main">+{selectedStock.gain_3d_pct}%</Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">3D Volume Ratio (vs 3D Avg Volume)</Typography>
                <Typography variant="subtitle1" fontWeight={800}>{selectedStock.volume_ratio}x</Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">Buyer Participation Strength</Typography>
                <Typography variant="subtitle1" fontWeight={800}>{selectedStock.buyer_pct}%</Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">Delivery Percentage</Typography>
                <Typography variant="subtitle1" fontWeight={800}>{selectedStock.delivery_pct}%</Typography>
              </Box>
            </Stack>

            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: isDark ? 'rgba(255,109,0,0.1)' : '#fff3e0' }}>
              <Typography variant="subtitle2" fontWeight={900} color="warning.main" mb={0.5}>
                SCORE: {selectedStock.score}/100 • {selectedStock.signal}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 12, lineHeight: 1.5 }}>
                Stock satisfies price expansion formula with +{selectedStock.gain_3d_pct}% move across the last 3 trading sessions and {selectedStock.buyer_pct}% buyer order dominance.
              </Typography>
            </Paper>

            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate(`/stock/${selectedStock.symbol}`)}
              sx={{
                py: 1.2,
                borderRadius: 2,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #00b0ff 0%, #d500f9 100%)',
              }}
            >
              Open Full Analysis & Chart
            </Button>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}

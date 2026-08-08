import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  TextField, Chip, IconButton, Tooltip, Stack,
  Card, CardContent, Divider, Drawer, LinearProgress, useTheme,
  Button,
} from '@mui/material';
import {
  Equalizer, Search, FileDownload, Refresh, Close,
  Bolt, Whatshot,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { fetchVolume3DShockers, ShockerStock } from '../services/api';

export default function Volume3DShockersPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedStock, setSelectedStock] = useState<ShockerStock | null>(null);
  const [sortField, setSortField] = useState<keyof ShockerStock>('ratio_3d');
  const [sortAsc, setSortAsc] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['volume-3d-shockers', filterClass],
    queryFn: () => fetchVolume3DShockers({ page: 1, limit: 100, classification: filterClass === 'ALL' ? undefined : filterClass }),
    refetchInterval: 60000,
  });

  const rawStocks: ShockerStock[] = data?.stocks || [];
  const top10: ShockerStock[] = data?.top10 || rawStocks.slice(0, 10);

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

  const getClassColor = (cls?: string) => {
    switch (cls) {
      case 'Extreme': return { bg: '#d50000', text: '#fff' };
      case 'Very Strong': return { bg: '#ff6d00', text: '#fff' };
      case 'Strong': return { bg: '#00c853', text: '#000' };
      case 'Moderate': return { bg: '#00b0ff', text: '#000' };
      default: return { bg: 'action.hover', text: 'text.primary' };
    }
  };

  const handleExportCSV = () => {
    const headers = ['Rank', 'Stock', 'Company', 'Current Price', "Today's Volume", '3D Avg Volume', '3D Volume Ratio', 'Classification', "Today's Change %", 'Buyer %', 'Delivery %', 'Score', 'Signal'];
    const rows = sorted.map((s, idx) => [
      idx + 1,
      s.symbol,
      `"${s.name}"`,
      s.current_price,
      s.today_volume,
      s.avg_volume_3d,
      `${s.ratio_3d}x`,
      s.classification,
      `${s.change_pct}%`,
      `${s.buyer_pct}%`,
      `${s.delivery_pct}%`,
      s.score,
      s.signal,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nse_3d_volume_shockers_${Date.now()}.csv`);
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
            ? 'linear-gradient(135deg, rgba(0,229,255,0.12) 0%, rgba(41,98,255,0.06) 100%)'
            : 'linear-gradient(135deg, #e0f7fa 0%, #e8eaf6 100%)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(0,229,255,0.3)' : 'rgba(0,176,255,0.3)',
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
                bgcolor: '#00b0ff', color: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(0,176,255,0.5)',
              }}
            >
              <Equalizer sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={900} letterSpacing={0.5}>
                3-VOLUME SHOCKERS
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                3D Volume Ratio = Today's Volume / 3D Average Volume • Flagged when Today's Volume &gt; 3D Average
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Chip
            icon={<Bolt sx={{ fontSize: '16px !important', color: '#00e5ff' }} />}
            label="INSTITUTIONAL EXPANSION"
            size="small"
            sx={{ fontWeight: 800, bgcolor: isDark ? 'rgba(0,229,255,0.15)' : '#e0f7fa', color: '#00b0ff' }}
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
              background: 'linear-gradient(135deg, #00b0ff 0%, #2979ff 100%)',
            }}
          >
            Export CSV
          </Button>
        </Stack>
      </Paper>

      {/* ── Top 10 3D Volume Shockers Leaderboard ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ mb: 1.5, letterSpacing: 1 }}>
          TOP 10 3D VOLUME SHOCKERS – LEADERBOARD
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' },
            gap: 1.5,
          }}
        >
          {top10.slice(0, 10).map((st, idx) => {
            const clsStyle = getClassColor(st.classification);
            return (
              <Card
                key={st.symbol}
                elevation={0}
                onClick={() => setSelectedStock(st)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: idx === 0 ? '#00b0ff' : 'divider',
                  background: isDark
                    ? idx === 0 ? 'linear-gradient(135deg, rgba(0,176,255,0.18) 0%, rgba(11,17,32,0.9) 100%)' : 'rgba(11,17,32,0.6)'
                    : idx === 0 ? '#e1f5fe' : '#ffffff',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 24px rgba(0,176,255,0.25)',
                    borderColor: '#00b0ff',
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
                      label={`${st.ratio_3d}x`}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        bgcolor: clsStyle.bg,
                        color: clsStyle.text,
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
                    <span>Class: <b>{st.classification}</b></span>
                    <span>Buyer: <b>{st.buyer_pct}%</b></span>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>

      {/* ── Classification Filter Buttons & Search ── */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search symbol, sector..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            sx={{ width: { xs: '100%', md: 280 } }}
            InputProps={{
              startAdornment: <Search sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />,
            }}
          />

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {['ALL', 'Extreme', 'Very Strong', 'Strong', 'Moderate'].map(cls => (
              <Chip
                key={cls}
                label={
                  cls === 'ALL' ? 'All 3D Shockers' :
                  cls === 'Extreme' ? '🔥 Extreme (3.00x+)' :
                  cls === 'Very Strong' ? '⚡ Very Strong (2.00–2.99x)' :
                  cls === 'Strong' ? '✨ Strong (1.50–1.99x)' :
                  'Moderate (1.00–1.49x)'
                }
                clickable
                onClick={() => { setFilterClass(cls); setPage(0); }}
                color={filterClass === cls ? 'primary' : 'default'}
                variant={filterClass === cls ? 'filled' : 'outlined'}
                sx={{ fontWeight: 800, fontSize: '0.72rem' }}
              />
            ))}
          </Stack>
        </Stack>
      </Paper>

      {/* ── Master 3D Volume Shockers Table ── */}
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
        {isLoading && <LinearProgress color="primary" />}
        <Table size="small">
          <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, fontSize: 11, width: 50 }}>RANK</TableCell>
              <TableCell sx={{ fontWeight: 800, fontSize: 11, cursor: 'pointer' }} onClick={() => handleSort('symbol')}>
                STOCK {sortField === 'symbol' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11, cursor: 'pointer' }} onClick={() => handleSort('current_price')}>
                LTP (₹) {sortField === 'current_price' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11, cursor: 'pointer' }} onClick={() => handleSort('today_volume')}>
                TODAY'S VOLUME {sortField === 'today_volume' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11 }}>
                3D AVG VOLUME
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11, cursor: 'pointer', color: '#00b0ff' }} onClick={() => handleSort('ratio_3d')}>
                3D VOLUME SHOCKER {sortField === 'ratio_3d' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, fontSize: 11 }}>
                CLASSIFICATION
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11, cursor: 'pointer' }} onClick={() => handleSort('change_pct')}>
                PRICE CHANGE % {sortField === 'change_pct' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11, cursor: 'pointer' }} onClick={() => handleSort('buyer_pct')}>
                BUYER % {sortField === 'buyer_pct' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11, cursor: 'pointer' }} onClick={() => handleSort('delivery_pct')}>
                DELIVERY % {sortField === 'delivery_pct' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, fontSize: 11, cursor: 'pointer' }} onClick={() => handleSort('score')}>
                SCORE {sortField === 'score' && (sortAsc ? '▲' : '▼')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, fontSize: 11 }}>SIGNAL</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, fontSize: 11 }}>ACTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((st, idx) => {
              const globalIdx = page * rowsPerPage + idx + 1;
              const clsStyle = getClassColor(st.classification);

              return (
                <TableRow
                  key={st.symbol}
                  hover
                  onClick={() => setSelectedStock(st)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ fontSize: 11, fontWeight: 800, color: 'text.secondary' }}>
                    #{globalIdx}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 900, color: isDark ? '#fff' : '#000' }}>
                        {st.symbol}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                        {st.name} • {st.sector}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 13, fontWeight: 900 }}>
                    ₹{st.current_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: 800 }}>
                    {st.today_volume?.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>
                    {st.avg_volume_3d?.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${st.ratio_3d}x`}
                      size="small"
                      sx={{
                        fontWeight: 900,
                        fontSize: '0.75rem',
                        bgcolor: clsStyle.bg,
                        color: clsStyle.text,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: 11, fontWeight: 800 }}>
                      {st.classification}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: 800, color: (st.change_pct ?? 0) >= 0 ? 'success.main' : 'error.main' }}>
                    {(st.change_pct ?? 0) >= 0 ? '+' : ''}{st.change_pct}%
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: 800 }}>
                    <span style={{ color: (st.buyer_pct ?? 0) >= 75 ? '#00c853' : 'inherit' }}>
                      {st.buyer_pct}%
                    </span>
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: 700 }}>
                    <span style={{ color: (st.delivery_pct ?? 0) >= 50 ? '#00e5ff' : 'inherit' }}>
                      {st.delivery_pct}%
                    </span>
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
                      View
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

      {/* ── Stock Detail Drawer ── */}
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

            <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: isDark ? 'rgba(0,176,255,0.08)' : '#e0f7fa', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="overline" color="text.secondary" fontWeight={800}>
                VOLUME EXPANSION SNAPSHOT
              </Typography>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline" mt={0.5}>
                <Typography variant="h5" fontWeight={900} color="primary.main">
                  3D Volume Shocker: {selectedStock.ratio_3d}x
                </Typography>
                <Chip
                  label={selectedStock.classification}
                  size="small"
                  sx={{ fontWeight: 900, ...getClassColor(selectedStock.classification) }}
                />
              </Stack>
              <Typography variant="body2" sx={{ mt: 1, fontSize: 12, color: 'text.secondary' }}>
                Today's Volume: {selectedStock.today_volume?.toLocaleString('en-IN')} vs 3D Avg: {selectedStock.avg_volume_3d?.toLocaleString('en-IN')}
              </Typography>
            </Paper>

            <Typography variant="subtitle2" fontWeight={800} mb={1}>
              ORDER FLOW & DELIVERY
            </Typography>
            <Stack spacing={1.5} mb={3}>
              <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">Buyer % (Buy Quantity / (Buy + Sell Qty))</Typography>
                <Typography variant="subtitle1" fontWeight={800}>{selectedStock.buyer_pct}%</Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">Delivery Percentage</Typography>
                <Typography variant="subtitle1" fontWeight={800}>{selectedStock.delivery_pct}%</Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">Price Momentum</Typography>
                <Typography variant="subtitle1" fontWeight={800}>{(selectedStock.change_pct ?? 0) >= 0 ? '+' : ''}{selectedStock.change_pct}% Today</Typography>
              </Box>
            </Stack>

            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate(`/stock/${selectedStock.symbol}`)}
              sx={{
                py: 1.2,
                borderRadius: 2,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #00b0ff 0%, #2979ff 100%)',
              }}
            >
              Analyze Technical Chart & OI
            </Button>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}

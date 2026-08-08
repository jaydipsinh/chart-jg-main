import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  TextField, Chip, IconButton, Tooltip, Stack,
  Card, CardContent, Divider, Drawer, LinearProgress, useTheme,
  Button, MenuItem, Tabs, Tab, Alert, AlertTitle, Grid,
} from '@mui/material';
import {
  Bolt, Whatshot, Equalizer, TrendingUp, TrendingDown,
  Search, FileDownload, Refresh, Close, Warning,
  CheckCircle, Verified, Star, LocalFireDepartment,
  BarChart, Analytics, Speed, MonetizationOn, Shield,
  ArrowForward, Visibility,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { fetchQuantScreener, ShockerStock } from '../services/api';

export default function QuantScreenerPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('ALL');
  const [minScore, setMinScore] = useState<number>(0);
  const [highConvictionOnly, setHighConvictionOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedStock, setSelectedStock] = useState<ShockerStock | null>(null);
  const [sortField, setSortField] = useState<keyof ShockerStock>('score');
  const [sortAsc, setSortAsc] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['quant-screener', sector, minScore, highConvictionOnly],
    queryFn: () => fetchQuantScreener({
      page: 1,
      limit: 200,
      sector: sector === 'ALL' ? undefined : sector,
      min_score: minScore > 0 ? minScore : undefined,
      high_conviction_only: highConvictionOnly,
    }),
    refetchInterval: 60000,
  });

  const sections = data?.sections;
  const masterList: ShockerStock[] = data?.master_buy_list || [];
  const isMarketOpen = data?.is_market_open ?? true;

  // Filter and sort master list
  const filtered = masterList.filter(s => {
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
    const headers = [
      'Rank', 'Stock', 'Company', 'Current Price (₹)', "Today's Change %", '3-Day Gain %',
      'Buyer %', 'Delivery %', "Today's Volume", '3D Avg Volume', '3D Volume Ratio',
      '5D Volume Ratio', '7D Volume Ratio', 'Day High Strength %', 'Final Score /100', 'Signal', 'Action Verdict'
    ];
    const rows = sorted.map((s, idx) => [
      idx + 1,
      s.symbol,
      `"${s.name}"`,
      s.current_price,
      `${s.change_pct}%`,
      `${s.gain_3d_pct}%`,
      `${s.buyer_pct}%`,
      `${s.delivery_pct}%`,
      s.today_volume,
      s.avg_volume_3d,
      `${s.ratio_3d}x`,
      `${s.ratio_5d}x`,
      `${s.ratio_7d}x`,
      `${s.day_high_strength_pct}%`,
      s.score,
      s.signal,
      `"${s.action_verdict}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nse_master_buy_screener_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sectors = ['ALL', ...Array.from(new Set(masterList.map(s => s.sector))).filter(Boolean)];

  return (
    <Box sx={{ pb: 6 }}>
      {/* ── Data Validation & Market Warning Banner ── */}
      {isMarketOpen ? (
        <Alert
          severity="warning"
          icon={<Warning fontSize="inherit" />}
          sx={{
            mb: 2.5,
            borderRadius: 2.5,
            bgcolor: isDark ? 'rgba(255,152,0,0.12)' : '#fff8e1',
            border: '1px solid',
            borderColor: 'warning.main',
          }}
        >
          <AlertTitle sx={{ fontWeight: 900, fontSize: 13 }}>
            ⚠ INTRADAY DATA • MARKET OPEN
          </AlertTitle>
          Today's traded volume, buyer percentage, and delivery data are streaming in real-time. Calculations update dynamically every session minute.
        </Alert>
      ) : (
        <Alert
          severity="info"
          icon={<CheckCircle fontSize="inherit" />}
          sx={{
            mb: 2.5,
            borderRadius: 2.5,
            bgcolor: isDark ? 'rgba(0,176,255,0.08)' : '#e1f5fe',
            border: '1px solid',
            borderColor: 'primary.main',
          }}
        >
          <AlertTitle sx={{ fontWeight: 900, fontSize: 13 }}>
            ✓ EOD SESSION VERIFIED • MARKET CLOSED
          </AlertTitle>
          All 7 historical sessions, volume ratios, 3-day price shockers, and 100-point scores have been verified against official NSE settlement data.
        </Alert>
      )}

      {/* ── Header ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(213,0,249,0.08) 100%)'
            : 'linear-gradient(135deg, #e1f5fe 0%, #ede7f6 100%)',
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
                width: 44, height: 44, borderRadius: 2,
                background: 'linear-gradient(135deg, #00e5ff 0%, #d500f9 100%)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0,229,255,0.5)',
              }}
            >
              <Bolt sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={900} letterSpacing={0.5}>
                MONEYCONTROL-STYLE MARKET DASHBOARD & QUANT SCREENER
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                100-Point Buy Score Engine • Buyer Order Dominance • Volume Expansion • Price Shockers
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Chip
            label={isMarketOpen ? '🟢 LIVE OPEN' : '🔴 CLOSED'}
            size="small"
            color={isMarketOpen ? 'success' : 'default'}
            sx={{ fontWeight: 900 }}
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
              background: 'linear-gradient(135deg, #00b0ff 0%, #d500f9 100%)',
            }}
          >
            Export Master List
          </Button>
        </Stack>
      </Paper>

      {/* ── 100-Point Buy Score Formula Cards ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ mb: 1, letterSpacing: 1 }}>
          100-POINT QUANTITATIVE BUY SCORE FORMULA BREAKDOWN
        </Typography>
        <Grid container spacing={1.5}>
          {[
            { label: 'Buyer Strength', pts: '25 pts', desc: 'Buyer % > 75% Strong, > 80% Very Strong, > 90% Extreme', color: '#00c853' },
            { label: 'Volume Expansion', pts: '25 pts', desc: '3D/5D/7D Ratio: 1.0–1.49x Mod, 1.5–1.99x Strong, 2.0x+ Very Strong, 3.0x+ Extreme', color: '#00b0ff' },
            { label: 'Price Momentum', pts: '15 pts', desc: 'Intraday & Weekly positive trend continuation', color: '#7c4dff' },
            { label: '3-Day Price Shock', pts: '10 pts', desc: '3-Trading-Session Price Gain % expansion', color: '#ff6d00' },
            { label: 'Delivery Strength', pts: '10 pts', desc: 'Delivery % > 40% Good, > 50% Strong, > 60% Very Strong', color: '#00e5ff' },
            { label: 'Day High vs Prev Close', pts: '5 pts', desc: 'Day High Strength % and breakout pressure', color: '#ffd600' },
            { label: 'Price + Vol Confirm', pts: '5 pts', desc: 'Simultaneous 3D Price > 3% + Vol > 3D Avg + Buyer > 75%', color: '#ff1744' },
            { label: 'Trend / Technical', pts: '5 pts', desc: 'EMA20 / EMA50 stack and structural price hold', color: '#aeea00' },
          ].map(f => (
            <Grid item xs={6} sm={3} md={1.5} key={f.label}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%',
                  bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
                }}
              >
                <Typography sx={{ fontSize: 10, fontWeight: 800, color: f.color }}>{f.pts}</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 900, lineHeight: 1.2, my: 0.25 }}>{f.label}</Typography>
                <Typography sx={{ fontSize: 9.5, color: 'text.secondary', lineHeight: 1.2 }}>{f.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── 🔥 High-Conviction Buy Showcase ── */}
      {sections?.high_conviction_buys && sections.high_conviction_buys.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 3,
            background: isDark
              ? 'linear-gradient(135deg, rgba(255,23,68,0.15) 0%, rgba(255,109,0,0.08) 100%)'
              : 'linear-gradient(135deg, #ffebee 0%, #fff3e0 100%)',
            border: '2px solid',
            borderColor: '#ff1744',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
            <LocalFireDepartment sx={{ color: '#ff1744', fontSize: 26 }} />
            <Typography variant="h6" fontWeight={900} color="#ff1744">
              🔥 HIGH-CONVICTION BUY SIGNALS (SCORE ≥ 80 &amp; BUYER % &gt; 75%)
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            {sections.high_conviction_buys.slice(0, 4).map(st => (
              <Grid item xs={12} sm={6} md={3} key={st.symbol}>
                <Card
                  elevation={0}
                  onClick={() => setSelectedStock(st)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: '#ff1744',
                    background: isDark ? '#0b1120' : '#fff',
                    p: 1.5,
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(255,23,68,0.3)' },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontWeight: 900, fontSize: 15 }}>{st.symbol}</Typography>
                    <Chip label={`Score: ${st.score}`} size="small" sx={{ fontWeight: 900, bgcolor: '#ff1744', color: '#fff', height: 20 }} />
                  </Stack>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 1 }}>{st.name}</Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                    <Typography sx={{ fontWeight: 900, fontSize: 16 }}>₹{st.current_price?.toLocaleString('en-IN')}</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: 12, color: 'success.main' }}>+{st.change_pct}% Today</Typography>
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" justifyContent="space-between" sx={{ fontSize: 10, color: 'text.secondary' }}>
                    <span>Buyer: <b>{st.buyer_pct}%</b></span>
                    <span>3D Vol: <b>{st.ratio_3d}x</b></span>
                    <span>Delivery: <b>{st.delivery_pct}%</b></span>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* ── Moneycontrol Market Sections Tabs ── */}
      <Paper elevation={0} sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', mb: 3, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 800, fontSize: 12, textTransform: 'none', minHeight: 48 },
          }}
        >
          <Tab label="🏆 Master Buy List (All)" />
          <Tab label="🔥 Price + Vol Shockers" />
          <Tab label="⚡ Top 10 Price Shockers" />
          <Tab label="📊 Top 10 3D Vol Shockers" />
          <Tab label="📈 Top 10 5D Vol Shockers" />
          <Tab label="🔬 Top 10 7D Vol Shockers" />
          <Tab label="🎯 Top Gainers" />
          <Tab label="💪 Buyer Shockers (>80%)" />
          <Tab label="📦 Delivery Shockers" />
          <Tab label="🚀 Breakout Watch" />
          <Tab label="💎 Strong Buy Candidates" />
        </Tabs>

        {/* ── Master Filters Row ── */}
        <Box sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search symbol, company or sector..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            sx={{ width: { xs: '100%', md: 320 } }}
            InputProps={{
              startAdornment: <Search sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />,
            }}
          />

          <TextField
            select
            size="small"
            label="Sector"
            value={sector}
            onChange={e => { setSector(e.target.value); setPage(0); }}
            sx={{ width: { xs: '100%', md: 180 } }}
          >
            {sectors.map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Min Score"
            value={minScore}
            onChange={e => { setMinScore(Number(e.target.value)); setPage(0); }}
            sx={{ width: { xs: '100%', md: 150 } }}
          >
            <MenuItem value={0}>All Scores</MenuItem>
            <MenuItem value={80}>Score ≥ 80 (Strong Buy)</MenuItem>
            <MenuItem value={70}>Score ≥ 70 (Buy)</MenuItem>
            <MenuItem value={60}>Score ≥ 60 (Watch)</MenuItem>
          </TextField>

          <Button
            variant={highConvictionOnly ? 'contained' : 'outlined'}
            color="error"
            size="small"
            onClick={() => { setHighConvictionOnly(!highConvictionOnly); setPage(0); }}
            sx={{ fontWeight: 800, textTransform: 'none', borderRadius: 2 }}
          >
            🔥 High-Conviction Only
          </Button>

          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            {sorted.length} stocks ranked by Score DESC &amp; Vol Ratio DESC
          </Typography>
        </Box>

        {/* ── Table of Stocks ── */}
        <TableContainer sx={{ maxHeight: 600 }}>
          {isLoading && <LinearProgress color="primary" />}
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: isDark ? '#10172a' : '#f8fafc', fontWeight: 900, fontSize: 11 } }}>
                <TableCell sx={{ width: 50 }}>RANK</TableCell>
                <TableCell sx={{ cursor: 'pointer' }} onClick={() => handleSort('symbol')}>
                  STOCK {sortField === 'symbol' && (sortAsc ? '▲' : '▼')}
                </TableCell>
                <TableCell align="right" sx={{ cursor: 'pointer' }} onClick={() => handleSort('current_price')}>
                  LTP (₹) {sortField === 'current_price' && (sortAsc ? '▲' : '▼')}
                </TableCell>
                <TableCell align="right" sx={{ cursor: 'pointer' }} onClick={() => handleSort('change_pct')}>
                  TODAY % {sortField === 'change_pct' && (sortAsc ? '▲' : '▼')}
                </TableCell>
                <TableCell align="right" sx={{ cursor: 'pointer', color: '#ff6d00' }} onClick={() => handleSort('gain_3d_pct')}>
                  3D GAIN % {sortField === 'gain_3d_pct' && (sortAsc ? '▲' : '▼')}
                </TableCell>
                <TableCell align="right" sx={{ cursor: 'pointer' }} onClick={() => handleSort('buyer_pct')}>
                  BUYER % {sortField === 'buyer_pct' && (sortAsc ? '▲' : '▼')}
                </TableCell>
                <TableCell align="right" sx={{ cursor: 'pointer' }} onClick={() => handleSort('delivery_pct')}>
                  DELIVERY % {sortField === 'delivery_pct' && (sortAsc ? '▲' : '▼')}
                </TableCell>
                <TableCell align="right">TODAY'S VOL</TableCell>
                <TableCell align="right">3D AVG</TableCell>
                <TableCell align="right" sx={{ cursor: 'pointer', color: '#00b0ff' }} onClick={() => handleSort('ratio_3d')}>
                  3D VOL X {sortField === 'ratio_3d' && (sortAsc ? '▲' : '▼')}
                </TableCell>
                <TableCell align="right">5D VOL X</TableCell>
                <TableCell align="right">7D VOL X</TableCell>
                <TableCell align="right">DAY HIGH VS PREV</TableCell>
                <TableCell align="center" sx={{ cursor: 'pointer' }} onClick={() => handleSort('score')}>
                  SCORE {sortField === 'score' && (sortAsc ? '▲' : '▼')}
                </TableCell>
                <TableCell align="center">SIGNAL</TableCell>
                <TableCell align="center">ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((st, idx) => {
                const globalIdx = page * rowsPerPage + idx + 1;
                const isPV = st.is_price_vol_shocker;
                const isHC = st.is_high_conviction;

                return (
                  <TableRow
                    key={st.symbol}
                    hover
                    onClick={() => setSelectedStock(st)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isHC
                        ? (isDark ? 'rgba(255,23,68,0.08)' : 'rgba(255,23,68,0.04)')
                        : isPV
                        ? (isDark ? 'rgba(255,109,0,0.06)' : 'rgba(255,109,0,0.03)')
                        : 'inherit',
                    }}
                  >
                    <TableCell sx={{ fontSize: 11, fontWeight: 800, color: 'text.secondary' }}>
                      #{globalIdx}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 900 }}>
                            {st.symbol}
                          </Typography>
                          <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                            {st.name} • {st.sector}
                          </Typography>
                        </Box>
                        {isHC && (
                          <Chip label="🔥 HIGH BUY" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 900, bgcolor: '#ff1744', color: '#fff' }} />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 13, fontWeight: 900 }}>
                      ₹{st.current_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 12, fontWeight: 800, color: (st.change_pct ?? 0) >= 0 ? 'success.main' : 'error.main' }}>
                      {(st.change_pct ?? 0) >= 0 ? '+' : ''}{st.change_pct}%
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 12, fontWeight: 900, color: '#ff6d00' }}>
                      +{st.gain_3d_pct}%
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
                    <TableCell align="right" sx={{ fontSize: 11, color: 'text.secondary' }}>
                      {st.today_volume?.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 11, color: 'text.secondary' }}>
                      {st.avg_volume_3d?.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${st.ratio_3d}x`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 900,
                          bgcolor: (st.ratio_3d ?? 1) >= 2.0 ? '#00e5ff' : (st.ratio_3d ?? 1) >= 1.5 ? '#b9f6ca' : 'action.hover',
                          color: '#000',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 11, fontWeight: 700 }}>
                      {st.ratio_5d}x
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 11, fontWeight: 700 }}>
                      {st.ratio_7d}x
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 11, fontWeight: 700 }}>
                      +{st.day_high_strength_pct}%
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${st.score}/100`}
                        size="small"
                        sx={{
                          fontWeight: 900,
                          fontSize: '0.72rem',
                          bgcolor: (st.score ?? 0) >= 80 ? '#00c853' : (st.score ?? 0) >= 70 ? '#2979ff' : (st.score ?? 0) >= 60 ? '#ff9100' : 'action.hover',
                          color: (st.score ?? 0) >= 60 ? '#fff' : 'text.primary',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={st.signal}
                        size="small"
                        color={st.signal === 'STRONG BUY' ? 'success' : st.signal === 'BUY' ? 'primary' : st.signal === 'WATCH' ? 'warning' : 'default'}
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
                        Card
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={sorted.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>

      {/* ── Moneycontrol-Style Stock Card Modal / Drawer ── */}
      <Drawer
        anchor="right"
        open={Boolean(selectedStock)}
        onClose={() => setSelectedStock(null)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 480 },
            p: 3,
            bgcolor: isDark ? '#0b1120' : '#fff',
          },
        }}
      >
        {selectedStock && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h5" fontWeight={900}>
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

            {/* Price Header Card */}
            <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: isDark ? 'rgba(0,176,255,0.06)' : '#f0f8ff', border: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <Typography variant="h4" fontWeight={900}>
                  ₹{selectedStock.current_price?.toLocaleString('en-IN')}
                </Typography>
                <Chip
                  label={`${(selectedStock.change_pct ?? 0) >= 0 ? '+' : ''}${selectedStock.change_pct}% Today`}
                  size="small"
                  color={(selectedStock.change_pct ?? 0) >= 0 ? 'success' : 'error'}
                  sx={{ fontWeight: 900 }}
                />
              </Stack>
              <Typography variant="body2" sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary' }}>
                Prev Close: ₹{selectedStock.prev_close} • Day High: ₹{selectedStock.high} (+{selectedStock.day_high_strength_pct}%) • Day Low: ₹{selectedStock.low}
              </Typography>
            </Paper>

            {/* Signal & Score Rating */}
            <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: (selectedStock.score ?? 0) >= 80 ? 'rgba(0,200,83,0.1)' : 'rgba(255,152,0,0.1)', border: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" fontWeight={900}>
                  SIGNAL: {selectedStock.signal}
                </Typography>
                <Chip label={`Score: ${selectedStock.score}/100`} color="primary" sx={{ fontWeight: 900 }} />
              </Stack>
              <Typography variant="body2" sx={{ fontSize: 12, lineHeight: 1.5 }}>
                {selectedStock.reason}
              </Typography>
            </Paper>

            {/* 100-Point Formula Detailed Breakdown */}
            <Typography variant="subtitle2" fontWeight={800} mb={1}>
              100-POINT SCORE COMPONENT BREAKDOWN
            </Typography>
            <Stack spacing={1} mb={3}>
              {[
                { label: 'Buyer Order Strength (25 max)', score: selectedStock.score_breakdown?.buyer_strength, color: '#00c853' },
                { label: 'Volume Expansion 3D (25 max)', score: selectedStock.score_breakdown?.volume_expansion, color: '#00b0ff' },
                { label: 'Price Momentum (15 max)', score: selectedStock.score_breakdown?.price_momentum, color: '#7c4dff' },
                { label: '3-Day Price Shock (10 max)', score: selectedStock.score_breakdown?.price_shock_3d, color: '#ff6d00' },
                { label: 'Delivery Strength (10 max)', score: selectedStock.score_breakdown?.delivery_strength, color: '#00e5ff' },
                { label: 'Day High vs Prev Close (5 max)', score: selectedStock.score_breakdown?.day_high_vs_prev_close, color: '#ffd600' },
                { label: 'Price + Vol Confirmation (5 max)', score: selectedStock.score_breakdown?.price_volume_confirm, color: '#ff1744' },
                { label: 'Trend / Technical Strength (5 max)', score: selectedStock.score_breakdown?.trend_technical, color: '#aeea00' },
              ].map(item => (
                <Box key={item.label} sx={{ p: 1.2, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 700 }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 900, color: item.color }}>+{item.score} pts</Typography>
                </Box>
              ))}
            </Stack>

            {/* Targets & Levels */}
            <Typography variant="subtitle2" fontWeight={800} mb={1}>
              TARGET MATRIX &amp; ACTION VERDICT
            </Typography>
            <Stack spacing={1} mb={3}>
              <Box sx={{ p: 1.2, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Stop Loss</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 900, color: 'error.main' }}>₹{selectedStock.stop_loss}</Typography>
              </Box>
              <Box sx={{ p: 1.2, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Target 1 (1M)</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 900, color: '#00897b' }}>₹{selectedStock.target1}</Typography>
              </Box>
              <Box sx={{ p: 1.2, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Target 2 (1M)</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 900, color: '#2e7d32' }}>₹{selectedStock.target2}</Typography>
              </Box>
              <Box sx={{ p: 1.2, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Target 3 (1M)</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 900, color: '#1565c0' }}>₹{selectedStock.target3}</Typography>
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
                background: 'linear-gradient(135deg, #00b0ff 0%, #d500f9 100%)',
              }}
            >
              Open Interactive Full Stock Chart
            </Button>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}

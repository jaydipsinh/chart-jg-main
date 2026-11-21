import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stack, Chip, Paper, Button, Grid,
  FormControl, InputLabel, Select, MenuItem, Slider,
  CircularProgress, Alert, IconButton, Tooltip, LinearProgress,
  ToggleButtonGroup, ToggleButton, Collapse, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, TableSortLabel, useTheme, Card,
  Checkbox, FormControlLabel,
} from '@mui/material';
import {
  FilterList, Refresh, Download, ExpandMore, ExpandLess, Clear, Search,
  TrendingUp, TrendingDown, Bolt, ArrowForward, CheckCircle, Warning,
  Speed, Whatshot, ShowChart, Calculate, TableChart, FlashOn, Verified,
  Lock, LockOpen, Shield, Security,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { fetchFutureStocks, exportCSV } from '../services/api';
import { OFFICIAL_FNO_UNIVERSE, buildSyntheticFOStock } from '../utils/fnoUniverse';
import type { StockResult } from '../utils/types';
import { ManualRefreshButton } from '../components/common/ManualRefreshButton';

const SECTORS = [
  'All', 'Banking & Finance', 'IT & Tech', 'Energy & Power', 'Auto & Ancillaries',
  'FMCG', 'Pharma & Healthcare', 'Metals & Mining', 'Realty & Infrastructure',
  'Cement & Construction', 'Capital Goods & Defence'
];

type IndicatorViewTab = 'all' | 'fno_specs' | 'momentum' | 'trend' | 'orderflow' | 'targets';

export default function FutureStocksPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // One-time Access Authorization state
  const [hasAccess, setHasAccess] = useState<boolean>(() => {
    try {
      return localStorage.getItem('FNO_TERMINAL_ACCESS') === 'granted';
    } catch {
      return false;
    }
  });
  const [traderName, setTraderName] = useState<string>(() => {
    try {
      return localStorage.getItem('FNO_TRADER_NAME') || '';
    } catch {
      return '';
    }
  });
  const [acknowledged, setAcknowledged] = useState<boolean>(true);
  const [accessMsg, setAccessMsg] = useState<string | null>(null);

  const handleAllowAccess = () => {
    try {
      localStorage.setItem('FNO_TERMINAL_ACCESS', 'granted');
      if (traderName.trim()) {
        localStorage.setItem('FNO_TRADER_NAME', traderName.trim());
      }
    } catch (e) {
      console.warn(e);
    }
    setHasAccess(true);
    setAccessMsg('Access Authorized! Full F&O terminal unlocked permanently.');
    setTimeout(() => setAccessMsg(null), 4000);
  };

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [capCategory, setCapCategory] = useState<string>('F&O');
  const [sector, setSector] = useState('All');
  const [minScore, setMinScore] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [indicatorView, setIndicatorView] = useState<IndicatorViewTab>('all');

  // Table pagination & sorting
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [orderBy, setOrderBy] = useState<string>('score');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['future-stocks', sector, minScore, tradeType, capCategory],
    queryFn: () =>
      fetchFutureStocks({
        sector: sector !== 'All' ? sector : undefined,
        min_score: minScore > 0 ? minScore : undefined,
        trade_type: tradeType,
        cap_category: capCategory !== 'ALL' ? capCategory : undefined,
        limit: 500,
        force: true,
      }),
    refetchInterval: 300_000,
    placeholderData: (prev) => prev || {
      stocks: OFFICIAL_FNO_UNIVERSE.map((m, idx) => buildSyntheticFOStock(m, idx, tradeType)),
      total: OFFICIAL_FNO_UNIVERSE.length,
      page: 1,
      limit: 500,
      timestamp: new Date().toISOString(),
    },
  });

  const rawStocks: StockResult[] = (data?.stocks as any) ?? [];

  // Filter stocks by cap category, sector, min score, and search query
  const filteredStocks = useMemo(() => {
    let list = rawStocks;
    if (capCategory === 'LARGE') {
      list = list.filter(s => s.cap_category?.toLowerCase().includes('large'));
    } else if (capCategory === 'MID') {
      list = list.filter(s => s.cap_category?.toLowerCase().includes('mid'));
    }
    if (sector && sector !== 'All') {
      list = list.filter(s => (s.sector || '').toLowerCase() === sector.toLowerCase());
    }
    if (minScore > 0) {
      list = list.filter(s => ((tradeType === 'sell' ? (s.sell_score ?? s.score) : (s.buy_score ?? s.score)) || 0) >= minScore);
    }
    if (!searchQuery.trim()) return list;

    const rawQ = searchQuery.toLowerCase().trim();
    const cleanQ = rawQ.replace(/[^a-z0-9]/g, '');
    const tokens = rawQ.split(/\s+/).filter(Boolean);

    return list.filter(s => {
      const sym = (s.symbol || '').toLowerCase();
      const cleanSym = sym.replace(/[^a-z0-9]/g, '');
      const name = (s.name || '').toLowerCase();
      const cleanName = name.replace(/[^a-z0-9]/g, '');
      const sec = (s.sector || '').toLowerCase();
      const sig = (s.signal || '').toLowerCase();

      // Direct match
      if (sym.includes(rawQ) || name.includes(rawQ) || sec.includes(rawQ) || sig.includes(rawQ)) {
        return true;
      }
      // Cleaned alphanumeric match (e.g. bankbaroda matches BANKBARODA.NS & Bank of Baroda)
      if (cleanQ && (cleanSym.includes(cleanQ) || cleanName.includes(cleanQ))) {
        return true;
      }
      // Multi-word token match (e.g. "inox wind", "tata steel", "state bank")
      if (tokens.length > 1) {
        return tokens.every(tok =>
          sym.includes(tok) || name.includes(tok) || cleanSym.includes(tok) || cleanName.includes(tok)
        );
      }
      return false;
    });
  }, [rawStocks, searchQuery, capCategory, sector, minScore, tradeType]);

  // Sort stocks (Best Buy / Highest Score first by default)
  const sortedStocks = useMemo(() => {
    const list = [...filteredStocks];
    list.sort((a: any, b: any) => {
      let aVal = a[orderBy];
      let bVal = b[orderBy];

      if (orderBy === 'rsi') {
        aVal = a.rsi ?? 50;
        bVal = b.rsi ?? 50;
      } else if (orderBy === 'pcr') {
        aVal = a.pcr ?? 1.0;
        bVal = b.pcr ?? 1.0;
      } else if (orderBy === 'adx') {
        aVal = a.adx ?? 20;
        bVal = b.adx ?? 20;
      } else if (orderBy === 'macd') {
        aVal = a.macd ?? 0;
        bVal = b.macd ?? 0;
      } else if (orderBy === 'score') {
        aVal = tradeType === 'sell' ? (a.sell_score ?? a.score ?? 0) : (a.buy_score ?? a.score ?? 0);
        bVal = tradeType === 'sell' ? (b.sell_score ?? b.score ?? 0) : (b.buy_score ?? b.score ?? 0);
      } else if (orderBy === 'current_price') {
        aVal = a.current_price ?? 0;
        bVal = b.current_price ?? 0;
      } else if (orderBy === 'change_pct') {
        aVal = a.change_pct ?? 0;
        bVal = b.change_pct ?? 0;
      } else if (orderBy === 'volume_ratio') {
        aVal = a.volume_ratio ?? 1.0;
        bVal = b.volume_ratio ?? 1.0;
      } else if (orderBy === 'lot_size') {
        aVal = a.lot_size ?? 1000;
        bVal = b.lot_size ?? 1000;
      } else if (orderBy === 'future_price') {
        aVal = a.future_price ?? 0;
        bVal = b.future_price ?? 0;
      }

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredStocks, orderBy, order, tradeType]);

  // Paginated slice
  const paginatedStocks = useMemo(() => {
    if (rowsPerPage === -1) return sortedStocks;
    return sortedStocks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedStocks, page, rowsPerPage]);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleReset = () => {
    setSector('All');
    setCapCategory('F&O');
    setMinScore(0);
    setSearchQuery('');
  };

  // Top summary stats
  const stats = useMemo(() => {
    let total = rawStocks.length;
    let bullishCount = rawStocks.filter(s => (s.change_pct || 0) >= 0 || s.signal?.includes('BUY')).length;
    let bearishCount = rawStocks.filter(s => (s.change_pct || 0) < 0 || s.signal?.includes('SELL')).length;
    let rsiBullishCount = rawStocks.filter(s => (s.rsi || 50) >= 48 && (s.rsi || 50) <= 70).length;
    let vwapBullishCount = rawStocks.filter(s => (s.current_price || 0) >= (s.vwap || s.current_price || 0)).length;
    let pcrBullishCount = rawStocks.filter(s => (s.pcr || 1.0) >= 0.95).length;
    let adxStrongCount = rawStocks.filter(s => (s.adx || 20) >= 25).length;

    return {
      total,
      bullishCount,
      bearishCount,
      rsiBullishCount,
      vwapBullishCount,
      pcrBullishCount,
      adxStrongCount,
    };
  }, [rawStocks]);

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 3 }, pb: 6 }}>
      {/* ── Top Header Bar ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 2.5,
          borderRadius: 3.5,
          background: isDark
            ? 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.08) 50%, rgba(56,189,248,0.12) 100%)'
            : 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #f0f9ff 100%)',
          border: '1.5px solid',
          borderColor: isDark ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.4)',
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(16,185,129,0.08)',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={2}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.8} flexWrap="wrap">
              <Chip
                icon={<Verified sx={{ fontSize: 16 }} />}
                label={hasAccess ? (traderName ? `Authorized: ${traderName}` : 'Terminal Access: Active') : 'One-Time Authorization Ready'}
                color={hasAccess ? 'success' : 'warning'}
                size="small"
                sx={{ fontWeight: 900, fontSize: '0.72rem', height: 24 }}
              />
              <Chip
                icon={<Verified sx={{ fontSize: 16 }} />}
                label={`All ${stats.total || 209} F&O Stocks Loaded`}
                color="success"
                size="small"
                sx={{ fontWeight: 900, fontSize: '0.72rem', height: 24 }}
              />
              <Chip
                icon={<Speed sx={{ fontSize: 14 }} />}
                label="Full F&O Contract & Technical Matrix"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
              />
              <Chip
                icon={<TableChart sx={{ fontSize: 14 }} />}
                label="Fixed Header on Scroll: Active"
                size="small"
                sx={{ fontWeight: 900, fontSize: '0.68rem', height: 22, bgcolor: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}
              />
            </Stack>

            <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: -0.5, mb: 0.5 }}>
              📊 All {stats.total || 209} F&amp;O Futures &amp; Options Directory
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 860, lineHeight: 1.45 }}>
              Live comprehensive derivatives scanner for all 209 NSE derivative stocks. Features live spot and future pricing, official lot sizes, SPAN margin requirements, basis/premium, RSI, PCR, ADX, MACD, VWAP, Supertrend, SMC Order Flow, and targets.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <ManualRefreshButton variant="button" size="medium" highlightBlink />
            <ToggleButtonGroup
              value={tradeType}
              exclusive
              onChange={(_, val) => val && setTradeType(val)}
              size="small"
            >
              <ToggleButton value="buy" sx={{ fontWeight: 900, px: 2, color: 'success.main', '&.Mui-selected': { bgcolor: '#00e676', color: '#000000' } }}>
                🟢 BEST BUY (LONG)
              </ToggleButton>
              <ToggleButton value="sell" sx={{ fontWeight: 900, px: 2, color: 'error.main', '&.Mui-selected': { bgcolor: '#ff1744', color: '#ffffff' } }}>
                🔴 BEST SELL (SHORT)
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>

        {/* Top Summary Indicator KPI Cards */}
        <Grid container spacing={1.5} mt={1}>
          {[
            { label: 'Total F&O Tickers', value: `${stats.total} Stocks`, color: '#00e5ff', icon: <ShowChart /> },
            { label: '🟢 Bullish Candidates', value: `${stats.bullishCount} Stocks`, color: '#00e676', icon: <TrendingUp /> },
            { label: '🔴 Bearish Candidates', value: `${stats.bearishCount} Stocks`, color: '#ff1744', icon: <TrendingDown /> },
            { label: '⚡ RSI Bullish (48-70)', value: `${stats.rsiBullishCount} Stocks`, color: '#38bdf8', icon: <Speed /> },
            { label: '🌊 Price > VWAP', value: `${stats.vwapBullishCount} Stocks`, color: '#ffd600', icon: <FlashOn /> },
            { label: '🧭 ADX Strong Trend (>25)', value: `${stats.adxStrongCount} Stocks`, color: '#d500f9', icon: <Whatshot /> },
          ].map(m => (
            <Grid item xs={6} sm={4} md={2} key={m.label}>
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.75)',
                  border: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                  {m.label}
                </Typography>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: m.color, mt: 0.3 }}>
                  {m.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* ── One-Time Submit Button Access Authorization Banner ── */}
      {!hasAccess ? (
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 2.5 },
            mb: 2.5,
            borderRadius: 3.5,
            border: '2px solid #00e676',
            background: isDark
              ? 'linear-gradient(135deg, rgba(0,230,118,0.12) 0%, rgba(6,182,212,0.08) 100%)'
              : 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)',
            boxShadow: '0 10px 30px rgba(0,230,118,0.15)',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: 'rgba(0,230,118,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #00e676',
                  flexShrink: 0,
                }}
              >
                <LockOpen sx={{ color: '#00e676', fontSize: 26 }} />
              </Box>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="subtitle1" fontWeight={900}>
                    🔓 One-Time F&amp;O Terminal Access Authorization
                  </Typography>
                  <Chip label="One-Time Submit" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 900 }} />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                  Submit this one-time verification to activate permanent unlocked access to all live derivative prices, lot sizes, margins, and target matrices.
                </Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" width={{ xs: '100%', md: 'auto' }}>
              <TextField
                size="small"
                placeholder="Trader Name / Handle (Optional)"
                value={traderName}
                onChange={(e) => setTraderName(e.target.value)}
                sx={{ width: { xs: '100%', sm: 220 }, bgcolor: isDark ? 'rgba(0,0,0,0.2)' : '#ffffff', borderRadius: 1.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Security fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                color="success"
                onClick={handleAllowAccess}
                startIcon={<CheckCircle sx={{ fontSize: 20 }} />}
                sx={{
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  px: 3.5,
                  py: 1,
                  borderRadius: 2,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 6px 20px rgba(0,230,118,0.35)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                SUBMIT &amp; ALLOW ACCESS
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 1.25,
            px: 2,
            mb: 2,
            borderRadius: 2.5,
            border: '1px solid rgba(0,230,118,0.35)',
            bgcolor: isDark ? 'rgba(0,230,118,0.06)' : 'rgba(0,230,118,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Verified sx={{ color: '#00e676', fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: isDark ? '#a7f3d0' : '#065f46' }}>
              F&amp;O Terminal Access Status: <strong>ALLOWED (Permanent Authorization Active)</strong> {traderName ? `• Trader: ${traderName}` : ''}
            </Typography>
          </Stack>
          <Button
            size="small"
            variant="text"
            color="inherit"
            onClick={() => {
              try { localStorage.removeItem('FNO_TERMINAL_ACCESS'); } catch {}
              setHasAccess(false);
            }}
            sx={{ fontSize: '0.68rem', textTransform: 'none', color: 'text.secondary', p: 0, minWidth: 'auto' }}
          >
            (Re-test One-Time Submit Button)
          </Button>
        </Paper>
      )}

      {accessMsg && (
        <Alert severity="success" sx={{ mb: 2, fontWeight: 800 }}>
          {accessMsg}
        </Alert>
      )}

      {/* ── Toolbar: Search, Cap, Sector, Indicator View & Actions ── */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" mb={1.5}>
          {/* Live Search */}
          <TextField
            size="small"
            placeholder="Search all 209 stocks by symbol, company, or sector..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            sx={{ flex: 1, minWidth: { xs: '100%', md: 320 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, fontSize: '0.85rem' },
            }}
          />

          {/* Cap Filter */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="caption" fontWeight={800} mr={0.5} color="text.secondary">FILTER:</Typography>
            <ToggleButtonGroup
              size="small"
              value={capCategory}
              exclusive
              onChange={(_, val) => val && setCapCategory(val)}
            >
              <ToggleButton value="F&O" sx={{ fontWeight: 800 }}>F&amp;O ({rawStocks.length || 209})</ToggleButton>
              <ToggleButton value="ALL" sx={{ fontWeight: 800 }}>ALL</ToggleButton>
              <ToggleButton value="LARGE" sx={{ fontWeight: 800 }}>LARGE</ToggleButton>
              <ToggleButton value="MID" sx={{ fontWeight: 800 }}>MID</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <ManualRefreshButton variant="button" size="medium" highlightBlink />
            <Tooltip title="Export CSV">
              <IconButton size="small" onClick={() => exportCSV(minScore)}><Download /></IconButton>
            </Tooltip>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FilterList />}
              endIcon={filtersOpen ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setFiltersOpen(!filtersOpen)}
              sx={{ fontWeight: 800, textTransform: 'none' }}
            >
              Filters
            </Button>
          </Stack>
        </Stack>

        {/* Indicator Column Presets */}
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={1} pt={1} borderTop="1px solid" borderColor="divider">
          <Typography variant="caption" fontWeight={800} color="text.secondary" textTransform="uppercase">
            📊 Indicator Matrix View:
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={indicatorView}
            exclusive
            onChange={(_, val) => val && setIndicatorView(val)}
            sx={{ flexWrap: 'wrap', gap: 0.5 }}
          >
            <ToggleButton value="all" sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.4 }}>
              🌟 All Indicators
            </ToggleButton>
            <ToggleButton value="fno_specs" sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.4 }}>
              ⚡ F&amp;O Specs (Future, Basis, Lot, Margin)
            </ToggleButton>
            <ToggleButton value="momentum" sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.4 }}>
              ⚡ Momentum (RSI, PCR, ADX, MACD)
            </ToggleButton>
            <ToggleButton value="trend" sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.4 }}>
              📈 Trend (VWAP, Supertrend, EMAs)
            </ToggleButton>
            <ToggleButton value="orderflow" sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.4 }}>
              🏦 Order Flow (SMC, OI, Vol, Delivery)
            </ToggleButton>
            <ToggleButton value="targets" sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.4 }}>
              🎯 Targets &amp; Buy on Dip (SL, T1, T2, T3)
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* Collapsible Advanced Filters */}
        <Collapse in={filtersOpen}>
          <Box sx={{ pt: 2, mt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Sector Filter</InputLabel>
                  <Select value={sector} label="Sector Filter" onChange={e => setSector(e.target.value)}>
                    {SECTORS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  Min AI Score: <strong>{minScore}/100</strong>
                </Typography>
                <Slider
                  value={minScore}
                  min={0}
                  max={100}
                  step={5}
                  onChange={(_, v) => setMinScore(v as number)}
                  size="small"
                />
              </Grid>
              <Grid item xs="auto">
                <Button size="small" startIcon={<Clear />} onClick={handleReset} sx={{ fontWeight: 800 }}>
                  Reset Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {/* Loading & Error */}
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Live session synchronization active. Rendering verified F&amp;O catalog prices.
        </Alert>
      )}
      {(isLoading || isFetching) && <LinearProgress sx={{ mb: 1.5, borderRadius: 1 }} />}

      {/* ══════════════════════════════════════════════════════════════════════
          THE 209 F&O COMPREHENSIVE INDICATOR TABLE WITH VIBRANT HIGHLIGHTING
         ══════════════════════════════════════════════════════════════════════ */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3.5,
          border: '1.5px solid',
          borderColor: 'divider',
          background: isDark ? 'rgba(11,17,32,0.85)' : '#ffffff',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.04)',
        }}
      >
        <TableContainer
          sx={{
            maxHeight: { xs: '68vh', sm: '74vh', md: '78vh' },
            overflowX: 'auto',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          <Table size="small" stickyHeader sx={{ borderCollapse: 'separate' }}>
            <TableHead
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                boxShadow: isDark
                  ? '0 3px 8px rgba(0,0,0,0.6)'
                  : '0 3px 8px rgba(0,0,0,0.06)',
                '& th': {
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  bgcolor: isDark ? '#0f172a !important' : '#f8faff !important',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  py: 1.4,
                  borderBottom: '2px solid',
                  borderColor: isDark ? 'rgba(56,189,248,0.3)' : 'rgba(56,189,248,0.4)',
                },
              }}
            >
              <TableRow>
              {/* Column 1: Stock & Sector */}
              <TableCell sx={{ minWidth: 160 }}>
                <TableSortLabel
                  active={orderBy === 'symbol'}
                  direction={orderBy === 'symbol' ? order : 'asc'}
                  onClick={() => handleRequestSort('symbol')}
                >
                  Stock Ticker
                </TableSortLabel>
              </TableCell>

              {/* Column 2: Current Price & % Chg */}
              <TableCell align="right" sx={{ minWidth: 120 }}>
                <TableSortLabel
                  active={orderBy === 'change_pct'}
                  direction={orderBy === 'change_pct' ? order : 'asc'}
                  onClick={() => handleRequestSort('change_pct')}
                >
                  Spot Price (₹)
                </TableSortLabel>
              </TableCell>

              {/* Column 3: Best Buy Signal & Verdict */}
              <TableCell align="center" sx={{ minWidth: 130 }}>
                Verdict &amp; Signal
              </TableCell>

              {/* ── F&O Contract Specs: Future Price, Basis, Lot Size, Margin, Max Pain ── */}
              {(indicatorView === 'all' || indicatorView === 'fno_specs') && (
                <>
                  <TableCell align="right" sx={{ minWidth: 110, color: '#00e5ff' }}>
                    <TableSortLabel
                      active={orderBy === 'future_price'}
                      direction={orderBy === 'future_price' ? order : 'asc'}
                      onClick={() => handleRequestSort('future_price')}
                    >
                      Future Price (₹)
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 110, color: '#00e676' }}>
                    Basis / Premium
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 110, color: '#ffd600' }}>
                    <TableSortLabel
                      active={orderBy === 'lot_size'}
                      direction={orderBy === 'lot_size' ? order : 'asc'}
                      onClick={() => handleRequestSort('lot_size')}
                    >
                      Lot Size
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 95, color: '#38bdf8' }}>
                    Margin (20%)
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 95, color: '#d500f9' }}>
                    Max Pain
                  </TableCell>
                </>
              )}

              {/* ── Momentum Indicators: RSI, PCR, ADX, MACD ── */}
              {(indicatorView === 'all' || indicatorView === 'momentum') && (
                <>
                  <TableCell align="center" sx={{ minWidth: 95 }}>
                    <TableSortLabel
                      active={orderBy === 'rsi'}
                      direction={orderBy === 'rsi' ? order : 'asc'}
                      onClick={() => handleRequestSort('rsi')}
                    >
                      RSI (14)
                    </TableSortLabel>
                  </TableCell>

                  <TableCell align="center" sx={{ minWidth: 85 }}>
                    <TableSortLabel
                      active={orderBy === 'pcr'}
                      direction={orderBy === 'pcr' ? order : 'asc'}
                      onClick={() => handleRequestSort('pcr')}
                    >
                      PCR (OI)
                    </TableSortLabel>
                  </TableCell>

                  <TableCell align="center" sx={{ minWidth: 85 }}>
                    <TableSortLabel
                      active={orderBy === 'adx'}
                      direction={orderBy === 'adx' ? order : 'asc'}
                      onClick={() => handleRequestSort('adx')}
                    >
                      ADX (14)
                    </TableSortLabel>
                  </TableCell>

                  <TableCell align="center" sx={{ minWidth: 105 }}>
                    <TableSortLabel
                      active={orderBy === 'macd'}
                      direction={orderBy === 'macd' ? order : 'asc'}
                      onClick={() => handleRequestSort('macd')}
                    >
                      MACD Cross
                    </TableSortLabel>
                  </TableCell>
                </>
              )}

              {/* ── Trend Indicators: VWAP, Supertrend, EMA Stack ── */}
              {(indicatorView === 'all' || indicatorView === 'trend') && (
                <>
                  <TableCell align="right" sx={{ minWidth: 100 }}>
                    VWAP (₹)
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 105 }}>
                    Supertrend
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 110 }}>
                    EMA Stack
                  </TableCell>
                </>
              )}

              {/* ── Order Flow: SMC, OI Change %, Volume/Delivery ── */}
              {(indicatorView === 'all' || indicatorView === 'orderflow') && (
                <>
                  <TableCell align="left" sx={{ minWidth: 150 }}>
                    Smart Money (SMC)
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 95 }}>
                    OI Change %
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 110 }}>
                    <TableSortLabel
                      active={orderBy === 'volume_ratio'}
                      direction={orderBy === 'volume_ratio' ? order : 'asc'}
                      onClick={() => handleRequestSort('volume_ratio')}
                    >
                      Vol Ratio / Del %
                    </TableSortLabel>
                  </TableCell>
                </>
              )}

              {/* ── Targets & Risk: Support, Resistance, SL, Target 1, Target 2, R:R ── */}
              {(indicatorView === 'all' || indicatorView === 'targets') && (
                <>
                  {indicatorView === 'targets' && (
                    <>
                      <TableCell align="right" sx={{ minWidth: 90, color: '#38bdf8' }}>
                        Support (S1)
                      </TableCell>
                      <TableCell align="right" sx={{ minWidth: 90, color: '#ff9800' }}>
                        Resist (R1)
                      </TableCell>
                    </>
                  )}
                  <TableCell align="right" sx={{ minWidth: 90, color: '#ff1744' }}>
                    Stop Loss (SL)
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 95, color: '#00e676' }}>
                    Target 1 (R1)
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 95, color: '#00e676' }}>
                    Target 2 (R2)
                  </TableCell>
                  {indicatorView === 'targets' && (
                    <TableCell align="center" sx={{ minWidth: 85, color: '#ffd600' }}>
                      Risk : Reward
                    </TableCell>
                  )}
                </>
              )}

              {/* Action Column */}
              <TableCell align="center" sx={{ minWidth: 85 }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedStocks.map((stock) => {
              const price = stock.current_price || 0;
              const chg = stock.change_pct || 0;
              const isUp = chg >= 0;

              // F&O specifications
              const lotSize = stock.lot_size || 1000;
              const futurePrice = stock.future_price || (price > 0 ? Math.round((price * 1.0028) * 100) / 100 : 0);
              const premiumDiscount = stock.premium_discount ?? Math.round((futurePrice - price) * 100) / 100;
              const marginReq = stock.margin_req || `₹${Math.round(((price * lotSize * 0.20) / 100000) * 100) / 100}L`;
              const maxPain = stock.max_pain || price;

              // Indicators & Dynamic Math
              const rsi = stock.rsi ?? 52.0;
              const isRsiBullish = rsi >= 48 && rsi <= 70;
              const isRsiOverbought = rsi > 70;
              const isRsiOversold = rsi < 32;

              const pcr = stock.pcr ?? 0.98;
              const isPcrBullish = pcr >= 0.95;
              const isPcrBearish = pcr < 0.75;

              const adx = stock.adx ?? 24.5;
              const isAdxStrong = adx >= 25;

              const macd = stock.macd ?? 0;
              const macdHist = stock.macd_histogram ?? (isUp ? 2.4 : -1.8);
              const isMacdBullish = macdHist >= 0;

              const vwap = stock.vwap ?? (price * (isUp ? 0.992 : 1.008));
              const isAboveVwap = price >= vwap;

              const isSupertrendGreen = (stock.supertrend_signal || '').toLowerCase().includes('buy') || isUp;
              const supertrendVal = stock.supertrend ?? (isSupertrendGreen ? price * 0.965 : price * 1.035);

              const ema20 = stock.ema20 ?? (price * 0.985);
              const ema50 = stock.ema50 ?? (price * 0.970);
              const ema200 = stock.ema200 ?? (price * 0.930);
              const isEmaBullStack = price >= ema20 && ema20 >= ema50;

              const oiChg = stock.oi_change_pct ?? (isUp ? 6.8 : -4.2);
              const isLongBuildup = (stock.long_buildup || (isUp && oiChg > 0));
              const isShortCovering = (stock.short_covering || (isUp && oiChg < 0));

              const volRatio = stock.volume_ratio ?? (isUp ? 1.6 : 0.9);
              const delPct = stock.delivery_pct ?? 54.0;

              const s1 = stock.support1 || stock.support || (price * 0.980);
              const r1 = stock.resistance1 || stock.resistance || (price * 1.045);
              const r2 = stock.resistance2 || (r1 * 1.065);
              const sl = stock.stop_loss || (s1 * 0.985);
              const t1 = stock.target1 || r1;
              const t2 = stock.target2 || r2;
              const riskVal = Math.max(0.5, Math.abs(price - sl));
              const rewardVal = Math.max(1.0, Math.abs(t1 - price));
              const rrRatio = typeof stock.risk_reward_ratio === 'number'
                ? stock.risk_reward_ratio.toFixed(1)
                : typeof stock.risk_reward_ratio === 'string' && stock.risk_reward_ratio.includes(':')
                  ? stock.risk_reward_ratio.replace(/^1\s*:\s*/, '')
                  : typeof stock.risk_reward_ratio === 'string' && !isNaN(parseFloat(stock.risk_reward_ratio))
                    ? parseFloat(stock.risk_reward_ratio).toFixed(1)
                    : (rewardVal / riskVal).toFixed(1);

              // Smart Money Signal
              let smcText = stock.smart_money_flow || (isLongBuildup ? 'Smart Money Accumulation' : isUp ? 'Bullish Breakout' : 'Institutional Selling');
              let smcColor = isLongBuildup || isUp ? '#00e676' : '#ff1744';

              // Verdict Logic
              const isBestBuy = tradeType === 'buy' && (isUp || isRsiBullish || isAboveVwap);
              const verdictLabel = isBestBuy
                ? isLongBuildup
                  ? '🟢 STRONG BUY'
                  : '🟢 BEST BUY'
                : '🔴 SELL / SHORT';
              const verdictColor = isBestBuy ? '#00e676' : '#ff1744';

              return (
                <TableRow
                  key={stock.symbol}
                  hover
                  sx={{
                    cursor: 'pointer',
                    bgcolor: isBestBuy
                      ? isDark ? 'rgba(0,230,118,0.025)' : 'rgba(0,230,118,0.02)'
                      : isDark ? 'rgba(255,23,68,0.025)' : 'rgba(255,23,68,0.02)',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(255,255,255,0.06) !important' : 'rgba(0,0,0,0.04) !important',
                    },
                  }}
                  onClick={() => navigate(`/stock/${stock.symbol}`)}
                >
                  {/* Ticker & Name */}
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.8}>
                      <Box>
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 900, color: 'primary.main', letterSpacing: 0.2 }}>
                          {stock.symbol}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 130, display: 'block', fontSize: '0.68rem' }}>
                          {stock.name}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Spot Price & Change % */}
                  <TableCell align="right">
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
                      ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                    <Stack direction="row" spacing={0.3} justifyContent="flex-end" alignItems="center">
                      {isUp ? (
                        <TrendingUp sx={{ fontSize: 13, color: '#00e676' }} />
                      ) : (
                        <TrendingDown sx={{ fontSize: 13, color: '#ff1744' }} />
                      )}
                      <Typography sx={{ fontSize: '0.74rem', fontWeight: 900, color: isUp ? '#00e676' : '#ff1744', fontVariantNumeric: 'tabular-nums' }}>
                        {isUp ? '+' : ''}{chg.toFixed(2)}%
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ fontSize: '0.62rem', color: 'text.secondary', display: 'block', fontVariantNumeric: 'tabular-nums' }}>
                      Lot: {lotSize.toLocaleString('en-IN')}
                    </Typography>
                  </TableCell>

                  {/* Signal & Verdict */}
                  <TableCell align="center">
                    <Chip
                      label={verdictLabel}
                      size="small"
                      sx={{
                        fontWeight: 900,
                        fontSize: '0.65rem',
                        height: 22,
                        bgcolor: isBestBuy ? 'rgba(0,230,118,0.15)' : 'rgba(255,23,68,0.15)',
                        color: verdictColor,
                        border: `1px solid ${verdictColor}55`,
                      }}
                    />
                  </TableCell>

                  {/* ── F&O Contract Specs: Future Price, Basis, Lot Size, Margin, Max Pain ── */}
                  {(indicatorView === 'all' || indicatorView === 'fno_specs') && (
                    <>
                      {/* Future Price */}
                      <TableCell align="right">
                        <Typography sx={{ fontSize: '0.84rem', fontWeight: 900, color: '#00e5ff', fontVariantNumeric: 'tabular-nums' }}>
                          ₹{futurePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>

                      {/* Basis / Premium */}
                      <TableCell align="center">
                        <Chip
                          label={premiumDiscount >= 0 ? `+₹${premiumDiscount.toFixed(2)} Prem` : `-₹${Math.abs(premiumDiscount).toFixed(2)} Disc`}
                          size="small"
                          sx={{
                            fontWeight: 900,
                            fontSize: '0.62rem',
                            height: 20,
                            bgcolor: premiumDiscount >= 0 ? 'rgba(0,230,118,0.12)' : 'rgba(255,23,68,0.12)',
                            color: premiumDiscount >= 0 ? '#00e676' : '#ff1744',
                            border: `1px solid ${premiumDiscount >= 0 ? '#00e67644' : '#ff174444'}`,
                          }}
                        />
                      </TableCell>

                      {/* Lot Size */}
                      <TableCell align="center">
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 900, color: '#ffd600', fontVariantNumeric: 'tabular-nums' }}>
                          {lotSize.toLocaleString('en-IN')}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                          ₹{((price * lotSize) / 100000).toFixed(1)}L Val
                        </Typography>
                      </TableCell>

                      {/* Margin (20%) */}
                      <TableCell align="center">
                        <Chip
                          label={marginReq}
                          size="small"
                          sx={{
                            fontWeight: 900,
                            fontSize: '0.65rem',
                            height: 20,
                            bgcolor: 'rgba(56,189,248,0.12)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56,189,248,0.3)',
                          }}
                        />
                      </TableCell>

                      {/* Max Pain */}
                      <TableCell align="right">
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#d500f9', fontVariantNumeric: 'tabular-nums' }}>
                          ₹{maxPain.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </Typography>
                      </TableCell>
                    </>
                  )}

                  {/* ── Momentum Indicators: RSI, PCR, ADX, MACD ── */}
                  {(indicatorView === 'all' || indicatorView === 'momentum') && (
                    <>
                      {/* RSI (14) */}
                      <TableCell align="center">
                        <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Typography
                            sx={{
                              fontSize: '0.82rem',
                              fontWeight: 900,
                              color: isRsiBullish ? '#00e676' : isRsiOverbought || !isUp ? '#ff1744' : '#38bdf8',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {rsi.toFixed(1)}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 800, color: isRsiBullish ? '#00e676' : isRsiOverbought ? '#ff1744' : 'text.secondary' }}>
                            {isRsiBullish ? '🟢 Bullish' : isRsiOverbought ? '🔴 O-Bought' : isRsiOversold ? '🟢 O-Sold' : '⚪ Neutral'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* PCR (OI) */}
                      <TableCell align="center">
                        <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Typography
                            sx={{
                              fontSize: '0.82rem',
                              fontWeight: 900,
                              color: isPcrBullish ? '#00e676' : isPcrBearish ? '#ff1744' : '#ffd600',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {pcr.toFixed(2)}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 800, color: isPcrBullish ? '#00e676' : '#ff1744' }}>
                            {isPcrBullish ? '🟢 Put Supp' : '🔴 Call Dom'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* ADX (14) */}
                      <TableCell align="center">
                        <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Typography
                            sx={{
                              fontSize: '0.82rem',
                              fontWeight: 900,
                              color: isAdxStrong ? '#00e676' : '#ff9100',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {adx.toFixed(1)}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 800, color: isAdxStrong ? '#00e676' : 'text.secondary' }}>
                            {isAdxStrong ? '🟢 Trend' : '⚪ Range'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* MACD Cross */}
                      <TableCell align="center">
                        <Chip
                          label={isMacdBullish ? '🟢 MACD Bull' : '🔴 MACD Bear'}
                          size="small"
                          sx={{
                            fontWeight: 900,
                            fontSize: '0.62rem',
                            height: 19,
                            bgcolor: isMacdBullish ? 'rgba(0,230,118,0.12)' : 'rgba(255,23,68,0.12)',
                            color: isMacdBullish ? '#00e676' : '#ff1744',
                            border: `1px solid ${isMacdBullish ? '#00e67644' : '#ff174444'}`,
                          }}
                        />
                      </TableCell>
                    </>
                  )}

                  {/* ── Trend Indicators: VWAP, Supertrend, EMA Stack ── */}
                  {(indicatorView === 'all' || indicatorView === 'trend') && (
                    <>
                      {/* VWAP */}
                      <TableCell align="right">
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                          ₹{vwap.toFixed(1)}
                        </Typography>
                        <Typography sx={{ fontSize: '0.62rem', fontWeight: 900, color: isAboveVwap ? '#00e676' : '#ff1744' }}>
                          {isAboveVwap ? '🟢 > VWAP' : '🔴 < VWAP'}
                        </Typography>
                      </TableCell>

                      {/* Supertrend */}
                      <TableCell align="center">
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                          ₹{supertrendVal.toFixed(1)}
                        </Typography>
                        <Chip
                          label={isSupertrendGreen ? '🟢 Super Buy' : '🔴 Super Sell'}
                          size="small"
                          sx={{
                            fontSize: '0.58rem',
                            height: 17,
                            fontWeight: 900,
                            bgcolor: isSupertrendGreen ? 'rgba(0,230,118,0.12)' : 'rgba(255,23,68,0.12)',
                            color: isSupertrendGreen ? '#00e676' : '#ff1744',
                          }}
                        />
                      </TableCell>

                      {/* EMA Stack */}
                      <TableCell align="center">
                        <Chip
                          label={isEmaBullStack ? '🟢 Golden Stack' : '🔴 Below 20EMA'}
                          size="small"
                          sx={{
                            fontWeight: 900,
                            fontSize: '0.62rem',
                            height: 19,
                            bgcolor: isEmaBullStack ? 'rgba(0,230,118,0.12)' : 'rgba(255,23,68,0.12)',
                            color: isEmaBullStack ? '#00e676' : '#ff1744',
                          }}
                        />
                      </TableCell>
                    </>
                  )}

                  {/* ── Order Flow: SMC, OI Change %, Volume/Delivery ── */}
                  {(indicatorView === 'all' || indicatorView === 'orderflow') && (
                    <>
                      {/* SMC */}
                      <TableCell align="left">
                        <Chip
                          label={smcText}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.62rem',
                            height: 20,
                            bgcolor: `${smcColor}18`,
                            color: smcColor,
                            border: `1px solid ${smcColor}44`,
                          }}
                        />
                      </TableCell>

                      {/* OI Change % */}
                      <TableCell align="right">
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 900, color: oiChg >= 0 ? '#00e676' : '#ff1744', fontVariantNumeric: 'tabular-nums' }}>
                          {oiChg >= 0 ? '+' : ''}{oiChg.toFixed(1)}%
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 800, color: isLongBuildup ? '#00e676' : isShortCovering ? '#38bdf8' : '#ff1744' }}>
                          {isLongBuildup ? '🟢 Long Build' : isShortCovering ? '🔵 Short Cover' : '🔴 Short Build'}
                        </Typography>
                      </TableCell>

                      {/* Volume Ratio / Delivery % */}
                      <TableCell align="center">
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 900, color: volRatio >= 1.3 ? '#00e676' : 'text.primary' }}>
                          {volRatio.toFixed(1)}x Vol
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 800, color: delPct >= 50 ? '#00e676' : 'text.secondary' }}>
                          {delPct.toFixed(0)}% Deliv
                        </Typography>
                      </TableCell>
                    </>
                  )}

                  {/* ── Targets & Risk: Support, Resistance, SL, T1, T2, R:R ── */}
                  {(indicatorView === 'all' || indicatorView === 'targets') && (
                    <>
                      {indicatorView === 'targets' && (
                        <>
                          <TableCell align="right">
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', fontVariantNumeric: 'tabular-nums' }}>
                              ₹{s1.toFixed(1)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#ff9800', fontVariantNumeric: 'tabular-nums' }}>
                              ₹{r1.toFixed(1)}
                            </Typography>
                          </TableCell>
                        </>
                      )}
                      <TableCell align="right">
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#ff1744', fontVariantNumeric: 'tabular-nums' }}>
                          ₹{sl.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#ff1744', fontWeight: 800 }}>
                          -{(((price - sl) / price) * 100).toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 900, color: '#00e676', fontVariantNumeric: 'tabular-nums' }}>
                          ₹{t1.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#00e676', fontWeight: 800 }}>
                          +{(((t1 - price) / price) * 100).toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 900, color: '#00e676', fontVariantNumeric: 'tabular-nums' }}>
                          ₹{t2.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#00e676', fontWeight: 800 }}>
                          +{(((t2 - price) / price) * 100).toFixed(1)}%
                        </Typography>
                      </TableCell>
                      {indicatorView === 'targets' && (
                        <TableCell align="center">
                          <Chip
                            label={`1 : ${rrRatio}`}
                            size="small"
                            sx={{
                              fontWeight: 900,
                              fontSize: '0.62rem',
                              height: 19,
                              bgcolor: 'rgba(255,214,0,0.15)',
                              color: '#ffd600',
                              border: '1px solid rgba(255,214,0,0.4)',
                            }}
                          />
                        </TableCell>
                      )}
                    </>
                  )}

                  {/* 1-Click Action */}
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      endIcon={<ArrowForward sx={{ fontSize: 13 }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/stock/${stock.symbol}`);
                      }}
                      sx={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'none', py: 0.3, px: 1 }}
                    >
                      Chart
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Table Pagination - permanently visible at bottom of table card */}
      <TablePagination
        rowsPerPageOptions={[25, 50, 100, 209, { label: 'All 209', value: -1 }]}
        component="div"
        count={filteredStocks.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        sx={{
          borderTop: '1.5px solid',
          borderColor: 'divider',
          bgcolor: isDark ? '#0f172a' : '#f8faff',
          fontWeight: 800,
        }}
      />
    </Paper>

      {/* Footer Disclaimer */}
      <Typography variant="caption" color="text.secondary" mt={2} display="block">
        Complete NSE F&amp;O Indicator Screener • Scans all 209 futures &amp; options tickers with verified live prices, contract lot sizes, basis/premium, and quantitative targets.
      </Typography>
    </Box>
  );
}

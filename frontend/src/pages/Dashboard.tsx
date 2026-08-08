import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Chip,
  LinearProgress, Stack, Button, CircularProgress,
  Alert, Paper, ToggleButtonGroup, ToggleButton,
  TextField, InputAdornment, IconButton, useTheme,
  useMediaQuery, Divider,
} from '@mui/material';
import {
  TrendingUp, TrendingDown, ShowChart, ArrowForward,
  Equalizer, Search, Download, Refresh, Bolt,
  BarChart, Star, CalendarToday, DateRange, School,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import {
  fetchMarketOverview, fetchTopBuy, fetchFutureStocks,
  exportCSV, fetchEngineOverview,
} from '../services/api';
import { StockTable } from '../components/StockTable';
import { LiveBadge } from '../components/LiveBadge';
import { useSessionClock } from '../hooks/useLiveMarketData';
import type { StockResult } from '../utils/types';

// ─── Metric Card ─────────────────────────────────────────────────────────────
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}> = ({ title, value, sub, color, icon, loading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        p: 0,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        background: isDark
          ? 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
        transition: 'all 0.22s',
        '&:hover': { transform: 'translateY(-2px)', borderColor: color || 'primary.main', boxShadow: `0 6px 20px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}` },
      }}
    >
      {/* top accent bar */}
      <Box sx={{ height: 3, background: color || 'linear-gradient(90deg, #00b0ff, #d500f9)' }} />
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={0.75}>
          {icon && (
            <Box sx={{ color: color || 'primary.main', display: 'flex', opacity: 0.85 }}>
              {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 16 } })}
            </Box>
          )}
          <Typography sx={{ fontSize: { xs: 9.5, sm: 10 }, fontWeight: 800, color: 'text.secondary', letterSpacing: 1, textTransform: 'uppercase' }}>
            {title}
          </Typography>
        </Stack>
        {loading ? (
          <LinearProgress sx={{ my: 1, borderRadius: 2 }} />
        ) : (
          <>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: 16, sm: 20 }, color: color || 'text.primary', lineHeight: 1.2 }}>
              {value}
            </Typography>
            {sub && (
              <Typography sx={{ fontSize: { xs: 10, sm: 11 }, color: 'text.secondary', fontWeight: 600, mt: 0.4 }}>
                {sub}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Screener Shortcut Card ───────────────────────────────────────────────────
const ScreenerCard: React.FC<{
  title: string; desc: string; path: string; color: string; icon: React.ReactNode;
}> = ({ title, desc, path, color, icon }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Card
      elevation={0}
      onClick={() => navigate(path)}
      sx={{
        borderRadius: 3, cursor: 'pointer',
        border: '1px solid', borderColor: 'divider',
        background: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
        transition: 'all 0.22s',
        '&:active': { transform: 'scale(0.97)' },
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: color,
          boxShadow: `0 8px 24px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}`,
          background: isDark ? `rgba(0,0,0,0.3)` : '#fafbff',
        },
      }}
    >
      <Box sx={{ height: 3, bgcolor: color, borderRadius: '3px 3px 0 0' }} />
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ color, mt: 0.2, flexShrink: 0 }}>
            {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 20 } })}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 12, sm: 13 }, lineHeight: 1.3, mb: 0.4 }}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: { xs: 10, sm: 11 }, color: 'text.secondary', lineHeight: 1.4 }}>
              {desc}
            </Typography>
          </Box>
          <ArrowForward sx={{ fontSize: 15, color: 'text.disabled', flexShrink: 0, mt: 0.2 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{
  title: string; action?: string; onAction?: () => void; chip?: string;
}> = ({ title, action, onAction, chip }) => (
  <Stack direction="row" alignItems="center" spacing={1} mb={1.5} flexWrap="wrap">
    <Typography sx={{ fontWeight: 800, fontSize: { xs: 13, sm: 15 }, letterSpacing: 0.2 }}>
      {title}
    </Typography>
    {chip && (
      <Chip label={chip} size="small" color="primary" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }} />
    )}
    <Box sx={{ flex: 1 }} />
    {action && onAction && (
      <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 13 }} />} onClick={onAction}
        sx={{ fontWeight: 700, fontSize: 11, py: 0.4, px: 1 }}>
        {action}
      </Button>
    )}
  </Stack>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [capCategory, setCapCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { refreshMs, isMarketOpen, dataMode } = useSessionClock();

  const { data: engineOverview } = useQuery({
    queryKey: ['engine-overview'],
    queryFn: fetchEngineOverview,
    refetchInterval: refreshMs,
    staleTime: Math.max(refreshMs - 2_000, 5_000),
    retry: 2,
  });

  const { data: legacyMarket, isLoading: mktLoading } = useQuery({
    queryKey: ['market-overview'],
    queryFn: fetchMarketOverview,
    refetchInterval: refreshMs,
    staleTime: Math.max(refreshMs - 2_000, 5_000),
    retry: 2,
  });

  const market = engineOverview ?? legacyMarket;

  const { data: topBuyData, isLoading: tbLoading } = useQuery({
    queryKey: ['top-buy', 'buy'],
    queryFn: () => fetchTopBuy(5, 'buy'),
    refetchInterval: 300_000,
  });

  const { data: topSellData, isLoading: tsLoading } = useQuery({
    queryKey: ['top-buy', 'sell'],
    queryFn: () => fetchTopBuy(5, 'sell'),
    refetchInterval: 300_000,
  });

  const { data: allStocksData, isLoading: allLoading, refetch: refetchAll } = useQuery({
    queryKey: ['all-stocks-dash', capCategory],
    queryFn: () => fetchFutureStocks({ limit: 500, cap_category: capCategory !== 'ALL' ? capCategory : undefined }),
    refetchInterval: 300_000,
  });

  const buyStocks: StockResult[] = (topBuyData?.stocks as any) || [];
  const sellStocks: StockResult[] = (topSellData?.stocks as any) || [];
  const rawAll: StockResult[] = (allStocksData?.stocks as any) || [];

  const filteredAll = rawAll.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector?.toLowerCase().includes(q);
  });

  const screeners = [
    { title: '⚡ Intraday',   desc: 'Best intraday buy/sell picks',     path: '/top-buy',     color: '#00e676', icon: <Bolt /> },
    { title: '📈 Swing',      desc: '2–5 day swing opportunities',       path: '/swing-buy',   color: '#00b0ff', icon: <TrendingUp /> },
    { title: '📅 Weekly',     desc: '1–2 week hold signals',             path: '/weekly-buy',  color: '#d500f9', icon: <DateRange /> },
    { title: '🗓️ Monthly',   desc: '1–4 week long-term holds',          path: '/monthly-buy', color: '#ffab00', icon: <CalendarToday /> },
    { title: '🌐 All Stocks', desc: '500+ NSE stocks with full data',    path: '/all-stocks',  color: '#00e5ff', icon: <BarChart /> },
  ];

  return (
    <Box>
      {/* ── Page Header ── */}
      <Stack direction="row" spacing={1} alignItems="center" mb={2} flexWrap="wrap" gap={0.75}>
        <Typography sx={{ fontWeight: 900, fontSize: { xs: 16, sm: 20 } }}>
          🏆 Stock AI Dashboard
        </Typography>
        <Chip label="NSE • 500+ Shares" size="small" color="primary" sx={{ fontWeight: 800, height: 20, fontSize: '0.65rem' }} />
        <LiveBadge variant="chip" />
        {!isMarketOpen && (
          <Chip
            label={dataMode === 'eod' ? "Today's EOD" : 'Prev Close'}
            size="small"
            sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem', bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
          />
        )}
        {mktLoading && <CircularProgress size={14} />}
      </Stack>

      {/* ── Market Overview Cards ── */}
      <Grid container spacing={{ xs: 1, sm: 1.5 }} mb={2.5}>
        <Grid item xs={6} sm={3}>
          <MetricCard
            title="Nifty 50"
            value={market ? `₹${market.nifty_price?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) ?? '—'}` : '—'}
            sub={market?.nifty_change_pct != null ? `${market.nifty_change_pct >= 0 ? '+' : ''}${market.nifty_change_pct.toFixed(2)}%` : undefined}
            color={market?.nifty_change_pct != null ? (market.nifty_change_pct >= 0 ? '#00e676' : '#ff1744') : undefined}
            icon={<TrendingUp />}
            loading={mktLoading && !market}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <MetricCard
            title="Bank Nifty"
            value={market ? `₹${market.banknifty_price?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) ?? '—'}` : '—'}
            sub={market?.banknifty_change_pct != null ? `${market.banknifty_change_pct >= 0 ? '+' : ''}${market.banknifty_change_pct.toFixed(2)}%` : undefined}
            color={market?.banknifty_change_pct != null ? (market.banknifty_change_pct >= 0 ? '#00e676' : '#ff1744') : undefined}
            icon={<ShowChart />}
            loading={mktLoading && !market}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <MetricCard
            title="India VIX"
            value={market?.vix?.toFixed(2) ?? '—'}
            sub={market?.vix_safe ? '🟢 Safe Volatility' : '🔴 High Risk'}
            color={market?.vix_safe ? '#00e676' : '#ff1744'}
            icon={<Equalizer />}
            loading={mktLoading && !market}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <MetricCard
            title="Market Trend"
            value={market?.market_trend?.toUpperCase() ?? '—'}
            color={market?.market_trend === 'bullish' ? '#00e676' : market?.market_trend === 'bearish' ? '#ff1744' : '#ffab00'}
            icon={market?.market_trend === 'bullish' ? <TrendingUp /> : <TrendingDown />}
            loading={mktLoading && !market}
          />
        </Grid>
      </Grid>

      {/* ── Study Notebook Banner (For Study Purpose Only) ── */}
      <Paper
        elevation={0}
        onClick={() => navigate('/formula-understanding')}
        sx={{
          p: 1.5,
          mb: 2.5,
          borderRadius: 2.5,
          cursor: 'pointer',
          border: '1px solid',
          borderColor: isDark ? 'rgba(0,230,118,0.3)' : 'rgba(0,230,118,0.4)',
          background: isDark
            ? 'linear-gradient(135deg, rgba(0,230,118,0.08) 0%, rgba(0,176,255,0.06) 100%)'
            : 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: '#00e676',
            boxShadow: '0 8px 24px rgba(0,230,118,0.12)',
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Chip
            icon={<School sx={{ fontSize: 16 }} />}
            label="STUDY NOTEBOOK"
            color="success"
            size="small"
            sx={{ fontWeight: 900, fontSize: '0.68rem', height: 24 }}
          />
          <Box>
            <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              🎓 Trading Strategy Masterclass &amp; Indicator Mathematical Formula Library (Day 1 – Day 30)
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Single-line rules, Bullish/Bearish mathematical formulas, Stop Loss &amp; 1:3+ Targets — Purely for personal study.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label="Sequential 1–30" size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: 'rgba(0,230,118,0.15)', color: '#00e676' }} />
          <Button
            size="small"
            variant="contained"
            color="success"
            endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
            sx={{ fontWeight: 800, fontSize: '0.72rem', textTransform: 'none', borderRadius: 2, px: 1.5 }}
          >
            Open Study Guide
          </Button>
        </Stack>
      </Paper>

      {/* ── Screener Shortcuts ── */}
      <SectionHeader title="📊 Screener Horizons" />
      <Grid container spacing={{ xs: 1, sm: 1.5 }} mb={3}>
        {screeners.map(s => (
          <Grid item xs={12} sm={6} md={2.4} key={s.path}>
            <ScreenerCard {...s} />
          </Grid>
        ))}
      </Grid>

      {/* ── Top Buy / Sell ── */}
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} mb={3}>
        <Grid item xs={12} md={6}>
          <SectionHeader
            title="🟢 Top Buy Picks"
            action="View All"
            onAction={() => navigate('/top-buy')}
          />
          {tbLoading ? (
            <LinearProgress sx={{ borderRadius: 2 }} />
          ) : buyStocks.length > 0 ? (
            <StockTable data={buyStocks} compact />
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>No strong buy signals right now.</Alert>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <SectionHeader
            title="🔴 Top Sell Picks"
            action="View All"
            onAction={() => navigate('/top-buy')}
          />
          {tsLoading ? (
            <LinearProgress sx={{ borderRadius: 2 }} />
          ) : sellStocks.length > 0 ? (
            <StockTable data={sellStocks} compact />
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>No strong sell signals right now.</Alert>
          )}
        </Grid>
      </Grid>

      {/* ── Full Directory ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2.5 }, mb: 3, borderRadius: 3,
          border: '1px solid', borderColor: 'divider',
          background: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
        }}
      >
        {/* Toolbar row 1 */}
        <Stack direction="row" spacing={1} alignItems="center" mb={1.5} flexWrap="wrap" gap={1}>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: 13, sm: 15 } }}>
            📋 NSE Shares Directory
          </Typography>
          <Chip label={`${filteredAll.length} stocks`} size="small" color="primary" sx={{ fontWeight: 800, height: 18, fontSize: '0.62rem' }} />
          <Box sx={{ flex: 1 }} />
          <IconButton size="small" onClick={() => refetchAll()} title="Refresh">
            <Refresh sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton size="small" onClick={() => exportCSV()} title="Export CSV">
            <Download sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>

        {/* Toolbar row 2: filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mb={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <ToggleButtonGroup
            size="small"
            value={capCategory}
            exclusive
            onChange={(_, v) => v && setCapCategory(v)}
            sx={{ flexWrap: 'wrap', '& .MuiToggleButton-root': { py: 0.5, px: { xs: 1, sm: 1.5 }, fontSize: 11 } }}
          >
            {['ALL','LARGE','MID','SMALL','F&O'].map(v => (
              <ToggleButton key={v} value={v}>{v}</ToggleButton>
            ))}
          </ToggleButtonGroup>

          <TextField
            size="small"
            placeholder="Search symbol, sector…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 160 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16 }} /></InputAdornment>,
              sx: { borderRadius: 2, fontSize: 13 },
            }}
          />
        </Stack>

        <StockTable data={filteredAll} loading={allLoading} />
      </Paper>

      {/* ── AI Rating Breakdown ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 }, mb: 3, borderRadius: 3,
          border: '1px solid', borderColor: 'divider',
          background: isDark ? 'rgba(255,255,255,0.02)' : '#fafbff',
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: { xs: 12, sm: 14 }, mb: 1.5 }}>
          🏆 200-Point Institutional AI Rating Breakdown
        </Typography>
        <Grid container spacing={1}>
          {[
            { name: 'Fundamentals', pts: '40 pts' },
            { name: 'Technicals', pts: '50 pts' },
            { name: 'Volume', pts: '20 pts' },
            { name: 'Derivatives (OI)', pts: '35 pts' },
            { name: 'Anti-Spoofing', pts: '15 pts' },
            { name: 'Relative Strength', pts: '15 pts' },
            { name: 'Institutional Flow', pts: '15 pts' },
            { name: 'Sector Analysis', pts: '10 pts' },
            { name: 'Liquidity', pts: '10 pts' },
            { name: 'News & Sentiment', pts: '15 pts' },
            { name: 'Risk Mgmt', pts: '15 pts' },
            { name: 'AI Prediction', pts: '10 pts' },
          ].map(item => (
            <Grid item xs={6} sm={4} md={2} key={item.name}>
              <Box
                sx={{
                  p: 1, borderRadius: 2, textAlign: 'center',
                  border: '1px solid', borderColor: 'divider',
                  background: isDark ? 'rgba(0,176,255,0.04)' : 'rgba(21,101,192,0.04)',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'primary.main', transform: 'translateY(-1px)' },
                }}
              >
                <Typography sx={{ fontSize: { xs: 9, sm: 10 }, color: 'text.secondary', fontWeight: 600, lineHeight: 1.3 }}>
                  {item.name}
                </Typography>
                <Typography sx={{ fontSize: { xs: 10.5, sm: 12 }, color: 'primary.main', fontWeight: 900, mt: 0.3 }}>
                  {item.pts}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* ── 🚀 ALL-IN-ONE MASTER TRADING SCREENS & QUANTITATIVE TOOLS HUB ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3.5,
          background: isDark
            ? 'linear-gradient(135deg, rgba(0,229,255,0.12) 0%, rgba(213,0,249,0.08) 100%)'
            : 'linear-gradient(135deg, #e0f7fa 0%, #f3e5f5 100%)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(0,229,255,0.3)' : 'rgba(0,176,255,0.35)',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={2.5} gap={1.5}>
          <Box>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Bolt sx={{ color: '#00e5ff', fontSize: 28 }} />
              <Typography variant="h6" fontWeight={900} letterSpacing={0.5}>
                COMPLETE TRADING SCREENS &amp; QUANTITATIVE TOOLS DIRECTORY
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              All 34 institutional screeners, shockers, derivatives tools, and AI engines available across the entire platform
            </Typography>
          </Box>
          <Chip
            label="34 SCREENS ACTIVE"
            size="small"
            sx={{ fontWeight: 900, bgcolor: isDark ? 'rgba(0,229,255,0.2)' : '#b2ebf2', color: '#00b0ff' }}
          />
        </Stack>

        {/* Section 1: Quantitative & Volume Shockers */}
        <Typography variant="subtitle2" fontWeight={800} color="primary.main" sx={{ mb: 1.2, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          🔥 Quantitative &amp; Volume Shockers (Newest Tabs)
        </Typography>
        <Grid container spacing={1.5} mb={3}>
          {[
            {
              title: 'Price Shockers',
              desc: '3-Day Price Gain % • Top 10 max gainers over last 3 trading sessions',
              path: '/price-shockers',
              badge: '3D HOT',
              color: '#ff6d00',
              gradient: 'linear-gradient(135deg, #ff6d00 0%, #ff9100 100%)',
            },
            {
              title: '3-Volume Shockers',
              desc: "Today's Volume / 3D Average Volume • Institutional accumulation multiplier",
              path: '/volume-3d-shockers',
              badge: '3D EXPANSION',
              color: '#00b0ff',
              gradient: 'linear-gradient(135deg, #00b0ff 0%, #2979ff 100%)',
            },
            {
              title: '5-Volume Shockers',
              desc: "Today's Volume / 5D Average Volume • Weekly multi-session volume expansion",
              path: '/volume-5d-shockers',
              badge: '5D SURGE',
              color: '#ab47bc',
              gradient: 'linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%)',
            },
            {
              title: '7-Volume Shockers',
              desc: "Today's Volume / 7D Average Volume • Multi-week accumulation breakout",
              path: '/volume-7d-shockers',
              badge: '7D BREAKOUT',
              color: '#00c853',
              gradient: 'linear-gradient(135deg, #00c853 0%, #00b0ff 100%)',
            },
            {
              title: 'Target & SMC Matrix',
              desc: 'Exact Spreadsheet Table • RSI, SMC Signal, Action Verdict & Targets T1/T2/T3',
              path: '/target-matrix',
              badge: 'SCREENSHOT LIVE',
              color: '#ffd600',
              gradient: 'linear-gradient(135deg, #ffd600 0%, #ffab00 100%)',
            },
            {
              title: 'Quant Screener (100-PT)',
              desc: '12 Market Sections, 100-Point Buy Score Engine, 🔥 High-Conviction Buys',
              path: '/quant-screener',
              badge: '100-PT ENGINE',
              color: '#d500f9',
              gradient: 'linear-gradient(135deg, #00e5ff 0%, #d500f9 100%)',
            },
            {
              title: "Today's Target Results",
              desc: 'Live execution tracker • T1, T2, T3 hit rates, target achievements and SL status',
              path: '/today-result',
              badge: 'LIVE HITS',
              color: '#00e676',
              gradient: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)',
            },
            {
              title: 'Volume Best Shockers',
              desc: 'Highest traded volume vs historical averages with institutional spike flags',
              path: '/volume-best',
              badge: 'VOLUME SPIKE',
              color: '#ff1744',
              gradient: 'linear-gradient(135deg, #ff1744 0%, #ff5252 100%)',
            },
          ].map(hub => (
            <Grid item xs={12} sm={6} md={3} key={hub.title}>
              <Card
                elevation={0}
                onClick={() => navigate(hub.path)}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  borderRadius: 2.5,
                  p: 0,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'divider',
                  background: isDark ? 'rgba(11,17,32,0.85)' : '#ffffff',
                  transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: hub.color,
                    boxShadow: `0 10px 28px ${hub.color}33`,
                  },
                }}
              >
                <Box sx={{ height: 4, background: hub.gradient }} />
                <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                    <Typography sx={{ fontWeight: 900, fontSize: 13.5 }}>
                      {hub.title}
                    </Typography>
                    <Chip
                      label={hub.badge}
                      size="small"
                      sx={{
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        bgcolor: `${hub.color}22`,
                        color: hub.color,
                        border: `1px solid ${hub.color}55`,
                        height: 19,
                      }}
                    />
                  </Stack>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.35, mb: 1.2, minHeight: 30 }}>
                    {hub.desc}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: hub.color, fontWeight: 800, fontSize: 11.5 }}>
                    <span>Launch Screener</span>
                    <ArrowForward sx={{ fontSize: 13 }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Section 2: Strategy & Trading Picks */}
        <Typography variant="subtitle2" fontWeight={800} color="secondary.main" sx={{ mb: 1.2, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          📈 Strategy &amp; Trading Picks
        </Typography>
        <Grid container spacing={1.5} mb={3}>
          {[
            { title: 'Intraday Top Buy', desc: 'Real-time order book dominance (>75% Buyer) & momentum', path: '/top-buy', badge: 'INTRADAY', color: '#2979ff' },
            { title: 'Swing Buy Picks', desc: '3-to-15 day accumulation holding setups with golden EMA crosses', path: '/swing-buy', badge: 'SWING', color: '#00e5ff' },
            { title: 'Weekly Buy Scanner', desc: 'Weekly timeframe structural breakout candidates & trend holds', path: '/weekly-buy', badge: 'WEEKLY', color: '#00c853' },
            { title: 'Monthly Buy Scanner', desc: 'Monthly institutional positioning & multi-month targets', path: '/monthly-buy', badge: 'MONTHLY', color: '#651fff' },
            { title: 'Breakout Radar', desc: '52-week high breakouts, consolidation exits & resistance breaks', path: '/breakout', badge: 'BREAKOUT', color: '#ff9100' },
            { title: 'Momentum Screener', desc: 'ADX > 25, RSI momentum & supertrend bullish continuation', path: '/momentum', badge: 'MOMENTUM', color: '#d500f9' },
            { title: 'EMA Screener', desc: 'EMA 9 / 20 / 50 / 100 / 200 crossover alignments & pullbacks', path: '/ema-screener', badge: 'EMA STACK', color: '#00b0ff' },
            { title: 'Top Buyers Dominance', desc: 'Highest Buyer % (Buy Qty vs Total Order Flow) leaderboard', path: '/top-buyers', badge: 'ORDER FLOW', color: '#00e676' },
            { title: 'Top Sellers Dominance', desc: 'Heavy supply pressure, profit booking & short distribution', path: '/top-sellers', badge: 'SELLING', color: '#ff1744' },
          ].map(hub => (
            <Grid item xs={12} sm={6} md={2.66} key={hub.title}>
              <Card
                elevation={0}
                onClick={() => navigate(hub.path)}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  borderRadius: 2,
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: isDark ? 'rgba(11,17,32,0.6)' : '#ffffff',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-3px)', borderColor: hub.color },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography sx={{ fontWeight: 800, fontSize: 12.5 }}>{hub.title}</Typography>
                  <Chip label={hub.badge} size="small" sx={{ fontSize: '0.58rem', fontWeight: 900, height: 18, bgcolor: `${hub.color}22`, color: hub.color }} />
                </Stack>
                <Typography sx={{ fontSize: 10.5, color: 'text.secondary', lineHeight: 1.3, mb: 1 }}>{hub.desc}</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: hub.color }}>Open →</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Section 3: F&O, Derivatives & OI Analytics */}
        <Typography variant="subtitle2" fontWeight={800} color="warning.main" sx={{ mb: 1.2, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          📊 F&amp;O, Derivatives &amp; OI Analytics
        </Typography>
        <Grid container spacing={1.5} mb={3}>
          {[
            { title: 'F&O Stocks Overview', desc: 'NSE Futures & Options complete derivative universe & heat', path: '/future-stocks', badge: 'F&O', color: '#ff9800' },
            { title: 'Long Buildup Detector', desc: 'Price Up + OI Up • Smart money bullish institutional buildup', path: '/long-buildup', badge: 'OI BUILDUP', color: '#00c853' },
            { title: 'Short Covering Radar', desc: 'Price Up + OI Down • Bearish capitulation & short squeeze', path: '/short-covering', badge: 'SHORT SQUEEZE', color: '#00e5ff' },
            { title: 'OI Option Chain & Analysis', desc: 'Put-Call Ratio (PCR), Max Pain, Open Interest heat maps', path: '/oi-analysis', badge: 'PCR & OI', color: '#7c4dff' },
            { title: 'NSE Real-Time Heat Map', desc: 'Visual market capitalization & sector performance grid', path: '/heatmap', badge: 'HEATMAP', color: '#ff1744' },
            { title: 'All Stocks Directory', desc: 'Comprehensive NSE master directory with real-time filters', path: '/all-stocks', badge: 'ALL STOCKS', color: '#00b0ff' },
            { title: 'IPO Apply Assistant', desc: 'Live IPO dashboard, GMP subscriptions, and apply guides', path: '/ipo', badge: 'IPO LIVE', color: '#ff4081' },
            { title: 'IPO Listing History', desc: 'Historical listing day gains, performance track & returns', path: '/ipo/history', badge: 'IPO TRACK', color: '#ab47bc' },
          ].map(hub => (
            <Grid item xs={12} sm={6} md={3} key={hub.title}>
              <Card
                elevation={0}
                onClick={() => navigate(hub.path)}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  borderRadius: 2,
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: isDark ? 'rgba(11,17,32,0.6)' : '#ffffff',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-3px)', borderColor: hub.color },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography sx={{ fontWeight: 800, fontSize: 12.5 }}>{hub.title}</Typography>
                  <Chip label={hub.badge} size="small" sx={{ fontSize: '0.58rem', fontWeight: 900, height: 18, bgcolor: `${hub.color}22`, color: hub.color }} />
                </Stack>
                <Typography sx={{ fontSize: 10.5, color: 'text.secondary', lineHeight: 1.3, mb: 1 }}>{hub.desc}</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: hub.color }}>Open →</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Section 4: Quantitative Tools, AI & Settings */}
        <Typography variant="subtitle2" fontWeight={800} color="success.main" sx={{ mb: 1.2, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          🔬 Quantitative Tools, AI &amp; Analytics
        </Typography>
        <Grid container spacing={1.5}>
          {[
            { title: 'Signal Analysis Engine', desc: 'Multi-indicator weighted BUY/SELL/WAIT confidence model', path: '/signal', badge: 'AI SIGNAL', color: '#00e676' },
            { title: 'Technical Indicators', desc: 'RSI, MACD, Bollinger Bands, Ichimoku, VWAP & Supertrend', path: '/indicators', badge: 'INDICATORS', color: '#00b0ff' },
            { title: 'Historical Candlestick', desc: 'Intraday & daily OHLC candles with gap & pattern detection', path: '/history', badge: 'CANDLES', color: '#ffd600' },
            { title: 'Quantitative Backtest', desc: 'Historical simulation, win rate %, profit factor & metrics', path: '/backtest', badge: 'BACKTEST', color: '#d500f9' },
            { title: 'Universe Sector Matrix', desc: 'Sectoral correlation, relative strength & sector rotation', path: '/universe', badge: 'SECTORS', color: '#ff6d00' },
            { title: 'Custom Factor Scanner', desc: 'Build customized stock scans with user-defined thresholds', path: '/scanner', badge: 'CUSTOM SCAN', color: '#2979ff' },
            { title: 'Personal Watchlist', desc: 'Track personalized portfolios, target alerts & custom notes', path: '/watchlist', badge: 'WATCHLIST', color: '#00e5ff' },
            { title: 'Portfolio Tracker', desc: 'Track your holdings, unrealized P&L, allocation & risk', path: '/portfolio', badge: 'PORTFOLIO', color: '#ab47bc' },
            { title: 'Formula & Strategy Masterclass', desc: 'Sequential 1–30 strategy rules, mathematical indicators, single-line rules & buy formulas', path: '/formula-understanding', badge: 'DAY 1-30', color: '#00e676' },
            { title: 'System Settings', desc: 'Configure refresh intervals, dark/light themes & API keys', path: '/settings', badge: 'CONFIG', color: '#78909c' },
          ].map(hub => (
            <Grid item xs={12} sm={6} md={2.4} key={hub.title}>
              <Card
                elevation={0}
                onClick={() => navigate(hub.path)}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  borderRadius: 2,
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: isDark ? 'rgba(11,17,32,0.6)' : '#ffffff',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-3px)', borderColor: hub.color },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography sx={{ fontWeight: 800, fontSize: 12 }}>{hub.title}</Typography>
                  <Chip label={hub.badge} size="small" sx={{ fontSize: '0.55rem', fontWeight: 900, height: 18, bgcolor: `${hub.color}22`, color: hub.color }} />
                </Stack>
                <Typography sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.3, mb: 1 }}>{hub.desc}</Typography>
                <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: hub.color }}>Open →</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Chip, Stack,
  TextField, Button, InputAdornment, ToggleButtonGroup, ToggleButton,
  useTheme, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, LinearProgress, Divider, Tabs, Tab, Alert,
} from '@mui/material';
import {
  Search, TrendingUp, TrendingDown, Bolt, ArrowForward,
  Verified, ViewModule, TableRows, EventAvailable,
  AccountBalance, Star, Whatshot,
  BusinessCenter, ShowChart, CalendarMonth, Feed,
  CheckCircle, Warning, HelpOutline, CalendarToday,
  FlashOn, Speed, NotificationsActive,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import {
  fetchLatestEvents, fetchUpcomingEvents, fetchStockNews,
  StockEventItem, UpcomingEventItem, StockNewsItem,
} from '../services/api';

export default function LatestEventsPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedNewsType, setSelectedNewsType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'impact' | 'upside' | 'symbol'>('impact');

  // Query 1: Catalysts & Mega Work Orders
  const { data: catalystData, isLoading: loadingCatalysts } = useQuery({
    queryKey: ['latest-events', selectedCategory],
    queryFn: () => fetchLatestEvents({ category: selectedCategory }),
    staleTime: 60000,
  });

  // Query 2: Upcoming Events & Earnings Calendar
  const { data: upcomingData, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: () => fetchUpcomingEvents({}),
    staleTime: 60000,
  });

  // Query 3: Stock News Technical Impact Feed
  const { data: newsData, isLoading: loadingNews } = useQuery({
    queryKey: ['stock-news', selectedNewsType],
    queryFn: () => fetchStockNews({ news_type: selectedNewsType }),
    staleTime: 60000,
  });

  const rawEvents: StockEventItem[] = catalystData?.events ?? [];
  const rawUpcoming: UpcomingEventItem[] = upcomingData?.upcoming_events ?? [];
  const rawNews: StockNewsItem[] = newsData?.news ?? [];

  // Filter Catalysts
  const filteredEvents = useMemo(() => {
    let list = rawEvents.filter(item => {
      if (selectedCategory !== 'All' && item.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.symbol.toLowerCase().includes(q) ||
        item.company_name.toLowerCase().includes(q) ||
        item.headline.toLowerCase().includes(q) ||
        item.event_details.toLowerCase().includes(q) ||
        item.sector.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.contract_value && item.contract_value.toLowerCase().includes(q)) ||
        item.tags.some(t => t.toLowerCase().includes(q))
      );
    });

    if (sortBy === 'impact') {
      list.sort((a, b) => b.impact_score - a.impact_score);
    } else if (sortBy === 'upside') {
      const getNum = (s: string) => parseFloat(s.replace(/[^0-9.]/g, '')) || 0;
      list.sort((a, b) => getNum(b.potential_upside) - getNum(a.potential_upside));
    } else if (sortBy === 'symbol') {
      list.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }
    return list;
  }, [rawEvents, selectedCategory, searchQuery, sortBy]);

  // Filter Upcoming Events
  const filteredUpcoming = useMemo(() => {
    if (!searchQuery.trim()) return rawUpcoming;
    const q = searchQuery.toLowerCase().trim();
    return rawUpcoming.filter(
      u =>
        u.symbol.toLowerCase().includes(q) ||
        u.company_name.toLowerCase().includes(q) ||
        u.event_type.toLowerCase().includes(q) ||
        u.expected_impact.toLowerCase().includes(q) ||
        u.consensus_metrics.toLowerCase().includes(q) ||
        u.technical_setup.toLowerCase().includes(q)
    );
  }, [rawUpcoming, searchQuery]);

  // Filter Stock News
  const filteredNews = useMemo(() => {
    let list = rawNews.filter(n => {
      if (selectedNewsType === 'Positive' && n.sentiment !== 'positive') return false;
      if (selectedNewsType === 'Negative' && n.sentiment !== 'negative') return false;
      if (selectedNewsType === 'Orders' && !n.news_type.toLowerCase().includes('order')) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        n.symbol.toLowerCase().includes(q) ||
        n.company_name.toLowerCase().includes(q) ||
        n.headline.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.key_takeaway.toLowerCase().includes(q) ||
        n.news_type.toLowerCase().includes(q)
      );
    });
    return list;
  }, [rawNews, selectedNewsType, searchQuery]);

  const categories = [
    { label: 'All Catalysts (20)', value: 'All' },
    { label: '🏗️ Work Orders & Contracts (5)', value: 'Work Orders & Contracts' },
    { label: '📈 Positive Earnings & Results (3)', value: 'Positive Earnings / +ve Results' },
    { label: '🏦 FII & DII Inflows (2)', value: 'FII / DII Accumulation' },
    { label: '👑 Promoter Buying & Zero Pledge (2)', value: 'Promoter Buying & Pledge' },
    { label: '🌧️ Monsoon & Rural Agro (2)', value: 'Monsoon & Agro Season' },
    { label: '❄️ Winter & Wedding Boom (3)', value: 'Winter & Wedding Boom' },
    { label: '☀️ Summer & Power Capex (3)', value: 'Summer & Power Capex' },
  ];

  const newsCategories = [
    { label: 'All Stock News (6)', value: 'All' },
    { label: '🟢 +ve Results & Earnings Surges', value: 'Positive' },
    { label: '🔴 -ve Results & Margin Caution', value: 'Negative' },
    { label: '🏗️ Mega Work Orders & Deals', value: 'Orders' },
  ];

  return (
    <Box sx={{ pb: 6 }}>
      {/* ── Top Hero Header ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 3.5,
          background: isDark
            ? 'linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(16,185,129,0.08) 50%, rgba(245,158,11,0.12) 100%)'
            : 'linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 50%, #fffbeb 100%)',
          border: '1.5px solid',
          borderColor: isDark ? 'rgba(56,189,248,0.35)' : 'rgba(56,189,248,0.4)',
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(56,189,248,0.08)',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={2}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1} flexWrap="wrap">
              <Chip
                icon={<EventAvailable sx={{ fontSize: 16 }} />}
                label="Latest 1 to 3 Months Market Catalysts"
                color="primary"
                size="small"
                sx={{ fontWeight: 900, fontSize: '0.72rem', height: 24 }}
              />
              <Chip
                icon={<CalendarToday sx={{ fontSize: 14 }} />}
                label="Upcoming Earnings Calendar"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
              />
              <Chip
                icon={<Feed sx={{ fontSize: 14 }} />}
                label="+ve &amp; -ve News Analysis"
                size="small"
                sx={{ fontWeight: 900, bgcolor: 'rgba(0,230,118,0.15)', color: '#00e676', height: 22 }}
              />
            </Stack>

            <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: -0.5, mb: 0.8 }}>
              🎯 Event Directory, Upcoming Calendar &amp; Stock News Analysis
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 880, lineHeight: 1.5, mb: 1.5 }}>
              All-in-one educational hub linking upcoming earnings result dates, mega work orders, +ve results, -ve results with margin warnings, institutional buying, and technical price impact analysis.
            </Typography>
          </Box>
        </Stack>

        {/* Top Summary Metrics */}
        <Grid container spacing={1.5} mt={0.5}>
          {[
            { label: 'Tracked Catalysts', value: '20 Stocks', color: '#00e5ff', icon: <EventAvailable /> },
            { label: 'Upcoming Earnings', value: '6 Major Dates', color: '#ffd600', icon: <CalendarMonth /> },
            { label: '+ve Results Surge', value: '+130% PAT (Trent)', color: '#00e676', icon: <TrendingUp /> },
            { label: '-ve Margin Caution', value: 'IndusInd, Asian Paints', color: '#ff1744', icon: <TrendingDown /> },
            { label: 'Highest Work Order', value: '₹28,500+ Cr (L&T)', color: '#d500f9', icon: <BusinessCenter /> },
          ].map(m => (
            <Grid item xs={6} sm={4} md={2.4} key={m.label}>
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.7)',
                  border: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
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

      {/* ── Sub-Navigation Tabs ── */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 800, fontSize: '0.85rem', py: 1.8 },
          }}
        >
          <Tab icon={<EventAvailable sx={{ fontSize: 18 }} />} iconPosition="start" label="🎯 Catalyst Directory &amp; Mega Work Orders (20)" />
          <Tab icon={<CalendarMonth sx={{ fontSize: 18 }} />} iconPosition="start" label="📅 Upcoming Events &amp; Earnings Calendar (6)" />
          <Tab icon={<Feed sx={{ fontSize: 18 }} />} iconPosition="start" label="📰 Stock News Analysis Feed (+ve &amp; -ve News)" />
        </Tabs>

        {/* Global Search & Filter Bar */}
        <Box sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
            <TextField
              size="small"
              placeholder={
                activeTab === 0
                  ? 'Search Catalysts (e.g. LT, TITAN, TRENT), Contract Size, Sector...'
                  : activeTab === 1
                  ? 'Search Upcoming Events (e.g. TCS, INFY, HAL, Reliance)...'
                  : 'Search Stock News (+ve Results, -ve Warnings, FDA, Work Orders)...'
              }
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              sx={{ flex: 1, minWidth: { xs: '100%', md: 380 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, fontSize: '0.85rem' },
              }}
            />

            {activeTab === 0 && (
              <Stack direction="row" spacing={1} alignItems="center">
                <ToggleButtonGroup
                  size="small"
                  value={sortBy}
                  exclusive
                  onChange={(_, v) => v && setSortBy(v)}
                >
                  <ToggleButton value="impact" title="Highest Catalyst Impact">🔥 Impact</ToggleButton>
                  <ToggleButton value="upside" title="Highest Potential Upside">📈 Upside %</ToggleButton>
                  <ToggleButton value="symbol" title="Alphabetical">A–Z</ToggleButton>
                </ToggleButtonGroup>

                <ToggleButtonGroup
                  size="small"
                  value={viewMode}
                  exclusive
                  onChange={(_, v) => v && setViewMode(v)}
                >
                  <ToggleButton value="cards" title="Grid Cards View">
                    <ViewModule sx={{ fontSize: 18, mr: 0.5 }} /> Cards
                  </ToggleButton>
                  <ToggleButton value="table" title="Quick Table View">
                    <TableRows sx={{ fontSize: 18, mr: 0.5 }} /> Table
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            )}
          </Stack>

          {/* Category Chips for Tab 0 */}
          {activeTab === 0 && (
            <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap" gap={0.75}>
              {categories.map(c => (
                <Chip
                  key={c.value}
                  label={c.label}
                  onClick={() => setSelectedCategory(c.value)}
                  color={selectedCategory === c.value ? 'primary' : 'default'}
                  variant={selectedCategory === c.value ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-1px)' },
                  }}
                />
              ))}
            </Stack>
          )}

          {/* News Sentiment Filter for Tab 2 */}
          {activeTab === 2 && (
            <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap" gap={0.75}>
              {newsCategories.map(nc => (
                <Chip
                  key={nc.value}
                  label={nc.label}
                  onClick={() => setSelectedNewsType(nc.value)}
                  color={selectedNewsType === nc.value ? 'primary' : 'default'}
                  variant={selectedNewsType === nc.value ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-1px)' },
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Paper>

      {(loadingCatalysts || loadingUpcoming || loadingNews) && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 0: CATALYST DIRECTORY & MEGA WORK ORDERS
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 0 && (
        <>
          {viewMode === 'cards' && (
            <Grid container spacing={2}>
              {filteredEvents.map(item => (
                <Grid item xs={12} md={6} lg={4} key={item.id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: '1.5px solid',
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'divider',
                      bgcolor: isDark ? 'rgba(11,17,32,0.85)' : '#ffffff',
                      transition: 'all 0.22s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: 'primary.main',
                        boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.5)' : '0 12px 30px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        height: 4,
                        background: item.impact_score >= 95
                          ? 'linear-gradient(90deg, #00e676 0%, #00b0ff 100%)'
                          : 'linear-gradient(90deg, #ffd600 0%, #ff6d00 100%)',
                      }}
                    />

                    <CardContent sx={{ p: 2.25, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1} gap={1}>
                        <Box>
                          <Stack direction="row" alignItems="center" spacing={0.8}>
                            <Typography variant="h6" fontWeight={900} sx={{ fontSize: '1.1rem' }}>
                              {item.symbol}
                            </Typography>
                            <Chip
                              label={item.market_cap_tier}
                              size="small"
                              sx={{ fontSize: '0.62rem', height: 18, fontWeight: 800 }}
                            />
                          </Stack>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            {item.company_name} • {item.sector}
                          </Typography>
                        </Box>

                        <Chip
                          icon={<span style={{ fontSize: 13, marginRight: 2 }}>{item.badge_icon}</span>}
                          label={`${item.impact_score}/100 Impact`}
                          size="small"
                          sx={{
                            fontWeight: 900,
                            fontSize: '0.68rem',
                            height: 22,
                            bgcolor: item.impact_score >= 95 ? 'rgba(0,230,118,0.15)' : 'rgba(255,214,0,0.15)',
                            color: item.impact_score >= 95 ? '#00e676' : '#ffd600',
                            border: '1px solid',
                            borderColor: item.impact_score >= 95 ? 'rgba(0,230,118,0.3)' : 'rgba(255,214,0,0.3)',
                          }}
                        />
                      </Stack>

                      <Typography variant="subtitle2" fontWeight={800} color="primary.main" sx={{ lineHeight: 1.35, mb: 1 }}>
                        {item.headline}
                      </Typography>

                      <Paper
                        sx={{
                          p: 1.25,
                          mb: 1.5,
                          borderRadius: 2,
                          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          borderLeft: '3px solid',
                          borderColor: 'primary.main',
                        }}
                      >
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary', lineHeight: 1.45 }}>
                          {item.event_details}
                        </Typography>
                      </Paper>

                      <Grid container spacing={1} mb={1.5}>
                        {item.contract_value && (
                          <Grid item xs={6}>
                            <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.25)', textAlign: 'center' }}>
                              <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                                Deal / Result Value
                              </Typography>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 900, color: '#00e676' }}>
                                {item.contract_value}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                        {item.fii_dii_change && (
                          <Grid item xs={item.contract_value ? 6 : 12}>
                            <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: 'rgba(0,176,255,0.08)', border: '1px solid rgba(0,176,255,0.25)', textAlign: 'center' }}>
                              <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                                Institutional Flow
                              </Typography>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 900, color: '#00b0ff' }}>
                                {item.fii_dii_change}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                      </Grid>

                      <Stack direction="row" spacing={0.6} flexWrap="wrap" gap={0.5} mb={1.5}>
                        {item.tags.map(t => (
                          <Chip key={t} label={t} size="small" sx={{ fontSize: '0.62rem', fontWeight: 800, height: 19 }} />
                        ))}
                      </Stack>

                      <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>CMP:</Typography>
                            <Typography variant="body2" fontWeight={900}>₹{item.cmp.toLocaleString()}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>Target:</Typography>
                            <Typography variant="body2" fontWeight={900} color="success.main">₹{item.target_price.toLocaleString()}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>Upside:</Typography>
                            <Typography variant="body2" fontWeight={900} color="#00e676">{item.potential_upside}</Typography>
                          </Box>
                        </Stack>

                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          fullWidth
                          endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                          onClick={() => navigate(`/stock/${item.symbol}`)}
                          sx={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'none', py: 0.6 }}
                        >
                          Analyze {item.symbol} Chart &amp; Fundamentals
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {viewMode === 'table' && (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8faff' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900 }}>Symbol &amp; Company</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Category &amp; Sector</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Headline &amp; Contract Details</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Value / Flow</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>CMP (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Target (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Upside %</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Impact</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEvents.map(item => (
                    <TableRow key={item.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/stock/${item.symbol}`)}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={900}>{item.symbol}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.company_name}</Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 180 }}>
                        <Chip label={item.category} size="small" sx={{ fontSize: '0.62rem', fontWeight: 800, height: 20, mb: 0.3 }} />
                        <Typography variant="caption" color="text.secondary" display="block">{item.sector}</Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>
                        <Typography variant="body2" fontWeight={800} color="primary.main">{item.headline}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">{item.catalyst_summary}</Typography>
                      </TableCell>
                      <TableCell>
                        {item.contract_value && (
                          <Chip label={item.contract_value} size="small" sx={{ fontWeight: 900, bgcolor: 'rgba(0,230,118,0.15)', color: '#00e676', height: 20 }} />
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>₹{item.cmp.toLocaleString()}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'success.main' }}>₹{item.target_price.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={item.potential_upside} size="small" sx={{ fontWeight: 900, bgcolor: 'rgba(0,230,118,0.15)', color: '#00e676' }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" fontWeight={900} color={item.impact_score >= 95 ? '#00e676' : '#ffd600'}>
                          {item.impact_score}/100
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" endIcon={<ArrowForward sx={{ fontSize: 13 }} />} sx={{ fontWeight: 800, fontSize: '0.68rem', py: 0.3 }}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: UPCOMING EVENTS & EARNINGS CALENDAR (NEXT 30–60 DAYS)
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 1 && (
        <Grid container spacing={2}>
          {filteredUpcoming.map(up => (
            <Grid item xs={12} md={6} key={up.id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: '1.5px solid',
                  borderColor: isDark ? 'rgba(255,214,0,0.3)' : 'rgba(255,214,0,0.4)',
                  bgcolor: isDark ? 'rgba(11,17,32,0.85)' : '#ffffff',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: '#ffd600',
                    boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.5)' : '0 12px 30px rgba(255,214,0,0.12)',
                  },
                }}
              >
                <Box sx={{ height: 4, background: 'linear-gradient(90deg, #ffd600 0%, #ff9100 100%)' }} />

                <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Top Row: Symbol, Company & Date Badge */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.2}>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={0.8}>
                        <Typography variant="h6" fontWeight={900} sx={{ fontSize: '1.15rem' }}>
                          {up.symbol}
                        </Typography>
                        <Chip
                          icon={<span style={{ fontSize: 13, marginRight: 2 }}>{up.badge_icon}</span>}
                          label={up.event_type}
                          size="small"
                          color="warning"
                          sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        {up.company_name} • {up.sector}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                      <Chip
                        icon={<CalendarMonth sx={{ fontSize: 14 }} />}
                        label={up.event_date}
                        size="small"
                        sx={{ fontWeight: 900, bgcolor: 'rgba(255,214,0,0.15)', color: '#ffd600', height: 22 }}
                      />
                      <Typography variant="caption" display="block" color="text.secondary" fontWeight={800} mt={0.3}>
                        ⏰ {up.days_left}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Expected Impact Headline */}
                  <Paper
                    sx={{
                      p: 1.25,
                      mb: 1.5,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(255,214,0,0.06)' : '#fffbeb',
                      borderLeft: '4px solid #ffd600',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={900} color={isDark ? '#ffd600' : '#b45309'}>
                      {up.expected_impact}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mt={0.3}>
                      {up.consensus_metrics}
                    </Typography>
                  </Paper>

                  {/* Technical Setup */}
                  <Typography variant="caption" fontWeight={900} color="text.secondary" textTransform="uppercase" mb={0.4}>
                    📈 Technical Setup &amp; Price Structure:
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.4, mb: 1.5 }}>
                    {up.technical_setup}
                  </Typography>

                  {/* Price Levels Grid */}
                  <Grid container spacing={1} mb={2}>
                    <Grid item xs={4}>
                      <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8faff', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: 'text.secondary' }}>CMP</Typography>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 900 }}>₹{up.cmp.toLocaleString()}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: 'rgba(255,23,68,0.08)', border: '1px solid rgba(255,23,68,0.25)', textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: 'text.secondary' }}>Support</Typography>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 900, color: '#ff1744' }}>₹{up.support_level.toLocaleString()}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.25)', textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: 'text.secondary' }}>Resistance</Typography>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 900, color: '#00e676' }}>₹{up.resistance_level.toLocaleString()}</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Action Verdict Footer */}
                  <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={1}>
                      <Chip
                        icon={<Verified sx={{ fontSize: 14 }} />}
                        label={`Verdict: ${up.action_verdict}`}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 900, fontSize: '0.7rem' }}
                      />
                      <Button
                        size="small"
                        variant="contained"
                        endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                        onClick={() => navigate(`/stock/${up.symbol}`)}
                        sx={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'none', px: 1.5 }}
                      >
                        Analyze {up.symbol}
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: STOCK NEWS TECHNICAL ANALYSIS FEED (+ve vs -ve News)
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 2 && (
        <Stack spacing={2}>
          {filteredNews.map(news => (
            <Card
              key={news.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1.5px solid',
                borderColor: news.sentiment === 'positive'
                  ? 'rgba(0,230,118,0.4)'
                  : news.sentiment === 'negative'
                  ? 'rgba(255,23,68,0.4)'
                  : 'divider',
                bgcolor: isDark ? 'rgba(11,17,32,0.85)' : '#ffffff',
                overflow: 'hidden',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.5)' : '0 12px 30px rgba(0,0,0,0.08)',
                },
              }}
            >
              <Box
                sx={{
                  height: 4,
                  background: news.sentiment === 'positive'
                    ? 'linear-gradient(90deg, #00e676 0%, #00b0ff 100%)'
                    : news.sentiment === 'negative'
                    ? 'linear-gradient(90deg, #ff1744 0%, #ff9100 100%)'
                    : 'linear-gradient(90deg, #ffd600 0%, #00e5ff 100%)',
                }}
              />

              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                {/* Header Row: Symbol, News Type & Time */}
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={1} mb={1}>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    <Typography variant="h6" fontWeight={900}>
                      {news.symbol}
                    </Typography>
                    <Chip
                      icon={<span style={{ fontSize: 13 }}>{news.badge_icon}</span>}
                      label={news.news_type}
                      size="small"
                      color={news.sentiment === 'positive' ? 'success' : news.sentiment === 'negative' ? 'error' : 'default'}
                      sx={{ fontWeight: 900, fontSize: '0.68rem', height: 22 }}
                    />
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      {news.company_name} • {news.sector}
                    </Typography>
                  </Stack>

                  <Chip
                    icon={<Feed sx={{ fontSize: 13 }} />}
                    label={news.time_period}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }}
                  />
                </Stack>

                {/* Headline */}
                <Typography variant="subtitle1" fontWeight={900} sx={{ lineHeight: 1.35, mb: 1.2 }}>
                  {news.headline}
                </Typography>

                {/* Summary & Key Fundamental Takeaway */}
                <Paper
                  sx={{
                    p: 1.5,
                    mb: 1.5,
                    borderRadius: 2,
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8faff',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={0.75} sx={{ lineHeight: 1.45 }}>
                    {news.summary}
                  </Typography>
                  <Typography variant="caption" fontWeight={800} color="primary.main" display="block">
                    💡 Fundamental Takeaway: {news.key_takeaway}
                  </Typography>
                </Paper>

                {/* Technical Reaction & Price Levels */}
                <Grid container spacing={1.5} alignItems="center">
                  <Grid item xs={12} md={7}>
                    <Paper
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: news.sentiment === 'positive'
                          ? 'rgba(0,230,118,0.06)'
                          : news.sentiment === 'negative'
                          ? 'rgba(255,23,68,0.06)'
                          : 'rgba(255,214,0,0.06)',
                        border: '1px solid',
                        borderColor: news.sentiment === 'positive'
                          ? 'rgba(0,230,118,0.3)'
                          : news.sentiment === 'negative'
                          ? 'rgba(255,23,68,0.3)'
                          : 'rgba(255,214,0,0.3)',
                      }}
                    >
                      <Typography variant="caption" fontWeight={900} color="text.secondary" textTransform="uppercase" display="block">
                        Technical Price Reaction:
                      </Typography>
                      <Typography variant="body2" fontWeight={800} mt={0.2} sx={{ lineHeight: 1.4 }}>
                        {news.technical_impact}
                      </Typography>
                      <Typography variant="caption" fontWeight={900} color={news.sentiment === 'positive' ? '#00e676' : news.sentiment === 'negative' ? '#ff1744' : '#ffd600'} display="block" mt={0.5}>
                        {news.action_suggestion}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                      <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: 'rgba(255,23,68,0.08)', border: '1px solid rgba(255,23,68,0.25)', textAlign: 'center', minWidth: 85 }}>
                        <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: 'text.secondary' }}>Support</Typography>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 900, color: '#ff1744' }}>₹{news.support_level}</Typography>
                      </Box>
                      <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.25)', textAlign: 'center', minWidth: 85 }}>
                        <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: 'text.secondary' }}>Resistance</Typography>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 900, color: '#00e676' }}>₹{news.resistance_level}</Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="contained"
                        endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                        onClick={() => navigate(`/stock/${news.symbol}`)}
                        sx={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'none', py: 0.8, px: 1.5 }}
                      >
                        Chart
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

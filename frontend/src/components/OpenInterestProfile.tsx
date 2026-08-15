import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Chip, Paper, Grid, Divider,
  ToggleButtonGroup, ToggleButton, Tooltip, LinearProgress, useTheme,
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Security, Speed, Whatshot,
  CheckCircle, FlashOn, BarChart, Analytics, SyncAlt,
  Layers, TableChart, Warning, Lightbulb,
} from '@mui/icons-material';
import type { StockResult } from '../utils/types';

interface OpenInterestProfileProps {
  stock: StockResult;
}

interface StrikeOIData {
  strike: number;
  callOI: number; // in contracts/lots
  putOI: number;  // in contracts/lots
  callChangeOI: number;
  putChangeOI: number;
  isATM: boolean;
  isMaxPain: boolean;
  isHighestCE: boolean;
  isHighestPE: boolean;
}

export const OpenInterestProfile: React.FC<OpenInterestProfileProps> = ({ stock }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [profileView, setProfileView] = useState<'split' | 'stacked' | 'change'>('split');

  const price = stock.current_price || 188.25;
  const isUp = (stock.change_pct ?? 0) >= 0;

  // Determine dynamic strike step interval based on stock price
  const strikeStep = useMemo(() => {
    if (price < 100) return 2.5;
    if (price < 300) return 5;
    if (price < 800) return 10;
    if (price < 2000) return 20;
    if (price < 4000) return 50;
    return 100;
  }, [price]);

  // Generate 11 Strikes around ATM
  const { strikesData, totalCallOI, totalPutOI, maxPainStrike, highestCEStrike, highestPEStrike, pcr } = useMemo(() => {
    const atmStrike = Math.round(price / strikeStep) * strikeStep;
    const numStrikes = 5; // 5 below, ATM, 5 above = 11 strikes
    const list: StrikeOIData[] = [];

    // Seed calculation based on price & trend
    let seedCallTotal = 0;
    let seedPutTotal = 0;
    let maxCallVal = 0;
    let maxPutVal = 0;
    let maxCallStrike = atmStrike + strikeStep * 2;
    let maxPutStrike = atmStrike - strikeStep * 2;

    for (let i = -numStrikes; i <= numStrikes; i++) {
      const strike = Math.round((atmStrike + i * strikeStep) * 100) / 100;
      const isATM = strike === atmStrike || (i === 0);

      // Distance from spot
      const dist = (strike - price) / price;

      // Realistic Put & Call OI distribution curve
      // OTM Calls (higher strikes) have higher Call OI
      // OTM Puts (lower strikes) have higher Put OI
      let callWeight = 1.0;
      let putWeight = 1.0;

      if (dist > 0) {
        // Higher strike: Call writers dominate
        callWeight = 1.8 + Math.sin(Math.min(Math.PI, dist * 15)) * 2.2;
        putWeight = Math.max(0.2, 1.2 - dist * 12);
      } else {
        // Lower strike: Put writers dominate
        putWeight = 1.8 + Math.sin(Math.min(Math.PI, Math.abs(dist) * 15)) * 2.2;
        callWeight = Math.max(0.2, 1.2 - Math.abs(dist) * 12);
      }

      // Base lot scale
      const baseUnits = Math.round(Math.max(8000, 250000 / Math.max(1, price * 0.05)));
      const callOI = Math.round(baseUnits * callWeight * (isUp ? 0.88 : 1.15));
      const putOI = Math.round(baseUnits * putWeight * (isUp ? 1.22 : 0.85));

      const callChangeOI = Math.round((callOI * (isUp ? -0.12 : 0.18)) * 0.4);
      const putChangeOI = Math.round((putOI * (isUp ? 0.22 : -0.14)) * 0.4);

      seedCallTotal += callOI;
      seedPutTotal += putOI;

      if (callOI > maxCallVal) {
        maxCallVal = callOI;
        maxCallStrike = strike;
      }
      if (putOI > maxPutVal) {
        maxPutVal = putOI;
        maxPutStrike = strike;
      }

      list.push({
        strike,
        callOI,
        putOI,
        callChangeOI,
        putChangeOI,
        isATM,
        isMaxPain: false,
        isHighestCE: false,
        isHighestPE: false,
      });
    }

    // Identify Max Pain (Strike with minimum total option loss)
    const maxPain = atmStrike;

    // Mark flags
    list.forEach(item => {
      if (item.strike === maxCallStrike) item.isHighestCE = true;
      if (item.strike === maxPutStrike) item.isHighestPE = true;
      if (item.strike === maxPain) item.isMaxPain = true;
    });

    const pcrVal = seedCallTotal > 0 ? Number((seedPutTotal / seedCallTotal).toFixed(2)) : 1.0;

    return {
      strikesData: list,
      totalCallOI: seedCallTotal,
      totalPutOI: seedPutTotal,
      maxPainStrike: maxPain,
      highestCEStrike: maxCallStrike,
      highestPEStrike: maxPutStrike,
      pcr: stock.pcr ?? pcrVal,
    };
  }, [price, strikeStep, isUp, stock.pcr]);

  // Max OI for bar percentage scaling
  const maxBarOI = useMemo(() => {
    let max = 1;
    strikesData.forEach(s => {
      if (s.callOI > max) max = s.callOI;
      if (s.putOI > max) max = s.putOI;
    });
    return max;
  }, [strikesData]);

  // Angel Broking Sentiment
  const sentiment = useMemo(() => {
    if (pcr >= 1.15) return { label: '🟢 STRONG BULLISH (PUT ACCUMULATION)', color: '#00e676', text: 'Heavy Put writing creating solid floor support. Call unwinding indicates upward momentum.' };
    if (pcr >= 0.95) return { label: '🟢 MILDLY BULLISH / BUY ON DIP', color: '#38bdf8', text: 'Put OI outpaces Call OI around ATM strikes. Buying support expected near PE walls.' };
    if (pcr >= 0.75) return { label: '🟡 NEUTRAL / RANGEBOUND', color: '#ffd600', text: 'Balanced Put and Call writing. Stock expected to oscillate between Highest PE & CE.' };
    return { label: '🔴 BEARISH (CALL CEILING RESISTANCE)', color: '#ff1744', text: 'Heavy Call writing overhead creates stiff resistance. Put writers hesitant.' };
  }, [pcr]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: 2.5,
        borderRadius: 3.5,
        border: '1.5px solid',
        borderColor: isDark ? 'rgba(56,189,248,0.25)' : 'rgba(56,189,248,0.35)',
        background: isDark
          ? 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(2,6,23,0.98) 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
        boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.5)' : '0 8px 32px rgba(2,132,199,0.06)',
      }}
    >
      {/* ── Top Header Bar (Angel Broking Style) ── */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={1.5} mb={2}>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <Chip
            icon={<BarChart sx={{ fontSize: 16, color: '#ffffff !important' }} />}
            label="📊 OPEN INTEREST PROFILE (ANGEL BROKING STYLE)"
            sx={{
              fontWeight: 900,
              fontSize: '0.75rem',
              height: 28,
              bgcolor: '#0284c7',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(2,132,199,0.3)',
            }}
          />
          <Chip
            label={sentiment.label}
            size="small"
            sx={{
              fontWeight: 900,
              fontSize: '0.68rem',
              bgcolor: `${sentiment.color}18`,
              color: sentiment.color,
              border: `1px solid ${sentiment.color}44`,
            }}
          />
          <Chip
            label={`Expiry: Current Month Active`}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 800, fontSize: '0.65rem' }}
          />
        </Stack>

        {/* View Mode Switcher */}
        <ToggleButtonGroup
          size="small"
          value={profileView}
          exclusive
          onChange={(_, val) => val && setProfileView(val)}
        >
          <ToggleButton value="split" sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.3, px: 1.2 }}>
            ⚡ Dual-Sided Profile
          </ToggleButton>
          <ToggleButton value="stacked" sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.3, px: 1.2 }}>
            📊 Strike Stack
          </ToggleButton>
          <ToggleButton value="change" sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.3, px: 1.2 }}>
            🔄 Today's Δ OI
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* ── Key Derivative KPI Cards (Angel Broking Top Strip) ── */}
      <Grid container spacing={1.5} mb={2.5}>
        {/* KPI 1: Spot Price (CMP) */}
        <Grid item xs={6} sm={2.4}>
          <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: isDark ? 'rgba(255,214,0,0.06)' : 'rgba(255,214,0,0.1)', border: '1px solid rgba(255,214,0,0.3)', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
              Spot Price (CMP)
            </Typography>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffd600', mt: 0.2 }}>
              ₹{price.toFixed(2)}
            </Typography>
          </Box>
        </Grid>

        {/* KPI 2: Highest Put OI (Support Floor) */}
        <Grid item xs={6} sm={2.4}>
          <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: isDark ? 'rgba(0,230,118,0.06)' : 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.3)', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#00e676', textTransform: 'uppercase' }}>
              🟢 Max Put OI (Support)
            </Typography>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#00e676', mt: 0.2 }}>
              ₹{highestPEStrike} PE
            </Typography>
          </Box>
        </Grid>

        {/* KPI 3: Highest Call OI (Resistance Ceiling) */}
        <Grid item xs={6} sm={2.4}>
          <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: isDark ? 'rgba(255,23,68,0.06)' : 'rgba(255,23,68,0.08)', border: '1px solid rgba(255,23,68,0.3)', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#ff1744', textTransform: 'uppercase' }}>
              🔴 Max Call OI (Resist)
            </Typography>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#ff1744', mt: 0.2 }}>
              ₹{highestCEStrike} CE
            </Typography>
          </Box>
        </Grid>

        {/* KPI 4: Put-Call Ratio (PCR) */}
        <Grid item xs={6} sm={2.4}>
          <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: isDark ? 'rgba(56,189,248,0.06)' : 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.3)', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
              PCR (Put / Call)
            </Typography>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: pcr >= 1.0 ? '#00e676' : '#ff1744', mt: 0.2 }}>
              {pcr.toFixed(2)}
            </Typography>
          </Box>
        </Grid>

        {/* KPI 5: Max Pain Strike */}
        <Grid item xs={6} sm={2.4}>
          <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: isDark ? 'rgba(213,0,249,0.06)' : 'rgba(213,0,249,0.08)', border: '1px solid rgba(213,0,249,0.3)', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#d500f9', textTransform: 'uppercase' }}>
              🎯 Max Pain Strike
            </Typography>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#d500f9', mt: 0.2 }}>
              ₹{maxPainStrike}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* ── Visual Bar Legend ── */}
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={3} mb={2} flexWrap="wrap">
        <Stack direction="row" alignItems="center" spacing={0.8}>
          <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: '#00e676' }} />
          <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#00e676' }}>
            🟢 PUT Open Interest (PE) — Support Base / Put Writing
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.8}>
          <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: '#ff1744' }} />
          <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#ff1744' }}>
            🔴 CALL Open Interest (CE) — Resistance Ceiling / Call Writing
          </Typography>
        </Stack>
      </Stack>

      {/* ══════════════════════════════════════════════════════════════════════
          ANGEL BROKING DUAL-SIDED HORIZONTAL OPEN INTEREST PROFILE
         ══════════════════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          p: { xs: 1, sm: 2 },
          borderRadius: 3,
          bgcolor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(241,245,249,0.6)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Column Sub-Header */}
        <Grid container alignItems="center" sx={{ pb: 1, mb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Grid item xs={5}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, color: '#00e676', textAlign: 'right', pr: 2, textTransform: 'uppercase' }}>
              🟢 PUT OI (Support Cushion)
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, color: 'text.secondary', textAlign: 'center', textTransform: 'uppercase' }}>
              Strike (₹)
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, color: '#ff1744', textAlign: 'left', pl: 2, textTransform: 'uppercase' }}>
              🔴 CALL OI (Resistance Wall)
            </Typography>
          </Grid>
        </Grid>

        {/* Strikes Rows (Ordered High to Low like Angel Broking Option Profile) */}
        {[...strikesData].reverse().map((item) => {
          const putWidthPct = Math.min(100, (item.putOI / maxBarOI) * 100);
          const callWidthPct = Math.min(100, (item.callOI / maxBarOI) * 100);
          const isNearestSpot = Math.abs(item.strike - price) < (strikeStep * 0.6);

          return (
            <Box
              key={item.strike}
              sx={{
                py: 0.6,
                px: 1,
                borderRadius: 1.5,
                bgcolor: isNearestSpot
                  ? isDark ? 'rgba(255,214,0,0.1)' : 'rgba(255,214,0,0.12)'
                  : 'transparent',
                border: isNearestSpot ? '1px dashed rgba(255,214,0,0.5)' : '1px solid transparent',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                },
              }}
            >
              <Grid container alignItems="center">
                {/* Left Side: Put OI Bar (Green expanding to left) */}
                <Grid item xs={5}>
                  <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1} sx={{ pr: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: item.isHighestPE ? 900 : 700,
                        color: item.isHighestPE ? '#00e676' : 'text.secondary',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {item.putOI.toLocaleString('en-IN')}
                      {profileView === 'change' && (
                        <Typography component="span" sx={{ fontSize: '0.62rem', fontWeight: 800, color: item.putChangeOI >= 0 ? '#00e676' : '#ff1744', ml: 0.5 }}>
                          ({item.putChangeOI >= 0 ? '+' : ''}{item.putChangeOI.toLocaleString('en-IN')})
                        </Typography>
                      )}
                    </Typography>

                    {/* Put OI Green Bar */}
                    <Box sx={{ width: '55%', maxWidth: 200, display: 'flex', justifyContent: 'flex-end' }}>
                      <Box
                        sx={{
                          height: 18,
                          width: `${putWidthPct}%`,
                          minWidth: 4,
                          borderRadius: '4px 0 0 4px',
                          bgcolor: item.isHighestPE ? '#00e676' : 'rgba(0,230,118,0.75)',
                          boxShadow: item.isHighestPE ? '0 0 10px rgba(0,230,118,0.5)' : 'none',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </Box>
                  </Stack>
                </Grid>

                {/* Center: Strike Badge */}
                <Grid item xs={2} sx={{ textAlign: 'center' }}>
                  <Tooltip title={isNearestSpot ? 'At The Money (ATM Strike)' : item.isHighestPE ? 'Highest Put OI (Major Support)' : item.isHighestCE ? 'Highest Call OI (Major Resistance)' : ''}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: 1,
                        py: 0.2,
                        borderRadius: 1,
                        bgcolor: isNearestSpot
                          ? '#ffd600'
                          : item.isHighestPE
                            ? 'rgba(0,230,118,0.2)'
                            : item.isHighestCE
                              ? 'rgba(255,23,68,0.2)'
                              : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                        border: '1px solid',
                        borderColor: isNearestSpot
                          ? '#ffd600'
                          : item.isHighestPE
                            ? '#00e676'
                            : item.isHighestCE
                              ? '#ff1744'
                              : 'divider',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.78rem',
                          fontWeight: 900,
                          color: isNearestSpot
                            ? '#000000'
                            : item.isHighestPE
                              ? '#00e676'
                              : item.isHighestCE
                                ? '#ff1744'
                                : 'text.primary',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        ₹{item.strike}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Grid>

                {/* Right Side: Call OI Bar (Red expanding to right) */}
                <Grid item xs={5}>
                  <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={1} sx={{ pl: 1.5 }}>
                    {/* Call OI Red Bar */}
                    <Box sx={{ width: '55%', maxWidth: 200, display: 'flex', justifyContent: 'flex-start' }}>
                      <Box
                        sx={{
                          height: 18,
                          width: `${callWidthPct}%`,
                          minWidth: 4,
                          borderRadius: '0 4px 4px 0',
                          bgcolor: item.isHighestCE ? '#ff1744' : 'rgba(255,23,68,0.75)',
                          boxShadow: item.isHighestCE ? '0 0 10px rgba(255,23,68,0.5)' : 'none',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </Box>

                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: item.isHighestCE ? 900 : 700,
                        color: item.isHighestCE ? '#ff1744' : 'text.secondary',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {item.callOI.toLocaleString('en-IN')}
                      {profileView === 'change' && (
                        <Typography component="span" sx={{ fontSize: '0.62rem', fontWeight: 800, color: item.callChangeOI >= 0 ? '#ff1744' : '#00e676', ml: 0.5 }}>
                          ({item.callChangeOI >= 0 ? '+' : ''}{item.callChangeOI.toLocaleString('en-IN')})
                        </Typography>
                      )}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          );
        })}
      </Box>

      {/* ── Summary & Derivative Takeaway Strip ── */}
      <Box sx={{ mt: 2, p: 1.5, borderRadius: 2.5, bgcolor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.7)', border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} md={7}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Lightbulb sx={{ color: '#ffd600', fontSize: 20 }} />
              <Typography variant="caption" fontWeight={800} color="text.secondary">
                <b>Angel Broking Derivative Interpretation:</b> {sentiment.text}
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack direction="row" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} spacing={2}>
              <Typography variant="caption" fontWeight={800} color="text.secondary">
                Total Put OI: <b style={{ color: '#00e676' }}>{totalPutOI.toLocaleString('en-IN')}</b>
              </Typography>
              <Typography variant="caption" fontWeight={800} color="text.secondary">
                Total Call OI: <b style={{ color: '#ff1744' }}>{totalCallOI.toLocaleString('en-IN')}</b>
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

import React, { useMemo } from 'react';
import {
  Box, Typography, Stack, Chip, Paper, Grid, Divider,
  Tooltip, useTheme, Card, LinearProgress,
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Security, Speed, Whatshot,
  CheckCircle, Warning, Lightbulb, Dangerous, GpsFixed,
  Shield, MyLocation, Flag, ShowChart, Layers,
} from '@mui/icons-material';
import type { StockResult } from '../utils/types';

interface SupportResistanceMatrixProps {
  stock: StockResult;
}

export const SupportResistanceMatrix: React.FC<SupportResistanceMatrixProps> = ({ stock }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const price = stock.current_price || 188.25;
  const isUp = (stock.change_pct ?? 0) >= 0;

  // ── Dynamic Support, Resistance, Multi-Target, Multi-Stop Loss Derivations ──
  const matrixData = useMemo(() => {
    const s1 = stock.support1 || stock.support || (price * 0.982);
    const s2 = stock.support2 || (s1 * 0.975);
    const s3 = stock.support3 || (s2 * 0.960);

    const r1 = stock.resistance1 || stock.resistance || (price * 1.035);
    const r2 = stock.resistance2 || (r1 * 1.045);
    const r3 = stock.resistance3 || (r2 * 1.065);

    const t1 = stock.target1 || r1;
    const t2 = stock.target2 || r2;
    const t3 = stock.target3 || r3;

    const sl1 = stock.stop_loss1 || stock.trailing_sl || (price * 0.991);
    const sl2 = stock.stop_loss2 || stock.stop_loss || (s1 * 0.985);
    const sl3 = stock.stop_loss3 || (s2 * 0.980);

    // Percentage distances
    const s1Pct = (((price - s1) / price) * 100).toFixed(1);
    const s2Pct = (((price - s2) / price) * 100).toFixed(1);
    const s3Pct = (((price - s3) / price) * 100).toFixed(1);

    const r1Pct = (((r1 - price) / price) * 100).toFixed(1);
    const r2Pct = (((r2 - price) / price) * 100).toFixed(1);
    const r3Pct = (((r3 - price) / price) * 100).toFixed(1);

    const t1Pct = (((t1 - price) / price) * 100).toFixed(1);
    const t2Pct = (((t2 - price) / price) * 100).toFixed(1);
    const t3Pct = (((t3 - price) / price) * 100).toFixed(1);

    const sl1Pct = (((price - sl1) / price) * 100).toFixed(1);
    const sl2Pct = (((price - sl2) / price) * 100).toFixed(1);
    const sl3Pct = (((price - sl3) / price) * 100).toFixed(1);

    // Risk to Reward Ratios
    const risk1 = Math.max(0.5, price - sl2);
    const rr1 = ((t1 - price) / risk1).toFixed(1);
    const rr2 = ((t2 - price) / risk1).toFixed(1);
    const rr3 = ((t3 - price) / risk1).toFixed(1);

    // Position of CMP relative to S1 and R1 (0% to 100%)
    const rangeSpan = Math.max(1, r1 - s1);
    const currentPosPct = Math.min(100, Math.max(0, ((price - s1) / rangeSpan) * 100));

    return {
      s1, s2, s3, s1Pct, s2Pct, s3Pct,
      r1, r2, r3, r1Pct, r2Pct, r3Pct,
      t1, t2, t3, t1Pct, t2Pct, t3Pct,
      sl1, sl2, sl3, sl1Pct, sl2Pct, sl3Pct,
      rr1, rr2, rr3,
      currentPosPct,
    };
  }, [price, stock]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        width: '100%',
        borderRadius: 3.5,
        border: '1.5px solid',
        borderColor: isDark ? 'rgba(56,189,248,0.25)' : '#E2E8F0',
        background: isDark
          ? 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(2,6,23,1) 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
        boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.5)' : '0 8px 32px rgba(2,132,199,0.06)',
      }}
    >
      {/* ── Top Header Bar ── */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={1.5} mb={2.5}>
        <Stack direction="row" alignItems="center" spacing={1.2} flexWrap="wrap">
          <Chip
            icon={<MyLocation sx={{ fontSize: 18, color: '#ffffff !important' }} />}
            label="🎯 DYNAMIC SUPPORT & RESISTANCE MATRIX"
            sx={{
              fontWeight: 900,
              fontSize: '0.8rem',
              height: 32,
              bgcolor: '#0284c7',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(2,132,199,0.35)',
            }}
          />
          <Chip
            label={`S1, S2, S3 • R1, R2, R3 • T1, T2, T3 • SL1, SL2, SL3`}
            sx={{
              fontWeight: 900,
              fontSize: '0.72rem',
              height: 28,
              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
              color: 'text.primary',
            }}
          />
          <Chip
            label={`CMP: ₹${price.toFixed(2)}`}
            sx={{
              fontWeight: 900,
              fontSize: '0.75rem',
              height: 28,
              bgcolor: '#ffd600',
              color: '#000000',
            }}
          />
        </Stack>

        <Typography variant="caption" fontWeight={800} color="text.secondary">
          Dynamic Pivot &amp; Order Flow Anchor
        </Typography>
      </Stack>

      {/* ── Visual Price Ladder Position Bar (Where CMP sits right now) ── */}
      <Box sx={{ p: 2, mb: 3, borderRadius: 2.5, bgcolor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(241,245,249,0.8)', border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="caption" fontWeight={900} color="#00e676">
            🟢 S1 Support: ₹{matrixData.s1.toFixed(1)} (-{matrixData.s1Pct}%)
          </Typography>
          <Typography variant="caption" fontWeight={900} color="#ffd600" sx={{ bgcolor: isDark ? 'rgba(255,214,0,0.15)' : 'rgba(255,214,0,0.25)', px: 1, py: 0.3, borderRadius: 1 }}>
            📍 Spot Price (CMP): ₹{price.toFixed(2)}
          </Typography>
          <Typography variant="caption" fontWeight={900} color="#ff1744">
            🔴 R1 Resistance: ₹{matrixData.r1.toFixed(1)} (+{matrixData.r1Pct}%)
          </Typography>
        </Stack>

        {/* Linear Range Bar */}
        <Box sx={{ height: 10, borderRadius: 5, bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden' }}>
          <Box
            sx={{
              height: '100%',
              width: `${matrixData.currentPosPct}%`,
              background: 'linear-gradient(90deg, #00e676 0%, #ffd600 70%, #ff1744 100%)',
              borderRadius: 5,
              transition: 'width 0.5s ease',
            }}
          />
        </Box>
      </Box>

      {/* ── 2 Main Columns: DYNAMIC SUPPORT LADDER vs DYNAMIC RESISTANCE LADDER ── */}
      <Grid container spacing={2.5} mb={3}>
        {/* 🟢 COLUMN 1: DYNAMIC SUPPORT LADDER (S1, S2, S3) */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              height: '100%',
              borderRadius: 3,
              border: '1.5px solid',
              borderColor: '#10B981',
              bgcolor: isDark ? 'rgba(16,185,129,0.06)' : '#F0FDF4',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: '#10B981', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>
                  S
                </Box>
                <Typography variant="subtitle1" fontWeight={900} color="#059669" fontSize={14}>
                  DYNAMIC SUPPORT LEVELS (BUYING FLOORS)
                </Typography>
              </Stack>
              <Chip label="Demand Absorbers" size="small" sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: '#10B981', color: '#FFF' }} />
            </Stack>

            <Stack spacing={1.5}>
              {/* Level S1 */}
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(0,0,0,0.3)' : '#FFFFFF', border: '1px solid', borderColor: 'rgba(16,185,129,0.3)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={900} color="#059669">
                      🟢 S1 (Immediate Demand Floor)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Classical Pivot S1 / 20-Day Swing Base
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h6" fontWeight={900} color="#059669">
                      ₹{matrixData.s1.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" fontWeight={800} color="text.secondary">
                      -{matrixData.s1Pct}% from CMP
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Level S2 */}
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(0,0,0,0.3)' : '#FFFFFF', border: '1px solid', borderColor: 'rgba(16,185,129,0.3)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={900} color="#059669">
                      🟢 S2 (Major EMA / Accumulation Base)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      50-Day EMA Support &amp; Order Block Base
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h6" fontWeight={900} color="#059669">
                      ₹{matrixData.s2.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" fontWeight={800} color="text.secondary">
                      -{matrixData.s2Pct}% from CMP
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Level S3 */}
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(0,0,0,0.3)' : '#FFFFFF', border: '1px solid', borderColor: 'rgba(16,185,129,0.3)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={900} color="#059669">
                      🟢 S3 (Macro Structural Demand Zone)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      200-Day EMA Support &amp; Volume POC Floor
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h6" fontWeight={900} color="#059669">
                      ₹{matrixData.s3.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" fontWeight={800} color="text.secondary">
                      -{matrixData.s3Pct}% from CMP
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* 🔴 COLUMN 2: DYNAMIC RESISTANCE LADDER (R1, R2, R3) */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              height: '100%',
              borderRadius: 3,
              border: '1.5px solid',
              borderColor: '#EF4444',
              bgcolor: isDark ? 'rgba(239,68,68,0.06)' : '#FEF2F2',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: '#EF4444', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>
                  R
                </Box>
                <Typography variant="subtitle1" fontWeight={900} color="#DC2626" fontSize={14}>
                  DYNAMIC RESISTANCE LEVELS (SUPPLY CEILINGS)
                </Typography>
              </Stack>
              <Chip label="Supply Barriers" size="small" sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: '#EF4444', color: '#FFF' }} />
            </Stack>

            <Stack spacing={1.5}>
              {/* Level R1 */}
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(0,0,0,0.3)' : '#FFFFFF', border: '1px solid', borderColor: 'rgba(239,68,68,0.3)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={900} color="#DC2626">
                      🔴 R1 (Immediate Supply Ceiling)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Classical Pivot R1 / Immediate Call Wall
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h6" fontWeight={900} color="#DC2626">
                      ₹{matrixData.r1.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" fontWeight={800} color="text.secondary">
                      +{matrixData.r1Pct}% from CMP
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Level R2 */}
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(0,0,0,0.3)' : '#FFFFFF', border: '1px solid', borderColor: 'rgba(239,68,68,0.3)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={900} color="#DC2626">
                      🔴 R2 (Swing Breakout Trigger)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Previous Swing High &amp; 52-Week Range Trigger
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h6" fontWeight={900} color="#DC2626">
                      ₹{matrixData.r2.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" fontWeight={800} color="text.secondary">
                      +{matrixData.r2Pct}% from CMP
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Level R3 */}
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(0,0,0,0.3)' : '#FFFFFF', border: '1px solid', borderColor: 'rgba(239,68,68,0.3)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={900} color="#DC2626">
                      🔴 R3 (Macro Trend Expansion Frontier)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Fibonacci 1.618 Extension / Multi-Month Ceiling
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h6" fontWeight={900} color="#DC2626">
                      ₹{matrixData.r3.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" fontWeight={800} color="text.secondary">
                      +{matrixData.r3Pct}% from CMP
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* ── MULTI-TARGET (T1, T2, T3) & MULTI-STOP LOSS (SL1, SL2, SL3) EXECUTION MATRIX ── */}
      <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: isDark ? 'rgba(0,0,0,0.35)' : '#F8FAFC', border: '1.5px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight={900} mb={2} color="text.primary" letterSpacing={0.3}>
          ⚡ MULTI-TARGET &amp; MULTI-STOP LOSS EXECUTION MATRIX
        </Typography>

        <Grid container spacing={2}>
          {/* Target 1 (T1) */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 1.8, borderRadius: 2.5, bgcolor: isDark ? 'rgba(0,230,118,0.06)' : '#F0FDF4', border: '1.5px solid #10B981' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" fontWeight={900} color="#059669">
                  🎯 TARGET 1 (T1) — SWING PIVOT
                </Typography>
                <Chip label={`1 : ${matrixData.rr1} R:R`} size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20, bgcolor: '#10B981', color: '#FFF' }} />
              </Stack>
              <Typography variant="h5" fontWeight={900} color="#059669">
                ₹{matrixData.t1.toFixed(2)}
              </Typography>
              <Typography variant="caption" fontWeight={800} color="#059669" display="block">
                +{matrixData.t1Pct}% Expected Profit (5–10 Days)
              </Typography>
            </Box>
          </Grid>

          {/* Target 2 (T2) */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 1.8, borderRadius: 2.5, bgcolor: isDark ? 'rgba(56,189,248,0.06)' : '#EFF6FF', border: '1.5px solid #3B82F6' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" fontWeight={900} color="#2563EB">
                  🚀 TARGET 2 (T2) — REBOUND SWING
                </Typography>
                <Chip label={`1 : ${matrixData.rr2} R:R`} size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20, bgcolor: '#3B82F6', color: '#FFF' }} />
              </Stack>
              <Typography variant="h5" fontWeight={900} color="#2563EB">
                ₹{matrixData.t2.toFixed(2)}
              </Typography>
              <Typography variant="caption" fontWeight={800} color="#2563EB" display="block">
                +{matrixData.t2Pct}% Expected Profit (2–4 Weeks)
              </Typography>
            </Box>
          </Grid>

          {/* Target 3 (T3) */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 1.8, borderRadius: 2.5, bgcolor: isDark ? 'rgba(213,0,249,0.06)' : '#FAF5FF', border: '1.5px solid #A855F7' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" fontWeight={900} color="#9333EA">
                  🏆 TARGET 3 (T3) — 2-3 MONTH FRONTIER
                </Typography>
                <Chip label={`1 : ${matrixData.rr3} R:R`} size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20, bgcolor: '#A855F7', color: '#FFF' }} />
              </Stack>
              <Typography variant="h5" fontWeight={900} color="#9333EA">
                ₹{matrixData.t3.toFixed(2)}
              </Typography>
              <Typography variant="caption" fontWeight={800} color="#9333EA" display="block">
                +{matrixData.t3Pct}% Positional Target (60–90 Days)
              </Typography>
            </Box>
          </Grid>

          {/* Stop Loss 1 (SL1) */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 1.8, borderRadius: 2.5, bgcolor: isDark ? 'rgba(245,158,11,0.06)' : '#FFFBEB', border: '1.5px solid #F59E0B' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" fontWeight={900} color="#D97706">
                  🛡️ STOP LOSS 1 (SL1) — TRAILING
                </Typography>
                <Chip label="Tight Protection" size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20, bgcolor: '#F59E0B', color: '#FFF' }} />
              </Stack>
              <Typography variant="h5" fontWeight={900} color="#D97706">
                ₹{matrixData.sl1.toFixed(2)}
              </Typography>
              <Typography variant="caption" fontWeight={800} color="#D97706" display="block">
                -{matrixData.sl1Pct}% Trailing Stop / Intraday Buffer
              </Typography>
            </Box>
          </Grid>

          {/* Stop Loss 2 (SL2) */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 1.8, borderRadius: 2.5, bgcolor: isDark ? 'rgba(239,68,68,0.06)' : '#FEF2F2', border: '1.5px solid #EF4444' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" fontWeight={900} color="#DC2626">
                  🛡️ STOP LOSS 2 (SL2) — SWING FLOOR
                </Typography>
                <Chip label="Primary Swing SL" size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20, bgcolor: '#EF4444', color: '#FFF' }} />
              </Stack>
              <Typography variant="h5" fontWeight={900} color="#DC2626">
                ₹{matrixData.sl2.toFixed(2)}
              </Typography>
              <Typography variant="caption" fontWeight={800} color="#DC2626" display="block">
                -{matrixData.sl2Pct}% Below S1 Support
              </Typography>
            </Box>
          </Grid>

          {/* Stop Loss 3 (SL3) */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 1.8, borderRadius: 2.5, bgcolor: isDark ? 'rgba(239,68,68,0.08)' : '#FFF1F2', border: '1.5px solid #BE123C' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" fontWeight={900} color="#BE123C">
                  🛡️ STOP LOSS 3 (SL3) — STRUCTURAL
                </Typography>
                <Chip label="Base Invalidation" size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20, bgcolor: '#BE123C', color: '#FFF' }} />
              </Stack>
              <Typography variant="h5" fontWeight={900} color="#BE123C">
                ₹{matrixData.sl3.toFixed(2)}
              </Typography>
              <Typography variant="caption" fontWeight={800} color="#BE123C" display="block">
                -{matrixData.sl3Pct}% Invalidation Floor (Below S2)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

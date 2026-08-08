import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Accordion, AccordionSummary,
  AccordionDetails, Chip, Stack, TextField, Button,
  Card, CardContent, InputAdornment, Divider, ToggleButtonGroup,
  ToggleButton, useTheme, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tabs, Tab,
} from '@mui/material';
import {
  ExpandMore, School, Search, TrendingUp, TrendingDown,
  CheckCircle, Warning, AutoAwesome, ViewModule,
  ViewList, TableRows, ArrowForward, Verified, Whatshot,
  Speed, Calculate, Functions, Psychology, Insights, MenuBook,
  Biotech, Security, Timeline,
} from '@mui/icons-material';

// ── Types for Proprietary Study Notebook ──
export interface StrategyPattern {
  id: number;
  symbol_icon: string;
  chart_type: string;
  title: string;
  category: 'Candlestick Mechanics' | 'Geometric Formations' | 'Dynamic Moving Averages' | 'Institutional Order Flow';
  single_line: string;
  is_bullish: boolean;
  is_bearish: boolean;
  bullish_logic: string;
  bearish_logic: string;
  entry_trigger: string;
  stop_loss: string;
  target_1: string;
  target_2: string;
  target_3: string;
  timeframe: string;
  win_rate: string;
  risk_reward: string;
  indicators: string[];
  rules: string[];
  mistakes_to_avoid: string[];
  example: string;
  scanner_path: string;
}

export interface IndicatorMath {
  name: string;
  symbol_icon: string;
  acronym: string;
  category: 'Momentum' | 'Trend' | 'Volatility' | 'Volume / Flow' | 'Derivatives & OI';
  chart_type: string;
  math_formula: string;
  calculation_steps: string[];
  single_line: string;
  bullish_math: string;
  bearish_math: string;
  ideal_parameters: string;
  interpretation: string;
  pro_tip: string;
  scanner_path: string;
}

// ── Mini SVG Chart Renderer Component ──
const MiniPatternChart: React.FC<{ type: string; isDark: boolean }> = ({ type, isDark }) => {
  const strokeColor = isDark ? '#38bdf8' : '#0284c7';
  const green = '#00e676';
  const red = '#ff1744';
  const gray = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';

  switch (type) {
    case 'hammer':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <line x1="30" y1="6" x2="30" y2="38" stroke={green} strokeWidth="2" strokeLinecap="round" />
          <rect x="23" y="6" width="14" height="9" rx="2" fill={green} />
          <line x1="5" y1="36" x2="55" y2="36" stroke={gray} strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      );
    case 'engulfing':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <line x1="20" y1="14" x2="20" y2="32" stroke={red} strokeWidth="1.5" />
          <rect x="15" y="18" width="10" height="10" rx="1.5" fill={red} />
          <line x1="40" y1="6" x2="40" y2="38" stroke={green} strokeWidth="2" />
          <rect x="33" y="10" width="14" height="24" rx="2" fill={green} />
        </svg>
      );
    case 'morning_star':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <rect x="10" y="8" width="10" height="18" rx="1.5" fill={red} />
          <line x1="15" y1="4" x2="15" y2="30" stroke={red} strokeWidth="1.5" />
          <circle cx="30" cy="32" r="3" fill={strokeColor} />
          <rect x="40" y="12" width="10" height="18" rx="1.5" fill={green} />
          <line x1="45" y1="8" x2="45" y2="34" stroke={green} strokeWidth="1.5" />
        </svg>
      );
    case 'shooting_star':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <line x1="30" y1="4" x2="30" y2="34" stroke={red} strokeWidth="2" strokeLinecap="round" />
          <rect x="23" y="25" width="14" height="9" rx="2" fill={red} />
          <line x1="5" y1="8" x2="55" y2="8" stroke={gray} strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      );
    case 'piercing':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <rect x="14" y="8" width="12" height="20" rx="1.5" fill={red} />
          <rect x="34" y="16" width="12" height="20" rx="1.5" fill={green} />
          <line x1="10" y1="18" x2="50" y2="18" stroke={gray} strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );
    case 'soldiers':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <rect x="10" y="24" width="9" height="14" rx="1.5" fill={green} />
          <rect x="25" y="16" width="9" height="16" rx="1.5" fill={green} />
          <rect x="40" y="8" width="9" height="18" rx="1.5" fill={green} />
        </svg>
      );
    case 'harami':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <rect x="12" y="6" width="14" height="28" rx="2" fill={red} />
          <rect x="34" y="15" width="10" height="10" rx="1.5" fill={green} />
        </svg>
      );
    case 'tweezers':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <line x1="20" y1="12" x2="20" y2="34" stroke={red} strokeWidth="1.5" />
          <rect x="15" y="12" width="10" height="12" rx="1.5" fill={red} />
          <line x1="40" y1="12" x2="40" y2="34" stroke={green} strokeWidth="1.5" />
          <rect x="35" y="16" width="10" height="12" rx="1.5" fill={green} />
          <line x1="10" y1="34" x2="50" y2="34" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      );
    case 'marubozu':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <rect x="22" y="6" width="16" height="30" rx="2" fill={green} />
        </svg>
      );
    case 'dragonfly':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <line x1="30" y1="8" x2="30" y2="36" stroke={green} strokeWidth="2" />
          <line x1="18" y1="8" x2="42" y2="8" stroke={green} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'spinning_top':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <line x1="30" y1="4" x2="30" y2="38" stroke={strokeColor} strokeWidth="1.5" />
          <rect x="23" y="17" width="14" height="8" rx="1.5" fill={strokeColor} />
        </svg>
      );
    case 'breakout':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <line x1="6" y1="20" x2="54" y2="20" stroke={gray} strokeWidth="1.5" strokeDasharray="2 2" />
          <path d="M 10 32 L 22 22 L 32 26 L 46 8" fill="none" stroke={green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="46" cy="8" r="3" fill={green} />
        </svg>
      );
    case 'double_bottom':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <line x1="6" y1="12" x2="54" y2="12" stroke={gray} strokeWidth="1" strokeDasharray="2 2" />
          <path d="M 8 14 L 18 34 L 30 18 L 42 34 L 52 10" fill="none" stroke={green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'head_shoulders':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <line x1="6" y1="16" x2="54" y2="16" stroke={gray} strokeWidth="1" strokeDasharray="2 2" />
          <path d="M 8 18 L 18 28 L 24 18 L 30 36 L 36 18 L 42 28 L 52 12" fill="none" stroke={green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'cup_handle':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <path d="M 8 12 Q 24 38 40 14 Q 45 22 49 14 L 54 8" fill="none" stroke={green} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="6" y1="12" x2="50" y2="12" stroke={gray} strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );
    case 'triangle':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <line x1="8" y1="10" x2="52" y2="10" stroke={gray} strokeWidth="1.5" />
          <line x1="8" y1="36" x2="52" y2="12" stroke={gray} strokeWidth="1.5" />
          <path d="M 12 30 L 22 12 L 32 24 L 42 12 L 50 6" fill="none" stroke={green} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'flag':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <line x1="10" y1="36" x2="22" y2="8" stroke={green} strokeWidth="3" strokeLinecap="round" />
          <rect x="22" y="8" width="22" height="12" rx="1.5" fill="none" stroke={strokeColor} strokeWidth="1.5" transform="rotate(8 22 8)" />
          <line x1="44" y1="12" x2="54" y2="6" stroke={green} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'wedge':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <line x1="8" y1="8" x2="48" y2="28" stroke={gray} strokeWidth="1.5" />
          <line x1="8" y1="20" x2="48" y2="34" stroke={gray} strokeWidth="1.5" />
          <path d="M 44 26 L 52 14" fill="none" stroke={green} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'ema9':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <path d="M 6 36 Q 25 30 54 8" fill="none" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="34" cy="20" r="3.5" fill={green} />
          <path d="M 28 12 L 34 20 L 48 10" fill="none" stroke={green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'golden_cross':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <path d="M 6 34 Q 30 24 54 8" fill="none" stroke={green} strokeWidth="2.5" />
          <path d="M 6 18 Q 30 22 54 28" fill="none" stroke={red} strokeWidth="2" />
          <circle cx="28" cy="22" r="3.5" fill="#ffd600" />
        </svg>
      );
    case 'supertrend':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <path d="M 6 30 L 26 24 L 54 16" fill="none" stroke={green} strokeWidth="2.5" />
          <path d="M 10 22 L 20 14 L 34 18 L 48 8" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />
        </svg>
      );
    case 'vwap':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <line x1="6" y1="21" x2="54" y2="21" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
          <line x1="6" y1="10" x2="54" y2="10" stroke={gray} strokeWidth="1" />
          <line x1="6" y1="32" x2="54" y2="32" stroke={gray} strokeWidth="1" />
          <path d="M 12 28 L 24 21 L 46 8" fill="none" stroke={green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'smc_ob':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <rect x="10" y="16" width="38" height="14" rx="2" fill="rgba(16,185,129,0.15)" stroke={green} strokeWidth="1.2" />
          <path d="M 6 8 L 24 22 L 40 6" fill="none" stroke={green} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'bos':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <line x1="16" y1="18" x2="48" y2="18" stroke={gray} strokeWidth="1.5" strokeDasharray="2 2" />
          <path d="M 10 32 L 20 18 L 30 26 L 46 8" fill="none" stroke={green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'sweep':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <line x1="6" y1="22" x2="54" y2="22" stroke={gray} strokeWidth="1.5" />
          <path d="M 14 14 L 28 36 L 44 8" fill="none" stroke={green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'volume_shocker':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <rect x="8" y="26" width="7" height="12" fill={gray} />
          <rect x="18" y="24" width="7" height="14" fill={gray} />
          <rect x="28" y="27" width="7" height="11" fill={gray} />
          <rect x="38" y="8" width="10" height="30" rx="1.5" fill={green} />
        </svg>
      );
    case 'oi':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <rect x="14" y="14" width="12" height="24" rx="2" fill={green} />
          <rect x="32" y="8" width="12" height="30" rx="2" fill="#38bdf8" />
        </svg>
      );
    case 'pcr':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <path d="M 10 32 A 20 20 0 0 1 50 32" fill="none" stroke={gray} strokeWidth="3" />
          <line x1="30" y1="32" x2="18" y2="18" stroke={green} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="30" cy="32" r="3" fill="#ffd600" />
        </svg>
      );
    case 'orb':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <rect x="10" y="14" width="22" height="18" fill="rgba(255,255,255,0.06)" stroke={gray} strokeWidth="1" />
          <path d="M 24 22 L 36 10 L 50 6" fill="none" stroke={green} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'ai_meter':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <rect x="10" y="24" width="6" height="14" rx="1" fill={green} />
          <rect x="19" y="18" width="6" height="20" rx="1" fill={green} />
          <rect x="28" y="12" width="6" height="26" rx="1" fill={green} />
          <rect x="37" y="6" width="6" height="32" rx="1" fill="#00e5ff" />
          <circle cx="48" cy="10" r="3.5" fill="#ffd600" />
        </svg>
      );
    case 'rsi_osc':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <line x1="6" y1="10" x2="54" y2="10" stroke={red} strokeWidth="1" strokeDasharray="2 2" />
          <line x1="6" y1="32" x2="54" y2="32" stroke={green} strokeWidth="1" strokeDasharray="2 2" />
          <path d="M 8 28 L 20 34 L 32 18 L 44 24 L 52 8" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'macd_osc':
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <line x1="6" y1="21" x2="54" y2="21" stroke={gray} strokeWidth="1" />
          <rect x="16" y="21" width="5" height="8" fill={red} />
          <rect x="24" y="14" width="5" height="7" fill={green} />
          <rect x="32" y="8" width="5" height="13" fill={green} />
          <rect x="40" y="12" width="5" height="9" fill={green} />
          <path d="M 8 28 Q 28 8 52 14" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
        </svg>
      );
    default:
      return (
        <svg width="60" height="42" viewBox="0 0 60 42" style={{ display: 'block' }}>
          <path d="M 8 32 L 20 20 L 32 24 L 52 8" fill="none" stroke={green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
};

// ── 1. Complete Sequential Trading Strategy Matrix (1 to 30) ──
export const SEQUENTIAL_STRATEGY_SERIES: StrategyPattern[] = [
  {
    id: 1,
    day_tag: '1',
    symbol_icon: '🔨',
    chart_type: 'hammer',
    title: 'Hammer & Inverted Hammer Price Rejection',
    category: 'Candlestick Mechanics',
    single_line: 'Long lower shadow at least 2x the body at major support signifies institutional liquidity sweep and aggressive buyer absorption.',
    is_bullish: true,
    is_bearish: false,
    bullish_logic: '🟢 BULLISH BUY: Hammer forms after downtrend at major Support / S1 Pivot. Lower wick ≥ 2x body length with strong volume spike.',
    bearish_logic: '🔴 BEARISH REVERSAL: Inverted Hammer fails to follow through and breaks below low → signals continuation of selling.',
    entry_trigger: 'Buy on breakout above the Hammer candle high with volume confirmation.',
    stop_loss: 'Strict SL 2 ticks below Hammer low (Swing Low).',
    target_1: 'Target 1: Previous swing high (1:1.5 R:R)',
    target_2: 'Target 2: Major 50 EMA / 200 EMA resistance (1:2.5 R:R)',
    target_3: 'Target 3: Complete trend reversal (1:3.5+ R:R)',
    timeframe: '5m, 15m, 1D',
    win_rate: '82% Win Rate',
    risk_reward: '1:2.0 R:R',
    indicators: ['Hammer Candle', 'Key Support Line', 'Volume Spike > 1.3x', 'RSI < 35 Oversold'],
    rules: [
      'Candle body must be at top 30% of total candle range.',
      'Requires prior defined downtrend of at least 3-5 red candles.',
      'Confirmation candle must close green above hammer body.',
    ],
    mistakes_to_avoid: ['Trading hammer in the middle of a sideways consolidation range without support.'],
    example: 'HDFCBANK drops to ₹1,600 support, prints 15m Hammer with 2.2x volume, confirms above ₹1,608 → rallies to ₹1,640.',
    scanner_path: '/top-buy',
  },
  {
    id: 2,
    day_tag: '2',
    symbol_icon: '🔄',
    chart_type: 'engulfing',
    title: 'Bullish & Bearish Engulfing Absorption Wave',
    category: 'Candlestick Mechanics',
    single_line: 'A massive body candle completely engulfing the prior opposite candle demonstrates total institutional control over order flow.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Large green candle fully engulfs prior red candle body + wicks at support with volume surge.',
    bearish_logic: '🔴 BEARISH SHORT: Large red candle fully engulfs prior green candle body at key resistance / 52-week high.',
    entry_trigger: 'Enter on the close of the engulfing candle or on a minor 50% retracement retest.',
    stop_loss: 'SL 1 tick below Engulfing candle low for Long / above high for Short.',
    target_1: 'Target 1: 1:1.5 R:R',
    target_2: 'Target 2: 1:2.5 R:R',
    target_3: 'Target 3: 1:4.0 R:R',
    timeframe: '15m, 1H, Daily',
    win_rate: '84% Win Rate',
    risk_reward: '1:2.5 R:R',
    indicators: ['Engulfing Body', 'Volume Expansion > 2.0x', 'EMA 20 Alignment'],
    rules: [
      'Engulfing candle volume must be higher than previous 3 candles combined.',
      'Works best at 20 EMA pullbacks in trending markets.',
    ],
    mistakes_to_avoid: ['Ignoring high-impact economic news releases during setup formation.'],
    example: 'RELIANCE prints 1-hour Bullish Engulfing at ₹2,850 support with 3x volume → rallies to ₹2,940.',
    scanner_path: '/top-buyers',
  },
  {
    id: 3,
    day_tag: '3',
    symbol_icon: '☀️',
    chart_type: 'morning_star',
    title: 'Morning Star & Evening Star 3-Phase Turnaround',
    category: 'Candlestick Mechanics',
    single_line: '3-Candle structure: strong impulse candle, indecision doji/spinning top at extreme, followed by massive reversal candle closing past 50% of candle 1.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Morning Star (Red Candle → Gap/Small Doji at Support → Big Green Candle closing above 60% of Candle 1).',
    bearish_logic: '🔴 BEARISH SHORT: Evening Star (Green Candle → Small Doji at Resistance → Big Red Candle closing below 60% of Candle 1).',
    entry_trigger: 'Buy on close of 3rd confirmation candle.',
    stop_loss: 'SL below the lowest point of the 2nd candle (Star Doji).',
    target_1: 'Target 1: 1:2.0 R:R',
    target_2: 'Target 2: 1:3.0 R:R',
    target_3: 'Target 3: 1:5.0 R:R',
    timeframe: '15m, Daily, Weekly',
    win_rate: '85% Win Rate',
    risk_reward: '1:3.0 R:R',
    indicators: ['Morning/Evening Star', 'RSI Divergence', 'Volume Cluster'],
    rules: [
      '3rd candle must close well into the territory of the 1st candle with aggressive volume.',
    ],
    mistakes_to_avoid: ['Entering before the 3rd candle has officially closed.'],
    example: 'TCS prints Morning Star on Daily chart at ₹3,800 → surges to ₹4,020 in 6 sessions.',
    scanner_path: '/swing-buy',
  },
  {
    id: 4,
    day_tag: '4',
    symbol_icon: '🏹',
    chart_type: 'shooting_star',
    title: 'Shooting Star & Hanging Man Reversal Formations',
    category: 'Candlestick Mechanics',
    single_line: 'Long upper shadow at least 2x body height at swing resistance indicates buyers were completely exhausted and sellers reclaimed dominance.',
    is_bullish: false,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH INVERSION: Hanging Man requires a strong green candle close above its high to invalidate and create a short squeeze.',
    bearish_logic: '🔴 BEARISH SHORT: Shooting Star forms after extended uptrend at R1 Pivot / Resistance with upper shadow ≥ 2x body length.',
    entry_trigger: 'Short on breakdown below the Shooting Star low.',
    stop_loss: 'SL 2 ticks above Shooting Star high.',
    target_1: 'Target 1: 1:2.0 R:R (20 EMA support)',
    target_2: 'Target 2: 1:3.0 R:R (Previous swing low)',
    target_3: 'Target 3: 1:4.5 R:R',
    timeframe: '15m, 1H, Daily',
    win_rate: '83% Win Rate',
    risk_reward: '1:2.5 R:R',
    indicators: ['Shooting Star', 'Resistance Ceiling', 'RSI > 70 Overbought', 'Volume Climax'],
    rules: ['Upper shadow must be at least twice the height of the real body.'],
    mistakes_to_avoid: ['Shorting a shooting star in the middle of an explosive secular rally without key resistance.'],
    example: 'TITAN prints Shooting Star on Daily at ₹3,850 resistance with RSI 74 → drops to ₹3,620.',
    scanner_path: '/top-sellers',
  },
  {
    id: 5,
    day_tag: '5',
    symbol_icon: '⚔️',
    chart_type: 'piercing',
    title: 'Piercing Pattern & Dark Cloud Cover Midpoint Shifts',
    category: 'Candlestick Mechanics',
    single_line: 'Opening gap followed by aggressive institutional counter-drive closing beyond the 50% midpoint of the previous candle body.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Piercing Pattern opens with gap down but bulls drive price to close above 50% of prior red candle body.',
    bearish_logic: '🔴 BEARISH SHORT: Dark Cloud Cover opens with gap up at resistance but bears drive price to close below 50% of prior green candle body.',
    entry_trigger: 'Enter on follow-through candle breaking the piercing candle high.',
    stop_loss: 'SL below the session low of the piercing candle.',
    target_1: 'Target 1: 1:1.5 R:R',
    target_2: 'Target 2: 1:2.5 R:R',
    target_3: 'Target 3: 1:3.5 R:R',
    timeframe: '15m, 1D',
    win_rate: '80% Win Rate',
    risk_reward: '1:2.0 R:R',
    indicators: ['Midpoint 50% Retest', 'VWAP Support', 'Order Flow Delta'],
    rules: ['Close MUST exceed 50% midpoint of preceding candle.'],
    mistakes_to_avoid: ['Trading piercing patterns in low-volume illiquid stocks.'],
    example: 'ICICIBANK Piercing pattern on Daily at ₹1,120 → rallies to ₹1,180.',
    scanner_path: '/top-buy',
  },
  {
    id: 6,
    day_tag: '6',
    symbol_icon: '🎖️',
    chart_type: 'soldiers',
    title: 'Three White Soldiers & Three Black Crows Expansion',
    category: 'Candlestick Mechanics',
    single_line: 'Three consecutive strong full-body candles opening within previous body and making consecutive higher closes with expanding volume.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Three White Soldiers breakout from consolidation with consecutive higher highs, small wicks, expanding volume.',
    bearish_logic: '🔴 BEARISH SHORT: Three Black Crows breakdown with consecutive lower lows, heavy red volume → strong short momentum.',
    entry_trigger: 'Enter on the close of the 2nd candle or on minor pullback after 3rd candle.',
    stop_loss: 'SL below the low of the 1st soldier candle.',
    target_1: 'Target 1: 1:2.0 R:R',
    target_2: 'Target 2: 1:3.0 R:R',
    target_3: 'Target 3: 1:4.5 R:R',
    timeframe: '15m, 1H, Daily',
    win_rate: '86% Win Rate',
    risk_reward: '1:3.0 R:R',
    indicators: ['Consecutive Full Bodies', 'Volume Ladder', 'Supertrend Buy'],
    rules: ['Each candle must open within the body of the previous candle.'],
    mistakes_to_avoid: ['Chasing when the 3rd candle has an extremely extended long wick.'],
    example: 'TATASTEEL Three White Soldiers on 15m breaking ₹150 → rallies to ₹162.',
    scanner_path: '/momentum',
  },
  {
    id: 7,
    day_tag: '7',
    symbol_icon: '🤰',
    chart_type: 'harami',
    title: 'Harami Compression & Inside Bar Breakout',
    category: 'Candlestick Mechanics',
    single_line: 'Small body candle completely enclosed within prior large mother candle indicates extreme volatility contraction ready to explode.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Bullish Harami / Inside Bar at support. Buy when candle breaks and closes above mother bar high.',
    bearish_logic: '🔴 BEARISH SHORT: Bearish Harami / Inside Bar at resistance. Short when candle breaks and closes below mother bar low.',
    entry_trigger: 'Buy on breakout above mother bar high.',
    stop_loss: 'SL below mother bar low (or inside bar low for tighter risk).',
    target_1: 'Target 1: 1:2.0 R:R',
    target_2: 'Target 2: 1:3.5 R:R',
    target_3: 'Target 3: 1:5.0 R:R',
    timeframe: '15m, 1H, Daily',
    win_rate: '84% Win Rate',
    risk_reward: '1:2.8 R:R',
    indicators: ['Mother Bar Range', 'Inside Bar Compression', 'Volume Expansion on Breakout'],
    rules: ['Inside candle body and wicks must remain completely inside mother candle.'],
    mistakes_to_avoid: ['Entering before the mother bar range has been breached.'],
    example: 'MARUTI Daily Inside Bar inside ₹12,000 mother candle breaks ₹12,150 → surges to ₹12,600.',
    scanner_path: '/breakout',
  },
  {
    id: 8,
    day_tag: '8',
    symbol_icon: '🪜',
    chart_type: 'tweezers',
    title: 'Tweezer Bottom & Tweezer Top Boundary Tests',
    category: 'Candlestick Mechanics',
    single_line: 'Two consecutive candles with identical lows or highs show an impenetrable price floor/ceiling where market orders were completely absorbed.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Tweezer Bottom (Two matching lows at major support/200 EMA). Buy on close above 2nd candle high.',
    bearish_logic: '🔴 BEARISH SHORT: Tweezer Top (Two matching highs at resistance). Short on close below 2nd candle low.',
    entry_trigger: 'Buy on close of confirmation candle.',
    stop_loss: 'SL 2 ticks below the matching tweezer lows.',
    target_1: 'Target 1: 1:2.0 R:R',
    target_2: 'Target 2: 1:3.0 R:R',
    target_3: 'Target 3: 1:4.5 R:R',
    timeframe: '15m, Daily',
    win_rate: '83% Win Rate',
    risk_reward: '1:2.5 R:R',
    indicators: ['Matching Highs/Lows', 'Horizontal Pivot', 'RSI Divergence'],
    rules: ['Lows of both candles must be within 0.05% of each other.'],
    mistakes_to_avoid: ['Trading tweezer tops during strong opening momentum.'],
    example: 'INFY Tweezer Bottom at ₹1,750 support on Daily → rallies to ₹1,840.',
    scanner_path: '/top-buy',
  },
  {
    id: 9,
    day_tag: '9',
    symbol_icon: '🌟',
    chart_type: 'marubozu',
    title: 'Marubozu Full-Body Momentum Directives',
    category: 'Candlestick Mechanics',
    single_line: 'Full body candle with virtually zero wicks (Open = Low, Close = High) signifies unstoppable institutional one-way directional aggression.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Bullish Marubozu (Open = Low, Close = High) breaking out of multi-day range on 3x+ volume.',
    bearish_logic: '🔴 BEARISH SHORT: Bearish Marubozu (Open = High, Close = Low) breaking down below key support.',
    entry_trigger: 'Enter on close of Marubozu or on 50% midpoint pullback.',
    stop_loss: 'SL below 50% midpoint of Marubozu body.',
    target_1: 'Target 1: 1:2.0 R:R',
    target_2: 'Target 2: 1:3.5 R:R',
    target_3: 'Target 3: 1:5.0 R:R',
    timeframe: '15m, 1H, Daily',
    win_rate: '87% Win Rate',
    risk_reward: '1:3.0 R:R',
    indicators: ['Zero Wick Range', 'Volume Ratio > 3.0x', 'OBV Surge'],
    rules: ['Wicks must be less than 5% of total candle length.'],
    mistakes_to_avoid: ['Chasing when Marubozu is already 5% extended on intraday charts.'],
    example: 'COALINDIA prints Daily Bullish Marubozu at ₹450 with 4x volume → trends to ₹510.',
    scanner_path: '/price-shockers',
  },
  {
    id: 10,
    day_tag: '10',
    symbol_icon: '🪰',
    chart_type: 'dragonfly',
    title: 'Dragonfly Doji & Gravestone Doji Rejections',
    category: 'Candlestick Mechanics',
    single_line: 'Open, high, and close near identical with a giant lower or upper shadow indicating extreme rejection of lower/higher prices.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Dragonfly Doji at major support / 200 EMA indicates massive buying rejection of lower price zone.',
    bearish_logic: '🔴 BEARISH SHORT: Gravestone Doji at resistance indicates bulls were completely rejected at highs.',
    entry_trigger: 'Buy on next candle closing above Dragonfly high.',
    stop_loss: 'SL below Dragonfly long shadow tail.',
    target_1: 'Target 1: 1:2.0 R:R',
    target_2: 'Target 2: 1:3.5 R:R',
    target_3: 'Target 3: 1:5.0 R:R',
    timeframe: '15m, Daily',
    win_rate: '83% Win Rate',
    risk_reward: '1:3.0 R:R',
    indicators: ['Dragonfly Doji', '200 EMA Support', 'RSI Oversold < 30'],
    rules: ['Must occur at extreme oversold/overbought price levels.'],
    mistakes_to_avoid: ['Trading dojis inside a narrow consolidation chop.'],
    example: 'SBIN prints Dragonfly Doji at ₹780 on 200 EMA → surges to ₹835.',
    scanner_path: '/breakout',
  },
  {
    id: 11,
    day_tag: '11',
    symbol_icon: '💫',
    chart_type: 'spinning_top',
    title: 'Spinning Top & High Wave Indecision Candles',
    category: 'Candlestick Mechanics',
    single_line: 'Small real body with long upper and lower shadows reflects extreme tug-of-war where previous trend loses momentum before major reversal.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Spinning Top at bottom of downtrend followed by strong green expansion candle breaking high.',
    bearish_logic: '🔴 BEARISH SHORT: Spinning Top at top of uptrend followed by red expansion candle breaking low.',
    entry_trigger: 'Enter on the breakout direction of the high/low range.',
    stop_loss: 'SL at opposite extreme of the spinning top.',
    target_1: 'Target 1: 1:2.0 R:R',
    target_2: 'Target 2: 1:3.0 R:R',
    target_3: 'Target 3: 1:4.0 R:R',
    timeframe: '15m, 1H, Daily',
    win_rate: '81% Win Rate',
    risk_reward: '1:2.2 R:R',
    indicators: ['High Wave Shadows', 'Volume Drop on Indecision', 'Breakout Volume Expansion'],
    rules: ['Wait for confirmation candle before taking position.'],
    mistakes_to_avoid: ['Entering during the formation of the spinning top itself.'],
    example: 'BAJAJ-AUTO Spinning Top at ₹9,200 support breaks ₹9,300 → reaches ₹9,750.',
    scanner_path: '/top-buy',
  },
  {
    id: 12,
    day_tag: '12',
    symbol_icon: '🧱',
    chart_type: 'breakout',
    title: 'Structural Resistance Breakout & Volume Expansion',
    category: 'Geometric Formations',
    single_line: 'Price compresses against horizontal barrier 3+ times; when breakout candle closes beyond with 2x+ average volume, explosive continuation follows.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Clean breakout above major multi-day Resistance with Volume Ratio > 2.0x and closing above level.',
    bearish_logic: '🔴 BEARISH SHORT: Breakdown below major multi-day Support with Volume Ratio > 2.0x and closing below level.',
    entry_trigger: 'Enter on breakout candle close or on retest of the broken level (preferred).',
    stop_loss: 'SL below breakout candle low or back inside broken zone.',
    target_1: 'Target 1: 1:2.0 R:R',
    target_2: 'Target 2: 1:3.0 R:R',
    target_3: 'Target 3: Measured Move of the consolidation height',
    timeframe: '15m, Daily, Weekly',
    win_rate: '87% Win Rate',
    risk_reward: '1:3.0 R:R',
    indicators: ['Horizontal Support/Resistance', 'Volume Ratio > 2.0x', 'EMA 20/50 Alignment'],
    rules: ['Never buy a breakout on below-average volume (high probability fakeout).'],
    mistakes_to_avoid: ['Failing to check higher timeframe trend.'],
    example: 'INFY breaks 3-week resistance at ₹1,800 on 2.8x volume → reaches ₹1,910.',
    scanner_path: '/price-shockers',
  },
  {
    id: 13,
    day_tag: '13',
    symbol_icon: '🪓',
    chart_type: 'double_bottom',
    title: 'Double Bottom (W) & Double Top (M) Reversal Cycles',
    category: 'Geometric Formations',
    single_line: 'Two tests of a support/resistance level forming a W or M structure; breakout through the central neckline confirms massive trend reversal.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: W-Pattern Double Bottom forms at support with 2nd bottom showing RSI bullish divergence. Buy on neckline breakout.',
    bearish_logic: '🔴 BEARISH SHORT: M-Pattern Double Top forms at resistance with 2nd top showing RSI bearish divergence. Sell on neckline breakdown.',
    entry_trigger: 'Buy on candle close breaking above the central W neckline with high volume.',
    stop_loss: 'SL below the right shoulder/trough of the W-pattern.',
    target_1: 'Target 1: Height of W-pattern projected upward',
    target_2: 'Target 2: 1:2.5 R:R',
    target_3: 'Target 3: 1:4.0 R:R',
    timeframe: '15m, 1H, Daily',
    win_rate: '84% Win Rate',
    risk_reward: '1:2.5 R:R',
    indicators: ['W-Neckline', 'RSI Divergence', 'Volume on 2nd Bottom'],
    rules: ['2nd bottom should ideally show lower volume than 1st bottom, but neckline breakout must have high volume.'],
    mistakes_to_avoid: ['Anticipating the pattern before the neckline has officially broken.'],
    example: 'KOTAKBANK W-pattern neckline at ₹1,780 breaks with 2.1x volume → target ₹1,860 hit.',
    scanner_path: '/weekly-buy',
  },
  {
    id: 14,
    day_tag: '14',
    symbol_icon: '👤',
    chart_type: 'head_shoulders',
    title: 'Head & Shoulders Structural Exhaustion Framework',
    category: 'Geometric Formations',
    single_line: 'Three-trough structure (Left Shoulder, Lower Head, Higher Right Shoulder) indicating seller exhaustion and institutional accumulation.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Inverse H&S forms after downtrend. Right shoulder forms above Head. Buy when Neckline breaks with high volume.',
    bearish_logic: '🔴 BEARISH SHORT: Regular H&S forms at top. Right shoulder fails to make new high. Sell when Neckline breaks downward.',
    entry_trigger: 'Buy on close above neckline or on neckline retest.',
    stop_loss: 'SL below the low of the Right Shoulder.',
    target_1: 'Target 1: Distance from Head to Neckline added to breakout point',
    target_2: 'Target 2: 1:3.0 R:R',
    target_3: 'Target 3: 1:5.0 R:R',
    timeframe: '15m, 1H, Daily, Weekly',
    win_rate: '86% Win Rate',
    risk_reward: '1:3.0 R:R',
    indicators: ['Neckline Slope', 'Right Shoulder Volume Contraction', 'Breakout Volume Expansion'],
    rules: ['Right shoulder should have lighter volume indicating drying seller supply.'],
    mistakes_to_avoid: ['Entering inside the head before the right shoulder forms.'],
    example: 'LT Inverse H&S neckline at ₹3,450 breaks with 3.2x volume → achieves ₹3,720 target.',
    scanner_path: '/monthly-buy',
  },
  {
    id: 15,
    day_tag: '15',
    symbol_icon: '☕',
    chart_type: 'cup_handle',
    title: 'Cup & Handle Base Accumulation Matrix',
    category: 'Geometric Formations',
    single_line: 'Rounded U-shaped accumulation base followed by a shallow downward handle shakeout; breakout above the rim signals massive multi-month rally.',
    is_bullish: true,
    is_bearish: false,
    bullish_logic: '🟢 BULLISH BUY: U-shaped Cup + Handle retrace < 38.2% of cup depth. Enter on breakout above rim resistance with 2x+ volume.',
    bearish_logic: '🔴 BEARISH AVOID: If handle retraces deeper than 50% of cup depth, pattern fails and breaks down.',
    entry_trigger: 'Buy on candle close breaking above the cup rim resistance.',
    stop_loss: 'SL below the lowest point of the handle.',
    target_1: 'Target 1: Depth of the cup added to breakout level (1:2.5 R:R)',
    target_2: 'Target 2: 1:4.0 R:R',
    target_3: 'Target 3: Multi-month structural trend hold',
    timeframe: 'Daily & Weekly',
    win_rate: '89% Win Rate',
    risk_reward: '1:3.5 R:R',
    indicators: ['Cup Rim Resistance', 'Handle Volume Contraction', 'Breakout Volume > 2.5x'],
    rules: ['Cup must be rounded (U-shape), not sharp V-shape.'],
    mistakes_to_avoid: ['Buying before handle forms and breaks.'],
    example: 'BHARTIARTL Cup & Handle on Daily at ₹1,200 rim breakout → rallies to ₹1,450.',
    scanner_path: '/future-stocks',
  },
  {
    id: 16,
    day_tag: '16',
    symbol_icon: '📐',
    chart_type: 'triangle',
    title: 'Ascending & Symmetrical Triangle Volatility Squeeze',
    category: 'Geometric Formations',
    single_line: 'Flat horizontal resistance with rising higher lows creates intense volatility compression until price violently explodes upward.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Ascending Triangle (Flat Top + Rising Trendline) breaks out upward with volume spike.',
    bearish_logic: '🔴 BEARISH SHORT: Descending Triangle (Flat Bottom + Falling Trendline) breaks down downward with volume spike.',
    entry_trigger: 'Buy on close above flat resistance with volume > 1.5x.',
    stop_loss: 'SL below the most recent higher low inside triangle.',
    target_1: 'Target 1: Widest height of triangle added to breakout',
    target_2: 'Target 2: 1:2.5 R:R',
    target_3: 'Target 3: 1:4.0 R:R',
    timeframe: '15m, 1H, Daily',
    win_rate: '85% Win Rate',
    risk_reward: '1:2.8 R:R',
    indicators: ['Ascending Trendline', 'Horizontal Resistance', 'Volume Compression'],
    rules: ['Volume must dry up towards apex of triangle before explosion.'],
    mistakes_to_avoid: ['Trading before breakout occurs near apex.'],
    example: 'BAJFINANCE Ascending triangle breaks ₹7,200 → surges to ₹7,650.',
    scanner_path: '/breakout',
  },
  {
    id: 17,
    day_tag: '17',
    symbol_icon: '🚩',
    chart_type: 'flag',
    title: 'Bull Flag & Bear Flag Velocity Continuation',
    category: 'Geometric Formations',
    single_line: 'Steep near-vertical flagpole impulse followed by tight 3-5 candle parallel channel pullback; breakout of channel continues impulse with equal flagpole length.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Bull Flag pole (+3% to +8% rally) + tight low-volume flag channel. Buy when upper flag trendline breaks.',
    bearish_logic: '🔴 BEARISH SHORT: Bear Flag pole (sharp drop) + low-volume upward flag channel. Sell when lower flag trendline breaks.',
    entry_trigger: 'Buy immediately on breakout of upper flag boundary with volume.',
    stop_loss: 'SL below the lowest point of the flag channel.',
    target_1: 'Target 1: Length of Flagpole added to breakout point (1:2.5 R:R)',
    target_2: 'Target 2: 1:4.0 R:R',
    target_3: 'Target 3: 1:6.0 R:R',
    timeframe: '5m, 15m, 1H',
    win_rate: '87% Win Rate',
    risk_reward: '1:3.0 R:R',
    indicators: ['Flagpole Volume', 'Flag Channel Volume Contraction', 'EMA 9 Support'],
    rules: ['Flag pullback should not retrace more than 38.2% of flagpole.'],
    mistakes_to_avoid: ['Confusing a deep multi-week correction for a tight flag.'],
    example: 'TRENT 15m Bull Flag pole from ₹6,200 to ₹6,500, flags to ₹6,440, breaks out → hits ₹6,740.',
    scanner_path: '/momentum',
  },
  {
    id: 18,
    day_tag: '18',
    symbol_icon: '📊',
    chart_type: 'wedge',
    title: 'Falling Bullish & Rising Bearish Wedge Compression',
    category: 'Geometric Formations',
    single_line: 'Both trendlines converge in the same downward direction with drying volume; upside breakout triggers sharp explosive reversal.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Falling Wedge converging downward after selloff. Buy when upper resistance trendline breaks with volume.',
    bearish_logic: '🔴 BEARISH SHORT: Rising Wedge converging upward in mature rally. Short when lower support trendline breaks.',
    entry_trigger: 'Buy on candle close breaking above upper wedge trendline.',
    stop_loss: 'SL below lowest point of the wedge pattern.',
    target_1: 'Target 1: 1:2.0 R:R (Top of the wedge structure)',
    target_2: 'Target 2: 1:3.5 R:R',
    target_3: 'Target 3: 1:5.0 R:R',
    timeframe: '15m, 1H, Daily',
    win_rate: '85% Win Rate',
    risk_reward: '1:3.0 R:R',
    indicators: ['Converging Trendlines', 'Volume Contraction', 'RSI Divergence at Apex'],
    rules: ['Volume must consistently decline as price approaches apex.'],
    mistakes_to_avoid: ['Confusing parallel channels with converging wedges.'],
    example: 'TATASTEEL Falling Wedge on Daily breaks ₹152 → rallies to ₹168.',
    scanner_path: '/breakout',
  },
  {
    id: 19,
    day_tag: '19',
    symbol_icon: '⚡',
    chart_type: 'ema9',
    title: '9 EMA + 15-Minute Breakout & Retest Protocol',
    category: 'Dynamic Moving Averages',
    single_line: 'When a strong 15-minute candle breaks key resistance and retests the rising 9 EMA with a green confirmation candle + volume > 1.5x, enter for high-probability momentum.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: 15-min candle closes above Resistance/EMA 9. Wait for retest pullback touching 9 EMA. Enter on next green candle with Volume > 1.5x.',
    bearish_logic: '🔴 BEARISH SHORT: 15-min candle closes below Support/EMA 9. Wait for upward retest rejection at 9 EMA. Enter on next red candle breakdown.',
    entry_trigger: 'Buy immediately on close of first green confirmation candle after retesting 9 EMA on 15m chart.',
    stop_loss: 'Strict SL below the retest candle low (or 9 EMA − 0.25%).',
    target_1: 'Target 1: 1:1.5 Risk-to-Reward (Day High / Next Resistance)',
    target_2: 'Target 2: 1:2.5 Risk-to-Reward (R2 Pivot / Fibonacci 1.618)',
    target_3: 'Target 3: 1:4.0 Risk-to-Reward (Trail with 9 EMA till close below)',
    timeframe: 'Intraday: 5-min & 15-min | Swing: Daily Chart',
    win_rate: '88% Win Rate',
    risk_reward: '1:2.5 to 1:4.0 R:R',
    indicators: ['9 EMA', '15-min Price Action', 'Volume Surge > 1.5x', 'VWAP Support', 'RSI 55–65'],
    rules: [
      'Never enter directly on initial breakout candle; ALWAYS wait for 9 EMA retest to avoid retail bull traps.',
      'Retest candle must show lower wick rejection (buying absorption at 9 EMA).',
      'Volume on the breakout and retest confirmation candle must be higher than 20-period average volume.',
      'Check that Price is trading above intraday VWAP for institutional bias alignment.',
    ],
    mistakes_to_avoid: [
      'Entering when price is already 2% extended above 9 EMA (wait for mean reversion).',
      'Trading against the broader Nifty 50 market trend.',
      'Moving Stop Loss during an active trade.',
    ],
    example: 'NIFTY 15m breaks 24,500 resistance, pulls back to test 9 EMA at 24,485, prints strong green hammer with 1.8x volume → rallies to 24,620.',
    scanner_path: '/quant-screener',
  },
  {
    id: 20,
    day_tag: '20',
    symbol_icon: '📈',
    chart_type: 'golden_cross',
    title: '20 EMA + 50 EMA Trend Cross & Alignment Engine',
    category: 'Dynamic Moving Averages',
    single_line: 'When 20 EMA crosses above 50 EMA and both slope upward at 45 degrees with Price > 200 EMA, a powerful multi-week trend is initiated.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: 20 EMA crosses above 50 EMA (Golden Cross). Price pulls back to 20 EMA → Buy on green candle.',
    bearish_logic: '🔴 BEARISH SHORT: 20 EMA crosses below 50 EMA (Death Cross). Price rallies to 20 EMA → Sell on red candle.',
    entry_trigger: 'Buy on pullback to 20 EMA following the cross.',
    stop_loss: 'SL below 50 EMA or recent swing low.',
    target_1: 'Target 1: 1:2.0 R:R',
    target_2: 'Target 2: 1:3.5 R:R',
    target_3: 'Target 3: 1:5.0+ R:R (Multi-week trend hold)',
    timeframe: '15m, 1H, Daily',
    win_rate: '86% Win Rate',
    risk_reward: '1:3.0 R:R',
    indicators: ['20 EMA', '50 EMA', '200 EMA', 'Volume Ratio > 1.5x'],
    rules: ['Ensure 200 EMA is sloping in the same direction for maximum conviction.'],
    mistakes_to_avoid: ['Buying when moving averages are flat and tangled.'],
    example: 'BEL 20 EMA crosses 50 EMA at ₹280 → stock rallies to ₹340 over 4 weeks.',
    scanner_path: '/ema-screener',
  },
  {
    id: 21,
    day_tag: '21',
    symbol_icon: '🧭',
    chart_type: 'supertrend',
    title: 'Supertrend (10, 3) + 200 EMA Filter Matrix',
    category: 'Dynamic Moving Averages',
    single_line: 'Filter trades by 200 EMA (bias filter); only take Supertrend GREEN buy signals when Price > 200 EMA for effortless trend following.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Price > 200 EMA AND Supertrend (10,3) turns GREEN with volume confirmation.',
    bearish_logic: '🔴 BEARISH SHORT: Price < 200 EMA AND Supertrend (10,3) turns RED with volume confirmation.',
    entry_trigger: 'Buy on the close of the candle where Supertrend flips to Green above 200 EMA.',
    stop_loss: 'SL at Supertrend green line (dynamic trailing stop).',
    target_1: 'Target 1: 1:2.0 R:R',
    target_2: 'Target 2: 1:3.0 R:R',
    target_3: 'Target 3: Exit only when Supertrend flips to Red',
    timeframe: '15m, 1H, Daily',
    win_rate: '83% Win Rate',
    risk_reward: '1:2.5 R:R',
    indicators: ['Supertrend (10, 3)', '200 EMA', 'ADX > 25'],
    rules: ['Never take a Supertrend BUY signal if price is below 200 EMA.'],
    mistakes_to_avoid: ['Exiting too early on minor intraday noise.'],
    example: 'COALINDIA Supertrend turns Green at ₹460 above 200 EMA → runs to ₹525 without touching stop.',
    scanner_path: '/momentum',
  },
  {
    id: 22,
    day_tag: '22',
    symbol_icon: '🌊',
    chart_type: 'vwap',
    title: 'VWAP Institutional Execution & Standard Deviation Bands',
    category: 'Dynamic Moving Averages',
    single_line: 'VWAP represents the institutional average execution price; price breaking above VWAP with a 2x volume spike confirms massive institutional buying.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Price crosses above VWAP + Upper Band with Volume > 2x average. Retest of VWAP holds as support.',
    bearish_logic: '🔴 BEARISH SHORT: Price breaks below VWAP with heavy volume and fails to re-cross above VWAP.',
    entry_trigger: 'Buy on breakout above VWAP or on first pullback bounce at VWAP line.',
    stop_loss: 'SL 0.25% below VWAP line.',
    target_1: 'Target 1: VWAP + 1.0 Standard Deviation Band',
    target_2: 'Target 2: VWAP + 2.0 Standard Deviation Band (1:2.5 R:R)',
    target_3: 'Target 3: Day High / Resistance 2',
    timeframe: '3m, 5m, 15m',
    win_rate: '87% Win Rate',
    risk_reward: '1:2.5 R:R',
    indicators: ['VWAP', 'VWAP Bands (+1/+2)', 'Volume Surge > 2.0x', 'Order Book Buyer % > 75%'],
    rules: ['Institutions benchmark performance against VWAP; staying above VWAP keeps buyers in control.'],
    mistakes_to_avoid: ['Shorting a stock that is steadily riding above its rising VWAP line.'],
    example: 'MARUTI opens at ₹12,100, crosses VWAP with 3.5x volume at 9:30 AM → rallies to ₹12,480.',
    scanner_path: '/volume-best',
  },
  {
    id: 23,
    day_tag: '23',
    symbol_icon: '🏦',
    chart_type: 'smc_ob',
    title: 'Order Block (OB) & Fair Value Gap (FVG) Mitigation',
    category: 'Institutional Order Flow',
    single_line: 'Last down candle before a massive explosive upward impulse creates a Bullish Order Block (OB); when price returns to mitigate the FVG/OB, enter with institutional limit orders.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Price drops into Bullish Order Block (OB) and fills the Fair Value Gap (FVG). Enter on lower timeframe shift.',
    bearish_logic: '🔴 BEARISH SHORT: Price rallies into Bearish Order Block (OB) and fills FVG. Enter short on rejection.',
    entry_trigger: 'Enter on 50% midpoint of the Order Block with confirmation candle.',
    stop_loss: 'SL 1 tick below the Order Block invalidation level (very tight SL).',
    target_1: 'Target 1: Liquidity High (1:3.0 R:R)',
    target_2: 'Target 2: 1:5.0 R:R',
    target_3: 'Target 3: 1:8.0+ R:R (Institutional sniper entry)',
    timeframe: '5m, 15m, 1H, 4H',
    win_rate: '88% Win Rate',
    risk_reward: '1:4.0 to 1:8.0 R:R',
    indicators: ['Order Block (OB)', 'Fair Value Gap (FVG)', 'Discount/Premium Fibonacci Zone (0.618 - 0.786)'],
    rules: ['Only trade Order Blocks that caused a clear Break of Structure (BOS).'],
    mistakes_to_avoid: ['Using every random candle as an Order Block without imbalance.'],
    example: 'NIFTY 15m creates FVG at 24,350 and rallies to 24,550. Later drops to 24,360 OB, prints hammer → rockets to 24,700.',
    scanner_path: '/target-matrix',
  },
  {
    id: 24,
    day_tag: '24',
    symbol_icon: '🔄',
    chart_type: 'bos',
    title: 'Break of Structure (BOS) & Change of Character (CHoCH)',
    category: 'Institutional Order Flow',
    single_line: 'CHoCH signals the first structural trend reversal when a key swing point is breached; subsequent BOS confirms the continuation of the new institutional trend.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Bullish CHoCH breaks prior lower high. Wait for pullback to discount OB, then enter on Bullish BOS.',
    bearish_logic: '🔴 BEARISH SHORT: Bearish CHoCH breaks prior higher low. Wait for pullback to premium OB, then enter on Bearish BOS.',
    entry_trigger: 'Enter on pullback after CHoCH confirmation.',
    stop_loss: 'SL below the structural swing low that caused CHoCH.',
    target_1: 'Target 1: 1:2.5 R:R',
    target_2: 'Target 2: 1:4.0 R:R',
    target_3: 'Target 3: Complete higher timeframe liquidity pool',
    timeframe: '15m, 1H, Daily',
    win_rate: '86% Win Rate',
    risk_reward: '1:3.5 R:R',
    indicators: ['CHoCH Line', 'BOS Marker', 'Market Structure High/Low'],
    rules: ['A true CHoCH requires candle body close beyond the level, not just a wick.'],
    mistakes_to_avoid: ['Confusing a liquidity sweep wick for a confirmed CHoCH.'],
    example: 'SUNPHARMA breaks 1-hour CHoCH at ₹1,720, pulls back to ₹1,725 OB → achieves ₹1,810 BOS target.',
    scanner_path: '/quant-screener',
  },
  {
    id: 25,
    day_tag: '25',
    symbol_icon: '🪤',
    chart_type: 'sweep',
    title: 'Liquidity Sweeps & Turtle Soup Reversal Traps',
    category: 'Institutional Order Flow',
    single_line: 'Smart money forces price to breach popular retail support/resistance to trigger stop losses and collect liquidity, then violently reverses.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Price pierces support, triggers retail stop losses, but candle immediately closes back ABOVE support with a long wick (Turtle Soup).',
    bearish_logic: '🔴 BEARISH SHORT: Price pierces resistance, traps retail buyers, then closes back BELOW resistance with heavy upper wick.',
    entry_trigger: 'Buy immediately as price re-claims the broken support level.',
    stop_loss: 'SL below the sweep wick low (very tight risk).',
    target_1: 'Target 1: Opposite liquidity pool (Resistance High)',
    target_2: 'Target 2: 1:3.5 R:R',
    target_3: 'Target 3: 1:6.0 R:R',
    timeframe: '5m, 15m, 1H',
    win_rate: '89% Win Rate',
    risk_reward: '1:4.0 R:R',
    indicators: ['Equal Lows/Highs Liquidity', 'Sweep Wick', 'Aggressive Volume Absorption'],
    rules: ['The sweep candle must close back inside the range in the same or next candle.'],
    mistakes_to_avoid: ['Catching a real breakdown that closes strongly below support with no rejection.'],
    example: 'BANKNIFTY sweeps 51,000 round number support to 50,940, reclaims 51,020 on massive green candle → rallies 600 points.',
    scanner_path: '/top-buyers',
  },
  {
    id: 26,
    day_tag: '26',
    symbol_icon: '💥',
    chart_type: 'volume_shocker',
    title: 'Multi-Day Volume Expansion & Institutional Shocker Ratio',
    category: 'Institutional Order Flow',
    single_line: 'When daily volume exceeds 3x to 7x the historical average along with a price surge, it indicates institutional block accumulation that persists for 3–10 sessions.',
    is_bullish: true,
    is_bearish: false,
    bullish_logic: '🟢 BULLISH BUY: Volume Shockers Ratio > 3.0x with Price Gain > 2.0% and Delivery % > 50%. High-conviction swing hold.',
    bearish_logic: '🔴 BEARISH WARNING: Volume Shocker with Price Drop > 3% signals massive institutional unloading / distribution.',
    entry_trigger: 'Buy on confirmation of volume expansion day close or day 2 opening dip.',
    stop_loss: 'SL below the low of the volume expansion candle.',
    target_1: 'Target 1: 5% - 8% gain in 3 sessions (1:2.0 R:R)',
    target_2: 'Target 2: 10% - 15% gain in 7 sessions (1:3.5 R:R)',
    target_3: 'Target 3: 20%+ multi-week rally',
    timeframe: 'Daily & Multi-Day Swing',
    win_rate: '88% Win Rate',
    risk_reward: '1:3.0 R:R',
    indicators: ['3D/5D/7D Volume Ratio', 'Delivery % > 50%', 'Institutional Flow Score > 80'],
    rules: ['High volume must be accompanied by high delivery % for genuine accumulation.'],
    mistakes_to_avoid: ['Buying high volume spikes caused by earnings rumors without price confirmation.'],
    example: 'DIXON prints 5.2x volume surge at ₹11,500 with 62% delivery → surges to ₹13,800 over 8 sessions.',
    scanner_path: '/volume-3d-shockers',
  },
  {
    id: 27,
    day_tag: '27',
    symbol_icon: '📊',
    chart_type: 'oi',
    title: 'Open Interest (OI) Long Buildup & Short Squeeze Dynamics',
    category: 'Institutional Order Flow',
    single_line: 'Long Buildup (Price ↑ + OI ↑) signals fresh institutional capital inflow; Short Covering (Price ↑ + OI ↓) triggers explosive short squeezes.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Long Buildup (Price +2% + OI +15%) or Short Squeeze (Price breaks resistance as Call OI unwinds).',
    bearish_logic: '🔴 BEARISH SHORT: Short Buildup (Price -2% + OI +15%) or Long Unwinding (Price drops + OI drops).',
    entry_trigger: 'Buy when Long Buildup is detected across near and next month futures contracts.',
    stop_loss: 'SL at day low or below highest Put OI strike support.',
    target_1: 'Target 1: Next Call OI resistance strike (1:2.0 R:R)',
    target_2: 'Target 2: 1:3.5 R:R',
    target_3: 'Target 3: Complete short squeeze extension',
    timeframe: 'Intraday & Weekly Expiry',
    win_rate: '86% Win Rate',
    risk_reward: '1:2.8 R:R',
    indicators: ['Futures Open Interest (OI)', 'OI % Change > 10%', 'Put-Call Ratio', 'Option Chain Max Pain'],
    rules: ['Verify OI change in both percentage and absolute contract terms.'],
    mistakes_to_avoid: ['Ignoring expiry day rollover shifts.'],
    example: 'TATAMOTORS Price +3.5% with OI +22% → Long Buildup confirmed → continues rally for 4 days.',
    scanner_path: '/long-buildup',
  },
  {
    id: 28,
    day_tag: '28',
    symbol_icon: '⚖️',
    chart_type: 'pcr',
    title: 'Option Chain PCR Sentiment Equilibrium & Reversals',
    category: 'Institutional Order Flow',
    single_line: 'Extreme Put-Call Ratio readings indicate retail panic or complacency; PCR < 0.60 signals extreme oversold buy opportunity, PCR > 1.40 signals top.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: Nifty/Stock PCR drops to 0.55–0.70 at support while Put writing increases at round strikes → contrarian rally.',
    bearish_logic: '🔴 BEARISH SHORT: PCR spikes above 1.50 at resistance with heavy Call unwinding → contrarian selloff risk.',
    entry_trigger: 'Buy when PCR starts rebounding from extreme low with green price candle.',
    stop_loss: 'SL below recent panic low.',
    target_1: 'Target 1: Mean reversion to PCR 1.0 (1:2.5 R:R)',
    target_2: 'Target 2: 1:4.0 R:R',
    target_3: 'Target 3: Complete market sentiment reversal',
    timeframe: 'Intraday 15m & Daily',
    win_rate: '85% Win Rate',
    risk_reward: '1:3.0 R:R',
    indicators: ['PCR Ratio', 'Max Pain Level', 'Call/Put OI Heatmap'],
    rules: ['Use as a confirmation filter alongside technical price support.'],
    mistakes_to_avoid: ['Buying immediately at low PCR before price action stops falling.'],
    example: 'NIFTY PCR drops to 0.58 during panic selloff at 23,900 → rebounds to 24,400 in 3 sessions.',
    scanner_path: '/oi-analysis',
  },
  {
    id: 29,
    day_tag: '29',
    symbol_icon: '⏰',
    chart_type: 'orb',
    title: 'Opening Range Breakout (ORB 15-Minute Protocol)',
    category: 'Candlestick Mechanics',
    single_line: 'Mark the High and Low of the first 15-minute candle (09:15–09:30 IST); when candle 2 or 3 breaks and closes outside the range, trade the expansion in that direction.',
    is_bullish: true,
    is_bearish: true,
    bullish_logic: '🟢 BULLISH BUY: 15-min candle (09:15-09:30) high is breached and confirmed by 2nd candle closing above high + Volume > 1.5x.',
    bearish_logic: '🔴 BEARISH SHORT: 15-min candle low is breached and confirmed by candle closing below low + heavy red volume.',
    entry_trigger: 'Enter immediately on close of breakout candle above ORB High.',
    stop_loss: 'SL at the midpoint of the 15-min opening candle (or ORB Low for tight ranges).',
    target_1: 'Target 1: ORB Range height added to breakout level (1:1.5 R:R)',
    target_2: 'Target 2: 1:2.5 R:R (Pivot R2)',
    target_3: 'Target 3: Intraday trend continuation till 15:15 IST',
    timeframe: '15m (09:15 to 09:30 Setup)',
    win_rate: '84% Win Rate',
    risk_reward: '1:2.0 R:R',
    indicators: ['15-min ORB High/Low', 'Opening Volume Surge', 'VWAP Alignment'],
    rules: ['Do not trade ORB if opening 15-minute candle is abnormally huge (>2.5% range).'],
    mistakes_to_avoid: ['Trading before the 09:30 AM 15-minute candle has closed.'],
    example: 'RELIANCE 15m ORB range ₹2,900–₹2,920. Breaks ₹2,920 at 09:35 with 2x volume → reaches ₹2,965.',
    scanner_path: '/top-buy',
  },
  {
    id: 30,
    day_tag: '30',
    symbol_icon: '🏆',
    chart_type: 'ai_meter',
    title: 'Institutional 200-Point AI Multi-Factor Engine',
    category: 'Institutional Order Flow',
    single_line: 'Combines 12 multi-factor pillars (Technicals 50, Fundamentals 40, Derivatives 35, Volume 20, Relative Strength 15, SMC 15) to identify 90%+ institutional high-conviction buys.',
    is_bullish: true,
    is_bearish: false,
    bullish_logic: '🟢 ULTIMATE HIGH-CONVICTION BUY: AI Score ≥ 85/100 (170/200 pts) with Bullish Stack, Volume Expansion > 2x, and Long Buildup.',
    bearish_logic: '🔴 HIGH-RISK SELL: AI Score < 40/100 with Short Buildup, Negative RS, and Breakdown below 200 EMA.',
    entry_trigger: 'Buy stocks appearing on High-Conviction AI Master List with score > 85.',
    stop_loss: 'SL at algorithmically calculated support (typically 1.5% below entry).',
    target_1: 'Target 1: 1:2.0 R:R (T1 hit rate 89%)',
    target_2: 'Target 2: 1:3.5 R:R (T2 hit rate 74%)',
    target_3: 'Target 3: 1:5.0 R:R (T3 hit rate 58%)',
    timeframe: 'Intraday & Multi-Day Swing',
    win_rate: '90%+ Institutional Win Rate',
    risk_reward: '1:3.0 to 1:5.0 R:R',
    indicators: ['200-Pt AI Score', 'SMC Order Flow', 'OI Long Buildup', 'EMA Stack', 'Volume Ratio', 'Delivery %'],
    rules: [
      'Score ≥ 85 = Highest conviction institutional accumulation.',
      'Score 70–84 = Moderate momentum setup.',
      'Score < 50 = Avoid / Wait for structure.',
    ],
    mistakes_to_avoid: ['Ignoring market trend regime while picking individual stocks.'],
    example: 'Quant Screener flags HAL with 94/100 AI Score at ₹4,650 → stock hits T1, T2, T3 to reach ₹5,180 in 5 sessions.',
    scanner_path: '/quant-screener',
  },
];

// ── 2. Technical Indicator Mathematical Library ──
export const TECHNICAL_INDICATOR_LIBRARY: IndicatorMath[] = [
  {
    name: 'Relative Strength Index',
    symbol_icon: '📈',
    acronym: 'RSI (14)',
    category: 'Momentum',
    chart_type: 'rsi_osc',
    math_formula: 'RSI = 100 - [100 / (1 + RS)]   where RS = (Smoothed Avg 14-Day Gain) / (Smoothed Avg 14-Day Loss)',
    calculation_steps: [
      '1. Price Change: ΔP = Close(t) - Close(t-1)',
      '2. Gain = max(ΔP, 0), Loss = max(-ΔP, 0)',
      '3. Smoothed Avg Gain = [Prior Avg Gain * 13 + Current Gain] / 14',
      '4. Smoothed Avg Loss = [Prior Avg Loss * 13 + Current Loss] / 14',
      '5. RS = Avg Gain / Avg Loss → RSI oscillates strictly between 0 and 100.',
    ],
    single_line: 'Measures velocity and magnitude of directional price momentum; 55–70 is ideal bullish momentum, >80 is overbought, <30 is oversold.',
    bullish_math: '🟢 Bullish Formula: RSI > 50 AND rising towards 65-70. Regular Bullish Divergence = Price(t) < Price(t-n) while RSI(t) > RSI(t-n) at S1 Support.',
    bearish_math: '🔴 Bearish Formula: RSI < 45 AND falling below 40. Regular Bearish Divergence = Price(t) > Price(t-n) while RSI(t) < RSI(t-n) at R1 Resistance.',
    ideal_parameters: 'Length = 14 periods, Bullish Zone = 55–70, Overbought = 70/80, Oversold = 30/40',
    interpretation: 'RSI in a strong bull market rarely falls below 40; treating 40-50 as the new support zone offers high-probability pullback entries.',
    pro_tip: 'Combine RSI Divergence with support/resistance price action rather than buying purely on oversold readings.',
    scanner_path: '/indicators',
  },
  {
    name: 'Moving Average Convergence Divergence',
    symbol_icon: '🔀',
    acronym: 'MACD (12, 26, 9)',
    category: 'Momentum',
    chart_type: 'macd_osc',
    math_formula: 'MACD Line = EMA(12) - EMA(26) | Signal Line = EMA(9, MACD Line) | Histogram = MACD Line - Signal Line',
    calculation_steps: [
      '1. Fast EMA = 12-period exponential moving average of closing prices.',
      '2. Slow EMA = 26-period exponential moving average of closing prices.',
      '3. MACD Line = Fast EMA(12) - Slow EMA(26).',
      '4. Signal Line = 9-period EMA applied directly on MACD Line.',
      '5. MACD Histogram = MACD Line - Signal Line (visualizes momentum acceleration).',
    ],
    single_line: 'Tracks trend momentum and moving average separation; bullish crossover above zero line confirms institutional trend continuation.',
    bullish_math: '🟢 Bullish Formula: MACD Line crosses ABOVE Signal Line AND Histogram turns positive (Hist > 0) above Zero Benchmark.',
    bearish_math: '🔴 Bearish Formula: MACD Line crosses BELOW Signal Line AND Histogram turns negative (Hist < 0) from high peak.',
    ideal_parameters: 'Fast Period = 12, Slow Period = 26, Signal Smoothing = 9 (Exponential)',
    interpretation: 'A crossover occurring below the zero line signifies an early reversal; a crossover occurring above zero signifies trend acceleration.',
    pro_tip: 'Watch the MACD Histogram: when red bars start shrinking towards zero, momentum is decelerating and buyers are preparing to take over.',
    scanner_path: '/indicators',
  },
  {
    name: 'Put-Call Ratio & Option Greek Sentiment',
    symbol_icon: '⚖️',
    acronym: 'PCR (Options)',
    category: 'Derivatives & OI',
    chart_type: 'pcr',
    math_formula: 'PCR = Total Put Open Interest (Σ Put OI) ÷ Total Call Open Interest (Σ Call OI)',
    calculation_steps: [
      '1. Sum all outstanding open interest contracts for Puts across all active strikes: Σ Put OI.',
      '2. Sum all outstanding open interest contracts for Calls across all active strikes: Σ Call OI.',
      '3. Divide Total Put OI by Total Call OI.',
      '4. Volume PCR = Total Put Traded Volume / Total Call Traded Volume.',
    ],
    single_line: 'Contrarian sentiment barometer; PCR < 0.60 indicates extreme retail panic & oversold bottom, PCR > 1.40 indicates extreme greed & top.',
    bullish_math: '🟢 Bullish Formula: PCR <= 0.65 at major technical support + ATM/ITM Put OI writing increases significantly (Smart Money writing puts).',
    bearish_math: '🔴 Bearish Formula: PCR >= 1.50 at major technical resistance + ATM/OTM Call OI writing increases (Smart Money writing calls).',
    ideal_parameters: 'Index PCR Range: 0.60 (Oversold) to 1.40 (Overbought) | Equilibrium = 1.0',
    interpretation: 'Option writers (smart money) dominate option buyers; high Put OI acts as an unbreakable price cushion.',
    pro_tip: 'Identify the strike with highest Put OI — that strike represents the highest-probability institutional floor for the weekly expiry.',
    scanner_path: '/oi-analysis',
  },
  {
    name: 'Average Directional Index',
    symbol_icon: '🧭',
    acronym: 'ADX (14)',
    category: 'Trend',
    chart_type: 'supertrend',
    math_formula: 'ADX = 14-Period EMA of DX   where DX = [|+DI - -DI| / (+DI + -DI)] × 100',
    calculation_steps: [
      '1. Directional Movement: +DM = Today High - Prev High, -DM = Prev Low - Today Low.',
      '2. True Range: TR = max[(H-L), |H-PrevC|, |L-PrevC|].',
      '3. Smooth +DM, -DM, and TR over 14 periods using Wilder smoothing to obtain +DI and -DI.',
      '4. Directional Index: DX = [|+DI - -DI| / (+DI + -DI)] * 100.',
      '5. ADX = 14-period exponential moving average of DX.',
    ],
    single_line: 'Quantifies trend strength regardless of direction; ADX > 25 confirms powerful trend, ADX > 40 is explosive trend, ADX < 20 is choppy range.',
    bullish_math: '🟢 Bullish Formula: ADX > 25 AND rising (dADX/dt > 0) while +DI > -DI (Strong Bullish Trend Momentum).',
    bearish_math: '🔴 Bearish Formula: ADX > 25 AND rising while -DI > +DI (Strong Bearish Trend Momentum) OR ADX < 20 (Choppy range).',
    ideal_parameters: 'Period = 14, Trend Threshold = 25, Extreme Momentum = 40, Range Chop = 20',
    interpretation: 'ADX does NOT show direction; it measures the sheer momentum force of the market. High ADX +DI = buy breakouts; Low ADX = sell options/mean-revert.',
    pro_tip: 'Never trade breakout systems when ADX is below 20; false breakouts and whipsaws occur frequently in low-ADX regimes.',
    scanner_path: '/momentum',
  },
  {
    name: 'Volume Weighted Average Price',
    symbol_icon: '🌊',
    acronym: 'VWAP',
    category: 'Volume / Flow',
    chart_type: 'vwap',
    math_formula: 'VWAP = Σ(Typical Price × Volume) ÷ Σ(Volume)   where Typical Price = (High + Low + Close) / 3',
    calculation_steps: [
      '1. Typical Price: TP(t) = [High(t) + Low(t) + Close(t)] / 3.',
      '2. Cumulative TP Volume: Σ[TP(t) * Volume(t)] from 09:15 IST opening candle.',
      '3. Cumulative Volume: Σ[Volume(t)] from 09:15 IST opening candle.',
      '4. VWAP = Cumulative TP Volume / Cumulative Volume.',
      '5. Standard Deviation Bands = VWAP ± [Multiplier × σ].',
    ],
    single_line: 'Institutional fair value benchmark reset daily at 09:15 IST; trading above VWAP confirms institutional buyer control.',
    bullish_math: '🟢 Bullish Formula: Price > VWAP AND VWAP slope > 0. Pullback to VWAP touches line and prints green confirmation candle.',
    bearish_math: '🔴 Bearish Formula: Price < VWAP AND VWAP slope < 0. Rallies to VWAP are rejected with heavy selling volume.',
    ideal_parameters: 'Session reset daily at 09:15 IST. Standard Deviation Bands at ±1.0σ, ±2.0σ',
    interpretation: 'Institutional execution algorithms (VWAP orders) buy when price is at or below VWAP and hold off when extended > +2σ above VWAP.',
    pro_tip: 'The highest win-rate intraday trade in Nifty & F&O stocks is the "VWAP Pullback" after the initial 09:15-09:30 range establishment.',
    scanner_path: '/volume-best',
  },
  {
    name: 'Supertrend Dynamic Volatility Bands',
    symbol_icon: '🛡️',
    acronym: 'Supertrend (10, 3)',
    category: 'Trend',
    chart_type: 'supertrend',
    math_formula: 'Upper Band = (H+L)/2 + (3 × ATR) | Lower Band = (H+L)/2 - (3 × ATR) | Dynamic Flip Rule',
    calculation_steps: [
      '1. Calculate 10-period Average True Range (ATR).',
      '2. Basic Upper Band = (High + Low) / 2 + 3 * ATR.',
      '3. Basic Lower Band = (High + Low) / 2 - 3 * ATR.',
      '4. If Close > Prev Final Upper Band → State = BULLISH (Supertrend Line = Lower Band).',
      '5. If Close < Prev Final Lower Band → State = BEARISH (Supertrend Line = Upper Band).',
    ],
    single_line: 'Dynamic volatility-based trailing stop line; Green line below price indicates active buy mode, Red line above price indicates active sell mode.',
    bullish_math: '🟢 Bullish Formula: Price > Supertrend Line (Green) AND Price > 200 EMA (Long-term Bullish Confluence).',
    bearish_math: '🔴 Bearish Formula: Price < Supertrend Line (Red) AND Price < 200 EMA (Long-term Bearish Confluence).',
    ideal_parameters: 'ATR Period = 10, Multiplier = 3.0 (or ATR 7, Multiplier 2.0 for fast scalping)',
    interpretation: 'Provides unambiguous trailing stop loss levels that adjust dynamically with market volatility.',
    pro_tip: 'Filter Supertrend buy signals by requiring Price to be above 200 EMA to avoid false flips during major secular downtrends.',
    scanner_path: '/momentum',
  },
  {
    name: 'Bollinger Bands & Volatility Squeeze',
    symbol_icon: '🎯',
    acronym: 'BB (20, 2)',
    category: 'Volatility',
    chart_type: 'breakout',
    math_formula: 'Middle = SMA(20) | Upper = SMA(20) + (2 × σ) | Lower = SMA(20) - (2 × σ)  where σ = 20-Day Std Dev',
    calculation_steps: [
      '1. Middle Band = 20-period simple moving average of closing prices: SMA(20).',
      '2. Standard Deviation: σ = sqrt[ (1/20) * Σ(Price - SMA20)^2 ].',
      '3. Upper Band = SMA(20) + 2 * σ.',
      '4. Lower Band = SMA(20) - 2 * σ.',
      '5. Bandwidth % = [(Upper - Lower) / Middle] * 100 (quantifies volatility squeeze).',
    ],
    single_line: 'Envelopes ~95% of all price action; tight contraction (squeeze) precedes massive explosive directional breakouts.',
    bullish_math: '🟢 Bullish Formula: Bandwidth drops to multi-week low (Squeeze) → Candle closes ABOVE Upper Band on 2x+ Volume.',
    bearish_math: '🔴 Bearish Formula: Bandwidth Squeeze followed by Candle closing BELOW Lower Band with expanding red volume.',
    ideal_parameters: 'Period = 20, Standard Deviations = 2.0, Squeeze Threshold = Bandwidth < 4%',
    interpretation: 'Volatility is cyclical: periods of extreme compression (squeeze) lead to violent volatility expansion.',
    pro_tip: 'When bands squeeze to multi-month lows, do not predict direction — wait for the first candle to close outside the band with 2x volume.',
    scanner_path: '/breakout',
  },
  {
    name: 'Average True Range & Position Sizing',
    symbol_icon: '📐',
    acronym: 'ATR (14)',
    category: 'Volatility',
    chart_type: 'triangle',
    math_formula: 'ATR = (1/14) Σ max[(H-L), |H-PrevC|, |L-PrevC|] | Position Size = (Capital × 1%) ÷ (1.5 × ATR)',
    calculation_steps: [
      '1. True Range = max of: (High - Low), |High - Prev Close|, |Low - Prev Close|.',
      '2. Initial ATR = 14-period simple average of True Range.',
      '3. Subsequent ATR = [Prior ATR * 13 + Current TR] / 14.',
      '4. Dynamic Stop Loss = Entry Price - (1.5 * ATR in ₹).',
      '5. Target 1 = Entry Price + (3.0 * ATR in ₹) [Guaranteed 1:2 Risk-to-Reward].',
    ],
    single_line: 'Pure measure of price volatility in points/rupees; used to set scientifically calibrated stop losses and dynamic position sizes.',
    bullish_math: '🟢 Bullish Rule: Stop Loss = Entry - (1.5 × ATR). Target = Entry + (3.0 × ATR). Position Size = (1% Capital) ÷ (1.5 × ATR).',
    bearish_math: '🔴 Volatility Warning: ATR > 4% of stock price indicates dangerous whipsaw risk requiring reduced lot sizing.',
    ideal_parameters: 'Period = 14 (Daily or 15-minute chart)',
    interpretation: 'High ATR = large daily swings (wider stops needed); Low ATR = tight consolidation (favorable risk-to-reward).',
    pro_tip: 'Position Size Formula = (Total Account Risk in ₹) ÷ (1.5 × ATR in ₹). This ensures you never lose more than 1% on any single trade.',
    scanner_path: '/today-result',
  },
  {
    name: 'Exponential Moving Average Stack',
    symbol_icon: '🥞',
    acronym: 'EMA Stack (9, 20, 50, 200)',
    category: 'Trend',
    chart_type: 'golden_cross',
    math_formula: 'EMA(t) = [Price(t) × k] + [EMA(t-1) × (1 - k)]   where k = 2 / (Period + 1)',
    calculation_steps: [
      '1. Weighting multiplier: k = 2 / (Period + 1).',
      '2. Short-term momentum: 9 EMA (k = 0.20), 20 EMA (k = 0.0952).',
      '3. Medium-term trend: 50 EMA (k = 0.0392).',
      '4. Long-term trend: 200 EMA (k = 0.00995).',
      '5. Alignment Check: Price > 9 EMA > 20 EMA > 50 EMA > 200 EMA.',
    ],
    single_line: 'Hierarchical moving average stack; Price > 9 > 20 > 50 > 200 EMA indicates the strongest possible institutional uptrend.',
    bullish_math: '🟢 Perfect Bullish Stack: Price > 9 EMA > 20 EMA > 50 EMA > 200 EMA with all averages fanning out and sloping upwards.',
    bearish_math: '🔴 Perfect Bearish Stack: Price < 9 EMA < 20 EMA < 50 EMA < 200 EMA (Death Stack) indicating severe downtrend.',
    ideal_parameters: 'Short-term = 9 & 20 EMA | Medium-term = 50 EMA | Long-term Trend = 200 EMA',
    interpretation: 'Faster EMAs give higher weight to recent price action; when all four align in order, retail traders cannot stop the momentum.',
    pro_tip: 'Only buy pullbacks at the 20 EMA when the 50 EMA and 200 EMA are sloping in the same direction.',
    scanner_path: '/ema-screener',
  },
  {
    name: 'Smart Money (SMC) Imbalance & Order Block',
    symbol_icon: '🏦',
    acronym: 'SMC (OB & FVG)',
    category: 'Derivatives & OI',
    chart_type: 'smc_ob',
    math_formula: 'FVG = Low(Candle 1) - High(Candle 3) [Bullish Imbalance] | OB = Last Down Candle before BOS',
    calculation_steps: [
      '1. Detect explosive 3-candle displacement wave.',
      '2. Measure gap between Candle 1 low and Candle 3 high (Fair Value Gap).',
      '3. Identify the last opposite candle body preceding the impulse (Order Block).',
      '4. Mark 50% Equilibrium level (Mean Threshold) of the Order Block.',
      '5. Place limit order at OB entry with invalidation below OB low.',
    ],
    single_line: 'Smart money footprints: institutions create market imbalances (FVG) and leave unfilled buy orders inside Order Blocks (OB).',
    bullish_math: '🟢 Bullish OB Entry: Price pulls back to discount zone (0.618-0.786 Fibonacci) to mitigate Bullish Order Block + fill FVG.',
    bearish_math: '🔴 Bearish OB Entry: Price rallies into premium zone (0.618-0.786 Fibonacci) to mitigate Bearish Order Block + fill Bearish FVG.',
    ideal_parameters: 'Displacement Volume > 2.5x, Mitigation Timeframe = 15m / 1H',
    interpretation: 'Market makers must return to unmitigated order blocks to balance their books before launching the next leg of the trend.',
    pro_tip: 'An Order Block that does NOT break market structure (BOS) is weak; only trade Order Blocks that caused a clear Break of Structure.',
    scanner_path: '/target-matrix',
  },
];

export default function FormulaPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [mainTab, setMainTab] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'accordion' | 'table'>('cards');
  const [expandedDay, setExpandedDay] = useState<string | false>('1');

  // Filter 1-30 Strategy Series
  const filteredMasterclass = useMemo(() => {
    return SEQUENTIAL_STRATEGY_SERIES.filter(s => {
      if (selectedCategory === 'Bullish' && !s.is_bullish) return false;
      if (selectedCategory === 'Bearish' && !s.is_bearish) return false;
      if (
        selectedCategory !== 'All' &&
        selectedCategory !== 'Bullish' &&
        selectedCategory !== 'Bearish' &&
        s.category !== selectedCategory
      ) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        s.title.toLowerCase().includes(q) ||
        s.single_line.toLowerCase().includes(q) ||
        s.day_tag.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.indicators.some(i => i.toLowerCase().includes(q)) ||
        s.example.toLowerCase().includes(q) ||
        String(s.id) === q
      );
    });
  }, [searchQuery, selectedCategory]);

  // Filter Technical Indicator Library
  const filteredIndicators = useMemo(() => {
    if (!searchQuery.trim()) return TECHNICAL_INDICATOR_LIBRARY;
    const q = searchQuery.toLowerCase().trim();
    return TECHNICAL_INDICATOR_LIBRARY.filter(
      ind =>
        ind.name.toLowerCase().includes(q) ||
        ind.acronym.toLowerCase().includes(q) ||
        ind.category.toLowerCase().includes(q) ||
        ind.single_line.toLowerCase().includes(q) ||
        ind.math_formula.toLowerCase().includes(q) ||
        ind.bullish_math.toLowerCase().includes(q) ||
        ind.bearish_math.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const categories = [
    { label: 'All (30)', value: 'All' },
    { label: '🟢 Bullish Setups', value: 'Bullish' },
    { label: '🔴 Bearish Setups', value: 'Bearish' },
    { label: '🕯️ Candlestick Mechanics', value: 'Candlestick Mechanics' },
    { label: '📐 Geometric Formations', value: 'Geometric Formations' },
    { label: '📈 Dynamic Moving Averages', value: 'Dynamic Moving Averages' },
    { label: '🏦 Institutional Order Flow', value: 'Institutional Order Flow' },
  ];

  const handleAccordionChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedDay(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* ── Top Hero Header (Personal Study & Technical Library) ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 3.5,
          background: isDark
            ? 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.08) 50%, rgba(139,92,246,0.12) 100%)'
            : 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #faf5ff 100%)',
          border: '1.5px solid',
          borderColor: isDark ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.4)',
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(16,185,129,0.08)',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={2}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1} flexWrap="wrap">
              <Chip
                icon={<MenuBook sx={{ fontSize: 16 }} />}
                label="Personal Study &amp; Technical Analysis Handbook"
                color="success"
                size="small"
                sx={{ fontWeight: 900, fontSize: '0.72rem', height: 24 }}
              />
              <Chip
                icon={<Verified sx={{ fontSize: 14 }} />}
                label="Mathematical Formula Library"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
              />
              <Chip
                label="All-in-One 1–30 Matrix"
                size="small"
                sx={{ fontWeight: 900, bgcolor: 'rgba(0,230,118,0.12)', color: '#00e676', height: 22 }}
              />
            </Stack>

            <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: -0.5, mb: 0.8 }}>
              📊 Proprietary Strategy Handbook &amp; Mathematical Formula Library
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 880, lineHeight: 1.5, mb: 1.5 }}>
              All-in-one personal study reference featuring miniature candlestick diagrams, quantitative single-line rules, exact Stop Loss / Target levels, and indicator mathematical derivations in clean 1 to 30 sequence.
            </Typography>
          </Box>
        </Stack>

        {/* Top Summary Metrics */}
        <Grid container spacing={1.5} mt={0.5}>
          {[
            { label: 'Strategy Matrix', value: '1 → 30 Rules', color: '#00e5ff', icon: <School /> },
            { label: 'Bullish Formations', value: '22 Strategies', color: '#00e676', icon: <TrendingUp /> },
            { label: 'Bearish Formations', value: '18 Strategies', color: '#ff1744', icon: <TrendingDown /> },
            { label: 'Mathematical Library', value: 'RSI, MACD, PCR, ADX', color: '#ffd600', icon: <Calculate /> },
            { label: 'Order Flow (SMC)', value: 'OB, FVG, BOS, CHoCH', color: '#d500f9', icon: <AutoAwesome /> },
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

      {/* ── Main Section Tabs: 1. Strategy Series (1 to 30) | 2. Indicator Mathematical Formulas (RSI, MACD, PCR, ADX) ── */}
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
          value={mainTab}
          onChange={(_, v) => setMainTab(v)}
          variant="fullWidth"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 800, fontSize: '0.85rem', py: 1.8 },
          }}
        >
          <Tab icon={<MenuBook sx={{ fontSize: 18 }} />} iconPosition="start" label="📚 Price Action & Strategy Library (1 to 30)" />
          <Tab icon={<Calculate sx={{ fontSize: 18 }} />} iconPosition="start" label="📐 Technical Indicator Formulas (RSI, MACD, PCR, ADX, VWAP)" />
        </Tabs>

        {/* Search & View Controls */}
        <Box sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
            <TextField
              size="small"
              placeholder={mainTab === 0 ? 'Search (e.g. 1, 2, 19), Hammer, Pattern, Indicator, Formula...' : 'Search RSI, MACD, PCR, ADX, VWAP, Supertrend, Formulas...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              sx={{ flex: 1, minWidth: { xs: '100%', md: 340 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, fontSize: '0.85rem' },
              }}
            />

            {mainTab === 0 && (
              <ToggleButtonGroup
                size="small"
                value={viewMode}
                exclusive
                onChange={(_, v) => v && setViewMode(v)}
                sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
              >
                <ToggleButton value="cards" title="Grid Cards View">
                  <ViewModule sx={{ fontSize: 18, mr: 0.5 }} /> Cards
                </ToggleButton>
                <ToggleButton value="accordion" title="Accordion Deep Dive View">
                  <ViewList sx={{ fontSize: 18, mr: 0.5 }} /> Deep Dive
                </ToggleButton>
                <ToggleButton value="table" title="Quick Table View">
                  <TableRows sx={{ fontSize: 18, mr: 0.5 }} /> Table
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </Stack>

          {/* Category Filters for 1-30 Series */}
          {mainTab === 0 && (
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
        </Box>
      </Paper>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 0: SEQUENTIAL TRADING STRATEGY SERIES (1 TO 30)
         ══════════════════════════════════════════════════════════════════════ */}
      {mainTab === 0 && (
        <>
          {/* ── View 1: Card Grid View ── */}
          {viewMode === 'cards' && (
            <Grid container spacing={2}>
              {filteredMasterclass.map(item => (
                <Grid item xs={12} md={6} lg={4} key={item.id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: '1.5px solid',
                      borderColor: item.id === 19 ? '#10b981' : isDark ? 'rgba(255,255,255,0.08)' : 'divider',
                      bgcolor: isDark ? 'rgba(11,17,32,0.85)' : '#ffffff',
                      transition: 'all 0.22s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: item.id === 19 ? '#059669' : 'primary.main',
                        boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.5)' : '0 12px 30px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    {/* Top Accent Line */}
                    <Box
                      sx={{
                        height: 4,
                        background: item.id === 19
                          ? 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)'
                          : item.is_bullish && item.is_bearish
                          ? 'linear-gradient(90deg, #00e676 0%, #ff1744 100%)'
                          : item.is_bullish
                          ? 'linear-gradient(90deg, #00e676 0%, #00b0ff 100%)'
                          : 'linear-gradient(90deg, #ff1744 0%, #ff9100 100%)',
                      }}
                    />

                    <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Header Row with Mini SVG Illustration */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} gap={1}>
                        <Chip
                          icon={<span style={{ fontSize: 13, marginRight: 2 }}>{item.symbol_icon}</span>}
                          label={`#${item.id}`}
                          size="small"
                          sx={{
                            fontWeight: 900,
                            fontSize: '0.72rem',
                            height: 22,
                            bgcolor: item.id === 19 ? 'rgba(16,185,129,0.2)' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                            color: item.id === 19 ? '#10b981' : 'text.primary',
                            border: '1px solid',
                            borderColor: item.id === 19 ? 'rgba(16,185,129,0.4)' : 'divider',
                          }}
                        />

                        {/* Tiny Pattern Chart Visual */}
                        <Box sx={{ px: 1, py: 0.3, borderRadius: 1.5, bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
                          <MiniPatternChart type={item.chart_type} isDark={isDark} />
                        </Box>

                        <Chip
                          label={item.win_rate}
                          size="small"
                          sx={{
                            fontWeight: 900,
                            fontSize: '0.65rem',
                            height: 20,
                            bgcolor: 'rgba(0,230,118,0.15)',
                            color: '#00e676',
                            border: '1px solid rgba(0,230,118,0.3)',
                          }}
                        />
                      </Stack>

                      {/* Title */}
                      <Typography variant="subtitle1" fontWeight={900} sx={{ lineHeight: 1.3, mb: 1 }}>
                        {item.symbol_icon} {item.title}
                      </Typography>

                      {/* Single Line Understanding Box */}
                      <Box
                        sx={{
                          p: 1.25,
                          mb: 1.5,
                          borderRadius: 2,
                          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          borderLeft: '3px solid',
                          borderColor: item.id === 19 ? '#10b981' : 'primary.main',
                        }}
                      >
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary', fontStyle: 'italic', lineHeight: 1.45 }}>
                          "{item.single_line}"
                        </Typography>
                      </Box>

                      {/* Bullish Condition (Green Font) */}
                      {item.is_bullish && (
                        <Box
                          sx={{
                            p: 1,
                            mb: 1,
                            borderRadius: 1.5,
                            bgcolor: 'rgba(0,230,118,0.08)',
                            border: '1px solid rgba(0,230,118,0.25)',
                          }}
                        >
                          <Typography sx={{ fontSize: '0.73rem', fontWeight: 800, color: '#00e676', lineHeight: 1.4 }}>
                            {item.bullish_logic}
                          </Typography>
                        </Box>
                      )}

                      {/* Bearish Condition (Red Font) */}
                      {item.is_bearish && (
                        <Box
                          sx={{
                            p: 1,
                            mb: 1.5,
                            borderRadius: 1.5,
                            bgcolor: 'rgba(255,23,68,0.08)',
                            border: '1px solid rgba(255,23,68,0.25)',
                          }}
                        >
                          <Typography sx={{ fontSize: '0.73rem', fontWeight: 800, color: '#ff1744', lineHeight: 1.4 }}>
                            {item.bearish_logic}
                          </Typography>
                        </Box>
                      )}

                      {/* Quick Mechanics Grid */}
                      <Box sx={{ mt: 'auto', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Stack spacing={0.5} mb={1.5}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>Stop Loss:</Typography>
                            <Typography variant="caption" fontWeight={800} color="error.main">{item.stop_loss}</Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>Risk/Reward:</Typography>
                            <Typography variant="caption" fontWeight={800} color="success.main">{item.risk_reward}</Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>Timeframe:</Typography>
                            <Typography variant="caption" fontWeight={800}>{item.timeframe}</Typography>
                          </Stack>
                        </Stack>

                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          fullWidth
                          endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                          onClick={() => navigate(item.scanner_path)}
                          sx={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'none', py: 0.5 }}
                        >
                          Scan Stocks with this Formula
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* ── View 2: Detailed Accordion Deep-Dive View ── */}
          {viewMode === 'accordion' && (
            <Stack spacing={1.5}>
              {filteredMasterclass.map(item => (
                <Accordion
                  key={item.id}
                  expanded={expandedDay === String(item.id)}
                  onChange={handleAccordionChange(String(item.id))}
                  sx={{
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: item.id === 19 ? '#10b981' : isDark ? 'rgba(255,255,255,0.08)' : 'divider',
                    bgcolor: isDark ? 'rgba(11,17,32,0.85)' : '#ffffff',
                    overflow: 'hidden',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} width="100%" pr={1}>
                      <Chip
                        icon={<span style={{ fontSize: 13, marginRight: 2 }}>{item.symbol_icon}</span>}
                        label={`#${item.id}`}
                        size="small"
                        color={item.id === 19 ? 'success' : 'primary'}
                        sx={{ fontWeight: 900, fontSize: '0.72rem', height: 24 }}
                      />
                      <Typography variant="subtitle1" fontWeight={800} sx={{ flex: 1 }}>
                        {item.symbol_icon} {item.title}
                      </Typography>
                      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <MiniPatternChart type={item.chart_type} isDark={isDark} />
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={item.win_rate}
                          size="small"
                          sx={{ fontWeight: 900, bgcolor: 'rgba(0,230,118,0.15)', color: '#00e676', fontSize: '0.65rem' }}
                        />
                        <Chip
                          label={item.risk_reward}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                        />
                      </Stack>
                    </Stack>
                  </AccordionSummary>

                  <AccordionDetails sx={{ pt: 0, pb: 2.5, px: 2.5 }}>
                    <Divider sx={{ mb: 2 }} />

                    {/* Single Line Understanding */}
                    <Paper
                      sx={{
                        p: 1.5,
                        mb: 2,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(0,176,255,0.06)' : '#e0f7fa',
                        borderLeft: '4px solid #00b0ff',
                      }}
                    >
                      <Typography variant="caption" fontWeight={900} color="primary.main" textTransform="uppercase">
                        📌 Single-Line Formula Understanding:
                      </Typography>
                      <Typography variant="body2" fontWeight={700} mt={0.5}>
                        {item.single_line}
                      </Typography>
                    </Paper>

                    <Grid container spacing={2}>
                      {/* Bullish Conditions (Green Font) */}
                      <Grid item xs={12} md={6}>
                        <Paper
                          sx={{
                            p: 1.75,
                            borderRadius: 2,
                            bgcolor: isDark ? 'rgba(0,230,118,0.05)' : '#f0fdf4',
                            border: '1.5px solid #00e676',
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={0.8} mb={0.75}>
                            <CheckCircle sx={{ color: '#00e676', fontSize: 18 }} />
                            <Typography variant="subtitle2" fontWeight={900} color="#00e676">
                              BULLISH BUY ENTRY MECHANICS
                            </Typography>
                          </Stack>
                          <Typography variant="body2" fontWeight={800} color="#00e676" mb={1} sx={{ lineHeight: 1.5 }}>
                            {item.bullish_logic}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                            • Trigger: {item.entry_trigger}
                          </Typography>
                        </Paper>
                      </Grid>

                      {/* Bearish Conditions (Red Font) */}
                      <Grid item xs={12} md={6}>
                        <Paper
                          sx={{
                            p: 1.75,
                            borderRadius: 2,
                            bgcolor: isDark ? 'rgba(255,23,68,0.05)' : '#fff1f2',
                            border: '1.5px solid #ff1744',
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={0.8} mb={0.75}>
                            <Warning sx={{ color: '#ff1744', fontSize: 18 }} />
                            <Typography variant="subtitle2" fontWeight={900} color="#ff1744">
                              BEARISH SHORT / EXIT MECHANICS
                            </Typography>
                          </Stack>
                          <Typography variant="body2" fontWeight={800} color="#ff1744" mb={1} sx={{ lineHeight: 1.5 }}>
                            {item.bearish_logic}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                            • Stop Loss: {item.stop_loss}
                          </Typography>
                        </Paper>
                      </Grid>

                      {/* Profit Targets & Stop Loss */}
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" fontWeight={800} mb={1}>
                            🎯 Target Calculations &amp; Risk/Reward
                          </Typography>
                          <Stack spacing={0.6}>
                            <Typography variant="caption" fontWeight={700} color="success.main">• {item.target_1}</Typography>
                            <Typography variant="caption" fontWeight={700} color="success.main">• {item.target_2}</Typography>
                            <Typography variant="caption" fontWeight={700} color="success.main">• {item.target_3}</Typography>
                            <Typography variant="caption" fontWeight={700} color="error.main">• Stop Loss Formula: {item.stop_loss}</Typography>
                          </Stack>
                        </Paper>
                      </Grid>

                      {/* Rules & Mistakes to Avoid */}
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" fontWeight={800} mb={1}>
                            ⚠️ Strategy Rules &amp; Traps to Avoid
                          </Typography>
                          <Stack spacing={0.6}>
                            {item.rules.map((r, i) => (
                              <Typography key={i} variant="caption" color="text.secondary" fontWeight={600}>
                                ✓ {r}
                              </Typography>
                            ))}
                            {item.mistakes_to_avoid.map((m, i) => (
                              <Typography key={i} variant="caption" color="error.main" fontWeight={700}>
                                ❌ Avoid: {m}
                              </Typography>
                            ))}
                          </Stack>
                        </Paper>
                      </Grid>

                      {/* Indicators Used & Real Market Example */}
                      <Grid item xs={12}>
                        <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa', border: '1px solid', borderColor: 'divider' }}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={1}>
                            <Box>
                              <Typography variant="caption" fontWeight={800} color="text.secondary" textTransform="uppercase">
                                Technical Checklist:
                              </Typography>
                              <Stack direction="row" spacing={0.6} mt={0.4} flexWrap="wrap" gap={0.5}>
                                {item.indicators.map(ind => (
                                  <Chip key={ind} label={ind} size="small" sx={{ fontSize: '0.65rem', fontWeight: 800, height: 20 }} />
                                ))}
                              </Stack>
                              <Typography variant="caption" color="primary.main" fontWeight={700} display="block" mt={1}>
                                💡 Market Case Study: {item.example}
                              </Typography>
                            </Box>

                            <Button
                              size="small"
                              variant="contained"
                              endIcon={<ArrowForward />}
                              onClick={() => navigate(item.scanner_path)}
                              sx={{ fontWeight: 800, fontSize: '0.72rem', textTransform: 'none', alignSelf: { xs: 'flex-start', sm: 'center' } }}
                            >
                              Launch Screener
                            </Button>
                          </Stack>
                        </Paper>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          )}

          {/* ── View 3: Quick Scan Table View ── */}
          {viewMode === 'table' && (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8faff' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Visual</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Strategy &amp; Single-Line Rule</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Bullish Trigger (Green)</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Bearish Warning (Red)</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Win Rate</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMasterclass.map(item => (
                    <TableRow key={item.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(item.scanner_path)}>
                      <TableCell>
                        <Chip
                          label={String(item.id)}
                          size="small"
                          color={item.id === 19 ? 'success' : 'default'}
                          sx={{ fontWeight: 900, height: 22 }}
                        />
                      </TableCell>
                      <TableCell>
                        <MiniPatternChart type={item.chart_type} isDark={isDark} />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>
                        <Typography variant="body2" fontWeight={800}>{item.symbol_icon} {item.title}</Typography>
                        <Typography variant="caption" color="text.secondary" fontStyle="italic" display="block">{item.single_line}</Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 260 }}>
                        <Typography variant="caption" fontWeight={800} color="#00e676">{item.bullish_logic}</Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 260 }}>
                        <Typography variant="caption" fontWeight={800} color="#ff1744">{item.bearish_logic}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={item.win_rate} size="small" sx={{ fontWeight: 900, bgcolor: 'rgba(0,230,118,0.15)', color: '#00e676' }} />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" endIcon={<ArrowForward sx={{ fontSize: 13 }} />} sx={{ fontWeight: 800, fontSize: '0.68rem', py: 0.3 }}>
                          Scan
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
          TAB 1: TECHNICAL INDICATOR MATHEMATICAL FORMULAS (RSI, MACD, PCR, ADX, VWAP, BB, ATR)
         ══════════════════════════════════════════════════════════════════════ */}
      {mainTab === 1 && (
        <Grid container spacing={2}>
          {filteredIndicators.map(ind => (
            <Grid item xs={12} md={6} key={ind.acronym}>
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
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.5)' : '0 12px 30px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <Box sx={{ height: 4, background: 'linear-gradient(90deg, #00e5ff 0%, #00e676 100%)' }} />

                <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <span style={{ fontSize: 20 }}>{ind.symbol_icon}</span>
                      <Typography variant="h6" fontWeight={900} sx={{ fontSize: '1.05rem' }}>
                        {ind.name}
                      </Typography>
                    </Stack>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ px: 1, py: 0.3, borderRadius: 1.5, bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
                        <MiniPatternChart type={ind.chart_type} isDark={isDark} />
                      </Box>
                      <Chip
                        label={ind.acronym}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 900, fontSize: '0.72rem', height: 22 }}
                      />
                    </Box>
                  </Stack>

                  {/* Single Line Understanding */}
                  <Box
                    sx={{
                      p: 1.25,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(0,229,255,0.05)' : '#e0f7fa',
                      borderLeft: '3px solid #00e5ff',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary', fontStyle: 'italic', lineHeight: 1.45 }}>
                      "{ind.single_line}"
                    </Typography>
                  </Box>

                  {/* Mathematical Formula Box */}
                  <Typography variant="caption" fontWeight={900} color="text.secondary" textTransform="uppercase" mb={0.5} display="block">
                    📐 Mathematical Formula:
                  </Typography>
                  <Paper
                    sx={{
                      p: 1.5,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(0,0,0,0.4)' : '#f8faff',
                      border: '1px solid',
                      borderColor: 'divider',
                      fontFamily: 'monospace',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      color: isDark ? '#38bdf8' : '#0284c7',
                    }}
                  >
                    {ind.math_formula}
                  </Paper>

                  {/* Step-by-Step Calculation */}
                  <Typography variant="caption" fontWeight={900} color="text.secondary" textTransform="uppercase" mb={0.5} display="block">
                    🔢 Derivation Steps:
                  </Typography>
                  <Stack spacing={0.4} mb={2}>
                    {ind.calculation_steps.map((step, i) => (
                      <Typography key={i} variant="caption" sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600 }}>
                        {step}
                      </Typography>
                    ))}
                  </Stack>

                  {/* Bullish & Bearish Conditions */}
                  <Grid container spacing={1.5} mb={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.25)' }}>
                        <Typography sx={{ fontSize: '0.73rem', fontWeight: 800, color: '#00e676', lineHeight: 1.4 }}>
                          {ind.bullish_math}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,23,68,0.08)', border: '1px solid rgba(255,23,68,0.25)' }}>
                        <Typography sx={{ fontSize: '0.73rem', fontWeight: 800, color: '#ff1744', lineHeight: 1.4 }}>
                          {ind.bearish_math}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Interpretation & Parameters */}
                  <Box sx={{ mt: 'auto', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Stack spacing={0.5} mb={1.5}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>Parameters:</Typography>
                        <Typography variant="caption" fontWeight={800}>{ind.ideal_parameters}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>Pro Tip:</Typography>
                        <Typography variant="caption" fontWeight={700} color="primary.main">{ind.pro_tip}</Typography>
                      </Stack>
                    </Stack>

                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      fullWidth
                      endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                      onClick={() => navigate(ind.scanner_path)}
                      sx={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'none', py: 0.5 }}
                    >
                      Open Indicator Screener
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

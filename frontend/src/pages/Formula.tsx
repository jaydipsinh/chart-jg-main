import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Accordion, AccordionSummary,
  AccordionDetails, Chip, Stack, TextField, MenuItem, Button,
  Card, CardContent, InputAdornment, IconButton, Tooltip,
  Divider, ToggleButtonGroup, ToggleButton, useTheme,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  ExpandMore, School, Search, TrendingUp, TrendingDown,
  Bolt, PlayCircle, CheckCircle, Warning, AutoAwesome,
  FilterList, ViewModule, ViewList, TableRows, OpenInNew,
  Bookmark, ArrowForward, Verified, Whatshot, Security,
  Timeline, Speed, MonetizationOn, BarChart,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { fetchFormulas } from '../services/api';
import type { FormulaEntry } from '../utils/types';

// ── Complete Chetan Verma 100-Day Trading Masterclass & Institutional Formula Data ──
export interface MasterclassStrategy {
  day: number | string;
  day_tag: string;
  title: string;
  category: 'Chetan Verma Series' | 'Candlesticks & Price Action' | 'EMA & Indicators' | 'Smart Money & Order Flow';
  single_line: string;
  is_bullish: boolean;
  is_bearish: boolean;
  bullish_display: string;
  bearish_display: string;
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
  video_url: string;
}

export const CHETAN_VERMA_STRATEGIES: MasterclassStrategy[] = [
  {
    day: 19,
    day_tag: 'Day 19: Chetan Verma Featured Masterclass',
    title: '9 EMA + 15-Min Breakout & Retest with Order Flow Confirmation',
    category: 'Chetan Verma Series',
    single_line: 'When a strong 15-minute candle breaks key resistance and retests the rising 9 EMA with a green confirmation candle + volume > 1.5x, enter for high-probability momentum.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: 15-min candle closes above Resistance/EMA 9. Wait for retest pullback touching 9 EMA. Enter on next green candle with Volume > 1.5x.',
    bearish_display: '🔴 BEARISH SHORT: 15-min candle closes below Support/EMA 9. Wait for upward retest rejection at 9 EMA. Enter on next red candle breakdown.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 1,
    day_tag: 'Day 1: Candlestick Foundation',
    title: 'Hammer & Inverted Hammer at Key Support Zone',
    category: 'Candlesticks & Price Action',
    single_line: 'Long lower shadow at least 2x the body at major support signifies institutional liquidity sweep and aggressive buyer absorption.',
    is_bullish: true,
    is_bearish: false,
    bullish_display: '🟢 BULLISH BUY: Hammer forms after downtrend at major Support / S1 Pivot. Lower wick ≥ 2x body length with strong volume spike.',
    bearish_display: '🔴 BEARISH REVERSAL: Inverted Hammer fails to follow through and breaks below low → signals continuation of selling.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 2,
    day_tag: 'Day 2: Order Flow Dominance',
    title: 'Bullish & Bearish Engulfing Master Setup',
    category: 'Candlesticks & Price Action',
    single_line: 'A massive body candle completely engulfing the prior opposite candle demonstrates total institutional control over order flow.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: Large green candle fully engulfs prior red candle body + wicks at support with volume surge.',
    bearish_display: '🔴 BEARISH SHORT: Large red candle fully engulfs prior green candle body at key resistance / 52-week high.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 3,
    day_tag: 'Day 3: 3-Candle Reversal',
    title: 'Morning Star (Bullish) & Evening Star (Bearish) Master Pattern',
    category: 'Candlesticks & Price Action',
    single_line: '3-Candle structure: strong impulse candle, indecision doji/spinning top at extreme, followed by massive reversal candle closing past 50% of candle 1.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: Morning Star (Red Candle → Gap/Small Doji at Support → Big Green Candle closing above 60% of Candle 1).',
    bearish_display: '🔴 BEARISH SHORT: Evening Star (Green Candle → Small Doji at Resistance → Big Red Candle closing below 60% of Candle 1).',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 4,
    day_tag: 'Day 4: Piercing & Cloud Formations',
    title: 'Piercing Pattern (Bullish) & Dark Cloud Cover (Bearish)',
    category: 'Candlesticks & Price Action',
    single_line: 'Opening gap followed by aggressive institutional counter-drive closing beyond the 50% midpoint of the previous candle body.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: Piercing Pattern opens with gap down but bulls drive price to close above 50% of prior red candle body.',
    bearish_display: '🔴 BEARISH SHORT: Dark Cloud Cover opens with gap up at resistance but bears drive price to close below 50% of prior green candle body.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 5,
    day_tag: 'Day 5: Institutional Momentum Waves',
    title: 'Three White Soldiers (Bullish) & Three Black Crows (Bearish)',
    category: 'Candlesticks & Price Action',
    single_line: 'Three consecutive strong full-body candles opening within previous body and making consecutive higher closes with expanding volume.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: Three White Soldiers breakout from consolidation with consecutive higher highs, small wicks, expanding volume.',
    bearish_display: '🔴 BEARISH SHORT: Three Black Crows breakdown with consecutive lower lows, heavy red volume → strong short momentum.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 6,
    day_tag: 'Day 6: Doji Liquidity Reversals',
    title: 'Dragonfly Doji (Bullish) & Gravestone Doji (Bearish)',
    category: 'Candlesticks & Price Action',
    single_line: 'Open, high, and close near identical with a giant lower or upper shadow indicating extreme rejection of lower/higher prices.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: Dragonfly Doji at major support / 200 EMA indicates massive buying rejection of lower price zone.',
    bearish_display: '🔴 BEARISH SHORT: Gravestone Doji at resistance indicates bulls were completely rejected at highs.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 7,
    day_tag: 'Day 7: Key Level Breakouts',
    title: 'Support & Resistance Breakout with Volume Expansion',
    category: 'Candlesticks & Price Action',
    single_line: 'Price compresses against horizontal barrier 3+ times; when breakout candle closes beyond with 2x+ average volume, explosive continuation follows.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: Clean breakout above major multi-day Resistance with Volume Ratio > 2.0x and closing above level.',
    bearish_display: '🔴 BEARISH SHORT: Breakdown below major multi-day Support with Volume Ratio > 2.0x and closing below level.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 8,
    day_tag: 'Day 8: Classical Chart Patterns',
    title: 'Double Bottom (W-Pattern) & Double Top (M-Pattern)',
    category: 'Candlesticks & Price Action',
    single_line: 'Two tests of a support/resistance level forming a W or M structure; breakout through the central neckline confirms massive trend reversal.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: W-Pattern Double Bottom forms at support with 2nd bottom showing RSI bullish divergence. Buy on neckline breakout.',
    bearish_display: '🔴 BEARISH SHORT: M-Pattern Double Top forms at resistance with 2nd top showing RSI bearish divergence. Sell on neckline breakdown.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 9,
    day_tag: 'Day 9: Structural Reversals',
    title: 'Inverse Head & Shoulders (Bullish) & Head & Shoulders (Bearish)',
    category: 'Candlesticks & Price Action',
    single_line: 'Three-trough structure (Left Shoulder, Lower Head, Higher Right Shoulder) indicating seller exhaustion and institutional accumulation.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: Inverse H&S forms after downtrend. Right shoulder forms above Head. Buy when Neckline breaks with high volume.',
    bearish_display: '🔴 BEARISH SHORT: Regular H&S forms at top. Right shoulder fails to make new high. Sell when Neckline breaks downward.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 10,
    day_tag: 'Day 10: Multi-Week Accumulation',
    title: 'Cup & Handle Master Pattern (Institutional Shakeout)',
    category: 'Candlesticks & Price Action',
    single_line: 'Rounded U-shaped accumulation base followed by a shallow downward handle shakeout; breakout above the rim signals massive multi-month rally.',
    is_bullish: true,
    is_bearish: false,
    bullish_display: '🟢 BULLISH BUY: U-shaped Cup + Handle retrace < 38.2% of cup depth. Enter on breakout above rim resistance with 2x+ volume.',
    bearish_display: '🔴 BEARISH AVOID: If handle retraces deeper than 50% of cup depth, pattern fails and breaks down.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 11,
    day_tag: 'Day 11: Volatility Compression',
    title: 'Ascending Triangle & Symmetrical Triangle Breakout',
    category: 'Candlesticks & Price Action',
    single_line: 'Flat horizontal resistance with rising higher lows creates intense volatility compression until price violently explodes upward.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: Ascending Triangle (Flat Top + Rising Trendline) breaks out upward with volume spike.',
    bearish_display: '🔴 BEARISH SHORT: Descending Triangle (Flat Bottom + Falling Trendline) breaks down downward with volume spike.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 12,
    day_tag: 'Day 12: High-Momentum Continuation',
    title: 'Bull Flag & Bear Flag Fast-Trend Continuation',
    category: 'Candlesticks & Price Action',
    single_line: 'Steep near-vertical flagpole impulse followed by tight 3-5 candle parallel channel pullback; breakout of channel continues impulse with equal flagpole length.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: Bull Flag pole (+3% to +8% rally) + tight low-volume flag channel. Buy when upper flag trendline breaks.',
    bearish_display: '🔴 BEARISH SHORT: Bear Flag pole (sharp drop) + low-volume upward flag channel. Sell when lower flag trendline breaks.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 13,
    day_tag: 'Day 13: Momentum Divergence',
    title: 'RSI Bullish Divergence (Regular & Hidden Divergence)',
    category: 'EMA & Indicators',
    single_line: 'Price makes lower lows but RSI indicator makes higher lows at key support; indicates smart money is accumulating while retail sellers exhaust.',
    is_bullish: true,
    is_bearish: false,
    bullish_display: '🟢 BULLISH BUY: Regular Divergence (Price Lower Low + RSI Higher Low) or Hidden Divergence (Price Higher Low + RSI Lower Low in uptrend).',
    bearish_display: '🔴 BEARISH ALERT: Watch for RSI Bearish Divergence (Price Higher High + RSI Lower High) at overbought resistance.',
    entry_trigger: 'Buy when price breaks above previous candle high following divergence confirmation and RSI crosses above 40/50.',
    stop_loss: 'SL below the lowest price swing low.',
    target_1: 'Target 1: 1:2.0 R:R (RSI reaching 60)',
    target_2: 'Target 2: 1:3.0 R:R (RSI reaching 70)',
    target_3: 'Target 3: Previous major swing high',
    timeframe: '15m, 1H, Daily',
    win_rate: '84% Win Rate',
    risk_reward: '1:2.5 R:R',
    indicators: ['RSI 14', 'Support Line', 'MACD Histogram Turn'],
    rules: ['Divergence must be clearly visible between two distinct swing points.'],
    mistakes_to_avoid: ['Entering solely on RSI without price action candle confirmation.'],
    example: 'NIFTY Daily: Price makes Lower Low at 24,000 but RSI makes Higher Low at 38 → rallies 800 points.',
    scanner_path: '/indicators',
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 14,
    day_tag: 'Day 14: Overbought Reversals',
    title: 'RSI Bearish Divergence & Overbought Exhaustion',
    category: 'EMA & Indicators',
    single_line: 'Price pushes to new high but RSI fails to exceed previous high and rolls over below 70; signals smart money distribution.',
    is_bullish: false,
    is_bearish: true,
    bullish_display: '🟢 BULLISH RECOVERY: When RSI resets to 50 support without breaking price structure, look for continuation.',
    bearish_display: '🔴 BEARISH SHORT: Price makes Higher High at resistance while RSI makes Lower High below 70. Enter short on breakdown.',
    entry_trigger: 'Short when price breaks below the low of the candle that formed the divergence.',
    stop_loss: 'SL above the highest price swing high.',
    target_1: 'Target 1: 1:2.0 R:R (RSI reaching 50)',
    target_2: 'Target 2: 1:3.0 R:R (EMA 50 support)',
    target_3: 'Target 3: Major swing low support',
    timeframe: '15m, 1H, Daily',
    win_rate: '83% Win Rate',
    risk_reward: '1:2.5 R:R',
    indicators: ['RSI 14 Overbought > 70', 'Resistance Zone', 'Bearish Engulfing'],
    rules: ['Best when combined with bearish candlestick pattern at resistance.'],
    mistakes_to_avoid: ['Shorting strong momentum stocks that stay overbought during secular bull runs.'],
    example: 'TITAN makes new high at ₹3,850 with RSI Divergence at 68 vs 78 → drops to ₹3,620.',
    scanner_path: '/top-sellers',
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 15,
    day_tag: 'Day 15: Intraday Scalping Engine',
    title: '9 EMA Intraday Scalping & Pullback Strategy (5m & 15m)',
    category: 'EMA & Indicators',
    single_line: 'Fast-moving 9 EMA acts as dynamic support in strong trends; buy whenever price touches 9 EMA and prints a rejection candle with green close.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH SCALP: Price > 9 EMA > VWAP. Buy on 5m/15m dip to 9 EMA when green rejection candle confirms.',
    bearish_display: '🔴 BEARISH SCALP: Price < 9 EMA < VWAP. Sell on 5m/15m rally to 9 EMA when red rejection candle confirms.',
    entry_trigger: 'Enter at market upon close of candle bouncing off 9 EMA.',
    stop_loss: 'SL 1 tick below the bounce candle low (typically 0.3% - 0.5%).',
    target_1: 'Target 1: 1:1.5 R:R (quick scalp)',
    target_2: 'Target 2: 1:2.5 R:R (day high)',
    target_3: 'Target 3: Trail with 9 EMA till candle closes on wrong side',
    timeframe: '3m, 5m, 15m',
    win_rate: '85% Win Rate',
    risk_reward: '1:2.0 R:R',
    indicators: ['9 EMA', 'VWAP', 'Intraday Order Flow Delta'],
    rules: ['Only trade in direction of the 15-minute and 1-hour trend.'],
    mistakes_to_avoid: ['Trading 9 EMA bounces in sideways range-bound market.'],
    example: 'BANKNIFTY on 5m: touches 9 EMA at 51,200, prints hammer, rallies to 51,450.',
    scanner_path: '/top-buy',
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 16,
    day_tag: 'Day 16: Golden Cross & Moving Average Stack',
    title: '20 EMA + 50 EMA Golden Cross & Alignment System',
    category: 'EMA & Indicators',
    single_line: 'When 20 EMA crosses above 50 EMA and both slope upward at 45 degrees with Price > 200 EMA, a powerful multi-week trend is initiated.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: 20 EMA crosses above 50 EMA (Golden Cross). Price pulls back to 20 EMA → Buy on green candle.',
    bearish_display: '🔴 BEARISH SHORT: 20 EMA crosses below 50 EMA (Death Cross). Price rallies to 20 EMA → Sell on red candle.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 17,
    day_tag: 'Day 17: Trend Following Mastery',
    title: 'Supertrend (10, 3) + 200 EMA Institutional Trend Engine',
    category: 'EMA & Indicators',
    single_line: 'Filter trades by 200 EMA (bias filter); only take Supertrend GREEN buy signals when Price > 200 EMA for effortless trend following.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: Price > 200 EMA AND Supertrend (10,3) turns GREEN with volume confirmation.',
    bearish_display: '🔴 BEARISH SHORT: Price < 200 EMA AND Supertrend (10,3) turns RED with volume confirmation.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 18,
    day_tag: 'Day 18: Institutional Benchmark',
    title: 'VWAP + Volume Spike Institutional Intraday Breakout',
    category: 'EMA & Indicators',
    single_line: 'VWAP represents the institutional average execution price; price breaking above VWAP with a 2x volume spike confirms massive institutional buying.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: Price crosses above VWAP + Upper Band with Volume > 2x average. Retest of VWAP holds as support.',
    bearish_display: '🔴 BEARISH SHORT: Price breaks below VWAP with heavy volume and fails to re-cross above VWAP.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 20,
    day_tag: 'Day 20: Smart Money Concept (SMC)',
    title: 'Order Block (OB) & Fair Value Gap (FVG) Retest Strategy',
    category: 'Smart Money & Order Flow',
    single_line: 'Last down candle before a massive explosive upward impulse creates a Bullish Order Block (OB); when price returns to mitigate the FVG/OB, enter with institutional limit orders.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: Price drops into Bullish Order Block (OB) and fills the Fair Value Gap (FVG). Enter on lower timeframe shift.',
    bearish_display: '🔴 BEARISH SHORT: Price rallies into Bearish Order Block (OB) and fills FVG. Enter short on rejection.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 21,
    day_tag: 'Day 21: Market Structure Shift',
    title: 'Break of Structure (BOS) & Change of Character (CHoCH)',
    category: 'Smart Money & Order Flow',
    single_line: 'CHoCH signals the first structural trend reversal when a key swing point is breached; subsequent BOS confirms the continuation of the new institutional trend.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: Bullish CHoCH breaks prior lower high. Wait for pullback to discount OB, then enter on Bullish BOS.',
    bearish_display: '🔴 BEARISH SHORT: Bearish CHoCH breaks prior higher low. Wait for pullback to premium OB, then enter on Bearish BOS.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 22,
    day_tag: 'Day 22: Anti-Retail Traps',
    title: 'Liquidity Sweep & Stop Hunt False Breakdown Reversal',
    category: 'Smart Money & Order Flow',
    single_line: 'Smart money forces price to breach popular retail support/resistance to trigger stop losses and collect liquidity, then violently reverses.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: Price pierces support, triggers retail stop losses, but candle immediately closes back ABOVE support with a long wick (Turtle Soup).',
    bearish_display: '🔴 BEARISH SHORT: Price pierces resistance, traps retail buyers, then closes back BELOW resistance with heavy upper wick.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 23,
    day_tag: 'Day 23: Volume Expansion Engine',
    title: '3-Day / 5-Day / 7-Day Volume Shocker Breakout Rule',
    category: 'Smart Money & Order Flow',
    single_line: 'When daily volume exceeds 3x to 7x the historical average along with a price surge, it indicates institutional block accumulation that persists for 3–10 sessions.',
    is_bullish: true,
    is_bearish: false,
    bullish_display: '🟢 BULLISH BUY: Volume Shockers Ratio > 3.0x with Price Gain > 2.0% and Delivery % > 50%. High-conviction swing hold.',
    bearish_display: '🔴 BEARISH WARNING: Volume Shocker with Price Drop > 3% signals massive institutional unloading / distribution.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 24,
    day_tag: 'Day 24: Derivatives & OI Engine',
    title: 'Open Interest (OI) Long Buildup & Short Covering Squeeze',
    category: 'Smart Money & Order Flow',
    single_line: 'Long Buildup (Price ↑ + OI ↑) signals fresh institutional capital inflow; Short Covering (Price ↑ + OI ↓) triggers explosive short squeezes.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: Long Buildup (Price +2% + OI +15%) or Short Squeeze (Price breaks resistance as Call OI unwinds).',
    bearish_display: '🔴 BEARISH SHORT: Short Buildup (Price -2% + OI +15%) or Long Unwinding (Price drops + OI drops).',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 25,
    day_tag: 'Day 25: Contrarian Sentiment Engine',
    title: 'Option Chain PCR (Put-Call Ratio) Contrarian Turnaround',
    category: 'Smart Money & Order Flow',
    single_line: 'Extreme Put-Call Ratio readings indicate retail panic or complacency; PCR < 0.60 signals extreme oversold buy opportunity, PCR > 1.40 signals top.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: Nifty/Stock PCR drops to 0.55–0.70 at support while Put writing increases at round strikes → contrarian rally.',
    bearish_display: '🔴 BEARISH SHORT: PCR spikes above 1.50 at resistance with heavy Call unwinding → contrarian selloff risk.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 26,
    day_tag: 'Day 26: Session Open Strategy',
    title: 'Opening Range Breakout (ORB 15-Minute Rule)',
    category: 'Chetan Verma Series',
    single_line: 'Mark the High and Low of the first 15-minute candle (09:15–09:30 IST); when candle 2 or 3 breaks and closes outside the range, trade the expansion in that direction.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH BUY: 15-min candle (09:15-09:30) high is breached and confirmed by 2nd candle closing above high + Volume > 1.5x.',
    bearish_display: '🔴 BEARISH SHORT: 15-min candle low is breached and confirmed by candle closing below low + heavy red volume.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 27,
    day_tag: 'Day 27: Gap Dynamics',
    title: 'Gap Up & Gap Down Institutional Fill vs Runway Rule',
    category: 'Chetan Verma Series',
    single_line: 'Small gaps (<0.7%) typically fill within 45 minutes; large institutional runaway gaps (>1.5% with massive opening volume) never fill and trend aggressively.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH RUNWAY: Gap Up holds above opening low for first 15 mins AND stays above VWAP → Buy for runaway trend day.',
    bearish_display: '🔴 BEARISH GAP FILL: Gap Up fails to break opening high, falls below VWAP → Short for complete gap fill back to yesterday close.',
    entry_trigger: 'Runway: Buy on breakout of 15m High. Gap Fill: Short on breakdown below VWAP.',
    stop_loss: 'Runway: SL below Day Low. Gap Fill: SL above Day High.',
    target_1: 'Target 1: Gap Fill = Yesterday Close | Runway = 1:2.0 R:R',
    target_2: 'Target 2: 1:3.0 R:R',
    target_3: 'Target 3: Full expansion day',
    timeframe: '5m & 15m',
    win_rate: '85% Win Rate',
    risk_reward: '1:2.5 R:R',
    indicators: ['Yesterday Close Reference', 'Opening Gap %', 'VWAP Status', 'Tick Momentum'],
    rules: ['Check pre-open volume and sector breadth to classify gap type.'],
    mistakes_to_avoid: ['Trying to fade a strong institutional runaway gap on global cues.'],
    example: 'TCS gaps up +2% on earnings, holds VWAP at 9:30 AM → rallies another +3% intraday.',
    scanner_path: '/top-buyers',
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 28,
    day_tag: 'Day 28: Multi-Timeframe Confluence',
    title: 'Top-Down Alignment Formula (Monthly + Weekly + Daily + 15m)',
    category: 'Chetan Verma Series',
    single_line: 'Never trade against higher timeframe trend; when Monthly is Bullish, Weekly is Bullish, Daily is in Pullback, and 15m triggers Buy, win rate exceeds 90%.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 PERFECT BULLISH ALIGNMENT: Monthly > 20 EMA + Weekly > 20 EMA + Daily at 20 EMA Support + 15m Green Confirmation.',
    bearish_display: '🔴 PERFECT BEARISH ALIGNMENT: Monthly < 20 EMA + Weekly < 20 EMA + Daily at 20 EMA Resistance + 15m Breakdown.',
    entry_trigger: 'Enter on 15m trigger candle aligned with Daily and Weekly trend.',
    stop_loss: 'SL below 15m swing low (ultra-tight risk on higher timeframe move).',
    target_1: 'Target 1: Daily swing high (1:3.0 R:R)',
    target_2: 'Target 2: Weekly swing high (1:5.0 R:R)',
    target_3: 'Target 3: Monthly structural breakout (1:8.0+ R:R)',
    timeframe: '15m entry based on Weekly/Daily analysis',
    win_rate: '91% Win Rate',
    risk_reward: '1:4.0 to 1:8.0 R:R',
    indicators: ['Multi-Timeframe EMA Stack', 'Sector Confluence', 'Relative Strength vs Nifty'],
    rules: ['If higher timeframe is Bearish, IGNORE all lower timeframe buy signals.'],
    mistakes_to_avoid: ['Overtrading lower timeframe 1-minute noise.'],
    example: 'BHARTIARTL: Monthly/Weekly in strong uptrend, Daily pulls back to ₹1,550, 15m triggers buy → surges to ₹1,720.',
    scanner_path: '/quant-screener',
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 29,
    day_tag: 'Day 29: Risk Management & R:R',
    title: '1:3+ Risk-to-Reward & 1.5x ATR Dynamic Trailing Stop Rule',
    category: 'Chetan Verma Series',
    single_line: 'Risk only 1% to 1.5% of total trading capital per trade; maintain minimum 1:2.5 Risk-to-Reward so even a 50% win rate generates immense profitability.',
    is_bullish: true,
    is_bearish: true,
    bullish_display: '🟢 BULLISH CAPITAL RULE: Max Risk = 1% Capital. Stop Loss = 1.5× ATR below entry. Target = 3× ATR above entry (1:2 minimum).',
    bearish_display: '🔴 RISK WARNING: Never enter a trade where Risk-to-Reward is worse than 1:1.5. Cut losing trades ruthlessly.',
    entry_trigger: 'Calculate Position Size = (Account Capital × 1%) ÷ (Entry Price − Stop Loss Price).',
    stop_loss: 'Trailing SL moves to Breakeven once Target 1 (1:1.5) is achieved.',
    target_1: 'Target 1: Book 50% profits at 1:1.5 R:R, move SL to Cost',
    target_2: 'Target 2: Book 30% profits at 1:2.5 R:R',
    target_3: 'Target 3: Let remaining 20% ride with 1.5x ATR trailing stop',
    timeframe: 'Universal (All Timeframes)',
    win_rate: 'Capital Protection Rule',
    risk_reward: '1:3.0 R:R Standard',
    indicators: ['ATR (Average True Range)', 'Position Size Calculator', 'Trailing Stop Metric'],
    rules: [
      'Never risk more than 1.5% of total portfolio on a single trade setup.',
      'Always trail stop loss to breakeven after hitting Target 1.',
    ],
    mistakes_to_avoid: ['Averaging down on losing trades (adding to losers is fatal).'],
    example: 'Account ₹5,00,000 → Max Risk = ₹5,000. Risk ₹20/share → Buy 250 shares. Target ₹60/share → Profit ₹15,000.',
    scanner_path: '/today-result',
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
  {
    day: 30,
    day_tag: 'Day 30: Institutional 200-Point AI Master Engine',
    title: '200-Point Institutional AI Master Buy Checklist (All-in-One Rule)',
    category: 'Chetan Verma Series',
    single_line: 'Combines 12 multi-factor pillars (Technicals 50, Fundamentals 40, Derivatives 35, Volume 20, Relative Strength 15, SMC 15) to identify 90%+ institutional high-conviction buys.',
    is_bullish: true,
    is_bearish: false,
    bullish_display: '🟢 ULTIMATE HIGH-CONVICTION BUY: AI Score ≥ 85/100 (170/200 pts) with Bullish Stack, Volume Expansion > 2x, and Long Buildup.',
    bearish_display: '🔴 HIGH-RISK SELL: AI Score < 40/100 with Short Buildup, Negative RS, and Breakdown below 200 EMA.',
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
    video_url: 'https://www.facebook.com/reel/1388332009936799',
  },
];

export default function FormulaPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'accordion' | 'table'>('cards');
  const [expandedDay, setExpandedDay] = useState<string | false>('19');

  // Backend API query
  const { data: backendData } = useQuery({
    queryKey: ['formulas'],
    queryFn: fetchFormulas,
    staleTime: 300_000,
  });

  // Filter strategies based on search and category
  const filteredStrategies = useMemo(() => {
    return CHETAN_VERMA_STRATEGIES.filter(s => {
      // Category filter
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

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        s.title.toLowerCase().includes(q) ||
        s.single_line.toLowerCase().includes(q) ||
        s.day_tag.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.indicators.some(i => i.toLowerCase().includes(q)) ||
        s.example.toLowerCase().includes(q) ||
        `day ${s.day}`.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  const categories = [
    { label: 'All (30)', value: 'All' },
    { label: '🟢 Bullish Setups', value: 'Bullish' },
    { label: '🔴 Bearish Setups', value: 'Bearish' },
    { label: '🎓 Chetan Verma Series', value: 'Chetan Verma Series' },
    { label: '🕯️ Candlesticks & Price Action', value: 'Candlesticks & Price Action' },
    { label: '📈 EMA & Indicators', value: 'EMA & Indicators' },
    { label: '🏦 Smart Money & Order Flow', value: 'Smart Money & Order Flow' },
  ];

  const handleAccordionChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedDay(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* ── Top Hero Banner with Chetan Verma Day 19 Highlight ── */}
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
                icon={<School sx={{ fontSize: 16 }} />}
                label="Chetan Verma 100-Day Strategy Series"
                color="success"
                size="small"
                sx={{ fontWeight: 900, fontSize: '0.72rem', height: 24 }}
              />
              <Chip
                icon={<Verified sx={{ fontSize: 14 }} />}
                label="Verified Institutional Formulas"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
              />
              <Chip
                icon={<PlayCircle sx={{ fontSize: 14, color: '#ff1744' }} />}
                label="Day 19 Featured"
                size="small"
                sx={{ fontWeight: 900, bgcolor: 'rgba(255,23,68,0.12)', color: '#ff1744', height: 22 }}
              />
            </Stack>

            <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: -0.5, mb: 0.8 }}>
              🎓 Formula Understanding &amp; Strategy Masterclass
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 850, lineHeight: 1.5, mb: 1.5 }}>
              Comprehensive master library of high-probability Indian market trading formulas, candlestick patterns, Smart Money Concepts (SMC), and exact entry/exit/stop-loss mechanics from Chetan Verma's 100-day series.
            </Typography>

            {/* Featured Day 19 Callout Card */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: isDark ? 'rgba(0,0,0,0.4)' : '#ffffff',
                border: '1px solid',
                borderColor: '#10b981',
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1.5,
              }}
            >
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Whatshot sx={{ color: '#ff9800', fontSize: 18 }} />
                  <Typography variant="subtitle2" fontWeight={900} color="success.main">
                    Featured Day 19 Strategy: 9 EMA + 15-Min Breakout Retest
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3, fontWeight: 600 }}>
                  High-win-rate intraday/swing trigger with tight SL and 1:3+ Risk-Reward ratio.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  startIcon={<PlayCircle />}
                  href="https://www.facebook.com/reel/1388332009936799"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'none', borderRadius: 2 }}
                >
                  Watch Day 19 Reel
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/quant-screener')}
                  sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'none', borderRadius: 2 }}
                >
                  Scan Live Stocks
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Stack>

        {/* Top Summary Metrics */}
        <Grid container spacing={1.5} mt={1}>
          {[
            { label: 'Masterclass Formulas', value: '30 Days', color: '#00e5ff', icon: <School /> },
            { label: 'Bullish Buy Setups', value: '22 Strategies', color: '#00e676', icon: <TrendingUp /> },
            { label: 'Bearish Short Setups', value: '18 Strategies', color: '#ff1744', icon: <TrendingDown /> },
            { label: 'Max Win Rate', value: '88% – 91%', color: '#ffd600', icon: <Speed /> },
            { label: 'Smart Money SMC Setups', value: '10 Formulas', color: '#d500f9', icon: <AutoAwesome /> },
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
                <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: m.color, mt: 0.3 }}>
                  {m.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* ── Search, Category Tabs, & View Switcher ── */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
          {/* Search Input */}
          <TextField
            size="small"
            placeholder="Search by Day (e.g. Day 19, Day 1), Pattern, Indicator, Formula..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: { xs: '100%', md: 320 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, fontSize: '0.85rem' },
            }}
          />

          {/* View Mode Toggle */}
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
        </Stack>

        {/* Category Pills */}
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
      </Paper>

      {/* ── View 1: Card Grid View (Interactive Cards with 1-Click Drilldown) ── */}
      {viewMode === 'cards' && (
        <Grid container spacing={2}>
          {filteredStrategies.map(item => (
            <Grid item xs={12} md={6} lg={4} key={item.day_tag}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: '1.5px solid',
                  borderColor: item.day === 19 ? '#10b981' : isDark ? 'rgba(255,255,255,0.08)' : 'divider',
                  bgcolor: isDark ? 'rgba(11,17,32,0.85)' : '#ffffff',
                  transition: 'all 0.22s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: item.day === 19 ? '#059669' : 'primary.main',
                    boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.5)' : '0 12px 30px rgba(0,0,0,0.08)',
                  },
                }}
              >
                {/* Top Accent Line */}
                <Box
                  sx={{
                    height: 4,
                    background: item.day === 19
                      ? 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)'
                      : item.is_bullish && item.is_bearish
                      ? 'linear-gradient(90deg, #00e676 0%, #ff1744 100%)'
                      : item.is_bullish
                      ? 'linear-gradient(90deg, #00e676 0%, #00b0ff 100%)'
                      : 'linear-gradient(90deg, #ff1744 0%, #ff9100 100%)',
                  }}
                />

                <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Header Row */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1} gap={1}>
                    <Chip
                      label={item.day_tag}
                      size="small"
                      sx={{
                        fontWeight: 900,
                        fontSize: '0.65rem',
                        height: 20,
                        bgcolor: item.day === 19 ? 'rgba(16,185,129,0.2)' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                        color: item.day === 19 ? '#10b981' : 'text.primary',
                        border: '1px solid',
                        borderColor: item.day === 19 ? 'rgba(16,185,129,0.4)' : 'divider',
                      }}
                    />
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
                    {item.title}
                  </Typography>

                  {/* Single Line Understanding Box */}
                  <Box
                    sx={{
                      p: 1.25,
                      mb: 1.5,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderLeft: '3px solid',
                      borderColor: item.day === 19 ? '#10b981' : 'primary.main',
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
                        {item.bullish_display}
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
                        {item.bearish_display}
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

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1}>
                      {item.video_url && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PlayCircle sx={{ fontSize: 15 }} />}
                          href={item.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ flex: 1, fontSize: '0.7rem', fontWeight: 800, textTransform: 'none', py: 0.4 }}
                        >
                          Reel Link
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                        onClick={() => navigate(item.scanner_path)}
                        sx={{ flex: 1.2, fontSize: '0.7rem', fontWeight: 800, textTransform: 'none', py: 0.4 }}
                      >
                        Scan Stocks
                      </Button>
                    </Stack>
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
          {filteredStrategies.map(item => (
            <Accordion
              key={item.day_tag}
              expanded={expandedDay === String(item.day)}
              onChange={handleAccordionChange(String(item.day))}
              sx={{
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: item.day === 19 ? '#10b981' : isDark ? 'rgba(255,255,255,0.08)' : 'divider',
                bgcolor: isDark ? 'rgba(11,17,32,0.85)' : '#ffffff',
                overflow: 'hidden',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} width="100%" pr={1}>
                  <Chip
                    label={item.day_tag}
                    size="small"
                    color={item.day === 19 ? 'success' : 'primary'}
                    sx={{ fontWeight: 900, fontSize: '0.7rem', height: 22 }}
                  />
                  <Typography variant="subtitle1" fontWeight={800} sx={{ flex: 1 }}>
                    {item.title}
                  </Typography>
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
                        {item.bullish_display}
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
                        {item.bearish_display}
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
                        ⚠️ Strategy Rules &amp; Retail Traps to Avoid
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
                            💡 Real Market Example: {item.example}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} alignSelf={{ xs: 'flex-start', sm: 'center' }}>
                          {item.video_url && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<PlayCircle />}
                              href={item.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ fontWeight: 800, fontSize: '0.72rem', textTransform: 'none' }}
                            >
                              Watch Reel
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="contained"
                            endIcon={<ArrowForward />}
                            onClick={() => navigate(item.scanner_path)}
                            sx={{ fontWeight: 800, fontSize: '0.72rem', textTransform: 'none' }}
                          >
                            Launch Screener
                          </Button>
                        </Stack>
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
                <TableCell sx={{ fontWeight: 900 }}>Day #</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Strategy &amp; Single-Line Understanding</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Bullish Trigger (Green)</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Bearish Warning (Red)</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Win Rate</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStrategies.map(item => (
                <TableRow key={item.day_tag} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(item.scanner_path)}>
                  <TableCell>
                    <Chip label={`Day ${item.day}`} size="small" color={item.day === 19 ? 'success' : 'default'} sx={{ fontWeight: 900, height: 20 }} />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 340 }}>
                    <Typography variant="body2" fontWeight={800}>{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary" fontStyle="italic" display="block">{item.single_line}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography variant="caption" fontWeight={800} color="#00e676">{item.bullish_display}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography variant="caption" fontWeight={800} color="#ff1744">{item.bearish_display}</Typography>
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
    </Box>
  );
}

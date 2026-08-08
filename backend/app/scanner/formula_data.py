"""
Formula & Strategy Masterclass data – Sequential Days 1 to 30 & Indicator Mathematical Library.
"""
from app.scanner.schemas import FormulaEntry, FormulaResponse

FORMULAS = [
    FormulaEntry(
        name="Day 1: Hammer & Inverted Hammer at Key Support Zone",
        category="Candlesticks & Price Action",
        formula="Hammer = Lower Shadow >= 2x Body Length at Support Level | Inverted Hammer = Upper Shadow >= 2x Body Length",
        calculation="Measure lower wick vs body height. Lower shadow must be at least twice the length of the real body at defined support or pivot level.",
        interpretation="Signals institutional liquidity sweep and aggressive buyer absorption at key market floors.",
        bullish_condition="🟢 BULLISH BUY: Hammer forms after downtrend at major Support / S1 Pivot. Lower wick >= 2x body length with strong volume spike.",
        bearish_condition="🔴 BEARISH REVERSAL: Inverted Hammer fails to follow through and breaks below low -> signals continuation of selling.",
        example="HDFCBANK drops to 1600 support, prints 15m Hammer with 2.2x volume, confirms above 1608 -> rallies to 1640.",
        parameters={"day": 1, "win_rate": "82%", "risk_reward": "1:2.0", "single_line": "Long lower shadow at least 2x the body at major support signifies institutional liquidity sweep and aggressive buyer absorption."}
    ),
    FormulaEntry(
        name="Day 2: Bullish & Bearish Engulfing Master Setup",
        category="Candlesticks & Price Action",
        formula="Bullish Engulfing = Green Body > Previous Red Body + Wicks | Bearish Engulfing = Red Body > Previous Green Body",
        calculation="Current candle open is <= previous close and current close is >= previous open. Volume must exceed 20-period average by 2x.",
        interpretation="Demonstrates total institutional takeover of order flow from one side of the market to the other.",
        bullish_condition="🟢 BULLISH BUY: Large green candle fully engulfs prior red candle body + wicks at support with volume surge.",
        bearish_condition="🔴 BEARISH SHORT: Large red candle fully engulfs prior green candle body at key resistance / 52-week high.",
        example="RELIANCE prints 1-hour Bullish Engulfing at 2850 support with 3x volume -> rallies to 2940.",
        parameters={"day": 2, "win_rate": "84%", "risk_reward": "1:2.5", "single_line": "A massive body candle completely engulfing the prior opposite candle demonstrates total institutional control over order flow."}
    ),
    FormulaEntry(
        name="Day 3: Morning Star (Bullish) & Evening Star (Bearish)",
        category="Candlesticks & Price Action",
        formula="Morning Star = Impulse Red -> Small Gap Doji -> Green Close > 60% of Candle 1 | Evening Star = Inverse Structure",
        calculation="3-candle reversal: 1st strong trend candle, 2nd small indecision doji/spinning top at extreme, 3rd strong reversal candle.",
        interpretation="Marks absolute seller exhaustion followed by immediate institutional accumulation wave.",
        bullish_condition="🟢 BULLISH BUY: Morning Star forms at major daily support. Enter on close of 3rd candle with volume expansion.",
        bearish_condition="🔴 BEARISH SHORT: Evening Star forms at multi-week resistance. Short on close of 3rd candle.",
        example="TCS prints Morning Star on Daily chart at 3800 -> surges to 4020 in 6 sessions.",
        parameters={"day": 3, "win_rate": "85%", "risk_reward": "1:3.0", "single_line": "3-Candle structure: strong impulse candle, indecision doji at extreme, followed by massive reversal candle closing past 50% of candle 1."}
    ),
    FormulaEntry(
        name="Day 19: 9 EMA + 15-Min Breakout & Retest Formula",
        category="EMA & Indicators",
        formula="Entry = Candle Close > 9 EMA after 15m Resistance Breakout Retest | Stop Loss = Retest Low - 0.25%",
        calculation="Identify key resistance breakout on 15m chart. Wait for price to retrace and retest rising 9 EMA. Enter on next green confirmation candle with Volume > 1.5x.",
        interpretation="High-probability momentum trend following. Avoids retail bull-traps by requiring 9 EMA retest confirmation before entry.",
        bullish_condition="🟢 BULLISH BUY: 15-min candle closes above Resistance/EMA 9. Wait for retest pullback touching 9 EMA. Enter on next green candle with Volume > 1.5x.",
        bearish_condition="🔴 BEARISH SHORT: 15-min candle closes below Support/EMA 9. Wait for upward retest rejection at 9 EMA. Enter on next red candle breakdown.",
        example="NIFTY 15m breaks 24500 resistance, pulls back to test 9 EMA at 24485, prints strong green hammer with 1.8x volume -> rallies to 24620.",
        parameters={"day": 19, "win_rate": "88%", "risk_reward": "1:2.5 to 1:4.0", "single_line": "When a strong 15-minute candle breaks key resistance and retests the rising 9 EMA with a green confirmation candle + volume > 1.5x, enter for high-probability momentum."}
    ),
    FormulaEntry(
        name="RSI (Relative Strength Index)",
        category="Technical Mathematics",
        formula="RSI = 100 - [100 / (1 + RS)]  where RS = Avg Gain / Avg Loss over 14 periods",
        calculation="Calculate average gain and average loss over 14 periods using Wilder smoothing. RS = avg_gain / avg_loss.",
        interpretation="Measures velocity and magnitude of directional price momentum; 55-70 is ideal bullish momentum, >80 is overbought, <30 is oversold.",
        bullish_condition="🟢 Bullish Zone: RSI 55-70 rising. Bullish Divergence (Price Lower Low + RSI Higher Low at support).",
        bearish_condition="🔴 Bearish Zone: RSI < 40 falling. Bearish Divergence (Price Higher High + RSI Lower High at resistance).",
        example="TCS RSI rises from 42 to 62 with expanding green volume -> ideal momentum entry zone.",
        parameters={"parameters": "Period = 14", "single_line": "Measures the velocity and magnitude of directional price movements; 55-70 is ideal bullish momentum, >80 is overbought, <30 is oversold."}
    ),
    FormulaEntry(
        name="MACD (Moving Average Convergence Divergence)",
        category="Technical Mathematics",
        formula="MACD Line = EMA(12) - EMA(26) | Signal Line = EMA(9, MACD Line) | Histogram = MACD - Signal",
        calculation="Subtract 26-period EMA from 12-period EMA. Smooth resulting line with 9-period EMA for signal line.",
        interpretation="Tracks trend momentum and moving average separation; bullish crossover above zero line confirms institutional trend acceleration.",
        bullish_condition="🟢 Bullish Crossover: MACD Line crosses above Signal Line while above zero + expanding green histogram.",
        bearish_condition="🔴 Bearish Crossover: MACD Line crosses below Signal Line from high peak + expanding red histogram.",
        example="INFY MACD crosses Signal line at zero line with volume -> confirms beginning of multi-week trend.",
        parameters={"parameters": "12, 26, 9 Exponential", "single_line": "Tracks trend momentum and moving average separation; bullish crossover above zero line confirms institutional trend continuation."}
    ),
    FormulaEntry(
        name="Put-Call Ratio (PCR)",
        category="Derivatives & Options",
        formula="PCR = Total Put Open Interest (Sum Put OI) / Total Call Open Interest (Sum Call OI)",
        calculation="Sum all outstanding open interest contracts for Puts across all strikes and divide by total Call open interest.",
        interpretation="Contrarian sentiment barometer; PCR < 0.60 indicates extreme retail panic & oversold bottom, PCR > 1.40 indicates extreme complacency & top.",
        bullish_condition="🟢 Bullish Reversal: PCR drops to 0.55-0.70 at major support + Put writing increases aggressively.",
        bearish_condition="🔴 Bearish Reversal: PCR exceeds 1.50-1.75 at major resistance + Call writing increases aggressively.",
        example="NIFTY PCR drops to 0.58 during panic selloff at 24000 -> rebounds 400 points.",
        parameters={"parameters": "Oversold < 0.65, Overbought > 1.40", "single_line": "Contrarian sentiment barometer; PCR < 0.60 indicates extreme retail panic & oversold bottom, PCR > 1.40 indicates extreme greed & top."}
    ),
    FormulaEntry(
        name="Average Directional Index (ADX)",
        category="Technical Mathematics",
        formula="ADX = 14-Period EMA of DX  where DX = [|+DI - -DI| / (+DI + -DI)] * 100",
        calculation="Calculate Directional Movement (+DM and -DM) and True Range (TR). Smooth over 14 periods to calculate +DI, -DI, and ADX.",
        interpretation="Quantifies trend strength regardless of direction; ADX > 25 confirms powerful trend, ADX > 40 is explosive trend, ADX < 20 is choppy range.",
        bullish_condition="🟢 Bullish Trend: ADX > 25 AND rising while +DI is strictly greater than -DI.",
        bearish_condition="🔴 Bearish Trend: ADX > 25 AND rising while -DI is strictly greater than +DI.",
        example="SBIN ADX rises to 34 with +DI > -DI -> confirms high-conviction breakout rally.",
        parameters={"parameters": "Period = 14, Strong Trend = 25", "single_line": "Quantifies trend strength regardless of direction; ADX > 25 confirms powerful trend, ADX > 40 is explosive trend, ADX < 20 is choppy range."}
    ),
]


def get_formula_response() -> FormulaResponse:
    return FormulaResponse(formulas=FORMULAS, total=len(FORMULAS))

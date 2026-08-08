"""
Formula & Strategy Masterclass data – Chetan Verma 100-Day Series & Indicator Library.
"""
from app.scanner.schemas import FormulaEntry, FormulaResponse

FORMULAS = [
    FormulaEntry(
        name="Day 19: 9 EMA + 15-Min Breakout & Retest with Order Flow Confirmation",
        category="Chetan Verma Series",
        formula="Entry = Candle Close > 9 EMA after 15m Resistance Breakout Retest | Stop Loss = Retest Low − 0.25%",
        calculation="Identify key resistance breakout on 15m chart. Wait for price to retrace and retest rising 9 EMA. Enter on the very next green confirmation candle with Volume > 1.5x average.",
        interpretation="High-probability momentum trend following. Avoids retail bull-traps by requiring 9 EMA retest confirmation before entry.",
        bullish_condition="🟢 BULLISH BUY: 15-min candle closes above Resistance/EMA 9. Wait for retest pullback touching 9 EMA. Enter on next green candle with Volume > 1.5x.",
        bearish_condition="🔴 BEARISH SHORT: 15-min candle closes below Support/EMA 9. Wait for upward retest rejection at 9 EMA. Enter on next red candle breakdown.",
        example="NIFTY 15m breaks 24,500 resistance, pulls back to test 9 EMA at 24,485, prints strong green hammer with 1.8x volume → rallies to 24,620.",
        parameters={
            "day": 19,
            "win_rate": "88%",
            "risk_reward": "1:2.5 to 1:4.0",
            "video_url": "https://www.facebook.com/reel/1388332009936799",
            "single_line": "When a strong 15-minute candle breaks key resistance and retests the rising 9 EMA with a green confirmation candle + volume > 1.5x, enter for high-probability momentum.",
        }
    ),
    FormulaEntry(
        name="Day 1: Hammer & Inverted Hammer at Key Support Zone",
        category="Candlesticks & Price Action",
        formula="Hammer = Lower Shadow ≥ 2× Body Length at Support Level | Inverted Hammer = Upper Shadow ≥ 2× Body Length",
        calculation="Measure lower wick vs body height. Lower shadow must be at least twice the length of the real body at defined support or pivot level.",
        interpretation="Signals institutional liquidity sweep and aggressive buyer absorption at key market floors.",
        bullish_condition="🟢 BULLISH BUY: Hammer forms after downtrend at major Support / S1 Pivot. Lower wick ≥ 2x body length with strong volume spike.",
        bearish_condition="🔴 BEARISH REVERSAL: Inverted Hammer fails to follow through and breaks below low → signals continuation of selling.",
        example="HDFCBANK drops to ₹1,600 support, prints 15m Hammer with 2.2x volume, confirms above ₹1,608 → rallies to ₹1,640.",
        parameters={"day": 1, "win_rate": "82%", "risk_reward": "1:2.0"}
    ),
    FormulaEntry(
        name="Day 2: Bullish & Bearish Engulfing Master Setup",
        category="Candlesticks & Price Action",
        formula="Bullish Engulfing = Green Body > Previous Red Body + Wicks | Bearish Engulfing = Red Body > Previous Green Body",
        calculation="Current candle open is <= previous close and current close is >= previous open. Volume must exceed 20-period average by 2x.",
        interpretation="Demonstrates total institutional takeover of order flow from one side of the market to the other.",
        bullish_condition="🟢 BULLISH BUY: Large green candle fully engulfs prior red candle body + wicks at support with volume surge.",
        bearish_condition="🔴 BEARISH SHORT: Large red candle fully engulfs prior green candle body at key resistance / 52-week high.",
        example="RELIANCE prints 1-hour Bullish Engulfing at ₹2,850 support with 3x volume → rallies to ₹2,940.",
        parameters={"day": 2, "win_rate": "84%", "risk_reward": "1:2.5"}
    ),
    FormulaEntry(
        name="Day 15: 9 EMA Intraday Scalping & Pullback Strategy (5m & 15m)",
        category="EMA & Indicators",
        formula="EMA = Price × k + EMA(prev) × (1 − k) where k = 2 ÷ (9 + 1) = 0.20",
        calculation="Fast 9 EMA tracks immediate order momentum. When price pulls back to 9 EMA in an established trend, enter on touch/reversal.",
        interpretation="Dynamic moving support in strong bull trends and dynamic resistance in strong bear trends.",
        bullish_condition="🟢 BULLISH SCALP: Price > 9 EMA > VWAP. Buy on 5m/15m dip to 9 EMA when green rejection candle confirms.",
        bearish_condition="🔴 BEARISH SCALP: Price < 9 EMA < VWAP. Sell on 5m/15m rally to 9 EMA when red rejection candle confirms.",
        example="BANKNIFTY on 5m: touches 9 EMA at 51,200, prints hammer, rallies to 51,450.",
        parameters={"day": 15, "win_rate": "85%", "risk_reward": "1:2.0"}
    ),
    FormulaEntry(
        name="Day 16: 20 EMA + 50 EMA Golden Cross & Alignment System",
        category="EMA & Indicators",
        formula="Golden Cross = EMA 20 crosses above EMA 50 | Death Cross = EMA 20 crosses below EMA 50",
        calculation="Compute 20-day and 50-day exponential moving averages. Trigger entry on first pullback to 20 EMA after crossover.",
        interpretation="Strong multi-week swing trend confirmation. Eliminates intraday chop and captures multi-day moves.",
        bullish_condition="🟢 BULLISH BUY: 20 EMA crosses above 50 EMA (Golden Cross). Price pulls back to 20 EMA → Buy on green candle.",
        bearish_condition="🔴 BEARISH SHORT: 20 EMA crosses below 50 EMA (Death Cross). Price rallies to 20 EMA → Sell on red candle.",
        example="BEL 20 EMA crosses 50 EMA at ₹280 → stock rallies to ₹340 over 4 weeks.",
        parameters={"day": 16, "win_rate": "86%", "risk_reward": "1:3.0"}
    ),
    FormulaEntry(
        name="Day 18: VWAP + Volume Spike Institutional Intraday Breakout",
        category="EMA & Indicators",
        formula="VWAP = Σ(Typical Price × Volume) ÷ Σ(Volume) where Typical Price = (H + L + C) ÷ 3",
        calculation="Cumulative intraday sum of price times volume divided by cumulative volume. Upper band = VWAP + 1.5 * StdDev.",
        interpretation="Institutional benchmark execution price. Staying above VWAP signifies active buyer accumulation.",
        bullish_condition="🟢 BULLISH BUY: Price crosses above VWAP + Upper Band with Volume > 2x average. Retest of VWAP holds as support.",
        bearish_condition="🔴 BEARISH SHORT: Price breaks below VWAP with heavy volume and fails to re-cross above VWAP.",
        example="MARUTI opens at ₹12,100, crosses VWAP with 3.5x volume at 9:30 AM → rallies to ₹12,480.",
        parameters={"day": 18, "win_rate": "87%", "risk_reward": "1:2.5"}
    ),
    FormulaEntry(
        name="Day 20: SMC Order Block (OB) & Fair Value Gap (FVG) Retest",
        category="Smart Money & Order Flow",
        formula="FVG = Low of Candle 1 − High of Candle 3 | OB = Last opposite candle before structural impulse",
        calculation="Measure the price imbalance (gap) between candle 1 and candle 3. Enter on limit orders when price mitigates 50% of the FVG/OB.",
        interpretation="Smart money leaves liquidity footprints in imbalances; institutional algorithms return to fill these gaps before next trend leg.",
        bullish_condition="🟢 BULLISH BUY: Price drops into Bullish Order Block (OB) and fills the Fair Value Gap (FVG). Enter on lower timeframe shift.",
        bearish_condition="🔴 BEARISH SHORT: Price rallies into Bearish Order Block (OB) and fills FVG. Enter short on rejection.",
        example="NIFTY 15m creates FVG at 24,350 and rallies to 24,550. Later drops to 24,360 OB, prints hammer → rockets to 24,700.",
        parameters={"day": 20, "win_rate": "88%", "risk_reward": "1:4.0"}
    ),
    FormulaEntry(
        name="Day 24: Open Interest (OI) Long Buildup & Short Covering Squeeze",
        category="Smart Money & Order Flow",
        formula="Long Buildup = Price ↑ + OI ↑ | Short Covering = Price ↑ + OI ↓ | Short Buildup = Price ↓ + OI ↑",
        calculation="Compute percentage change in underlying futures price and total open interest across active expiries.",
        interpretation="Tracks whether smart money is deploying fresh capital (Long Buildup) or panicking to cover underwater short positions.",
        bullish_condition="🟢 BULLISH BUY: Long Buildup (Price +2% + OI +15%) or Short Squeeze (Price breaks resistance as Call OI unwinds).",
        bearish_condition="🔴 BEARISH SHORT: Short Buildup (Price -2% + OI +15%) or Long Unwinding (Price drops + OI drops).",
        example="TATAMOTORS Price +3.5% with OI +22% → Long Buildup confirmed → continues rally for 4 days.",
        parameters={"day": 24, "win_rate": "86%", "risk_reward": "1:2.8"}
    ),
    FormulaEntry(
        name="Day 30: Institutional 200-Point AI Master Buy Formula",
        category="Chetan Verma Series",
        formula="AI Score = Technicals(50) + Fundamentals(40) + Derivatives(35) + Volume(20) + RS(15) + SMC(15) + News(15) + Risk(10)",
        calculation="Calculates a multi-factor weighted 100-point & 200-point composite score across 12 institutional market pillars.",
        interpretation="Institutional accumulation engine. High-conviction buying occurs when overall score exceeds 85/100 points.",
        bullish_condition="🟢 ULTIMATE HIGH-CONVICTION BUY: AI Score ≥ 85/100 (170/200 pts) with Bullish Stack, Volume Expansion > 2x, and Long Buildup.",
        bearish_condition="🔴 HIGH-RISK SELL: AI Score < 40/100 with Short Buildup, Negative RS, and Breakdown below 200 EMA.",
        example="Quant Screener flags HAL with 94/100 AI Score at ₹4,650 → stock hits T1, T2, T3 to reach ₹5,180 in 5 sessions.",
        parameters={"day": 30, "win_rate": "90%", "risk_reward": "1:3.5"}
    ),
]


def get_formula_response() -> FormulaResponse:
    return FormulaResponse(formulas=FORMULAS, total=len(FORMULAS))

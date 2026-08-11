"""
Market Events, Upcoming Calendar & Stock News Analysis Database (Latest 1 to 3 Months).
Tracks Mega Work Orders, Positive vs Negative Results, Upcoming Earnings Calendar,
Board Meetings, and Stock News Technical Impact Analysis.
"""
from typing import List, Optional
from pydantic import BaseModel


class StockEvent(BaseModel):
    id: str
    symbol: str
    company_name: str
    sector: str
    category: str  # 'Work Orders & Contracts' | 'Positive Earnings / +ve Results' | 'FII / DII Accumulation' | 'Promoter Buying & Pledge' | 'Monsoon & Agro Season' | 'Winter & Wedding Boom' | 'Summer & Power Capex'
    badge_icon: str
    impact_score: int  # 0 to 100
    headline: str
    event_details: str
    contract_value: Optional[str] = None
    time_period: str
    fii_dii_change: Optional[str] = None
    cmp: float
    target_price: float
    potential_upside: str
    market_cap_tier: str
    tags: List[str]
    catalyst_summary: str


class UpcomingEvent(BaseModel):
    id: str
    symbol: str
    company_name: str
    sector: str
    event_type: str  # 'Quarterly Results' | 'Board Meeting & Dividend' | 'Product / EV Launch' | 'Defense Trials & Tender' | 'Bonus / Split'
    event_date: str
    days_left: str
    badge_icon: str
    expected_impact: str
    consensus_metrics: str
    technical_setup: str
    cmp: float
    support_level: float
    resistance_level: float
    action_verdict: str


class StockNewsItem(BaseModel):
    id: str
    symbol: str
    company_name: str
    sector: str
    news_type: str  # '+ve Results & Earnings Surge' | '-ve Results & Margin Caution' | 'Mega Work Orders & Contracts' | 'Regulatory & Policy'
    sentiment: str  # 'positive' | 'negative' | 'neutral'
    badge_icon: str
    headline: str
    time_period: str
    summary: str
    key_takeaway: str
    technical_impact: str
    support_level: float
    resistance_level: float
    action_suggestion: str


# ── 1. Comprehensive Catalyst & Work Orders Directory ──
LATEST_EVENTS_DATABASE: List[StockEvent] = [
    StockEvent(
        id="EVT-01",
        symbol="LT",
        company_name="Larsen & Toubro Ltd",
        sector="Capital Goods & Infrastructure",
        category="Work Orders & Contracts",
        badge_icon="🏗️",
        impact_score=96,
        headline="₹25,000+ Cr Middle East Hydrocarbon & Bullet Train Mega Orders",
        event_details="L&T secures landmark offshore gas compression & pipeline packages from Saudi Aramco and ADNOC, alongside high-speed rail civil execution packages in India.",
        contract_value="₹28,500 Cr",
        time_period="Past 30 Days",
        fii_dii_change="FII +1.2%, DII +0.8%",
        cmp=3650.0,
        target_price=4250.0,
        potential_upside="+16.4%",
        market_cap_tier="Large Cap",
        tags=["Mega Contract", "Saudi Aramco", "Bullet Train", "Order Book ATH"],
        catalyst_summary="Order book surpasses ₹4.75 Lakh Cr, offering 3.2 years of revenue visibility with margin expansion."
    ),
    StockEvent(
        id="EVT-02",
        symbol="BHEL",
        company_name="Bharat Heavy Electricals Ltd",
        sector="Power Equipment & Heavy Engineering",
        category="Work Orders & Contracts",
        badge_icon="⚡",
        impact_score=94,
        headline="₹19,400+ Cr Thermal Supercritical Power Plant Equipment Orders",
        event_details="Bagged massive EPC power plant equipment orders from Damodar Valley Corporation (DVC) and Adani Power for 2x800 MW and 3x800 MW supercritical units.",
        contract_value="₹19,400 Cr",
        time_period="Past 45 Days",
        fii_dii_change="DII +2.1%, Mutual Funds Active",
        cmp=292.0,
        target_price=365.0,
        potential_upside="+25.0%",
        market_cap_tier="Large Cap",
        tags=["Thermal Supercritical", "DVC", "Adani Power", "Capex Cycle"],
        catalyst_summary="Thermal power revival in India guarantees multi-year manufacturing order book utilization."
    ),
    StockEvent(
        id="EVT-03",
        symbol="COCHINSHIP",
        company_name="Cochin Shipyard Ltd",
        sector="Defense & Shipbuilding",
        category="Work Orders & Contracts",
        badge_icon="🚢",
        impact_score=95,
        headline="₹10,000+ Cr Next-Gen Defense Vessels & European Green Ships",
        event_details="Commissioned India's largest new dry dock and won international zero-emission feeder container vessel orders from European clients and Indian Navy.",
        contract_value="₹10,200 Cr",
        time_period="Past 30 Days",
        fii_dii_change="FII +1.8%, DII +1.4%",
        cmp=1850.0,
        target_price=2300.0,
        potential_upside="+24.3%",
        market_cap_tier="Mid Cap",
        tags=["Defense Shipbuilding", "Export Order", "Dry Dock", "Make in India"],
        catalyst_summary="Massive domestic defense budget allocation combined with European commercial maritime fleet renewal."
    ),
    StockEvent(
        id="EVT-04",
        symbol="RVNL",
        company_name="Rail Vikas Nigam Ltd",
        sector="Railways & Metro Infrastructure",
        category="Work Orders & Contracts",
        badge_icon="🚆",
        impact_score=92,
        headline="₹6,800+ Cr Multi-Tracking, Electrification & Metro Packages",
        event_details="Lowest bidder (L1) across South Eastern Railway automatic block signaling, Western Railway double line, and Indore/Bhopal metro packages.",
        contract_value="₹6,850 Cr",
        time_period="Past 60 Days",
        fii_dii_change="FII +1.1%, DII +0.9%",
        cmp=535.0,
        target_price=660.0,
        potential_upside="+23.3%",
        market_cap_tier="Mid Cap",
        tags=["Railway Capex", "Metro Package", "Vande Bharat", "L1 Bidder"],
        catalyst_summary="Indian Railways modernization budget of ₹2.55 Lakh Cr directly feeds RVNL's order execution pipeline."
    ),
    StockEvent(
        id="EVT-05",
        symbol="DIXON",
        company_name="Dixon Technologies (India) Ltd",
        sector="Electronics Manufacturing (EMS)",
        category="Work Orders & Contracts",
        badge_icon="📱",
        impact_score=97,
        headline="₹8,000+ Cr Smartphone (Xiaomi, Transsion, Motorola) Manufacturing Deal",
        event_details="Expanded smartphone assembly footprint; signed major manufacturing joint ventures with Transsion and Xiaomi for 50M+ annual units in Noida.",
        contract_value="₹8,000 Cr/yr",
        time_period="Past 30 Days",
        fii_dii_change="FII +2.4%, DII +1.6%",
        cmp=12850.0,
        target_price=15200.0,
        potential_upside="+18.3%",
        market_cap_tier="Large Cap",
        tags=["PLI Scheme", "Xiaomi Partner", "EMS Leader", "Smartphone Export"],
        catalyst_summary="IT Hardware & Smartphone PLI schemes propel Dixon into the top global tier of contract manufacturers."
    ),
    StockEvent(
        id="EVT-06",
        symbol="TRENT",
        company_name="Trent Ltd (Tata Group)",
        sector="Retail & Consumer Apparel",
        category="Positive Earnings / +ve Results",
        badge_icon="📈",
        impact_score=98,
        headline="Standalone Revenue +54% YoY, Net Profit Surges +130% YoY",
        event_details="Zudio store count crosses 550+ with exceptional unit economics; Westside LFL growth reaches double digits with zero inventory markdown.",
        contract_value="PAT ₹420 Cr (130% ↑)",
        time_period="Latest Quarter",
        fii_dii_change="FII +1.9%, DII +1.1%",
        cmp=6850.0,
        target_price=8100.0,
        potential_upside="+18.2%",
        market_cap_tier="Large Cap",
        tags=["Zudio Mania", "PAT +130%", "Tata Retail", "Record Margin"],
        catalyst_summary="Fastest retail footprint expansion in India with highest revenue per square foot in value fashion."
    ),
    StockEvent(
        id="EVT-07",
        symbol="ZOMATO",
        company_name="Zomato Ltd (Blinkit)",
        sector="Quick Commerce & Internet",
        category="Positive Earnings / +ve Results",
        badge_icon="🚀",
        impact_score=96,
        headline="Blinkit GOV +130% YoY, Consolidated PAT Jumps to ₹253 Cr",
        event_details="Blinkit dark store count scaled to 1,000 target by FY25; quick commerce gross order value growing at 3x the pace of food delivery.",
        contract_value="PAT ₹253 Cr (vs Loss)",
        time_period="Latest Quarter",
        fii_dii_change="FII +3.2%, DII +2.0%",
        cmp=262.0,
        target_price=330.0,
        potential_upside="+25.9%",
        market_cap_tier="Large Cap",
        tags=["Blinkit Profit", "Quick Commerce", "FII Favorite", "GOV +130%"],
        catalyst_summary="Rapidly converting retail consumption into quick commerce with expanding ad-monetization take rates."
    ),
    StockEvent(
        id="EVT-08",
        symbol="KAYNES",
        company_name="Kaynes Technology India Ltd",
        sector="Semiconductors & Industrial Electronics",
        category="Positive Earnings / +ve Results",
        badge_icon="🔬",
        impact_score=95,
        headline="Quarterly Revenue +70% YoY, Order Book Exceeds ₹5,000 Cr",
        event_details="Secured Cabinet approval for ₹3,300 Cr Semiconductor OSAT facility in Gujarat with deep institutional backing.",
        contract_value="Order Book ₹5,038 Cr",
        time_period="Latest Quarter",
        fii_dii_change="FII +2.8%, DII +1.5%",
        cmp=4950.0,
        target_price=6100.0,
        potential_upside="+23.2%",
        market_cap_tier="Mid Cap",
        tags=["Semiconductor OSAT", "Revenue +70%", "EV Electronics", "Cabinet Approved"],
        catalyst_summary="One of India's first operational OSAT chip packaging providers with multi-year automotive & aerospace orders."
    ),
    StockEvent(
        id="EVT-09",
        symbol="HDFCBANK",
        company_name="HDFC Bank Ltd",
        sector="Banking & Financial Services",
        category="FII / DII Accumulation",
        badge_icon="🏦",
        impact_score=95,
        headline="FII Stake Increases +1.4% Following MSCI Weight Upweight",
        event_details="MSCI global index weight increase triggers $3.5B+ foreign institutional passive and active accumulation; Credit-Deposit ratio normalizing steadily.",
        contract_value="$3.5B Inflows",
        time_period="Past 60 Days",
        fii_dii_change="FII +1.4%, DII Hold 34.2%",
        cmp=1680.0,
        target_price=2050.0,
        potential_upside="+22.0%",
        market_cap_tier="Large Cap",
        tags=["MSCI Weight Up", "FII Buying Spree", "Credit-Deposit Ratio", "Nifty Heavyweight"],
        catalyst_summary="Structural post-merger balance sheet integration completed with expanding net interest income."
    ),
    StockEvent(
        id="EVT-10",
        symbol="TITAN",
        company_name="Titan Company Ltd",
        sector="Gems, Jewellery & Luxury Watches",
        category="Winter & Wedding Boom",
        badge_icon="❄️",
        impact_score=97,
        headline="Duty Cut to 6% + Historic 38 Lakh Indian Weddings Season Ahead",
        event_details="Customs duty cut on gold from 15% to 6% ignited buyer footfalls; 38+ lakh weddings projected between Nov–Feb with Tanishq capturing premium bridal spend.",
        contract_value="Jewellery Revenue +25%",
        time_period="Past 30 Days",
        fii_dii_change="FII +1.5%, DII +1.3%",
        cmp=3580.0,
        target_price=4250.0,
        potential_upside="+18.7%",
        market_cap_tier="Large Cap",
        tags=["Wedding Season", "Gold Duty Cut", "Tanishq Bridal", "Q3 Peak Quarter"],
        catalyst_summary="Q3 is seasonally the largest revenue & profit generator for Titan with highest EBITDA conversion."
    ),
]


# ── 2. Upcoming Events & Earnings Calendar (Next 30–60 Days) ──
UPCOMING_EVENTS_DATABASE: List[UpcomingEvent] = [
    UpcomingEvent(
        id="UPC-01",
        symbol="TCS",
        company_name="Tata Consultancy Services Ltd",
        sector="IT Services & Digital Solutions",
        event_type="Quarterly Results (Q2/Q3)",
        event_date="10 Oct 2026",
        days_left="Upcoming in 4 Days",
        badge_icon="💻",
        expected_impact="🔥 High Volatility & BFSI TCV Surge",
        consensus_metrics="Consensus: Revenue +1.8% QoQ (Constant Currency), EBIT Margin ~26.0%, Deal Wins $8.5B+",
        technical_setup="Consolidating above 50 EMA at ₹4,220. Breakout level at ₹4,310 with RSI 62.",
        cmp=4240.0,
        support_level=4160.0,
        resistance_level=4340.0,
        action_verdict="Bullish Accumulation on Dips"
    ),
    UpcomingEvent(
        id="UPC-02",
        symbol="INFY",
        company_name="Infosys Ltd",
        sector="IT & Cloud Transformation",
        event_type="Quarterly Results & Guidance Revision",
        event_date="17 Oct 2026",
        days_left="Upcoming in 11 Days",
        badge_icon="☁️",
        expected_impact="📈 Potential Guidance Upgrade",
        consensus_metrics="Consensus: Revenue growth guidance expected to be revised upward from 3-4% to 4.5-5.0%.",
        technical_setup="Trading above 20 EMA at ₹1,910. Cup & Handle pattern forming on daily chart.",
        cmp=1925.0,
        support_level=1880.0,
        resistance_level=1975.0,
        action_verdict="High-Conviction Pre-Result Hold"
    ),
    UpcomingEvent(
        id="UPC-03",
        symbol="RELIANCE",
        company_name="Reliance Industries Ltd",
        sector="Energy, Retail & Telecom (Jio)",
        event_type="Board Meeting & Retail/Jio Value Unlocking",
        event_date="21 Oct 2026",
        days_left="Upcoming in 15 Days",
        badge_icon="👑",
        expected_impact="⚡ Tariff Hike Impact & Clean Energy Capex",
        consensus_metrics="Consensus: Jio ARPU expands from ₹181 to ₹205; Retail square footage +18% YoY.",
        technical_setup="Holding massive structural support at ₹2,920. 200 EMA at ₹2,880 acting as iron floor.",
        cmp=2960.0,
        support_level=2910.0,
        resistance_level=3080.0,
        action_verdict="Accumulate for ₹3,200+ Breakout"
    ),
    UpcomingEvent(
        id="UPC-04",
        symbol="TATAMOTORS",
        company_name="Tata Motors Ltd",
        sector="Automotive & EV Mobility",
        event_type="Commercial Vehicle Demerger & JLR Investor Day",
        event_date="28 Oct 2026",
        days_left="Upcoming in 22 Days",
        badge_icon="🚗",
        expected_impact="🚀 Demerger Share Entitlement Ratio",
        consensus_metrics="Consensus: PV + EV entity valued at ₹650/sh; CV standalone entity valued at ₹480/sh.",
        technical_setup="Re-testing broken neckline at ₹960 with 9 EMA dynamic support holding firmly.",
        cmp=980.0,
        support_level=940.0,
        resistance_level=1040.0,
        action_verdict="Strong Buy for Value Unlocking"
    ),
    UpcomingEvent(
        id="UPC-05",
        symbol="HAL",
        company_name="Hindustan Aeronautics Ltd",
        sector="Defense Aerospace & Fighter Jets",
        event_type="Cabinet Defense Acquisition Council (DAC) Tender",
        event_date="05 Nov 2026",
        days_left="Upcoming in 30 Days",
        badge_icon="✈️",
        expected_impact="🎖️ ₹65,000+ Cr Tejas Mk1A Procurement Contract",
        consensus_metrics="DAC final clearance expected for 97 additional Tejas Mk1A fighter jets for IAF.",
        technical_setup="Symmetrical triangle squeeze on daily chart. Upper trendline breakout at ₹4,780.",
        cmp=4720.0,
        support_level=4550.0,
        resistance_level=5150.0,
        action_verdict="Breakout Watch with 1:3.5 R:R"
    ),
    UpcomingEvent(
        id="UPC-06",
        symbol="BAJFINANCE",
        company_name="Bajaj Finance Ltd",
        sector="NBFC & Consumer Lending",
        event_type="Quarterly Results & Bajaj Housing Finance IPO Listing",
        event_date="14 Nov 2026",
        days_left="Upcoming in 39 Days",
        badge_icon="💳",
        expected_impact="📊 AUM Growth > 28% & Asset Quality Update",
        consensus_metrics="Consensus: AUM crosses ₹3.55 Lakh Cr; Gross NPA contained below 0.95%.",
        technical_setup="Double bottom W-pattern neckline tested at ₹7,350 with expanding volumes.",
        cmp=7280.0,
        support_level=7050.0,
        resistance_level=7650.0,
        action_verdict="Pre-Result Swing Long"
    ),
]


# ── 3. Stock News Technical Analysis Feed (+ve & -ve Results / News) ──
STOCK_NEWS_DATABASE: List[StockNewsItem] = [
    StockNewsItem(
        id="NEWS-01",
        symbol="TRENT",
        company_name="Trent Ltd",
        sector="Retail Fashion",
        news_type="+ve Results & Earnings Surge",
        sentiment="positive",
        badge_icon="🟢",
        headline="Zudio Explodes: Standalone Revenue Jumps +54%, PAT Soars +130% to ₹420 Cr",
        time_period="Just In (Past 48h)",
        summary="Trent reported blistering Q1/Q2 earnings outperforming all street expectations. Net margin expanded by 240 bps driven by supply chain automation.",
        key_takeaway="Zudio continues to dominate affordable fashion in India; store unit payback period under 18 months.",
        technical_impact="Stock broke out of multi-week flag pattern above ₹6,600 on 3.4x average volume.",
        support_level=6550.0,
        resistance_level=7450.0,
        action_suggestion="🟢 BUY / ACCUMULATE: Hold trailing stop loss below 20 EMA at ₹6,550."
    ),
    StockNewsItem(
        id="NEWS-02",
        symbol="INDUSINDBK",
        company_name="IndusInd Bank Ltd",
        sector="Private Banking",
        news_type="-ve Results & Margin Caution",
        sentiment="negative",
        badge_icon="🔴",
        headline="NIM Compresses to 4.08%; Microfinance (MFI) Stress Leads to Higher Credit Costs",
        time_period="Past 3 Days",
        summary="IndusInd Bank reported a 28 bps contraction in Net Interest Margin due to elevated cost of deposits and higher loan slippages in rural micro-finance portfolios.",
        key_takeaway="Rural MFI delinquency cycles could take 2-3 quarters to stabilize; deposit repricing pressures persist.",
        technical_impact="Stock slipped below 50 EMA and 200 EMA at ₹1,420; heavy red delivery volume observed.",
        support_level=1320.0,
        resistance_level=1440.0,
        action_suggestion="🔴 CAUTION / AVOID: Do not catch the falling knife until price stabilizes at ₹1,320 support."
    ),
    StockNewsItem(
        id="NEWS-03",
        symbol="LT",
        company_name="Larsen & Toubro Ltd",
        sector="Capital Goods & Infrastructure",
        news_type="Mega Work Orders & Contracts",
        sentiment="positive",
        badge_icon="🟢",
        headline="Secures ₹25,000+ Cr Ultra-Mega EPC Package from Saudi Aramco & ADNOC",
        time_period="Past 5 Days",
        summary="L&T's Hydrocarbon division bagged major gas gathering & compression field development contracts in the Middle East.",
        key_takeaway="International revenue share increases to 38% of total order book; operational margins guaranteed by dollar-denominated contracts.",
        technical_impact="Stock retested 9 EMA at ₹3,580 and bounced with heavy institutional green bar.",
        support_level=3520.0,
        resistance_level=3950.0,
        action_suggestion="🟢 HIGH CONVICTION BUY: Target ₹4,150; Stop Loss below ₹3,520."
    ),
    StockNewsItem(
        id="NEWS-04",
        symbol="ASIANPAINT",
        company_name="Asian Paints Ltd",
        sector="Decorative Paints & Coatings",
        news_type="-ve Results & Margin Caution",
        sentiment="negative",
        badge_icon="🔴",
        headline="Volume Growth Dips to +2.5%; Price Cuts to Counter Grasim Birla Opus Paint Entry",
        time_period="Past 7 Days",
        summary="Intense competitive rivalry from Grasim's Birla Opus forced Asian Paints to slash dealer prices by 3.5%, compressing operating EBITDA margin to 17.8%.",
        key_takeaway="Industry-wide price war is hurting pricing power; premium decorative volume growth moderating.",
        technical_impact="Stock broke down below critical 3-year support at ₹2,800; RSI oversold at 28.",
        support_level=2650.0,
        resistance_level=2850.0,
        action_suggestion="🔴 BEARISH / SELL ON RISE: Wait for Grasim market share settling before fresh entries."
    ),
    StockNewsItem(
        id="NEWS-05",
        symbol="ZOMATO",
        company_name="Zomato Ltd",
        sector="Quick Commerce",
        news_type="+ve Results & Earnings Surge",
        sentiment="positive",
        badge_icon="🟢",
        headline="Blinkit Quick Commerce GOV Surges +130% YoY; Net Profit Hits ₹253 Cr",
        time_period="Past 10 Days",
        summary="Blinkit expanded dark store count to 639 with average store GOV increasing by 48%. Consolidated profitability confirmed for 4th consecutive quarter.",
        key_takeaway="Quick commerce is eating into traditional FMCG supermarket retail; advertising revenue monetization accelerating.",
        technical_impact="Stock made fresh 52-week all-time high breaking above ₹250 on massive FII block volume.",
        support_level=242.0,
        resistance_level=310.0,
        action_suggestion="🟢 BUY ON DIPS: Trailing stop loss at ₹240; Long term target ₹330."
    ),
    StockNewsItem(
        id="NEWS-06",
        symbol="SUNPHARMA",
        company_name="Sun Pharmaceutical Industries Ltd",
        sector="Pharmaceuticals & Healthcare",
        news_type="Regulatory & Policy",
        sentiment="neutral",
        badge_icon="🟡",
        headline="US FDA Issues 3 Procedural Observations at Dadra Facility; Zero Data Integrity Issues",
        time_period="Past 12 Days",
        summary="Routine inspection concluded with minor Form 483 observations; management confirmed no impact on current commercial dispatches to North America.",
        key_takeaway="Global specialty portfolio (Ilumya, Cequa) unaffected; procedural remediations to be submitted within 15 days.",
        technical_impact="Stock dip to ₹1,810 was aggressively bought by domestic mutual funds; rebounded to ₹1,870.",
        support_level=1820.0,
        resistance_level=1940.0,
        action_suggestion="🟡 NEUTRAL / ACCUMULATE: Safe long-term compounder at 20 EMA."
    ),
]


def get_latest_events(category: Optional[str] = None) -> List[StockEvent]:
    if not category or category == "All":
        return LATEST_EVENTS_DATABASE
    return [e for e in LATEST_EVENTS_DATABASE if e.category.lower() == category.lower()]


def get_upcoming_events(event_type: Optional[str] = None) -> List[UpcomingEvent]:
    if not event_type or event_type == "All":
        return UPCOMING_EVENTS_DATABASE
    return [e for e in UPCOMING_EVENTS_DATABASE if event_type.lower() in e.event_type.lower()]


def get_stock_news(news_type: Optional[str] = None) -> List[StockNewsItem]:
    if not news_type or news_type == "All":
        return STOCK_NEWS_DATABASE
    if news_type.lower() == "positive":
        return [n for n in STOCK_NEWS_DATABASE if n.sentiment == "positive"]
    if news_type.lower() == "negative":
        return [n for n in STOCK_NEWS_DATABASE if n.sentiment == "negative"]
    return [n for n in STOCK_NEWS_DATABASE if news_type.lower() in n.news_type.lower()]

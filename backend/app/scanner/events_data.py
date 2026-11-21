"""
Market Events, Upcoming Calendar & Stock News Analysis Database (Latest 1 to 3 Months).
Tracks Mega Work Orders, Positive vs Negative Results, Upcoming Earnings Calendar,
Board Meetings, and Stock News Technical Impact Analysis. Calibrated to November 2026.
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
    event_type: str
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


# ── 1. Comprehensive Catalyst & Work Orders Directory (20 Stocks) ──
LATEST_EVENTS_DATABASE: List[StockEvent] = [
    # ── Work Orders & Contracts (5) ──
    StockEvent(
        id="EVT-01",
        symbol="LT",
        company_name="Larsen & Toubro Ltd",
        sector="Capital Goods & Infrastructure",
        category="Work Orders & Contracts",
        badge_icon="🏗️",
        impact_score=96,
        headline="₹28,500+ Cr Middle East Hydrocarbon & Bullet Train Mega Orders",
        event_details="L&T secures landmark offshore gas compression & pipeline packages from Saudi Aramco and ADNOC, alongside high-speed rail civil execution packages in India.",
        contract_value="₹28,500 Cr",
        time_period="Past 15 Days",
        fii_dii_change="FII +1.4%, DII +1.1%",
        cmp=4209.1,
        target_price=4850.0,
        potential_upside="+15.2%",
        market_cap_tier="Large Cap",
        tags=["Mega Contract", "Saudi Aramco", "Bullet Train", "Order Book ATH"],
        catalyst_summary="Consolidated order book surpasses ₹4.95 Lakh Cr, offering 3.4 years of revenue visibility with expanding EBITDA margins."
    ),
    StockEvent(
        id="EVT-02",
        symbol="BHEL",
        company_name="Bharat Heavy Electricals Ltd",
        sector="Power Equipment & Heavy Engineering",
        category="Work Orders & Contracts",
        badge_icon="⚡",
        impact_score=94,
        headline="₹19,400+ Cr Supercritical Thermal Power EPC Orders from DVC & Adani",
        event_details="Bagged massive EPC power plant equipment orders from Damodar Valley Corporation (DVC) and Adani Power for 2x800 MW and 3x800 MW supercritical units.",
        contract_value="₹19,400 Cr",
        time_period="Past 30 Days",
        fii_dii_change="DII +2.4%, LIC Active",
        cmp=433.65,
        target_price=520.0,
        potential_upside="+19.9%",
        market_cap_tier="Large Cap",
        tags=["Thermal Supercritical", "DVC", "Adani Power", "Capex Cycle"],
        catalyst_summary="Thermal power revival in India guarantees multi-year manufacturing order book utilization and strong operating leverage."
    ),
    StockEvent(
        id="EVT-03",
        symbol="COCHINSHIP",
        company_name="Cochin Shipyard Ltd",
        sector="Defense & Shipbuilding",
        category="Work Orders & Contracts",
        badge_icon="🚢",
        impact_score=95,
        headline="₹10,200+ Cr Next-Gen Defense Anti-Submarine Vessels & European Green Ships",
        event_details="Commissioned India's largest new dry dock and won international zero-emission feeder container vessel orders from European clients and Indian Navy.",
        contract_value="₹10,200 Cr",
        time_period="Past 20 Days",
        fii_dii_change="FII +1.8%, DII +1.5%",
        cmp=1125.0,
        target_price=1380.0,
        potential_upside="+22.7%",
        market_cap_tier="Mid Cap",
        tags=["Defense Shipbuilding", "Export Order", "Dry Dock", "Make in India"],
        catalyst_summary="Massive domestic defense budget allocation combined with European commercial maritime fleet renewal drives order book to record high."
    ),
    StockEvent(
        id="EVT-04",
        symbol="RVNL",
        company_name="Rail Vikas Nigam Ltd",
        sector="Railways & Metro Infrastructure",
        category="Work Orders & Contracts",
        badge_icon="🚆",
        impact_score=92,
        headline="₹6,850+ Cr High-Speed Vande Bharat Electrification & Metro Civil Packages",
        event_details="Lowest bidder (L1) across South Eastern Railway automatic block signaling, Western Railway double line, and Indore/Bhopal metro packages.",
        contract_value="₹6,850 Cr",
        time_period="Past 25 Days",
        fii_dii_change="DII +1.2%, Retail Active",
        cmp=191.0,
        target_price=240.0,
        potential_upside="+25.7%",
        market_cap_tier="Mid Cap",
        tags=["Railway Capex", "Metro Package", "Vande Bharat", "L1 Bidder"],
        catalyst_summary="Indian Railways modernization budget of ₹2.55 Lakh Cr directly feeds RVNL order execution pipeline over the next 3 years."
    ),
    StockEvent(
        id="EVT-05",
        symbol="DIXON",
        company_name="Dixon Technologies (India) Ltd",
        sector="Electronics Manufacturing (EMS)",
        category="Work Orders & Contracts",
        badge_icon="📱",
        impact_score=97,
        headline="₹8,000+ Cr Smartphone & IT Hardware PLI Mega Contract with Xiaomi & Transsion",
        event_details="Expanded smartphone assembly footprint; signed major manufacturing joint ventures with Transsion and Xiaomi for 50M+ annual units in Noida.",
        contract_value="₹8,000 Cr/yr",
        time_period="Past 15 Days",
        fii_dii_change="FII +2.6%, DII +1.8%",
        cmp=13120.0,
        target_price=15400.0,
        potential_upside="+17.4%",
        market_cap_tier="Large Cap",
        tags=["PLI Scheme", "Xiaomi Partner", "EMS Leader", "Smartphone Export"],
        catalyst_summary="IT Hardware & Smartphone PLI schemes propel Dixon into the top global tier of contract electronics manufacturers."
    ),

    # ── Positive Earnings / +ve Results (3) ──
    StockEvent(
        id="EVT-06",
        symbol="TRENT",
        company_name="Trent Ltd (Tata Group)",
        sector="Retail & Consumer Apparel",
        category="Positive Earnings / +ve Results",
        badge_icon="📈",
        impact_score=98,
        headline="Zudio Footprint Surpasses 580 Stores; Revenue +54% YoY, PAT Jumps +130%",
        event_details="Zudio store count crosses 580+ with industry-leading unit economics; Westside LFL growth reaches double digits with zero inventory markdown.",
        contract_value="PAT ₹420 Cr (+130%)",
        time_period="Latest Quarter",
        fii_dii_change="FII +2.1%, DII +1.4%",
        cmp=3256.1,
        target_price=3850.0,
        potential_upside="+18.2%",
        market_cap_tier="Large Cap",
        tags=["Zudio Mania", "PAT +130%", "Tata Retail", "Record Margin"],
        catalyst_summary="Fastest retail footprint expansion in India with highest revenue per square foot in affordable fashion."
    ),
    StockEvent(
        id="EVT-07",
        symbol="ZOMATO",
        company_name="Zomato Ltd (Blinkit)",
        sector="Quick Commerce & Internet",
        category="Positive Earnings / +ve Results",
        badge_icon="🚀",
        impact_score=96,
        headline="Blinkit Quick Commerce GOV Surges +130% YoY; Net Profit Hits ₹253 Cr",
        event_details="Blinkit dark store count scaled to 1,000 target; quick commerce gross order value growing at 3x the pace of food delivery with positive net contribution.",
        contract_value="PAT ₹253 Cr (4th Qtr Profit)",
        time_period="Latest Quarter",
        fii_dii_change="FII +3.4%, DII +2.1%",
        cmp=364.0,
        target_price=440.0,
        potential_upside="+20.9%",
        market_cap_tier="Large Cap",
        tags=["Blinkit Profit", "Quick Commerce", "FII Favorite", "GOV +130%"],
        catalyst_summary="Rapidly converting retail consumption into quick commerce with expanding ad-monetization take rates."
    ),
    StockEvent(
        id="EVT-08",
        symbol="TATASTEEL",
        company_name="Tata Steel Ltd",
        sector="Metals & Mining",
        category="Positive Earnings / +ve Results",
        badge_icon="🏭",
        impact_score=94,
        headline="UK Port Talbot EAF Transition Green Grant & India Capacity Surging to 30 MTPA",
        event_details="Signed £500M grant with UK Government for decarbonization while Kalinganagar phase-2 expansion drives domestic steel margins and record volume growth.",
        contract_value="EBITDA/Ton +28% QoQ",
        time_period="Latest Quarter",
        fii_dii_change="FII +1.5%, DII +2.2%",
        cmp=178.0,
        target_price=215.0,
        potential_upside="+20.8%",
        market_cap_tier="Large Cap",
        tags=["Green Steel", "EAF Transition", "UK Grant", "Kalinganagar Ramp"],
        catalyst_summary="Elimination of heavy UK blast-furnace losses and Indian capacity addition will drive substantial EPS upgrades."
    ),

    # ── FII / DII Accumulation (2) ──
    StockEvent(
        id="EVT-09",
        symbol="HDFCBANK",
        company_name="HDFC Bank Ltd",
        sector="Banking & Financial Services",
        category="FII / DII Accumulation",
        badge_icon="🏦",
        impact_score=95,
        headline="FII Stake Increases by 1.6% Post MSCI Free-Float Weight Increase with $3.5B Inflow",
        event_details="MSCI global index weight increase triggers $3.5B+ foreign institutional passive and active accumulation; Credit-Deposit ratio normalizing steadily below 100%.",
        contract_value="$3.5B Inflows",
        time_period="Past 30 Days",
        fii_dii_change="FII +1.6%, DII Hold 34%",
        cmp=846.0,
        target_price=1020.0,
        potential_upside="+20.6%",
        market_cap_tier="Large Cap",
        tags=["MSCI Weight Up", "FII Buying Spree", "Credit-Deposit Ratio", "Nifty Heavyweight"],
        catalyst_summary="Structural post-merger balance sheet integration completed with expanding net interest income and branch productivity."
    ),
    StockEvent(
        id="EVT-10",
        symbol="BANKBARODA",
        company_name="Bank of Baroda",
        sector="Public Sector Banking",
        category="FII / DII Accumulation",
        badge_icon="🏛️",
        impact_score=95,
        headline="DII & FII Continuous Accumulation; ROA Crosses 1.25%, Asset Quality at Multi-Year Peak",
        event_details="Institutional holding surges as Net NPA drops to historic low 0.60% and GNPA touches 2.28%. Approves ₹5,000 Cr Tier-II infrastructure bond issuance.",
        contract_value="GNPA 2.28% (Multi-Year Low)",
        time_period="Past 15 Days",
        fii_dii_change="FII +1.3%, DII +1.7%",
        cmp=287.0,
        target_price=345.0,
        potential_upside="+20.2%",
        market_cap_tier="Large Cap",
        tags=["PSU Bank Leader", "Record Net Profit", "GNPA 2.28%", "FII Accumulation"],
        catalyst_summary="Industry-leading return ratios among PSU banks with clean balance sheet, strong credit growth, and low valuation discount."
    ),

    # ── Promoter Buying & Pledge (2) ──
    StockEvent(
        id="EVT-11",
        symbol="VEDL",
        company_name="Vedanta Ltd",
        sector="Metals & Natural Resources",
        category="Promoter Buying & Pledge",
        badge_icon="👑",
        impact_score=93,
        headline="Promoter Pledge Reduced by 45% Ahead of 6-Way Business Demerger",
        event_details="Promoter entities aggressively deleverage debt via QIP proceeds and brand royalties; NCLT approval process underway for 6 standalone listed entities.",
        contract_value="Pledge Down 45%",
        time_period="Past 30 Days",
        fii_dii_change="Promoter 56.4%, DII +1.5%",
        cmp=238.04,
        target_price=295.0,
        potential_upside="+23.9%",
        market_cap_tier="Large Cap",
        tags=["Pledge Reduction", "Demerger", "Dividend Yield", "Aluminum & Zinc"],
        catalyst_summary="Substantial deleveraging removes promoter debt overhang; pure-play demerger unlocks multi-commodity valuation upside."
    ),
    StockEvent(
        id="EVT-12",
        symbol="SUNPHARMA",
        company_name="Sun Pharmaceutical Industries Ltd",
        sector="Pharmaceuticals & Healthcare",
        category="Promoter Buying & Pledge",
        badge_icon="💊",
        impact_score=94,
        headline="Promoters Increase Stake to 54.5%; Zero Pledged Shares & Global Specialty Pipeline Boom",
        event_details="Promoter group steadily accumulates shares from open market; specialty dermatology & ophthalmology drugs (Ilumya, Cequa, Winlevi) cross $1B annual run-rate.",
        contract_value="Zero Promoter Pledge",
        time_period="Past 20 Days",
        fii_dii_change="Promoter Buying +0.3%",
        cmp=1884.9,
        target_price=2180.0,
        potential_upside="+15.7%",
        market_cap_tier="Large Cap",
        tags=["Zero Pledge", "Promoter Buying", "Specialty Pharma", "US FDA Clearance"],
        catalyst_summary="Cleanest balance sheet in Indian pharma with zero promoter encumbrance and high free cash flow compounding."
    ),

    # ── Monsoon & Agro Season (2) ──
    StockEvent(
        id="EVT-13",
        symbol="COROMANDEL",
        company_name="Coromandel International Ltd",
        sector="Agrochemicals & Fertilizers",
        category="Monsoon & Agro Season",
        badge_icon="🌾",
        impact_score=92,
        headline="Above-Normal Reservoir Levels & Rabi Sowing Season Drives Record NPK Fertilizer Offtake",
        event_details="Strong monsoon replenishment of water reservoirs in southern & central India sets up record Rabi crop acreage; phosphatic fertilizer subsidies maintained.",
        contract_value="EBITDA Margin 14.8%",
        time_period="Past 30 Days",
        fii_dii_change="FII +1.1%, DII +1.9%",
        cmp=1996.0,
        target_price=2350.0,
        potential_upside="+17.7%",
        market_cap_tier="Large Cap",
        tags=["Rabi Season", "NPK Complex", "Agro Boom", "Subsidy Clarity"],
        catalyst_summary="Leading player in complex fertilizers poised for volume growth and margin recovery in H2 FY27."
    ),
    StockEvent(
        id="EVT-14",
        symbol="UPL",
        company_name="UPL Ltd",
        sector="Crop Protection & Agrochemicals",
        category="Monsoon & Agro Season",
        badge_icon="🌱",
        impact_score=91,
        headline="Global Crop Protection Channel Inventory Destocking Concludes; LatAm & India Demand Rebounds",
        event_details="Agrochemical inventory destocking cycle in Brazil and US nears completion; seeds business Advanta gears up for strategic funding / pre-IPO valuation.",
        contract_value="Gross Debt Down $650M",
        time_period="Past 30 Days",
        fii_dii_change="DII +2.2%, FII +0.8%",
        cmp=571.95,
        target_price=710.0,
        potential_upside="+24.1%",
        market_cap_tier="Mid Cap",
        tags=["Destocking End", "Advanta Seeds", "Debt Reduction", "Rabi Demand"],
        catalyst_summary="Inflection point in global agrochem pricing cycle with rapid balance sheet deleveraging underway."
    ),

    # ── Winter & Wedding Boom (3) ──
    StockEvent(
        id="EVT-15",
        symbol="TITAN",
        company_name="Titan Company Ltd",
        sector="Gems, Jewellery & Luxury Watches",
        category="Winter & Wedding Boom",
        badge_icon="💍",
        impact_score=97,
        headline="Gold Customs Duty Cut to 6% Combined with 38 Lakh Indian Winter Weddings Season",
        event_details="Customs duty cut on gold from 15% to 6% ignited buyer footfalls; 38+ lakh weddings projected between Nov–Feb with Tanishq capturing premium bridal spend.",
        contract_value="Jewellery Revenue +25%",
        time_period="Past 15 Days",
        fii_dii_change="FII +1.8%, DII +1.5%",
        cmp=4620.0,
        target_price=5350.0,
        potential_upside="+15.8%",
        market_cap_tier="Large Cap",
        tags=["Wedding Season", "Gold Duty Cut", "Tanishq Bridal", "Q3 Peak Quarter"],
        catalyst_summary="Q3 is seasonally the largest revenue & profit generator for Titan with highest EBITDA conversion."
    ),
    StockEvent(
        id="EVT-16",
        symbol="ASIANPAINT",
        company_name="Asian Paints Ltd",
        sector="Decorative Paints & Home Coatings",
        category="Winter & Wedding Boom",
        badge_icon="🎨",
        impact_score=91,
        headline="Winter Home Renovation Peak & Wedding Repainting Demand Fuels Premium Texture Volumes",
        event_details="Strong festive and bridal season demand drives premium emulsion and waterproofing product lines, providing pricing buffer against industry rivalry.",
        contract_value="Volume Growth +8.5%",
        time_period="Past 20 Days",
        fii_dii_change="DII Accumulating at Support",
        cmp=2608.3,
        target_price=3050.0,
        potential_upside="+16.9%",
        market_cap_tier="Large Cap",
        tags=["Wedding Home Makeover", "Waterproofing", "Texture Emulsions", "Deep Support"],
        catalyst_summary="Valuation at multi-year low multiples with strong domestic retail dealer network moats."
    ),
    StockEvent(
        id="EVT-17",
        symbol="TATAMOTORS",
        company_name="Tata Motors Ltd",
        sector="Automotive & Commercial Vehicles",
        category="Winter & Wedding Boom",
        badge_icon="🚗",
        impact_score=95,
        headline="Festive & Wedding SUV Bookings Cross 1.2 Lakh Units; EV Market Share Leads at 72%",
        event_details="Nexon, Punch, Harrier, and Curvv witness wedding gifting and festive delivery surges; JLR order bank remains solid at 145,000+ luxury units.",
        contract_value="Monthly Run Rate 50k+ PVs",
        time_period="Past 20 Days",
        fii_dii_change="FII +1.4%, DII +1.6%",
        cmp=456.75,
        target_price=550.0,
        potential_upside="+20.4%",
        market_cap_tier="Large Cap",
        tags=["SUV Boom", "Curvv EV", "Wedding Season", "CV Demerger"],
        catalyst_summary="Commercial vehicle demerger unlocks shareholder value while Passenger Vehicle segment captures top domestic SUV share."
    ),

    # ── Summer & Power Capex (3) ──
    StockEvent(
        id="EVT-18",
        symbol="NTPC",
        company_name="NTPC Ltd",
        sector="Power Generation & Green Energy",
        category="Summer & Power Capex",
        badge_icon="☀️",
        impact_score=95,
        headline="NTPC Green Energy Mega IPO & 26 GW Renewable Capacity Construction Run-Rate",
        event_details="Successful listing of NTPC Green Energy subsidiary raises growth capital for solar & green hydrogen mega projects; thermal PLF at peak efficiency.",
        contract_value="₹10,000 Cr Green Capex",
        time_period="Past 10 Days",
        fii_dii_change="FII +2.1%, DII +1.8%",
        cmp=321.5,
        target_price=395.0,
        potential_upside="+22.9%",
        market_cap_tier="Large Cap",
        tags=["NTPC Green", "Solar Parks", "Power Deficit", "Green Hydrogen"],
        catalyst_summary="India's peak power demand surges toward 260 GW; NTPC is the premier beneficiary of both baseload thermal and green transition."
    ),
    StockEvent(
        id="EVT-19",
        symbol="TATAPOWER",
        company_name="Tata Power Co Ltd",
        sector="Integrated Power & Renewables",
        category="Summer & Power Capex",
        badge_icon="🔋",
        impact_score=94,
        headline="Secures ₹12,000+ Cr Pumped Hydro Storage (PSP) & Solar Rooftop PM Surya Ghar Orders",
        event_details="Commissioning India's premier 2.8 GW pumped hydro energy storage projects in Maharashtra; rooftop solar residential installations cross 150,000 benchmark.",
        contract_value="Order Book ₹18,500 Cr",
        time_period="Past 15 Days",
        fii_dii_change="FII +1.5%, DII +2.3%",
        cmp=339.7,
        target_price=415.0,
        potential_upside="+22.2%",
        market_cap_tier="Large Cap",
        tags=["Pumped Hydro", "Rooftop Solar", "PM Surya Ghar", "Transmission Capex"],
        catalyst_summary="Full integration from 4.3 GW cell-module manufacturing to round-the-clock green power delivery."
    ),
    StockEvent(
        id="EVT-20",
        symbol="HAL",
        company_name="Hindustan Aeronautics Ltd",
        sector="Defense Aerospace & Fighter Jets",
        category="Summer & Power Capex",
        badge_icon="✈️",
        impact_score=97,
        headline="CCS Approval for 97 Tejas Mk1A Aircraft & 240 AL-31FP Sukhoi Engine Manufacturing",
        event_details="Cabinet Committee on Security gives final clearance for landmark ₹65,000 Cr fighter jet manufacturing program; third production line commissioned in Nashik.",
        contract_value="₹65,000+ Cr Defense Tender",
        time_period="Past 15 Days",
        fii_dii_change="DII +1.9%, FII +1.4%",
        cmp=4809.0,
        target_price=5600.0,
        potential_upside="+16.5%",
        market_cap_tier="Large Cap",
        tags=["Tejas Mk1A", "Defense Capex", "Make in India", "Indigenization ATH"],
        catalyst_summary="Total order book exceeds ₹1.25 Lakh Cr, securing 6+ years of double-digit revenue expansion and high defense profitability."
    ),
]


# ── 2. Upcoming Events & Earnings Calendar (Next 30–60 Days - Late Nov 2026 - Jan 2027) ──
UPCOMING_EVENTS_DATABASE: List[UpcomingEvent] = [
    UpcomingEvent(
        id="UPC-01",
        symbol="TATASTEEL",
        company_name="Tata Steel Ltd",
        sector="Metals & Mining",
        event_type="Board Review & Green Steel Capital Allocation",
        event_date="25 Nov 2026",
        days_left="Upcoming in 4 Days",
        badge_icon="🏭",
        expected_impact="⚡ UK Port Talbot EAF Funding & Kalinganagar Phase-2 Ramp-up",
        consensus_metrics="Consensus: Domestic steel realization +₹1,200/t; European losses narrow significantly.",
        technical_setup="Rebounded off 100 EMA at ₹172; testing key swing resistance at ₹182 with rising volume.",
        cmp=178.0,
        support_level=171.0,
        resistance_level=186.0,
        action_verdict="Strong Bullish Accumulation on Dips"
    ),
    UpcomingEvent(
        id="UPC-02",
        symbol="BANKBARODA",
        company_name="Bank of Baroda",
        sector="Public Sector Banking",
        event_type="Board Meeting & Infrastructure Bond Issuance",
        event_date="28 Nov 2026",
        days_left="Upcoming in 7 Days",
        badge_icon="🏛️",
        expected_impact="📈 ₹5,000 Cr Long-Term Infrastructure Bond Issuance",
        consensus_metrics="Consensus: Credit growth steady at 14.5% YoY; NIM protected at ~3.15%.",
        technical_setup="Clean cup & handle continuation on weekly chart; broke out above ₹285 with institutional volume.",
        cmp=287.0,
        support_level=278.5,
        resistance_level=298.0,
        action_verdict="High-Conviction Breakout Setup"
    ),
    UpcomingEvent(
        id="UPC-03",
        symbol="TATAMOTORS",
        company_name="Tata Motors Ltd",
        sector="Automotive & EV Mobility",
        event_type="Monthly Auto Sales Dispatches & Demerger Filing",
        event_date="01 Dec 2026",
        days_left="Upcoming in 10 Days",
        badge_icon="🚗",
        expected_impact="🚀 Commercial Vehicle Demerger NCLT Clearance Update",
        consensus_metrics="Consensus: November PV dispatches ~48,000 units; EV market share maintains >70%.",
        technical_setup="Consolidating above 20 EMA at ₹448; ready for breakout towards ₹480+ hurdle.",
        cmp=456.75,
        support_level=442.0,
        resistance_level=478.0,
        action_verdict="Accumulate for Value Unlocking"
    ),
    UpcomingEvent(
        id="UPC-04",
        symbol="HDFCBANK",
        company_name="HDFC Bank Ltd",
        sector="Banking & Financial Services",
        event_type="RBI MPC Meeting & Liquidity Policy Review",
        event_date="06 Dec 2026",
        days_left="Upcoming in 15 Days",
        badge_icon="🏦",
        expected_impact="🔥 RBI Monetary Policy Committee Rate Decision & Banking Stance",
        consensus_metrics="Consensus: Repo rate steady at 6.50%; liquidity measures to assist deposit accretion.",
        technical_setup="Massive support floor established around ₹830; MACD bull crossover confirmed on daily chart.",
        cmp=846.0,
        support_level=825.0,
        resistance_level=885.0,
        action_verdict="Structural Banking Compounder"
    ),
    UpcomingEvent(
        id="UPC-05",
        symbol="HAL",
        company_name="Hindustan Aeronautics Ltd",
        sector="Defense Aerospace & Fighter Jets",
        event_type="Defense Acquisition Council (DAC) Final Contract Signing",
        event_date="11 Dec 2026",
        days_left="Upcoming in 20 Days",
        badge_icon="✈️",
        expected_impact="🎖️ Final Execution of ₹65,000+ Cr Tejas Mk1A Procurement Contract",
        consensus_metrics="Consensus: Final execution timeline guarantees delivery schedules for 97 aircraft through 2030.",
        technical_setup="Bull flag breakout on daily timeframe above ₹4,750 with 14-day RSI surging to 64.",
        cmp=4809.0,
        support_level=4650.0,
        resistance_level=5150.0,
        action_verdict="Breakout Long with 1:3 R:R"
    ),
    UpcomingEvent(
        id="UPC-06",
        symbol="RELIANCE",
        company_name="Reliance Industries Ltd",
        sector="Energy, Retail & Telecom (Jio)",
        event_type="Board Meeting & Strategic Investor Presentation",
        event_date="18 Dec 2026",
        days_left="Upcoming in 27 Days",
        badge_icon="👑",
        expected_impact="⚡ Jio Infocomm IPO Filing Roadmap & New Energy Solar Capex",
        consensus_metrics="Consensus: Jio ARPU expands towards ₹210; New energy solar gigafactory operational update.",
        technical_setup="Holding key support trendline at ₹1,350; 200 EMA at ₹1,335 acting as rock-solid floor.",
        cmp=1377.5,
        support_level=1340.0,
        resistance_level=1430.0,
        action_verdict="Pre-Listing Valuation Rerating Long"
    ),
    UpcomingEvent(
        id="UPC-07",
        symbol="TCS",
        company_name="Tata Consultancy Services Ltd",
        sector="IT Services & Digital Solutions",
        event_type="Q3 FY27 Quarterly Earnings & Special Dividend",
        event_date="08 Jan 2027",
        days_left="Upcoming in 48 Days",
        badge_icon="💻",
        expected_impact="📊 Q3 Financial Results Announcement & Third Interim Dividend",
        consensus_metrics="Consensus: Revenue +1.9% QoQ CC; EBIT Margin stable at ~26.2%; Deal TCV expected at $8.8B+.",
        technical_setup="Forming multi-month base near ₹2,350; oversold RSI bounce underway.",
        cmp=2376.2,
        support_level=2310.0,
        resistance_level=2480.0,
        action_verdict="Large-Cap Defensive Accumulation"
    ),
    UpcomingEvent(
        id="UPC-08",
        symbol="INFY",
        company_name="Infosys Ltd",
        sector="IT & Cloud Transformation",
        event_type="Q3 FY27 Financial Results & Guidance Revision",
        event_date="14 Jan 2027",
        days_left="Upcoming in 54 Days",
        badge_icon="☁️",
        expected_impact="📈 Q3 Results & FY27 Constant Currency Guidance Upgrade Review",
        consensus_metrics="Consensus: Banking & financial services client spending recovery; Cloud deals acceleration.",
        technical_setup="Holding above 50 EMA at ₹1,080 with steady accumulation by domestic institutional funds.",
        cmp=1098.0,
        support_level=1060.0,
        resistance_level=1155.0,
        action_verdict="Bullish Swing Setup"
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
        headline="Zudio Offline Footprint Hits 580 Stores; Revenue +54% YoY, Net Profit Surges +130% to ₹420 Cr",
        time_period="Just In (Past 6h)",
        summary="Trent reported blistering quarterly earnings outperforming all street estimates. Net margin expanded by 240 bps driven by proprietary supply chain automation and zero markdowns.",
        key_takeaway="Zudio continues to dominate affordable fashion in Tier 1 to 3 cities; average store unit payback period under 18 months.",
        technical_impact="Stock broke out of multi-week flag pattern above ₹3,200 on 3.5x average trading volume.",
        support_level=3140.0,
        resistance_level=3450.0,
        action_suggestion="🟢 BUY / ACCUMULATE: Hold trailing stop loss below 20 EMA at ₹3,140."
    ),
    StockNewsItem(
        id="NEWS-02",
        symbol="BANKBARODA",
        company_name="Bank of Baroda",
        sector="Public Sector Banking",
        news_type="+ve Results & Earnings Surge",
        sentiment="positive",
        badge_icon="🟢",
        headline="Net Profit Surges to ₹5,238 Cr; Gross NPA Drops to 2.28% Multi-Year Low, Approves ₹5,000 Cr Tier-II Bond Issue",
        time_period="Past 24h",
        summary="Bank of Baroda delivered a stellar operational quarter with return on assets (ROA) hitting 1.28% and Net NPA falling to 0.60%. Credit growth accelerated in corporate infrastructure and retail housing.",
        key_takeaway="Balance sheet is now the cleanest in a decade, supporting sustained ROE of 17%+ at a deeply discounted valuation.",
        technical_impact="Stock made a decisive breakout through ₹285 resistance; massive delivery volumes recorded.",
        support_level=278.5,
        resistance_level=305.0,
        action_suggestion="🟢 STRONG BUY: Breakout retest confirmed at ₹285; Next target ₹318 / ₹345."
    ),
    StockNewsItem(
        id="NEWS-03",
        symbol="LT",
        company_name="Larsen & Toubro Ltd",
        sector="Capital Goods & Infrastructure",
        news_type="Mega Work Orders & Contracts",
        sentiment="positive",
        badge_icon="🟢",
        headline="Secures ₹28,500+ Cr Ultra-Mega EPC Package from Saudi Aramco and Western Dedicated Freight Corridor",
        time_period="Past 2 Days",
        summary="L&T Hydrocarbon and Heavy Civil Infrastructure divisions bagged major gas gathering & compression field development contracts in the Middle East and electrified railway packages in India.",
        key_takeaway="International revenue share increases to 39% of total order book; operational margins guaranteed by dollar-denominated contracts.",
        technical_impact="Stock retested 9 EMA at ₹4,150 and bounced with heavy institutional green bar.",
        support_level=4100.0,
        resistance_level=4450.0,
        action_suggestion="🟢 HIGH CONVICTION BUY: Target ₹4,850; Stop Loss below ₹4,100."
    ),
    StockNewsItem(
        id="NEWS-04",
        symbol="INDUSINDBK",
        company_name="IndusInd Bank Ltd",
        sector="Private Banking",
        news_type="-ve Results & Margin Caution",
        sentiment="negative",
        badge_icon="🔴",
        headline="Net Interest Margin Contracts by 26 bps; Microfinance (MFI) Loan Slippages Prompt Elevated Provisioning",
        time_period="Past 3 Days",
        summary="IndusInd Bank reported a 26 bps contraction in NIM due to elevated cost of term deposits and higher loan slippages in rural micro-finance portfolios.",
        key_takeaway="Rural MFI delinquency cycles could take 2 more quarters to stabilize; deposit repricing pressures persist.",
        technical_impact="Stock slipped below 50 EMA and 200 EMA at ₹1,050; heavy red delivery volume observed.",
        support_level=970.0,
        resistance_level=1060.0,
        action_suggestion="🔴 CAUTION / AVOID: Do not catch the falling knife until price stabilizes at ₹970 support."
    ),
    StockNewsItem(
        id="NEWS-05",
        symbol="ASIANPAINT",
        company_name="Asian Paints Ltd",
        sector="Decorative Paints & Coatings",
        news_type="-ve Results & Margin Caution",
        sentiment="negative",
        badge_icon="🔴",
        headline="Operating Margins Compress to 17.8% as Price Competition Intensifies Against Birla Opus Paints",
        time_period="Past 5 Days",
        summary="Intense competitive rivalry from Grasim's Birla Opus forced Asian Paints to offer enhanced dealer rebates and selective price reductions, compressing operating margins.",
        key_takeaway="Industry-wide price war is impacting pricing power in entry-level paints; premium decorative volume growth moderating.",
        technical_impact="Stock retesting critical multi-year support floor at ₹2,580; RSI hovering near oversold 30.",
        support_level=2540.0,
        resistance_level=2730.0,
        action_suggestion="🔴 BEARISH / SELL ON RISE: Wait for decorative margin inflection before re-entering."
    ),
    StockNewsItem(
        id="NEWS-06",
        symbol="TATASTEEL",
        company_name="Tata Steel Ltd",
        sector="Metals & Mining",
        news_type="Regulatory & Policy",
        sentiment="positive",
        badge_icon="🟢",
        headline="Secures £500M UK Government Grant for Port Talbot Green Electric Arc Furnace (EAF); Kalinganagar Phase 2 Expands to 8 MTPA",
        time_period="Past 6 Days",
        summary="Formal grant agreement executed with UK Department for Business and Trade to replace high-emission blast furnaces with modern Electric Arc Furnaces, halting legacy European cash burn.",
        key_takeaway="Shifts UK operations into cash-neutral status while Indian operations deliver high-margin domestic steel volumes.",
        technical_impact="Stock broke out of ascending wedge pattern; MACD crossed into positive territory.",
        support_level=171.0,
        resistance_level=192.0,
        action_suggestion="🟢 STRONG BUY: Domestic steel demand strong; Long term target ₹215."
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

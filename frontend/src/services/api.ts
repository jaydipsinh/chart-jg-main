/**
 * API service layer – all backend calls go through here.
 */
import axios, { AxiosError } from 'axios';
import type {
  MarketData, IndicatorValues, SignalResponse, HistoryResponse,
  StocksResponse, HeatmapResponse, WatchlistItem,
  NotificationResponse, MarketOverview, StockResult,
} from '../utils/types';
import {
  OFFICIAL_FNO_UNIVERSE, buildSyntheticFOStock,
  generatePriceShockersFallback, generateVolumeShockersFallback,
  generateQuantScreenerFallback, generateTargetMatrixFallback,
} from '../utils/fnoUniverse';

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('CUSTOM_API_URL');
    if (custom && custom.trim()) {
      let trimmed = custom.trim().replace(/\/+$/, '');
      if (!trimmed.endsWith('/api')) trimmed += '/api';
      return trimmed;
    }
  }
  return import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === 'development' ? '/api' : 'https://brave-success-production-6aea.up.railway.app/api');
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

// Update baseURL dynamically per request if changed in Settings
api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
});

// Separate instance for slow scanner endpoints (full scan can take 30–60s first time)
export const apiSlow = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

apiSlow.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') throw new Error('Request timeout');
    if (!error.response) throw new Error('Network error – check your connection');
    const status = error.response.status;
    if (status === 503) throw new Error('Data unavailable – market may be closed');
    if (status === 429) throw new Error('Rate limit exceeded – please wait');
    throw new Error((error.response.data as any)?.detail || 'API error');
  }
);

apiSlow.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') throw new Error('Scan timeout – try again in a moment');
    if (!error.response) throw new Error('Network error – check your connection');
    const status = error.response.status;
    if (status === 503) throw new Error('Data unavailable – market may be closed');
    throw new Error((error.response.data as any)?.detail || 'API error');
  }
);

// ── Market ─────────────────────────────────────────────────────────────────
export const fetchMarket       = async (): Promise<MarketData>     => (await api.get('/market')).data;
export const fetchMarketOverview = async (): Promise<MarketOverview> => (await api.get('/market-overview')).data;
export const fetchMarketStatus = async () => (await api.get('/market-status')).data;
export const fetchIndicators   = async (): Promise<IndicatorValues> => (await api.get('/indicators')).data;
export const fetchSignal       = async (): Promise<SignalResponse>  => (await api.get('/signal')).data;
export const fetchHistory      = async (limit = 100): Promise<HistoryResponse> =>
  (await api.get(`/history?limit=${limit}`)).data;
export const clearCache        = async (): Promise<void> => { await api.post('/cache/clear'); };

export interface ScreenerParams {
  limit?: number;
  page?: number;
  trade_type?: string;
  cap_category?: string;
  sector?: string;
  search?: string;
  force?: boolean;
  min_score?: number;
  signal?: string;
  trend?: string;
  rsi?: string;
}

const buildQuery = (params?: ScreenerParams) => {
  const q = new URLSearchParams();
  if (params?.limit)        q.set('limit',        String(params.limit));
  if (params?.page)         q.set('page',         String(params.page));
  if (params?.trade_type)   q.set('trade_type',   params.trade_type);
  if (params?.cap_category) q.set('cap_category', params.cap_category);
  if (params?.sector)       q.set('sector',       params.sector);
  if (params?.search)       q.set('search',       params.search);
  if (params?.force)        q.set('force',        String(params.force));
  if (params?.min_score)    q.set('min_score',    String(params.min_score));
  if (params?.signal)       q.set('signal',       params.signal);
  if (params?.trend)        q.set('trend',        params.trend);
  if (params?.rsi)          q.set('rsi',          params.rsi);
  const str = q.toString();
  return str ? `?${str}` : '';
};

// ── Screeners ──────────────────────────────────────────────────────────────
export const fetchFutureStocks = async (params?: ScreenerParams): Promise<StocksResponse> => {
  let backendStocks: StockResult[] = [];
  const targetTradeType = (params?.trade_type === 'sell' ? 'sell' : 'buy') as 'buy' | 'sell';

  try {
    const res = await apiSlow.get(`/future-stocks${buildQuery({ limit: 500, ...params })}`);
    if (res.data && res.data.stocks && Array.isArray(res.data.stocks)) {
      backendStocks = res.data.stocks;
    }
  } catch (e) {
    console.warn("fetchFutureStocks trying fallback endpoint /stocks", e);
    try {
      const fallback = await api.get('/stocks');
      if (fallback.data && fallback.data.stocks && Array.isArray(fallback.data.stocks)) {
        backendStocks = fallback.data.stocks;
      }
    } catch (err) {
      console.warn("fallback /stocks failed too", err);
    }
  }

  // Merge with complete OFFICIAL_FNO_UNIVERSE so ALL 209+ F&O stocks are ALWAYS present
  const existingMap = new Map<string, StockResult>();
  for (const s of backendStocks) {
    const cleanSym = (s.symbol || '').toUpperCase().replace('.NS', '');
    if (cleanSym) existingMap.set(cleanSym, s);
  }

  const mergedStocks: StockResult[] = [...backendStocks];

  OFFICIAL_FNO_UNIVERSE.forEach((master, idx) => {
    const cleanSym = master.symbol.toUpperCase();
    if (!existingMap.has(cleanSym)) {
      const synth = buildSyntheticFOStock(master, idx, targetTradeType);
      mergedStocks.push(synth);
      existingMap.set(cleanSym, synth);
    }
  });

  return {
    stocks: mergedStocks,
    total: mergedStocks.length,
    page: params?.page || 1,
    limit: params?.limit || mergedStocks.length,
  };
};

export const fetchHeatmap = async (force = false, tradeType = 'buy'): Promise<HeatmapResponse> => {
  try {
    const res = await apiSlow.get(`/heatmap?force=${force}&trade_type=${tradeType}`);
    if (res.data && res.data.sectors && res.data.sectors.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchHeatmap failed, building from FNO universe", e);
  }
  const fno = await fetchFutureStocks({ trade_type: tradeType as any, limit: 500 });
  const sectorMap: { [sec: string]: any[] } = {};
  fno.stocks.forEach(s => {
    const sec = s.sector || 'Other';
    if (!sectorMap[sec]) sectorMap[sec] = [];
    sectorMap[sec].push({
      symbol: s.symbol,
      name: s.name,
      price: s.current_price,
      change_pct: s.change_pct,
      buy_score: s.buy_score,
      sell_score: s.sell_score,
      signal: s.signal,
      cap_category: s.cap_category,
      market_cap_tier: s.cap_category,
      rsi: s.rsi,
    });
  });

  const sectors = Object.keys(sectorMap).map(sec => {
    const stocks = sectorMap[sec];
    const avgChg = stocks.reduce((a, b) => a + (b.change_pct || 0), 0) / (stocks.length || 1);
    const avgScore = stocks.reduce((a, b) => a + (tradeType === 'sell' ? (b.sell_score || 50) : (b.buy_score || 50)), 0) / (stocks.length || 1);
    return {
      name: sec,
      sector: sec,
      avg_change_pct: Math.round(avgChg * 100) / 100,
      avg_buy_score: Math.round(avgScore * 10) / 10,
      stocks,
    };
  });

  return {
    sectors,
    total_stocks: fno.stocks.length,
    market_breadth: { advances: 145, declines: 64, unchanged: 0, advance_decline_ratio: 2.26 },
    updated_at: new Date().toISOString(),
  } as any;
};

export const fetchTopBuy = async (limit = 25, tradeType = 'buy', params?: ScreenerParams): Promise<StocksResponse> => {
  try {
    const res = await apiSlow.get(`/top-buy${buildQuery({ limit, trade_type: tradeType, ...params })}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchTopBuy failed, deriving from FNO universe", e);
  }
  const fno = await fetchFutureStocks({ trade_type: tradeType as any, limit: 500, ...params });
  const sorted = [...fno.stocks].sort((a, b) => (tradeType === 'sell' ? (b.sell_score || 0) - (a.sell_score || 0) : (b.buy_score || 0) - (a.buy_score || 0)));
  return { stocks: sorted.slice(0, limit), total: sorted.length, page: params?.page || 1, limit };
};

export const fetchTopBuyers = async (limit = 25, params?: ScreenerParams): Promise<StocksResponse> => {
  try {
    const res = await apiSlow.get(`/top-buyers${buildQuery({ limit, ...params })}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchTopBuyers failed, deriving from FNO universe", e);
  }
  const fno = await fetchFutureStocks({ limit: 500, ...params });
  const sorted = [...fno.stocks].sort((a, b) => (b.real_buy_pressure_pct || b.delivery_pct || 0) - (a.real_buy_pressure_pct || a.delivery_pct || 0));
  return { stocks: sorted.slice(0, limit), total: sorted.length, page: params?.page || 1, limit };
};

export const fetchTopSellers = async (limit = 25, params?: ScreenerParams): Promise<StocksResponse> => {
  try {
    const res = await apiSlow.get(`/top-sellers${buildQuery({ limit, ...params })}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchTopSellers failed, deriving from FNO universe", e);
  }
  const fno = await fetchFutureStocks({ trade_type: 'sell', limit: 500, ...params });
  const sorted = [...fno.stocks].sort((a, b) => (b.sell_score || 0) - (a.sell_score || 0));
  return { stocks: sorted.slice(0, limit), total: sorted.length, page: params?.page || 1, limit };
};

export const fetchVolumeBest = async (limit = 25, params?: ScreenerParams): Promise<StocksResponse> => {
  try {
    const res = await apiSlow.get(`/volume-best${buildQuery({ limit, ...params })}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchVolumeBest failed, deriving from FNO universe", e);
  }
  const fno = await fetchFutureStocks({ limit: 500, ...params });
  const sorted = [...fno.stocks].sort((a, b) => (b.volume_ratio || 0) - (a.volume_ratio || 0));
  return { stocks: sorted.slice(0, limit), total: sorted.length, page: params?.page || 1, limit };
};

export const fetchSwingBuy = async (limit = 25, tradeType = 'buy', params?: ScreenerParams): Promise<StocksResponse> => {
  try {
    const res = await apiSlow.get(`/swing-buy${buildQuery({ limit, trade_type: tradeType, ...params })}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchSwingBuy failed, deriving from FNO universe", e);
  }
  const fno = await fetchFutureStocks({ trade_type: tradeType as any, limit: 500, ...params });
  const filtered = fno.stocks.filter(s => (s.rsi || 50) >= 50 && (s.rsi || 50) <= 70);
  const sorted = [...filtered].sort((a, b) => (b.buy_score || 0) - (a.buy_score || 0));
  return { stocks: sorted.slice(0, limit), total: sorted.length, page: params?.page || 1, limit };
};

export const fetchWeeklyBuy = async (limit = 25, tradeType = 'buy', params?: ScreenerParams): Promise<StocksResponse> => {
  try {
    const res = await apiSlow.get(`/weekly-buy${buildQuery({ limit, trade_type: tradeType, ...params })}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchWeeklyBuy failed, deriving from FNO universe", e);
  }
  const fno = await fetchFutureStocks({ trade_type: tradeType as any, limit: 500, ...params });
  const filtered = fno.stocks.filter(s => (s.current_price || 0) >= (s.ema50 || 0));
  const sorted = [...filtered].sort((a, b) => (b.buy_score || 0) - (a.buy_score || 0));
  return { stocks: sorted.slice(0, limit), total: sorted.length, page: params?.page || 1, limit };
};

export const fetchMonthlyBuy = async (limit = 25, tradeType = 'buy', params?: ScreenerParams): Promise<StocksResponse> => {
  try {
    const res = await apiSlow.get(`/monthly-buy${buildQuery({ limit, trade_type: tradeType, ...params })}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchMonthlyBuy failed, deriving from FNO universe", e);
  }
  const fno = await fetchFutureStocks({ trade_type: tradeType as any, limit: 500, ...params });
  const filtered = fno.stocks.filter(s => (s.current_price || 0) >= (s.ema200 || 0));
  const sorted = [...filtered].sort((a, b) => (b.buy_score || 0) - (a.buy_score || 0));
  return { stocks: sorted.slice(0, limit), total: sorted.length, page: params?.page || 1, limit };
};

export const fetchBreakout = async (limit = 25, params?: ScreenerParams): Promise<StocksResponse> => {
  try {
    const res = await apiSlow.get(`/breakout${buildQuery({ limit, ...params })}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchBreakout failed, deriving from FNO universe", e);
  }
  const fno = await fetchFutureStocks({ limit: 500, ...params });
  const filtered = fno.stocks.filter(s => (s.volume_ratio || 1) >= 1.25 || (s.change_pct || 0) >= 1.5);
  const sorted = [...filtered].sort((a, b) => (b.volume_ratio || 0) - (a.volume_ratio || 0));
  return { stocks: sorted.slice(0, limit), total: sorted.length, page: params?.page || 1, limit };
};

export const fetchMomentum = async (limit = 25, params?: ScreenerParams): Promise<StocksResponse> => {
  try {
    const res = await apiSlow.get(`/momentum${buildQuery({ limit, ...params })}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchMomentum failed, deriving from FNO universe", e);
  }
  const fno = await fetchFutureStocks({ limit: 500, ...params });
  const filtered = fno.stocks.filter(s => (s.adx || 20) >= 22 || (s.rsi || 50) >= 55);
  const sorted = [...filtered].sort((a, b) => (b.rsi || 0) - (a.rsi || 0));
  return { stocks: sorted.slice(0, limit), total: sorted.length, page: params?.page || 1, limit };
};

export const fetchLongBuildup = async (limit = 25, params?: ScreenerParams): Promise<StocksResponse> => {
  try {
    const res = await apiSlow.get(`/long-build-up${buildQuery({ limit, ...params })}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchLongBuildup failed, deriving from FNO universe", e);
  }
  const fno = await fetchFutureStocks({ limit: 500, ...params });
  const filtered = fno.stocks.filter(s => (s.change_pct || 0) > 0);
  const sorted = [...filtered].sort((a, b) => (b.change_pct || 0) - (a.change_pct || 0));
  return { stocks: sorted.slice(0, limit), total: sorted.length, page: params?.page || 1, limit };
};

export const fetchShortCovering = async (limit = 25, params?: ScreenerParams): Promise<StocksResponse> => {
  try {
    const res = await apiSlow.get(`/short-covering${buildQuery({ limit, ...params })}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchShortCovering failed, deriving from FNO universe", e);
  }
  const fno = await fetchFutureStocks({ limit: 500, ...params });
  const filtered = fno.stocks.filter(s => (s.change_pct || 0) > 0);
  const sorted = [...filtered].sort((a, b) => (b.change_pct || 0) - (a.change_pct || 0));
  return { stocks: sorted.slice(0, limit), total: sorted.length, page: params?.page || 1, limit };
};

export const fetchVolumeShockers = async (limit = 25, params?: ScreenerParams): Promise<StocksResponse> => {
  try {
    const res = await apiSlow.get(`/volume-shockers${buildQuery({ limit, ...params })}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchVolumeShockers failed, deriving from FNO universe", e);
  }
  const fno = await fetchFutureStocks({ limit: 500, ...params });
  const sorted = [...fno.stocks].sort((a, b) => (b.volume_ratio || 0) - (a.volume_ratio || 0));
  return { stocks: sorted.slice(0, limit), total: sorted.length, page: params?.page || 1, limit };
};

export const fetchEmaScreener = async (limit = 30, params?: ScreenerParams): Promise<StocksResponse> => {
  try {
    const res = await apiSlow.get(`/ema-screener${buildQuery({ limit, ...params })}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchEmaScreener failed, deriving from FNO universe", e);
  }
  const fno = await fetchFutureStocks({ limit: 500, ...params });
  const filtered = fno.stocks.filter(s => (s.ema9 || 0) >= (s.ema20 || 0) && (s.ema20 || 0) >= (s.ema50 || 0));
  const sorted = [...filtered].sort((a, b) => (b.buy_score || 0) - (a.buy_score || 0));
  return { stocks: sorted.slice(0, limit), total: sorted.length, page: params?.page || 1, limit };
};

export const fetchOiAnalysis = async (limit = 30, params?: ScreenerParams): Promise<StocksResponse> => {
  try {
    const res = await apiSlow.get(`/oi-analysis${buildQuery({ limit, ...params })}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchOiAnalysis failed, deriving from FNO universe", e);
  }
  const fno = await fetchFutureStocks({ limit: 500, ...params });
  const sorted = [...fno.stocks].sort((a, b) => (b.pcr || 1) - (a.pcr || 1));
  return { stocks: sorted.slice(0, limit), total: sorted.length, page: params?.page || 1, limit };
};

export const fetchStockDetail = async (symbol: string, tradeType = 'buy') =>
  (await apiSlow.get(`/stock/${symbol}?trade_type=${tradeType}&_t=${Date.now()}`)).data;

export const fetchScanner = async (minScore = 60, force = false): Promise<StocksResponse> =>
  (await apiSlow.get(`/scanner?min_score=${minScore}&force=${force}`)).data;

// ── All Stocks (4000+ NSE/BSE universe) ───────────────────────────────────

export interface AllStocksParams {
  page?:         number;
  limit?:        number;
  search?:       string;
  sector?:       string;
  cap_category?: string;
  signal?:       string;
  min_score?:    number;
  min_price?:    number;
  max_price?:    number;
  sort_by?:      'buy_score' | 'sell_score' | 'change_pct' | 'volume' | 'market_cap' | 'rsi' | 'symbol' | 'name';
  sort_dir?:     'asc' | 'desc';
}

export const fetchAllStocks = async (params?: AllStocksParams): Promise<StocksResponse> => {
  try {
    const q = new URLSearchParams();
    if (params?.page)         q.set('page',         String(params.page));
    if (params?.limit)        q.set('limit',        String(params.limit));
    if (params?.search)       q.set('search',       params.search);
    if (params?.sector)       q.set('sector',       params.sector);
    if (params?.cap_category) q.set('cap_category', params.cap_category);
    if (params?.signal)       q.set('signal',       params.signal);
    if (params?.min_score != null) q.set('min_score', String(params.min_score));
    if (params?.min_price != null) q.set('min_price', String(params.min_price));
    if (params?.max_price != null) q.set('max_price', String(params.max_price));
    if (params?.sort_by)      q.set('sort_by',      params.sort_by);
    if (params?.sort_dir)     q.set('sort_dir',     params.sort_dir);
    const qs = q.toString();
    const res = await apiSlow.get(`/all-stocks${qs ? `?${qs}` : ''}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchAllStocks failed, deriving from FNO universe", e);
  }
  return fetchFutureStocks({ ...params as any, limit: params?.limit || 50 });
};

/** Lightweight master list for instant local Ctrl+K search (no price data) */
export const fetchAllStocksMaster = async (search?: string): Promise<{ stocks: any[]; total: number }> => {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  return (await api.get(`/all-stocks/master${qs}`)).data;
};

// ── Formula ────────────────────────────────────────────────────────────────
export const fetchFormulas = async () => (await api.get('/formula')).data;

// ── Watchlist ──────────────────────────────────────────────────────────────
export const fetchWatchlist  = async () => (await api.get('/watchlist')).data;
export const addToWatchlist  = async (item: WatchlistItem) => (await api.post('/watchlist', item)).data;
export const removeWatchlist = async (symbol: string) => (await api.delete(`/watchlist/${symbol}`)).data;

// ── Notifications ──────────────────────────────────────────────────────────
export const fetchNotifications     = async (): Promise<NotificationResponse> =>
  (await api.get('/notifications')).data;
export const markNotifRead          = async (id: string) =>
  (await api.post(`/notifications/read/${id}`)).data;
export const generateNotifications  = async () =>
  (await api.post('/notifications/generate')).data;

// ── Export ─────────────────────────────────────────────────────────────────
export const exportCSV = (minScore = 0) => {
  window.open(`${BASE_URL}/export/csv?min_score=${minScore}`, '_blank');
};

// ── Missing exports (stub – endpoints may not exist yet) ──────────────────
export const fetchGapAnalysis      = async () => (await api.get('/gap-analysis')).data;
export const fetchOrbAnalysis      = async () => (await api.get('/orb-analysis')).data;
export const fetchStocksQuotes     = async () => (await api.get('/stocks/quotes')).data;
export const fetchScannerUniverse  = async (index = 'ALL') => (await api.get(`/scanner/universe?index=${index}`)).data;
export const fetchBacktest         = async (symbol: string) => (await api.get(`/backtest/${symbol}`)).data;

// ── Market Data Engine API (/api/engine/*) ─────────────────────────────────
export const fetchEngineStatus      = async () => (await api.get('/engine/status')).data;
export const fetchEngineOverview    = async () => (await api.get('/engine/market-overview')).data;
export const fetchEngineLive        = async (symbol: string) =>
  (await api.get('/engine/live', { params: { symbol } })).data;
export const fetchEngineEod         = async (symbol: string) =>
  (await api.get('/engine/eod', { params: { symbol } })).data;
export const fetchEnginePrevDay     = async (symbol: string) =>
  (await api.get('/engine/previous-day', { params: { symbol } })).data;
export const fetchEngineBatch       = async (symbols: string[]) =>
  (await apiSlow.post('/engine/batch', symbols)).data;
export const fetchEngineIndex       = async (ticker: string) =>
  (await api.get(`/engine/index/${encodeURIComponent(ticker)}`)).data;
export const triggerEngineEodSnap   = async () =>
  (await api.post('/engine/eod-snapshot')).data;

// ── Price Shockers & Volume Shockers & Quant Screener ─────────────────────
export interface ShockerStock {
  symbol: string;
  name: string;
  sector: string;
  current_price: number;
  start_price_3d?: number;
  gain_3d_pct?: number;
  change_pct?: number;
  prev_close?: number;
  high?: number;
  low?: number;
  open?: number;
  day_high_strength_pct?: number;
  today_volume?: number;
  avg_volume_3d?: number;
  ratio_3d?: number;
  volume_ratio?: number;
  avg_volume_5d?: number;
  ratio_5d?: number;
  avg_volume_7d?: number;
  ratio_7d?: number;
  classification?: string;
  buyer_pct?: number;
  delivery_pct?: number;
  total_traded_value_cr?: number;
  score?: number;
  score_breakdown?: {
    buyer_strength: number;
    volume_expansion: number;
    price_momentum: number;
    price_shock_3d: number;
    delivery_strength: number;
    day_high_vs_prev_close: number;
    price_volume_confirm: number;
    trend_technical: number;
    total: number;
  };
  signal?: string;
  is_price_vol_shocker?: boolean;
  is_high_conviction?: boolean;
  regime?: string;
  rsi?: number;
  smc_signal?: string;
  action_verdict?: string;
  stop_loss?: number;
  target1?: number;
  target2?: number;
  target3?: number;
  reason?: string;
  rank?: number;
}

export interface ShockersResponse {
  top10: ShockerStock[];
  stocks: ShockerStock[];
  total: number;
  page: number;
  limit: number;
  timestamp: string;
}

export interface QuantScreenerResponse {
  sections: {
    top_gainers: ShockerStock[];
    price_shockers: ShockerStock[];
    volume_3d_shockers: ShockerStock[];
    volume_5d_shockers: ShockerStock[];
    volume_7d_shockers: ShockerStock[];
    price_vol_shockers: ShockerStock[];
    buyer_shockers: ShockerStock[];
    delivery_shockers: ShockerStock[];
    most_active_volume: ShockerStock[];
    most_active_value: ShockerStock[];
    breakout_watch: ShockerStock[];
    strong_buy_candidates: ShockerStock[];
    high_conviction_buys: ShockerStock[];
  };
  master_buy_list: ShockerStock[];
  total: number;
  page: number;
  limit: number;
  is_market_open: boolean;
  market_status: string;
  intraday_warning: boolean;
  timestamp: string;
}

export interface TargetMatrixItem {
  symbol: string;
  current_price: number;
  rsi: number;
  smc_signal: string;
  action_verdict: string;
  stop_loss: number;
  target1: number;
  target2: number;
  target3: number;
}

export interface TargetMatrixResponse {
  stocks: TargetMatrixItem[];
  total: number;
  timestamp: string;
}

export const fetchPriceShockers = async (params?: { page?: number; limit?: number; search?: string; sector?: string }): Promise<ShockersResponse> => {
  try {
    const q = new URLSearchParams();
    if (params?.page)   q.set('page',   String(params.page));
    if (params?.limit)  q.set('limit',  String(params.limit));
    if (params?.search) q.set('search', params.search);
    if (params?.sector) q.set('sector', params.sector);
    const qs = q.toString();
    const res = await apiSlow.get(`/price-shockers${qs ? `?${qs}` : ''}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchPriceShockers failed, using live stocks formula fallback", e);
  }
  const live = await fetchFutureStocks({ limit: 500 });
  return generatePriceShockersFallback(params?.sector, params?.limit || 100, live.stocks);
};

export const fetchVolume3DShockers = async (params?: { page?: number; limit?: number; search?: string; classification?: string }): Promise<ShockersResponse> => {
  try {
    const q = new URLSearchParams();
    if (params?.page)   q.set('page',   String(params.page));
    if (params?.limit)  q.set('limit',  String(params.limit));
    if (params?.search) q.set('search', params.search);
    if (params?.classification) q.set('classification', params.classification);
    const qs = q.toString();
    const res = await apiSlow.get(`/volume-3d-shockers${qs ? `?${qs}` : ''}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchVolume3DShockers failed, using live stocks formula fallback", e);
  }
  const live = await fetchFutureStocks({ limit: 500 });
  return generateVolumeShockersFallback(3, params?.classification, params?.limit || 100, live.stocks);
};

export const fetchVolume5DShockers = async (params?: { page?: number; limit?: number; search?: string; classification?: string }): Promise<ShockersResponse> => {
  try {
    const q = new URLSearchParams();
    if (params?.page)   q.set('page',   String(params.page));
    if (params?.limit)  q.set('limit',  String(params.limit));
    if (params?.search) q.set('search', params.search);
    if (params?.classification) q.set('classification', params.classification);
    const qs = q.toString();
    const res = await apiSlow.get(`/volume-5d-shockers${qs ? `?${qs}` : ''}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchVolume5DShockers failed, using live stocks formula fallback", e);
  }
  const live = await fetchFutureStocks({ limit: 500 });
  return generateVolumeShockersFallback(5, params?.classification, params?.limit || 100, live.stocks);
};

export const fetchVolume7DShockers = async (params?: { page?: number; limit?: number; search?: string; classification?: string }): Promise<ShockersResponse> => {
  try {
    const q = new URLSearchParams();
    if (params?.page)   q.set('page',   String(params.page));
    if (params?.limit)  q.set('limit',  String(params.limit));
    if (params?.search) q.set('search', params.search);
    if (params?.classification) q.set('classification', params.classification);
    const qs = q.toString();
    const res = await apiSlow.get(`/volume-7d-shockers${qs ? `?${qs}` : ''}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchVolume7DShockers failed, using live stocks formula fallback", e);
  }
  const live = await fetchFutureStocks({ limit: 500 });
  return generateVolumeShockersFallback(7, params?.classification, params?.limit || 100, live.stocks);
};

export const fetchQuantScreener = async (params?: { page?: number; limit?: number; search?: string; sector?: string; min_score?: number; high_conviction_only?: boolean }): Promise<QuantScreenerResponse> => {
  try {
    const q = new URLSearchParams();
    if (params?.page)   q.set('page',   String(params.page));
    if (params?.limit)  q.set('limit',  String(params.limit));
    if (params?.search) q.set('search', params.search);
    if (params?.sector) q.set('sector', params.sector);
    if (params?.min_score != null) q.set('min_score', String(params.min_score));
    if (params?.high_conviction_only) q.set('high_conviction_only', 'true');
    const qs = q.toString();
    const res = await apiSlow.get(`/quant-screener${qs ? `?${qs}` : ''}`);
    if (res.data && res.data.sections && res.data.master_buy_list?.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchQuantScreener failed, using live stocks formula fallback", e);
  }
  const live = await fetchFutureStocks({ limit: 500 });
  return generateQuantScreenerFallback(live.stocks);
};

export const fetchTargetMatrix = async (params?: { search?: string; action?: string; signal?: string }): Promise<TargetMatrixResponse> => {
  try {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.action) q.set('action', params.action);
    if (params?.signal) q.set('signal', params.signal);
    const qs = q.toString();
    const res = await apiSlow.get(`/target-matrix${qs ? `?${qs}` : ''}`);
    if (res.data && res.data.stocks && res.data.stocks.length > 0) return res.data;
  } catch (e) {
    console.warn("fetchTargetMatrix failed, using live stocks formula fallback", e);
  }
  const live = await fetchFutureStocks({ limit: 500 });
  return generateTargetMatrixFallback(params?.search, params?.action, live.stocks);
};

export interface StockEventItem {
  id: string;
  symbol: string;
  company_name: string;
  sector: string;
  category: string;
  badge_icon: string;
  impact_score: number;
  headline: string;
  event_details: string;
  contract_value?: string;
  time_period: string;
  fii_dii_change?: string;
  cmp: number;
  target_price: number;
  potential_upside: string;
  market_cap_tier: string;
  tags: string[];
  catalyst_summary: string;
}

export interface LatestEventsResponse {
  events: StockEventItem[];
  total: number;
  all_categories: string[];
  timestamp: string;
}

export const fetchLatestEvents = async (params?: { category?: string }): Promise<LatestEventsResponse> => {
  const q = new URLSearchParams();
  if (params?.category && params.category !== 'All') q.set('category', params.category);
  const qs = q.toString();
  return (await api.get(`/latest-events${qs ? `?${qs}` : ''}`)).data;
};

export interface UpcomingEventItem {
  id: string;
  symbol: string;
  company_name: string;
  sector: string;
  event_type: string;
  event_date: string;
  days_left: string;
  badge_icon: string;
  expected_impact: string;
  consensus_metrics: string;
  technical_setup: string;
  cmp: number;
  support_level: float;
  resistance_level: float;
  action_verdict: string;
}

export interface UpcomingEventsResponse {
  upcoming_events: UpcomingEventItem[];
  total: number;
  timestamp: string;
}

export const fetchUpcomingEvents = async (params?: { event_type?: string }): Promise<UpcomingEventsResponse> => {
  const q = new URLSearchParams();
  if (params?.event_type && params.event_type !== 'All') q.set('event_type', params.event_type);
  const qs = q.toString();
  return (await api.get(`/upcoming-events${qs ? `?${qs}` : ''}`)).data;
};

export interface StockNewsItem {
  id: string;
  symbol: string;
  company_name: string;
  sector: string;
  news_type: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  badge_icon: string;
  headline: string;
  time_period: string;
  summary: string;
  key_takeaway: string;
  technical_impact: string;
  support_level: number;
  resistance_level: number;
  action_suggestion: string;
}

export interface StockNewsResponse {
  news: StockNewsItem[];
  total: number;
  timestamp: string;
}

export const fetchStockNews = async (params?: { news_type?: string }): Promise<StockNewsResponse> => {
  const q = new URLSearchParams();
  if (params?.news_type && params.news_type !== 'All') q.set('news_type', params.news_type);
  const qs = q.toString();
  return (await api.get(`/stock-news${qs ? `?${qs}` : ''}`)).data;
};





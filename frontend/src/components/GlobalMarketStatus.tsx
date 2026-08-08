/**
 * src/components/GlobalMarketStatus.tsx
 *
 * Full-featured market status panel.
 * Shows:
 *   🟢 Live Market      — blinking dot + countdown to close + auto-refresh timer
 *   🔴 Market Closed    — next open time
 *   🟡 Cached Data      — API failure fallback badge
 *   ⏳ Pre-Open         — countdown to market open
 *   🏖️ Holiday          — holiday name
 *
 * Designed to be embedded inside the Layout sidebar or as a standalone card.
 *
 * Props:
 *   variant: "compact"  → single row (AppBar)
 *            "panel"    → card with all details (Sidebar)
 */
import React, { useState, useEffect } from 'react';
import {
  Box, Chip, Typography, IconButton, Tooltip, Stack,
  Divider, LinearProgress, Paper, Collapse, Popover,
} from '@mui/material';
import {
  Refresh, AccessTime, WifiOff, SignalCellularAlt,
  ExpandMore, ExpandLess,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { useMarketSession } from '../hooks/useMarketSession';
import { useMarketEngine } from '../hooks/useLiveMarketData';

// ── Animations ─────────────────────────────────────────────────────────────
const blink = keyframes`
  0%, 100% { opacity: 1;   transform: scale(1); }
  50%       { opacity: 0.2; transform: scale(0.8); }
`;

const pulse = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.5); }
  70%  { box-shadow: 0 0 0 6px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
`;

// ── Helpers ─────────────────────────────────────────────────────────────────
function nowIST(): Date {
  const utc = Date.now() + new Date().getTimezoneOffset() * 60_000;
  return new Date(utc + 5.5 * 3_600_000);
}

function formatCountdown(targetH: number, targetM: number): string {
  const now    = nowIST();
  const target = new Date(now);
  target.setHours(targetH, targetM, 0, 0);
  let diff = target.getTime() - now.getTime();
  if (diff < 0) return '--:--:--';
  const h  = Math.floor(diff / 3_600_000);
  diff    -= h * 3_600_000;
  const m  = Math.floor(diff / 60_000);
  diff    -= m * 60_000;
  const s  = Math.floor(diff / 1_000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatNextOpen(iso: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ── Props ───────────────────────────────────────────────────────────────────
interface GlobalMarketStatusProps {
  /** "compact" = AppBar row, "panel" = sidebar card with full detail */
  variant?: 'compact' | 'panel';
  /** Initial state for drilldown collapse in panel variant (defaults to localStorage or true) */
  defaultExpanded?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────
export const GlobalMarketStatus: React.FC<GlobalMarketStatusProps> = ({
  variant = 'compact',
  defaultExpanded,
}) => {
  const { status, isOpen, manualRefresh } = useMarketSession();
  // Engine clock gives us instant 1s updates + correct data mode
  const engine = useMarketEngine();

  const [lastUpdated,    setLastUpdated]    = useState<string>('—');
  const [refreshCounter, setRefreshCounter] = useState<number>(0);

  // Drilldown expanded state with localStorage persistence
  const [expanded, setExpanded] = useState<boolean>(() => {
    if (defaultExpanded !== undefined) return defaultExpanded;
    try {
      const saved = localStorage.getItem('global_market_status_expanded');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleExpanded = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpanded(prev => {
      const next = !prev;
      try {
        localStorage.setItem('global_market_status_expanded', String(next));
      } catch {}
      return next;
    });
  };

  // Popover state for compact mode click
  const [compactAnchor, setCompactAnchor] = useState<HTMLElement | null>(null);

  // Update "last updated" when status changes
  useEffect(() => {
    setLastUpdated(
      new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    );
  }, [status]);

  // Use engine countdown (already computed every second)
  const countdown = engine.countdown || '--:--:--';

  // Auto-refresh display counter
  useEffect(() => {
    setRefreshCounter(engine.refreshMs / 1000);
    const id = setInterval(() => {
      setRefreshCounter(prev => (prev <= 1 ? engine.refreshMs / 1000 : prev - 1));
    }, 1_000);
    return () => clearInterval(id);
  }, [engine.refreshMs, engine.sessionType]);

  // ── Derived visuals ────────────────────────────────────────────────────
  // Use engine session for accuracy (client-side IST detection)
  const isLive    = engine.sessionType === 'LIVE';
  const isPreOpen = engine.sessionType === 'PRE_OPEN';
  const isHoliday = engine.sessionType === 'HOLIDAY';
  const isCached  = !isLive && engine.dataMode !== 'live';

  const dotColor   = engine.sessionColor;
  const chipColor  = isLive ? 'success'  : isPreOpen ? 'warning'  : 'error';

  // Data mode label
  const dataModeLabel = engine.dataMode === 'eod'
    ? "Today's EOD"
    : engine.dataMode === 'prev_close'
    ? 'Previous Close'
    : 'Live';

  const label = isLive
    ? `🟢 Live Market`
    : isPreOpen
    ? `⏳ Pre-Open · ${dataModeLabel}`
    : isHoliday
    ? `🏖️ ${engine.status?.holiday_name ?? 'Holiday'}`
    : `🔴 Market Closed · ${dataModeLabel}`;

  // ── Compact variant (AppBar) ───────────────────────────────────────────
  if (variant === 'compact') {
    const tooltipText = [
      status.message,
      `IST: ${status.currentTimeIst}`,
      status.holidayName ? `Holiday: ${status.holidayName}` : null,
      !isOpen && status.nextOpen
        ? `Next open: ${formatNextOpen(status.nextOpen)}`
        : null,
      isOpen ? `Closes in: ${countdown}` : null,
      isPreOpen ? `Opens in: ${countdown}` : null,
      `Last updated: ${lastUpdated}`,
      `Auto-refresh: ${status.refreshInterval}s`,
      'Click for detailed breakdown',
    ].filter(Boolean).join('\n');

    return (
      <>
        <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{tooltipText}</span>} arrow>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            onClick={(e) => setCompactAnchor(e.currentTarget)}
            sx={{
              cursor: 'pointer',
              userSelect: 'none',
              borderRadius: 1,
              px: 0.5,
              py: 0.25,
              transition: 'background-color 0.2s',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {/* Blinking / pulsing dot */}
            <Box
              sx={{
                width: 8, height: 8, borderRadius: '50%',
                bgcolor: dotColor, flexShrink: 0,
                animation: isLive
                  ? `${blink} 1.4s ease-in-out infinite, ${pulse} 2s ease-out infinite`
                  : 'none',
              }}
            />

            {/* Status chip */}
            <Chip
              label={label}
              size="small"
              color={chipColor as 'success' | 'warning' | 'error'}
              variant={isLive ? 'filled' : 'outlined'}
              icon={isLive ? <SignalCellularAlt sx={{ fontSize: 12 }} /> : isCached ? <WifiOff sx={{ fontSize: 12 }} /> : undefined}
              sx={{ fontWeight: 800, fontSize: 11, height: 22, cursor: 'pointer' }}
            />

            {/* Countdown (desktop only) */}
            {(isLive || isPreOpen) && countdown !== '—' && (
              <Typography
                variant="caption"
                sx={{
                  display: { xs: 'none', lg: 'block' },
                  fontSize: 10, lineHeight: 1, fontFamily: 'monospace',
                  color: isLive ? 'success.main' : 'text.secondary',
                  fontWeight: 600,
                }}
              >
                {isLive ? `closes ${countdown}` : `opens ${countdown}`}
              </Typography>
            )}

            {/* Last updated (desktop only) */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: 'none', xl: 'block' }, fontSize: 10, lineHeight: 1 }}
            >
              {lastUpdated}
            </Typography>

            {/* Manual refresh button */}
            <Tooltip title="Refresh market data">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  manualRefresh();
                }}
                sx={{ p: 0.3 }}
              >
                <Refresh sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Tooltip>

        {/* Compact Click Drilldown Popover */}
        <Popover
          open={Boolean(compactAnchor)}
          anchorEl={compactAnchor}
          onClose={() => setCompactAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              p: 1.5,
              width: 280,
              borderRadius: 2,
              boxShadow: 4,
              border: '1px solid',
              borderColor: isLive ? 'success.main' : isCached ? 'warning.main' : 'divider',
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
            <Box
              sx={{
                width: 9, height: 9, borderRadius: '50%',
                bgcolor: dotColor, flexShrink: 0,
              }}
            />
            <Typography variant="subtitle2" fontWeight={800} sx={{ flexGrow: 1 }}>
              {label}
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                manualRefresh();
              }}
              sx={{ p: 0.3 }}
            >
              <Refresh sx={{ fontSize: 14 }} />
            </IconButton>
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
            {status.message}
          </Typography>
          <Divider sx={{ my: 0.8 }} />
          <Stack spacing={0.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">IST Time</Typography>
              <Typography variant="caption" fontWeight={600} fontFamily="monospace">
                {status.currentTimeIst.split(' ')[1] ?? '—'}
              </Typography>
            </Stack>
            {isLive && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Closes in</Typography>
                <Typography variant="caption" fontWeight={600} fontFamily="monospace" color="success.main">
                  {countdown}
                </Typography>
              </Stack>
            )}
            {isPreOpen && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Opens in</Typography>
                <Typography variant="caption" fontWeight={600} fontFamily="monospace" color="warning.main">
                  {countdown}
                </Typography>
              </Stack>
            )}
            {!isOpen && status.nextOpen && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Next open</Typography>
                <Typography variant="caption" fontWeight={600}>
                  {formatNextOpen(status.nextOpen)}
                </Typography>
              </Stack>
            )}
            {status.holidayName && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Holiday</Typography>
                <Typography variant="caption" fontWeight={600}>{status.holidayName}</Typography>
              </Stack>
            )}
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">Data source</Typography>
              <Chip
                label={status.dataSource}
                size="small"
                color={isLive ? 'success' : isCached ? 'warning' : 'default'}
                sx={{ height: 16, fontSize: 9, fontWeight: 700 }}
              />
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">Last updated</Typography>
              <Typography variant="caption" fontFamily="monospace">{lastUpdated}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">Refresh in</Typography>
              <Typography variant="caption" fontFamily="monospace">{refreshCounter}s</Typography>
            </Stack>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={Math.round(((status.refreshInterval - refreshCounter) / status.refreshInterval) * 100)}
            color={isLive ? 'success' : 'primary'}
            sx={{ mt: 1, height: 2, borderRadius: 1 }}
          />
        </Popover>
      </>
    );
  }

  // ── Panel variant (Sidebar card) ───────────────────────────────────────
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.25, borderRadius: 2,
        borderColor: isLive ? 'success.main' : isCached ? 'warning.main' : 'divider',
        bgcolor: isLive ? 'rgba(76,175,80,0.06)' : isCached ? 'rgba(255,152,0,0.06)' : 'transparent',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {/* Header row (Clickable to show / hide drilldown) */}
      <Tooltip title={expanded ? 'Click to collapse drilldown' : 'Click to expand drilldown'}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.8}
          onClick={toggleExpanded}
          sx={{
            cursor: 'pointer',
            userSelect: 'none',
            borderRadius: 1,
            p: 0.3,
            mx: -0.3,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <Box
            sx={{
              width: 9, height: 9, borderRadius: '50%',
              bgcolor: dotColor, flexShrink: 0,
              animation: isLive
                ? `${blink} 1.4s ease-in-out infinite`
                : 'none',
            }}
          />
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              flexGrow: 1,
              fontSize: '0.8rem',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {label}
          </Typography>

          {/* Manual refresh button (stopPropagation) */}
          <Tooltip title="Refresh market data">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                manualRefresh();
              }}
              sx={{ p: 0.3, flexShrink: 0 }}
            >
              <Refresh sx={{ fontSize: 13 }} />
            </IconButton>
          </Tooltip>

          {/* Drilldown chevron toggle */}
          <IconButton
            size="small"
            onClick={toggleExpanded}
            sx={{ p: 0.2, flexShrink: 0, color: 'text.secondary' }}
            aria-label={expanded ? 'Hide market details' : 'Show market details'}
          >
            {expanded ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
          </IconButton>
        </Stack>
      </Tooltip>

      {/* Status message */}
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{
          mt: 0.3,
          mb: expanded ? 0.5 : 0,
          fontSize: '0.72rem',
          cursor: 'pointer',
        }}
        onClick={toggleExpanded}
      >
        {status.message}
      </Typography>

      {/* ── Collapsible Drilldown Section ─────────────────────────────────── */}
      <Collapse in={expanded} timeout={250} unmountOnExit={false}>
        <Divider sx={{ my: 0.8 }} />

        {/* Detail rows */}
        <Stack spacing={0.4}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>IST Time</Typography>
            <Typography variant="caption" fontWeight={600} fontFamily="monospace" sx={{ fontSize: '0.72rem' }}>
              {status.currentTimeIst.split(' ')[1] ?? '—'}
            </Typography>
          </Stack>

          {isLive && (
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>Closes in</Typography>
              <Typography variant="caption" fontWeight={600} fontFamily="monospace" color="success.main" sx={{ fontSize: '0.72rem' }}>
                {countdown}
              </Typography>
            </Stack>
          )}

          {isPreOpen && (
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>Opens in</Typography>
              <Typography variant="caption" fontWeight={600} fontFamily="monospace" color="warning.main" sx={{ fontSize: '0.72rem' }}>
                {countdown}
              </Typography>
            </Stack>
          )}

          {!isOpen && status.nextOpen && (
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>Next open</Typography>
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.72rem' }}>
                {formatNextOpen(status.nextOpen)}
              </Typography>
            </Stack>
          )}

          {status.holidayName && (
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>Holiday</Typography>
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.72rem' }}>{status.holidayName}</Typography>
            </Stack>
          )}

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>Data source</Typography>
            <Chip
              label={status.dataSource}
              size="small"
              color={isLive ? 'success' : isCached ? 'warning' : 'default'}
              sx={{ height: 16, fontSize: 9, fontWeight: 700 }}
            />
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>Last updated</Typography>
            <Typography variant="caption" fontFamily="monospace" sx={{ fontSize: '0.72rem' }}>{lastUpdated}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>Refresh in</Typography>
            <Typography variant="caption" fontFamily="monospace" sx={{ fontSize: '0.72rem' }}>{refreshCounter}s</Typography>
          </Stack>
        </Stack>

        {/* Progress bar showing time until next refresh */}
        <LinearProgress
          variant="determinate"
          value={Math.round(((status.refreshInterval - refreshCounter) / status.refreshInterval) * 100)}
          color={isLive ? 'success' : 'primary'}
          sx={{ mt: 1, height: 2, borderRadius: 1 }}
        />
      </Collapse>
    </Paper>
  );
};

export default GlobalMarketStatus;

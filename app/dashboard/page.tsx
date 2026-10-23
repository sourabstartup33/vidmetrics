'use client';

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, BadgeCheck, Loader2, RefreshCw, X } from 'lucide-react';
import AppShell from '@/components/app/AppShell';
import VideoTable from '@/components/VideoTable';
import UploadsChart from '@/components/app/UploadsChart';
import { EngagementRanking, KpiStrip, KpiStripSkeleton, TopUploads, ViewsByDay } from '@/components/app/OverviewBlocks';
import IntelligenceBrief from '@/components/IntelligenceBrief';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Channel, Video, Insight, Timeframe } from '@/types';
import { analyzeChannel, getErrorMessage, fetchTableVideosForTab } from '@/lib/youtube';
import { generateInsights } from '@/lib/insights';
import { computeBestDay, topByViews } from '@/lib/brief';
import { calcChannelAvgViews, formatNumber } from '@/lib/utils';

type TabOption = 'overview' | 'intelligence';

function DashboardContent() {
  const searchParams = useSearchParams();

  // ── Core state ───────────────────────────────────────────────
  const [channel,        setChannel]        = useState<Channel | null>(null);
  const [recentVideos,   setRecentVideos]   = useState<Video[]>([]);   // latest 20 uploads
  const [extendedVideos, setExtendedVideos] = useState<Video[]>([]);   // latest 50 uploads
  const [tableVideos,    setTableVideos]    = useState<Video[]>([]);   // time-filtered videos
  const [insights,       setInsights]       = useState<Insight[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [tabLoading,     setTabLoading]     = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [inputError,     setInputError]     = useState('');
  const [isDemoMode,   setIsDemoMode]   = useState(false);
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);
  const [lastFetchUrl, setLastFetchUrl] = useState('');

  // ── Tab / time-filter state ──────────────────────────────────
  const [activeTab,  setActiveTab]  = useState<TabOption>(
    searchParams.get('tab') === 'intelligence' ? 'intelligence' : 'overview',
  );
  const [updatedAt,  setUpdatedAt]  = useState('');
  const [timeframe, setTimeframe]   = useState<Timeframe>('Latest');

  // Per-channel cache for each time filter tab
  const tabCache = useRef<Partial<Record<Timeframe, Video[]>>>({})

  // Monotonically-increasing ID — lets us discard stale in-flight responses
  const activeRequestId = useRef<number>(0);

  // Chart: chronological (oldest → newest)
  const chartVideos = useMemo(
    () => [...tableVideos].sort(
      (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    ),
    [tableVideos],
  );

  // ── Full channel fetch ───────────────────────────────────────
  const doFetch = useCallback(async (url: string, isDemo = false) => {
    setLoading(true);
    setError(null);
    setInputError('');
    setLastFetchUrl(url);
    setTimeframe('Latest');
    // Clear per-channel cache and reset request counter when analyzing a new channel
    tabCache.current = {};
    activeRequestId.current = 0;

    try {
      const result = await analyzeChannel(url, 'Latest');
      setChannel(result.channel);
      setRecentVideos(result.recentVideos);
      setExtendedVideos(result.extendedVideos);

      // Initialize table with 'Latest' timeframe videos
      setTableVideos(result.tableVideos);
      tabCache.current['Latest'] = result.tableVideos;

      setInsights(generateInsights(result));
      setIsDemoMode(isDemo);
      setUpdatedAt(new Date(result.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      document.title = `${result.channel.title} — VidMetrics`;

      // Sync browser URL so refresh reloads the correct channel
      const handle = result.channel.handle || url;
      const tab = new URLSearchParams(window.location.search).get('tab');
      const newUrl = `/dashboard?channel=${encodeURIComponent(handle)}${tab ? `&tab=${tab}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'NETWORK_ERROR';
      setChannel(null);
      setRecentVideos([]);
      setExtendedVideos([]);
      setTableVideos([]);
      setInsights([]);
      if (msg === 'INVALID_URL') {
        setInputError('That doesn’t look like a YouTube channel. Paste a channel link or an @handle.');
      } else if (msg === 'CHANNEL_NOT_FOUND') {
        setError('No channel matches that link or handle. Check it and try again.');
      } else {
        setError(getErrorMessage(msg));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Time-filter tab fetch ─────────────────────────────────────
  const handleTimeframeChange = useCallback(async (newTimeframe: Timeframe) => {
    if (!channel) return;

    setTimeframe(newTimeframe);

    // ── Cache hit ──────────────────────────────────────────────
    const cached = tabCache.current[newTimeframe];
    console.log('[Cache] Getting:', newTimeframe, 'cached:', cached?.length ?? null);
    if (cached) {
      console.log('[Cache] HIT for', newTimeframe);
      setTableVideos(cached);
      return;
    }

    // ── Generate unique request ID ─────────────────────────────
    // Increment BEFORE the async call so any later tab-click bumps the counter
    // and this response will self-discard when it eventually resolves.
    const requestId = ++activeRequestId.current;

    setTabLoading(true);
    try {
      const videos = await fetchTableVideosForTab(channel.id, newTimeframe);

      // Guard: discard if a newer request has since been issued
      if (requestId !== activeRequestId.current) {
        console.log('[Race] Discarding stale response for', newTimeframe,
          '(requestId:', requestId, 'active:', activeRequestId.current, ')');
        return;
      }

      console.log('[Cache] MISS — fetched', videos.length, 'videos for', newTimeframe);
      console.log('[Cache] Setting:', newTimeframe, 'videos:', videos.length);
      tabCache.current[newTimeframe] = videos;
      setTableVideos(videos);

    } catch (err) {
      // Discard error from a superseded request too
      if (requestId !== activeRequestId.current) return;
      console.error('Tab fetch failed:', err);
      setTableVideos([]);
    } finally {
      // Only clear the spinner for the request that is still "active"
      if (requestId === activeRequestId.current) {
        setTabLoading(false);
      }
    }
  }, [channel]);

  // ── Mount: load demo ─────────────────────────────────────────
  useEffect(() => {
    const channelParam = searchParams.get('channel');
    doFetch(channelParam ?? '@MrBeast', !channelParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Navbar handler ────────────────────────────────────────────
  const handleNavAnalyze = useCallback((url: string) => {
    setIsDemoMode(false);
    setDemoBannerDismissed(false);
    doFetch(url, false);
  }, [doFetch]);

  const TIME_FILTERS: { key: Timeframe; label: string }[] = [
    { key: 'Latest', label: 'Latest 20' },
    { key: '7D', label: '7 days' },
    { key: '28D', label: '28 days' },
    { key: '3M', label: '3 months' },
    { key: '1Y', label: '1 year' },
  ];
  const rangeLabel = TIME_FILTERS.find(t => t.key === timeframe)?.label ?? 'Latest 20';

  // The screen's one finding: their top upload against their average, and their best day
  const finding = useMemo(() => {
    if (!recentVideos.length) return null;
    const avg = calcChannelAvgViews(recentVideos);
    const top = topByViews(recentVideos, 1)[0];
    const best = computeBestDay(extendedVideos.length ? extendedVideos : recentVideos);
    return { avg, top, times: avg ? top.views / avg : 0, best };
  }, [recentVideos, extendedVideos]);

  const selectTab = (tab: TabOption) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    if (tab === 'intelligence') params.set('tab', 'intelligence');
    else params.delete('tab');
    window.history.replaceState({}, '', `/dashboard?${params.toString()}`);
  };

  return (
    <AppShell title={channel?.title ?? 'Channel analysis'} onAnalyze={handleNavAnalyze} isLoading={loading}>
      {inputError && (
        <div className="app-error" role="alert" style={{ marginBottom: 16 }}>
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          <span>{inputError}</span>
        </div>
      )}

      {/* ── Loading: the final layout, values as flat bars ── */}
      {loading && (
        <div aria-busy="true" aria-label="Loading channel">
          <div className="app-title">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span className="app-avatar app-skel" />
              <div>
                <h1><span className="app-skel" style={{ width: 160, height: 24 }}>Loading</span></h1>
                <p className="app-title__finding"><span className="app-skel" style={{ width: 360, height: 14 }} /></p>
              </div>
            </div>
          </div>
          <div className="app-tabs" aria-hidden="true">
            <button type="button" aria-selected="true">Overview</button>
            <button type="button">Intelligence brief</button>
          </div>
          <KpiStripSkeleton />
          <div className="app-row app-row--main">
            <div className="app-panel" style={{ height: 352 }} />
            <div className="app-panel" style={{ height: 352 }} />
          </div>
        </div>
      )}

      {/* ── The channel failed to load ── */}
      {error && !loading && !channel && (
        <div>
          <div className="app-title">
            <h1>Channel analysis</h1>
          </div>
          <div className="app-error" role="alert" style={{ marginTop: 16, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              <span>{error}</span>
            </span>
            <button
              type="button"
              className="app-button app-button--text"
              onClick={() => lastFetchUrl && doFetch(lastFetchUrl, lastFetchUrl === '@MrBeast')}
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && channel && (
        <div>
          {/* ── Title row: the channel, and the finding ── */}
          <div className="app-title">
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minWidth: 0 }}>
              <span className="app-avatar" aria-hidden="true">{channel.title.slice(0, 1)}</span>
              <div style={{ minWidth: 0 }}>
                <h1>
                  {channel.title}
                  {channel.verified && <BadgeCheck className="w-5 h-5" aria-label="Verified channel" style={{ color: 'var(--app-muted)' }} />}
                  <span className="app-meta" style={{ fontSize: 14, fontWeight: 400 }}>{channel.handle}</span>
                </h1>
                {finding && (
                  <p className="app-title__finding">
                    Their top upload, <strong>{finding.top.title}</strong>, has{' '}
                    <strong className="num">{finding.times.toFixed(1)}×</strong> their {formatNumber(finding.avg)} average.
                    {finding.best && (
                      <> {finding.best.day}s lead their posting days by <strong className="num">{finding.best.pct}%</strong>.</>
                    )}
                  </p>
                )}
              </div>
            </div>
            <div className="app-title__actions">
              <span className="app-stamp">{isDemoMode ? 'Demo data' : `Fetched ${updatedAt}`}</span>
              <button
                type="button"
                className="app-button"
                onClick={() => lastFetchUrl && doFetch(lastFetchUrl, isDemoMode)}
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                Refresh
              </button>
            </div>
          </div>

          {isDemoMode && !demoBannerDismissed && (
            <div className="app-notice" role="note">
              <span>
                You&rsquo;re looking at demo data for @MrBeast. Paste any channel link above to analyze a real competitor.
              </span>
              <button type="button" onClick={() => setDemoBannerDismissed(true)} aria-label="Dismiss notice">
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* ── Tabs ── */}
          <div className="app-tabs" role="tablist" aria-label="Views">
            {(['overview', 'intelligence'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`panel-${tab}`}
                onClick={() => selectTab(tab)}
              >
                {tab === 'overview' ? 'Overview' : 'Intelligence brief'}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div id="panel-overview" role="tabpanel">
              <div className="app-filters">
                <div className="app-seg" role="group" aria-label="Time range">
                  {TIME_FILTERS.map(t => (
                    <button
                      key={t.key}
                      type="button"
                      aria-pressed={timeframe === t.key}
                      onClick={() => handleTimeframeChange(t.key)}
                      disabled={tabLoading}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <span className="app-meta" aria-live="polite">
                  {tabLoading ? (
                    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Loading {rangeLabel.toLowerCase()}
                    </span>
                  ) : (
                    `${tableVideos.length} uploads in view`
                  )}
                </span>
              </div>

              {tabLoading ? <KpiStripSkeleton /> : <KpiStrip channel={channel} videos={tableVideos} rangeLabel={rangeLabel} />}

              {!tabLoading && tableVideos.length === 0 ? (
                <div className="app-row">
                  <div className="app-empty" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span>No uploads in the last {rangeLabel.toLowerCase()}.</span>
                    <button type="button" className="app-button app-button--text" onClick={() => handleTimeframeChange('Latest')}>
                      Show the latest 20
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="app-row app-row--main">
                    {tabLoading ? <div className="app-panel" style={{ height: 352 }} /> : <UploadsChart videos={chartVideos} rangeLabel={rangeLabel} />}
                    {tabLoading ? <div className="app-panel" style={{ height: 352 }} /> : <TopUploads videos={tableVideos} />}
                  </div>
                  <div className="app-row app-row--half">
                    <EngagementRanking videos={tableVideos} />
                    <ViewsByDay videos={extendedVideos.length ? extendedVideos : recentVideos} />
                  </div>
                </>
              )}

              {/* The table always lists the latest 20 uploads, whatever the range above */}
              <div className="app-row">
                <VideoTable
                  videos={recentVideos}
                  loading={loading}
                  channelUrl={channel ? `https://www.youtube.com/${channel.handle}/videos` : undefined}
                />
              </div>
            </div>
          )}

          {activeTab === 'intelligence' && (
            <div id="panel-intelligence" role="tabpanel">
              <IntelligenceBrief
                recentVideos={recentVideos}
                extendedVideos={extendedVideos}
                insights={insights}
                loading={false}
              />
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="app" aria-busy="true" />}>
      <ErrorBoundary fallbackMessage="The dashboard encountered an error. Please try again or refresh the page.">
        <DashboardContent />
      </ErrorBoundary>
    </Suspense>
  );
}

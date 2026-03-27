'use client';

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2, X, RefreshCw, Info } from 'lucide-react';
import DashboardNav from '@/components/DashboardNav';
import ChannelHeader from '@/components/ChannelHeader';
import VideoTable from '@/components/VideoTable';
import PerformanceChart from '@/components/PerformanceChart';
import QuickStats from '@/components/QuickStats';
import IntelligenceBrief from '@/components/IntelligenceBrief';
import EmptyState from '@/components/EmptyState';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Channel, Video, Insight, Timeframe } from '@/types';
import { analyzeChannel, getErrorMessage, fetchTableVideosForTab } from '@/lib/youtube';
import { generateInsights } from '@/lib/insights';

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
  const [activeTab,  setActiveTab]  = useState<TabOption>('overview');
  const [timeframe, setTimeframe]   = useState<Timeframe>('Latest');

  // Per-channel cache for each time filter tab
  const tabCache = useRef<Partial<Record<Timeframe, Video[]>>>({});

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
    tabCache.current = {};

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
      document.title = `${result.channel.title} — VidMetrics`;

      // Sync browser URL so refresh reloads the correct channel
      const handle = result.channel.handle || url;
      const newUrl = `/dashboard?channel=${encodeURIComponent(handle)}`;
      window.history.replaceState({}, '', newUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'NETWORK_ERROR';
      setChannel(null);
      setRecentVideos([]);
      setExtendedVideos([]);
      setTableVideos([]);
      setInsights([]);
      if (msg === 'INVALID_URL') {
        setInputError('Please enter a valid YouTube channel URL');
      } else if (msg === 'CHANNEL_NOT_FOUND') {
        setError('Channel not found. Check the URL and try again.');
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

    // Cache hit
    if (tabCache.current[newTimeframe]) {
      setTableVideos(tabCache.current[newTimeframe]!);
      return;
    }

    setTabLoading(true);
    try {
      const videos = await fetchTableVideosForTab(channel.id, newTimeframe);
        
      tabCache.current[newTimeframe] = videos;
      setTableVideos(videos);
    } catch (err) {
      console.error('Tab fetch failed:', err);
    } finally {
      setTabLoading(false);
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

  const TIME_FILTERS: Timeframe[] = ['Latest', '7D', '28D', '3M', '1Y'];

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      <DashboardNav onAnalyze={handleNavAnalyze} isLoading={loading} />

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(99,102,241,0.06)_0%,transparent_70%)] pointer-events-none z-0" />
        <div className="fixed inset-0 bg-[url('/noise.png')] opacity-15 mix-blend-overlay pointer-events-none z-0" />

        <div className="relative z-10">

          {/* Input error */}
          {inputError && (
            <p className="mb-4 text-sm text-red-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{inputError}
            </p>
          )}

          {/* Full page error */}
          {error && !loading && !channel && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <EmptyState icon="😵" title="Unable to load channel data" message={error} />
              <button
                onClick={() => lastFetchUrl && doFetch(lastFetchUrl, lastFetchUrl === '@MrBeast')}
                className="mt-4 px-5 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors text-sm flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-6 animate-pulse">
              <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-zinc-800" />
                  <div className="space-y-3">
                    <div className="h-7 w-48 bg-zinc-800 rounded-lg" />
                    <div className="h-4 w-28 bg-zinc-800 rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="bg-black/50 px-4 py-3 rounded-lg border border-white/5">
                      <div className="h-3 w-16 bg-zinc-800 rounded mb-2" />
                      <div className="h-5 w-20 bg-zinc-800 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          {!loading && channel && (
            <div>
              <ChannelHeader channel={channel} />

              {/* Demo banner */}
              {isDemoMode && !demoBannerDismissed && (
                <div className="mb-6 flex items-start sm:items-center justify-between gap-3 px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 border-l-[3px] border-l-indigo-500 rounded-lg">
                  <div className="flex items-start sm:items-center gap-3">
                    <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 sm:mt-0" />
                    <p className="text-sm text-indigo-200">
                      Demo analysis of <span className="text-white font-bold">@MrBeast</span> — paste any channel URL above to analyze your own competitor
                    </p>
                  </div>
                  <button
                    onClick={() => setDemoBannerDismissed(true)}
                    className="shrink-0 p-1.5 text-indigo-400 hover:text-white transition-colors rounded-md hover:bg-white/10"
                    aria-label="Dismiss demo banner"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Tab switcher */}
              <div className="border-b border-white/10 mb-8">
                <div className="flex">
                  {(['overview', 'intelligence'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 sm:flex-initial py-4 text-sm font-semibold uppercase tracking-wider whitespace-nowrap transition-colors relative min-h-[44px] sm:mr-8 ${
                        activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {tab === 'overview' ? 'Overview' : 'Intelligence Brief'}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ══ TAB 1: OVERVIEW ══════════════════════════════════ */}
              {activeTab === 'overview' && (
                <div className="animate-in fade-in duration-200 space-y-8">

                  {/* Time filter bar */}
                  <div className="overflow-x-auto -mx-2 px-2 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <div className="flex items-center gap-2">
                      {TIME_FILTERS.map(t => (
                        <button
                          key={t}
                          onClick={() => handleTimeframeChange(t)}
                          disabled={tabLoading}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50 min-h-[44px] ${
                            timeframe === t
                              ? 'bg-indigo-500 text-white'
                              : 'text-zinc-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                      {tabLoading && <Loader2 className="w-3.5 h-3.5 text-zinc-500 animate-spin ml-1" />}
                    </div>
                  </div>

                  {/* Empty state for time-filtered tabs with no results */}
                  {!tabLoading && tableVideos.length === 0 ? (
                    <div className="bg-[#0A0A0A] rounded-xl border border-white/10">
                      <EmptyState
                        icon="📭"
                        title="No videos found in this time period"
                        message="No uploads found in this time range"
                        action={{ label: 'View Latest', onClick: () => handleTimeframeChange('Latest') }}
                      />
                    </div>
                  ) : (
                    <>
                      {/* BLOCK 1: Performance Chart */}
                      {/* Does not show skeleton so it seamlessly switches */}
                      <PerformanceChart videos={chartVideos} loading={false} />

                      {/* BLOCK 2: Quick Stats */}
                      <QuickStats videos={tableVideos} loading={tabLoading} />

                      {/* BLOCK 3: Video Table */}
                      <VideoTable
                        videos={tableVideos}
                        loading={tabLoading}
                        channelUrl={channel ? `https://www.youtube.com/${channel.handle}/videos` : undefined}
                      />
                    </>
                  )}
                </div>
              )}

              {/* ══ TAB 2: INTELLIGENCE BRIEF ════════════════════════ */}
              {activeTab === 'intelligence' && (
                <IntelligenceBrief
                  recentVideos={recentVideos}
                  extendedVideos={extendedVideos}
                  channel={channel}
                  insights={insights}
                  loading={false}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    }>
      <ErrorBoundary fallbackMessage="The dashboard encountered an error. Please try again or refresh the page.">
        <DashboardContent />
      </ErrorBoundary>
    </Suspense>
  );
}

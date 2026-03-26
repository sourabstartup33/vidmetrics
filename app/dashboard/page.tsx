'use client';

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, AlertCircle, Loader2, X, RefreshCw } from 'lucide-react';
import DashboardNav from '@/components/DashboardNav';
import Sidebar from '@/components/Sidebar';
import ChannelHeader from '@/components/ChannelHeader';
import FilterBar, { SortOption, FilterOption } from '@/components/FilterBar';
import VideoTable from '@/components/VideoTable';
import ViewsOverTime from '@/components/AreaChart';
import TopEngagementBar from '@/components/BarChart';
import BestDayToPost from '@/components/BestDayToPost';
import ContentBreakdown from '@/components/ContentBreakdown';
import KeyInsights from '@/components/KeyInsights';
import { Channel, Video, Timeframe } from '@/types';
import { analyzeChannel, fetchTableVideosForTab, getErrorMessage } from '@/lib/youtube';
import { formatDate } from '@/lib/utils';

// Map FilterBar's FilterOption → our Timeframe type
function toTimeframe(filter: FilterOption): Timeframe {
  switch (filter) {
    case 'month': return 'thisMonth';
    case 'week': return 'thisWeek';
    default: return 'allTime';
  }
}

// Min video thresholds for time-filtered tabs
const MIN_VIDEOS: Record<Timeframe, number> = {
  allTime: 0,
  thisMonth: 5,
  thisWeek: 3,
};

// Empty state messages for insufficient data
const EMPTY_MESSAGES: Record<Timeframe, string> = {
  allTime: '',
  thisMonth: "This channel hasn't posted enough this month to analyze. Try 'All Time' for full performance data.",
  thisWeek: "This channel hasn't posted enough this week to analyze. Try 'All Time' for full performance data.",
};

// Inner component that reads search params (must be inside Suspense)
function DashboardContent() {
  const searchParams = useSearchParams();

  // ── State ───────────────────────────────────────────────────
  const [channel, setChannel] = useState<Channel | null>(null);
  const [tableVideos, setTableVideos] = useState<Video[]>([]);
  const [recentVideos, setRecentVideos] = useState<Video[]>([]);
  const [extendedVideos, setExtendedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchUrl, setSearchUrl] = useState('');
  const [inputError, setInputError] = useState('');
  const [sort, setSort] = useState<SortOption>('views');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);
  const [lastFetchUrl, setLastFetchUrl] = useState('');
  const [insufficientData, setInsufficientData] = useState('');

  // ── Tab cache: avoid re-fetching already-loaded timeframes ──
  const tabCache = useRef<Record<Timeframe, Video[] | null>>({
    allTime: null,
    thisMonth: null,
    thisWeek: null,
  });

  // ── Full fetch (new channel) ────────────────────────────────
  const doFetch = useCallback(async (url: string, isDemo = false) => {
    setLoading(true);
    setError(null);
    setInputError('');
    setInsufficientData('');
    setLastFetchUrl(url);
    // Clear tab cache for new channel
    tabCache.current = { allTime: null, thisMonth: null, thisWeek: null };

    try {
      const result = await analyzeChannel(url, 'allTime');
      setChannel(result.channel);
      setTableVideos(result.tableVideos);
      setRecentVideos(result.recentVideos);
      setExtendedVideos(result.extendedVideos);
      setSort('views');
      setFilter('all');
      setIsDemoMode(isDemo);
      // Cache the allTime tab
      tabCache.current.allTime = result.tableVideos;
      // Update browser tab title
      document.title = `${result.channel.title} — VidMetrics`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'NETWORK_ERROR';
      setChannel(null);
      setTableVideos([]);
      setRecentVideos([]);
      setExtendedVideos([]);
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

  // ── Tab switch fetch (same channel, different timeframe) ────
  const doTabFetch = useCallback(async (filterVal: FilterOption) => {
    const timeframe = toTimeframe(filterVal);

    // Check cache first
    if (tabCache.current[timeframe] !== null) {
      const cached = tabCache.current[timeframe]!;
      setTableVideos(cached);
      setInsufficientData(
        cached.length < MIN_VIDEOS[timeframe] ? EMPTY_MESSAGES[timeframe] : '',
      );
      return;
    }

    if (!channel) return;

    setTabLoading(true);
    setInsufficientData('');

    try {
      const videos = await fetchTableVideosForTab(channel.id, timeframe);
      tabCache.current[timeframe] = videos;
      setTableVideos(videos);
      if (videos.length < MIN_VIDEOS[timeframe]) {
        setInsufficientData(EMPTY_MESSAGES[timeframe]);
      }
    } catch {
      // If tab fetch fails, show error but don't wipe channel
      setInsufficientData('Failed to load data for this time period. Please try again.');
    } finally {
      setTabLoading(false);
    }
  }, [channel]);

  // ── Load on mount + handle ?channel= param ─────────────────
  useEffect(() => {
    const channelParam = searchParams.get('channel');
    if (channelParam) {
      setSearchUrl(channelParam);
      doFetch(channelParam, false);
    } else {
      // Auto-load real MrBeast data as demo
      doFetch('@MrBeast', true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Search submit ───────────────────────────────────────────
  const handleSearch = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!searchUrl.trim()) {
        setInputError('Please enter a YouTube channel URL');
        return;
      }
      setIsDemoMode(false);
      setDemoBannerDismissed(false);
      doFetch(searchUrl.trim(), false);
    },
    [searchUrl, doFetch],
  );

  // ── Filter change handler — triggers API call per tab ──────
  const handleFilterChange = useCallback(
    (newFilter: FilterOption) => {
      setFilter(newFilter);
      setSort('views');
      doTabFetch(newFilter);
    },
    [doTabFetch],
  );

  // ── Sort ────────────────────────────────────────────────────
  const sortedVideos = useMemo(() => {
    const s = [...tableVideos];
    switch (sort) {
      case 'views':     s.sort((a, b) => b.views - a.views); break;
      case 'engagement':s.sort((a, b) => b.engagementRate - a.engagementRate); break;
      case 'trending':  s.sort((a, b) => b.trendingScore - a.trendingScore); break;
      case 'date':      s.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()); break;
    }
    return s;
  }, [tableVideos, sort]);

  // ── CSV Export ──────────────────────────────────────────────
  const handleExport = useCallback(() => {
    if (sortedVideos.length === 0) return;
    const headers = ['Title', 'Views', 'Likes', 'Comments', 'Engagement Rate', 'Trending Score', 'Published', 'URL'];
    const rows = sortedVideos.map((v) => [
      `"${v.title.replace(/"/g, '""')}"`,
      v.views, v.likes, v.comments,
      `${v.engagementRate}%`, v.trendingScore,
      formatDate(v.publishedAt),
      v.url,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const handle = channel?.handle?.replace('@', '') || 'channel';
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `vidmetrics-${handle}-${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [sortedVideos, channel]);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <DashboardNav />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">

            {/* ── URL Search Input ─────────────────────────── */}
            <div className="mb-8">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-zinc-400" />
                  </div>
                  <input
                    type="text"
                    value={searchUrl}
                    onChange={(e) => { setSearchUrl(e.target.value); setInputError(''); }}
                    className={`block w-full pl-12 pr-4 py-3.5 border rounded-xl leading-5 bg-[#0A0A0A] placeholder-zinc-500 text-white focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-all ${
                      inputError
                        ? 'border-red-500/50 focus:ring-red-500/50'
                        : 'border-white/10 focus:ring-indigo-500'
                    }`}
                    placeholder="Paste a YouTube channel URL (e.g. youtube.com/@MrBeast)"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze'
                  )}
                </button>
              </form>

              {/* Inline input error */}
              {inputError && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5 pl-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {inputError}
                </p>
              )}
            </div>

            {/* ── API/network error full-page state ─────────── */}
            {error && !loading && !channel && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-white mb-2">Unable to load channel data</h2>
                <p className="text-zinc-400 text-sm max-w-sm mb-6">{error}</p>
                <button
                  onClick={() => lastFetchUrl && doFetch(lastFetchUrl, lastFetchUrl === '@MrBeast' && !searchUrl)}
                  className="px-5 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors text-sm flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
              </div>
            )}

            {/* ── Loading Skeleton ─────────────────────────── */}
            {loading && (
              <div className="space-y-6">
                {/* Channel header skeleton */}
                <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-6 shadow-sm mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 animate-pulse">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full bg-zinc-800" />
                    <div className="space-y-3">
                      <div className="h-7 w-48 bg-zinc-800 rounded-lg" />
                      <div className="h-4 w-28 bg-zinc-800 rounded-lg" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-black/50 px-4 py-3 rounded-lg border border-white/5">
                        <div className="h-3 w-16 bg-zinc-800 rounded mb-2" />
                        <div className="h-5 w-20 bg-zinc-800 rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Table skeleton */}
                <div className="bg-[#0A0A0A] rounded-xl border border-white/10 overflow-hidden">
                  <div className="h-12 bg-white/5 border-b border-white/10" />
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center gap-5 px-6 py-4 border-b border-white/5 animate-pulse">
                      <div className="w-5 h-4 bg-zinc-800 rounded shrink-0" />
                      <div className="w-24 h-14 bg-zinc-800 rounded-md shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                        <div className="h-3 w-1/3 bg-zinc-800 rounded" />
                      </div>
                      <div className="h-4 w-16 bg-zinc-800 rounded" />
                      <div className="h-4 w-12 bg-zinc-800 rounded" />
                      <div className="h-6 w-16 bg-zinc-800 rounded-full" />
                      <div className="h-6 w-20 bg-zinc-800 rounded-full" />
                    </div>
                  ))}
                </div>

                {/* Charts skeleton — 2x2 grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-[#0A0A0A] rounded-2xl border border-white/10 p-5 animate-pulse">
                      <div className="h-4 w-36 bg-zinc-800 rounded mb-1" />
                      <div className="h-3 w-52 bg-zinc-800/60 rounded mb-4" />
                      <div className="h-52 bg-zinc-800/50 rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Main Content ─────────────────────────────── */}
            {!loading && channel && (
              <div>
                {/* ── Demo banner ──────────────────────────── */}
                {isDemoMode && !demoBannerDismissed && (
                  <div className="mb-5 flex items-center justify-between gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-sm text-zinc-400">
                      👋 Demo analysis of <span className="text-zinc-200 font-medium">@MrBeast</span> — paste any channel URL above to analyze your own competitor
                    </p>
                    <button
                      onClick={() => setDemoBannerDismissed(true)}
                      className="shrink-0 p-1 text-zinc-500 hover:text-zinc-300 transition-colors rounded-md hover:bg-white/10"
                      aria-label="Dismiss demo banner"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <ChannelHeader channel={channel} />

                <div className="mb-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-extrabold text-white">Performance Intelligence</h2>
                    <p className="text-sm text-zinc-400">
                      {sortedVideos.length} video{sortedVideos.length !== 1 ? 's' : ''} ·{' '}
                      {filter === 'all' ? 'All time' : filter === 'month' ? 'Last 30 days' : 'Last 7 days'}
                    </p>
                  </div>

                  <FilterBar
                    sort={sort}
                    onSortChange={setSort}
                    filter={filter}
                    onFilterChange={handleFilterChange}
                    onExport={handleExport}
                  />

                  {/* Tab-level loading skeleton */}
                  {tabLoading ? (
                    <div className="bg-[#0A0A0A] rounded-xl border border-white/10 overflow-hidden">
                      <div className="h-12 bg-white/5 border-b border-white/10" />
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-5 px-6 py-4 border-b border-white/5 animate-pulse">
                          <div className="w-5 h-4 bg-zinc-800 rounded shrink-0" />
                          <div className="w-24 h-14 bg-zinc-800 rounded-md shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                            <div className="h-3 w-1/3 bg-zinc-800 rounded" />
                          </div>
                          <div className="h-4 w-16 bg-zinc-800 rounded" />
                          <div className="h-4 w-12 bg-zinc-800 rounded" />
                          <div className="h-6 w-16 bg-zinc-800 rounded-full" />
                          <div className="h-6 w-20 bg-zinc-800 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : insufficientData ? (
                    /* Insufficient data empty state for time-filtered tabs */
                    <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-16 text-center">
                      <p className="text-zinc-400 text-sm">{insufficientData}</p>
                      <button
                        onClick={() => handleFilterChange('all')}
                        className="mt-3 text-indigo-400 text-sm hover:text-indigo-300 transition-colors"
                      >
                        Show all videos →
                      </button>
                    </div>
                  ) : sortedVideos.length > 0 ? (
                    <VideoTable videos={sortedVideos} />
                  ) : (
                    <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-16 text-center">
                      <p className="text-zinc-400 text-sm">No videos found for this time period.</p>
                      <button
                        onClick={() => handleFilterChange('all')}
                        className="mt-3 text-indigo-400 text-sm hover:text-indigo-300 transition-colors"
                      >
                        Show all videos →
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Charts use dedicated datasets ─────────── */}
                {recentVideos.length > 0 && (
                  <div className="mb-8">
                    {/* ── Section header ─────────────────────── */}
                    <div className="mb-5">
                      <h2 className="text-xl font-extrabold text-white">Competitive Intelligence</h2>
                      <p className="text-sm text-zinc-500">Strategic breakdown of {channel.title}&apos;s content performance</p>
                    </div>

                    {/* ── Key Insights strip ──────────────────── */}
                    <KeyInsights videos={recentVideos} />

                    {/* ── 2×2 chart grid ──────────────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <ViewsOverTime videos={recentVideos} />
                      <TopEngagementBar videos={recentVideos} />
                      <BestDayToPost videos={extendedVideos} />
                      <ContentBreakdown videos={recentVideos} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Wrap with Suspense because useSearchParams() requires it in Next.js App Router
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

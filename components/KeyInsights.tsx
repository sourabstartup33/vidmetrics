'use client';

import { Lightbulb } from 'lucide-react';
import { Video } from '@/types';

interface KeyInsightsProps {
  videos: Video[];
}

function generateInsights(videos: Video[]): string[] {
  if (videos.length === 0) return [];

  const insights: string[] = [];

  // 1. Best day to post
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayBuckets: { sum: number; count: number }[] = Array.from({ length: 7 }, () => ({ sum: 0, count: 0 }));
  videos.forEach((v) => {
    const d = new Date(v.publishedAt).getDay();
    dayBuckets[d].sum += v.viewCount;
    dayBuckets[d].count += 1;
  });
  const dayAvgs = dayBuckets.map((b) => (b.count > 0 ? b.sum / b.count : 0));
  const bestDayIdx = dayAvgs.indexOf(Math.max(...dayAvgs));
  if (dayBuckets[bestDayIdx].count > 0) {
    insights.push(`📅 Posts most on ${DAYS[bestDayIdx]}s`);
  }

  // 2. Long vs short videos (proxy: trending score vs view count percentile)
  // Use title word count as proxy for video length (not ideal but no duration data)
  // Instead: compare videos with trendingScore > avg vs below
  const avgViews = videos.reduce((s, v) => s + v.viewCount, 0) / videos.length;
  const aboveAvg = videos.filter((v) => v.viewCount > avgViews);
  const avgEngAbove = aboveAvg.length > 0
    ? aboveAvg.reduce((s, v) => s + v.engagementRate, 0) / aboveAvg.length
    : 0;
  const avgEngAll = videos.reduce((s, v) => s + v.engagementRate, 0) / videos.length;
  if (avgEngAbove > 0 && avgEngAll > 0) {
    const mult = Math.round((avgEngAbove / avgEngAll) * 10) / 10;
    if (mult > 1.2) {
      insights.push(`⚡ High-view videos get ${mult}x more engagement than average`);
    }
  }

  // 3. Recent uploads trending
  const recent = [...videos]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);
  const recentTrending = recent.filter((v) => v.trendingScore > 60).length;
  if (recentTrending >= 2) {
    insights.push(`🔥 ${recentTrending} of last 3 uploads are trending`);
  }

  // 4. Consistency — engagement rate standard deviation
  const avgEng = videos.reduce((s, v) => s + v.engagementRate, 0) / videos.length;
  const stdDev = Math.sqrt(
    videos.reduce((s, v) => s + Math.pow(v.engagementRate - avgEng, 2), 0) / videos.length,
  );
  if (stdDev < 0.5) {
    insights.push(`📊 Very consistent engagement — avg ${avgEng.toFixed(1)}% across all videos`);
  } else if (stdDev > 1.5) {
    insights.push(`📊 Highly variable engagement — some videos far outperform others`);
  }

  // 5. Posting frequency
  const sorted = [...videos].sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
  if (sorted.length >= 4) {
    const span =
      (new Date(sorted[sorted.length - 1].publishedAt).getTime() -
        new Date(sorted[0].publishedAt).getTime()) /
      (1000 * 60 * 60 * 24);
    const freq = span / sorted.length;
    if (freq <= 3) insights.push(`📆 Posts very frequently — ~every ${Math.round(freq)} days`);
    else if (freq <= 10) insights.push(`📆 Posts weekly — ~every ${Math.round(freq)} days`);
  }

  return insights.slice(0, 3); // max 3
}

export default function KeyInsights({ videos }: KeyInsightsProps) {
  const insights = generateInsights(videos);
  if (insights.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-bold text-white">Key Insights</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {insights.map((text, i) => (
          <div
            key={i}
            className="px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-sm text-zinc-300 font-medium"
          >
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

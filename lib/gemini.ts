import { Video, Insight } from '@/types';
import { formatNumber } from '@/lib/utils';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// ── Build a compact prompt from video + insight data ──────────
function buildPrompt(videos: Video[], insights: Insight[]): string {
  const avgViews = Math.round(videos.reduce((s, v) => s + v.views, 0) / Math.max(videos.length, 1));
  const avgEng = (videos.reduce((s, v) => s + v.engagementRate, 0) / Math.max(videos.length, 1)).toFixed(2);
  const topVideo = [...videos].sort((a, b) => b.views - a.views)[0];
  const insightLines = insights.map(i => `- ${i.headline}: ${i.detail}`).join('\n');

  return `You are an elite YouTube competitor analyst. Analyze the provided competitor channel data and signals to generate a highly insightful summary for the user who is competing against them. 

Provide your analysis as exactly 3 punchy, data-driven bullet points. Each point must be extremely fast to read and include specific numbers or metrics to back up its claim. 

Format each bullet point on its own line, starting with its title in bold like "**Title:**". Do not add any introductory or concluding text.

- **Their Core Engine:** What specific format or hook is winning for this competitor + the numbers proving it.
- **Their Blind Spot:** Where the competitor is losing momentum or missing opportunities + the numbers proving it.
- **Your Playbook:** The #1 highest-ROI action the user should take to beat this competitor based on their data.

Channel data (latest ${videos.length} uploads):
- Average views per video: ${formatNumber(avgViews)}
- Average engagement rate: ${avgEng}%
- Top performing video: "${topVideo?.title ?? 'N/A'}" (${formatNumber(topVideo?.views ?? 0)} views)

Key signals:
${insightLines}

Deliver your 3-paragraph strategic summary now:`;
}

// ── Main export ───────────────────────────────────────────────

export async function generateAISummary(
  videos: Video[],
  insights: Insight[],
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_KEY_MISSING');

  const prompt = buildPrompt(videos, insights);

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
  }

  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) throw new Error('EMPTY_RESPONSE');
  return text.trim();
}

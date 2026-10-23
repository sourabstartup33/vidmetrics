'use client';

import { useState } from 'react';
import { SampleBrief } from '@/lib/sampleBrief';
import { formatNumber } from '@/lib/utils';
import { ActionsCard, DayCard, FormatCard, GapsCard, TitleCard, TopVideoCard } from './Fragments';

export default function BriefShowcase({ brief }: { brief: SampleBrief }) {
  const [active, setActive] = useState(0);
  const [lead, second] = brief.formats;
  const lengthPct = second ? Math.round(((lead.avg - second.avg) / second.avg) * 100) : 0;

  const answers = [
    {
      name: 'The video that won',
      disc: 'var(--yellow)',
      fact: `${formatNumber(brief.topVideo.views)} views`,
      detail: `${brief.topVideo.timesAverage}× the ${formatNumber(brief.avgViews)} average of their last ${brief.uploadsRead} uploads.`,
      card: <TopVideoCard brief={brief} />,
    },
    {
      name: 'The length that wins',
      disc: 'var(--pink)',
      fact: lead.label,
      detail: second
        ? `${lead.count} of their ${brief.uploadsRead} uploads run ${lead.label.toLowerCase()}, and they average ${lengthPct}% more views.`
        : `Every recent upload runs ${lead.label.toLowerCase()}.`,
      card: <FormatCard brief={brief} />,
    },
    {
      name: 'The day to post',
      disc: 'var(--cyan)',
      fact: `${brief.bestDay.day}s`,
      detail: `${brief.bestDay.pct}% more views than their other posting days, from ${brief.bestDay.count} ${brief.bestDay.day} uploads.`,
      card: <DayCard brief={brief} />,
    },
    {
      name: 'The title formula',
      disc: 'var(--orange)',
      fact: 'A number up front',
      detail: `${brief.titleHookCount} of their 10 most viewed titles carry a number or a dollar amount.`,
      card: <TitleCard brief={brief} />,
    },
    {
      name: 'Where they’re open',
      disc: 'var(--yellow)',
      fact: brief.gaps[1]?.gap ?? brief.gaps[0].gap,
      detail: brief.gaps[1]?.detail ?? brief.gaps[0].detail,
      card: <GapsCard brief={brief} />,
    },
    {
      name: 'What to do Monday',
      disc: 'var(--pink)',
      fact: `${brief.gaps.length} moves`,
      detail: 'One for each gap, written as an instruction your team can act on.',
      card: <ActionsCard brief={brief} />,
    },
  ];
  const a = answers[active];

  return (
    <section
      className="lp-field lp-grid lp-showcase"
      id="brief"
      aria-labelledby="brief-title"
      data-chapter-bg="var(--white)"
      data-chapter-ink="var(--ink)"
    >
      <div className="lp-showcase__stage" data-reveal style={{ ['--disc-colour' as string]: a.disc }}>
        <div className="lp-disc" aria-hidden="true" />
        <div className="lp-showcase__object lp-swap" key={active}>
          {a.card}
        </div>
      </div>

      <div className="lp-showcase__list">
        <h2 id="brief-title" data-reveal>One brief, six answers</h2>
        <ul>
          {answers.map((x, i) => (
            <li key={x.name} data-reveal style={{ ['--i' as string]: i + 1 }}>
              <button type="button" aria-pressed={i === active} onClick={() => setActive(i)}>
                {x.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="lp-showcase__fact lp-swap" key={`fact-${active}`} aria-live="polite">
        <strong className="num">{a.fact}</strong>
        {a.detail}
        <span className="lp-small" style={{ display: 'block', marginTop: 12, fontFamily: 'var(--font-sans)' }}>
          Sample brief on {brief.channel.handle}, from the demo data.
        </span>
      </p>
    </section>
  );
}

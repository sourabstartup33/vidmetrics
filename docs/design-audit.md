# VidMetrics design audit

Audit of the landing page (`/`), the dashboard (`/dashboard`, Overview and Intelligence Brief tabs),
the auth screens (`/login`, `/signup`) and the coming-soon pages (`/dashboard/[slug]`), as of commit
`cebdaf3`.

**How it was measured.** The live site (vidmetrics-gold.vercel.app) is blocked from the audit
environment, so the same code was run locally with `next dev`. With no YouTube key, the dashboard
falls back to its built-in `@MrBeast` demo data, which is what the deployed demo shows on a
quota-exhausted day. Each screen was opened in headless Chromium at 1440, 768 and 390px and measured
with the `design-taste-frontend` inspector (`inspect.mjs`, page rules for `/`, app rules for
`/dashboard`) and source linter (`lint.mjs`). Screenshots are in `.taste-skill/before/`.

Some thumbnails and avatars show as broken in the screenshots because the audit environment blocks
picsum.photos, pravatar.cc and yt3.googleusercontent.com. The live site may load them. They are not
counted as design findings below, except where the image source itself is the problem.

## Summary

The product underneath is good. It parses any channel URL, computes engagement and a trending score
per video, finds posting-day and title-pattern signals, and exports CSV. The design hides all of
that behind a 2023 AI-template look: an indigo glow, gradient text, grain, floating particles,
glass, and six icon cards. None of that comes from YouTube or from competitor analysis. Cover the
logo and the landing page could sell any SaaS product. The dashboard is closer to a working tool,
but its chrome is louder than its data.

| Screen | Inspector | Score (juror-weighted) |
| --- | --- | --- |
| Landing `/` | **15 FAIL, 4 WARN** | design 5 · usability 6 · creativity 4 · content 4 → **5.0** (capped at 6.0) |
| Dashboard `/dashboard` | **5 FAIL, 5 WARN** (app rules) | design 5.5 · usability 6.5 · creativity 5 · content 7 → **5.9** |
| Source (`app/`, `components/`) | **151 FAIL, 47 WARN** | 74 indigo/violet uses, 28 shadows, 27 hairlines, 10 gradients, 4 emoji |

## Landing page

```
ROUND 0 (before)
Seen in one second: a grey-to-white gradient headline on a purple haze.
Idea (one sentence): none. "The new standard for YouTube analytics" fits any analytics tool.
Live thing: the channel URL input. It is real and it is the best thing on the page, but it is
  placed as the third of four stacked elements under a 3-line paragraph.
Layout words by section: hero=centred stack / features=card grid / how-it-works=3 icon columns /
  social proof=card grid + logo row / pricing=card grid / footer=sitemap
Scores: design 5 · usability 6 · creativity 4 · content 4 → overall 5.0
Caps applied: inspector FAILs (≤6.0); eyebrow, gradient, shadows, hairlines (≤6.5);
  pass 3 fails (creativity ≤6); 0 real pictures (design ≤6.5); blank stretches (design ≤6.5).
Top three problems:
1. No idea and no picture of the product's world. The hero is type on a purple glow; the only
   image is a hand-drawn fake dashboard on a white background with an SVG path for a chart.
   Fix: make the real product the hero. Show real channel data in an interface built from the
   app's own components, large, and make the URL input the first action.
2. The page invents proof. Three testimonials from made-up people with pravatar.cc faces, a logo
   row of "Acme Corp, GlobalTech, MediaFlow…", "500+ teams" on the login screen, "millisecond
   precision", "processes their entire video history" (it fetches the latest 20 to 50).
   Fix: delete the fake proof. Replace it with what the product really computes, shown on a real
   channel.
3. Five sections in a row are the same composition: a centred gradient h2, a grey subline, then
   a grid of identical dark cards. Fix: give each section its own layout from one direction,
   built around one claim per section.
```

### Findings, with measurements

**Type**
- One face (Inter, 99%) at nine sizes: 11 / 12 / 14 / 16 / 18 / 20 / 36 / 48 / 96px. The skill's
  ceiling is five.
- Body copy is 14px (`text-sm`) almost everywhere, in `zinc-400` grey. 14 text blocks are under
  13px. Running text should be 16–20px in the full ink.
- All five section headings use `.text-gradient`: white fading to grey, clipped to the text.
- The hero subline is centred over three lines at 1440px and four at 390px.

**Colour**
- Indigo (`#6366F1`) carries the whole brand: the hero pill, the glow blobs, the Pro card's
  animated border, step 3 of How it works, the dashboard's primary button, tabs, chart lines, KPI
  edges and the demo banner. The linter counts 74 uses. An accent used everywhere marks nothing.
- Two animated blur blobs (indigo and purple), 30 floating white particles, and a grain texture
  loaded from a third-party URL (`grainy-gradients.vercel.app/noise.svg`).
- Contrast misses 4.5:1 on the footer copyright (2.7:1) and the testimonial roles (4.1:1).

**Composition and frame**
- The page sits off-centre: 144px margin on the left against 240px on the right at 1440px.
- Two blank stretches: 1,784px and 420px of empty black. Most sections use `whileInView`
  reveals, so a visitor who scrolls fast, a screenshot service or a link preview sees empty bands.
- "Built for modern teams." stays as the only large text for four screens.
- The nav is a floating glass pill that turns into a blurred bar on scroll.

**Ornament the inspector fails**
- 5 eyebrow labels (the "V2 … coming soon" pill, the "Most Popular" pill, the three KPI captions
  in the mock-up), 6 gradient fills, 5 gradient-text elements, 16 resting shadows, 13 hairlines,
  18 outlined boxes, 3 rows of icon-topped cards (6, 3 and 3), 3 glass surfaces, monospace in the
  fake address bar, the 🔥 emoji.

**Content**
- The hero has three competing actions: Analyze, "Get started for free" and "View live demo".
  "Get started" goes to a fake signup that lands on the same demo.
- The "V2 with AI-powered insights — coming soon" pill advertises a feature that already ships:
  the Intelligence Brief's Gemini summary.
- The features list names things the product does not do ("Deep Filtering… by content type",
  "real time with millisecond precision") and leaves out what it does best: the posting-day
  analysis, the title-pattern finding, the content gaps and the action list.

## Dashboard

```
ROUND 0 (before), app-screen critique (references/app-screens.md §2.7)
Screen's question: "What is working for this competitor right now?"
Is it answered by the biggest thing? No. The largest block is a full-width "Performance Trends"
  chart of per-video views, drawn as a smoothed spline that invents values between uploads.
  The answer (which videos win, and why) is in the Intelligence Brief tab, one click away.
Shared edges: yes, the 1280px column holds. The KPI tiles and the two half-width charts close.
Colour only on data? No. Indigo is on the Analyze button, the active tab underline, the active
  time-filter pill, the left edges of the KPI tiles, the demo banner and every chart.
Numbers: "Hot Content 0% — 0 of 20 videos" sits beside a landing page that promises "94/100
  Viral velocity". The KPI strip repeats the header's facts in a second form.
Phone: the nav stacks the search and the Analyze button above the content. The table scrolls
  sideways inside its frame. Four header KPIs become a 2×2 grid, which is correct.
Scores: design 5.5 · usability 6.5 · creativity 5 · content 7 → overall 5.9
Top three problems:
1. The first screen answers the wrong question. At 1440×900 only 2 of 9 blocks start above the
   fold: the channel header and the demo banner. Fix: lead with the finding (the winning video,
   format and day), then the chart at two-thirds width beside the top videos.
2. Chrome louder than data: 19 tiny uppercase tracked labels at 10px ("SUBSCRIBERS", "VIDEO
   LIBRARY", "THUMBNAIL"), indigo left edges on every tile, a radial glow and a noise layer
   behind the page. Fix: sentence-case 12–13px labels, one neutral dark ground, the hue only on
   the main data series.
3. The table reads as a list of truncated words. Titles cut to two words ("Extreme $100,00…"),
   numbers left-aligned in proportional digits (60 of 60 numeric cells), engagement and trending
   both shown as coloured chips, pagination under a 20-row list. Fix: the title gets the widest
   column, figures right-aligned in tabular numerals, one status mark per row.
```

### Findings, with measurements

- **Type.** Six sizes (10 / 11 / 12 / 14 / 16 / 24px); 32 text blocks under 11px. Only 30% of
  figures use tabular numerals.
- **Labels.** 19 uppercase letter-spaced micro-labels. The tab labels "OVERVIEW" and
  "INTELLIGENCE BRIEF" are uppercase tracked too.
- **Panel borders.** 10 borders are far too strong for the ground: `#615fff` on `#0a0a0a` is
  4.3:1. A panel edge on a dark screen should be about 1.2–1.5:1.
- **Charts.**
  - Three charts in three styles: a smoothed indigo spline with a fill, a monthly area that sums
    views by upload month (a month with three uploads looks like growth against a month with one),
    and a bar list whose first bar is indigo and the rest grey.
  - The x-axis on Performance Trends is a category axis of irregular upload dates, so a three-week
    gap and a two-day gap take the same width.
- **Top 5 by engagement** spans 0–4% with five bars from 3.88% to 3.93%. On that scale the
  differences can't be seen, so the chart says nothing.
- **Intelligence Brief.**
  - Uppercase tracked section labels, "Derived from…" pills beside every heading, a coloured top
    border on every card (green "STRONG", amber "WATCH"), and index-numbered chips on both lists.
  - When Gemini has no key, the AI summary shows one grey italic error line in a large card.
    "Regenerate" stays clickable.
- **Empty and error states.**
  - Emoji as the illustration (😵, 📭).
  - The full-page error replaces the whole dashboard instead of the block that failed.
- **Shell.** A 64px top bar holding the logo, a 376px search field, a notification bell with a
  fake unread dot, and a broken pravatar.cc avatar. The bell and the avatar do nothing.

## Auth and coming-soon screens

- **Login and signup.**
  - The left half is a 1px grid-line pattern under "Join 500+ enterprise content teams" and four
    broken pravatar avatars labelled "500+ teams joined". The skill counts both the pattern and the
    unverifiable count as banned.
  - The right half is a standard form with a tinted "Demo Mode Active" notice and a Google button
    that does nothing.
- **Coming soon** (`/dashboard/competitors`, `/reports`, `/trends`, `/exports`, `/settings`). Each
  one is:
  - an icon in a tinted square;
  - a pulsing amber "COMING IN V2" pill;
  - a "Notify me" button that only flips local state.

## What the redesign changes, in order

1. **One idea from the product's own material.** The page and the app share a visual language
   taken from YouTube's world: the video itself. Thumbnails, view counts and the upload timeline
   are the imagery, and the real dashboard is the hero picture.
2. **Honest content.** Remove invented testimonials, logos, team counts and false claims. Lead with
   what the product computes on a real channel.
3. **Type and colour.** Larger body text in full ink, five sizes at most, no gradient text. One
   ground, one ink, one accent, with the accent on the action and on the data only.
4. **Frame.** Equal margins, a heading on every section, no blank stretches. Content is visible
   without waiting for scroll reveals.
5. **Dashboard.** The finding first. Charts drawn honestly: straight segments, a time axis, a
   readable scale. A table that aligns. Sentence-case labels, borders that whisper.
6. **States.** Loading in the final layout, errors inside the block that failed, no emoji.

---

# Outcome: the redesign

Built with the `design-taste-frontend` skill, measured the same way as the audit above
(`inspect.mjs` at 1440, 768 and 390px on the production build; screenshots in `.taste-skill/after/`,
which is git-ignored).

## Before and after

| | Before | After |
| --- | --- | --- |
| Landing inspector | 15 FAIL, 4 WARN | **0 FAIL**, 5 WARN |
| Dashboard inspector (app rules) | 5 FAIL, 5 WARN | **0 FAIL, 0 WARN** |
| Intelligence Brief (app rules) | not measured | **0 FAIL, 0 WARN** |
| Source lint | 151 FAIL, 47 WARN | **0 FAIL** (page rules on `components/landing`, app rules on the app) |
| Landing body text | 14px grey sans | 19px Source Serif 4 in full ink |
| Hero headline | 96px gradient text, 6 words | 187px solid ink, 3 words, 2 lines at every width |
| Dashboard labels | 19 tracked uppercase labels at 10px | sentence case, 12–13px, none under 12px |
| Table numbers | 60 of 60 left-aligned, 30% tabular | right-aligned, all tabular |
| Invented proof | 3 testimonials, 5 fake logos, "500+ teams" | none |

## Direction

- **Page:** `colour-chapters` (seed 1552607546). Hero redrawn once, because the dealt hero needed a
  landscape photograph and VidMetrics has none (the open archives were also unreachable from the
  build environment). Pricing redrawn to "Plans that step up", because there are three plans and the
  dealt blueprint holds one.
- **App:** `framed-sheet` (seed 1777936196). Kept the dealt palette and type from the page.
- **Idea:** the page is a brief on one competitor. Each colour chapter is one of its answers (the
  video that won, the length that wins, the day to post, the title formula, where they're open, what
  to do Monday), shown as the product's own card.
- **Live thing:** "Score a video". Views, likes, comments and upload age run through the product's
  real `calcTrendingScore`, and the row downloads as CSV.
- **App face:** the page's magenta, darkened to 4.8:1, as the one data hue on the main series. The
  signature element is views per upload on a true time axis, with the top upload marked.

## Still short

- **No photographs or footage** on the landing page (inspector WARN `no-real-pictures`). Every
  picture is a fragment of the real interface. A real screenshot or a short screen recording of the
  dashboard on a live channel would be the best addition.
- **Trending score ceiling.** At a typical 3–4% engagement a video tops out around 60, so the
  "over 70" band is rare. This is product logic, not design, and it is unchanged.

## Replace before launch

- `hello@vidmetrics.io` (footer and the Enterprise plan): a placeholder address.
- The sample brief on the landing page is built from the demo data in `lib/youtube.ts`
  (`getDemoData`), which uses MrBeast's name with illustrative numbers. Swap in a real run, or a
  channel you have permission to feature.
- Demo video durations in `getDemoData` were added for a realistic length analysis; they are
  illustrative too.

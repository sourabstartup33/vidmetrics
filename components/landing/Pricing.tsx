import Link from 'next/link';

// Plans step up like the bars of a chart: the bigger plan is the taller tile.
const PLANS = [
  {
    name: 'Starter',
    price: '$49',
    per: '/month',
    fit: 'For solo creators and small teams.',
    lines: ['Track up to 5 competitors', 'Basic performance metrics', '7 days of history', 'Email support'],
    cta: 'Start a free trial',
    href: '/signup?plan=starter',
    plan: 'var(--yellow)',
    deep: 'var(--yellow-deep)',
  },
  {
    name: 'Pro',
    price: '$99',
    per: '/month',
    fit: 'For growing media companies and agencies.',
    lines: ['Track up to 25 competitors', 'Advanced metrics and trending', '90 days of history', 'CSV exports', 'Priority support'],
    cta: 'Start a free trial',
    href: '/signup?plan=pro',
    plan: 'var(--pink)',
    deep: 'var(--pink-deep)',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    per: '',
    fit: 'For large organisations with custom needs.',
    lines: ['Unlimited competitors', 'API access', 'Unlimited history', 'Custom reporting', 'A dedicated success manager'],
    cta: 'Talk to us',
    href: 'mailto:hello@vidmetrics.io?subject=VidMetrics%20Enterprise&body=Hi%2C%20we%27d%20like%20to%20track%20about%20___%20channels.',
    plan: 'var(--cyan)',
    deep: 'var(--cyan-deep)',
  },
];

export default function Pricing() {
  return (
    <section
      className="lp-field lp-grid lp-pricing"
      id="pricing"
      aria-labelledby="pricing-title"
      data-chapter-bg="var(--ink)"
      data-chapter-ink="var(--paper)"
    >
      <h2 id="pricing-title" className="lp-head" data-reveal>
        Priced per rival
      </h2>
      {PLANS.map((p, i) => (
        <article
          key={p.name}
          className="lp-plan"
          style={{ ['--plan' as string]: p.plan, ['--plan-deep' as string]: p.deep, ['--i' as string]: i }}
          data-reveal
        >
          <div className="lp-plan__body">
            <h3 className="lp-lead">{p.name}</h3>
            <p className="lp-plan__price num">
              {p.price}
              {p.per && <small>{p.per}</small>}
            </p>
            <p className="lp-small" style={{ fontWeight: 600, marginBottom: 10 }}>{p.fit}</p>
            <ul>
              {p.lines.map(l => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          {p.href.startsWith('mailto:') ? (
            <a className="lp-plan__cta" href={p.href}>{p.cta}</a>
          ) : (
            <Link className="lp-plan__cta" href={p.href}>{p.cta}</Link>
          )}
        </article>
      ))}
    </section>
  );
}

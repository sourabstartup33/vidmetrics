const QUESTIONS = [
  {
    q: 'Where does the data come from?',
    a: 'From the YouTube Data API: the public numbers anyone can see on a channel page. Views, likes, comments, upload dates and video lengths.',
  },
  {
    q: 'Can it see watch time or revenue?',
    a: 'No. Watch time, retention and revenue live in the channel owner’s YouTube Studio and are never public. VidMetrics works with what a competitor can’t hide.',
  },
  {
    q: 'Which videos does it read?',
    a: 'The latest 20 uploads for the table and charts, and the latest 50 for posting patterns. Change the time range and it reads up to 50 videos from that window.',
  },
  {
    q: 'How is the trending score worked out?',
    a: 'Engagement earns up to 65 points, an upload from the last 30 days earns 20, and beating the channel’s average views earns 15. The score tops out at 100. You can try it above.',
  },
  {
    q: 'How fresh are the numbers?',
    a: 'Each channel is fetched live the first time you open it, then kept in your browser for six hours, so reopening a brief costs nothing against the daily API quota.',
  },
  {
    q: 'What does the AI summary do?',
    a: 'It sends Google’s Gemini model the computed figures (average views, average engagement, the top video and the signals in the brief) and asks for three short points: their core engine, their blind spot and your best move.',
  },
  {
    q: 'Can I export it?',
    a: 'Yes. The video table downloads as a CSV with each video’s title, link, date, views, likes, comments, engagement rate and trending score.',
  },
  {
    q: 'Do I need to connect a YouTube account?',
    a: 'No. You paste a public channel link, so there is nothing to connect or authorise.',
  },
];

export default function Faq() {
  return (
    <section
      className="lp-field lp-grid lp-faq"
      id="questions"
      aria-labelledby="faq-title"
      data-chapter-bg="var(--white)"
      data-chapter-ink="var(--ink)"
    >
      <h2 id="faq-title" className="lp-head" data-reveal>
        Fair questions
      </h2>
      <div className="lp-faq__list">
        {QUESTIONS.map((item, i) => (
          <details key={item.q} name="faq" open={i === 0} data-reveal style={{ ['--i' as string]: i }}>
            <summary>
              {item.q}
              <span className="lp-plus" aria-hidden="true" />
            </summary>
            <p className="lp-body">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

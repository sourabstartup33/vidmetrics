export default function SocialProofSection() {
  const testimonials = [
    {
      quote: "VidMetrics completely changed how we program our content. We now know exactly what thumbnails and topics are working in our niche before we even shoot.",
      name: "Sarah Jenkins",
      role: "Head of Content",
      company: "CreatorMedia"
    },
    {
      quote: "The trending detection alone has paid for the software 100x over. We caught a trend 3 days before our competitors and did 5M views.",
      name: "Marcus Chen",
      role: "YouTube Strategist",
      company: "ViralLabs"
    },
    {
      quote: "Finally, a tool built for enterprise teams. The export features save my analysts 10 hours a week in manual data entry.",
      name: "Elena Rodriguez",
      role: "VP of Marketing",
      company: "BrandScale"
    }
  ];

  return (
    <section className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-gradient tracking-tighter">Trusted by top teams</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {testimonials.map((t, i) => (
            <div key={i} className="p-8 bg-[#0A0A0A] rounded-2xl border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors">
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed">&quot;{t.quote}&quot;</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt={t.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <p className="font-medium text-zinc-200 text-sm">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.role}, {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale">
          {['Acme Corp', 'GlobalTech', 'MediaFlow', 'CreatorInc', 'ViralBrand'].map((logo, i) => (
            <div key={i} className="text-zinc-400 font-bold text-xl tracking-tight">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

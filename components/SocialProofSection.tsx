'use client';

import { motion } from 'motion/react';

export default function SocialProofSection() {
  // Real findings from the sample brief on the demo channel, not testimonials
  const findings = [
    {
      finding: "Their top upload, “I Spent 7 Days Buried Alive”, has 2.2× their average views.",
      section: 'What’s working',
    },
    {
      finding: "8 of their 10 most viewed titles open with a number or a dollar amount.",
      section: 'Winning hook',
    },
    {
      finding: "Videos over 15 minutes average 16% more views than their shorter uploads.",
      section: 'Winning format',
    },
  ];

  return (
    <section className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gradient tracking-tighter mb-4">What a brief tells you.</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">Three findings from the sample brief on @MrBeast, built from public data.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {findings.map((f, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
              className="p-8 bg-[#0A0A0A] rounded-2xl border border-white/5 flex flex-col justify-between gap-8 hover:border-white/10 transition-colors"
            >
              <p className="text-zinc-200 text-lg leading-relaxed">{f.finding}</p>
              <p className="text-sm text-zinc-400">{f.section} · Intelligence Brief</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

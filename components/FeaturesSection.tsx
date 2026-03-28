'use client';

import { Target, BarChart2, Flame, Download, Filter, Zap } from 'lucide-react';
import { motion } from 'motion/react';

const features = [
  {
    icon: Target,
    title: "Competitor Tracking",
    description: "Monitor any public YouTube channel in real time with millisecond precision."
  },
  {
    icon: BarChart2,
    title: "Performance Metrics",
    description: "Views, likes, engagement rate, and trending score per video."
  },
  {
    icon: Flame,
    title: "Trending Detection",
    description: "Surface what's going viral before your team misses the wave."
  },
  {
    icon: Download,
    title: "Export & Reports",
    description: "One-click CSV export for your weekly reporting workflow."
  },
  {
    icon: Filter,
    title: "Deep Filtering",
    description: "Filter by date, views, engagement, and content type."
  },
  {
    icon: Zap,
    title: "Real-time Data",
    description: "YouTube API powered, always up to date and ready when you need it."
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-32 bg-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gradient tracking-tighter mb-4">Built for modern teams.</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">Everything you need to outperform the competition, wrapped in an interface you'll actually want to use.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ 
                  y: -2,
                  borderColor: 'rgba(99,102,241,0.4)'
                }}
                transition={{ 
                  duration: 0.5, 
                  ease: [0.16, 1, 0.3, 1],
                  delay: index * 0.05,
                  // We also override hover duration
                  y: { duration: 0.2 },
                  borderColor: { duration: 0.2 }
                }}
                className="group relative p-8 rounded-2xl bg-[#0A0A0A] border border-white/5 transition-colors overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <Icon className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors" />
                  </motion.div>
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2 tracking-tight">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-sm">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

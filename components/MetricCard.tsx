'use client';

import { motion, useSpring, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';

interface MetricCardProps {
  title: string;
  value: string; // e.g., "342.0M", "45.2B", "847"
}

export default function MetricCard({ title, value }: MetricCardProps) {
  const [numericValue, setNumericValue] = useState(0);
  const [suffix, setSuffix] = useState('');

  useEffect(() => {
    // Parse the string into a number and its suffix (like 'M', 'B', 'K')
    const match = value.match(/([\d.]+)(.*)/);
    if (match) {
      setNumericValue(parseFloat(match[1]));
      setSuffix(match[2]);
    } else {
      setNumericValue(0);
      setSuffix('');
    }
  }, [value]);

  const spring = useSpring(0, { bounce: 0, duration: 2000 });
  
  useEffect(() => {
    spring.set(numericValue);
  }, [numericValue, spring]);

  const displayValue = useTransform(spring, (current) => {
    // If the original value had a decimal (like 342.0), format it with 1 decimal place
    // Otherwise, round it to whole numbers (like 847)
    const hasDecimal = value.includes('.');
    return (hasDecimal ? current.toFixed(1) : Math.round(current).toString()) + suffix;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative group bg-[#0A0A0A] px-5 py-4 rounded-xl border border-white/5 border-l-4 border-l-indigo-500 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 overflow-hidden"
    >
      {/* Subtle hover background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1.5 relative z-10">{title}</p>
      <motion.p className="text-2xl sm:text-3xl font-bold text-white tracking-tight relative z-10">
        {displayValue}
      </motion.p>
    </motion.div>
  );
}

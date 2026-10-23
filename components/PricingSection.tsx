'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

export default function PricingSection() {
  return (
    <section id="pricing" className="py-32 bg-black relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gradient tracking-tighter mb-4">Pricing that scales.</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">Start for free, upgrade when you need more power.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0, y: { duration: 0.2 } }}
            className="bg-[#0A0A0A] rounded-2xl border border-white/5 p-8 flex flex-col"
          >
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">Starter</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$49</span>
              <span className="text-zinc-500">/mo</span>
            </div>
            <p className="text-zinc-400 mb-8 text-sm">Perfect for solo creators and small teams.</p>
            <Link href="/signup" className="w-full py-2.5 px-4 bg-white/5 text-white font-medium rounded-lg hover:bg-white/10 transition-colors text-center mb-8 border border-white/10">
              Start Free Trial
            </Link>
            <ul className="space-y-4 flex-1">
              {['Track up to 5 competitors', 'Basic performance metrics', '7-day data history', 'Email support'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-400 text-sm">
                  <Check className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Pro */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.075, y: { duration: 0.2 } }}
            className="bg-[#0A0A0A] rounded-2xl border border-indigo-500/30 p-8 flex flex-col relative animate-border-glow"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-3 py-0.5 rounded-full text-xs font-semibold tracking-wide">
              Most Popular
            </div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">Pro</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$99</span>
              <span className="text-zinc-500">/mo</span>
            </div>
            <p className="text-zinc-400 mb-8 text-sm">For growing media companies and agencies.</p>
            <Link href="/signup" className="w-full py-2.5 px-4 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors text-center mb-8">
              Start Free Trial
            </Link>
            <ul className="space-y-4 flex-1">
              {['Track up to 25 competitors', 'Advanced metrics & trending', '90-day data history', 'CSV Exports', 'Priority support'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-400 text-sm">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Enterprise */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15, y: { duration: 0.2 } }}
            className="bg-[#0A0A0A] rounded-2xl border border-white/5 p-8 flex flex-col"
          >
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">Enterprise</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">Custom</span>
            </div>
            <p className="text-zinc-400 mb-8 text-sm">For large organizations with custom needs.</p>
            <Link href="/signup" className="w-full py-2.5 px-4 bg-white/5 text-white font-medium rounded-lg hover:bg-white/10 transition-colors text-center mb-8 border border-white/10">
              Contact Sales
            </Link>
            <ul className="space-y-4 flex-1">
              {['Unlimited competitors', 'API Access', 'Unlimited data history', 'Custom reporting', 'Dedicated success manager'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-400 text-sm">
                  <Check className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

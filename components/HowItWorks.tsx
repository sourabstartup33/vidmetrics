import { Link2, BarChart3, Trophy } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-black border-y border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-gradient tracking-tighter">From URL to insights in seconds.</h2>
        </div>
        
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-white/10">
            <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#0A0A0A] rounded-2xl border border-white/10 flex items-center justify-center mb-6 shadow-xl relative group hover:border-white/20 transition-colors">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-black border border-white/10 text-white rounded-full flex items-center justify-center font-medium text-sm">1</div>
                <Link2 className="w-8 h-8 text-zinc-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">Paste Channel URL</h3>
              <p className="text-zinc-400 text-sm">Simply drop in any public YouTube channel link.</p>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#0A0A0A] rounded-2xl border border-white/10 flex items-center justify-center mb-6 shadow-xl relative group hover:border-white/20 transition-colors">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-black border border-white/10 text-white rounded-full flex items-center justify-center font-medium text-sm">2</div>
                <BarChart3 className="w-8 h-8 text-zinc-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">We Fetch & Analyze</h3>
              <p className="text-zinc-400 text-sm">Our engine processes their entire video history.</p>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#0A0A0A] rounded-2xl border border-indigo-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative group">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl"></div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-medium text-sm shadow-lg">3</div>
                <Trophy className="w-8 h-8 text-indigo-400 relative z-10" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">See What's Winning</h3>
              <p className="text-zinc-400 text-sm">Instantly surface their top performing content.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

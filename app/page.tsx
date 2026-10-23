import ChapterHeader from '@/components/landing/ChapterHeader';
import Hero from '@/components/landing/Hero';
import BriefShowcase from '@/components/landing/BriefShowcase';
import ScoreLab from '@/components/landing/ScoreLab';
import HowItRuns from '@/components/landing/HowItRuns';
import Pricing from '@/components/landing/Pricing';
import Faq from '@/components/landing/Faq';
import StartCta from '@/components/landing/StartCta';
import SiteFooter from '@/components/landing/SiteFooter';
import LandingMotion from '@/components/landing/LandingMotion';
import { buildSampleBrief } from '@/lib/sampleBrief';

// The page is a brief on one competitor: each chapter is one of its answers.
export default function LandingPage() {
  const brief = buildSampleBrief();

  return (
    <div className="lp">
      {/* Gate the entrances before first paint, so nothing flashes or stays hidden without script */}
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      <ChapterHeader />
      <main>
        <Hero />
        <BriefShowcase brief={brief} />
        <ScoreLab avgViews={brief.avgViews} asOf={brief.asOf} />
        <HowItRuns brief={brief} />
        <Pricing />
        <Faq />
        <StartCta />
      </main>
      <SiteFooter />
      <LandingMotion />
    </div>
  );
}

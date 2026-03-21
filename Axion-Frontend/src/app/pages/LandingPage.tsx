import { Hero } from '../components/Hero';
import { CoreFoundation } from '../components/CoreFoundation';
import { FleetAnalytics } from '../components/FleetAnalytics';
import { PredictiveAI } from '../components/PredictiveAI';
import { LoadTest } from '../components/LoadTest';
import { RBACSection } from '../components/RBACSection';
import { TerminalFooter } from '../components/TerminalFooter';

interface LandingPageProps {
  onGetStarted: () => void;
  onViewArchitecture: () => void;
}

export function LandingPage({ onGetStarted, onViewArchitecture }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-black font-[var(--font-outfit)]">
      <Hero onGetStarted={onGetStarted} onViewArchitecture={onViewArchitecture} />
      <CoreFoundation />
      <FleetAnalytics />
      <PredictiveAI />
      <LoadTest />
      <RBACSection />
      <TerminalFooter onGetStarted={onGetStarted} />
    </div>
  );
}

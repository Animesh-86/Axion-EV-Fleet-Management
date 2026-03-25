import { useNavigate } from 'react-router';
import { Hero } from '../components/Hero';
import { CoreFoundation } from '../components/CoreFoundation';
import { FleetAnalytics } from '../components/FleetAnalytics';
import { PredictiveAI } from '../components/PredictiveAI';
import { LoadTest } from '../components/LoadTest';
import { RBACSection } from '../components/RBACSection';
import { TerminalFooter } from '../components/TerminalFooter';

export function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => navigate('/login');
  const handleViewArchitecture = () => navigate('/architecture');

  return (
    <div className="min-h-screen bg-black font-[var(--font-outfit)]">
      <Hero onGetStarted={handleGetStarted} onViewArchitecture={handleViewArchitecture} />
      <CoreFoundation />
      <FleetAnalytics />
      <PredictiveAI />
      <LoadTest />
      <RBACSection />
      <TerminalFooter onGetStarted={handleGetStarted} />
    </div>
  );
}

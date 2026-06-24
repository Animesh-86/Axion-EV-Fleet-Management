import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth';
import { paths } from '../../constants/navigation';
import { Hero } from '../components/Hero';
import { CoreFoundation } from '../components/CoreFoundation';
import { FleetAnalytics } from '../components/FleetAnalytics';
import { PredictiveAI } from '../components/PredictiveAI';
import { LoadTest } from '../components/LoadTest';
import { RBACSection } from '../components/RBACSection';
import { TerminalFooter } from '../components/TerminalFooter';

export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const onGetStarted = () => {
    navigate(paths.dashboard);
  };

  const onViewArchitecture = () => navigate(paths.architecture);

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

import { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import TutorialOverlay from '@/components/TutorialOverlay';
import LearningProgress from '@/components/LearningProgress';
import { useGame } from '@/lib/GameContext';

export default function Home() {
  const { tutorialCompleted, completeTutorial } = useGame();
  const [showTutorial, setShowTutorial] = useState(!tutorialCompleted);

  const handleCompleteTutorial = () => {
    completeTutorial();
    setShowTutorial(false);
  };

  return (
    <>
      {showTutorial && <TutorialOverlay onComplete={handleCompleteTutorial} />}
      
      <main className="flex-1">
        <LearningProgress />
        <HeroSection onStartTutorial={() => setShowTutorial(true)} />
      </main>
    </>
  );
}

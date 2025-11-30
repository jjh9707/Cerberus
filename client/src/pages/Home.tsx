import { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import TutorialOverlay from '@/components/TutorialOverlay';
import LearningModuleModal from '@/components/LearningModuleModal';
import LearningProgress from '@/components/LearningProgress';
import { useGame } from '@/lib/GameContext';

export default function Home() {
  const { tutorialCompleted, completeTutorial } = useGame();
  const [showTutorial, setShowTutorial] = useState(!tutorialCompleted);
  const [showLearningModal, setShowLearningModal] = useState(false);

  const handleCompleteTutorial = () => {
    completeTutorial();
    setShowTutorial(false);
  };

  return (
    <>
      {showTutorial && <TutorialOverlay onComplete={handleCompleteTutorial} />}
      <LearningModuleModal open={showLearningModal} onOpenChange={setShowLearningModal} />
      
      <main className="flex-1">
        <LearningProgress />
        <HeroSection 
          onStartTutorial={() => setShowTutorial(true)} 
          onOpenLearning={() => setShowLearningModal(true)}
        />
      </main>
    </>
  );
}

import { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import ModuleCard, { MODULES } from '@/components/ModuleCard';
import TutorialOverlay from '@/components/TutorialOverlay';
import { useGame } from '@/lib/GameContext';
import { useLocation } from 'wouter';

export default function Home() {
  const [, setLocation] = useLocation();
  const { tutorialCompleted, completeTutorial, getModuleProgress } = useGame();
  const [showTutorial, setShowTutorial] = useState(!tutorialCompleted);

  const handleCompleteTutorial = () => {
    completeTutorial();
    setShowTutorial(false);
  };

  return (
    <>
      {showTutorial && <TutorialOverlay onComplete={handleCompleteTutorial} />}
      
      <main className="flex-1">
        <HeroSection onStartTutorial={() => setShowTutorial(true)} />
        
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold">학습 모듈 선택하기</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                각 모듈에서 다양한 사기 유형과 안전 수칙을 배우고 실전 문제를 풀어보세요.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {MODULES.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  progress={getModuleProgress(module.id)}
                  onClick={() => setLocation(`/learn/${module.id}`)}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

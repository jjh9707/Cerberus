import { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import ModuleCard, { MODULES } from '@/components/ModuleCard';
import TutorialOverlay from '@/components/TutorialOverlay';
import { useGame } from '@/lib/GameContext';
import { getQuestionsByCategory } from '@/lib/gameState';
import { useLocation } from 'wouter';

export default function Home() {
  const [, setLocation] = useLocation();
  const { tutorialCompleted, completeTutorial, answeredQuestions } = useGame();
  const [showTutorial, setShowTutorial] = useState(!tutorialCompleted);

  const handleCompleteTutorial = () => {
    completeTutorial();
    setShowTutorial(false);
  };

  const getCompletedCount = (moduleId: string) => {
    const moduleQuestions = getQuestionsByCategory(moduleId);
    return moduleQuestions.filter(q => answeredQuestions.includes(q.id)).length;
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
                각 모듈에서 다양한 사기 유형을 배우고 실전 문제를 풀어보세요.
                틀리면 가상 돈이 차감되니 조심하세요!
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {MODULES.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  completedCount={getCompletedCount(module.id)}
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

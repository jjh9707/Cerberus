import ModuleCard, { MODULES } from '@/components/ModuleCard';
import { useGame } from '@/lib/GameContext';
import { useLocation } from 'wouter';

export default function Learn() {
  const [, setLocation] = useLocation();
  const { getModuleProgress } = useGame();

  return (
    <main className="flex-1 py-8 lg:py-12">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold">학습 모듈</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            배우고 싶은 모듈을 선택하세요. 각 모듈에서 실제 사기 사례를 바탕으로 한 문제를 풀어볼 수 있어요.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
    </main>
  );
}

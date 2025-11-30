import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { MODULES } from "@/components/ModuleCard";
import { useGame } from "@/lib/GameContext";
import { useLocation } from "wouter";

export default function LearningProgress() {
  const [, setLocation] = useLocation();
  const { currentModule, getModuleProgress } = useGame();

  const currentModuleInfo = currentModule 
    ? MODULES.find(m => m.id === currentModule)
    : null;

  const completedModules = MODULES.filter(m => getModuleProgress(m.id)?.completed).length;
  const totalModules = MODULES.length;

  if (!currentModuleInfo && completedModules === 0) {
    return null;
  }

  return (
    <section className="py-4 border-b bg-muted/30">
      <div className="container mx-auto px-4">
        <Card className="border-primary/20 bg-card/80">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">학습 진행률</span>
                    <Badge variant="secondary" className="text-xs">
                      {completedModules}/{totalModules} 완료
                    </Badge>
                  </div>
                  {currentModuleInfo ? (
                    <p className="font-medium mt-0.5">
                      현재 학습 중: <span className="text-primary">{currentModuleInfo.title}</span>
                    </p>
                  ) : (
                    <p className="font-medium mt-0.5 text-muted-foreground">
                      {completedModules === totalModules ? (
                        <span className="flex items-center gap-1 text-success">
                          <CheckCircle2 className="w-4 h-4" />
                          모든 모듈 완료!
                        </span>
                      ) : (
                        "학습을 시작해보세요"
                      )}
                    </p>
                  )}
                </div>
              </div>

              {currentModuleInfo && (
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => setLocation(`/learn/${currentModuleInfo.id}`)}
                  data-testid="button-continue-learning"
                >
                  이어서 학습하기
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="mt-4 w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(completedModules / totalModules) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

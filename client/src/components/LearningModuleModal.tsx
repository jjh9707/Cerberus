import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MODULES } from "@/components/ModuleCard";
import { useGame } from "@/lib/GameContext";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface LearningModuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LearningModuleModal({ open, onOpenChange }: LearningModuleModalProps) {
  const [, setLocation] = useLocation();
  const { getModuleProgress } = useGame();

  const handleModuleSelect = (moduleId: string) => {
    onOpenChange(false);
    setLocation(`/learn/${moduleId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            학습 모듈 선택
          </DialogTitle>
          <p className="text-muted-foreground text-center pt-2">
            배우고 싶은 주제를 선택하세요
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          {MODULES.map((module) => {
            const Icon = module.icon;
            const progress = getModuleProgress(module.id);
            const isCompleted = progress?.completed ?? false;
            const correctCount = progress?.correctAnswers ?? 0;

            return (
              <div
                key={module.id}
                className={cn(
                  "relative p-4 rounded-xl border-2 cursor-pointer transition-all hover-elevate active-elevate-2",
                  isCompleted ? "border-success/50 bg-success/5" : "border-border"
                )}
                style={{ borderColor: isCompleted ? undefined : `${module.color}30` }}
                onClick={() => handleModuleSelect(module.id)}
                data-testid={`modal-module-${module.id}`}
              >
                {isCompleted && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: module.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-1">{module.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {module.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {module.questionCount}문제
                      </Badge>
                      {isCompleted && (
                        <Badge variant="default" className="bg-success text-xs">
                          {correctCount}/{module.questionCount} 정답
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-4 gap-2"
                  size="sm"
                  data-testid={`modal-button-start-${module.id}`}
                >
                  {isCompleted ? "다시 도전하기" : "시작하기"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

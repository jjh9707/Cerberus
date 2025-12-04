import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Smartphone,
  Gamepad2,
  Shuffle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type ModuleProgress } from "@/lib/gameState";

export interface ModuleInfo {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  questionCount: number;
}

interface ModuleCardProps {
  module: ModuleInfo;
  progress?: ModuleProgress | null;
  completedCount?: number;
  onClick: () => void;
}

export const MODULES: ModuleInfo[] = [
  {
    id: "safety",
    title: "안전 지키기",
    description: "유괴 예방과 그루밍(온라인 유인)을 알아보고 스스로를 지켜요!",
    icon: ShieldAlert,
    color: "#c25757",
    questionCount: 15,
  },
  {
    id: "scam",
    title: "사기 피하기",
    description: "게임 아이템 사기와 도박의 위험성을 배워요!",
    icon: Gamepad2,
    color: "#d4864a",
    questionCount: 15,
  },
  {
    id: "digital",
    title: "디지털 안전",
    description: "스미싱과 SNS 사칭을 구별하는 방법을 배워요!",
    icon: Smartphone,
    color: "#357051",
    questionCount: 15,
  },
  {
    id: "practice",
    title: "실전 테스트",
    description: "모든 모듈의 문제를 랜덤으로 풀어보세요!",
    icon: Shuffle,
    color: "#35706E",
    questionCount: 20,
  },
];

export default function ModuleCard({
  module,
  progress,
  onClick,
}: ModuleCardProps) {
  const Icon = module.icon;
  const isCompleted = progress?.completed ?? false;
  const correctCount = progress?.correctAnswers ?? 0;
  const progressPercent = isCompleted
    ? Math.round((correctCount / module.questionCount) * 100)
    : 0;

  return (
    <Card
      className={cn(
        "overflow-visible hover-elevate active-elevate-2 cursor-pointer transition-all h-full",
        isCompleted && "ring-2 ring-success",
      )}
      onClick={onClick}
      data-testid={`module-card-${module.id}`}
    >
      <CardContent className="p-6 h-full">
        <div className="flex flex-col items-center text-center gap-4 h-full">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white"
              style={{ backgroundColor: module.color }}
            >
              <Icon className="w-8 h-8" />
            </div>
            {isCompleted && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-success-foreground" />
              </div>
            )}
          </div>

          <div className="space-y-2 flex-1">
            <h3 className="text-xl font-bold">{module.title}</h3>
            <p className="text-muted-foreground text-sm">
              {module.description}
            </p>
          </div>

          <div className="w-full space-y-2">
            <div className="flex justify-between items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {isCompleted ? "정답률" : "미완료"}
              </span>
              {isCompleted ? (
                <Badge variant="default" className="bg-success">
                  {correctCount}/{module.questionCount} ({progressPercent}%)
                </Badge>
              ) : (
                <Badge variant="secondary">{module.questionCount}문제</Badge>
              )}
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  isCompleted ? "bg-success" : "bg-muted-foreground/30",
                )}
                style={{ width: isCompleted ? `${progressPercent}%` : "0%" }}
              />
            </div>
          </div>

          <Button
            className="w-full gap-2 mt-auto"
            data-testid={`button-start-${module.id}`}
          >
            {isCompleted ? "다시 도전하기" : "시작하기"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

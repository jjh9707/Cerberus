import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, type LucideIcon, Coins, Clock, AlertTriangle, Play, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurrentProgress {
  currentQuestion: number;
  totalQuestions: number;
  money: number;
  correctAnswers: number;
}

interface ModuleIntroProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  tips: string[];
  questionCount: number;
  onStart: () => void;
  onContinue?: () => void;
  currentProgress?: CurrentProgress;
  onBack: () => void;
}

export default function ModuleIntro({
  title,
  description,
  icon: Icon,
  color,
  tips,
  questionCount,
  onStart,
  onContinue,
  currentProgress,
  onBack,
}: ModuleIntroProps) {
  const hasProgress = currentProgress && onContinue;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <Button 
        variant="ghost" 
        className="gap-2" 
        onClick={onBack}
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4" />
        돌아가기
      </Button>

      <Card>
        <CardContent className="p-8 space-y-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className={cn(
              'w-20 h-20 rounded-2xl flex items-center justify-center text-white',
              color
            )}>
              <Icon className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
            </div>
          </div>

          {hasProgress && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" />
                  <span className="font-semibold">진행 중인 학습이 있어요!</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 rounded-lg bg-background">
                    <p className="text-xs text-muted-foreground">현재 문제</p>
                    <p className="font-bold">{currentProgress.currentQuestion}/{currentProgress.totalQuestions}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-background">
                    <p className="text-xs text-muted-foreground">맞춘 문제</p>
                    <p className="font-bold text-success">{currentProgress.correctAnswers}문제</p>
                  </div>
                  <div className="p-2 rounded-lg bg-background">
                    <p className="text-xs text-muted-foreground">남은 금액</p>
                    <p className="font-bold text-warning">{currentProgress.money.toLocaleString()}원</p>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full gap-2" 
                  onClick={onContinue}
                  data-testid="button-continue-quiz"
                >
                  <Play className="w-5 h-5" />
                  이어서 학습하기
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center p-3 rounded-lg bg-muted">
              <Clock className="w-6 h-6 mx-auto mb-1 text-primary" />
              <div className="text-lg font-bold">{questionCount}문제</div>
              <div className="text-xs text-muted-foreground">총 문제 수</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <Coins className="w-6 h-6 mx-auto mb-1 text-warning" />
              <div className="text-lg font-bold">30초</div>
              <div className="text-xs text-muted-foreground">문제당 시간</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-destructive" />
              <div className="text-lg font-bold">최대 50,000원</div>
              <div className="text-xs text-muted-foreground">위험 차감</div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">알아두세요!</h3>
            <ul className="space-y-2">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <Button 
            size="lg" 
            className="w-full gap-2" 
            variant={hasProgress ? "outline" : "default"}
            onClick={onStart}
            data-testid="button-start-quiz"
          >
            {hasProgress ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                처음부터 다시 시작
              </>
            ) : (
              <>
                학습 시작하기
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

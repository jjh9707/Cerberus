import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Coins, AlertTriangle, ArrowRight, X } from 'lucide-react';

interface TutorialOverlayProps {
  onComplete: () => void;
}

interface Step {
  icon: typeof Shield;
  title: string;
  description: string;
  color: string;
}

const STEPS: Step[] = [
  {
    icon: Shield,
    title: '필터온에 오신 것을 환영해요!',
    description: '이곳에서 위험한 인터넷 메시지를 구별하는 방법을 배울 거예요. 게임처럼 재미있게 배워봐요!',
    color: 'text-primary',
  },
  {
    icon: Coins,
    title: '가상 머니 시스템',
    description: '처음에 100,000원을 가지고 시작해요. 위험한 메시지를 못 알아보면 돈이 줄어들어요! 실제로 사기를 당하면 이렇게 돈을 잃을 수 있다는 걸 기억하세요.',
    color: 'text-warning',
  },
  {
    icon: AlertTriangle,
    title: '메시지를 잘 살펴보세요',
    description: '각 문제에서 메시지가 안전한지 위험한지 판단해요. 30초 안에 답해야 해요! 위험도가 높을수록 틀리면 더 많은 돈을 잃어요.',
    color: 'text-destructive',
  },
];

export default function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 animate-fade-in-up">
        <CardContent className="p-8 text-center space-y-6">
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2"
            onClick={onComplete}
            data-testid="button-skip-tutorial"
          >
            <X className="w-5 h-5" />
          </Button>

          <div className={`w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center`}>
            <Icon className={`w-10 h-10 ${step.color}`} />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{step.description}</p>
          </div>

          <div className="flex justify-center gap-2">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <Button
            size="lg"
            className="w-full gap-2"
            onClick={() => {
              if (isLastStep) {
                onComplete();
              } else {
                setCurrentStep(prev => prev + 1);
              }
            }}
            data-testid="button-next-tutorial"
          >
            {isLastStep ? '시작하기' : '다음'}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

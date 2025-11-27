import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, ThumbsUp, Frown, AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface ResultScreenProps {
  finalMoney: number;
  onRestart: () => void;
}

type ResultTier = 'excellent' | 'good' | 'fair' | 'danger';

interface TierInfo {
  icon: typeof Trophy;
  title: string;
  message: string;
  color: string;
  bgColor: string;
}

const TIER_INFO: Record<ResultTier, TierInfo> = {
  excellent: {
    icon: Trophy,
    title: '훌륭해요!',
    message: '사이버 보안 전문가예요! 위험한 메시지를 잘 구별했어요.',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  good: {
    icon: ThumbsUp,
    title: '잘했어요!',
    message: '조금만 더 조심하면 완벽해요! 계속 연습해봐요.',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  fair: {
    icon: Frown,
    title: '아쉬워요!',
    message: '다시 도전해서 더 많이 지켜봐요! 연습하면 더 잘할 수 있어요.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  danger: {
    icon: AlertCircle,
    title: '위험해요!',
    message: '다시 배워서 꼭 돈을 지켜내요! 조심하지 않으면 실제로도 피해를 볼 수 있어요.',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
};

function getTier(money: number): ResultTier {
  if (money >= 80000) return 'excellent';
  if (money >= 50000) return 'good';
  if (money >= 20000) return 'fair';
  return 'danger';
}

export default function ResultScreen({ finalMoney, onRestart }: ResultScreenProps) {
  const tier = getTier(finalMoney);
  const { icon: Icon, title, message, color, bgColor } = TIER_INFO[tier];
  const savedPercentage = Math.round((finalMoney / 100000) * 100);

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 animate-fade-in-up">
      <Card className={cn('overflow-hidden', bgColor)}>
        <CardContent className="p-8 text-center space-y-6">
          <div className={cn('w-24 h-24 mx-auto rounded-full flex items-center justify-center', bgColor)}>
            <Icon className={cn('w-12 h-12', color)} />
          </div>

          <div className="space-y-2">
            <h2 className={cn('text-3xl font-bold', color)}>{title}</h2>
            <p className="text-muted-foreground">{message}</p>
          </div>

          <div className="py-6 space-y-2">
            <p className="text-muted-foreground">최종 금액</p>
            <p className={cn(
              'text-5xl font-black tabular-nums',
              tier === 'danger' ? 'text-destructive' : color
            )}>
              {finalMoney.toLocaleString('ko-KR')}원
            </p>
            <p className="text-sm text-muted-foreground">
              시작 금액의 {savedPercentage}%를 지켰어요
            </p>
          </div>

          <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full transition-all duration-1000',
                tier === 'excellent' && 'bg-yellow-500',
                tier === 'good' && 'bg-success',
                tier === 'fair' && 'bg-orange-500',
                tier === 'danger' && 'bg-destructive'
              )}
              style={{ width: `${savedPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          size="lg" 
          variant="outline"
          className="gap-2"
          onClick={onRestart}
          data-testid="button-restart"
        >
          <RotateCcw className="w-5 h-5" />
          다시 시작
        </Button>
        
        <Link href="/">
          <Button size="lg" className="w-full gap-2" data-testid="button-home">
            <Home className="w-5 h-5" />
            홈으로
          </Button>
        </Link>
      </div>
    </div>
  );
}

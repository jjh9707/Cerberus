import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skull, RotateCcw, Home } from 'lucide-react';
import { Link } from 'wouter';

interface BankruptScreenProps {
  onRestart: () => void;
}

export default function BankruptScreen({ onRestart }: BankruptScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-fade-in-up">
      <Card className="w-full max-w-md mx-4 bg-destructive/10 border-destructive">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-destructive/20 flex items-center justify-center animate-pulse-scale">
            <Skull className="w-12 h-12 text-destructive" />
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-black text-destructive">파산!</h2>
            <p className="text-xl font-semibold">모든 돈을 잃었어요</p>
          </div>

          <div className="py-4 space-y-3">
            <p className="text-muted-foreground leading-relaxed">
              위험한 메시지에 속아서 모든 돈을 잃었어요.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              실제로도 이런 사기에 속으면 큰 피해를 볼 수 있어요.
              <br />
              다시 도전해서 조심하는 법을 배워봐요!
            </p>
          </div>

          <div className="text-6xl font-black text-destructive tabular-nums">
            0원
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Link href="/">
              <Button 
                size="lg" 
                variant="outline"
                className="w-full gap-2"
                data-testid="button-home-bankrupt"
              >
                <Home className="w-5 h-5" />
                홈으로
              </Button>
            </Link>
            
            <Button 
              size="lg" 
              className="gap-2"
              onClick={onRestart}
              data-testid="button-restart-bankrupt"
            >
              <RotateCcw className="w-5 h-5" />
              다시 시작
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

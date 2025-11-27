import { Button } from '@/components/ui/button';
import { Shield, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

interface HeroSectionProps {
  onStartTutorial?: () => void;
}

export default function HeroSection({ onStartTutorial }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 lg:py-24">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">게임처럼 재미있게 배워요!</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-black leading-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                필터온
              </span>
              과 함께
              <br />
              안전한 인터넷 배우기
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              위험한 문자 메시지, SNS 사칭, 게임 아이템 사기를 알아보고
              <br className="hidden sm:block" />
              가상 돈으로 실제 피해를 체험해봐요!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/learn">
              <Button size="lg" className="gap-2 px-8 text-lg" data-testid="button-start-learning">
                학습 시작하기
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            {onStartTutorial && (
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 px-8 text-lg"
                onClick={onStartTutorial}
                data-testid="button-tutorial"
              >
                <Shield className="w-5 h-5" />
                튜토리얼 보기
              </Button>
            )}
          </div>

          <div className="pt-8 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl font-black text-primary">100,000원</div>
              <div className="text-sm text-muted-foreground">시작 금액</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-secondary">14+</div>
              <div className="text-sm text-muted-foreground">실전 문제</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-warning">3</div>
              <div className="text-sm text-muted-foreground">학습 모듈</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

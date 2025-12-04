import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Sparkles, BookOpen, Mic, MessageSquare } from 'lucide-react';
import { Link } from 'wouter';

interface HeroSectionProps {
  onStartTutorial?: () => void;
}

const mainActions = [
  {
    id: 'learn',
    title: '학습',
    description: '안전한 인터넷 사용법을 재미있게 배워요',
    icon: BookOpen,
    color: '#357051',
    href: '/learn',
  },
  {
    id: 'deepvoice',
    title: '딥보이스',
    description: 'AI 음성 복제의 위험성을 직접 체험해요',
    icon: Mic,
    color: '#35706E',
    href: '/deepvoice',
  },
  {
    id: 'feedback',
    title: '의견보내기',
    description: '필터온에 의견이나 제안을 보내주세요',
    icon: MessageSquare,
    color: '#377035',
    href: '/feedback',
  },
];

export default function HeroSection({ onStartTutorial }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 lg:py-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold">게임처럼 재미있게 배워요!</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-black leading-tight">
              <span style={{ color: '#357051' }}>
                필터온
              </span>
              과 함께
              <br />
              안전한 인터넷 배우기
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              위험한 문자 메시지, SNS 사칭, 게임 아이템 사기를 알아보고
              <br className="hidden sm:block" />
              유괴와 그루밍 예방까지 배워요!
            </p>
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {mainActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.id} href={action.href}>
                  <Card 
                    className="overflow-visible hover-elevate active-elevate-2 cursor-pointer transition-all h-full border-2"
                    style={{ borderColor: `${action.color}30` }}
                    data-testid={`card-action-${action.id}`}
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                        style={{ backgroundColor: action.color }}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-1">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

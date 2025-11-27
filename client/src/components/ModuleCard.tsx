import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MessageSquareWarning, Users, Gamepad2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  completedCount: number;
  onClick: () => void;
}

export const MODULES: ModuleInfo[] = [
  {
    id: 'smishing',
    title: '스미싱 알아보기',
    description: '이상한 문자 메시지를 구별하는 방법을 배워요!',
    icon: MessageSquareWarning,
    color: 'bg-blue-500',
    questionCount: 5,
  },
  {
    id: 'sns',
    title: 'SNS 사칭 조심하기',
    description: '가짜 친구 계정을 알아보는 방법을 배워요!',
    icon: Users,
    color: 'bg-green-500',
    questionCount: 4,
  },
  {
    id: 'game',
    title: '게임 아이템 사기 주의',
    description: '"무료 아이템" 광고의 함정을 배워요!',
    icon: Gamepad2,
    color: 'bg-orange-500',
    questionCount: 5,
  },
];

export default function ModuleCard({ module, completedCount, onClick }: ModuleCardProps) {
  const Icon = module.icon;
  const isCompleted = completedCount >= module.questionCount;
  const progress = Math.round((completedCount / module.questionCount) * 100);

  return (
    <Card 
      className={cn(
        'overflow-visible hover-elevate active-elevate-2 cursor-pointer transition-all',
        isCompleted && 'ring-2 ring-success'
      )}
      onClick={onClick}
      data-testid={`module-card-${module.id}`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center text-white',
            module.color
          )}>
            <Icon className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{module.title}</h3>
            <p className="text-muted-foreground text-sm">{module.description}</p>
          </div>

          <div className="w-full space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">진행도</span>
              <Badge variant={isCompleted ? 'default' : 'secondary'} className={isCompleted ? 'bg-success' : ''}>
                {completedCount}/{module.questionCount}
              </Badge>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full transition-all duration-500',
                  isCompleted ? 'bg-success' : 'bg-primary'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Button className="w-full gap-2" data-testid={`button-start-${module.id}`}>
            {isCompleted ? '다시 도전하기' : '시작하기'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

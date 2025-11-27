import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TimerBarProps {
  duration: number;
  isRunning: boolean;
  onTimeUp: () => void;
  className?: string;
}

export default function TimerBar({ duration, isRunning, onTimeUp, className }: TimerBarProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUp]);

  const percentage = (timeLeft / duration) * 100;
  const isLow = timeLeft <= 10;

  return (
    <div className={cn('w-full space-y-1', className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">남은 시간</span>
        <span className={cn(
          'font-bold tabular-nums',
          isLow ? 'text-destructive' : 'text-foreground'
        )}>
          {timeLeft}초
        </span>
      </div>
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            'h-full transition-all duration-1000 ease-linear rounded-full',
            isLow ? 'bg-destructive' : 'bg-primary'
          )}
          style={{ width: `${percentage}%` }}
          data-testid="timer-progress"
        />
      </div>
    </div>
  );
}

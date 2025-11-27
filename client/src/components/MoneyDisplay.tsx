import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MoneyDisplayProps {
  amount: number;
  moneyChange: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function MoneyDisplay({ 
  amount, 
  moneyChange, 
  size = 'md',
  className 
}: MoneyDisplayProps) {
  const sizeClasses = {
    sm: 'text-lg px-3 py-1.5',
    md: 'text-xl px-4 py-2',
    lg: 'text-2xl px-5 py-3',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div 
      className={cn(
        'relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 dark:from-amber-500 dark:to-orange-500 text-white font-bold shadow-lg',
        sizeClasses[size],
        moneyChange !== null && 'animate-shake',
        className
      )}
      data-testid="money-display"
    >
      <Coins className={cn(iconSizes[size], 'text-yellow-100')} />
      <span className="tabular-nums">
        {amount.toLocaleString('ko-KR')}원
      </span>
      
      {moneyChange !== null && (
        <span 
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-destructive font-bold text-lg animate-money-decrease whitespace-nowrap"
          data-testid="money-change"
        >
          {moneyChange.toLocaleString('ko-KR')}원
        </span>
      )}
    </div>
  );
}

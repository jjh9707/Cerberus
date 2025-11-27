import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { type RiskLevel, RISK_LABELS, RISK_DEDUCTIONS } from '@/lib/gameState';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: RiskLevel;
  showAmount?: boolean;
  className?: string;
}

export default function RiskBadge({ level, showAmount = true, className }: RiskBadgeProps) {
  const colorClasses: Record<RiskLevel, string> = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    very_high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'gap-1 border-0',
        colorClasses[level],
        className
      )}
      data-testid={`risk-badge-${level}`}
    >
      <AlertTriangle className="w-3 h-3" />
      <span>위험도: {RISK_LABELS[level]}</span>
      {showAmount && (
        <span className="font-bold">(-{RISK_DEDUCTIONS[level].toLocaleString()}원)</span>
      )}
    </Badge>
  );
}

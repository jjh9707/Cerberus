import { Shield, Home, BookOpen, Mic, Bug, Wallet, TrendingDown } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGame } from '@/lib/GameContext';

function MoneyDisplay() {
  const { money, moneyChange } = useGame();
  
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <div className="relative flex items-center gap-2" data-testid="money-display">
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300",
        money > 50000 
          ? "bg-success/10 border-success/30 text-success" 
          : money > 20000 
          ? "bg-warning/10 border-warning/30 text-warning"
          : "bg-destructive/10 border-destructive/30 text-destructive"
      )}>
        <Wallet className="w-4 h-4" />
        <span className="font-bold text-sm tabular-nums" data-testid="text-money-amount">
          {formatMoney(money)}원
        </span>
      </div>
      
      {moneyChange !== null && moneyChange < 0 && (
        <div 
          className="absolute -bottom-8 right-0 flex items-center gap-1 text-destructive animate-money-decrease"
          data-testid="text-money-change"
        >
          <TrendingDown className="w-4 h-4" />
          <span className="font-bold text-sm">
            {formatMoney(moneyChange)}원
          </span>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [location] = useLocation();

  const navItems = [
    { path: '/', label: '홈', icon: Home },
    { path: '/learn', label: '학습', icon: BookOpen },
    { path: '/deepvoice', label: '딥보이스', icon: Mic },
    { path: '/feedback', label: '의견보내기', icon: Bug },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1" data-testid="link-home">
          <Shield className="h-7 w-7" style={{ color: '#4ade80' }} />
          <span className="text-xl font-bold" style={{ color: '#16a34a' }}>
            필터온
          </span>
        </Link>

        <nav className="hidden md:flex items-center justify-center flex-1 gap-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} href={path}>
              <Button
                variant={location === path ? 'secondary' : 'ghost'}
                className={cn(
                  'gap-2 text-base px-5 py-2',
                  location === path && 'bg-primary/10 text-primary'
                )}
                data-testid={`nav-${label}`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Button>
            </Link>
          ))}
        </nav>
        
        <MoneyDisplay />
      </div>

      <nav className="md:hidden flex items-center justify-around border-t py-2 bg-background">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link key={path} href={path}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'flex-col gap-1 h-auto py-2',
                location === path && 'text-primary bg-primary/10'
              )}
              data-testid={`nav-mobile-${label}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Button>
          </Link>
        ))}
      </nav>
    </header>
  );
}

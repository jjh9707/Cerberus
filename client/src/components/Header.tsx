import { Shield, Home, BookOpen, Mic, Bug } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
          <Shield className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            필터온
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} href={path}>
              <Button
                variant={location === path ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'gap-2',
                  location === path && 'bg-primary/10 text-primary'
                )}
                data-testid={`nav-${label}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            </Link>
          ))}
        </nav>
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

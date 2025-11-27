import { Card } from '@/components/ui/card';
import { Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: string;
  sender: string;
  className?: string;
}

export default function MessageBubble({ message, sender, className }: MessageBubbleProps) {
  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <Card className="bg-card border-2 overflow-hidden">
        <div className="bg-muted px-4 py-3 flex items-center gap-2 border-b">
          <Smartphone className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">문자 메시지</span>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-lg">
                {sender.charAt(0)}
              </span>
            </div>
            <span className="font-medium text-sm">{sender}</span>
          </div>
          
          <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 ml-2">
            <p className="text-base leading-relaxed whitespace-pre-wrap" data-testid="message-content">
              {message}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle2, Send, Bug, MessageSquare, Lightbulb } from 'lucide-react';

type FeedbackType = 'bug' | 'suggestion' | 'general';

export default function Feedback() {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Feedback submitted:', { feedbackType, title, content, email });
    
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setFeedbackType('general');
    setTitle('');
    setContent('');
    setEmail('');
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <main className="flex-1 py-8 lg:py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">감사합니다!</h2>
                <p className="text-muted-foreground">
                  소중한 의견이 전달되었어요.<br />
                  더 좋은 서비스를 만들기 위해 노력할게요!
                </p>
              </div>
              <Button onClick={handleReset} className="gap-2">
                <MessageSquare className="w-4 h-4" />
                다른 의견 보내기
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 py-8 lg:py-12">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold">의견 보내기</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            필터온을 더 좋게 만들기 위한 여러분의 의견을 알려주세요!
          </p>
        </div>

        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>피드백 작성하기</CardTitle>
            <CardDescription>
              버그 신고, 개선 제안, 또는 일반적인 의견을 보내주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label>피드백 유형</Label>
                <RadioGroup 
                  value={feedbackType} 
                  onValueChange={(v) => setFeedbackType(v as FeedbackType)}
                  className="grid grid-cols-3 gap-3"
                >
                  <Label 
                    htmlFor="bug" 
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      feedbackType === 'bug' ? 'border-destructive bg-destructive/10' : 'border-muted hover:border-destructive/50'
                    }`}
                  >
                    <RadioGroupItem value="bug" id="bug" className="sr-only" />
                    <Bug className={`w-6 h-6 ${feedbackType === 'bug' ? 'text-destructive' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium">버그 신고</span>
                  </Label>
                  
                  <Label 
                    htmlFor="suggestion" 
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      feedbackType === 'suggestion' ? 'border-warning bg-warning/10' : 'border-muted hover:border-warning/50'
                    }`}
                  >
                    <RadioGroupItem value="suggestion" id="suggestion" className="sr-only" />
                    <Lightbulb className={`w-6 h-6 ${feedbackType === 'suggestion' ? 'text-warning' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium">개선 제안</span>
                  </Label>
                  
                  <Label 
                    htmlFor="general" 
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      feedbackType === 'general' ? 'border-primary bg-primary/10' : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="general" id="general" className="sr-only" />
                    <MessageSquare className={`w-6 h-6 ${feedbackType === 'general' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium">일반 의견</span>
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input 
                  id="title"
                  placeholder="피드백 제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea 
                  id="content"
                  placeholder={
                    feedbackType === 'bug' 
                      ? '어떤 문제가 발생했는지 자세히 알려주세요.' 
                      : feedbackType === 'suggestion'
                      ? '어떤 기능이 추가되면 좋을지 알려주세요.'
                      : '자유롭게 의견을 적어주세요.'
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일 (선택)</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="답변을 받으실 이메일 주소"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  입력하시면 피드백에 대한 답변을 보내드릴 수 있어요.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full gap-2"
                disabled={isSubmitting || !title.trim() || !content.trim()}
              >
                {isSubmitting ? (
                  '보내는 중...'
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    의견 보내기
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

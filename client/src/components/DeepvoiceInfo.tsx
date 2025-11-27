import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Volume2, ShieldCheck, AlertTriangle, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function DeepvoiceInfo() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
          <Mic className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-black">AI 딥보이스 기술이란?</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          AI가 사람의 목소리를 완벽하게 따라 할 수 있다는 걸 알고 있나요?
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <h3 className="text-xl font-bold">위험한 상황</h3>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <Volume2 className="w-5 h-5 mt-0.5 text-destructive shrink-0" />
                <span>AI가 부모님 목소리를 따라해서 "급하게 돈 보내줘"라고 할 수 있어요</span>
              </li>
              <li className="flex items-start gap-2">
                <Volume2 className="w-5 h-5 mt-0.5 text-destructive shrink-0" />
                <span>친구 목소리로 개인정보를 물어볼 수 있어요</span>
              </li>
              <li className="flex items-start gap-2">
                <Volume2 className="w-5 h-5 mt-0.5 text-destructive shrink-0" />
                <span>선생님이나 어른 목소리로 속일 수도 있어요</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-success" />
              <h3 className="text-xl font-bold">지키는 방법</h3>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-success text-success-foreground flex items-center justify-center text-sm shrink-0">1</span>
                <span>목소리만 믿지 말고, 직접 전화해서 확인하세요</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-success text-success-foreground flex items-center justify-center text-sm shrink-0">2</span>
                <span>급하게 돈을 요구하면 일단 의심하세요</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-success text-success-foreground flex items-center justify-center text-sm shrink-0">3</span>
                <span>가족만 아는 비밀 질문을 만들어두세요</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Mic className="w-8 h-8 text-primary animate-pulse-scale" />
            <div>
              <h3 className="text-xl font-bold">딥보이스 체험하기</h3>
              <p className="text-sm text-muted-foreground">AI가 목소리를 어떻게 따라하는지 직접 체험해보세요</p>
            </div>
          </div>
          <Button 
            size="lg" 
            className="w-full gap-2"
            onClick={() => alert('딥보이스 체험 기능은 곧 추가될 예정이에요!\n\n여러분의 목소리를 녹음해서 다른 문장을 말하는 것처럼 들려드릴 거예요!')}
            data-testid="button-deepvoice-demo"
          >
            <Mic className="w-5 h-5" />
            체험 시작하기 (준비 중)
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-muted border-2 border-dashed">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold flex items-center gap-2">
                안전 약속
              </h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>여러분의 목소리는 <strong className="text-foreground">절대 저장되지 않아요!</strong></li>
                <li>녹음된 목소리는 체험이 끝나면 바로 삭제되며, 서버에 전송되거나 보관되지 않습니다.</li>
                <li>필터온은 여러분의 개인정보를 소중히 지킵니다.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Link href="/">
          <Button variant="outline" size="lg" className="gap-2" data-testid="button-back-home">
            <ArrowLeft className="w-5 h-5" />
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}

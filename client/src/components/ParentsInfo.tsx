import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Shield, Brain, MessageSquare, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'wouter';

export default function ParentsInfo() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
          <Users className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-black">학부모를 위한 안내</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          필터온은 자녀들이 재미있게 사이버 보안을 배울 수 있도록 설계된 교육 플랫폼입니다.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            필터온의 교육 방식
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Shield className="w-6 h-6 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">가상 머니 시스템</h3>
                <p className="text-sm text-muted-foreground">
                  100,000원의 가상 돈으로 시작하여, 사기 메시지에 속으면 돈이 차감됩니다.
                  실제 금전 피해의 심각성을 안전하게 체험할 수 있습니다.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Brain className="w-6 h-6 text-secondary mt-0.5" />
              <div>
                <h3 className="font-semibold">실전 사례 학습</h3>
                <p className="text-sm text-muted-foreground">
                  실제로 발생하는 스미싱, SNS 사칭, 게임 아이템 사기 사례를 바탕으로
                  문제를 구성했습니다.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <MessageSquare className="w-6 h-6 text-warning mt-0.5" />
              <div>
                <h3 className="font-semibold">상세한 해설</h3>
                <p className="text-sm text-muted-foreground">
                  각 문제마다 왜 위험한지, 어떻게 대처해야 하는지 쉬운 말로 설명합니다.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <CheckCircle2 className="w-6 h-6 text-success mt-0.5" />
              <div>
                <h3 className="font-semibold">반복 학습</h3>
                <p className="text-sm text-muted-foreground">
                  언제든 다시 도전할 수 있어 자연스럽게 보안 의식이 습관화됩니다.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-bold">함께 해주세요</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm shrink-0">1</span>
              <span>자녀와 함께 문제를 풀어보며 대화를 나눠주세요.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm shrink-0">2</span>
              <span>실제로 이런 메시지를 받으면 어떻게 해야 하는지 알려주세요.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm shrink-0">3</span>
              <span>가족만의 비밀 암호를 정해두면 사칭 사기를 예방할 수 있습니다.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm shrink-0">4</span>
              <span>의심스러운 상황에서는 항상 부모님께 먼저 물어보도록 지도해주세요.</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-muted border-2 border-dashed">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-success shrink-0" />
            <div className="space-y-2">
              <h3 className="text-lg font-bold">안전한 학습 환경</h3>
              <p className="text-muted-foreground">
                필터온은 개인정보를 수집하지 않습니다. 학습 진행 상황은 로컬 저장소에만 저장되며,
                딥보이스 체험 기능은 녹음된 음성을 서버로 전송하거나 저장하지 않습니다.
                자녀가 안심하고 학습할 수 있는 환경을 제공합니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Link href="/">
          <Button variant="outline" size="lg" className="gap-2" data-testid="button-back-home-parents">
            <ArrowLeft className="w-5 h-5" />
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}

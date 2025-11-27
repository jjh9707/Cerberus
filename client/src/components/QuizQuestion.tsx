import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import MessageBubble from './MessageBubble';
import RiskBadge from './RiskBadge';
import TimerBar from './TimerBar';
import { type Question, RISK_DEDUCTIONS } from '@/lib/gameState';
import { playCorrectAnswerFeedback, playWrongAnswerFeedback } from '@/lib/sounds';
import { cn } from '@/lib/utils';

interface QuizQuestionProps {
  question: Question;
  onAnswer: (isCorrect: boolean, deduction: number) => void;
  onNext: () => void;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuizQuestion({
  question,
  onAnswer,
  onNext,
  questionNumber,
  totalQuestions,
}: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<'safe' | 'danger' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  const isCorrect = selectedAnswer === (question.isDangerous ? 'danger' : 'safe');
  const deduction = question.isDangerous ? RISK_DEDUCTIONS[question.riskLevel] : 0;

  const handleAnswer = useCallback((answer: 'safe' | 'danger') => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const correct = answer === (question.isDangerous ? 'danger' : 'safe');
    const lostMoney = !correct && question.isDangerous ? RISK_DEDUCTIONS[question.riskLevel] : 0;
    
    if (correct) {
      playCorrectAnswerFeedback();
    } else {
      playWrongAnswerFeedback();
    }
    
    onAnswer(correct, lostMoney);
  }, [isAnswered, question, onAnswer]);

  const handleTimeUp = useCallback(() => {
    if (!isAnswered) {
      handleAnswer('safe');
    }
  }, [isAnswered, handleAnswer]);

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTimerKey(prev => prev + 1);
    onNext();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-muted-foreground">
          문제 {questionNumber}/{totalQuestions}
        </span>
        <RiskBadge level={question.riskLevel} />
      </div>

      <TimerBar 
        key={timerKey}
        duration={30} 
        isRunning={!isAnswered} 
        onTimeUp={handleTimeUp}
      />

      <MessageBubble 
        message={question.message}
        sender={question.sender}
      />

      <div className="grid grid-cols-2 gap-4">
        <Button
          size="lg"
          variant="outline"
          className={cn(
            'h-16 text-lg gap-2 border-2',
            selectedAnswer === 'safe' && isCorrect && 'bg-success text-success-foreground border-success',
            selectedAnswer === 'safe' && !isCorrect && 'bg-destructive text-destructive-foreground border-destructive',
            !isAnswered && 'hover:bg-success/10 hover:border-success hover:text-success'
          )}
          onClick={() => handleAnswer('safe')}
          disabled={isAnswered}
          data-testid="button-safe"
        >
          <ShieldCheck className="w-6 h-6" />
          안전해요
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          className={cn(
            'h-16 text-lg gap-2 border-2',
            selectedAnswer === 'danger' && isCorrect && 'bg-success text-success-foreground border-success',
            selectedAnswer === 'danger' && !isCorrect && 'bg-destructive text-destructive-foreground border-destructive',
            !isAnswered && 'hover:bg-destructive/10 hover:border-destructive hover:text-destructive'
          )}
          onClick={() => handleAnswer('danger')}
          disabled={isAnswered}
          data-testid="button-danger"
        >
          <ShieldAlert className="w-6 h-6" />
          위험해요
        </Button>
      </div>

      {isAnswered && (
        <Card className={cn(
          'animate-fade-in-up border-l-4',
          isCorrect ? 'border-l-success bg-success/5' : 'border-l-destructive bg-destructive/5'
        )}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-success" />
                  <div>
                    <p className="text-xl font-bold text-success">잘 막았어요!</p>
                    <p className="text-muted-foreground">돈을 지켰어요!</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8 text-destructive" />
                  <div>
                    <p className="text-xl font-bold text-destructive">아쉬워요!</p>
                    {question.isDangerous && (
                      <p className="text-destructive font-semibold">
                        -{RISK_DEDUCTIONS[question.riskLevel].toLocaleString()}원 손해를 봤어요
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            
            <div className="bg-background rounded-lg p-4">
              <p className="text-base leading-relaxed">{question.explanation}</p>
            </div>

            <Button 
              className="w-full gap-2" 
              size="lg"
              onClick={handleNext}
              data-testid="button-next"
            >
              다음 문제
              <ArrowRight className="w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

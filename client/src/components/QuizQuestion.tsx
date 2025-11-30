import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, ArrowRight, Wallet, TrendingDown } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TimerBar from './TimerBar';
import { type Question, type OXQuestion, type ChoiceQuestion, RISK_DEDUCTIONS } from '@/lib/gameState';
import { playCorrectAnswerFeedback, playWrongAnswerFeedback } from '@/lib/sounds';
import { cn } from '@/lib/utils';

interface MoneyDisplayProps {
  money: number;
  moneyChange: number | null;
}

function QuizMoneyDisplay({ money, moneyChange }: MoneyDisplayProps) {
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <div className="relative flex items-center gap-2" data-testid="quiz-money-display">
      <div className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300",
        money > 50000 
          ? "bg-success/10 border-success/30 text-success" 
          : money > 20000 
          ? "bg-warning/10 border-warning/30 text-warning"
          : "bg-destructive/10 border-destructive/30 text-destructive"
      )}>
        <Wallet className="w-5 h-5" />
        <span className="font-bold text-lg tabular-nums" data-testid="text-quiz-money">
          {formatMoney(money)}원
        </span>
      </div>
      
      {moneyChange !== null && moneyChange < 0 && (
        <div 
          className="absolute -bottom-7 right-0 flex items-center gap-1 text-destructive animate-pulse"
          data-testid="text-quiz-money-change"
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

interface QuizQuestionProps {
  question: Question;
  currentMoney?: number;
  onAnswer: (isCorrect: boolean, deduction: number) => void;
  onNext: () => void;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuizQuestion({
  question,
  currentMoney = 100000,
  onAnswer,
  onNext,
  questionNumber,
  totalQuestions,
}: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [displayMoney, setDisplayMoney] = useState(currentMoney);
  const [moneyChange, setMoneyChange] = useState<number | null>(null);

  useEffect(() => {
    setDisplayMoney(currentMoney);
  }, [currentMoney]);

  useEffect(() => {
    if (moneyChange !== null) {
      const timer = setTimeout(() => setMoneyChange(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [moneyChange]);

  const isOXQuestion = question.type === 'ox';
  const oxQuestion = question as OXQuestion;
  const choiceQuestion = question as ChoiceQuestion;

  const getIsCorrect = (): boolean => {
    if (isOXQuestion) {
      return selectedAnswer === (oxQuestion.isDangerous ? 'danger' : 'safe');
    }
    return selectedAnswer === choiceQuestion.correctAnswer;
  };

  const isCorrect = getIsCorrect();

  const getDeduction = (): number => {
    if (isOXQuestion) {
      return oxQuestion.isDangerous ? RISK_DEDUCTIONS[question.riskLevel] : 0;
    }
    return RISK_DEDUCTIONS[question.riskLevel];
  };

  const handleOXAnswer = useCallback((answer: 'safe' | 'danger') => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const correct = answer === (oxQuestion.isDangerous ? 'danger' : 'safe');
    const lostMoney = !correct && oxQuestion.isDangerous ? RISK_DEDUCTIONS[question.riskLevel] : 0;
    
    if (correct) {
      playCorrectAnswerFeedback();
    } else {
      playWrongAnswerFeedback();
      if (lostMoney > 0) {
        setMoneyChange(-lostMoney);
        setDisplayMoney(prev => Math.max(0, prev - lostMoney));
      }
    }
    
    onAnswer(correct, lostMoney);
  }, [isAnswered, oxQuestion, question.riskLevel, onAnswer]);

  const handleChoiceAnswer = useCallback((answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    const correct = answerIndex === choiceQuestion.correctAnswer;
    const lostMoney = !correct ? RISK_DEDUCTIONS[question.riskLevel] : 0;
    
    if (correct) {
      playCorrectAnswerFeedback();
    } else {
      playWrongAnswerFeedback();
      if (lostMoney > 0) {
        setMoneyChange(-lostMoney);
        setDisplayMoney(prev => Math.max(0, prev - lostMoney));
      }
    }
    
    onAnswer(correct, lostMoney);
  }, [isAnswered, choiceQuestion, question.riskLevel, onAnswer]);

  const handleTimeUp = useCallback(() => {
    if (!isAnswered) {
      if (isOXQuestion) {
        handleOXAnswer('safe');
      } else {
        handleChoiceAnswer(-1);
      }
    }
  }, [isAnswered, isOXQuestion, handleOXAnswer, handleChoiceAnswer]);

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTimerKey(prev => prev + 1);
    onNext();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center pb-2">
        <span className="text-lg font-semibold text-muted-foreground">
          문제 {questionNumber}/{totalQuestions}
        </span>
        <QuizMoneyDisplay money={displayMoney} moneyChange={moneyChange} />
      </div>

      <TimerBar 
        key={timerKey}
        duration={30} 
        isRunning={!isAnswered} 
        onTimeUp={handleTimeUp}
      />

      {isOXQuestion ? (
        <MessageBubble 
          message={oxQuestion.message}
          sender={oxQuestion.sender}
        />
      ) : (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <p className="text-lg font-medium">{choiceQuestion.question}</p>
          </CardContent>
        </Card>
      )}

      {isOXQuestion ? (
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
            onClick={() => handleOXAnswer('safe')}
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
            onClick={() => handleOXAnswer('danger')}
            disabled={isAnswered}
            data-testid="button-danger"
          >
            <ShieldAlert className="w-6 h-6" />
            위험해요
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {choiceQuestion.choices.map((choice, index) => (
            <Button
              key={index}
              size="lg"
              variant="outline"
              className={cn(
                'h-auto min-h-14 text-left justify-start px-4 py-3 border-2 whitespace-normal',
                isAnswered && index === choiceQuestion.correctAnswer && 'bg-success text-success-foreground border-success',
                isAnswered && selectedAnswer === index && index !== choiceQuestion.correctAnswer && 'bg-destructive text-destructive-foreground border-destructive',
                !isAnswered && 'hover:bg-primary/10 hover:border-primary'
              )}
              onClick={() => handleChoiceAnswer(index)}
              disabled={isAnswered}
              data-testid={`choice-${index}`}
            >
              <span className="font-bold mr-3">{index + 1}.</span>
              {choice}
            </Button>
          ))}
        </div>
      )}

      {isAnswered && (
        <Card className={cn(
          'animate-fade-in-up border-l-4',
          isCorrect ? 'border-l-success bg-success/5' : 'border-l-destructive bg-destructive/5'
        )}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-success" />
                    <div>
                      <p className="text-xl font-bold text-success">정답이에요!</p>
                      <p className="text-muted-foreground">잘 알고 있네요!</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 text-destructive" />
                    <div>
                      <p className="text-xl font-bold text-destructive">아쉬워요!</p>
                      <p className="text-muted-foreground">다음엔 맞출 수 있어요!</p>
                    </div>
                  </>
                )}
              </div>
              <Button 
                className="gap-2 shrink-0" 
                size="default"
                onClick={handleNext}
                data-testid="button-next"
              >
                다음
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="bg-background rounded-lg p-4">
              <p className="text-base leading-relaxed">{question.explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useState, useMemo, useRef } from 'react';
import { useLocation, useRoute } from 'wouter';
import { MessageSquareWarning, Users, Gamepad2 } from 'lucide-react';
import ModuleIntro from '@/components/ModuleIntro';
import QuizQuestion from '@/components/QuizQuestion';
import ResultScreen from '@/components/ResultScreen';
import BankruptScreen from '@/components/BankruptScreen';
import { useGame } from '@/lib/GameContext';
import { getQuestionsByCategory, type Question } from '@/lib/gameState';

const MODULE_INFO = {
  smishing: {
    title: '스미싱 알아보기',
    description: '이상한 문자 메시지를 구별하는 방법을 배워요!',
    icon: MessageSquareWarning,
    color: 'bg-blue-500',
    tips: [
      '링크가 포함된 문자는 항상 조심하세요',
      '모르는 번호에서 온 급한 요청은 의심하세요',
      '개인정보나 돈을 요구하면 100% 사기예요',
      '공공기관은 문자로 링크를 보내지 않아요',
    ],
  },
  sns: {
    title: 'SNS 사칭 조심하기',
    description: '가짜 친구 계정을 알아보는 방법을 배워요!',
    icon: Users,
    color: 'bg-green-500',
    tips: [
      '친구가 갑자기 번호를 바꿨다면 의심하세요',
      'SNS에서 돈을 요구하면 직접 확인하세요',
      '비밀번호를 요구하는 메시지는 해킹 시도예요',
      '팔로워 늘려준다는 제안은 거의 사기예요',
    ],
  },
  game: {
    title: '게임 아이템 사기 주의',
    description: '"무료 아이템" 광고의 함정을 배워요!',
    icon: Gamepad2,
    color: 'bg-orange-500',
    tips: [
      '무료 아이템을 미끼로 계정 정보를 뺏어가요',
      '핵/치트 파일에는 악성코드가 숨어있어요',
      '문화상품권 결제는 사기 신호예요',
      '공식 게임사만 믿고, 외부 링크는 조심하세요',
    ],
  },
};

type QuizState = 'intro' | 'quiz' | 'result';

export default function Quiz() {
  const [, params] = useRoute('/learn/:moduleId');
  const [, setLocation] = useLocation();
  const moduleId = params?.moduleId as keyof typeof MODULE_INFO;
  
  const { money, isBankrupt, deductMoney, markQuestionAnswered, updateModuleProgress, resetGame } = useGame();
  
  const [quizState, setQuizState] = useState<QuizState>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [startMoney, setStartMoney] = useState(money);
  const correctAnswersRef = useRef(0);

  const moduleInfo = MODULE_INFO[moduleId];
  const questions = useMemo(() => getQuestionsByCategory(moduleId), [moduleId]);
  const currentQuestion = questions[currentQuestionIndex];

  if (!moduleInfo) {
    setLocation('/learn');
    return null;
  }

  const handleStart = () => {
    setStartMoney(money);
    setCurrentQuestionIndex(0);
    correctAnswersRef.current = 0;
    setQuizState('quiz');
  };

  const handleAnswer = (isCorrect: boolean, deduction: number) => {
    if (isCorrect) {
      correctAnswersRef.current += 1;
    }
    if (!isCorrect && deduction > 0) {
      deductMoney(deduction);
    }
    markQuestionAnswered(currentQuestion.id);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      updateModuleProgress(moduleId, correctAnswersRef.current, questions.length);
      setQuizState('result');
    }
  };

  const handleRestart = () => {
    resetGame();
    setQuizState('intro');
    setCurrentQuestionIndex(0);
  };

  if (isBankrupt) {
    return <BankruptScreen onRestart={handleRestart} />;
  }

  return (
    <main className="flex-1 py-8 lg:py-12">
      <div className="container mx-auto px-4">
        {quizState === 'intro' && (
          <ModuleIntro
            title={moduleInfo.title}
            description={moduleInfo.description}
            icon={moduleInfo.icon}
            color={moduleInfo.color}
            tips={moduleInfo.tips}
            questionCount={questions.length}
            onStart={handleStart}
            onBack={() => setLocation('/learn')}
          />
        )}

        {quizState === 'quiz' && currentQuestion && (
          <QuizQuestion
            question={currentQuestion}
            onAnswer={handleAnswer}
            onNext={handleNext}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
          />
        )}

        {quizState === 'result' && (
          <ResultScreen
            finalMoney={money}
            onRestart={handleRestart}
          />
        )}
      </div>
    </main>
  );
}

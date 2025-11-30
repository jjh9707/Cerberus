import { useState, useEffect, useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { ShieldAlert, Smartphone, Gamepad2, Shuffle } from 'lucide-react';
import ModuleIntro from '@/components/ModuleIntro';
import QuizQuestion from '@/components/QuizQuestion';
import ResultScreen from '@/components/ResultScreen';
import BankruptScreen from '@/components/BankruptScreen';
import { useGame } from '@/lib/GameContext';
import { getQuestionsByCategory, type Question, type ModuleState } from '@/lib/gameState';

const MODULE_INFO = {
  safety: {
    title: '안전 지키기',
    description: '유괴 예방과 그루밍(온라인 유인)을 알아보고 스스로를 지켜요!',
    icon: ShieldAlert,
    color: 'bg-red-500',
    tips: [
      '모르는 사람이 만나자고 하면 거절하세요',
      '"비밀이야"라고 하면 더 위험해요',
      '개인정보(집주소, 학교)는 알려주면 안 돼요',
      '무섭거나 이상하면 바로 부모님께 말씀드려요',
    ],
  },
  scam: {
    title: '사기 피하기',
    description: '게임 아이템 사기와 도박의 위험성을 배워요!',
    icon: Gamepad2,
    color: 'bg-orange-500',
    tips: [
      '무료 아이템을 미끼로 계정 정보를 뺏어가요',
      '핵/치트 파일에는 악성코드가 숨어있어요',
      '문화상품권 결제는 사기 신호예요',
      '도박은 불법이고 돈만 잃어요',
    ],
  },
  digital: {
    title: '디지털 안전',
    description: '스미싱과 SNS 사칭을 구별하는 방법을 배워요!',
    icon: Smartphone,
    color: 'bg-blue-500',
    tips: [
      '링크가 포함된 문자는 항상 조심하세요',
      '모르는 번호에서 온 급한 요청은 의심하세요',
      '친구가 SNS로 돈을 빌려달라면 전화로 확인하세요',
      '비밀번호를 요구하면 100% 해킹 시도예요',
    ],
  },
  practice: {
    title: '실전 테스트',
    description: '모든 모듈의 문제를 랜덤으로 풀어봐요!',
    icon: Shuffle,
    color: 'bg-purple-500',
    tips: [
      '지금까지 배운 내용을 총정리해요',
      '모든 유형의 문제가 랜덤으로 나와요',
      '실수해도 괜찮아요, 배우는 과정이니까요',
      '모르는 건 다시 학습 모듈에서 복습하세요',
    ],
  },
};

type QuizState = 'intro' | 'quiz' | 'result';

export default function Quiz() {
  const [, params] = useRoute('/learn/:moduleId');
  const [, setLocation] = useLocation();
  const moduleId = params?.moduleId as keyof typeof MODULE_INFO;
  
  const { 
    currentModuleState,
    initModule,
    resetModuleProgress,
    recordAnswer,
    updateCurrentQuestion,
    completeModule,
    isModuleBankrupt,
  } = useGame();
  
  const [quizState, setQuizState] = useState<QuizState>('intro');
  const [moduleState, setModuleState] = useState<ModuleState | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const moduleInfo = MODULE_INFO[moduleId];
  const questions = useMemo(() => getQuestionsByCategory(moduleId), [moduleId]);

  useEffect(() => {
    if (moduleId && !isInitialized) {
      const state = initModule(moduleId);
      setModuleState(state);
      setIsInitialized(true);
      
      if (state.completed) {
        setQuizState('intro');
      } else if (state.currentQuestionIndex > 0 && state.currentQuestionIndex < questions.length) {
        setQuizState('quiz');
      }
    }
  }, [moduleId, initModule, isInitialized, questions.length]);

  useEffect(() => {
    if (currentModuleState) {
      setModuleState(currentModuleState);
    }
  }, [currentModuleState]);

  if (!moduleInfo) {
    setLocation('/learn');
    return null;
  }

  const currentQuestionIndex = moduleState?.currentQuestionIndex ?? 0;
  const currentQuestion = questions[currentQuestionIndex];
  const currentMoney = moduleState?.money ?? 100000;

  const handleStart = () => {
    const freshState = resetModuleProgress(moduleId);
    setModuleState(freshState);
    setQuizState('quiz');
  };

  const handleContinue = () => {
    setQuizState('quiz');
  };

  const handleAnswer = (isCorrect: boolean, deduction: number) => {
    recordAnswer(currentQuestion.id, isCorrect, deduction);
  };

  const handleNext = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      updateCurrentQuestion(nextIndex);
    } else {
      completeModule(moduleId);
      setQuizState('result');
    }
  };

  const handleRestart = () => {
    const freshState = resetModuleProgress(moduleId);
    setModuleState(freshState);
    setQuizState('intro');
  };

  const handleBackToModules = () => {
    setLocation('/learn');
  };

  if (isModuleBankrupt() && quizState === 'quiz') {
    return (
      <BankruptScreen 
        onRestart={handleRestart} 
        onBackToModules={handleBackToModules}
      />
    );
  }

  const hasProgress = moduleState && 
    !moduleState.completed && 
    moduleState.currentQuestionIndex > 0 && 
    moduleState.currentQuestionIndex < questions.length;

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
            onContinue={hasProgress ? handleContinue : undefined}
            currentProgress={hasProgress ? {
              currentQuestion: moduleState.currentQuestionIndex + 1,
              totalQuestions: questions.length,
              money: moduleState.money,
              correctAnswers: moduleState.correctAnswers,
            } : undefined}
            onBack={handleBackToModules}
          />
        )}

        {quizState === 'quiz' && currentQuestion && (
          <QuizQuestion
            question={currentQuestion}
            currentMoney={currentMoney}
            onAnswer={handleAnswer}
            onNext={handleNext}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
          />
        )}

        {quizState === 'result' && moduleState && (
          <ResultScreen
            finalMoney={moduleState.money}
            correctAnswers={moduleState.correctAnswers}
            incorrectAnswers={moduleState.incorrectAnswers}
            totalQuestions={questions.length}
            answerHistory={moduleState.answerHistory}
            onRestart={handleRestart}
            onBackToModules={handleBackToModules}
          />
        )}
      </div>
    </main>
  );
}

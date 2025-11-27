import { useState, useEffect, useCallback } from 'react';

const INITIAL_MONEY = 100000;
const STORAGE_KEY = 'filteron_game_state';

export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high';

export interface Question {
  id: string;
  message: string;
  sender: string;
  isDangerous: boolean;
  riskLevel: RiskLevel;
  explanation: string;
  category: 'smishing' | 'sns' | 'game';
}

export interface GameState {
  money: number;
  answeredQuestions: string[];
  currentModule: string | null;
  tutorialCompleted: boolean;
}

export const RISK_DEDUCTIONS: Record<RiskLevel, number> = {
  low: 5000,
  medium: 15000,
  high: 30000,
  very_high: 50000,
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: '낮음',
  medium: '중간',
  high: '높음',
  very_high: '매우 높음',
};

export const QUESTIONS: Question[] = [
  {
    id: 'smishing-1',
    message: '엄마야, 급해. 지금 바로 여기로 10만원 보내줘. 010-XXXX-XXXX',
    sender: '010-1234-5678',
    isDangerous: true,
    riskLevel: 'very_high',
    explanation: '이건 가족을 사칭한 긴급 송금 사기예요! 실제로 가족이 돈이 급하게 필요하다면 꼭 전화로 직접 확인하세요. 문자만 보고 돈을 보내면 큰 피해를 볼 수 있어요.',
    category: 'smishing',
  },
  {
    id: 'smishing-2',
    message: '[CJ대한통운] 택배가 주소 불명으로 반송 예정입니다. 주소 확인: hxxp://bit.ly/abc123',
    sender: '발신번호 없음',
    isDangerous: true,
    riskLevel: 'high',
    explanation: '택배 회사를 사칭한 스미싱 문자예요! 이상한 링크를 클릭하면 악성 앱이 설치되거나 개인정보가 유출될 수 있어요. 택배 확인은 공식 앱이나 홈페이지에서 하세요.',
    category: 'smishing',
  },
  {
    id: 'smishing-3',
    message: '[국민건강보험] 건강검진 결과 이상 소견이 발견되었습니다. 확인: hxxp://health.kr/xxx',
    sender: '1577-1000',
    isDangerous: true,
    riskLevel: 'high',
    explanation: '공공기관을 사칭한 스미싱이에요! 건강보험공단은 이런 방식으로 링크를 보내지 않아요. 공공기관 사칭 문자는 무시하고, 궁금하면 직접 전화해서 확인하세요.',
    category: 'smishing',
  },
  {
    id: 'smishing-4',
    message: '친구야! 내일 학교 앞 카페에서 만나자. 시험 끝나고 바로 갈게~',
    sender: '민수',
    isDangerous: false,
    riskLevel: 'low',
    explanation: '이건 평범한 친구와의 메시지예요! 링크도 없고, 돈을 요구하지도 않고, 개인정보를 묻지도 않아요. 안전한 메시지랍니다.',
    category: 'smishing',
  },
  {
    id: 'smishing-5',
    message: '축하합니다! 당첨되셨습니다. 경품 수령을 위해 주민번호와 계좌번호를 입력해주세요.',
    sender: '이벤트당첨',
    isDangerous: true,
    riskLevel: 'very_high',
    explanation: '이건 개인정보 탈취 사기예요! 주민번호나 계좌번호를 문자로 요구하는 곳은 100% 사기입니다. 절대로 개인정보를 알려주면 안 돼요!',
    category: 'smishing',
  },
  {
    id: 'sns-1',
    message: '야 나 지훈인데 폰 바꿔서 번호 바뀌었어. 저장해줘! 참 용돈 좀 빌려줄 수 있어?',
    sender: '알 수 없는 계정',
    isDangerous: true,
    riskLevel: 'high',
    explanation: '친구를 사칭한 SNS 사기예요! 친구가 번호를 바꿨다면서 돈을 빌려달라고 하면, 반드시 기존 연락처로 확인하세요.',
    category: 'sns',
  },
  {
    id: 'sns-2',
    message: '안녕! 나 연예인 XXX 팬클럽 회장이야. 회비 1만원만 보내면 사인 포토카드 보내줄게!',
    sender: '@fanclub_official',
    isDangerous: true,
    riskLevel: 'medium',
    explanation: 'SNS에서 돈을 요구하는 사람은 조심해야 해요! 공식 팬클럽은 개인 DM으로 돈을 요구하지 않아요.',
    category: 'sns',
  },
  {
    id: 'sns-3',
    message: '우리 반 단톡방에서 나갔네? 다시 들어와~ 내일 체육대회 준비해야 해!',
    sender: '반장 김서연',
    isDangerous: false,
    riskLevel: 'low',
    explanation: '이건 실제 반 친구의 정상적인 메시지예요! 링크도 없고 돈 요구도 없어서 안전해요.',
    category: 'sns',
  },
  {
    id: 'sns-4',
    message: '인스타 팔로워 1만명 만들어줄게! 일단 계정 아이디랑 비번 알려줘~',
    sender: '@follower_boost_kr',
    isDangerous: true,
    riskLevel: 'very_high',
    explanation: '계정 비밀번호를 요구하는 건 해킹 시도예요! 절대로 비밀번호를 알려주면 안 됩니다. 계정을 뺏기면 큰 피해를 볼 수 있어요.',
    category: 'sns',
  },
  {
    id: 'game-1',
    message: '로블록스 무료 로벅스 10000개 받으세요! 지금 바로 클릭! → game-free.xyz',
    sender: '게임무료아이템',
    isDangerous: true,
    riskLevel: 'high',
    explanation: '무료 게임 아이템을 미끼로 하는 사기예요! 공식 게임사가 아닌 곳에서 주는 무료 아이템은 99% 사기입니다. 계정 정보가 털릴 수 있어요.',
    category: 'game',
  },
  {
    id: 'game-2',
    message: '마인크래프트 다이아몬드 무한 생성 핵! 설치파일 다운로드: mchack.kr/download',
    sender: '게임치트공유',
    isDangerous: true,
    riskLevel: 'very_high',
    explanation: '게임 핵이나 치트 파일에는 악성코드가 숨어있어요! 다운받으면 컴퓨터가 해킹당하거나, 게임 계정이 정지될 수 있어요.',
    category: 'game',
  },
  {
    id: 'game-3',
    message: '친구야 오늘 저녁에 마인크래프트 같이 할래? 우리 서버 ip 알려줄게!',
    sender: '같은 반 친구 정민',
    isDangerous: false,
    riskLevel: 'low',
    explanation: '이건 친구와의 정상적인 게임 약속이에요! 아는 친구가 함께 게임하자고 하는 건 안전해요.',
    category: 'game',
  },
  {
    id: 'game-4',
    message: '지금 접속하면 스킨 50% 할인! 결제는 문화상품권으로만 가능. 카카오톡: gameitem123',
    sender: '아이템거래',
    isDangerous: true,
    riskLevel: 'high',
    explanation: '문화상품권으로 결제하라는 건 사기 신호예요! 정상적인 거래는 공식 결제 시스템을 사용해요. 상품권 번호를 알려주면 돈만 뺏기고 아이템은 못 받아요.',
    category: 'game',
  },
  {
    id: 'game-5',
    message: '[배틀그라운드] 친구 초대 이벤트! 친구 초대하고 무료 스킨 받으세요. 공식 앱에서 확인하세요.',
    sender: 'PUBG 공식',
    isDangerous: false,
    riskLevel: 'low',
    explanation: '이건 게임사 공식 이벤트 안내예요! 링크 대신 "공식 앱에서 확인하세요"라고 안내하는 건 안전한 방식이에요.',
    category: 'game',
  },
];

export const getQuestionsByCategory = (category: string): Question[] => {
  return QUESTIONS.filter(q => q.category === category);
};

const getInitialState = (): GameState => {
  if (typeof window === 'undefined') {
    return {
      money: INITIAL_MONEY,
      answeredQuestions: [],
      currentModule: null,
      tutorialCompleted: false,
    };
  }
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return {
        money: INITIAL_MONEY,
        answeredQuestions: [],
        currentModule: null,
        tutorialCompleted: false,
      };
    }
  }
  return {
    money: INITIAL_MONEY,
    answeredQuestions: [],
    currentModule: null,
    tutorialCompleted: false,
  };
};

export function useGameState() {
  const [state, setState] = useState<GameState>(getInitialState);
  const [moneyChange, setMoneyChange] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const deductMoney = useCallback((amount: number) => {
    setMoneyChange(-amount);
    setState(prev => ({
      ...prev,
      money: Math.max(0, prev.money - amount),
    }));
    setTimeout(() => setMoneyChange(null), 2000);
  }, []);

  const markQuestionAnswered = useCallback((questionId: string) => {
    setState(prev => ({
      ...prev,
      answeredQuestions: [...prev.answeredQuestions, questionId],
    }));
  }, []);

  const setCurrentModule = useCallback((module: string | null) => {
    setState(prev => ({
      ...prev,
      currentModule: module,
    }));
  }, []);

  const completeTutorial = useCallback(() => {
    setState(prev => ({
      ...prev,
      tutorialCompleted: true,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setState({
      money: INITIAL_MONEY,
      answeredQuestions: [],
      currentModule: null,
      tutorialCompleted: true,
    });
    setMoneyChange(null);
  }, []);

  const isBankrupt = state.money <= 0;

  return {
    ...state,
    moneyChange,
    isBankrupt,
    deductMoney,
    markQuestionAnswered,
    setCurrentModule,
    completeTutorial,
    resetGame,
  };
}

export type GameStateHook = ReturnType<typeof useGameState>;

import { useState, useEffect, useCallback } from "react";

const INITIAL_MONEY = 100000;
const STORAGE_KEY = "filteron_game_state";
const MODULE_STORAGE_PREFIX = "filteron_module_";

export type RiskLevel = "low" | "medium" | "high" | "very_high";
export type QuestionType = "ox" | "choice";
export type ModuleId = "safety" | "digital" | "scam" | "practice";

export interface OXQuestion {
  id: string;
  type: "ox";
  message: string;
  sender: string;
  isDangerous: boolean;
  riskLevel: RiskLevel;
  explanation: string;
  category: ModuleId;
}

export interface ChoiceQuestion {
  id: string;
  type: "choice";
  question: string;
  choices: string[];
  correctAnswer: number;
  riskLevel: RiskLevel;
  explanation: string;
  category: ModuleId;
}

export type Question = OXQuestion | ChoiceQuestion;

export interface ModuleProgress {
  completed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  lastPlayedAt: string | null;
}

export interface ModuleState {
  money: number;
  currentQuestionIndex: number;
  correctAnswers: number;
  incorrectAnswers: number;
  answeredQuestions: string[];
  answerHistory: { questionId: string; isCorrect: boolean; deduction: number }[];
  completed: boolean;
  lastPlayedAt: string | null;
}

export interface GameState {
  money: number;
  answeredQuestions: string[];
  currentModule: string | null;
  tutorialCompleted: boolean;
  moduleProgress: Record<string, ModuleProgress>;
}

export const RISK_DEDUCTIONS: Record<RiskLevel, number> = {
  low: 5000,
  medium: 15000,
  high: 30000,
  very_high: 50000,
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "낮음",
  medium: "중간",
  high: "높음",
  very_high: "매우 높음",
};

export const QUESTIONS: Question[] = [
  {
    id: "safety-1",
    type: "ox",
    message:
      "안녕! 나 근처에 사는 20대 형이야. 너 학교 끝나면 같이 놀자! PC방 가서 게임도 하고 맛있는 것도 사줄게~",
    sender: "알 수 없는 계정",
    isDangerous: true,
    riskLevel: "very_high",
    explanation:
      "모르는 성인이 온라인에서 만나자고 하면 절대 응하면 안 돼요! 이건 그루밍(아이를 유인하는 행위)일 수 있어요. 부모님이나 선생님께 바로 말씀드리세요.",
    category: "safety",
  },
  {
    id: "safety-2",
    type: "ox",
    message: "같은 반 친구야! 내일 방과후에 도서관에서 같이 공부하자~",
    sender: "같은 반 친구 수진",
    isDangerous: false,
    riskLevel: "low",
    explanation:
      "학교 친구와의 정상적인 약속이에요. 공공장소인 도서관에서 만나는 것도 안전해요!",
    category: "safety",
  },
  {
    id: "safety-3",
    type: "ox",
    message:
      "너 사진 정말 예쁘다! 나한테만 다른 사진도 더 보여줄 수 있어? 비밀로 해줄게~",
    sender: "SNS 팔로워",
    isDangerous: true,
    riskLevel: "very_high",
    explanation:
      "온라인에서 개인적인 사진을 요구하는 것은 매우 위험해요! 이런 요청은 무시하고 차단한 뒤 부모님께 알려주세요.",
    category: "safety",
  },
  {
    id: "safety-4",
    type: "choice",
    question:
      '모르는 사람이 온라인에서 "비밀로 해줄게"라며 만나자고 할 때 어떻게 해야 할까요?',
    choices: [
      "비밀로 해준다니까 만난다",
      "무시하고 부모님께 말씀드린다",
      "친구들에게만 알린다",
      "일단 만나보고 결정한다",
    ],
    correctAnswer: 1,
    riskLevel: "very_high",
    explanation:
      '"비밀"을 강조하는 것은 그루밍의 대표적인 특징이에요. 무조건 부모님이나 선생님께 바로 말씀드려야 해요!',
    category: "safety",
  },
  {
    id: "safety-5",
    type: "ox",
    message: "학원에서 만난 친구예요! 주말에 우리 집에서 같이 숙제하자!",
    sender: "학원 친구 민지",
    isDangerous: false,
    riskLevel: "low",
    explanation:
      "학원에서 아는 친구와의 약속이에요. 부모님께 말씀드리고 가면 안전해요!",
    category: "safety",
  },
  {
    id: "safety-6",
    type: "choice",
    question:
      '길에서 모르는 어른이 "엄마가 사고났어, 빨리 차에 타"라고 할 때 어떻게 해야 할까요?',
    choices: [
      "급하니까 일단 차에 탄다",
      "거절하고 가까운 가게나 어른에게 도움을 요청한다",
      "따라가면서 자세한 내용을 물어본다",
      "친구에게 전화해서 물어본다",
    ],
    correctAnswer: 1,
    riskLevel: "very_high",
    explanation:
      "진짜 긴급 상황이라면 경찰이나 학교에서 직접 연락이 와요. 모르는 사람의 차에는 절대 타면 안 돼요!",
    category: "safety",
  },
  {
    id: "safety-7",
    type: "ox",
    message:
      "나 인스타 인플루언서인데, 너 모델로 데뷔시켜줄게! 개인적으로 만나서 얘기하자~",
    sender: "@model_scout_kr",
    isDangerous: true,
    riskLevel: "very_high",
    explanation:
      "정상적인 모델 에이전시는 SNS DM으로 개인적인 만남을 요청하지 않아요. 이런 건 유인 수법일 수 있어요!",
    category: "safety",
  },
  {
    id: "safety-8",
    type: "choice",
    question:
      '친한 온라인 친구가 "우리 진짜 친구잖아, 집 주소 알려줘"라고 할 때 어떻게 해야 할까요?',
    choices: [
      "진짜 친구니까 알려준다",
      "주소 대신 동네 이름만 알려준다",
      "개인정보는 온라인에서 절대 알려주지 않는다",
      "선물 보내준다니까 알려준다",
    ],
    correctAnswer: 2,
    riskLevel: "high",
    explanation:
      "온라인에서 아무리 친해도 집 주소, 학교, 전화번호 같은 개인정보는 절대 알려주면 안 돼요!",
    category: "safety",
  },
  {
    id: "safety-9",
    type: "ox",
    message:
      "안녕~ 나 17살인데 게임 같이 하자! 너도 중학생이지? 카톡 아이디 알려줘!",
    sender: "게임 유저",
    isDangerous: true,
    riskLevel: "high",
    explanation:
      "온라인에서 나이를 속이기는 쉬워요. 모르는 사람에게 개인 연락처를 알려주면 안 돼요!",
    category: "safety",
  },
  {
    id: "safety-10",
    type: "choice",
    question:
      "친구에게 '내일 게임 친구 만나러 갈 건데 너도 갈래?'라는 문자가 왔어요.'",
    choices: [
      "궁금하니까 가본다",
      "공공장소에서 만나면 괜찮다",
      "절대 만나지 않고 부모님께 알린다",
      "친구랑 같이 가면 안전하다",
    ],
    correctAnswer: 3,
    riskLevel: "high",
    explanation:
      "친구와 함께 만나는 것이라도 인터넷에서 만난 사람을 실제로 만나는 것은 위험해요!",
    category: "safety",
  },
  {
    id: "safety-11",
    type: "choice",
    question:
      "온라인에서 알게 된 사람이 용돈을 준다며 만나자고 해요. 어떻게 해야 할까요?",
    choices: [
      "용돈이 필요하니까 만난다",
      "공공장소에서 만나면 괜찮다",
      "절대 만나지 않고 부모님께 알린다",
      "친구랑 같이 가면 안전하다",
    ],
    correctAnswer: 2,
    riskLevel: "very_high",
    explanation:
      "돈이나 선물을 미끼로 만남을 유도하는 것은 전형적인 유인 수법이에요. 절대 만나면 안 됩니다!",
    category: "safety",
  },
  {
    id: "safety-12",
    type: "ox",
    message: "야 나 준호인데 오늘 체육시간에 너 진짜 웃겼어ㅋㅋ 내일 또 보자!",
    sender: "같은 반 준호",
    isDangerous: false,
    riskLevel: "low",
    explanation: "학교에서 일어난 일을 이야기하는 평범한 친구 메시지예요!",
    category: "safety",
  },
  {
    id: "safety-13",
    type: "choice",
    question: "그루밍(아동 유인)의 특징이 아닌 것은 무엇일까요?",
    choices: [
      "처음부터 선물이나 돈을 제안한다",
      '"비밀이야" "부모님한테 말하지 마"라고 한다',
      "학교 선생님이 수업 시간에 설명한다",
      "점점 사적인 질문이나 사진을 요구한다",
    ],
    correctAnswer: 2,
    riskLevel: "medium",
    explanation:
      "그루밍은 선물 제안, 비밀 강요, 사적인 요구가 특징이에요. 선생님의 정상적인 교육과는 완전히 달라요!",
    category: "safety",
  },
  {
    id: "safety-14",
    type: "ox",
    message: "네가 보낸 사진 다 저장해뒀어. 말 안 들으면 학교에 뿌릴 거야.",
    sender: "알 수 없음",
    isDangerous: true,
    riskLevel: "very_high",
    explanation:
      "이건 협박이에요! 무섭겠지만 혼자 고민하지 말고 바로 부모님이나 선생님께 말씀드리세요. 여러분 잘못이 아니에요!",
    category: "safety",
  },
  {
    id: "safety-15",
    type: "choice",
    question:
      "위험한 상황에 처했을 때 도움을 요청할 수 있는 곳으로 올바른 것은?",
    choices: [
      "온라인 친구",
      "부모님, 선생님, 112, 117(아동학대 신고)",
      "SNS에 글 올리기",
      "혼자 해결하기",
    ],
    correctAnswer: 1,
    riskLevel: "medium",
    explanation:
      "위험할 때는 부모님, 선생님, 112(경찰), 117(아동학대 신고전화)에 도움을 요청하세요!",
    category: "safety",
  },

  {
    id: "scam-1",
    type: "choice",
    question:
      '"로블록스 무료 로벅스 10000개"라는 메시지를 받았어요. 어떻게 해야 할까요?',
    choices: [
      "바로 클릭해서 받는다",
      "친구에게도 알려준다",
      "무시하고 공식 스토어만 이용한다",
      "일단 클릭해보고 이상하면 나온다",
    ],
    correctAnswer: 2,
    riskLevel: "high",
    explanation:
      "무료 게임 아이템을 미끼로 하는 사기예요! 공식 게임사가 아닌 곳에서 주는 무료 아이템은 99% 사기입니다.",
    category: "scam",
  },
  {
    id: "scam-2",
    type: "choice",
    question:
      "모르는 번호로 온 문자에서 마인크래프트 다이아몬드 무한 생성 핵 파일을 다운받으라고 해요. 어떻게 해야 할까요?",
    choices: [
      "친구들도 쓰니까 다운받는다",
      "바이러스 검사 후 설치한다",
      "절대 다운받지 않는다",
      "컴퓨터방에서 다운받는다",
    ],
    correctAnswer: 2,
    riskLevel: "very_high",
    explanation:
      "게임 핵이나 치트 파일에는 악성코드가 숨어있어요! 컴퓨터가 해킹당하거나, 게임 계정이 정지될 수 있어요.",
    category: "scam",
  },
  {
    id: "scam-3",
    type: "ox",
    message:
      "친구야 오늘 저녁에 마인크래프트 같이 할래? 우리 서버 ip 알려줄게!",
    sender: "같은 반 친구 정민",
    isDangerous: false,
    riskLevel: "low",
    explanation:
      "친구와의 정상적인 게임 약속이에요! 아는 친구가 함께 게임하자고 하는 건 안전해요.",
    category: "scam",
  },
  {
    id: "scam-4",
    type: "choice",
    question:
      "게임 아이템 거래자가 스킨을 문화상품권으로 결제하라고 해요. 어떻게 해야 할까요?",
    choices: [
      "문화상품권이 더 편하니까 결제한다",
      "거래하지 않고 공식 스토어를 이용한다",
      "반값만 먼저 보낸다",
      "친구가 추천하면 괜찮다",
    ],
    correctAnswer: 1,
    riskLevel: "high",
    explanation:
      "문화상품권으로 결제하라는 건 사기 신호예요! 상품권 번호를 알려주면 돈만 뺏기고 아이템은 못 받아요.",
    category: "scam",
  },
  {
    id: "scam-5",
    type: "choice",
    question: "온라인 도박 사이트의 위험성으로 옳지 않은 것은?",
    choices: [
      "불법이라 처벌받을 수 있다",
      "돈을 잃어도 다시 딸 수 있다",
      "개인정보가 유출될 수 있다",
      "중독되기 쉽다",
    ],
    correctAnswer: 1,
    riskLevel: "high",
    explanation:
      '도박은 "다시 딸 수 있다"는 생각이 가장 위험해요. 실제로는 계속 돈을 잃게 되고, 불법이라 처벌도 받아요!',
    category: "scam",
  },
  {
    id: "scam-6",
    type: "choice",
    question:
      '"하루에 100만원 버는 법! 지금 가입하면 보너스 10만원!"이라는 광고를 봤어요. 어떻게 해야 할까요?',
    choices: [
      "보너스 10만원이니까 가입한다",
      "부모님께 여쭤본다",
      "친구와 같이 가입한다",
      "무시하고 신고한다",
    ],
    correctAnswer: 3,
    riskLevel: "very_high",
    explanation:
      "온라인 도박 광고예요! 청소년 도박은 불법이고, 돈을 벌 수 없어요. 오히려 돈을 잃고 중독되기 쉬워요.",
    category: "scam",
  },
  {
    id: "scam-7",
    type: "ox",
    message:
      "[배틀그라운드] 친구 초대 이벤트! 친구 초대하고 무료 스킨 받으세요. 공식 앱에서 확인하세요.",
    sender: "PUBG 공식",
    isDangerous: false,
    riskLevel: "low",
    explanation:
      '게임사 공식 이벤트 안내예요! 링크 대신 "공식 앱에서 확인하세요"라고 안내하는 건 안전한 방식이에요.',
    category: "scam",
  },
  {
    id: "scam-8",
    type: "choice",
    question: "게임 아이템 사기를 피하는 방법으로 옳은 것은?",
    choices: [
      "개인 거래가 더 싸서 좋다",
      "문화상품권으로 결제한다",
      "공식 스토어에서만 구매한다",
      "SNS 광고를 믿는다",
    ],
    correctAnswer: 2,
    riskLevel: "medium",
    explanation:
      "게임 아이템은 반드시 공식 스토어에서만 구매해야 안전해요! 개인 거래나 외부 사이트는 사기 위험이 높아요.",
    category: "scam",
  },
  {
    id: "scam-9",
    type: "choice",
    question:
      '스포츠 토토 사이트에서 "학생도 가입 가능! 100% 적중!"이라고 해요. 이 광고의 문제점은?',
    choices: [
      "학생은 가입할 수 없다",
      "100% 적중은 불가능하다",
      "청소년 도박은 불법이다",
      "위의 모든 것",
    ],
    correctAnswer: 3,
    riskLevel: "very_high",
    explanation:
      '청소년 도박은 불법이에요! "100% 적중"은 거짓말이고, 돈만 잃게 돼요. 절대 참여하면 안 됩니다!',
    category: "scam",
  },
  {
    id: "scam-10",
    type: "choice",
    question:
      '친구가 "돈 쉽게 버는 법 알려줄게"라며 도박 사이트를 추천하면 어떻게 해야 할까요?',
    choices: [
      "친구 말이니까 한 번 해본다",
      "조금만 해보고 그만둔다",
      "거절하고 도박의 위험성을 알려준다",
      "부모님 몰래 하면 괜찮다",
    ],
    correctAnswer: 2,
    riskLevel: "high",
    explanation:
      "친구가 권해도 도박은 절대 안 돼요! 오히려 친구에게 도박의 위험성을 알려주세요.",
    category: "scam",
  },
  {
    id: "scam-11",
    type: "choice",
    question:
      "포트나이트 무료 V-Bucks 생성기에 이메일과 게임 아이디를 입력하라고 해요. 어떻게 해야 할까요?",
    choices: [
      "무료니까 입력한다",
      "비밀번호만 빼고 입력한다",
      "절대 입력하지 않는다",
      "친구 정보로 입력해본다",
    ],
    correctAnswer: 2,
    riskLevel: "high",
    explanation:
      "무료 게임 화폐 생성기는 전부 사기예요! 이메일과 게임 아이디를 입력하면 계정이 해킹당해요.",
    category: "scam",
  },
  {
    id: "scam-12",
    type: "ox",
    message: "주토피아2 무료 다운! 고화질! → movie-free.xyz/download",
    sender: "무료영화",
    isDangerous: true,
    riskLevel: "high",
    explanation:
      "불법 다운로드 사이트예요! 악성코드에 감염될 수 있고, 저작권법 위반으로 처벌받을 수 있어요.",
    category: "scam",
  },
  {
    id: "scam-13",
    type: "choice",
    question: "도박 중독의 증상이 아닌 것은?",
    choices: [
      "도박 생각이 계속 난다",
      "잃은 돈을 되찾으려고 더 베팅한다",
      "가끔 친구와 보드게임을 한다",
      "도박을 위해 거짓말을 한다",
    ],
    correctAnswer: 2,
    riskLevel: "medium",
    explanation:
      "친구와 보드게임 하는 것은 건전한 놀이예요. 도박 중독은 돈에 집착하고 거짓말하게 되는 것이 특징이에요.",
    category: "scam",
  },
  {
    id: "scam-14",
    type: "choice",
    question:
      '"레전드 스킨 5000원! 선입금하면 바로 전송!"이라는 개인 거래 제안을 받았어요. 어떻게 해야 할까요?',
    choices: [
      "싸니까 바로 입금한다",
      "반값만 먼저 보낸다",
      "거래하지 않고 공식 스토어를 이용한다",
      "친구한테 물어본 후 결정한다",
    ],
    correctAnswer: 2,
    riskLevel: "high",
    explanation:
      "선입금 요구는 사기의 전형적인 수법이에요! 돈만 받고 아이템은 안 보내요. 공식 거래만 이용하세요!",
    category: "scam",
  },
  {
    id: "scam-15",
    type: "choice",
    question: "게임 핵이나 치트 프로그램의 위험성으로 올바른 것은?",
    choices: [
      "게임 실력이 늘어난다",
      "악성코드가 포함되어 있을 수 있다",
      "게임사에서 허용한다",
      "친구에게 인기가 많아진다",
    ],
    correctAnswer: 1,
    riskLevel: "high",
    explanation:
      "핵이나 치트 파일에는 대부분 악성코드가 숨어있어요. 계정 정지도 당하고 컴퓨터도 해킹될 수 있어요!",
    category: "scam",
  },

  {
    id: "digital-1",
    type: "choice",
    question:
      '"엄마야, 급해. 지금 바로 여기로 10만원 보내줘"라는 문자를 받았어요. 어떻게 해야 할까요?',
    choices: [
      "급하니까 바로 송금한다",
      "엄마 전화번호로 직접 전화해서 확인한다",
      "반만 먼저 보낸다",
      "문자로 다시 물어본다",
    ],
    correctAnswer: 1,
    riskLevel: "very_high",
    explanation:
      "가족을 사칭한 긴급 송금 사기예요! 실제 가족이 돈이 급하게 필요하다면 꼭 전화로 직접 확인하세요.",
    category: "digital",
  },
  {
    id: "digital-2",
    type: "choice",
    question:
      'CJ대한통운에서 "택배 주소 불명, 링크에서 확인하세요"라는 문자가 왔어요. 어떻게 해야 할까요?',
    choices: [
      "링크를 바로 클릭한다",
      "공식 택배 앱에서 확인한다",
      "전화번호로 전화한다",
      "무시하고 기다린다",
    ],
    correctAnswer: 1,
    riskLevel: "high",
    explanation:
      "택배 회사를 사칭한 스미싱 문자예요! 링크를 클릭하면 악성 앱이 설치돼요. 택배는 공식 앱에서 확인하세요.",
    category: "digital",
  },
  {
    id: "digital-3",
    type: "ox",
    message: "친구야! 내일 학교 앞 카페에서 만나자. 시험 끝나고 바로 갈게~",
    sender: "민수",
    isDangerous: false,
    riskLevel: "low",
    explanation:
      "친구와의 평범한 메시지예요! 링크도 없고, 돈을 요구하지도 않아요. 안전한 메시지랍니다.",
    category: "digital",
  },
  {
    id: "digital-4",
    type: "choice",
    question:
      'SNS에서 친구가 "폰 바꿔서 번호 바뀌었어. 용돈 좀 빌려줄 수 있어?"라고 메시지를 보냈어요. 어떻게 해야 할까요?',
    choices: [
      "친구니까 바로 송금한다",
      "기존에 알던 친구 연락처로 확인한다",
      "새 번호로 전화해본다",
      "얼마나 필요한지 먼저 물어본다",
    ],
    correctAnswer: 1,
    riskLevel: "high",
    explanation:
      "친구를 사칭한 SNS 사기예요! 친구가 번호를 바꿨다면서 돈을 빌려달라고 하면, 기존 연락처로 확인하세요.",
    category: "digital",
  },
  {
    id: "digital-5",
    type: "choice",
    question: "스미싱 문자의 특징이 아닌 것은?",
    choices: [
      "이상한 링크가 포함되어 있다",
      "급하게 행동하도록 유도한다",
      "발신번호가 없거나 이상하다",
      "친구가 직접 보낸 일상 대화",
    ],
    correctAnswer: 3,
    riskLevel: "medium",
    explanation:
      "친구의 일상 대화는 스미싱이 아니에요. 스미싱은 이상한 링크, 급한 요청, 수상한 발신번호가 특징이에요!",
    category: "digital",
  },
  {
    id: "digital-6",
    type: "choice",
    question:
      '"인스타 팔로워 1만명 만들어줄게! 계정 아이디랑 비번 알려줘"라는 DM을 받았어요. 어떻게 해야 할까요?',
    choices: [
      "팔로워가 늘어나니까 알려준다",
      "절대 알려주지 않고 차단한다",
      "비밀번호만 빼고 알려준다",
      "친구에게 물어본 후 결정한다",
    ],
    correctAnswer: 1,
    riskLevel: "very_high",
    explanation:
      "계정 비밀번호를 요구하는 건 해킹 시도예요! 절대 비밀번호를 알려주면 안 됩니다.",
    category: "digital",
  },
  {
    id: "digital-7",
    type: "ox",
    message:
      "[학교 급식실] 이번 주 급식표가 변경되었습니다. 확인하려면 눌러 주세요. 확인: hxxp://health.kr/xxx",
    sender: "1577-1000",
    isDangerous: true,
    riskLevel: "high",
    explanation:
      "학교에서 온 것처럼 보이지만 스미싱이에요. 학교는 이런 식으로 링크를 보내지 않아요.",
    category: "digital",
  },
  {
    id: "digital-8",
    type: "choice",
    question: "SNS에서 친구가 갑자기 돈을 빌려달라고 할 때 어떻게 해야 할까요?",
    choices: [
      "바로 돈을 보내준다",
      "전화나 직접 만나서 확인한다",
      "더 많이 빌려준다",
      "무시한다",
    ],
    correctAnswer: 1,
    riskLevel: "high",
    explanation:
      "SNS 계정이 해킹되어 사기꾼이 메시지를 보낼 수 있어요. 전화로 직접 확인하는 것이 가장 안전해요!",
    category: "digital",
  },
  {
    id: "digital-9",
    type: "choice",
    question:
      '"축하합니다! 당첨! 경품 수령을 위해 주민번호와 계좌번호를 입력해주세요"라는 메시지가 왔어요. 어떻게 해야 할까요?',
    choices: [
      "당첨이니까 입력한다",
      "절대 입력하지 않고 무시한다",
      "주민번호만 입력한다",
      "부모님 정보를 입력한다",
    ],
    correctAnswer: 1,
    riskLevel: "very_high",
    explanation:
      "개인정보를 요구하는 당첨 메시지는 사기예요! 주민번호나 계좌번호를 절대 알려주면 안 돼요.",
    category: "digital",
  },
  {
    id: "digital-10",
    type: "ox",
    message:
      "[국민건강보험] 건강검진 결과 이상 발견. 즉시 확인 → bit.ly/health-check",
    sender: "1577-1000",
    isDangerous: true,
    riskLevel: "high",
    explanation:
      "공공기관을 사칭한 스미싱이에요! 국민건강보험공단은 문자로 링크를 보내지 않아요. 공식 앱이나 홈페이지에서 확인하세요.",
    category: "digital",
  },
  {
    id: "digital-11",
    type: "choice",
    question: "안전한 비밀번호 만들기 방법으로 옳지 않은 것은?",
    choices: [
      "영문, 숫자, 특수문자를 섞어서 만든다",
      "생년월일이나 이름으로 만든다",
      "8자 이상으로 만든다",
      "사이트마다 다른 비밀번호를 사용한다",
    ],
    correctAnswer: 1,
    riskLevel: "medium",
    explanation:
      "생년월일이나 이름은 쉽게 추측할 수 있어서 위험해요! 복잡한 조합의 비밀번호를 사용하세요.",
    category: "digital",
  },
  {
    id: "digital-12",
    type: "ox",
    message:
      "엄마인데 폰이 고장나서 빌려서 연락해. 급하게 5만원만 보내줘. 문상으로 보내줘.",
    sender: "010-XXXX-XXXX",
    isDangerous: true,
    riskLevel: "very_high",
    explanation:
      "가족을 사칭한 문자 사기예요! 문화상품권으로 돈을 요구하는 건 100% 사기입니다. 직접 전화로 확인하세요!",
    category: "digital",
  },
  {
    id: "digital-13",
    type: "choice",
    question:
      '"계정이 해킹당했습니다. 여기를 클릭해서 비밀번호를 재설정하세요"라는 이메일이 왔어요. 어떻게 해야 할까요?',
    choices: [
      "급하니까 바로 클릭한다",
      "링크 클릭 없이 공식 사이트에서 직접 확인한다",
      "비밀번호를 입력해 확인한다",
      "친구에게 물어본다",
    ],
    correctAnswer: 1,
    riskLevel: "high",
    explanation:
      "피싱 이메일일 수 있어요! 이메일 링크를 클릭하지 말고 직접 공식 사이트에 접속해서 확인하세요.",
    category: "digital",
  },
  {
    id: "digital-14",
    type: "choice",
    question:
      "공공 와이파이(카페, 지하철)를 사용할 때 주의할 점이 아닌 것은?",
    choices: [
      "금융 앱 사용을 피한다",
      "중요한 비밀번호 입력을 피한다",
      "아무 와이파이나 연결한다",
      "자동 연결을 꺼둔다",
    ],
    correctAnswer: 2,
    riskLevel: "medium",
    explanation:
      "공공 와이파이는 해커가 정보를 훔쳐볼 수 있어요! 중요한 개인정보는 공공 와이파이에서 입력하지 마세요.",
    category: "digital",
  },
  {
    id: "digital-15",
    type: "choice",
    question:
      '유튜브 댓글에 "무료 기프트카드 받기 → [링크]"라고 써있어요. 어떻게 해야 할까요?',
    choices: [
      "무료니까 클릭한다",
      "친구에게도 알려준다",
      "무시하고 신고한다",
      "나중에 클릭한다",
    ],
    correctAnswer: 2,
    riskLevel: "high",
    explanation:
      "댓글의 무료 기프트카드 링크는 사기예요! 개인정보를 빼가거나 악성코드가 설치될 수 있어요.",
    category: "digital",
  },
];

export function getQuestionsByCategory(category: string): Question[] {
  if (category === "practice") {
    const allQuestions = [...QUESTIONS];
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }
    return allQuestions.slice(0, 15);
  }
  return QUESTIONS.filter((q) => q.category === category);
}

function getDefaultModuleState(): ModuleState {
  return {
    money: INITIAL_MONEY,
    currentQuestionIndex: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    answeredQuestions: [],
    answerHistory: [],
    completed: false,
    lastPlayedAt: null,
  };
}

function loadModuleState(moduleId: string): ModuleState {
  try {
    const stored = localStorage.getItem(`${MODULE_STORAGE_PREFIX}${moduleId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load module state:", e);
  }
  return getDefaultModuleState();
}

function saveModuleState(moduleId: string, state: ModuleState): void {
  try {
    localStorage.setItem(`${MODULE_STORAGE_PREFIX}${moduleId}`, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save module state:", e);
  }
}

function getDefaultGameState(): GameState {
  return {
    money: INITIAL_MONEY,
    answeredQuestions: [],
    currentModule: null,
    tutorialCompleted: false,
    moduleProgress: {},
  };
}

function loadGameState(): GameState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...getDefaultGameState(), ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load game state:", e);
  }
  return getDefaultGameState();
}

function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save game state:", e);
  }
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadGameState);
  const [currentModuleState, setCurrentModuleState] = useState<ModuleState | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  useEffect(() => {
    if (activeModuleId && currentModuleState) {
      saveModuleState(activeModuleId, currentModuleState);
    }
  }, [currentModuleState, activeModuleId]);

  const initModule = useCallback((moduleId: string) => {
    const moduleState = loadModuleState(moduleId);
    setActiveModuleId(moduleId);
    setCurrentModuleState(moduleState);
    setState(prev => ({ ...prev, currentModule: moduleId }));
    return moduleState;
  }, []);

  const resetModuleProgress = useCallback((moduleId: string) => {
    const freshState = getDefaultModuleState();
    freshState.lastPlayedAt = new Date().toISOString();
    setCurrentModuleState(freshState);
    saveModuleState(moduleId, freshState);
    return freshState;
  }, []);

  const getModuleState = useCallback((moduleId: string): ModuleState => {
    return loadModuleState(moduleId);
  }, []);

  const deductModuleMoney = useCallback((amount: number) => {
    setCurrentModuleState(prev => {
      if (!prev) return prev;
      const newMoney = Math.max(0, prev.money - amount);
      return { ...prev, money: newMoney };
    });
  }, []);

  const recordAnswer = useCallback((questionId: string, isCorrect: boolean, deduction: number) => {
    setCurrentModuleState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
        incorrectAnswers: !isCorrect ? prev.incorrectAnswers + 1 : prev.incorrectAnswers,
        answeredQuestions: [...prev.answeredQuestions, questionId],
        answerHistory: [...prev.answerHistory, { questionId, isCorrect, deduction }],
        money: isCorrect ? prev.money : Math.max(0, prev.money - deduction),
      };
    });
  }, []);

  const updateCurrentQuestion = useCallback((index: number) => {
    setCurrentModuleState(prev => {
      if (!prev) return prev;
      return { ...prev, currentQuestionIndex: index };
    });
  }, []);

  const completeModule = useCallback((moduleId: string) => {
    setCurrentModuleState(prev => {
      if (!prev) return prev;
      const completedState = {
        ...prev,
        completed: true,
        lastPlayedAt: new Date().toISOString(),
      };
      saveModuleState(moduleId, completedState);
      
      setState(s => ({
        ...s,
        moduleProgress: {
          ...s.moduleProgress,
          [moduleId]: {
            completed: true,
            correctAnswers: prev.correctAnswers,
            totalQuestions: prev.answeredQuestions.length,
            lastPlayedAt: new Date().toISOString(),
          },
        },
      }));
      
      return completedState;
    });
  }, []);

  const isModuleBankrupt = useCallback(() => {
    return currentModuleState?.money === 0;
  }, [currentModuleState]);

  const completeTutorial = useCallback(() => {
    setState(prev => ({ ...prev, tutorialCompleted: true }));
  }, []);

  const deductMoney = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      money: Math.max(0, prev.money - amount),
    }));
  }, []);

  const markQuestionAnswered = useCallback((questionId: string) => {
    setState(prev => ({
      ...prev,
      answeredQuestions: [...prev.answeredQuestions, questionId],
    }));
  }, []);

  const updateModuleProgress = useCallback(
    (moduleId: string, correctAnswers: number, totalQuestions: number) => {
      setState(prev => ({
        ...prev,
        moduleProgress: {
          ...prev.moduleProgress,
          [moduleId]: {
            completed: true,
            correctAnswers,
            totalQuestions,
            lastPlayedAt: new Date().toISOString(),
          },
        },
      }));
    },
    []
  );

  const resetGame = useCallback(() => {
    setState(getDefaultGameState());
  }, []);

  const getModuleProgress = useCallback((moduleId: string): ModuleProgress | null => {
    return state.moduleProgress[moduleId] || null;
  }, [state.moduleProgress]);

  const getCurrentModuleId = useCallback((): string | null => {
    const moduleIds = ['safety', 'scam', 'digital', 'practice'];
    for (const id of moduleIds) {
      const moduleState = loadModuleState(id);
      if (moduleState.currentQuestionIndex > 0 && !moduleState.completed) {
        return id;
      }
    }
    return null;
  }, []);

  return {
    money: state.money,
    isBankrupt: state.money <= 0,
    answeredQuestions: state.answeredQuestions,
    tutorialCompleted: state.tutorialCompleted,
    moduleProgress: state.moduleProgress,
    currentModule: getCurrentModuleId(),
    
    currentModuleState,
    activeModuleId,
    
    initModule,
    resetModuleProgress,
    getModuleState,
    getModuleProgress,
    deductModuleMoney,
    recordAnswer,
    updateCurrentQuestion,
    completeModule,
    isModuleBankrupt,
    
    deductMoney,
    markQuestionAnswered,
    updateModuleProgress,
    resetGame,
    completeTutorial,
  };
}

export type GameStateHook = ReturnType<typeof useGameState>;

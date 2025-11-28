import { useState, useEffect, useCallback } from 'react';

const INITIAL_MONEY = 100000;
const STORAGE_KEY = 'filteron_game_state';

export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high';
export type QuestionType = 'ox' | 'choice';

export interface OXQuestion {
  id: string;
  type: 'ox';
  message: string;
  sender: string;
  isDangerous: boolean;
  riskLevel: RiskLevel;
  explanation: string;
  category: 'safety' | 'digital' | 'scam' | 'practice';
}

export interface ChoiceQuestion {
  id: string;
  type: 'choice';
  question: string;
  choices: string[];
  correctAnswer: number;
  riskLevel: RiskLevel;
  explanation: string;
  category: 'safety' | 'digital' | 'scam' | 'practice';
}

export type Question = OXQuestion | ChoiceQuestion;

export interface ModuleProgress {
  completed: boolean;
  correctAnswers: number;
  totalQuestions: number;
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
  low: '낮음',
  medium: '중간',
  high: '높음',
  very_high: '매우 높음',
};

export const QUESTIONS: Question[] = [
  {
    id: 'safety-1',
    type: 'ox',
    message: '안녕! 나 근처에 사는 20대 형이야. 너 학교 끝나면 같이 놀자! PC방 가서 게임도 하고 맛있는 것도 사줄게~',
    sender: '알 수 없는 계정',
    isDangerous: true,
    riskLevel: 'very_high',
    explanation: '모르는 성인이 온라인에서 만나자고 하면 절대 응하면 안 돼요! 이건 그루밍(아이를 유인하는 행위)일 수 있어요. 부모님이나 선생님께 바로 말씀드리세요.',
    category: 'safety',
  },
  {
    id: 'safety-2',
    type: 'ox',
    message: '같은 반 친구야! 내일 방과후에 도서관에서 같이 공부하자~',
    sender: '같은 반 친구 수진',
    isDangerous: false,
    riskLevel: 'low',
    explanation: '학교 친구와의 정상적인 약속이에요. 공공장소인 도서관에서 만나는 것도 안전해요!',
    category: 'safety',
  },
  {
    id: 'safety-3',
    type: 'ox',
    message: '너 사진 정말 예쁘다! 나한테만 다른 사진도 더 보여줄 수 있어? 비밀로 해줄게~',
    sender: 'SNS 팔로워',
    isDangerous: true,
    riskLevel: 'very_high',
    explanation: '온라인에서 개인적인 사진을 요구하는 것은 매우 위험해요! 이런 요청은 무시하고 차단한 뒤 부모님께 알려주세요.',
    category: 'safety',
  },
  {
    id: 'safety-4',
    type: 'choice',
    question: '모르는 사람이 온라인에서 "비밀로 해줄게"라며 만나자고 할 때 어떻게 해야 할까요?',
    choices: ['비밀로 해준다니까 만난다', '무시하고 부모님께 말씀드린다', '친구들에게만 알린다', '일단 만나보고 결정한다'],
    correctAnswer: 1,
    riskLevel: 'very_high',
    explanation: '"비밀"을 강조하는 것은 그루밍의 대표적인 특징이에요. 무조건 부모님이나 선생님께 바로 말씀드려야 해요!',
    category: 'safety',
  },
  {
    id: 'safety-5',
    type: 'ox',
    message: '학원에서 만난 친구예요! 주말에 우리 집에서 같이 숙제하자!',
    sender: '학원 친구 민지',
    isDangerous: false,
    riskLevel: 'low',
    explanation: '학원에서 아는 친구와의 약속이에요. 부모님께 말씀드리고 가면 안전해요!',
    category: 'safety',
  },
  {
    id: 'safety-6',
    type: 'choice',
    question: '길에서 모르는 어른이 "엄마가 사고났어, 빨리 차에 타"라고 할 때 어떻게 해야 할까요?',
    choices: ['급하니까 일단 차에 탄다', '거절하고 가까운 가게나 어른에게 도움을 요청한다', '따라가면서 자세한 내용을 물어본다', '친구에게 전화해서 물어본다'],
    correctAnswer: 1,
    riskLevel: 'very_high',
    explanation: '진짜 긴급 상황이라면 경찰이나 학교에서 직접 연락이 와요. 모르는 사람의 차에는 절대 타면 안 돼요!',
    category: 'safety',
  },
  {
    id: 'safety-7',
    type: 'ox',
    message: '나 인스타 인플루언서인데, 너 모델로 데뷔시켜줄게! 개인적으로 만나서 얘기하자~',
    sender: '@model_scout_kr',
    isDangerous: true,
    riskLevel: 'very_high',
    explanation: '정상적인 모델 에이전시는 SNS DM으로 개인적인 만남을 요청하지 않아요. 이런 건 유인 수법일 수 있어요!',
    category: 'safety',
  },
  {
    id: 'safety-8',
    type: 'choice',
    question: '친한 온라인 친구가 "우리 진짜 친구잖아, 집 주소 알려줘"라고 할 때 어떻게 해야 할까요?',
    choices: ['진짜 친구니까 알려준다', '주소 대신 동네 이름만 알려준다', '개인정보는 온라인에서 절대 알려주지 않는다', '선물 보내준다니까 알려준다'],
    correctAnswer: 2,
    riskLevel: 'high',
    explanation: '온라인에서 아무리 친해도 집 주소, 학교, 전화번호 같은 개인정보는 절대 알려주면 안 돼요!',
    category: 'safety',
  },
  {
    id: 'safety-9',
    type: 'ox',
    message: '안녕~ 나 17살인데 게임 같이 하자! 너도 중학생이지? 카톡 아이디 알려줘!',
    sender: '게임 유저',
    isDangerous: true,
    riskLevel: 'high',
    explanation: '온라인에서 나이를 속이기는 쉬워요. 모르는 사람에게 개인 연락처를 알려주면 안 돼요!',
    category: 'safety',
  },
  {
    id: 'safety-10',
    type: 'ox',
    message: '우리 아빠가 너희 집 근처라고 해서 학교까지 태워다 줄 수 있대! 내일 아침에 어디서 만날까?',
    sender: '같은 반 친구 현우',
    isDangerous: false,
    riskLevel: 'low',
    explanation: '같은 반 친구 부모님이 태워다 주겠다는 것은 정상적인 제안이에요. 부모님께 확인하고 결정하면 돼요!',
    category: 'safety',
  },
  {
    id: 'safety-11',
    type: 'choice',
    question: '온라인에서 알게 된 사람이 용돈을 준다며 만나자고 해요. 어떻게 해야 할까요?',
    choices: ['용돈이 필요하니까 만난다', '공공장소에서 만나면 괜찮다', '절대 만나지 않고 부모님께 알린다', '친구랑 같이 가면 안전하다'],
    correctAnswer: 2,
    riskLevel: 'very_high',
    explanation: '돈이나 선물을 미끼로 만남을 유도하는 것은 전형적인 유인 수법이에요. 절대 만나면 안 됩니다!',
    category: 'safety',
  },
  {
    id: 'safety-12',
    type: 'ox',
    message: '야 나 준호인데 오늘 체육시간에 너 진짜 웃겼어ㅋㅋ 내일 또 보자!',
    sender: '같은 반 준호',
    isDangerous: false,
    riskLevel: 'low',
    explanation: '학교에서 일어난 일을 이야기하는 평범한 친구 메시지예요!',
    category: 'safety',
  },
  {
    id: 'safety-13',
    type: 'choice',
    question: '그루밍(아동 유인)의 특징이 아닌 것은 무엇일까요?',
    choices: ['처음부터 선물이나 돈을 제안한다', '"비밀이야" "부모님한테 말하지 마"라고 한다', '학교 선생님이 수업 시간에 설명한다', '점점 사적인 질문이나 사진을 요구한다'],
    correctAnswer: 2,
    riskLevel: 'medium',
    explanation: '그루밍은 선물 제안, 비밀 강요, 사적인 요구가 특징이에요. 선생님의 정상적인 교육과는 완전히 달라요!',
    category: 'safety',
  },
  {
    id: 'safety-14',
    type: 'ox',
    message: '네가 보낸 사진 다 저장해뒀어. 말 안 들으면 학교에 뿌릴 거야.',
    sender: '알 수 없음',
    isDangerous: true,
    riskLevel: 'very_high',
    explanation: '이건 협박이에요! 무섭겠지만 혼자 고민하지 말고 바로 부모님이나 선생님께 말씀드리세요. 여러분 잘못이 아니에요!',
    category: 'safety',
  },
  {
    id: 'safety-15',
    type: 'choice',
    question: '위험한 상황에 처했을 때 도움을 요청할 수 있는 곳으로 올바른 것은?',
    choices: ['온라인 친구', '부모님, 선생님, 112, 117(아동학대 신고)', 'SNS에 글 올리기', '혼자 해결하기'],
    correctAnswer: 1,
    riskLevel: 'medium',
    explanation: '위험할 때는 부모님, 선생님, 112(경찰), 117(아동학대 신고전화)에 도움을 요청하세요!',
    category: 'safety',
  },
  
  {
    id: 'scam-1',
    type: 'ox',
    message: '로블록스 무료 로벅스 10000개 받으세요! 지금 바로 클릭! → game-free.xyz',
    sender: '게임무료아이템',
    isDangerous: true,
    riskLevel: 'high',
    explanation: '무료 게임 아이템을 미끼로 하는 사기예요! 공식 게임사가 아닌 곳에서 주는 무료 아이템은 99% 사기입니다.',
    category: 'scam',
  },
  {
    id: 'scam-2',
    type: 'ox',
    message: '마인크래프트 다이아몬드 무한 생성 핵! 설치파일 다운로드: mchack.kr/download',
    sender: '게임치트공유',
    isDangerous: true,
    riskLevel: 'very_high',
    explanation: '게임 핵이나 치트 파일에는 악성코드가 숨어있어요! 컴퓨터가 해킹당하거나, 게임 계정이 정지될 수 있어요.',
    category: 'scam',
  },
  {
    id: 'scam-3',
    type: 'ox',
    message: '친구야 오늘 저녁에 마인크래프트 같이 할래? 우리 서버 ip 알려줄게!',
    sender: '같은 반 친구 정민',
    isDangerous: false,
    riskLevel: 'low',
    explanation: '친구와의 정상적인 게임 약속이에요! 아는 친구가 함께 게임하자고 하는 건 안전해요.',
    category: 'scam',
  },
  {
    id: 'scam-4',
    type: 'ox',
    message: '지금 접속하면 스킨 50% 할인! 결제는 문화상품권으로만 가능. 카카오톡: gameitem123',
    sender: '아이템거래',
    isDangerous: true,
    riskLevel: 'high',
    explanation: '문화상품권으로 결제하라는 건 사기 신호예요! 상품권 번호를 알려주면 돈만 뺏기고 아이템은 못 받아요.',
    category: 'scam',
  },
  {
    id: 'scam-5',
    type: 'choice',
    question: '온라인 도박 사이트의 위험성으로 옳지 않은 것은?',
    choices: ['불법이라 처벌받을 수 있다', '돈을 잃어도 다시 딸 수 있다', '개인정보가 유출될 수 있다', '중독되기 쉽다'],
    correctAnswer: 1,
    riskLevel: 'high',
    explanation: '도박은 "다시 딸 수 있다"는 생각이 가장 위험해요. 실제로는 계속 돈을 잃게 되고, 불법이라 처벌도 받아요!',
    category: 'scam',
  },
  {
    id: 'scam-6',
    type: 'ox',
    message: '🎰 하루에 100만원 버는 법! 지금 가입하면 보너스 10만원! → lucky777.xyz',
    sender: '행운의카지노',
    isDangerous: true,
    riskLevel: 'very_high',
    explanation: '온라인 도박 광고예요! 청소년 도박은 불법이고, 돈을 벌 수 없어요. 오히려 돈을 잃고 중독되기 쉬워요.',
    category: 'scam',
  },
  {
    id: 'scam-7',
    type: 'ox',
    message: '[배틀그라운드] 친구 초대 이벤트! 친구 초대하고 무료 스킨 받으세요. 공식 앱에서 확인하세요.',
    sender: 'PUBG 공식',
    isDangerous: false,
    riskLevel: 'low',
    explanation: '게임사 공식 이벤트 안내예요! 링크 대신 "공식 앱에서 확인하세요"라고 안내하는 건 안전한 방식이에요.',
    category: 'scam',
  },
  {
    id: 'scam-8',
    type: 'choice',
    question: '게임 아이템 사기를 피하는 방법으로 옳은 것은?',
    choices: ['개인 거래가 더 싸서 좋다', '문화상품권으로 결제한다', '공식 스토어에서만 구매한다', 'SNS 광고를 믿는다'],
    correctAnswer: 2,
    riskLevel: 'medium',
    explanation: '게임 아이템은 반드시 공식 스토어에서만 구매해야 안전해요! 개인 거래나 외부 사이트는 사기 위험이 높아요.',
    category: 'scam',
  },
  {
    id: 'scam-9',
    type: 'ox',
    message: '스포츠 토토 100% 적중! 학생도 가입 가능! 지금 바로 참여하세요!',
    sender: '토토사이트',
    isDangerous: true,
    riskLevel: 'very_high',
    explanation: '청소년 도박은 불법이에요! "100% 적중"은 거짓말이고, 돈만 잃게 돼요. 절대 참여하면 안 됩니다!',
    category: 'scam',
  },
  {
    id: 'scam-10',
    type: 'choice',
    question: '친구가 "돈 쉽게 버는 법 알려줄게"라며 도박 사이트를 추천하면 어떻게 해야 할까요?',
    choices: ['친구 말이니까 한 번 해본다', '조금만 해보고 그만둔다', '거절하고 도박의 위험성을 알려준다', '부모님 몰래 하면 괜찮다'],
    correctAnswer: 2,
    riskLevel: 'high',
    explanation: '친구가 권해도 도박은 절대 안 돼요! 오히려 친구에게 도박의 위험성을 알려주세요.',
    category: 'scam',
  },
  {
    id: 'scam-11',
    type: 'ox',
    message: '포트나이트 무료 V-Bucks 생성기! 이메일과 게임 아이디만 입력하세요!',
    sender: '@free_vbucks',
    isDangerous: true,
    riskLevel: 'high',
    explanation: '무료 게임 화폐 생성기는 전부 사기예요! 이메일과 게임 아이디를 입력하면 계정이 해킹당해요.',
    category: 'scam',
  },
  {
    id: 'scam-12',
    type: 'ox',
    message: '어벤져스 엔드게임 무료 다운! 고화질! → movie-free.xyz/download',
    sender: '무료영화',
    isDangerous: true,
    riskLevel: 'high',
    explanation: '불법 다운로드 사이트예요! 악성코드에 감염될 수 있고, 저작권법 위반으로 처벌받을 수 있어요.',
    category: 'scam',
  },
  {
    id: 'scam-13',
    type: 'choice',
    question: '도박 중독의 증상이 아닌 것은?',
    choices: ['도박 생각이 계속 난다', '잃은 돈을 되찾으려고 더 베팅한다', '가끔 친구와 보드게임을 한다', '도박을 위해 거짓말을 한다'],
    correctAnswer: 2,
    riskLevel: 'medium',
    explanation: '친구와 보드게임 하는 것은 건전한 놀이예요. 도박 중독은 돈에 집착하고 거짓말하게 되는 것이 특징이에요.',
    category: 'scam',
  },
  {
    id: 'scam-14',
    type: 'ox',
    message: '레전드 스킨 단돈 5000원에 판매! 선입금하면 바로 전송! 카톡: trade999',
    sender: '아이템마켓',
    isDangerous: true,
    riskLevel: 'high',
    explanation: '선입금 요구는 사기의 전형적인 수법이에요! 돈만 받고 아이템은 안 보내요. 공식 거래만 이용하세요!',
    category: 'scam',
  },
  {
    id: 'scam-15',
    type: 'choice',
    question: '게임 핵이나 치트 프로그램의 위험성으로 올바른 것은?',
    choices: ['게임 실력이 늘어난다', '악성코드가 포함되어 있을 수 있다', '게임사에서 허용한다', '친구에게 인기가 많아진다'],
    correctAnswer: 1,
    riskLevel: 'high',
    explanation: '핵이나 치트 파일에는 대부분 악성코드가 숨어있어요. 계정 정지도 당하고 컴퓨터도 해킹될 수 있어요!',
    category: 'scam',
  },
  
  {
    id: 'digital-1',
    type: 'ox',
    message: '엄마야, 급해. 지금 바로 여기로 10만원 보내줘. 010-XXXX-XXXX',
    sender: '010-1234-5678',
    isDangerous: true,
    riskLevel: 'very_high',
    explanation: '가족을 사칭한 긴급 송금 사기예요! 실제 가족이 돈이 급하게 필요하다면 꼭 전화로 직접 확인하세요.',
    category: 'digital',
  },
  {
    id: 'digital-2',
    type: 'ox',
    message: '[CJ대한통운] 택배가 주소 불명으로 반송 예정입니다. 주소 확인: hxxp://bit.ly/abc123',
    sender: '발신번호 없음',
    isDangerous: true,
    riskLevel: 'high',
    explanation: '택배 회사를 사칭한 스미싱 문자예요! 링크를 클릭하면 악성 앱이 설치돼요. 택배는 공식 앱에서 확인하세요.',
    category: 'digital',
  },
  {
    id: 'digital-3',
    type: 'ox',
    message: '친구야! 내일 학교 앞 카페에서 만나자. 시험 끝나고 바로 갈게~',
    sender: '민수',
    isDangerous: false,
    riskLevel: 'low',
    explanation: '친구와의 평범한 메시지예요! 링크도 없고, 돈을 요구하지도 않아요. 안전한 메시지랍니다.',
    category: 'digital',
  },
  {
    id: 'digital-4',
    type: 'ox',
    message: '야 나 지훈인데 폰 바꿔서 번호 바뀌었어. 저장해줘! 참 용돈 좀 빌려줄 수 있어?',
    sender: '알 수 없는 계정',
    isDangerous: true,
    riskLevel: 'high',
    explanation: '친구를 사칭한 SNS 사기예요! 친구가 번호를 바꿨다면서 돈을 빌려달라고 하면, 기존 연락처로 확인하세요.',
    category: 'digital',
  },
  {
    id: 'digital-5',
    type: 'choice',
    question: '스미싱 문자의 특징이 아닌 것은?',
    choices: ['이상한 링크가 포함되어 있다', '급하게 행동하도록 유도한다', '발신번호가 없거나 이상하다', '친구가 직접 보낸 일상 대화'],
    correctAnswer: 3,
    riskLevel: 'medium',
    explanation: '친구의 일상 대화는 스미싱이 아니에요. 스미싱은 이상한 링크, 급한 요청, 수상한 발신번호가 특징이에요!',
    category: 'digital',
  },
  {
    id: 'digital-6',
    type: 'ox',
    message: '인스타 팔로워 1만명 만들어줄게! 일단 계정 아이디랑 비번 알려줘~',
    sender: '@follower_boost_kr',
    isDangerous: true,
    riskLevel: 'very_high',
    explanation: '계정 비밀번호를 요구하는 건 해킹 시도예요! 절대 비밀번호를 알려주면 안 됩니다.',
    category: 'digital',
  },
  {
    id: 'digital-7',
    type: 'ox',
    message: '[국민건강보험] 건강검진 결과 이상 소견이 발견되었습니다. 확인: hxxp://health.kr/xxx',
    sender: '1577-1000',
    isDangerous: true,
    riskLevel: 'high',
    explanation: '공공기관을 사칭한 스미싱이에요! 건강보험공단은 이런 방식으로 링크를 보내지 않아요.',
    category: 'digital',
  },
  {
    id: 'digital-8',
    type: 'choice',
    question: 'SNS에서 친구가 갑자기 돈을 빌려달라고 할 때 어떻게 해야 할까요?',
    choices: ['바로 돈을 보내준다', '전화나 직접 만나서 확인한다', '더 많이 빌려준다', '무시한다'],
    correctAnswer: 1,
    riskLevel: 'high',
    explanation: 'SNS 계정이 해킹되어 사기꾼이 메시지를 보낼 수 있어요. 전화로 직접 확인하는 것이 가장 안전해요!',
    category: 'digital',
  },
  {
    id: 'digital-9',
    type: 'ox',
    message: '축하합니다! 당첨되셨습니다. 경품 수령을 위해 주민번호와 계좌번호를 입력해주세요.',
    sender: '이벤트당첨',
    isDangerous: true,
    riskLevel: 'very_high',
    explanation: '개인정보 탈취 사기예요! 주민번호나 계좌번호를 문자로 요구하는 곳은 100% 사기입니다.',
    category: 'digital',
  },
  {
    id: 'digital-10',
    type: 'ox',
    message: '안녕! 나 연예인 XXX 팬클럽 회장이야. 회비 1만원만 보내면 사인 포토카드 보내줄게!',
    sender: '@fanclub_official',
    isDangerous: true,
    riskLevel: 'medium',
    explanation: 'SNS에서 돈을 요구하는 사람은 조심해야 해요! 공식 팬클럽은 개인 DM으로 돈을 요구하지 않아요.',
    category: 'digital',
  },
  {
    id: 'digital-11',
    type: 'choice',
    question: '안전한 비밀번호 만들기로 올바른 것은?',
    choices: ['생년월일 사용', '같은 비밀번호를 모든 곳에서 사용', '영문, 숫자, 특수문자 조합으로 12자 이상', '12345678 사용'],
    correctAnswer: 2,
    riskLevel: 'medium',
    explanation: '안전한 비밀번호는 영문, 숫자, 특수문자를 섞어서 12자 이상으로 만들어야 해요!',
    category: 'digital',
  },
  {
    id: 'digital-12',
    type: 'ox',
    message: '우리 반 단톡방에서 나갔네? 다시 들어와~ 내일 체육대회 준비해야 해!',
    sender: '반장 김서연',
    isDangerous: false,
    riskLevel: 'low',
    explanation: '실제 반 친구의 정상적인 메시지예요! 링크도 없고 돈 요구도 없어서 안전해요.',
    category: 'digital',
  },
  {
    id: 'digital-13',
    type: 'choice',
    question: '피싱 사이트를 구별하는 방법으로 옳지 않은 것은?',
    choices: ['주소창에 자물쇠 아이콘 확인', '사이트 주소가 이상한지 확인', '디자인이 예쁘면 안전하다', '공식 앱을 통해 접속'],
    correctAnswer: 2,
    riskLevel: 'medium',
    explanation: '피싱 사이트도 디자인이 예쁠 수 있어요! 주소와 자물쇠 아이콘을 확인하는 것이 중요해요.',
    category: 'digital',
  },
  {
    id: 'digital-14',
    type: 'ox',
    message: '긴급! 계정이 해킹되었습니다. 지금 바로 이 링크에서 비밀번호를 변경하세요: account-security.xyz',
    sender: '보안알림',
    isDangerous: true,
    riskLevel: 'very_high',
    explanation: '이건 피싱 사기예요! 진짜 보안 알림은 절대 외부 링크로 연결하지 않아요. 공식 앱에서 직접 확인하세요.',
    category: 'digital',
  },
  {
    id: 'digital-15',
    type: 'choice',
    question: '모르는 사람에게서 친구 추가 요청이 왔을 때 어떻게 해야 할까요?',
    choices: ['팔로워가 늘어나니까 수락한다', '거절하거나 무시한다', '먼저 DM을 보낸다', '프로필만 보고 수락한다'],
    correctAnswer: 1,
    riskLevel: 'medium',
    explanation: '모르는 사람의 친구 요청은 거절하거나 무시하는 것이 안전해요. 프로필도 가짜일 수 있어요!',
    category: 'digital',
  },
];

export const getQuestionsByCategory = (category: string): Question[] => {
  if (category === 'practice') {
    const allQuestions = [...QUESTIONS];
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }
    return allQuestions.slice(0, 20);
  }
  return QUESTIONS.filter(q => q.category === category);
};

const getDefaultState = (): GameState => ({
  money: INITIAL_MONEY,
  answeredQuestions: [],
  currentModule: null,
  tutorialCompleted: false,
  moduleProgress: {},
});

const getInitialState = (): GameState => {
  if (typeof window === 'undefined') {
    return getDefaultState();
  }
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        ...getDefaultState(),
        ...parsed,
      };
    } catch {
      return getDefaultState();
    }
  }
  return getDefaultState();
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

  const updateModuleProgress = useCallback((
    moduleId: string, 
    correctAnswers: number, 
    totalQuestions: number
  ) => {
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
  }, []);

  const getModuleProgress = useCallback((moduleId: string): ModuleProgress | null => {
    return state.moduleProgress[moduleId] || null;
  }, [state.moduleProgress]);

  const resetGame = useCallback(() => {
    setState({
      money: INITIAL_MONEY,
      answeredQuestions: [],
      currentModule: null,
      tutorialCompleted: true,
      moduleProgress: {},
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
    updateModuleProgress,
    getModuleProgress,
    resetGame,
  };
}

export type GameStateHook = ReturnType<typeof useGameState>;

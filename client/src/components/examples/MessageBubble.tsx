import MessageBubble from '../MessageBubble';

export default function MessageBubbleExample() {
  return (
    <div className="p-8 bg-background space-y-4">
      <MessageBubble 
        message="엄마야, 급해. 지금 바로 여기로 10만원 보내줘. 010-XXXX-XXXX"
        sender="010-1234-5678"
      />
      <MessageBubble 
        message="친구야! 내일 학교 앞 카페에서 만나자. 시험 끝나고 바로 갈게~"
        sender="민수"
      />
    </div>
  );
}

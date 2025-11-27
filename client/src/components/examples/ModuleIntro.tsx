import ModuleIntro from '../ModuleIntro';
import { MessageSquareWarning } from 'lucide-react';

export default function ModuleIntroExample() {
  return (
    <div className="p-8 bg-background">
      <ModuleIntro
        title="스미싱 알아보기"
        description="이상한 문자 메시지를 구별하는 방법을 배워요!"
        icon={MessageSquareWarning}
        color="bg-blue-500"
        tips={[
          '링크가 포함된 문자는 항상 조심하세요',
          '모르는 번호에서 온 급한 요청은 의심하세요',
          '개인정보나 돈을 요구하면 100% 사기예요',
        ]}
        questionCount={5}
        onStart={() => console.log('Start clicked')}
        onBack={() => console.log('Back clicked')}
      />
    </div>
  );
}

import { useState } from 'react';
import ResultScreen from '../ResultScreen';
import { Button } from '@/components/ui/button';

export default function ResultScreenExample() {
  const [money, setMoney] = useState(75000);

  return (
    <div className="p-8 bg-background space-y-4">
      <div className="flex gap-2 justify-center mb-4">
        <Button size="sm" onClick={() => setMoney(95000)}>95,000원</Button>
        <Button size="sm" onClick={() => setMoney(65000)}>65,000원</Button>
        <Button size="sm" onClick={() => setMoney(35000)}>35,000원</Button>
        <Button size="sm" onClick={() => setMoney(10000)}>10,000원</Button>
      </div>
      <ResultScreen 
        finalMoney={money}
        onRestart={() => console.log('Restart clicked')}
      />
    </div>
  );
}

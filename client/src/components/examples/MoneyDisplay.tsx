import { useState } from 'react';
import MoneyDisplay from '../MoneyDisplay';
import { Button } from '@/components/ui/button';

export default function MoneyDisplayExample() {
  const [money, setMoney] = useState(100000);
  const [moneyChange, setMoneyChange] = useState<number | null>(null);

  const handleDeduct = (amount: number) => {
    setMoneyChange(-amount);
    setMoney(prev => Math.max(0, prev - amount));
    setTimeout(() => setMoneyChange(null), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-background">
      <div className="flex gap-4">
        <MoneyDisplay amount={money} moneyChange={moneyChange} size="sm" />
        <MoneyDisplay amount={money} moneyChange={moneyChange} size="md" />
        <MoneyDisplay amount={money} moneyChange={moneyChange} size="lg" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => handleDeduct(5000)}>-5,000원</Button>
        <Button size="sm" onClick={() => handleDeduct(15000)}>-15,000원</Button>
        <Button size="sm" onClick={() => handleDeduct(30000)}>-30,000원</Button>
        <Button size="sm" variant="outline" onClick={() => setMoney(100000)}>리셋</Button>
      </div>
    </div>
  );
}

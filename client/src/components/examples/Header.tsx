import { useState } from 'react';
import Header from '../Header';

export default function HeaderExample() {
  const [money] = useState(85000);
  const [moneyChange] = useState<number | null>(null);

  return (
    <div className="bg-background min-h-[120px]">
      <Header money={money} moneyChange={moneyChange} />
    </div>
  );
}

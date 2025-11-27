import { useState } from 'react';
import TimerBar from '../TimerBar';
import { Button } from '@/components/ui/button';

export default function TimerBarExample() {
  const [isRunning, setIsRunning] = useState(false);
  const [key, setKey] = useState(0);

  const handleStart = () => {
    setKey(prev => prev + 1);
    setIsRunning(true);
  };

  return (
    <div className="p-8 bg-background space-y-4 max-w-md">
      <TimerBar 
        key={key}
        duration={30}
        isRunning={isRunning}
        onTimeUp={() => {
          setIsRunning(false);
          console.log('Time is up!');
        }}
      />
      <div className="flex gap-2">
        <Button onClick={handleStart}>시작</Button>
        <Button variant="outline" onClick={() => setIsRunning(false)}>정지</Button>
      </div>
    </div>
  );
}

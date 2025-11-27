import { useState } from 'react';
import QuizQuestion from '../QuizQuestion';
import { QUESTIONS } from '@/lib/gameState';

export default function QuizQuestionExample() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const question = QUESTIONS[questionIndex];

  return (
    <div className="p-8 bg-background min-h-[600px]">
      <QuizQuestion
        question={question}
        onAnswer={(isCorrect, deduction) => {
          console.log(`Answer: ${isCorrect ? 'Correct' : 'Wrong'}, Deduction: ${deduction}`);
        }}
        onNext={() => {
          setQuestionIndex(prev => (prev + 1) % QUESTIONS.length);
        }}
        questionNumber={questionIndex + 1}
        totalQuestions={QUESTIONS.length}
      />
    </div>
  );
}

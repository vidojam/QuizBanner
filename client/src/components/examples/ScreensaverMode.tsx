import { useState } from 'react';
import ScreensaverMode from '../ScreensaverMode';
import { Button } from '@/components/ui/button';

export default function ScreensaverModeExample() {
  const [isActive, setIsActive] = useState(false);
  
  const mockQuestions = [
    { id: '1', question: 'What is the capital of France?', answer: 'Paris' },
    { id: '2', question: 'What is 2 + 2?', answer: '4' },
    { id: '3', question: 'Who wrote Romeo and Juliet?', answer: 'William Shakespeare' },
  ];

  if (isActive) {
    return (
      <ScreensaverMode 
        questions={mockQuestions}
        onExit={() => setIsActive(false)}
      />
    );
  }

  return (
    <div className="p-8">
      <Button onClick={() => setIsActive(true)}>
        Start Screensaver
      </Button>
    </div>
  );
}

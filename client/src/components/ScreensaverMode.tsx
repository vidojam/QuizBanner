import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import ScreensaverBanner from "./ScreensaverBanner";
import type { QuestionAnswer } from "@shared/schema";

interface ScreensaverModeProps {
  questions: QuestionAnswer[];
  onExit: () => void;
}

function getRandomColor(): string {
  const vibrantColors = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12', 
    '#9b59b6', '#1abc9c', '#e67e22', '#16a085',
    '#27ae60', '#2980b9', '#8e44ad', '#c0392b',
    '#d35400', '#2c3e50', '#7f8c8d', '#f1c40f'
  ];
  return vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function ScreensaverMode({ questions, onExit }: ScreensaverModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledQuestions] = useState(() => shuffleArray(questions));
  const [bannerPosition, setBannerPosition] = useState(() => Math.random() * 80);
  const [backgroundColor, setBackgroundColor] = useState(() => getRandomColor());

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onExit]);

  const handleComplete = () => {
    setBannerPosition(Math.random() * 80);
    setBackgroundColor(getRandomColor());
    
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  if (shuffledQuestions.length === 0) {
    return null;
  }

  const currentQuestion = shuffledQuestions[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black"
      data-testid="screensaver-mode"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onExit}
        data-testid="button-exit-screensaver"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
      >
        <X className="w-6 h-6" />
      </Button>

      <div 
        className="absolute left-0 right-0"
        style={{ top: `${bannerPosition}%` }}
      >
        <ScreensaverBanner
          key={currentQuestion.id}
          question={currentQuestion.question}
          answer={currentQuestion.answer}
          backgroundColor={backgroundColor}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}

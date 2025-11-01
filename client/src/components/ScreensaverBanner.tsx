import { useEffect, useState } from "react";

export type BannerPosition = 'bottom' | 'top' | 'left' | 'right' | 'random';

interface ScreensaverBannerProps {
  question: string;
  answer: string;
  backgroundColor: string;
  position: BannerPosition;
  randomOffset?: number;
  onComplete: () => void;
}

export default function ScreensaverBanner({ 
  question, 
  answer, 
  backgroundColor,
  position,
  randomOffset = 50,
  onComplete
}: ScreensaverBannerProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const scrollDuration = 15000; // 15 seconds for scrolling

  useEffect(() => {
    setShowAnswer(false);

    // Show answer after question finishes scrolling
    const answerTimer = setTimeout(() => {
      setShowAnswer(true);
    }, scrollDuration);

    // Complete after both question and answer have scrolled
    const completeTimer = setTimeout(() => {
      onComplete();
    }, scrollDuration * 2);

    return () => {
      clearTimeout(answerTimer);
      clearTimeout(completeTimer);
    };
  }, [question, answer, onComplete]);

  const getPositionStyles = () => {
    if (position === 'bottom') return { bottom: 0, left: 0, right: 0 };
    if (position === 'top') return { top: 0, left: 0, right: 0 };
    if (position === 'left') return { left: 0, top: '45%' };
    if (position === 'right') return { right: 0, top: '45%' };
    if (position === 'random') return { top: `${randomOffset}%`, left: 0, right: 0 };
    return {};
  };

  return (
    <div 
      className="h-12 w-full flex items-center text-white relative overflow-hidden"
      style={{ 
        backgroundColor,
        position: 'absolute',
        ...getPositionStyles()
      }}
      data-testid="screensaver-banner"
    >
      <style>
        {`
          @keyframes scroll-horizontal {
            from { transform: translateX(-100%); }
            to { transform: translateX(100vw); }
          }
          .scroll-question-horizontal {
            animation: scroll-horizontal 15s linear forwards;
          }
          .scroll-answer-horizontal {
            animation: scroll-horizontal 15s linear forwards;
          }
        `}
      </style>
      
      <div 
        className="absolute whitespace-nowrap scroll-question-horizontal"
        data-testid="text-question-display"
      >
        <span 
          className="text-xl font-bold px-8"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}
        >
          Q: {question}
        </span>
      </div>

      {showAnswer && (
        <div 
          className="absolute whitespace-nowrap scroll-answer-horizontal"
          data-testid="answer-section"
        >
          <span 
            className="text-xl font-bold px-8"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}
            data-testid="text-answer-display"
          >
            A: {answer}
          </span>
        </div>
      )}
    </div>
  );
}

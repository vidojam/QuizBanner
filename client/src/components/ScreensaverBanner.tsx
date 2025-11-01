import { useEffect, useState } from "react";

interface ScreensaverBannerProps {
  question: string;
  answer: string;
  backgroundColor: string;
  onComplete: () => void;
  answerDelay?: number;
}

export default function ScreensaverBanner({ 
  question, 
  answer, 
  backgroundColor,
  onComplete,
  answerDelay = 15000
}: ScreensaverBannerProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setShowAnswer(false);

    const answerTimer = setTimeout(() => {
      setShowAnswer(true);
    }, 2000);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, answerDelay);

    return () => {
      clearTimeout(answerTimer);
      clearTimeout(completeTimer);
    };
  }, [question, answer, answerDelay, onComplete]);

  return (
    <div 
      className="h-12 w-full flex items-center text-white relative overflow-hidden"
      style={{ backgroundColor }}
      data-testid="screensaver-banner"
    >
      <style>
        {`
          @keyframes scroll-left-to-right {
            from {
              transform: translateX(-100%);
            }
            to {
              transform: translateX(100vw);
            }
          }
          .scroll-question {
            animation: scroll-left-to-right 15s linear infinite;
          }
          .scroll-answer {
            animation: scroll-left-to-right 15s linear infinite;
          }
        `}
      </style>
      
      <div 
        className="absolute whitespace-nowrap scroll-question"
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
          className="absolute whitespace-nowrap scroll-answer"
          data-testid="answer-section"
          style={{ animationDelay: '0s' }}
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

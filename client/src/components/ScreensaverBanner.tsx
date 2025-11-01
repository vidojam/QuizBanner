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
  const [timeLeft, setTimeLeft] = useState(answerDelay / 1000);

  useEffect(() => {
    setShowAnswer(false);
    setTimeLeft(answerDelay / 1000);

    const timer = setTimeout(() => {
      setShowAnswer(true);
    }, answerDelay);

    const countdown = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, answerDelay * 2);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
      clearInterval(countdown);
    };
  }, [question, answer, answerDelay, onComplete]);

  return (
    <div 
      className="h-12 w-full flex items-center px-8 text-white relative overflow-hidden"
      style={{ backgroundColor }}
      data-testid="screensaver-banner"
    >
      <div className="flex items-center gap-6 w-full">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold uppercase tracking-wider opacity-90">
            Q:
          </span>
          <span 
            className="text-lg font-bold"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
            data-testid="text-question-display"
          >
            {question}
          </span>
        </div>

        {!showAnswer && (
          <div className="text-sm font-semibold opacity-80 ml-auto" data-testid="text-timer">
            {timeLeft}s
          </div>
        )}

        {showAnswer && (
          <div 
            className="flex items-center gap-3 animate-in fade-in duration-500 ml-auto"
            data-testid="answer-section"
          >
            <span className="text-sm font-semibold uppercase tracking-wider opacity-90">
              A:
            </span>
            <span 
              className="text-lg font-semibold"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
              data-testid="text-answer-display"
            >
              {answer}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

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
      className="min-h-[50vh] h-3/4 w-full flex flex-col items-center justify-center p-16 text-white relative"
      style={{ backgroundColor }}
      data-testid="screensaver-banner"
    >
      <div className="max-w-5xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="text-xl font-semibold uppercase tracking-widest opacity-90">
            Question
          </div>
          <h1 
            className="text-5xl md:text-6xl font-bold leading-tight"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            data-testid="text-question-display"
          >
            {question}
          </h1>
        </div>

        {!showAnswer && (
          <div className="text-2xl font-semibold opacity-80" data-testid="text-timer">
            Answer in {timeLeft}s
          </div>
        )}

        {showAnswer && (
          <div 
            className="space-y-4 animate-in fade-in duration-500"
            data-testid="answer-section"
          >
            <div className="text-xl font-semibold uppercase tracking-widest opacity-90">
              Answer
            </div>
            <h2 
              className="text-4xl md:text-5xl font-semibold leading-tight"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
              data-testid="text-answer-display"
            >
              {answer}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}

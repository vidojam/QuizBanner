import { useEffect, useState, useRef } from "react";

export type BannerPosition = 'bottom' | 'top' | 'left' | 'right' | 'random';

interface ScreensaverBannerProps {
  question: string;
  answer: string;
  backgroundColor: string;
  textColor?: string;
  position: BannerPosition;
  randomOffset?: number;
  onComplete: () => void;
  duration?: number; // in seconds, default 5
  isPaused?: boolean;
  bannerHeight?: number; // in pixels, default 48
  fontSize?: number; // in pixels, default 48
}

export default function ScreensaverBanner({ 
  question, 
  answer, 
  backgroundColor,
  textColor = '#ffffff',
  position,
  randomOffset = 50,
  onComplete,
  duration = 5,
  isPaused = false,
  bannerHeight = 48,
  fontSize = 48
}: ScreensaverBannerProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const questionRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  // When question animation ends, show answer
  const handleQuestionAnimationEnd = () => {
    if (!isPaused) {
      setShowAnswer(true);
    }
  };

  // When answer animation ends, complete and move to next position
  const handleAnswerAnimationEnd = () => {
    if (!isPaused) {
      onComplete();
    }
  };

  // Reset state when question/answer/duration changes
  useEffect(() => {
    setShowAnswer(false);
  }, [question, answer, duration]);

  const isVertical = position === 'left' || position === 'right';

  const getPositionStyles = () => {
    if (position === 'bottom') return { bottom: 0, left: 0, right: 0 };
    if (position === 'top') return { top: 0, left: 0, right: 0 };
    if (position === 'left') return { left: 0, top: 0, bottom: 0 };
    if (position === 'right') return { right: 0, top: 0, bottom: 0 };
    if (position === 'random') return { top: `${randomOffset}%`, left: 0, right: 0 };
    return {};
  };

  return (
    <div 
      className={`flex items-center relative overflow-hidden ${
        isVertical ? 'h-full' : 'w-full'
      }`}
      style={{ 
        backgroundColor,
        color: textColor,
        position: 'absolute',
        width: isVertical ? `${bannerHeight}px` : '100%',
        height: isVertical ? '100%' : `${bannerHeight}px`,
        ...getPositionStyles()
      }}
      data-testid="screensaver-banner"
    >
      <div 
        ref={questionRef}
        className={`absolute whitespace-nowrap banner-scroll ${isVertical ? 'banner-scroll-vertical' : 'banner-scroll-horizontal'}`}
        data-testid="text-question-display"
        onAnimationEnd={handleQuestionAnimationEnd}
        style={{
          '--animation-duration': `${duration}s`,
          animationPlayState: isPaused ? 'paused' : 'running',
          ...(isVertical ? {
            writingMode: 'vertical-lr',
            textOrientation: 'upright'
          } : {})
        } as React.CSSProperties}
      >
        <span 
          className="font-bold px-8"
          style={{ 
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            fontSize: `${fontSize}px`,
            lineHeight: 1.2
          }}
        >
          Q: {question}
        </span>
      </div>

      {showAnswer && (
        <div 
          ref={answerRef}
          className={`absolute whitespace-nowrap banner-scroll ${isVertical ? 'banner-scroll-vertical' : 'banner-scroll-horizontal'}`}
          data-testid="answer-section"
          onAnimationEnd={handleAnswerAnimationEnd}
          style={{
            '--animation-duration': `${duration}s`,
            animationPlayState: isPaused ? 'paused' : 'running',
            ...(isVertical ? {
              writingMode: 'vertical-lr',
              textOrientation: 'upright'
            } : {})
          } as React.CSSProperties}
        >
          <span 
            className="font-bold px-8"
            style={{ 
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              fontSize: `${fontSize}px`,
              lineHeight: 1.2
            }}
            data-testid="text-answer-display"
          >
            A: {answer}
          </span>
        </div>
      )}
    </div>
  );
}

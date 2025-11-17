import { useEffect, useState, useRef } from "react";

export type BannerPosition = 'bottom' | 'top' | 'left' | 'right';

interface ScreensaverBannerProps {
  question: string;
  answer: string;
  backgroundColor: string;
  textColor?: string;
  position: BannerPosition;
  onComplete: () => void;
  duration?: number; // in seconds, base duration for speed calculation
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
  onComplete,
  duration = 5,
  isPaused = false,
  bannerHeight = 48,
  fontSize = 48
}: ScreensaverBannerProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionDuration, setQuestionDuration] = useState(duration);
  const [answerDuration, setAnswerDuration] = useState(duration);
  const [isReady, setIsReady] = useState(false);
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

  // Calculate durations based on text width to ensure constant scroll speed
  useEffect(() => {
    setIsReady(false);
    
    const calculateDuration = (textWidth: number, viewportSize: number) => {
      // Total distance = viewport + text width + viewport
      const totalDistance = viewportSize * 2 + textWidth;
      // Base speed: distance per base duration
      const baseDistance = viewportSize * 2 + (viewportSize * 0.5); // Approximate average text width
      const speed = baseDistance / duration; // pixels per second
      // Calculate actual duration for this text
      return totalDistance / speed;
    };

    const measureAndSetDurations = () => {
      const isVertical = position === 'left' || position === 'right';
      const viewportSize = isVertical ? window.innerHeight : window.innerWidth;

      if (questionRef.current) {
        const questionWidth = isVertical 
          ? questionRef.current.scrollHeight 
          : questionRef.current.scrollWidth;
        const calculatedDuration = calculateDuration(questionWidth, viewportSize);
        setQuestionDuration(calculatedDuration);
      }

      // Set ready to start animation
      setIsReady(true);
    };

    // Measure after a short delay to ensure fonts are loaded
    const timer = setTimeout(measureAndSetDurations, 50);
    return () => clearTimeout(timer);
  }, [question, answer, duration, position, fontSize]);

  // Update answer duration when answer becomes visible
  useEffect(() => {
    if (!showAnswer || !answerRef.current) return;

    const calculateDuration = (textWidth: number, viewportSize: number) => {
      const totalDistance = viewportSize * 2 + textWidth;
      const baseDistance = viewportSize * 2 + (viewportSize * 0.5);
      const speed = baseDistance / duration;
      return totalDistance / speed;
    };

    const measureAnswerDuration = () => {
      const isVertical = position === 'left' || position === 'right';
      const viewportSize = isVertical ? window.innerHeight : window.innerWidth;

      if (answerRef.current) {
        const answerWidth = isVertical 
          ? answerRef.current.scrollHeight 
          : answerRef.current.scrollWidth;
        const calculatedDuration = calculateDuration(answerWidth, viewportSize);
        setAnswerDuration(calculatedDuration);
      }
    };

    const timer = setTimeout(measureAnswerDuration, 50);
    return () => clearTimeout(timer);
  }, [showAnswer, answer, duration, position, fontSize]);

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
    return {};
  };

  return (
    <div 
      className={`flex items-center justify-center relative overflow-hidden ${
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
        className={`absolute whitespace-nowrap ${isReady ? `banner-scroll ${isVertical ? 'banner-scroll-vertical' : 'banner-scroll-horizontal'}` : ''}`}
        data-testid="text-question-display"
        onAnimationEnd={handleQuestionAnimationEnd}
        style={{
          '--animation-duration': `${questionDuration}s`,
          animationPlayState: isPaused ? 'paused' : 'running',
          opacity: isReady ? 1 : 0,
          ...(isVertical ? {
            writingMode: 'vertical-lr',
            textOrientation: 'upright'
          } : {})
        } as React.CSSProperties}
      >
        <span 
          className={`font-bold px-8 ${isVertical ? 'text-center' : ''}`}
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
          key={`answer-${showAnswer}`}
          className={`absolute whitespace-nowrap banner-scroll ${isVertical ? 'banner-scroll-vertical' : 'banner-scroll-horizontal'}`}
          data-testid="answer-section"
          onAnimationEnd={handleAnswerAnimationEnd}
          style={{
            '--animation-duration': `${answerDuration}s`,
            animationPlayState: isPaused ? 'paused' : 'running',
            ...(isVertical ? {
              writingMode: 'vertical-lr',
              textOrientation: 'upright'
            } : {})
          } as React.CSSProperties}
        >
          <span 
            className={`font-bold px-8 ${isVertical ? 'text-center' : ''}`}
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

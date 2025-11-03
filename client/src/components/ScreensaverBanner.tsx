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
  duration?: number; // in seconds, default 15
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
  duration = 15,
  isPaused = false,
  bannerHeight = 48,
  fontSize = 48
}: ScreensaverBannerProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionElapsed, setQuestionElapsed] = useState(0);
  const [answerElapsed, setAnswerElapsed] = useState(0);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const completeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(0);
  const answerStartTimeRef = useRef<number>(0);

  const scrollDuration = duration * 1000; // convert to milliseconds

  useEffect(() => {
    setShowAnswer(false);
    setQuestionElapsed(0);
    setAnswerElapsed(0);
    
    // Start question timer
    questionStartTimeRef.current = Date.now();
    questionTimerRef.current = setTimeout(() => {
      setShowAnswer(true);
      answerStartTimeRef.current = Date.now();
    }, scrollDuration);

    // Complete after both question and answer have scrolled
    completeTimerRef.current = setTimeout(() => {
      onComplete();
    }, scrollDuration * 2);

    return () => {
      if (questionTimerRef.current) clearTimeout(questionTimerRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, [question, answer]);

  // Handle pause/resume
  useEffect(() => {
    if (isPaused) {
      // Pause: clear all timers and record elapsed time
      if (questionTimerRef.current) {
        clearTimeout(questionTimerRef.current);
        questionTimerRef.current = null;
        if (!showAnswer) {
          setQuestionElapsed(Date.now() - questionStartTimeRef.current);
        }
      }
      if (completeTimerRef.current) {
        clearTimeout(completeTimerRef.current);
        completeTimerRef.current = null;
        if (showAnswer) {
          setAnswerElapsed(Date.now() - answerStartTimeRef.current);
        }
      }
    } else {
      // Resume: restart timers with remaining time
      if (!showAnswer && questionElapsed > 0) {
        const remainingTime = scrollDuration - questionElapsed;
        questionStartTimeRef.current = Date.now() - questionElapsed;
        questionTimerRef.current = setTimeout(() => {
          setShowAnswer(true);
          answerStartTimeRef.current = Date.now();
        }, remainingTime);

        completeTimerRef.current = setTimeout(() => {
          onComplete();
        }, remainingTime + scrollDuration);
      } else if (showAnswer && answerElapsed > 0) {
        const remainingTime = scrollDuration - answerElapsed;
        answerStartTimeRef.current = Date.now() - answerElapsed;
        completeTimerRef.current = setTimeout(() => {
          onComplete();
        }, remainingTime);
      }
    }

    return () => {
      if (questionTimerRef.current) clearTimeout(questionTimerRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, [isPaused, questionElapsed, answerElapsed, showAnswer, scrollDuration, onComplete]);

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
        className={`absolute whitespace-nowrap banner-scroll ${isVertical ? 'banner-scroll-vertical' : 'banner-scroll-horizontal'}`}
        data-testid="text-question-display"
        style={{
          ['--animation-duration' as any]: `${duration}s`,
          animationPlayState: isPaused ? 'paused' : 'running',
          ...(isVertical ? {
            writingMode: 'vertical-lr',
            textOrientation: 'upright'
          } : {})
        }}
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
          className={`absolute whitespace-nowrap banner-scroll ${isVertical ? 'banner-scroll-vertical' : 'banner-scroll-horizontal'}`}
          data-testid="answer-section"
          style={{
            ['--animation-duration' as any]: `${duration}s`,
            animationPlayState: isPaused ? 'paused' : 'running',
            ...(isVertical ? {
              writingMode: 'vertical-lr',
              textOrientation: 'upright'
            } : {})
          }}
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

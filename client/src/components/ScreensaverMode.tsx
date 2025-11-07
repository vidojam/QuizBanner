import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Pause, Play, SkipForward } from "lucide-react";
import ScreensaverBanner, { type BannerPosition } from "./ScreensaverBanner";
import type { QuestionAnswer } from "@shared/schema";
import type { DisplayMode } from "@/pages/Home";
import { getRandomAccessibleColor, getAccessibleTextColor } from "@/utils/colorContrast";

interface ScreensaverModeProps {
  questions: QuestionAnswer[];
  mode: DisplayMode;
  onExit: () => void;
  defaultDuration?: number;
  bannerHeight?: number;
  fontSize?: number;
  enableSoundNotifications?: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const POSITION_CYCLE: BannerPosition[] = ['bottom', 'top', 'left', 'right'];

const getInitialColors = () => {
  const bgColor = getRandomAccessibleColor();
  return { bgColor, txtColor: getAccessibleTextColor(bgColor) };
};

export default function ScreensaverMode({ 
  questions, 
  mode, 
  onExit,
  defaultDuration = 5,
  bannerHeight = 48,
  fontSize = 48,
  enableSoundNotifications = false
}: ScreensaverModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState(() => shuffleArray(questions));
  const [positionIndex, setPositionIndex] = useState(0);
  const initialColors = getInitialColors();
  const [backgroundColor, setBackgroundColor] = useState(initialColors.bgColor);
  const [textColor, setTextColor] = useState(initialColors.txtColor);
  const [isPaused, setIsPaused] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [mountKey, setMountKey] = useState(Date.now());
  
  // Force remount when duration/height/fontSize changes
  useEffect(() => {
    setMountKey(Date.now());
  }, [defaultDuration, bannerHeight, fontSize]);

  // Update shuffledQuestions when questions prop changes (fixes live updates bug)
  useEffect(() => {
    setShuffledQuestions(shuffleArray(questions));
  }, [questions]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };

    const handleSpace = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('keydown', handleSpace);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('keydown', handleSpace);
    };
  }, [onExit]);

  const playNotificationSound = useCallback(() => {
    if (enableSoundNotifications) {
      // Create a simple beep sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // Frequency in Hz
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (error) {
        console.warn('Sound notification failed:', error);
      }
    }
  }, [enableSoundNotifications]);

  const handleComplete = useCallback(() => {
    // Play notification sound
    playNotificationSound();
    
    // Move to next question
    const nextQuestionIndex = (currentIndex + 1) % shuffledQuestions.length;
    
    if (nextQuestionIndex === 0) {
      // Completed all questions at current position, move to next position
      const nextPositionIndex = (positionIndex + 1) % POSITION_CYCLE.length;
      setPositionIndex(nextPositionIndex);
      
      if (nextPositionIndex === 0) {
        // Completed full cycle (all questions at all positions)
        setCompletedCount(prev => prev + 1);
      }
    }
    
    // Update to next question
    setCurrentIndex(nextQuestionIndex);
    
    // Generate new colors for next iteration
    const newBgColor = getRandomAccessibleColor();
    setBackgroundColor(newBgColor);
    setTextColor(getAccessibleTextColor(newBgColor));
  }, [currentIndex, positionIndex, shuffledQuestions.length, playNotificationSound]);

  const handleSkip = () => {
    handleComplete();
  };

  if (shuffledQuestions.length === 0) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-50 ${mode === 'screensaver' ? 'bg-black' : 'pointer-events-none'}`}
      data-testid="screensaver-mode"
    >
      {/* Controls - visible in both modes */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 pointer-events-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsPaused(!isPaused)}
          data-testid="button-pause-resume"
          className={mode === 'screensaver' ? 'text-white hover:bg-white/20' : 'bg-black/80 text-white hover:bg-black/90 backdrop-blur-sm'}
          title={isPaused ? "Resume (Space)" : "Pause (Space)"}
        >
          {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSkip}
          data-testid="button-skip"
          className={mode === 'screensaver' ? 'text-white hover:bg-white/20' : 'bg-black/80 text-white hover:bg-black/90 backdrop-blur-sm'}
          title="Skip to next question"
        >
          <SkipForward className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onExit}
          data-testid="button-exit-screensaver"
          className={mode === 'screensaver' ? 'text-white hover:bg-white/20' : 'bg-black/80 text-white hover:bg-black/90 backdrop-blur-sm'}
          title="Exit (ESC)"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Progress Indicator - visible in both modes */}
      <div className="absolute top-4 left-4 z-10 pointer-events-auto">
        <div className={mode === 'screensaver' ? 'bg-black/60 text-white px-4 py-2 rounded-md backdrop-blur-sm' : 'bg-black/80 text-white px-4 py-2 rounded-md backdrop-blur-sm'}>
          <div className="text-sm font-medium">
            Q{currentIndex + 1}/{shuffledQuestions.length} • {POSITION_CYCLE[positionIndex]}
          </div>
          <div className="text-xs text-white/70 mt-1">
            Position {positionIndex + 1}/{POSITION_CYCLE.length} • {completedCount} completed
          </div>
        </div>
      </div>

      <ScreensaverBanner
        key={`${shuffledQuestions[currentIndex].id}-${currentIndex}-${positionIndex}-${mountKey}`}
        question={shuffledQuestions[currentIndex].question}
        answer={shuffledQuestions[currentIndex].answer}
        backgroundColor={backgroundColor}
        textColor={textColor}
        position={POSITION_CYCLE[positionIndex]}
        onComplete={handleComplete}
        duration={defaultDuration}
        isPaused={isPaused}
        bannerHeight={bannerHeight}
        fontSize={fontSize}
      />
    </div>
  );
}

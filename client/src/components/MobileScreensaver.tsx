import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, RotateCcw, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import type { QuestionAnswer } from '@shared/schema';

interface MobileScreensaverProps {
  questions: QuestionAnswer[];
  onExit: () => void;
}

export default function MobileScreensaver({ questions, onExit }: MobileScreensaverProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  const currentQuestion = questions[currentIndex];

  // Auto-advance logic
  useEffect(() => {
    if (!autoPlay || showAnswer || questions.length === 0) return;

    const duration = (currentQuestion?.duration || 5) * 1000;
    const timer = setTimeout(() => {
      setShowAnswer(true);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, showAnswer, autoPlay, currentQuestion?.duration, questions.length]);

  // Auto-advance to next question after showing answer
  useEffect(() => {
    if (!autoPlay || !showAnswer) return;

    const timer = setTimeout(() => {
      nextQuestion();
    }, 3000); // Show answer for 3 seconds

    return () => clearTimeout(timer);
  }, [showAnswer, autoPlay]);

  const nextQuestion = useCallback(() => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  }, [questions.length]);

  const prevQuestion = useCallback(() => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev - 1 + questions.length) % questions.length);
  }, [questions.length]);

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  // Touch/swipe handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    e.currentTarget.setAttribute('data-start-x', touch.clientX.toString());
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const startX = parseFloat(e.currentTarget.getAttribute('data-start-x') || '0');
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    // Swipe threshold
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - next question
        nextQuestion();
      } else {
        // Swipe right - previous question
        prevQuestion();
      }
    } else {
      // Tap - toggle answer
      toggleAnswer();
    }
  }, [nextQuestion, prevQuestion]);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold mb-2">No Questions Available</h2>
          <p className="text-gray-400 mb-6">Add some questions first to use screensaver mode</p>
          <Button onClick={onExit} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-500 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-500 blur-3xl"></div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <Button
            onClick={onExit}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4 mr-2" />
            Exit
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-white border-white/30">
              {currentIndex + 1} / {questions.length}
            </Badge>
            <Button
              onClick={() => setAutoPlay(!autoPlay)}
              variant="ghost"
              size="sm"
              className={`text-white hover:bg-white/20 ${autoPlay ? 'bg-white/20' : ''}`}
            >
              {autoPlay ? 'Pause' : 'Play'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="min-h-screen flex items-center justify-center p-6 pt-20 pb-20"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border-white/20 text-white">
          <CardContent className="p-8">
            {/* Category and Duration */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                {currentQuestion.category && (
                  <Badge variant="outline" className="text-white border-white/30">
                    {currentQuestion.category}
                  </Badge>
                )}
                <Badge variant="outline" className="text-white border-white/30">
                  {currentQuestion.duration}s
                </Badge>
              </div>
              {currentQuestion.performanceScore > 0.7 && (
                <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30">
                  ⭐ Mastered
                </Badge>
              )}
            </div>

            {/* Question */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {currentQuestion.question}
              </h1>
              
              {/* Answer (when revealed) */}
              {showAnswer && (
                <div className="mt-8 p-6 bg-white/10 rounded-lg border border-white/20">
                  <p className="text-xl md:text-2xl text-green-200 font-medium">
                    {currentQuestion.answer}
                  </p>
                  {currentQuestion.tags && currentQuestion.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {currentQuestion.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-white border-white/30 text-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tap hint */}
            {!showAnswer && (
              <div className="text-center text-white/60 text-sm">
                Tap to reveal answer • Swipe to navigate
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            onClick={prevQuestion}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            disabled={questions.length <= 1}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex gap-2">
            <Button
              onClick={toggleAnswer}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              {showAnswer ? <RotateCcw className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              {showAnswer ? 'Hide' : 'Show'} Answer
            </Button>
          </div>

          <Button
            onClick={nextQuestion}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            disabled={questions.length <= 1}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full max-w-md mx-auto">
          <div className="w-full bg-white/20 rounded-full h-1">
            <div 
              className="bg-white rounded-full h-1 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
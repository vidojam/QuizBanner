import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Square } from "lucide-react";
import QuestionForm from "@/components/QuestionForm";
import QuestionList from "@/components/QuestionList";
import ScreensaverMode from "@/components/ScreensaverMode";
import type { QuestionAnswer } from "@shared/schema";

const STORAGE_KEY = "learning-questions";
const MODE_STORAGE_KEY = "display-mode";

export type DisplayMode = 'screensaver' | 'overlay';

export default function Home() {
  const [questions, setQuestions] = useState<QuestionAnswer[]>([]);
  const [isScreensaverActive, setIsScreensaverActive] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('screensaver');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setQuestions(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to load questions:", error);
      }
    }

    const storedMode = localStorage.getItem(MODE_STORAGE_KEY);
    if (storedMode === 'screensaver' || storedMode === 'overlay') {
      setDisplayMode(storedMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(MODE_STORAGE_KEY, displayMode);
  }, [displayMode]);

  const handleAddQuestion = (question: string, answer: string) => {
    const newQuestion: QuestionAnswer = {
      id: crypto.randomUUID(),
      question,
      answer,
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleEditQuestion = (id: string, question: string, answer: string) => {
    setQuestions(prev => 
      prev.map(q => q.id === id ? { ...q, question, answer } : q)
    );
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Learning Reinforcement
              </h1>
              <p className="text-muted-foreground mt-2">
                Create questions to reinforce your learning with timed screensavers
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="lg"
                variant={isScreensaverActive ? "destructive" : "default"}
                data-testid="button-start-screensaver"
                onClick={() => setIsScreensaverActive(!isScreensaverActive)}
                disabled={questions.length === 0}
              >
                {isScreensaverActive ? (
                  <>
                    <Square className="w-5 h-5 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Display Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-4">
                <Button
                  variant={displayMode === 'screensaver' ? 'default' : 'outline'}
                  onClick={() => setDisplayMode('screensaver')}
                  data-testid="button-mode-screensaver"
                  className="flex-1"
                >
                  Screensaver Only
                </Button>
                <Button
                  variant={displayMode === 'overlay' ? 'default' : 'outline'}
                  onClick={() => setDisplayMode('overlay')}
                  data-testid="button-mode-overlay"
                  className="flex-1"
                >
                  Always On Top
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {displayMode === 'screensaver' 
                  ? 'Fullscreen mode with black background - blocks your view completely'
                  : 'Overlay mode - banners appear transparently within this browser tab. Keep this tab open alongside other work for continuous learning reinforcement.'}
              </p>
              {displayMode === 'overlay' && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-1">💡 Pro Tip:</p>
                  <p className="text-sm text-muted-foreground">
                    For best results, resize your browser window to take up half your screen, then position your work (documents, email, etc.) on the other half. The banners will scroll within this window while you work elsewhere.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <QuestionForm
            onAdd={handleAddQuestion}
            questionsCount={questions.length}
          />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Your Questions ({questions.length})
            </h2>
            <QuestionList
              questions={questions}
              onDelete={handleDeleteQuestion}
              onEdit={handleEditQuestion}
            />
          </div>
        </div>
      </div>

      {isScreensaverActive && questions.length > 0 && (
        <ScreensaverMode
          questions={questions}
          mode={displayMode}
          onExit={() => setIsScreensaverActive(false)}
        />
      )}
    </>
  );
}

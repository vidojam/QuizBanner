import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import QuestionForm from "@/components/QuestionForm";
import QuestionList from "@/components/QuestionList";
import ScreensaverMode from "@/components/ScreensaverMode";
import type { QuestionAnswer } from "@shared/schema";

const STORAGE_KEY = "learning-questions";

export default function Home() {
  const [questions, setQuestions] = useState<QuestionAnswer[]>([]);
  const [isScreensaverActive, setIsScreensaverActive] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setQuestions(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to load questions:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  }, [questions]);

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
            <Button
              size="lg"
              data-testid="button-start-screensaver"
              onClick={() => setIsScreensaverActive(true)}
              disabled={questions.length === 0}
            >
              <Play className="w-5 h-5 mr-2" />
              Start Screensaver
            </Button>
          </header>

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
            />
          </div>
        </div>
      </div>

      {isScreensaverActive && questions.length > 0 && (
        <ScreensaverMode
          questions={questions}
          onExit={() => setIsScreensaverActive(false)}
        />
      )}
    </>
  );
}

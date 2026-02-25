import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface QuestionFormProps {
  onAdd: (question: string, answer: string) => void;
  onLoadDemoPack?: (pack: 'tech' | 'javascript' | 'movieStars' | 'aiBasics' | 'cars2026' | 'aiPrograms') => void;
  onLoadCustomDemo?: (subject: string) => void;
  demoPackLoading?: 'tech' | 'javascript' | 'movieStars' | 'aiBasics' | 'cars2026' | 'aiPrograms' | 'custom' | null;
  questionsCount: number;
  maxQuestions?: number;
}

export default function QuestionForm({ 
  onAdd, 
  onLoadDemoPack,
  onLoadCustomDemo,
  demoPackLoading = null,
  questionsCount, 
  maxQuestions = 10 
}: QuestionFormProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [customSubject, setCustomSubject] = useState("");

  useEffect(() => {
    setQuestion("");
    setAnswer("");
    setCustomSubject("");
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && answer.trim()) {
      onAdd(question, answer);
      setQuestion("");
      setAnswer("");
    }
  };

  const isMaxReached = questionsCount >= maxQuestions;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Add New Question with Answer for Banners ({questionsCount}/{maxQuestions})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-5">
          <p className="text-sm font-medium">Wow in 30 seconds: add a free demo pack</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onLoadDemoPack?.('tech')}
              disabled={isMaxReached || demoPackLoading !== null}
              data-testid="button-demo-tech"
            >
              {demoPackLoading === 'tech' ? 'Loading...' : 'Demo Tech'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onLoadDemoPack?.('javascript')}
              disabled={isMaxReached || demoPackLoading !== null}
              data-testid="button-demo-javascript"
            >
              {demoPackLoading === 'javascript' ? 'Loading...' : 'Demo JavaScript'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onLoadDemoPack?.('movieStars')}
              disabled={isMaxReached || demoPackLoading !== null}
              data-testid="button-demo-movie-stars"
            >
              {demoPackLoading === 'movieStars' ? 'Loading...' : 'Demo Movie Stars'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onLoadDemoPack?.('aiBasics')}
              disabled={isMaxReached || demoPackLoading !== null}
              data-testid="button-demo-ai-basics"
            >
              {demoPackLoading === 'aiBasics' ? 'Loading...' : 'Demo What is AI'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onLoadDemoPack?.('cars2026')}
              disabled={isMaxReached || demoPackLoading !== null}
              data-testid="button-demo-cars-2026"
            >
              {demoPackLoading === 'cars2026' ? 'Loading...' : 'Demo Cars 2026'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onLoadDemoPack?.('aiPrograms')}
              disabled={isMaxReached || demoPackLoading !== null}
              data-testid="button-demo-ai-programs"
            >
              {demoPackLoading === 'aiPrograms' ? 'Loading...' : 'Demo 10 AI Programs'}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 pt-1">
            <Input
              placeholder="Enter a subject, e.g. Cybersecurity"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              disabled={isMaxReached || demoPackLoading !== null}
              data-testid="input-custom-demo-subject"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => onLoadCustomDemo?.(customSubject)}
              disabled={isMaxReached || demoPackLoading !== null || !customSubject.trim()}
              data-testid="button-demo-custom"
            >
              {demoPackLoading === 'custom' ? 'Loading...' : 'Custom Demo'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Short question/answer banners will be added instantly.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              data-testid="input-question"
              autoComplete="off"
              placeholder="Enter your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isMaxReached}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              id="answer"
              data-testid="input-answer"
              autoComplete="off"
              placeholder="Enter the answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isMaxReached}
              rows={2}
              className="resize-none"
            />
          </div>
          <Button
            type="submit"
            data-testid="button-add-question"
            disabled={isMaxReached || !question.trim() || !answer.trim()}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
          {isMaxReached && (
            <p className="text-sm text-muted-foreground text-center">
              Maximum of {maxQuestions} questions reached
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface QuestionFormProps {
  onAdd: (question: string, answer: string) => void;
  questionsCount: number;
  maxQuestions?: number;
}

export default function QuestionForm({ 
  onAdd, 
  questionsCount, 
  maxQuestions = 10 
}: QuestionFormProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              data-testid="input-question"
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

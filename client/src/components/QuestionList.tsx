import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { QuestionAnswer } from "@shared/schema";

interface QuestionListProps {
  questions: QuestionAnswer[];
  onDelete: (id: string) => void;
}

export default function QuestionList({ questions, onDelete }: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground text-lg">
            No questions added yet. Add your first question above to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((qa, index) => (
        <Card key={qa.id} data-testid={`card-question-${qa.id}`}>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Question {index + 1}
                </div>
                <p className="text-base font-medium" data-testid={`text-question-${qa.id}`}>
                  {qa.question}
                </p>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Answer
                </div>
                <p className="text-base text-foreground" data-testid={`text-answer-${qa.id}`}>
                  {qa.answer}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              data-testid={`button-delete-${qa.id}`}
              onClick={() => onDelete(qa.id)}
              className="shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

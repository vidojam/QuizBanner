import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit, Check, X } from "lucide-react";
import type { QuestionAnswer } from "@shared/schema";

interface QuestionListProps {
  questions: QuestionAnswer[];
  onDelete: (id: string) => void;
  onEdit: (id: string, question: string, answer: string) => void;
}

export default function QuestionList({ questions, onDelete, onEdit }: QuestionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  const handleStartEdit = (qa: QuestionAnswer) => {
    setEditingId(qa.id);
    setEditQuestion(qa.question);
    setEditAnswer(qa.answer);
  };

  const handleSaveEdit = (id: string) => {
    if (editQuestion.trim() && editAnswer.trim()) {
      onEdit(id, editQuestion, editAnswer);
      setEditingId(null);
      setEditQuestion("");
      setEditAnswer("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQuestion("");
    setEditAnswer("");
  };

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
            {editingId === qa.id ? (
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Question {index + 1}
                  </div>
                  <Textarea
                    value={editQuestion}
                    onChange={(e) => setEditQuestion(e.target.value)}
                    data-testid={`input-edit-question-${qa.id}`}
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Answer
                  </div>
                  <Textarea
                    value={editAnswer}
                    onChange={(e) => setEditAnswer(e.target.value)}
                    data-testid={`input-edit-answer-${qa.id}`}
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>
            ) : (
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
            )}
            
            <div className="flex gap-2 shrink-0">
              {editingId === qa.id ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid={`button-save-${qa.id}`}
                    onClick={() => handleSaveEdit(qa.id)}
                    disabled={!editQuestion.trim() || !editAnswer.trim()}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid={`button-cancel-${qa.id}`}
                    onClick={handleCancelEdit}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid={`button-edit-${qa.id}`}
                    onClick={() => handleStartEdit(qa)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid={`button-delete-${qa.id}`}
                    onClick={() => onDelete(qa.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

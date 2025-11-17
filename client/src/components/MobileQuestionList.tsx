import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Play, Pause } from 'lucide-react';
import type { QuestionAnswer } from '@shared/schema';

interface MobileQuestionListProps {
  questions: QuestionAnswer[];
  onDelete: (id: string) => void;
  onEdit: (id: string, question: string, answer: string) => void;
}

export default function MobileQuestionList({ 
  questions, 
  onDelete, 
  onEdit 
}: MobileQuestionListProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [isScreensaver, setIsScreensaver] = useState(false);

  // Handle mobile gestures
  const handleSwipeDelete = (id: string) => {
    if (window.confirm('Delete this question?')) {
      onDelete(id);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b mb-4 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quiz Questions</h1>
          <Button
            onClick={() => setIsScreensaver(!isScreensaver)}
            size="sm"
            variant={isScreensaver ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            {isScreensaver ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isScreensaver ? 'Stop' : 'Study Mode'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {questions.length} questions • Tap to expand • Long press to delete
        </p>
      </div>

      {/* Mobile Question Cards */}
      <div className="space-y-3">
        {questions.map((question, index) => (
          <Card 
            key={question.id} 
            className={`transition-all duration-200 ${
              selectedQuestion === question.id 
                ? 'ring-2 ring-primary shadow-lg' 
                : 'hover:shadow-md'
            }`}
          >
            <CardHeader 
              className="pb-3 cursor-pointer"
              onClick={() => setSelectedQuestion(
                selectedQuestion === question.id ? null : question.id
              )}
              onTouchStart={(e) => {
                // Handle long press for delete
                const timer = setTimeout(() => {
                  handleSwipeDelete(question.id);
                }, 800);
                
                const cleanup = () => {
                  clearTimeout(timer);
                  e.currentTarget.removeEventListener('touchend', cleanup);
                  e.currentTarget.removeEventListener('touchmove', cleanup);
                };
                
                e.currentTarget.addEventListener('touchend', cleanup);
                e.currentTarget.addEventListener('touchmove', cleanup);
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-medium leading-tight mb-2">
                    Q{index + 1}: {question.question}
                  </CardTitle>
                  <div className="flex flex-wrap gap-1">
                    {question.category && (
                      <Badge variant="secondary" className="text-xs">
                        {question.category}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {question.duration}s
                    </Badge>
                    {question.performanceScore > 0.7 && (
                      <Badge variant="default" className="text-xs">
                        ⭐ Mastered
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(question.id, question.question, question.answer);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwipeDelete(question.id);
                    }}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {/* Expandable Answer */}
            {selectedQuestion === question.id && (
              <CardContent className="pt-0 border-t">
                <div className="mt-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Answer:</p>
                  <p className="text-sm leading-relaxed">{question.answer}</p>
                  {question.tags && question.tags.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-1">Tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {question.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {questions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
          <p className="text-muted-foreground text-sm">
            Add your first question to get started
          </p>
        </div>
      )}

      {/* Mobile FAB for adding questions */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        onClick={() => {
          // Navigate to add question form
          console.log('Add new question');
        }}
      >
        <span className="text-xl">+</span>
      </Button>
    </div>
  );
}
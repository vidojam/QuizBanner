import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface QuestionFormProps {
  onAdd: (question: string, answer: string) => void;
  onLoadDemoPack?: (pack: 'tech' | 'javascript' | 'movieStars' | 'aiBasics' | 'cars2026' | 'aiPrograms') => void;
  onLoadCustomDemo?: (subject: string, count: 10 | 25 | 50) => void;
  onUpgradeClick?: () => void;
  demoPackLoading?: 'tech' | 'javascript' | 'movieStars' | 'aiBasics' | 'cars2026' | 'aiPrograms' | 'custom' | null;
  questionsCount: number;
  maxQuestions?: number;
}

export default function QuestionForm({ 
  onAdd, 
  onLoadDemoPack,
  onLoadCustomDemo,
  onUpgradeClick,
  demoPackLoading = null,
  questionsCount, 
  maxQuestions = 10 
}: QuestionFormProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customCount, setCustomCount] = useState<"10" | "25" | "50">("10");

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
  const canUseLargeCustomDemo = maxQuestions > 10;
  const demoButtonClassName = "text-[1.3125rem] font-bold whitespace-normal leading-tight h-auto min-h-12 py-2 justify-start text-left";

  const { t, language } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {t('addQuestionHeader', { count: questionsCount, max: maxQuestions })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-5">
          <p className="text-[1.5rem] font-bold text-red-600">{t('demoPackTitle')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onLoadDemoPack?.('tech')}
              disabled={isMaxReached || demoPackLoading !== null}
              data-testid="button-demo-tech"
              className={`${demoButtonClassName} border border-gray-700`}
            >
              {demoPackLoading === 'tech' ? t('loading') : t('learnAcronyms')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onLoadDemoPack?.('javascript')}
              disabled={isMaxReached || demoPackLoading !== null}
              data-testid="button-demo-javascript"
              className={`${demoButtonClassName} border border-gray-700`}
            >
              {demoPackLoading === 'javascript' ? t('loading') : t('learnWineWorldRegions')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onLoadDemoPack?.('movieStars')}
              disabled={isMaxReached || demoPackLoading !== null}
              data-testid="button-demo-movie-stars"
              className={`${demoButtonClassName} border border-gray-700`}
            >
              {demoPackLoading === 'movieStars' ? t('loading') : t('iconicMovieQuotes')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onLoadDemoPack?.('aiBasics')}
              disabled={isMaxReached || demoPackLoading !== null}
              data-testid="button-demo-ai-basics"
              className={`${demoButtonClassName} border border-gray-700`}
            >
              {demoPackLoading === 'aiBasics' ? t('loading') : t('learnWhatIsAI')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onLoadDemoPack?.('cars2026')}
              disabled={isMaxReached || demoPackLoading !== null}
              data-testid="button-demo-cars-2026"
              className={`${demoButtonClassName} sm:col-span-2 md:col-span-2 border border-gray-700`}
            >
              {demoPackLoading === 'cars2026' ? t('loading') : t('learnVitamins')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onLoadDemoPack?.('aiPrograms')}
              disabled={isMaxReached || demoPackLoading !== null}
              data-testid="button-demo-ai-programs"
              className={`${demoButtonClassName} sm:col-span-2 md:col-span-2 border border-gray-700`}
            >
              {demoPackLoading === 'aiPrograms' ? t('loading') : t('learnUSPresidentNumber')}
            </Button>
          </div>
          {canUseLargeCustomDemo && (
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 pt-1">
              <Input
                placeholder="Enter a subject, e.g. Cybersecurity"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                disabled={isMaxReached || demoPackLoading !== null}
                data-testid="input-custom-demo-subject"
              />
              <div className="grid grid-cols-[90px_auto] gap-2">
                <Select
                  value={customCount}
                  onValueChange={(value) => setCustomCount(value as "10" | "25" | "50")}
                  disabled={isMaxReached || demoPackLoading !== null}
                >
                  <SelectTrigger data-testid="select-custom-demo-count">
                    <SelectValue placeholder="Count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onLoadCustomDemo?.(customSubject, Number(customCount) as 10 | 25 | 50)}
                  disabled={isMaxReached || demoPackLoading !== null || !customSubject.trim()}
                  data-testid="button-demo-custom"
                  className={`${demoButtonClassName} border border-gray-700`}
                >
                  {demoPackLoading === 'custom' ? 'Loading...' : 'Custom Demo'}
                </Button>
              </div>
            </div>
          )}
          {!canUseLargeCustomDemo && (
            <div className="flex items-center gap-2">
              <p className="text-[1.5rem] font-bold text-red-600">{t('customDemoPremiumMsg')}</p>
              {onUpgradeClick && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onUpgradeClick}
                  data-testid="button-upgrade-custom-demo"
                  className="border border-gray-400 rounded-md"
                >
                  {t('continuePremiumPlan')}
                </Button>
              )}
            </div>
          )}
          <hr className="my-4 border-gray-300" />
          <p className="text-[1.5rem] font-bold text-red-600">{t('addBelowInfo')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="space-y-2">
            <Label htmlFor="question">{t('questionLabel')}</Label>
            <Textarea
              id="question"
              data-testid="input-question"
              autoComplete="off"
              placeholder={t('questionPlaceholder')}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isMaxReached}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="answer">{t('answerLabel')}</Label>
            <Textarea
              id="answer"
              data-testid="input-answer"
              autoComplete="off"
              placeholder={t('answerPlaceholder')}
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
            {t('addQuestionButton')}
          </Button>
          {isMaxReached && (
            <p className="text-sm text-muted-foreground text-center">
              {t('questionLimit', { max: maxQuestions })}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

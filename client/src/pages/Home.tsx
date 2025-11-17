import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Play, Square, Settings as SettingsIcon, Download, Upload, FileText, Type, LogOut } from "lucide-react";
import QuestionForm from "@/components/QuestionForm";
import QuestionList from "@/components/QuestionList";
import ScreensaverMode from "@/components/ScreensaverMode";
import type { QuestionAnswer, Preferences } from "@shared/schema";
import { TIER_LIMITS } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Logo } from "@/components/Logo";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSelector } from "@/components/LanguageSelector";
import Footer from "@/components/Footer";

const MODE_STORAGE_KEY = "display-mode";

export type DisplayMode = 'screensaver' | 'overlay';

export default function Home() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const [isScreensaverActive, setIsScreensaverActive] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    return (stored === 'overlay' || stored === 'screensaver') ? stored : 'screensaver';
  });
  const [pasteDialogOpen, setPasteDialogOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const { toast } = useToast();

  // Fetch questions from database
  const { data: questions = [], isLoading: questionsLoading } = useQuery<QuestionAnswer[]>({
    queryKey: ['/api/questions'],
  });

  // Fetch user preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery<Preferences>({
    queryKey: ['/api/preferences'],
  });

  // Mutations
  const addQuestionMutation = useMutation({
    mutationFn: async (data: { question: string; answer: string }) => {
      return await apiRequest('POST', '/api/questions', { ...data, order: questions.length });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      toast({ title: "Question added successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to add question", description: error.message, variant: "destructive" });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      toast({ title: "Question deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete question", description: error.message, variant: "destructive" });
    },
  });

  const clearAllQuestionsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', '/api/questions');
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      toast({ title: "All questions cleared", description: `Deleted ${data.count} questions` });
    },
    onError: (error: any) => {
      toast({ title: "Failed to clear questions", description: error.message, variant: "destructive" });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<QuestionAnswer> }) => {
      return await apiRequest('PATCH', `/api/questions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      toast({ title: "Question updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update question", description: error.message, variant: "destructive" });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Partial<Preferences>) => {
      return await apiRequest('PATCH', '/api/preferences', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/preferences'] });
      
      // Auto-restart screensaver when settings change to apply new values
      if (isScreensaverActive) {
        setIsScreensaverActive(false);
        // Restart after a brief delay
        setTimeout(() => setIsScreensaverActive(true), 100);
      }
      
      toast({ title: "Settings saved - Screensaver restarted" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to save settings", description: error.message, variant: "destructive" });
    },
  });

  const handleAddQuestion = (question: string, answer: string) => {
    addQuestionMutation.mutate({ question, answer });
  };

  const handleDeleteQuestion = (id: string) => {
    deleteQuestionMutation.mutate(id);
  };

  const handleEditQuestion = (id: string, question: string, answer: string) => {
    updateQuestionMutation.mutate({ id, data: { question, answer } });
  };

  const handleExport = () => {
    const data = {
      questions,
      preferences,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-banner-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export successful", description: "Questions exported to JSON file" });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.questions && Array.isArray(data.questions)) {
          // Import questions
          for (const q of data.questions) {
            await apiRequest('POST', '/api/questions', {
              question: q.question,
              answer: q.answer,
              category: q.category,
              tags: q.tags || [],
              duration: q.duration || 5,
              customColor: q.customColor,
              order: q.order || 0,
            });
          }
          queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
          toast({ title: "Import successful", description: `Imported ${data.questions.length} questions` });
        }
      } catch (error: any) {
        toast({ title: "Import failed", description: error.message, variant: "destructive" });
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        
        // Proper CSV parser that handles multi-line quoted fields
        const rows: string[][] = [];
        let currentRow: string[] = [];
        let currentField = '';
        let inQuotes = false;
        
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const nextChar = text[i + 1];
          
          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              // Escaped quote ("")
              currentField += '"';
              i++; // Skip next quote
            } else {
              // Toggle quote mode
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            // End of field
            currentRow.push(currentField);
            currentField = '';
          } else if ((char === '\n' || char === '\r') && !inQuotes) {
            // End of row (handle \r\n and \n)
            if (char === '\r' && nextChar === '\n') {
              i++; // Skip \n in \r\n
            }
            if (currentField || currentRow.length > 0) {
              currentRow.push(currentField);
              if (currentRow.some(f => f.trim())) {
                rows.push(currentRow);
              }
              currentRow = [];
              currentField = '';
            }
          } else {
            currentField += char;
          }
        }
        
        // Add last row if exists
        if (currentField || currentRow.length > 0) {
          currentRow.push(currentField);
          if (currentRow.some(f => f.trim())) {
            rows.push(currentRow);
          }
        }

        // Skip header row if it exists
        const startIndex = rows[0]?.[0]?.toLowerCase().includes('question') ? 1 : 0;
        const questionsToImport = [];
        const errors: string[] = [];

        for (let i = startIndex; i < rows.length; i++) {
          const row = rows[i];
          const question = row[0]?.trim() || '';
          const answer = row[1]?.trim() || '';

          if (question && answer) {
            questionsToImport.push({ question, answer });
          } else if (question || answer) {
            errors.push(`Row ${i + 1}: Missing ${question ? 'answer' : 'question'}`);
          }
        }

        if (questionsToImport.length === 0) {
          const errorMsg = errors.length > 0 
            ? `Errors found:\n${errors.slice(0, 3).join('\n')}` 
            : "Make sure your CSV has 'question,answer' format";
          toast({ title: "No valid questions found", description: errorMsg, variant: "destructive" });
          return;
        }

        // Import all questions with incremental order
        const baseOrder = questions.length;
        for (let i = 0; i < questionsToImport.length; i++) {
          const qa = questionsToImport[i];
          await apiRequest('POST', '/api/questions', {
            question: qa.question,
            answer: qa.answer,
            order: baseOrder + i,
          });
        }

        queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
        const message = errors.length > 0 
          ? `Imported ${questionsToImport.length} questions (${errors.length} skipped)`
          : `Imported ${questionsToImport.length} questions`;
        toast({ title: "CSV Import successful", description: message });
      } catch (error: any) {
        toast({ title: "CSV Import failed", description: error.message, variant: "destructive" });
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handlePasteImport = async () => {
    try {
      const lines = pasteText.split('\n');
      const questionsToImport = [];
      const errors: string[] = [];
      
      let currentQuestion = '';
      let currentAnswer = '';
      let collectingAnswer = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.match(/^Q:\s*/i)) {
          // Save previous Q&A if exists
          if (currentQuestion) {
            if (currentAnswer) {
              questionsToImport.push({ question: currentQuestion, answer: currentAnswer });
            } else {
              errors.push(`Question missing answer: "${currentQuestion}"`);
            }
          }
          currentQuestion = line.replace(/^Q:\s*/i, '').trim();
          currentAnswer = '';
          collectingAnswer = false;
        } else if (line.match(/^A:\s*/i)) {
          currentAnswer = line.replace(/^A:\s*/i, '').trim();
          collectingAnswer = true;
        } else if (collectingAnswer && line) {
          // Multi-line answer continuation
          currentAnswer += '\n' + line;
        }
      }

      // Save last Q&A
      if (currentQuestion) {
        if (currentAnswer) {
          questionsToImport.push({ question: currentQuestion, answer: currentAnswer });
        } else {
          errors.push(`Question missing answer: "${currentQuestion}"`);
        }
      }

      if (questionsToImport.length === 0) {
        const errorMsg = errors.length > 0 
          ? `Errors found:\n${errors.slice(0, 3).join('\n')}` 
          : "Use format: Q: Your question? A: Your answer";
        toast({ 
          title: "No valid questions found", 
          description: errorMsg, 
          variant: "destructive" 
        });
        return;
      }

      // Import all questions with incremental order
      const baseOrder = questions.length;
      for (let i = 0; i < questionsToImport.length; i++) {
        const qa = questionsToImport[i];
        await apiRequest('POST', '/api/questions', {
          question: qa.question,
          answer: qa.answer,
          order: baseOrder + i,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      const message = errors.length > 0 
        ? `Imported ${questionsToImport.length} questions (${errors.length} had errors)`
        : `Imported ${questionsToImport.length} questions`;
      toast({ title: "Paste Import successful", description: message });
      setPasteDialogOpen(false);
      setPasteText("");
    } catch (error: any) {
      toast({ title: "Paste Import failed", description: error.message, variant: "destructive" });
    }
  };

  const handleModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode);
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  };

  if (questionsLoading || preferencesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading...</div>
          <div className="text-sm text-muted-foreground mt-2">Setting up your learning environment</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col" key={`home-${language}`}>
        <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
          <header className="space-y-4">
            <div className="flex items-center justify-between">
              <LanguageSelector />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('logOut')}
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Logo size="xl" />
                <div>
                  <div className="text-xs text-muted-foreground">
                    {user?.tier === "premium" ? "Premium Member" : "Free Tier"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user?.tier === 'free' && (
                  <Button 
                    size="sm"
                    variant="default"
                    onClick={() => window.location.href = "/upgrade"}
                    data-testid="button-upgrade"
                  >
                    {t('upgradeButton')}
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  {t('learningReinforcement')}
                </h2>
                <p className="text-muted-foreground mt-2 text-center font-bold">
                  {t('subtitle')}
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
                      {t('stopScreensaver')}
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      {t('startScreensaver')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </header>

          <Tabs defaultValue="questions" className="w-full">
            <TabsList className={`grid w-full ${user?.tier === 'premium' ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="questions">{t('questionsTab')}</TabsTrigger>
              <TabsTrigger value="settings">{t('bannerSettingsTab')}</TabsTrigger>
              {user?.tier === 'premium' && (
                <TabsTrigger value="data">{t('importExportTab')}</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="questions" className="space-y-6 mt-6">
              <div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 text-center">
                    {t('premiumInfo')}
                  </p>
                </div>
                <p className="text-muted-foreground mb-4 text-center font-bold">
                  {t('enterQuestionsText')}
                </p>
              </div>

              <QuestionForm
                onAdd={handleAddQuestion}
                questionsCount={questions.length}
                maxQuestions={user?.tier ? TIER_LIMITS[user.tier as keyof typeof TIER_LIMITS] : TIER_LIMITS.free}
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
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-6">
              <p className="text-lg text-center font-bold mb-4">
                Enter, view and edit questions and answers below
              </p>
              
              <Card>
                <CardHeader>
                  <CardTitle>Display Mode</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-4">
                    <Button
                      variant={displayMode === 'screensaver' ? 'default' : 'outline'}
                      onClick={() => handleModeChange('screensaver')}
                      data-testid="button-mode-screensaver"
                      className="flex-1"
                    >
                      Screensaver Only
                    </Button>
                    <Button
                      variant={displayMode === 'overlay' ? 'default' : 'outline'}
                      onClick={() => handleModeChange('overlay')}
                      data-testid="button-mode-overlay"
                      className="flex-1"
                    >
                      Always On Top
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {displayMode === 'screensaver' 
                      ? 'Fullscreen mode with black background - blocks your view completely'
                      : 'Always on top mode - banners appear transparently within this browser tab. Keep this tab open alongside other work for continuous learning reinforcement.'}
                  </p>
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <p className="text-lg font-bold text-center">
                      💡 Premium mode allows for adding questions and answers quicker with CSV file or paste option for up to 10 or up to 50 questions and answers in Q: & A: format
                    </p>
                  </div>
                </CardContent>
              </Card>


              <Card>
                <CardHeader>
                  <CardTitle>Banner Appearance</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Changes apply immediately while screensaver is running
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Default Duration (seconds)</Label>
                      <span className="text-sm font-medium">{preferences?.defaultDuration || 5}s</span>
                    </div>
                    <Slider
                      value={[preferences?.defaultDuration || 5]}
                      onValueChange={([value]) => updatePreferencesMutation.mutate({ defaultDuration: value })}
                      min={1}
                      max={10}
                      step={1}
                      data-testid="slider-duration"
                    />
                    <p className="text-xs text-muted-foreground">
                      How long each question and answer scrolls across the screen
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Banner Height (pixels)</Label>
                      <span className="text-sm font-medium">{preferences?.bannerHeight || 48}px</span>
                    </div>
                    <Slider
                      value={[preferences?.bannerHeight || 48]}
                      onValueChange={([value]) => updatePreferencesMutation.mutate({ bannerHeight: value })}
                      min={32}
                      max={128}
                      step={8}
                      data-testid="slider-banner-height"
                    />
                    <p className="text-xs text-muted-foreground">
                      The height of the scrolling banner
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Font Size (pixels)</Label>
                      <span className="text-sm font-medium">{preferences?.fontSize || 48}px</span>
                    </div>
                    <Slider
                      value={[preferences?.fontSize || 48]}
                      onValueChange={([value]) => updatePreferencesMutation.mutate({ fontSize: value })}
                      min={24}
                      max={96}
                      step={8}
                      data-testid="slider-font-size"
                    />
                    <p className="text-xs text-muted-foreground">
                      The size of the text in the banner
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('exportTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button
                      onClick={handleExport}
                      variant="outline"
                      className="w-full"
                      data-testid="button-export"
                      disabled={questions.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('exportQuestions')}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {t('exportDescription')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('importQuestionsTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button
                      onClick={() => document.getElementById('csv-import-file')?.click()}
                      variant="outline"
                      className="w-full"
                      data-testid="button-import-csv"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {t('importFromCSV')}
                    </Button>
                    <input
                      id="csv-import-file"
                      type="file"
                      accept=".csv"
                      onChange={handleCSVImport}
                      className="hidden"
                      data-testid="input-import-csv"
                    />
                    <p className="text-xs text-muted-foreground">
                      Import from Excel or Google Sheets. A: question and b: answer format.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Dialog open={pasteDialogOpen} onOpenChange={setPasteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full"
                          data-testid="button-import-paste"
                        >
                          <Type className="w-4 h-4 mr-2" />
                          {t('pasteQuestionsText')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{t('pasteQuestionsTitle')}</DialogTitle>
                          <DialogDescription>
                            {t('pasteFormat')}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="bg-muted p-3 rounded-md text-sm font-mono">
                            Q: What is 2+2?<br />
                            A: 4<br />
                            <br />
                            Q: What is the capital of France?<br />
                            A: Paris
                          </div>
                          <Textarea
                            placeholder="Q: Your question here?&#10;A: Your answer here&#10;&#10;Q: Another question?&#10;A: Another answer"
                            value={pasteText}
                            onChange={(e) => setPasteText(e.target.value)}
                            className="min-h-[200px] font-mono"
                            data-testid="textarea-paste-questions"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={handlePasteImport}
                              disabled={!pasteText.trim()}
                              data-testid="button-confirm-paste"
                            >
                              Import Questions
                            </Button>
                            <Button
                              onClick={() => {
                                setPasteDialogOpen(false);
                                setPasteText("");
                              }}
                              variant="outline"
                              data-testid="button-cancel-paste"
                            >
                              {t('cancel')}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <p className="text-xs text-muted-foreground">
                      Copy and paste questions directly - no file needed, in A: question and B: answer format.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => document.getElementById('import-file')?.click()}
                      variant="outline"
                      className="w-full"
                      data-testid="button-import"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {t('importFromFile')}
                    </Button>
                    <input
                      id="import-file"
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                      data-testid="input-import-file"
                    />
                    <p className="text-xs text-muted-foreground">
                      Load questions from a previously exported file A: question and B: answer format.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('cloudSyncTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t('cloudSyncDescription')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="w-full"
                          disabled={questions.length === 0 || clearAllQuestionsMutation.isPending}
                          data-testid="button-clear-all"
                        >
                          {clearAllQuestionsMutation.isPending ? "Clearing..." : "Clear All Questions"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent data-testid="dialog-clear-all-confirm">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all {questions.length} questions from your account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-testid="button-cancel-clear">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => clearAllQuestionsMutation.mutate()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            data-testid="button-confirm-clear"
                          >
                            Delete All Questions
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <p className="text-xs text-muted-foreground mt-2">
                      Permanently removes all questions from your database. This cannot be undone.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
      </div>

      {isScreensaverActive && questions.length > 0 && (
        <ScreensaverMode
          key={`screensaver-${preferences?.defaultDuration}-${preferences?.bannerHeight}-${preferences?.fontSize}`}
          questions={questions}
          mode={displayMode}
          onExit={() => setIsScreensaverActive(false)}
          defaultDuration={preferences?.defaultDuration || 5}
          bannerHeight={preferences?.bannerHeight || 48}
          fontSize={preferences?.fontSize || 48}
          enableSoundNotifications={Boolean(preferences?.enableSoundNotifications)}
        />
      )}
    </>
  );
}

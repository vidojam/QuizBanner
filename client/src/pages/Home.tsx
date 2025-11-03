import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Play, Square, Settings as SettingsIcon, Download, Upload } from "lucide-react";
import QuestionForm from "@/components/QuestionForm";
import QuestionList from "@/components/QuestionList";
import ScreensaverMode from "@/components/ScreensaverMode";
import type { QuestionAnswer, Preferences } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const MODE_STORAGE_KEY = "display-mode";

export type DisplayMode = 'screensaver' | 'overlay';

export default function Home() {
  const [isScreensaverActive, setIsScreensaverActive] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    return (stored === 'overlay' || stored === 'screensaver') ? stored : 'screensaver';
  });
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
      toast({ title: "Settings saved successfully" });
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
              duration: q.duration || 15,
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
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
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

          <Tabs defaultValue="questions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="settings">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="data">
                <Upload className="w-4 h-4 mr-2" />
                Import/Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-6 mt-6">
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
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Banner Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Default Duration (seconds)</Label>
                      <span className="text-sm font-medium">{preferences?.defaultDuration || 15}s</span>
                    </div>
                    <Slider
                      value={[preferences?.defaultDuration || 15]}
                      onValueChange={([value]) => updatePreferencesMutation.mutate({ defaultDuration: value })}
                      min={5}
                      max={60}
                      step={5}
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
                  <CardTitle>Import & Export</CardTitle>
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
                      Export Questions to JSON
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Save all your questions and settings to a JSON file for backup or sharing
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
                      Import Questions from JSON
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
                      Load questions from a previously exported JSON file
                    </p>
                  </div>

                  <div className="mt-6 p-4 bg-muted rounded-md">
                    <h4 className="font-medium mb-2">Cloud Sync Active</h4>
                    <p className="text-sm text-muted-foreground">
                      Your questions are automatically saved to the cloud. Access them from any device by logging into your account.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {isScreensaverActive && questions.length > 0 && (
        <ScreensaverMode
          questions={questions}
          mode={displayMode}
          onExit={() => setIsScreensaverActive(false)}
          defaultDuration={preferences?.defaultDuration || 15}
          bannerHeight={preferences?.bannerHeight || 48}
          fontSize={preferences?.fontSize || 48}
          enableSoundNotifications={Boolean(preferences?.enableSoundNotifications)}
        />
      )}
    </>
  );
}

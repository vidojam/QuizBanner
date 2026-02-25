import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth, useLogout } from "@/hooks/useAuth";
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
import { AnimatedBanners } from "@/components/AnimatedBanners";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSelector } from "@/components/LanguageSelector";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";


const MODE_STORAGE_KEY = "display-mode";

export type DisplayMode = 'screensaver' | 'overlay';
type DemoPackKey = 'tech' | 'javascript' | 'movieStars' | 'aiBasics' | 'cars2026' | 'aiPrograms';
type DemoLoadKey = DemoPackKey | 'custom';
const DEMO_CATEGORY_PREFIX = 'demo-';

const DEMO_PACKS: Record<DemoPackKey, { label: string; items: Array<{ question: string; answer: string }> }> = {
  tech: {
    label: 'Tech',
    items: [
      { question: 'What is a CPU?', answer: 'Computer brain.' },
      { question: 'What is RAM?', answer: 'Short-term memory.' },
      { question: 'What is an SSD?', answer: 'Fast storage drive.' },
      { question: 'What is a GPU?', answer: 'Graphics processor.' },
      { question: 'What is Wi-Fi?', answer: 'Wireless internet.' },
      { question: 'What is Bluetooth?', answer: 'Short-range wireless.' },
      { question: 'What is cloud storage?', answer: 'Files online.' },
      { question: 'What is a browser?', answer: 'Web app viewer.' },
      { question: 'What is 5G?', answer: 'Fast mobile network.' },
      { question: 'What is a backup?', answer: 'Safety copy.' },
    ],
  },
  javascript: {
    label: 'JavaScript',
    items: [
      { question: 'Which keywords create vars?', answer: 'let and const.' },
      { question: 'What does === check?', answer: 'Value and type.' },
      { question: 'Add item to array?', answer: 'Use push().' },
      { question: 'Join array as text?', answer: 'Use join().' },
      { question: 'What is NaN?', answer: 'Not a number.' },
      { question: 'String to number?', answer: 'Use Number().' },
      { question: 'Array length?', answer: 'Use .length.' },
      { question: 'Run code later?', answer: 'Use setTimeout().' },
      { question: 'JSON text to object?', answer: 'JSON.parse().' },
      { question: 'Object to JSON text?', answer: 'JSON.stringify().' },
    ],
  },
  movieStars: {
    label: 'Movie Stars',
    items: [
      { question: 'Iron Man actor?', answer: 'Robert Downey Jr.' },
      { question: 'Wonder Woman actor?', answer: 'Gal Gadot.' },
      { question: 'Titanic male lead?', answer: 'Leonardo DiCaprio.' },
      { question: 'Barbie actor?', answer: 'Margot Robbie.' },
      { question: 'John Wick actor?', answer: 'Keanu Reeves.' },
      { question: 'Deadpool actor?', answer: 'Ryan Reynolds.' },
      { question: 'Joker actor (2019)?', answer: 'Joaquin Phoenix.' },
      { question: 'Black Widow actor?', answer: 'Scarlett Johansson.' },
      { question: 'Thor actor?', answer: 'Chris Hemsworth.' },
      { question: 'Spider-Man (MCU)?', answer: 'Tom Holland.' },
    ],
  },
  aiBasics: {
    label: 'What is AI',
    items: [
      { question: 'What is AI?', answer: 'Software that learns patterns.' },
      { question: 'What is ML?', answer: 'AI that learns from data.' },
      { question: 'What is NLP?', answer: 'AI for language tasks.' },
      { question: 'What is computer vision?', answer: 'AI that reads images.' },
      { question: 'What is a model?', answer: 'A trained prediction system.' },
      { question: 'What is training data?', answer: 'Examples used to learn.' },
      { question: 'What is inference?', answer: 'Model making a prediction.' },
      { question: 'What is a prompt?', answer: 'Instruction for an AI.' },
      { question: 'Can AI make mistakes?', answer: 'Yes, always verify output.' },
      { question: 'Best AI use at work?', answer: 'Draft, summarize, brainstorm.' },
    ],
  },
  cars2026: {
    label: 'Cars 2026',
    items: [
      { question: 'Good lease term in 2026?', answer: 'Usually 24-36 months.' },
      { question: 'What is residual value?', answer: 'Car value at lease end.' },
      { question: 'What raises lease cost?', answer: 'Low residual, high APR.' },
      { question: 'What is MSRP?', answer: 'Sticker price of car.' },
      { question: 'Repair or replace tires?', answer: 'Repair small punctures only.' },
      { question: 'Lease includes repairs?', answer: 'Usually not wear items.' },
      { question: 'Most reliable service habit?', answer: 'Follow factory schedule.' },
      { question: 'Battery check for hybrids?', answer: 'At major service visits.' },
      { question: 'Can you end lease early?', answer: 'Yes, with possible fees.' },
      { question: 'Best pre-return lease step?', answer: 'Fix damage, clean car.' },
    ],
  },
  aiPrograms: {
    label: '10 AI Programs',
    items: [
      { question: 'ChatGPT does what?', answer: 'Writes and explains text.' },
      { question: 'Claude does what?', answer: 'Long-form writing help.' },
      { question: 'Gemini does what?', answer: 'Search and reasoning tasks.' },
      { question: 'Perplexity does what?', answer: 'Answers with web sources.' },
      { question: 'Midjourney does what?', answer: 'Creates image art.' },
      { question: 'DALL·E does what?', answer: 'Generates images from text.' },
      { question: 'GitHub Copilot does what?', answer: 'Suggests code in IDE.' },
      { question: 'Notion AI does what?', answer: 'Summarizes and drafts notes.' },
      { question: 'Grammarly does what?', answer: 'Improves grammar and tone.' },
      { question: 'Canva AI does what?', answer: 'Quick design generation.' },
    ],
  },
};

export default function Home() {
  const { user, guestId, isGuest, tier } = useAuth();
  const logout = useLogout();
  const [, navigate] = useLocation();
  const { t, language } = useTranslation();
  const [isScreensaverActive, setIsScreensaverActive] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    return (stored === 'overlay' || stored === 'screensaver') ? stored : 'screensaver';
  });
  const [demoPackLoading, setDemoPackLoading] = useState<DemoLoadKey | null>(null);
  const [pasteDialogOpen, setPasteDialogOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const autoClearStartedRef = useRef(false);
  const { toast } = useToast();

  // Use guestId as userId for guests
  const effectiveUserId = user?.id || guestId || 'guest';

  // Fetch questions from database
  const { data: questions = [], isLoading: questionsLoading } = useQuery<QuestionAnswer[]>({
    queryKey: ['/api/questions'],
  });

  // Fetch user preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery<Preferences>({
    queryKey: ['/api/preferences'],
  });

  useEffect(() => {
    if (questionsLoading || autoClearStartedRef.current) {
      return;
    }

    autoClearStartedRef.current = true;

    const clearOnLoad = async () => {
      try {
        if (questions.length > 0) {
          await apiRequest('DELETE', '/api/questions');
          queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
        }
      } catch (error: any) {
        toast({
          title: "Auto-clear failed",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    clearOnLoad();
  }, [questionsLoading, questions.length, toast]);

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

  const buildCustomDemoItems = (subject: string) => {
    const cleanSubject = subject.trim();
    const lowerSubject = cleanSubject.toLowerCase();

    const hasKeyword = (keywords: string[]) => keywords.some((keyword) => lowerSubject.includes(keyword));

    if (hasKeyword(['code', 'coding', 'programming', 'javascript', 'python', 'react', 'typescript', 'developer'])) {
      return [
        { question: `${cleanSubject}: first concept?`, answer: 'Start with syntax basics.' },
        { question: `${cleanSubject}: best daily practice?`, answer: 'Build small features daily.' },
        { question: `${cleanSubject}: debug first step?`, answer: 'Reproduce the bug clearly.' },
        { question: `${cleanSubject}: avoid errors how?`, answer: 'Use linting and tests.' },
        { question: `${cleanSubject}: most useful skill?`, answer: 'Problem decomposition.' },
        { question: `${cleanSubject}: improve speed?`, answer: 'Learn editor shortcuts.' },
        { question: `${cleanSubject}: project starter?`, answer: 'Make a tiny app.' },
        { question: `${cleanSubject}: code quality tip?`, answer: 'Write clear function names.' },
        { question: `${cleanSubject}: interview prep?`, answer: 'Practice DS and APIs.' },
        { question: `${cleanSubject}: growth metric?`, answer: 'Ship features faster.' },
      ];
    }

    if (hasKeyword(['car', 'cars', 'auto', 'vehicle', 'lease', 'repair', 'toyota', 'honda', 'bmw'])) {
      return [
        { question: `${cleanSubject}: smart first check?`, answer: 'Review maintenance history.' },
        { question: `${cleanSubject}: lease sweet spot?`, answer: 'Usually 24-36 months.' },
        { question: `${cleanSubject}: cost saver?`, answer: 'Compare insurance quotes.' },
        { question: `${cleanSubject}: repair priority?`, answer: 'Fix safety issues first.' },
        { question: `${cleanSubject}: tire tip?`, answer: 'Rotate every 5k-7k miles.' },
        { question: `${cleanSubject}: battery care?`, answer: 'Test before winter.' },
        { question: `${cleanSubject}: oil change cue?`, answer: 'Follow maker schedule.' },
        { question: `${cleanSubject}: lease return prep?`, answer: 'Repair dents early.' },
        { question: `${cleanSubject}: resale booster?`, answer: 'Keep service records.' },
        { question: `${cleanSubject}: best habit?`, answer: 'Monthly visual inspection.' },
      ];
    }

    if (hasKeyword(['health', 'fitness', 'nutrition', 'diet', 'wellness', 'exercise', 'workout'])) {
      return [
        { question: `${cleanSubject}: healthy start?`, answer: 'Begin with simple habits.' },
        { question: `${cleanSubject}: daily target?`, answer: 'Move 30 minutes.' },
        { question: `${cleanSubject}: top nutrition tip?`, answer: 'Prioritize whole foods.' },
        { question: `${cleanSubject}: hydration rule?`, answer: 'Drink water regularly.' },
        { question: `${cleanSubject}: sleep goal?`, answer: 'Aim for 7-9 hours.' },
        { question: `${cleanSubject}: consistency trick?`, answer: 'Track progress weekly.' },
        { question: `${cleanSubject}: common blocker?`, answer: 'All-or-nothing thinking.' },
        { question: `${cleanSubject}: recovery tip?`, answer: 'Rest days matter.' },
        { question: `${cleanSubject}: motivation hack?`, answer: 'Set tiny milestones.' },
        { question: `${cleanSubject}: success sign?`, answer: 'More energy daily.' },
      ];
    }

    if (hasKeyword(['finance', 'money', 'invest', 'investing', 'budget', 'stocks', 'crypto', 'tax'])) {
      return [
        { question: `${cleanSubject}: first step?`, answer: 'Track monthly spending.' },
        { question: `${cleanSubject}: key safety habit?`, answer: 'Build emergency fund.' },
        { question: `${cleanSubject}: budget method?`, answer: 'Use 50/30/20 rule.' },
        { question: `${cleanSubject}: debt priority?`, answer: 'Pay high interest first.' },
        { question: `${cleanSubject}: investing baseline?`, answer: 'Diversify over time.' },
        { question: `${cleanSubject}: risk control?`, answer: 'Avoid single-asset bets.' },
        { question: `${cleanSubject}: long-term mindset?`, answer: 'Think in years.' },
        { question: `${cleanSubject}: tax habit?`, answer: 'Save key receipts.' },
        { question: `${cleanSubject}: biggest mistake?`, answer: 'Emotional decisions.' },
        { question: `${cleanSubject}: progress metric?`, answer: 'Higher net worth.' },
      ];
    }

    if (hasKeyword(['ai', 'artificial intelligence', 'machine learning', 'ml', 'llm'])) {
      return [
        { question: `${cleanSubject}: core idea?`, answer: 'Systems learn patterns.' },
        { question: `${cleanSubject}: input quality rule?`, answer: 'Better prompts, better output.' },
        { question: `${cleanSubject}: top use case?`, answer: 'Summarize and draft fast.' },
        { question: `${cleanSubject}: model limit?`, answer: 'Can hallucinate facts.' },
        { question: `${cleanSubject}: safety practice?`, answer: 'Verify critical claims.' },
        { question: `${cleanSubject}: team workflow win?`, answer: 'Automate repetitive tasks.' },
        { question: `${cleanSubject}: data concern?`, answer: 'Protect private info.' },
        { question: `${cleanSubject}: prompt tip?`, answer: 'Be specific and short.' },
        { question: `${cleanSubject}: evaluation method?`, answer: 'Test with real cases.' },
        { question: `${cleanSubject}: success metric?`, answer: 'Time saved weekly.' },
      ];
    }

    return [
      { question: `What is ${cleanSubject}?`, answer: `${cleanSubject} basics explained.` },
      { question: `Why learn ${cleanSubject}?`, answer: `Useful skills for work.` },
      { question: `${cleanSubject} first step?`, answer: `Learn core terms first.` },
      { question: `${cleanSubject} key tool?`, answer: `Use beginner-friendly tools.` },
      { question: `${cleanSubject} common mistake?`, answer: `Skipping fundamentals.` },
      { question: `${cleanSubject} daily habit?`, answer: `Practice 15 minutes.` },
      { question: `${cleanSubject} beginner goal?`, answer: `Build one small project.` },
      { question: `${cleanSubject} advanced skill?`, answer: `Solve real problems.` },
      { question: `${cleanSubject} how to improve?`, answer: `Review and repeat.` },
      { question: `${cleanSubject} success metric?`, answer: `Faster, better results.` },
    ];
  };

  const replaceDemoQuestions = async ({
    items,
    demoKey,
    label,
  }: {
    items: Array<{ question: string; answer: string }>;
    demoKey: string;
    label: string;
  }) => {
    const maxQuestions = user?.tier ? TIER_LIMITS[user.tier as keyof typeof TIER_LIMITS] : TIER_LIMITS.free;
    const targetDemoCount = user?.tier === 'free' ? 10 : items.length;
    const itemsToAdd = items.slice(0, Math.min(targetDemoCount, maxQuestions));

    for (const existingQuestion of questions) {
      await apiRequest('DELETE', `/api/questions/${existingQuestion.id}`);
    }

    const baseOrder = 0;

    for (let i = 0; i < itemsToAdd.length; i++) {
      const item = itemsToAdd[i];
      await apiRequest('POST', '/api/questions', {
        question: item.question,
        answer: item.answer,
        category: `${DEMO_CATEGORY_PREFIX}${demoKey}`,
        order: baseOrder + i,
      });
    }

    queryClient.invalidateQueries({ queryKey: ['/api/questions'] });

    if (user?.tier === 'free' && itemsToAdd.length < 10) {
      toast({
        title: `${label} demo loaded`,
        description: `Loaded ${itemsToAdd.length}/10 demo questions.`,
      });
      return;
    }

    toast({
      title: `${label} demo loaded`,
      description: `Loaded ${itemsToAdd.length} short question banners.`,
    });
  };

  const handleLoadDemoPack = async (pack: DemoPackKey) => {
    if (demoPackLoading) {
      return;
    }

    setDemoPackLoading(pack);

    try {
      await replaceDemoQuestions({
        items: DEMO_PACKS[pack].items,
        demoKey: pack,
        label: DEMO_PACKS[pack].label,
      });
    } catch (error: any) {
      toast({
        title: "Failed to add demo pack",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDemoPackLoading(null);
    }
  };

  const handleLoadCustomDemo = async (subject: string) => {
    if (demoPackLoading) {
      return;
    }

    const cleanSubject = subject.trim();
    if (!cleanSubject) {
      toast({
        title: "Enter a subject",
        description: "Type a subject to generate a custom demo.",
        variant: "destructive",
      });
      return;
    }

    setDemoPackLoading('custom');

    try {
      await replaceDemoQuestions({
        items: buildCustomDemoItems(cleanSubject),
        demoKey: 'custom',
        label: cleanSubject,
      });
    } catch (error: any) {
      toast({
        title: "Failed to add custom demo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDemoPackLoading(null);
    }
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
      <>
        <AnimatedBanners />
        <div className="min-h-screen bg-background flex items-center justify-center relative z-10">
          <div className="text-center">
            <div className="text-lg font-medium">Loading...</div>
            <div className="text-sm text-muted-foreground mt-2">Setting up your learning environment</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AnimatedBanners />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 relative z-10">
        <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
          <header className="space-y-4">
            <div className="flex items-center justify-between">
              <LanguageSelector />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await logout.mutateAsync();
                    navigate('/');
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
                <Logo size="lg" className="shadow-2xl" />
                <div>
                  <div className="text-xl font-bold text-foreground">
                    {user?.tier === "premium" ? t('premiumMember') : t('freeTierLabel')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user?.tier === 'free' && (
                  <Button 
                    size="sm"
                    variant="default"
                    onClick={() => navigate("/upgrade")}
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
                <p className="text-lg text-center font-bold mb-4">
                  Enter, view and edit questions and answers below
                </p>
              </div>

              {/* Paste Import Card - Available for all users */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('quickImport')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Dialog open={pasteDialogOpen} onOpenChange={setPasteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full"
                        data-testid="button-import-paste-questions"
                      >
                        <Type className="w-4 h-4 mr-2" />
                        {t('pasteMultipleQuestions')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{t('pasteQuestionsAndAnswers')}</DialogTitle>
                        <DialogDescription>
                          {t('pasteFormatDescription')} {user?.tier ? TIER_LIMITS[user.tier as keyof typeof TIER_LIMITS] : TIER_LIMITS.free} {language === 'es' ? 'preguntas' : 'questions'}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-muted p-3 rounded-md text-sm font-mono">
                          {language === 'es' ? (
                            <>
                              P: ¿Cuánto es 2+2?<br />
                              R: 4<br />
                              <br />
                              P: ¿Cuál es la capital de Francia?<br />
                              R: París
                            </>
                          ) : (
                            <>
                              Q: What is 2+2?<br />
                              A: 4<br />
                              <br />
                              Q: What is the capital of France?<br />
                              A: Paris
                            </>
                          )}
                        </div>
                        <Textarea
                          placeholder={language === 'es' ? "P: ¿Tu pregunta aquí?&#10;R: Tu respuesta aquí&#10;&#10;P: ¿Otra pregunta?&#10;R: Otra respuesta" : "Q: Your question here?&#10;A: Your answer here&#10;&#10;Q: Another question?&#10;A: Another answer"}
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
                            {t('importQuestions')}
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
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('quickImportDescription')}
                  </p>
                </CardContent>
              </Card>

              <QuestionForm
                onAdd={handleAddQuestion}
                onLoadDemoPack={handleLoadDemoPack}
                onLoadCustomDemo={handleLoadCustomDemo}
                demoPackLoading={demoPackLoading}
                questionsCount={questions.length}
                maxQuestions={user?.tier ? TIER_LIMITS[user.tier as keyof typeof TIER_LIMITS] : TIER_LIMITS.free}
              />

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  {t('yourQuestions')} ({questions.length})
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
                  <CardTitle>{t('displayMode')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-4">
                    <Button
                      variant={displayMode === 'screensaver' ? 'default' : 'outline'}
                      onClick={() => handleModeChange('screensaver')}
                      data-testid="button-mode-screensaver"
                      className="flex-1"
                    >
                      {t('screensaverOnly')}
                    </Button>
                    <Button
                      variant={displayMode === 'overlay' ? 'default' : 'outline'}
                      onClick={() => handleModeChange('overlay')}
                      data-testid="button-mode-overlay"
                      className="flex-1"
                    >
                      {t('alwaysOnTop')}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {displayMode === 'screensaver' 
                      ? t('screensaverModeDescription')
                      : t('alwaysOnTopModeDescription')}
                  </p>
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <p className="text-lg font-bold text-center">
                      {t('premiumModeInfo')}
                    </p>
                  </div>
                </CardContent>
              </Card>


              <Card>
                <CardHeader>
                  <CardTitle>{t('bannerAppearance')}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('changesApplyImmediately')}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{t('defaultDurationLabel')}</Label>
                      <span className="text-sm font-medium">{preferences?.defaultDuration || 5}s</span>
                    </div>
                    <Slider
                      value={[preferences?.defaultDuration || 5]}
                      onValueChange={([value]) => updatePreferencesMutation.mutate({ defaultDuration: value })}
                      min={1}
                      max={15}
                      step={1}
                      data-testid="slider-duration"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('defaultDurationDescription')}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{t('bannerHeightLabel')}</Label>
                      <span className="text-sm font-medium">{preferences?.bannerHeight || 72}px</span>
                    </div>
                    <Slider
                      value={[preferences?.bannerHeight || 72]}
                      onValueChange={([value]) => updatePreferencesMutation.mutate({ bannerHeight: value })}
                      min={32}
                      max={144}
                      step={8}
                      data-testid="slider-banner-height"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('bannerHeightDescription')}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{t('fontSizeLabel')}</Label>
                      <span className="text-sm font-medium">{preferences?.fontSize || 60}px</span>
                    </div>
                    <Slider
                      value={[preferences?.fontSize || 60]}
                      onValueChange={([value]) => updatePreferencesMutation.mutate({ fontSize: value })}
                      min={24}
                      max={144}
                      step={8}
                      data-testid="slider-font-size"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('fontSizeDescription')}
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
                      {t('importFromExcelDescription')}
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
                            {language === 'es' ? (
                              <>
                                P: ¿Cuánto es 2+2?<br />
                                R: 4<br />
                                <br />
                                P: ¿Cuál es la capital de Francia?<br />
                                R: París
                              </>
                            ) : (
                              <>
                                Q: What is 2+2?<br />
                                A: 4<br />
                                <br />
                                Q: What is the capital of France?<br />
                                A: Paris
                              </>
                            )}
                          </div>
                          <Textarea
                            placeholder={language === 'es' ? "P: ¿Tu pregunta aquí?&#10;R: Tu respuesta aquí&#10;&#10;P: ¿Otra pregunta?&#10;R: Otra respuesta" : "Q: Your question here?&#10;A: Your answer here&#10;&#10;Q: Another question?&#10;A: Another answer"}
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
                              {t('importQuestions')}
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
                      {t('copyPasteDescription')}
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
                      {t('loadFromFileDescription')}
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
                  <CardTitle className="text-destructive">{t('dangerZone')}</CardTitle>
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
                          {clearAllQuestionsMutation.isPending ? t('clearing') : t('clearAllQuestions')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent data-testid="dialog-clear-all-confirm">
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('areYouAbsoluteSure')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('deleteAllDescription')} {questions.length} {t('questionsFromAccount')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-testid="button-cancel-clear">{t('cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => clearAllQuestionsMutation.mutate()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            data-testid="button-confirm-clear"
                          >
                            {t('deleteAllQuestionsButton')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('permanentlyRemovesDescription')}
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
          bannerHeight={preferences?.bannerHeight || 72}
          fontSize={preferences?.fontSize || 60}
          enableSoundNotifications={Boolean(preferences?.enableSoundNotifications)}
        />
      )}
    </>
  );
}

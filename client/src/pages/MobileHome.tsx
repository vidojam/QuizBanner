import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Settings, BookOpen, Smartphone } from 'lucide-react';
import MobileQuestionList from '@/components/MobileQuestionList';
import MobileScreensaver from '@/components/MobileScreensaver';
import type { QuestionAnswer } from '@shared/schema';

export default function MobileHome() {
  const [currentView, setCurrentView] = useState<'home' | 'questions' | 'screensaver'>('home');
  
  // Mock data - replace with your actual data fetching
  const mockQuestions: QuestionAnswer[] = [
    {
      id: '1',
      userId: 'mock-user',
      question: 'What is the capital of France?',
      answer: 'Paris',
      category: 'Geography',
      tags: ['Europe', 'Capitals'],
      duration: 5,
      customColor: null,
      timesReviewed: 3,
      lastReviewed: new Date(),
      performanceScore: 0.8,
      order: 0
    },
    {
      id: '2',
      userId: 'mock-user',
      question: 'What is React?',
      answer: 'A JavaScript library for building user interfaces',
      category: 'Programming',
      tags: ['JavaScript', 'Frontend', 'Library'],
      duration: 7,
      customColor: null,
      timesReviewed: 1,
      lastReviewed: new Date(),
      performanceScore: 0.6,
      order: 1
    },
    {
      id: '3',
      userId: 'mock-user',
      question: 'What does API stand for?',
      answer: 'Application Programming Interface',
      category: 'Programming',
      tags: ['API', 'Backend'],
      duration: 4,
      customColor: null,
      timesReviewed: 5,
      lastReviewed: new Date(),
      performanceScore: 0.9,
      order: 2
    }
  ];

  const handleDelete = (id: string) => {
    console.log('Delete question:', id);
    // Implement delete logic
  };

  const handleEdit = (id: string, question: string, answer: string) => {
    console.log('Edit question:', id, question, answer);
    // Implement edit logic
  };

  // Stats
  const totalQuestions = mockQuestions.length;
  const masteredQuestions = mockQuestions.filter(q => q.performanceScore > 0.7).length;
  const categoriesSet = new Set(mockQuestions.map(q => q.category).filter(Boolean));
  const categories = Array.from(categoriesSet) as string[];

  if (currentView === 'questions') {
    return (
      <MobileQuestionList
        questions={mockQuestions}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    );
  }

  if (currentView === 'screensaver') {
    return (
      <MobileScreensaver
        questions={mockQuestions}
        onExit={() => setCurrentView('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">QuizBanner</h1>
            <p className="text-sm text-gray-600">Mobile Study Companion</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <div className="text-sm text-blue-100">Total Questions</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{masteredQuestions}</div>
            <div className="text-sm text-green-100">Mastered</div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Cards */}
      <div className="space-y-3">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-blue-200"
          onClick={() => setCurrentView('screensaver')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <Play className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">Start Study Session</h3>
                <p className="text-sm text-gray-600">Launch immersive screensaver mode</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  {totalQuestions} questions
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-green-200"
          onClick={() => setCurrentView('questions')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">Manage Questions</h3>
                <p className="text-sm text-gray-600">View, edit, and organize your questions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">Add New Question</h3>
                <p className="text-sm text-gray-600">Create a new study question</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">Settings</h3>
                <p className="text-sm text-gray-600">Customize your study experience</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {mockQuestions.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Questions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {mockQuestions.slice(0, 3).map((question) => (
                <div key={question.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{question.question}</p>
                    <p className="text-xs text-gray-500">{question.category}</p>
                  </div>
                  <Badge 
                    variant={question.performanceScore > 0.7 ? "default" : "secondary"}
                    className="text-xs shrink-0 ml-2"
                  >
                    {question.performanceScore > 0.7 ? "Mastered" : "Learning"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Back to Desktop Button */}
      <div className="mt-8 text-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.reload()}
          className="text-gray-600"
        >
          Switch to Desktop View
        </Button>
      </div>
    </div>
  );
}
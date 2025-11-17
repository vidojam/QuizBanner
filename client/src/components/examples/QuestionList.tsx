import QuestionList from '../QuestionList';

export default function QuestionListExample() {
  const mockQuestions = [
    { 
      id: '1', 
      userId: 'mock-user',
      question: 'What is the capital of France?', 
      answer: 'Paris',
      category: 'Geography',
      tags: ['Europe', 'Capitals'],
      duration: 5,
      customColor: null,
      timesReviewed: 0,
      lastReviewed: null,
      performanceScore: 0.5,
      order: 0
    },
    { 
      id: '2', 
      userId: 'mock-user',
      question: 'What is 2 + 2?', 
      answer: '4',
      category: 'Math',
      tags: ['Basic Math'],
      duration: 3,
      customColor: null,
      timesReviewed: 0,
      lastReviewed: null,
      performanceScore: 0.5,
      order: 1
    },
    { 
      id: '3', 
      userId: 'mock-user',
      question: 'Who wrote Romeo and Juliet?', 
      answer: 'William Shakespeare',
      category: 'Literature',
      tags: ['Shakespeare', 'Drama'],
      duration: 4,
      customColor: null,
      timesReviewed: 0,
      lastReviewed: null,
      performanceScore: 0.5,
      order: 2
    },
  ];

  return (
    <div className="p-8 max-w-2xl">
      <QuestionList 
        questions={mockQuestions} 
        onDelete={(id) => console.log('Delete:', id)}
        onEdit={(id, q, a) => console.log('Edit:', id, q, a)}
      />
    </div>
  );
}

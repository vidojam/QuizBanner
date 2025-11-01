import QuestionList from '../QuestionList';

export default function QuestionListExample() {
  const mockQuestions = [
    { id: '1', question: 'What is the capital of France?', answer: 'Paris' },
    { id: '2', question: 'What is 2 + 2?', answer: '4' },
    { id: '3', question: 'Who wrote Romeo and Juliet?', answer: 'William Shakespeare' },
  ];

  return (
    <div className="p-8 max-w-2xl">
      <QuestionList 
        questions={mockQuestions} 
        onDelete={(id) => console.log('Delete:', id)}
      />
    </div>
  );
}

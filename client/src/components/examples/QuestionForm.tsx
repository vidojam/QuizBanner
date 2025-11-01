import QuestionForm from '../QuestionForm';

export default function QuestionFormExample() {
  return (
    <div className="p-8 max-w-2xl">
      <QuestionForm 
        onAdd={(q, a) => console.log('Added:', q, a)} 
        questionsCount={3}
      />
    </div>
  );
}

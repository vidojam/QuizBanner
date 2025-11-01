import ScreensaverBanner from '../ScreensaverBanner';

export default function ScreensaverBannerExample() {
  return (
    <div className="min-h-screen">
      <ScreensaverBanner 
        question="What is the capital of France?"
        answer="Paris"
        backgroundColor="#e74c3c"
        onComplete={() => console.log('Banner complete')}
        answerDelay={5000}
      />
    </div>
  );
}

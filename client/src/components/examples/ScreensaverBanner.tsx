import ScreensaverBanner from '../ScreensaverBanner';

export default function ScreensaverBannerExample() {
  return (
    <div className="min-h-screen relative">
      <ScreensaverBanner 
        question="What is the capital of France?"
        answer="Paris"
        backgroundColor="#e74c3c"
        position="bottom"
        onComplete={() => console.log('Banner complete')}
      />
    </div>
  );
}

import TutorialOverlay from '../TutorialOverlay';

export default function TutorialOverlayExample() {
  return (
    <div className="relative h-[600px] bg-background">
      <TutorialOverlay onComplete={() => console.log('Tutorial completed')} />
    </div>
  );
}

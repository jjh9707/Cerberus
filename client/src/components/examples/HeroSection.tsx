import HeroSection from '../HeroSection';

export default function HeroSectionExample() {
  return (
    <div className="bg-background">
      <HeroSection onStartTutorial={() => console.log('Tutorial started')} />
    </div>
  );
}

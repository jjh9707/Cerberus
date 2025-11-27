import BankruptScreen from '../BankruptScreen';

export default function BankruptScreenExample() {
  return (
    <div className="relative h-[600px] bg-background">
      <BankruptScreen onRestart={() => console.log('Restart clicked')} />
    </div>
  );
}

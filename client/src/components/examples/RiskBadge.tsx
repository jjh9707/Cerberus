import RiskBadge from '../RiskBadge';

export default function RiskBadgeExample() {
  return (
    <div className="flex flex-wrap gap-4 p-8 bg-background">
      <RiskBadge level="low" />
      <RiskBadge level="medium" />
      <RiskBadge level="high" />
      <RiskBadge level="very_high" />
      <RiskBadge level="high" showAmount={false} />
    </div>
  );
}

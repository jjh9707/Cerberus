import ModuleCard, { MODULES } from '../ModuleCard';

export default function ModuleCardExample() {
  return (
    <div className="grid md:grid-cols-3 gap-6 p-8 bg-background">
      {MODULES.map((module, index) => (
        <ModuleCard
          key={module.id}
          module={module}
          completedCount={index === 0 ? 5 : index === 1 ? 2 : 0}
          onClick={() => console.log(`Started module: ${module.id}`)}
        />
      ))}
    </div>
  );
}

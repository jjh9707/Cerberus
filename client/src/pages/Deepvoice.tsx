import { useState } from 'react';
import DeepvoiceInfo from '@/components/DeepvoiceInfo';
import DeepvoiceExperience from '@/components/DeepvoiceExperience';

type View = 'info' | 'experience';

export default function Deepvoice() {
  const [view, setView] = useState<View>('info');

  return (
    <main className="flex-1 py-8 lg:py-12">
      <div className="container mx-auto px-4">
        {view === 'info' ? (
          <DeepvoiceInfo onStartExperience={() => setView('experience')} />
        ) : (
          <DeepvoiceExperience />
        )}
      </div>
    </main>
  );
}

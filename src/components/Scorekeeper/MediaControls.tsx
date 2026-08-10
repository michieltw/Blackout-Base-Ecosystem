import { Play, Pause } from 'lucide-react';

interface MediaControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  filter: string;
  setFilter: (f: any) => void;
}

export default function MediaControls({ isRunning, onToggle, filter, setFilter }: MediaControlsProps) {
  return (
    <section className="p-2 shrink-0 bg-[#1a1a1a] flex flex-col gap-2 border-b border-[#333]">
      <button
        className="w-full glossy-button py-4 rounded-lg flex items-center justify-center gap-4 text-3xl"
        onClick={onToggle}
      >
        {isRunning ? (
          <Pause className="w-8 h-8 text-gray-300 drop-shadow-lg" fill="currentColor" />
        ) : (
          <Play className="w-8 h-8 text-gray-300 drop-shadow-lg" fill="currentColor" />
        )}
      </button>
      <div className="flex gap-1 text-xs justify-between">
        {['all', 'shot', 'goal', 'penalty'].map(f => (
          <button
            key={f}
            className={`glossy-button px-2 py-1 rounded flex-1 ${filter === f ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}
            onClick={() => setFilter(f as any)}
          >
            {f === 'all' ? 'Alles' : f === 'shot' ? 'Schoten' : f === 'goal' ? 'Doelp.' : 'Straffen'}
          </button>
        ))}
      </div>
    </section>
  );
}

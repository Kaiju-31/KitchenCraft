import { Grid, List } from 'lucide-react';
import type { ViewMode } from '../../types';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export default function ViewModeToggle({
  viewMode,
  onViewModeChange,
  className = ""
}: ViewModeToggleProps) {
  return (
    <div className={`flex items-center space-x-2 bg-white/70 rounded-xl p-1 ${className}`}>
      <button
        onClick={() => onViewModeChange('grid')}
        className={`p-2 rounded-lg transition-all duration-200 ${
          viewMode === 'grid'
            ? 'bg-emerald-500 text-white shadow-md'
            : 'text-slate-500 hover:text-emerald-600'
        }`}
      >
        <Grid className="w-5 h-5" />
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`p-2 rounded-lg transition-all duration-200 ${
          viewMode === 'list'
            ? 'bg-emerald-500 text-white shadow-md'
            : 'text-slate-500 hover:text-emerald-600'
        }`}
      >
        <List className="w-5 h-5" />
      </button>
    </div>
  );
}
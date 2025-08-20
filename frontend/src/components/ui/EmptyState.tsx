import type { LucideProps } from 'lucide-react';

interface EmptyStateProps {
  icon: React.ComponentType<LucideProps>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`text-center py-16 ${className}`}>
      <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
        <Icon className="w-12 h-12 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-700 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 mb-4 max-w-md mx-auto">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'indigo' | 'emerald' | 'slate';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  color = 'indigo', 
  text,
  className = ""
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const colorClasses = {
    indigo: 'border-indigo-500',
    emerald: 'border-emerald-500',
    slate: 'border-slate-500'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin ${sizeClasses[size]} border-4 ${colorClasses[color]} border-t-transparent rounded-full`}></div>
      {text && (
        <p className="mt-4 text-slate-600">{text}</p>
      )}
    </div>
  );
}
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onKeyPress?: (key: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ 
  value, 
  onChange, 
  onKeyPress, 
  placeholder = "Rechercher...",
  className = ""
}: SearchBarProps) {
  return (
    <div className={`relative flex-1 group ${className}`}>
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors duration-200" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => onKeyPress && onKeyPress(e.key)}
        className="w-full pl-12 pr-4 py-3 min-h-12 text-lg xl:text-xl rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 shadow-lg hover:shadow-xl"
      />
    </div>
  );
}
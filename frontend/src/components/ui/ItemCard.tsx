import { ReactNode } from 'react';
import type { LucideProps } from 'lucide-react';

interface ItemCardProps {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ComponentType<LucideProps>;
  iconColor?: string;
  badge?: {
    text: string;
    color: string;
  };
  metadata?: Array<{
    icon: React.ComponentType<LucideProps>;
    text: string;
  }>;
  tags?: Array<{
    text: string;
    variant?: 'default' | 'muted';
  }>;
  actions?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function ItemCard({
  id,
  title,
  subtitle,
  description,
  icon: Icon,
  iconColor = 'from-slate-500 to-slate-600',
  badge,
  metadata = [],
  tags = [],
  actions,
  onClick,
  className = ""
}: ItemCardProps) {
  return (
    <div
      className={`group bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-2xl xl:rounded-3xl p-4 sm:p-4 xl:p-6 shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:scale-105 hover:-rotate-1 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* En-tête avec badge */}
      <div className="flex justify-between items-start mb-4">
        {badge && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${badge.color}`}>
            {badge.text}
          </span>
        )}
        {metadata.length > 0 && (
          <div className="text-right text-sm text-slate-500">
            {metadata.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-1 justify-end">
                <item.icon className="w-4 h-4" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Icône principale */}
      {Icon && (
        <div className={`w-12 h-12 sm:w-16 sm:h-16 xl:w-20 xl:h-20 mx-auto mb-4 bg-gradient-to-br ${iconColor} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 sm:w-8 sm:h-8 xl:w-10 xl:h-10 text-white" />
        </div>
      )}

      {/* Contenu */}
      <div className="text-center mb-4">
        <h3 className="text-base sm:text-lg xl:text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors duration-200">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mb-2">{subtitle}</p>
        )}
        {description && (
          <p className="text-slate-600 text-xs sm:text-sm line-clamp-2">{description}</p>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4 justify-center">
          {tags.slice(0, 3).map((tag, idx) => (
            <span 
              key={idx} 
              className={`text-xs px-2 py-1 rounded-lg ${
                tag.variant === 'muted' 
                  ? 'bg-slate-100 text-slate-600' 
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {tag.text}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-xs text-slate-400">
              +{tags.length - 3} autres
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div className="pt-4 border-t border-slate-200 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
          {actions}
        </div>
      )}
    </div>
  );
}
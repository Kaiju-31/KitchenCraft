import { ReactNode } from 'react';
import type { LucideProps } from 'lucide-react';
import { Baby } from 'lucide-react';

interface ItemListProps {
  items: Array<{
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
      variant?: 'default' | 'muted' | 'baby';
    }>;
    actions?: ReactNode;
    mobileActions?: ReactNode;
    tabletActions?: ReactNode;
    onClick?: () => void;
    hideIconOnMobile?: boolean;
    compactMetadataOnMobile?: boolean;
  }>;
  className?: string;
}

export default function ItemList({ items, className = "" }: ItemListProps) {
  if (items.length === 0) return null;

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden ${className}`}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`flex items-center justify-between p-4 xl:p-6 transition-all duration-200 hover:bg-emerald-50/50 cursor-pointer ${
            index !== items.length - 1 ? 'border-b border-slate-200' : ''
          }`}
          onClick={item.onClick}
        >
          <div className="flex items-center space-x-4">
            {/* Icône - masquée sur mobile si hideIconOnMobile est true */}
            {item.icon && (
              <div className={`w-12 h-12 bg-gradient-to-br ${item.iconColor || 'from-slate-500 to-slate-600'} rounded-xl flex items-center justify-center shadow-md ${
                item.hideIconOnMobile ? 'hidden sm:flex' : ''
              }`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
            )}

            {/* Contenu principal */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="text-lg xl:text-xl font-bold text-slate-800">
                  {item.title}
                </h3>
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${item.badge.color}`}>
                      {item.badge.text}
                    </span>
                  )}
                  {item.tags && item.tags.find(tag => tag.variant === 'baby') && (
                    <span className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-pink-700 bg-gradient-to-r from-pink-100 to-pink-200 border border-pink-200">
                      <Baby className="w-3 h-3" />
                      <span>Bébé</span>
                    </span>
                  )}
                </div>
              </div>
              
              {item.subtitle && (
                <p className="text-sm text-slate-500 mb-1">{item.subtitle}</p>
              )}
              
              {item.description && (
                <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
              )}

              {/* Tags (autres que bébé qui est déjà affiché en haut) */}
              {item.tags && item.tags.filter(tag => tag.variant !== 'baby').length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.filter(tag => tag.variant !== 'baby').slice(0, 4).map((tag, idx) => (
                    <span 
                      key={idx} 
                      className={`text-xs px-2 py-0.5 rounded ${
                        tag.variant === 'muted' 
                          ? 'bg-slate-100 text-slate-600' 
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {tag.text}
                    </span>
                  ))}
                  {item.tags.filter(tag => tag.variant !== 'baby').length > 4 && (
                    <span className="text-xs text-slate-400">
                      +{item.tags.filter(tag => tag.variant !== 'baby').length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Métadonnées - masquées sur mobile si compactMetadataOnMobile est true */}
            {item.metadata && item.metadata.length > 0 && (
              <div className={`text-right text-sm text-slate-500 space-y-1 ${
                item.compactMetadataOnMobile ? 'hidden sm:block' : ''
              }`}>
                {item.metadata.map((meta, idx) => (
                  <div key={idx} className="flex items-center space-x-1">
                    <meta.icon className="w-4 h-4" />
                    <span>{meta.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions avec support responsive */}
            <div className="flex items-center space-x-2">
              {/* Actions mobile (< 640px) */}
              {item.mobileActions && (
                <div className="sm:hidden">
                  {item.mobileActions}
                </div>
              )}
              
              {/* Actions tablette (640px - 1024px) */}
              {item.tabletActions && (
                <div className="hidden sm:flex lg:hidden">
                  {item.tabletActions}
                </div>
              )}
              
              {/* Actions desktop (>= 1024px) */}
              {item.actions && (
                <div className={`${item.mobileActions || item.tabletActions ? 'hidden' : 'flex'} ${item.mobileActions && !item.tabletActions ? 'sm:flex' : ''} ${item.tabletActions ? 'lg:flex' : ''}`}>
                  {item.actions}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
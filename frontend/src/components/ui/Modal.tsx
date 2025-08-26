import { ReactNode } from 'react';
import useKeyboard from '../../hooks/useKeyboard';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidth = 'md'
}: ModalProps) {
  // Raccourci clavier : Esc pour fermer la modal
  useKeyboard({
    onEscape: onClose,
    enabled: isOpen
  });

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-3xl p-6 xl:p-8 ${maxWidthClasses[maxWidth]} w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
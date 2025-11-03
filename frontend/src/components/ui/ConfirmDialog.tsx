import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';
import useKeyboard from '../../hooks/useKeyboard';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  disabled?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
  disabled = false
}: ConfirmDialogProps) {
  // Raccourcis clavier : Enter pour confirmer, Esc pour annuler
  useKeyboard({
    onEnter: disabled ? undefined : onConfirm,
    onEscape: disabled ? undefined : onClose,
    enabled: isOpen
  });

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          iconColor: 'text-amber-600',
          bgColor: 'from-amber-50 to-orange-50',
          confirmVariant: 'warning' as const
        };
      case 'info':
        return {
          iconColor: 'text-blue-600',
          bgColor: 'from-blue-50 to-indigo-50',
          confirmVariant: 'primary' as const
        };
      case 'danger':
      default:
        return {
          iconColor: 'text-red-600',
          bgColor: 'from-red-50 to-pink-50',
          confirmVariant: 'danger' as const
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${styles.bgColor} flex items-center justify-center`}>
              <AlertTriangle className={`w-5 h-5 ${styles.iconColor}`} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200 touch-manipulation"
            disabled={disabled}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-600 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 pt-0">
          <Button
            onClick={onClose}
            variant="secondary"
            fullWidth
            disabled={disabled}
            className="order-2 sm:order-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant={styles.confirmVariant}
            fullWidth
            disabled={disabled}
            className="order-1 sm:order-2"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
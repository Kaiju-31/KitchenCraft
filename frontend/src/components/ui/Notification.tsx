import { useEffect } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import useKeyboard from '../../hooks/useKeyboard';

interface NotificationProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export default function Notification({
  isVisible,
  onClose,
  title,
  message,
  type = 'success',
  duration = 3000
}: NotificationProps) {
  // Raccourci clavier : Esc pour fermer la notification
  useKeyboard({
    onEscape: onClose,
    enabled: isVisible
  });

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700',
          icon: Check
        };
      case 'error':
        return {
          bgColor: 'from-red-50 to-rose-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          icon: AlertCircle
        };
      case 'warning':
        return {
          bgColor: 'from-amber-50 to-orange-50',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-600',
          titleColor: 'text-amber-800',
          messageColor: 'text-amber-700',
          icon: AlertCircle
        };
      case 'info':
      default:
        return {
          bgColor: 'from-blue-50 to-indigo-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          icon: Info
        };
    }
  };

  const styles = getTypeStyles();
  const IconComponent = styles.icon;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full mx-4 sm:mx-0">
      <div
        className={`bg-gradient-to-br ${styles.bgColor} border ${styles.borderColor} rounded-xl shadow-lg p-4 transform transition-all duration-300 ease-out ${
          isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-2 opacity-0 scale-95'
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center`}>
            <IconComponent className={`w-4 h-4 ${styles.iconColor}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${styles.titleColor}`}>
              {title}
            </h4>
            <p className={`text-sm ${styles.messageColor} mt-1`}>
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <X className={`w-4 h-4 ${styles.iconColor}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
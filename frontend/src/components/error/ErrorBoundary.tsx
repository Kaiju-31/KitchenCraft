import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'page' | 'component' | 'critical';
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

/**
 * Error Boundary pour capturer et gérer les erreurs React
 * Évite que l'application entière plante et fournit une interface de récupération
 */
export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private readonly maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Générer un ID unique pour cette erreur
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { level = 'component', onError } = this.props;
    
    // Logger l'erreur avec contexte
    logger.error('React Error Boundary caught an error', error, {
      level,
      errorId: this.state.errorId,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      retryCount: this.retryCount,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });

    // Envoyer vers un service de monitoring si configuré
    if (import.meta.env.VITE_ERROR_REPORTING_ENABLED === 'true') {
      this.sendErrorToService(error, errorInfo);
    }

    // Callback personnalisé si fourni
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (callbackError) {
        logger.error('Error in error boundary callback', callbackError as Error);
      }
    }

    this.setState({ errorInfo });
  }

  /**
   * Envoie l'erreur vers un service de monitoring externe
   */
  private async sendErrorToService(error: Error, errorInfo: ErrorInfo) {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        level: this.props.level,
        retryCount: this.retryCount,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userId: null, // À remplir si authentification implémentée
        sessionId: sessionStorage.getItem('sessionId'),
        buildVersion: import.meta.env.VITE_APP_VERSION || 'unknown'
      };

      const response = await fetch(import.meta.env.VITE_ERROR_REPORTING_DSN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData)
      });

      if (!response.ok) {
        throw new Error(`Error reporting failed: ${response.status}`);
      }

      logger.info('Error successfully reported to monitoring service', { errorId: this.state.errorId });
    } catch (reportingError) {
      logger.warn('Failed to report error to monitoring service', reportingError as Error);
    }
  }

  /**
   * Tente de récupérer de l'erreur
   */
  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      logger.info('Attempting to recover from error', { 
        errorId: this.state.errorId, 
        retryCount: this.retryCount 
      });

      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null
      });
    } else {
      logger.warn('Max retry attempts reached', { errorId: this.state.errorId });
      // Rediriger vers la page d'accueil ou une page d'erreur
      window.location.href = '/';
    }
  };

  /**
   * Recharge la page entière
   */
  private handleReload = () => {
    logger.info('Reloading page due to error', { errorId: this.state.errorId });
    window.location.reload();
  };

  /**
   * Retourne à l'accueil
   */
  private handleGoHome = () => {
    logger.info('Redirecting to home due to error', { errorId: this.state.errorId });
    window.location.href = '/';
  };

  /**
   * Copie les détails de l'erreur dans le presse-papier
   */
  private handleCopyError = async () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      logger.info('Error details copied to clipboard', { errorId: this.state.errorId });
    } catch (error) {
      logger.warn('Failed to copy error details', error as Error);
    }
  };

  render() {
    if (this.state.hasError) {
      // Utiliser le fallback personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component' } = this.props;
      const canRetry = this.retryCount < this.maxRetries;

      // Interface d'erreur selon le niveau
      if (level === 'critical') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-orange-50">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-200 p-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Erreur Critique
                </h1>
                <p className="text-gray-600 mb-6">
                  Une erreur critique s'est produite. L'application doit être rechargée.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={this.handleReload}
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recharger l'application
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Retour à l'accueil
                  </button>
                </div>
                {import.meta.env.DEV && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={this.handleCopyError}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center mx-auto"
                    >
                      <Bug className="w-4 h-4 mr-1" />
                      Copier les détails (Dev)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      if (level === 'page') {
        return (
          <div className="min-h-96 flex items-center justify-center p-8">
            <div className="max-w-md w-full text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Erreur sur cette page
              </h2>
              <p className="text-gray-600 mb-6">
                Une erreur s'est produite lors du chargement de cette page.
              </p>
              <div className="space-y-2">
                {canRetry && (
                  <button
                    onClick={this.handleRetry}
                    className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réessayer ({this.maxRetries - this.retryCount} restant{this.maxRetries - this.retryCount > 1 ? 's' : ''})
                  </button>
                )}
                <button
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Retour à l'accueil
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Niveau component (par défaut)
      return (
        <div className="border border-yellow-200 rounded-lg bg-yellow-50 p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                Erreur de composant
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                Ce composant a rencontré une erreur et n'a pas pu être affiché.
              </p>
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 transition-colors"
                >
                  <RefreshCw className="w-3 h-3 inline mr-1" />
                  Réessayer
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC pour wrapper facilement les composants
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

export default ErrorBoundary;
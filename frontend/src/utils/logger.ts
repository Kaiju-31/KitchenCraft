/**
 * Système de logging sécurisé configuré par environnement
 * Évite l'exposition d'informations sensibles en production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;
  private logLevel: LogLevel;
  private consoleEnabled: boolean;
  private remoteEnabled: boolean;
  private remoteUrl?: string;
  private logQueue: LogEntry[] = [];
  private readonly MAX_QUEUE_SIZE = 100;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.logLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info';
    this.consoleEnabled = import.meta.env.VITE_LOG_CONSOLE_ENABLED !== 'false';
    this.remoteEnabled = import.meta.env.VITE_LOG_REMOTE_ENABLED === 'true';
    this.remoteUrl = import.meta.env.VITE_LOG_REMOTE_URL;
  }

  /**
   * Vérifie si un niveau de log doit être traité
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    return levels[level] >= levels[this.logLevel];
  }

  /**
   * Sanitise les données sensibles avant logging
   */
  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveKeys = [
      'password', 'token', 'secret', 'key', 'authorization',
      'cookie', 'session', 'auth', 'credential', 'api_key'
    ];

    const sanitized = { ...data };

    const sanitizeObject = (obj: any, path: string = ''): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map((item, index) => sanitizeObject(item, `${path}[${index}]`));
      }

      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = path ? `${path}.${key}` : key;
        const isKeySensitive = sensitiveKeys.some(sensitive => 
          key.toLowerCase().includes(sensitive.toLowerCase())
        );

        if (isKeySensitive) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          result[key] = sanitizeObject(value, fullKey);
        } else {
          result[key] = value;
        }
      }
      return result;
    };

    return sanitizeObject(sanitized);
  }

  /**
   * Crée une entrée de log
   */
  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context ? this.sanitizeData(context) : undefined,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined
      } as any : undefined
    };
  }

  /**
   * Envoie les logs vers la console
   */
  private logToConsole(entry: LogEntry): void {
    if (!this.consoleEnabled) return;

    const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()}:`;
    const args = [prefix, entry.message];

    if (entry.context) {
      args.push('\nContext:', entry.context);
    }

    if (entry.error) {
      args.push('\nError:', entry.error);
    }

    switch (entry.level) {
      case 'debug':
        if (this.isDevelopment) console.debug(...args);
        break;
      case 'info':
        console.info(...args);
        break;
      case 'warn':
        console.warn(...args);
        break;
      case 'error':
        console.error(...args);
        break;
    }
  }

  /**
   * Ajoute une entrée à la queue pour envoi remote
   */
  private addToQueue(entry: LogEntry): void {
    this.logQueue.push(entry);
    
    // Limiter la taille de la queue
    if (this.logQueue.length > this.MAX_QUEUE_SIZE) {
      this.logQueue = this.logQueue.slice(-this.MAX_QUEUE_SIZE);
    }
  }

  /**
   * Envoie les logs vers un service distant (si configuré)
   */
  private async sendRemoteLogs(): Promise<void> {
    if (!this.remoteEnabled || !this.remoteUrl || this.logQueue.length === 0) {
      return;
    }

    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    try {
      await fetch(this.remoteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: logsToSend,
          source: 'kitchencraft-frontend',
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    } catch (error) {
      // En cas d'échec, remettre les logs en queue
      this.logQueue.unshift(...logsToSend);
      if (this.isDevelopment) {
        console.warn('Failed to send remote logs:', error);
      }
    }
  }

  /**
   * Log une entrée
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, context, error);

    this.logToConsole(entry);
    
    if (this.remoteEnabled) {
      this.addToQueue(entry);
      
      // Envoyer immédiatement pour les erreurs
      if (level === 'error') {
        this.sendRemoteLogs();
      }
    }
  }

  /**
   * Log debug (seulement en développement)
   */
  debug(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  /**
   * Log d'information
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  /**
   * Log d'avertissement
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  /**
   * Log d'erreur
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error);
  }

  /**
   * Log pour les performances
   */
  performance(operation: string, duration: number, context?: Record<string, any>): void {
    this.info(`Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      ...context
    });
  }

  /**
   * Log pour les événements utilisateur (analytics)
   */
  userEvent(event: string, properties?: Record<string, any>): void {
    this.info(`User Event: ${event}`, {
      event,
      properties: this.sanitizeData(properties),
      timestamp: Date.now()
    });
  }

  /**
   * Log pour le cache
   */
  cache(action: 'hit' | 'miss' | 'set' | 'invalidate', key: string, details?: Record<string, any>): void {
    this.debug(`Cache ${action}: ${key}`, {
      action,
      key,
      ...details
    });
  }

  /**
   * Flush des logs en attente (à appeler avant fermeture)
   */
  async flush(): Promise<void> {
    if (this.remoteEnabled && this.logQueue.length > 0) {
      await this.sendRemoteLogs();
    }
  }

  /**
   * Configure le niveau de log à l'exécution
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Active/désactive les logs console
   */
  setConsoleEnabled(enabled: boolean): void {
    this.consoleEnabled = enabled;
  }

  /**
   * Obtient les statistiques des logs
   */
  getStats(): { queueSize: number; level: LogLevel; consoleEnabled: boolean; remoteEnabled: boolean } {
    return {
      queueSize: this.logQueue.length,
      level: this.logLevel,
      consoleEnabled: this.consoleEnabled,
      remoteEnabled: this.remoteEnabled
    };
  }
}

// Instance singleton
export const logger = new Logger();

// Envoi périodique des logs (toutes les 30 secondes)
if (import.meta.env.VITE_LOG_REMOTE_ENABLED === 'true') {
  setInterval(() => {
    logger.flush();
  }, 30000);
}

// Flush avant fermeture de la page
window.addEventListener('beforeunload', () => {
  logger.flush();
});

export default logger;
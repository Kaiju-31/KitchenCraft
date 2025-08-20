/**
 * Cache sécurisé avec signature HMAC pour prévenir la pollution
 * Utilisé pour valider l'intégrité des données stockées en localStorage
 */

import { logger } from './logger';

interface SecureCacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  signature: string;
  version: string;
}

interface CacheOptions {
  ttl?: number;
  useLocalStorage?: boolean;
  validateIntegrity?: boolean;
}

class SecureCache {
  private memoryCache: Map<string, SecureCacheItem<any>> = new Map();
  private readonly LOCAL_STORAGE_PREFIX = 'secure_cache_';
  private readonly CACHE_VERSION = '1.0';
  private hmacKey: string;
  private encryptionEnabled: boolean;

  constructor() {
    this.hmacKey = import.meta.env.VITE_CACHE_HMAC_KEY || 'default_key_not_secure_change_in_production';
    this.encryptionEnabled = import.meta.env.VITE_CACHE_ENCRYPTION_ENABLED === 'true';
    
    if (this.hmacKey === 'default_key_not_secure_change_in_production' && import.meta.env.PROD) {
      logger.warn('Using default HMAC key in production - security risk!');
    }
  }

  /**
   * Génère une signature HMAC pour les données
   */
  private async generateSignature(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const keyBuffer = encoder.encode(this.hmacKey);
      const dataBuffer = encoder.encode(data);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
      return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      logger.error('Failed to generate HMAC signature', error);
      throw new Error('Cache signature generation failed');
    }
  }

  /**
   * Vérifie la signature HMAC des données
   */
  private async verifySignature(data: string, signature: string): Promise<boolean> {
    try {
      const expectedSignature = await this.generateSignature(data);
      
      // Comparaison sécurisée pour éviter les timing attacks
      if (signature.length !== expectedSignature.length) {
        return false;
      }

      let result = 0;
      for (let i = 0; i < signature.length; i++) {
        result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
      }

      return result === 0;
    } catch (error) {
      logger.error('Failed to verify HMAC signature', error);
      return false;
    }
  }

  /**
   * Sérialise les données de façon sécurisée
   */
  private serializeData<T>(data: T): string {
    try {
      // Nettoyage des données sensibles avant sérialisation
      const sanitizedData = this.sanitizeForStorage(data);
      return JSON.stringify(sanitizedData);
    } catch (error) {
      logger.error('Failed to serialize cache data', error);
      throw new Error('Cache serialization failed');
    }
  }

  /**
   * Nettoie les données sensibles avant stockage
   */
  private sanitizeForStorage(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveKeys = [
      'password', 'token', 'secret', 'key', 'authorization',
      'cookie', 'session', 'auth', 'credential', 'private'
    ];

    const sanitize = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }

      if (typeof obj === 'object' && obj !== null) {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
          const isKeySensitive = sensitiveKeys.some(sensitive => 
            key.toLowerCase().includes(sensitive.toLowerCase())
          );

          if (isKeySensitive) {
            // Ne pas stocker les données sensibles
            logger.warn(`Sensitive data excluded from cache: ${key}`);
            continue;
          }

          result[key] = sanitize(value);
        }
        return result;
      }

      return obj;
    };

    return sanitize(data);
  }

  /**
   * Stocke une valeur dans le cache avec signature
   */
  async set<T>(key: string, data: T, ttl: number, useLocalStorage = false): Promise<void> {
    try {
      const serializedData = this.serializeData(data);
      const signature = await this.generateSignature(serializedData);

      const item: SecureCacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        signature,
        version: this.CACHE_VERSION
      };

      // Stocker en mémoire
      this.memoryCache.set(key, item);
      logger.cache('set', key, { ttl, useLocalStorage, size: serializedData.length });

      // Stocker en localStorage si demandé
      if (useLocalStorage) {
        try {
          const itemToStore = {
            ...item,
            data: serializedData // Stocker la version sérialisée
          };

          localStorage.setItem(
            this.LOCAL_STORAGE_PREFIX + key,
            JSON.stringify(itemToStore)
          );
        } catch (error) {
          logger.warn('Failed to save to localStorage', error, { key });
          
          // Tenter de libérer de l'espace
          this.cleanExpiredLocalStorage();
        }
      }
    } catch (error) {
      logger.error('Failed to set cache item', error, { key });
      throw error;
    }
  }

  /**
   * Récupère une valeur du cache avec vérification de signature
   */
  async get<T>(key: string, useLocalStorage = false): Promise<T | null> {
    try {
      // Vérifier le cache mémoire d'abord
      const memoryItem = this.memoryCache.get(key);
      if (memoryItem && await this.isValidItem(memoryItem)) {
        logger.cache('hit', key, { source: 'memory' });
        return memoryItem.data;
      }

      // Vérifier localStorage si activé
      if (useLocalStorage) {
        const stored = localStorage.getItem(this.LOCAL_STORAGE_PREFIX + key);
        if (stored) {
          try {
            const item = JSON.parse(stored) as SecureCacheItem<string>;
            
            if (await this.isValidItem(item)) {
              // Vérifier la signature des données
              const isSignatureValid = await this.verifySignature(item.data as string, item.signature);
              
              if (isSignatureValid) {
                const deserializedData = JSON.parse(item.data as string);
                
                // Restaurer en cache mémoire
                const restoredItem: SecureCacheItem<T> = {
                  ...item,
                  data: deserializedData
                };
                this.memoryCache.set(key, restoredItem);
                
                logger.cache('hit', key, { source: 'localStorage', validated: true });
                return deserializedData;
              } else {
                logger.warn('Cache signature validation failed', undefined, { key });
                this.invalidate(key);
                logger.cache('invalidate', key, { reason: 'invalid_signature' });
              }
            } else {
              // Item expiré, le supprimer
              localStorage.removeItem(this.LOCAL_STORAGE_PREFIX + key);
              logger.cache('invalidate', key, { reason: 'expired' });
            }
          } catch (error) {
            logger.warn('Failed to parse cached item', error, { key });
            localStorage.removeItem(this.LOCAL_STORAGE_PREFIX + key);
          }
        }
      }

      logger.cache('miss', key);
      return null;
    } catch (error) {
      logger.error('Failed to get cache item', error, { key });
      return null;
    }
  }

  /**
   * Vérifie si un item de cache est valide (non expiré et bonne version)
   */
  private async isValidItem(item: SecureCacheItem<any>): Promise<boolean> {
    // Vérifier l'expiration
    if (Date.now() - item.timestamp >= item.ttl) {
      return false;
    }

    // Vérifier la version du cache
    if (item.version !== this.CACHE_VERSION) {
      logger.warn('Cache version mismatch', undefined, { 
        expected: this.CACHE_VERSION, 
        found: item.version 
      });
      return false;
    }

    return true;
  }

  /**
   * Invalide une entrée de cache
   */
  invalidate(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(this.LOCAL_STORAGE_PREFIX + key);
      logger.cache('invalidate', key);
    } catch (error) {
      logger.warn('Failed to remove from localStorage', error, { key });
    }
  }

  /**
   * Invalide les entrées correspondant à un pattern
   */
  invalidatePattern(pattern: RegExp): void {
    let invalidatedCount = 0;

    // Invalider le cache mémoire
    for (const key of this.memoryCache.keys()) {
      if (pattern.test(key)) {
        this.memoryCache.delete(key);
        invalidatedCount++;
      }
    }

    // Invalider localStorage
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.LOCAL_STORAGE_PREFIX)) {
          const cacheKey = key.substring(this.LOCAL_STORAGE_PREFIX.length);
          if (pattern.test(cacheKey)) {
            localStorage.removeItem(key);
            invalidatedCount++;
          }
        }
      }
    } catch (error) {
      logger.warn('Failed to invalidate localStorage pattern', error);
    }

    logger.info(`Cache pattern invalidated: ${pattern}`, { invalidatedCount });
  }

  /**
   * Nettoie les entrées expirées du localStorage
   */
  private cleanExpiredLocalStorage(): void {
    try {
      let cleanedCount = 0;
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.LOCAL_STORAGE_PREFIX)) {
          try {
            const item = JSON.parse(localStorage.getItem(key)!);
            if (Date.now() - item.timestamp >= item.ttl) {
              keysToRemove.push(key);
            }
          } catch (error) {
            // Item corrompu, le marquer pour suppression
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        cleanedCount++;
      });

      if (cleanedCount > 0) {
        logger.info(`Cleaned ${cleanedCount} expired cache entries`);
      }
    } catch (error) {
      logger.error('Failed to clean expired localStorage', error);
    }
  }

  /**
   * Vide complètement le cache
   */
  clear(): void {
    this.memoryCache.clear();
    
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.LOCAL_STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      logger.info(`Cache cleared: ${keysToRemove.length} items removed`);
    } catch (error) {
      logger.error('Failed to clear localStorage cache', error);
    }
  }

  /**
   * Obtient les statistiques du cache
   */
  getStats(): {
    memorySize: number;
    localStorageSize: number;
    encryptionEnabled: boolean;
    version: string;
  } {
    let localStorageSize = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.LOCAL_STORAGE_PREFIX)) {
          localStorageSize++;
        }
      }
    } catch (error) {
      logger.warn('Failed to get localStorage stats', error);
    }

    return {
      memorySize: this.memoryCache.size,
      localStorageSize,
      encryptionEnabled: this.encryptionEnabled,
      version: this.CACHE_VERSION
    };
  }
}

// Instance singleton
export const secureCache = new SecureCache();

// Nettoyage périodique (toutes les 5 minutes)
setInterval(() => {
  secureCache['cleanExpiredLocalStorage']();
}, 5 * 60 * 1000);

export default secureCache;
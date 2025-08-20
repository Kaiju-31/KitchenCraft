import { useState, useEffect, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Default 5 minutes
  useLocalStorage?: boolean; // Persist across sessions
  invalidateOnMount?: boolean; // Force refresh on component mount
}

class APICache {
  private memoryCache: Map<string, CacheItem<any>> = new Map();
  private readonly LOCAL_STORAGE_PREFIX = 'api_cache_';

  set<T>(key: string, data: T, ttl: number, useLocalStorage = false): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    // Always store in memory
    this.memoryCache.set(key, item);

    // Optionally store in localStorage
    if (useLocalStorage) {
      try {
        localStorage.setItem(
          this.LOCAL_STORAGE_PREFIX + key,
          JSON.stringify(item)
        );
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }
  }

  get<T>(key: string, useLocalStorage = false): T | null {
    // Check memory cache first (fastest)
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      return memoryItem.data;
    }

    // Check localStorage if enabled
    if (useLocalStorage) {
      try {
        const stored = localStorage.getItem(this.LOCAL_STORAGE_PREFIX + key);
        if (stored) {
          const item: CacheItem<T> = JSON.parse(stored);
          if (this.isValid(item)) {
            // Restore to memory cache
            this.memoryCache.set(key, item);
            return item.data;
          } else {
            // Clean expired localStorage entry
            localStorage.removeItem(this.LOCAL_STORAGE_PREFIX + key);
          }
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
      }
    }

    return null;
  }

  private isValid(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  invalidate(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(this.LOCAL_STORAGE_PREFIX + key);
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  invalidatePattern(pattern: RegExp): void {
    // Invalidate memory cache
    for (const key of this.memoryCache.keys()) {
      if (pattern.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // Invalidate localStorage
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.LOCAL_STORAGE_PREFIX)) {
          const cacheKey = key.substring(this.LOCAL_STORAGE_PREFIX.length);
          if (pattern.test(cacheKey)) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  clear(): void {
    this.memoryCache.clear();
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.LOCAL_STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      // Ignore localStorage errors
    }
  }
}

// Singleton instance
const apiCache = new APICache();

/**
 * Hook pour gérer le cache des API calls avec TTL et persistance
 * @param key - Clé unique pour le cache
 * @param fetcher - Fonction async qui retourne les données
 * @param options - Options de cache
 */
export function useAPICache<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes par défaut
    useLocalStorage = false,
    invalidateOnMount = false
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Function to normalize cache key for consistency
  const normalizeKey = (rawKey: string): string => {
    // Simple normalization to avoid circular dependency
    if (rawKey.includes('?')) {
      const [base, query] = rawKey.split('?');
      const params = new URLSearchParams(query);
      
      // Nettoyer et trier les paramètres
      const sortedParams = new URLSearchParams();
      const sortedKeys = Array.from(params.keys()).sort();
      
      sortedKeys.forEach(key => {
        const values = params.getAll(key);
        if (values.length === 1) {
          const value = values[0].trim();
          if (value) {
            // Traitement spécial pour certains paramètres
            switch (key) {
              case 'ingredients':
              case 'origins':
                // Trier les listes séparées par virgules
                const items = value.split(',')
                  .map(item => item.trim())
                  .filter(item => item.length > 0)
                  .sort();
                if (items.length > 0) {
                  sortedParams.append(key, items.join(','));
                }
                break;
              case 'name':
              case 'search':
                // Nettoyer les termes de recherche
                const cleanName = value.toLowerCase().trim().replace(/\s+/g, ' ');
                if (cleanName) {
                  sortedParams.append(key, cleanName);
                }
                break;
              default:
                sortedParams.append(key, value);
            }
          }
        } else {
          // Plusieurs valeurs, les trier
          const sortedValues = values.map(v => v.trim()).filter(v => v).sort();
          sortedValues.forEach(value => {
            if (value) {
              sortedParams.append(key, value);
            }
          });
        }
      });
      
      return `${base}?${sortedParams.toString()}`;
    }
    return rawKey;
  };

  const fetchData = async (forceRefresh = false) => {
    if (!key) return;

    const normalizedKey = normalizeKey(key);

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first unless forcing refresh
    if (!forceRefresh) {
      const cached = apiCache.get<T>(normalizedKey, useLocalStorage);
      if (cached) {
        setData(cached);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const result = await fetcher();
      
      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      // Cache the result
      apiCache.set(normalizedKey, result, ttl, useLocalStorage);
      setData(result);
    } catch (err) {
      if (!abortController.signal.aborted) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        console.error('API Cache fetch error:', err);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  // Prefetch function for predictive loading
  const prefetch = async () => {
    if (!key) return;
    
    const normalizedKey = normalizeKey(key);
    const cached = apiCache.get<T>(normalizedKey, useLocalStorage);
    
    if (!cached) {
      try {
        const result = await fetcher();
        apiCache.set(normalizedKey, result, ttl, useLocalStorage);
      } catch (error) {
        // Silent fail for prefetch
        console.warn('Prefetch failed:', error);
      }
    }
  };

  // Invalidate this specific cache entry
  const invalidate = () => {
    if (key) {
      const normalizedKey = normalizeKey(key);
      apiCache.invalidate(normalizedKey);
      fetchData(true); // Force refresh
    }
  };

  // Invalidate cache entries matching a pattern
  const invalidatePattern = (pattern: RegExp) => {
    apiCache.invalidatePattern(pattern);
  };

  useEffect(() => {
    if (invalidateOnMount && key) {
      const normalizedKey = normalizeKey(key);
      apiCache.invalidate(normalizedKey);
    }
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [key]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    prefetch,
    invalidate,
    invalidatePattern
  };
}

// Export cache instance for manual operations
export { apiCache };
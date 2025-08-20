import { useState, useEffect } from 'react';
import { apiCache } from '../../hooks/useAPICache';

interface CacheStats {
  totalHits: number;
  totalMisses: number;
  cacheSize: number;
  hitRate: number;
}

/**
 * Composant de monitoring des performances du cache (développement seulement)
 */
export default function CacheMonitor() {
  const [stats, setStats] = useState<CacheStats>({
    totalHits: 0,
    totalMisses: 0,
    cacheSize: 0,
    hitRate: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Montrer le moniteur seulement en développement
    if (process.env.NODE_ENV === 'development') {
      // Vérifier si l'utilisateur a activé le monitoring
      const monitoring = localStorage.getItem('cache_monitoring');
      if (monitoring === 'enabled') {
        setIsVisible(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const updateStats = () => {
      // Ces statistiques seraient normalement trackées dans apiCache
      // Pour l'instant, on simule avec localStorage
      try {
        let cacheSize = 0;
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('api_cache_')) {
            cacheSize++;
          }
        });

        const hits = parseInt(localStorage.getItem('cache_hits') || '0');
        const misses = parseInt(localStorage.getItem('cache_misses') || '0');
        const total = hits + misses;
        const hitRate = total > 0 ? Math.round((hits / total) * 100) : 0;

        setStats({
          totalHits: hits,
          totalMisses: misses,
          cacheSize,
          hitRate
        });
      } catch (error) {
        console.warn('Failed to update cache stats:', error);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Mise à jour toutes les 5 secondes

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleClearCache = () => {
    apiCache.clear();
    localStorage.removeItem('cache_hits');
    localStorage.removeItem('cache_misses');
    setStats({
      totalHits: 0,
      totalMisses: 0,
      cacheSize: 0,
      hitRate: 0
    });
  };

  const handleToggleMonitoring = () => {
    if (isVisible) {
      localStorage.setItem('cache_monitoring', 'disabled');
      setIsVisible(false);
    } else {
      localStorage.setItem('cache_monitoring', 'enabled');
      setIsVisible(true);
    }
  };

  // En production, montrer seulement un bouton pour activer/désactiver
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleToggleMonitoring}
          className="bg-gray-800 text-white px-3 py-1 rounded text-xs opacity-50 hover:opacity-100"
        >
          {isVisible ? 'Hide Cache' : 'Show Cache'}
        </button>
      </div>
    );
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleToggleMonitoring}
          className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
        >
          Show Cache Monitor
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-800">Cache Monitor</h3>
        <button
          onClick={handleToggleMonitoring}
          className="text-gray-500 hover:text-gray-700 text-xs"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Cache Size:</span>
          <span className="font-mono">{stats.cacheSize}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Hit Rate:</span>
          <span className={`font-mono ${stats.hitRate >= 70 ? 'text-green-600' : 
                                      stats.hitRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {stats.hitRate}%
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Cache Hits:</span>
          <span className="font-mono text-green-600">{stats.totalHits}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Cache Misses:</span>
          <span className="font-mono text-red-600">{stats.totalMisses}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-200">
        <button
          onClick={handleClearCache}
          className="w-full bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
        >
          Clear Cache
        </button>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(stats.hitRate, 100)}%` }}
          ></div>
        </div>
        <div className="text-center mt-1">Performance</div>
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback } from 'react';
import { recipeService } from '../services/recipeService';
import { useApi } from './useApi';

export function useOrigins() {
  const [origins, setOrigins] = useState<string[]>([]);

  const {
    loading,
    error,
    execute
  } = useApi<string[]>();

  const loadOrigins = useCallback(async () => {
    try {
      const data = await execute(() => recipeService.getAllOrigins());
      setOrigins(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des origines:', error);
    }
  }, [execute]);

  useEffect(() => {
    loadOrigins();
  }, [loadOrigins]);

  return {
    origins,
    loading,
    error,
    loadOrigins
  };
}
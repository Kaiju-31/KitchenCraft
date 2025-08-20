import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { apiCache } from './useAPICache';
import { recipeService } from '../services/recipeService';
import { generateCacheKey } from '../utils/searchNavigation';

/**
 * Hook pour le pré-chargement prédictif basé sur le comportement utilisateur
 */
export function usePredictiveCache() {
  const location = useLocation();

  /**
   * Pré-charge les recettes populaires
   */
  const prefetchPopularRecipes = useCallback(async () => {
    try {
      const cacheKey = generateCacheKey('/api/recipes/popular', { limit: 10, fromPlans: true });
      
      // Vérifier si déjà en cache
      const cached = apiCache.get(cacheKey);
      if (cached) return;

      // Pré-charger les recettes populaires
      const popularRecipes = await recipeService.getPopularRecipes(10, true);
      apiCache.set(cacheKey, popularRecipes, 30 * 60 * 1000, true); // 30 minutes

      // Pré-charger les données de chaque recette populaire
      popularRecipes.forEach(async (recipeName: string) => {
        const searchCacheKey = generateCacheKey('/api/recipes/by-name', { name: recipeName });
        const searchCached = apiCache.get(searchCacheKey);
        
        if (!searchCached) {
          try {
            const recipes = await recipeService.searchRecipesByName(recipeName);
            apiCache.set(searchCacheKey, recipes, 10 * 60 * 1000, true); // 10 minutes
          } catch (error) {
            // Échec silencieux pour le pré-chargement
            console.warn(`Prefetch failed for recipe: ${recipeName}`, error);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to prefetch popular recipes:', error);
    }
  }, []);

  /**
   * Pré-charge les origines disponibles
   */
  const prefetchOrigins = useCallback(async () => {
    try {
      const cacheKey = '/api/recipes/origins';
      const cached = apiCache.get(cacheKey);
      if (cached) return;

      const origins = await recipeService.getAllOrigins();
      apiCache.set(cacheKey, origins, 60 * 60 * 1000, true); // 1 heure
    } catch (error) {
      console.warn('Failed to prefetch origins:', error);
    }
  }, []);

  /**
   * Pré-charge les ingrédients les plus utilisés
   */
  const prefetchCommonIngredients = useCallback(async () => {
    try {
      const cacheKey = '/api/ingredients';
      const cached = apiCache.get(cacheKey);
      if (cached) return;

      // Cette API n'existe pas encore, mais on peut l'ajouter
      // const ingredients = await ingredientService.getAllIngredients();
      // apiCache.set(cacheKey, ingredients, 30 * 60 * 1000, true); // 30 minutes
    } catch (error) {
      console.warn('Failed to prefetch ingredients:', error);
    }
  }, []);

  /**
   * Pré-charge les données liées au contexte actuel
   */
  const prefetchContextualData = useCallback(async () => {
    const currentPath = location.pathname;

    // Sur la page des recettes, pré-charger les données utiles
    if (currentPath === '/' || currentPath === '/recipes') {
      await Promise.all([
        prefetchPopularRecipes(),
        prefetchOrigins(),
        prefetchCommonIngredients()
      ]);
    }

    // Sur une page de recette spécifique, pré-charger les recettes liées
    if (currentPath.startsWith('/recipes/')) {
      const recipeId = currentPath.split('/')[2];
      if (recipeId && !isNaN(parseInt(recipeId))) {
        try {
          // Pré-charger les recettes de même type ou origine
          // Cette logique peut être affinée selon les besoins
          await prefetchPopularRecipes();
        } catch (error) {
          console.warn('Failed to prefetch related recipes:', error);
        }
      }
    }

    // Sur une page de recherche, pré-charger les recherches connexes
    if (currentPath.startsWith('/search/')) {
      await prefetchPopularRecipes();
    }
  }, [location.pathname, prefetchPopularRecipes, prefetchOrigins, prefetchCommonIngredients]);

  /**
   * Nettoie le cache expiré
   */
  const cleanExpiredCache = useCallback(() => {
    // Le nettoyage est automatique dans useAPICache, mais on peut forcer un nettoyage
    // pour libérer de la mémoire
    try {
      // Nettoyer les anciennes entrées localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('api_cache_')) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || '{}');
            if (item.timestamp && Date.now() - item.timestamp > item.ttl) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            // Supprimer les entrées corrompues
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }, []);

  /**
   * Pré-charge de façon intelligente en fonction de l'heure
   */
  const smartPrefetch = useCallback(async () => {
    const now = new Date();
    const hour = now.getHours();

    // Pré-charger plus agressivement pendant les heures de repas
    if ((hour >= 11 && hour <= 13) || (hour >= 18 && hour <= 20)) {
      await prefetchPopularRecipes();
    }

    // Nettoyage quotidien
    if (hour === 3) { // 3h du matin, faible activité
      cleanExpiredCache();
    }
  }, [prefetchPopularRecipes, cleanExpiredCache]);

  // Démarrer le pré-chargement contextuel
  useEffect(() => {
    const timer = setTimeout(() => {
      prefetchContextualData();
    }, 1000); // Délai pour ne pas bloquer le rendu initial

    return () => clearTimeout(timer);
  }, [prefetchContextualData]);

  // Pré-chargement intelligent basé sur l'heure
  useEffect(() => {
    const timer = setTimeout(() => {
      smartPrefetch();
    }, 2000); // Délai plus long pour le pré-chargement intelligent

    return () => clearTimeout(timer);
  }, [smartPrefetch]);

  return {
    prefetchPopularRecipes,
    prefetchOrigins,
    prefetchContextualData,
    cleanExpiredCache
  };
}
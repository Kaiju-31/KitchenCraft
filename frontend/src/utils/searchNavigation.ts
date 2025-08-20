/**
 * Utilitaires pour naviguer vers les routes de recherche optimisées
 */

// Type pour la fonction navigate
type NavigateFunction = (to: string, options?: { replace?: boolean; state?: any }) => void;

export interface SearchNavigationOptions {
  scaledPerson?: number;
}

/**
 * Navigue vers la recherche par nom
 */
export function navigateToRecipeSearchByName(
  navigate: NavigateFunction, 
  name: string, 
  options?: SearchNavigationOptions
) {
  const encodedName = encodeURIComponent(name.trim());
  let url = `/search/recipes/name/${encodedName}`;
  
  // Ajouter les paramètres de requête
  const params = new URLSearchParams();
  if (options?.scaledPerson) {
    params.append('scaled', options.scaledPerson.toString());
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  navigate(url);
}

/**
 * Navigue vers la recherche par ingrédients
 */
export function navigateToRecipeSearchByIngredients(
  navigate: NavigateFunction, 
  ingredients: string[], 
  options?: SearchNavigationOptions
) {
  if (ingredients.length === 0) return;
  
  // Normaliser et encoder les ingrédients
  const normalizedIngredients = ingredients
    .map(ing => ing.trim())
    .filter(ing => ing.length > 0)
    .sort(); // Trier pour une URL cohérente
    
  const encodedIngredients = encodeURIComponent(normalizedIngredients.join(','));
  let url = `/search/recipes/ingredients/${encodedIngredients}`;
  
  // Ajouter les paramètres de requête
  const params = new URLSearchParams();
  if (options?.scaledPerson) {
    params.append('scaled', options.scaledPerson.toString());
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  navigate(url);
}

/**
 * Navigue vers la recherche avec filtres
 */
export function navigateToRecipeFilter(
  navigate: NavigateFunction,
  filters: {
    searchTerm?: string;
    ingredients?: string[];
    minTime?: number;
    maxTime?: number;
    origins?: string[];
    isBabyFriendly?: boolean;
    scaledPerson?: number;
  }
) {
  const params = new URLSearchParams();
  
  // Ajouter chaque filtre comme paramètre
  if (filters.searchTerm?.trim()) {
    params.append('search', filters.searchTerm.trim());
  }
  
  if (filters.ingredients && filters.ingredients.length > 0) {
    // Normaliser et trier les ingrédients
    const normalizedIngredients = filters.ingredients
      .map(ing => ing.trim())
      .filter(ing => ing.length > 0)
      .sort();
    params.append('ingredients', normalizedIngredients.join(','));
  }
  
  if (filters.minTime !== undefined && filters.minTime > 0) {
    params.append('minTime', filters.minTime.toString());
  }
  
  if (filters.maxTime !== undefined && filters.maxTime > 0) {
    params.append('maxTime', filters.maxTime.toString());
  }
  
  if (filters.origins && filters.origins.length > 0) {
    const normalizedOrigins = filters.origins
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0)
      .sort();
    params.append('origins', normalizedOrigins.join(','));
  }
  
  if (filters.isBabyFriendly !== undefined) {
    params.append('babyFriendly', filters.isBabyFriendly.toString());
  }
  
  if (filters.scaledPerson && filters.scaledPerson > 0) {
    params.append('scaled', filters.scaledPerson.toString());
  }
  
  // Naviguer vers la route de filtre avec les paramètres
  if (params.toString()) {
    navigate(`/search/recipes/filter?${params.toString()}`);
  } else {
    // Si aucun filtre, rediriger vers la page principale
    navigate('/recipes');
  }
}

/**
 * Génère une clé de cache normalisée pour les recherches
 */
export function generateCacheKey(endpoint: string, params: Record<string, any>): string {
  // Créer un objet avec les paramètres triés
  const sortedParams: Record<string, string> = {};
  
  Object.keys(params)
    .sort()
    .forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Trier les tableaux pour une consistance
          sortedParams[key] = [...value].sort().join(',');
        } else {
          sortedParams[key] = String(value);
        }
      }
    });
  
  const queryString = new URLSearchParams(sortedParams).toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
}

/**
 * Pré-charge les données pour les recherches populaires
 */
export function preloadPopularSearches(
  navigate: NavigateFunction,
  popularSearches: string[]
) {
  // Cette fonction peut être appelée pour pré-charger les recherches populaires
  // en arrière-plan pour améliorer les performances
  popularSearches.forEach(searchTerm => {
    // On peut utiliser le système de préfetch du hook useAPICache
    // pour charger ces données en arrière-plan
    const encodedName = encodeURIComponent(searchTerm.trim());
    const cacheKey = `/api/recipes/by-name?name=${encodedName}`;
    
    // La logique de préfetch sera implémentée dans le hook useAPICache
    console.log(`Préparation du préfetch pour: ${cacheKey}`);
  });
}
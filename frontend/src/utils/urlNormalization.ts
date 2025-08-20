/**
 * Utilitaires pour la normalisation des URLs et l'optimisation du cache
 */

/**
 * Normalise une URL de recherche pour maximiser les cache hits
 */
export function normalizeSearchUrl(url: string): string {
  try {
    const urlObj = new URL(url, window.location.origin);
    
    // Extraire et trier les paramètres de requête
    const params = new URLSearchParams();
    const sortedKeys = Array.from(urlObj.searchParams.keys()).sort();
    
    sortedKeys.forEach(key => {
      const values = urlObj.searchParams.getAll(key);
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
                params.append(key, items.join(','));
              }
              break;
            case 'name':
            case 'search':
              // Nettoyer et normaliser les termes de recherche
              const cleanName = value
                .toLowerCase()
                .trim()
                .replace(/\s+/g, ' '); // Normaliser les espaces
              if (cleanName) {
                params.append(key, cleanName);
              }
              break;
            case 'minTime':
            case 'maxTime':
            case 'scaled':
              // Valeurs numériques
              const numValue = parseInt(value);
              if (!isNaN(numValue) && numValue > 0) {
                params.append(key, numValue.toString());
              }
              break;
            case 'babyFriendly':
              // Valeur booléenne
              if (value === 'true' || value === 'false') {
                params.append(key, value);
              }
              break;
            default:
              // Autres paramètres, les ajouter tels quels s'ils ne sont pas vides
              if (value) {
                params.append(key, value);
              }
          }
        }
      } else if (values.length > 1) {
        // Plusieurs valeurs pour la même clé, les trier
        const sortedValues = values
          .map(v => v.trim())
          .filter(v => v.length > 0)
          .sort();
        sortedValues.forEach(value => {
          if (value) {
            params.append(key, value);
          }
        });
      }
    });
    
    // Reconstruire l'URL
    const normalizedUrl = urlObj.pathname + (params.toString() ? '?' + params.toString() : '');
    return normalizedUrl;
  } catch (error) {
    console.warn('URL normalization failed:', error);
    return url;
  }
}

/**
 * Génère une clé de cache optimisée pour les API calls
 */
export function generateOptimizedCacheKey(endpoint: string, params: Record<string, any>): string {
  // Créer un objet avec les paramètres nettoyés et triés
  const cleanParams: Record<string, string> = {};
  
  Object.keys(params)
    .sort()
    .forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          // Trier et joindre les tableaux
          const cleanArray = value
            .map(item => String(item).trim())
            .filter(item => item.length > 0)
            .sort();
          if (cleanArray.length > 0) {
            cleanParams[key] = cleanArray.join(',');
          }
        } else if (typeof value === 'string') {
          const cleanValue = value.trim();
          if (cleanValue) {
            // Traitement spécial selon le type de paramètre
            switch (key) {
              case 'name':
              case 'search':
                cleanParams[key] = cleanValue.toLowerCase().replace(/\s+/g, ' ');
                break;
              case 'ingredients':
              case 'origins':
                // Si c'est une chaîne avec des virgules, la trier
                const items = cleanValue.split(',')
                  .map(item => item.trim())
                  .filter(item => item.length > 0)
                  .sort();
                if (items.length > 0) {
                  cleanParams[key] = items.join(',');
                }
                break;
              default:
                cleanParams[key] = cleanValue;
            }
          }
        } else {
          cleanParams[key] = String(value);
        }
      }
    });
  
  // Construire la clé de cache
  const queryString = new URLSearchParams(cleanParams).toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
}

/**
 * Compare deux URLs pour déterminer si elles sont équivalentes pour le cache
 */
export function areUrlsEquivalentForCache(url1: string, url2: string): boolean {
  const normalized1 = normalizeSearchUrl(url1);
  const normalized2 = normalizeSearchUrl(url2);
  return normalized1 === normalized2;
}

/**
 * Extrait les mots-clés d'une URL pour la recherche prédictive
 */
export function extractKeywordsFromUrl(url: string): string[] {
  try {
    const urlObj = new URL(url, window.location.origin);
    const keywords: string[] = [];
    
    // Extraire les mots-clés des paramètres
    urlObj.searchParams.forEach((value, key) => {
      switch (key) {
        case 'name':
        case 'search':
          // Diviser les termes de recherche
          const searchTerms = value.toLowerCase()
            .split(/\s+/)
            .filter(term => term.length > 2); // Ignorer les mots très courts
          keywords.push(...searchTerms);
          break;
        case 'ingredients':
        case 'origins':
          // Diviser les listes
          const items = value.split(',')
            .map(item => item.trim().toLowerCase())
            .filter(item => item.length > 2);
          keywords.push(...items);
          break;
      }
    });
    
    // Extraire les mots-clés du chemin
    const pathSegments = urlObj.pathname.split('/')
      .filter(segment => segment.length > 0 && segment !== 'search' && segment !== 'recipes');
    
    pathSegments.forEach(segment => {
      try {
        const decoded = decodeURIComponent(segment).toLowerCase();
        if (decoded.length > 2) {
          keywords.push(decoded);
        }
      } catch (error) {
        // Ignorer les segments qui ne peuvent pas être décodés
      }
    });
    
    // Retourner les mots-clés uniques
    return [...new Set(keywords)];
  } catch (error) {
    console.warn('Keyword extraction failed:', error);
    return [];
  }
}

/**
 * Génère des URLs de pré-chargement basées sur les mots-clés actuels
 */
export function generatePrefetchUrls(currentUrl: string, popularTerms: string[]): string[] {
  const keywords = extractKeywordsFromUrl(currentUrl);
  const prefetchUrls: string[] = [];
  
  // Générer des combinaisons avec les termes populaires
  keywords.forEach(keyword => {
    popularTerms.forEach(popularTerm => {
      if (keyword !== popularTerm.toLowerCase()) {
        // Recherche combinée
        const combinedSearch = `${keyword} ${popularTerm}`;
        prefetchUrls.push(`/search/recipes/name/${encodeURIComponent(combinedSearch)}`);
        
        // Recherche par ingrédient si le terme populaire semble être un ingrédient
        if (isLikelyIngredient(popularTerm)) {
          prefetchUrls.push(`/search/recipes/ingredients/${encodeURIComponent(popularTerm)}`);
        }
      }
    });
  });
  
  // Limiter le nombre d'URLs de pré-chargement
  return prefetchUrls.slice(0, 5);
}

/**
 * Détermine si un terme est probablement un ingrédient
 */
function isLikelyIngredient(term: string): boolean {
  const ingredientKeywords = [
    'tomate', 'carotte', 'oignon', 'ail', 'pomme', 'poire', 'salade', 'épinard',
    'poulet', 'bœuf', 'porc', 'poisson', 'saumon', 'thon', 'crevette',
    'riz', 'pâtes', 'quinoa', 'avoine', 'blé', 'farine',
    'lait', 'fromage', 'yaourt', 'crème', 'beurre', 'œuf',
    'huile', 'vinaigre', 'sel', 'poivre', 'herbe', 'épice'
  ];
  
  const lowerTerm = term.toLowerCase();
  return ingredientKeywords.some(keyword => 
    lowerTerm.includes(keyword) || keyword.includes(lowerTerm)
  );
}
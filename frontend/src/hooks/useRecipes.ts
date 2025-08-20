import { useState, useEffect, useCallback } from 'react';
import type { Recipe, RecipeRequest, RecipeFilters } from '../types';
import { recipeService } from '../services/recipeService';
import { useApi } from './useApi';

const initialFilters: RecipeFilters = {
  searchTerm: '',
  selectedIngredients: [],
  scaledPerson: 4,
  selectedOrigins: [],
  minTime: undefined,
  maxTime: undefined,
  isBabyFriendly: undefined
};

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filters, setFilters] = useState<RecipeFilters>(initialFilters);

  const {
    loading: loadingList,
    error: listError,
    execute: executeList
  } = useApi<Recipe[]>();

  const {
    loading: loadingAction,
    error: actionError,
    execute: executeAction
  } = useApi<Recipe>();

  const {
    loading: loadingSingle,
    error: singleError,
    execute: executeSingle
  } = useApi<Recipe>();

  // Charger les recettes
  const loadRecipes = useCallback(async (scaledPerson?: number) => {
    try {
      const data = await executeList(() => recipeService.getAllRecipes(scaledPerson));
      const sortedData = (data || []).sort((a, b) => a.name.localeCompare(b.name));
      setRecipes(sortedData);
    } catch (error) {
      console.error('Erreur lors du chargement des recettes:', error);
    }
  }, [executeList]);

  // Récupérer une recette par ID
  const getRecipeById = useCallback(async (id: number, scaledPerson?: number) => {
    try {
      return await executeSingle(() => recipeService.getRecipeById(id, scaledPerson));
    } catch (error) {
      console.error('Erreur lors du chargement de la recette:', error);
      throw error;
    }
  }, [executeSingle]);

  // Rechercher des recettes par nom
  const searchRecipesByName = useCallback(async (name: string, scaledPerson?: number) => {
    try {
      const data = await executeList(() => recipeService.searchRecipesByName(name, scaledPerson));
      const sortedData = (data || []).sort((a, b) => a.name.localeCompare(b.name));
      setRecipes(sortedData);
    } catch (error: any) {
      // Si c'est une 404, ce n'est pas une erreur, juste aucun résultat
      if (error?.status === 404) {
        setRecipes([]);
      } else {
        console.error('Erreur lors de la recherche de recettes:', error);
      }
    }
  }, [executeList]);

  // Rechercher des recettes par ingrédients
  const searchRecipesByIngredients = useCallback(async (ingredients: string[], scaledPerson?: number) => {
    try {
      const ingredientsString = ingredients.join(',');
      const data = await executeList(() => recipeService.searchRecipesByIngredients(ingredientsString, scaledPerson));
      const sortedData = (data || []).sort((a, b) => a.name.localeCompare(b.name));
      setRecipes(sortedData);
    } catch (error: any) {
      // Si c'est une 404, ce n'est pas une erreur, juste aucun résultat
      if (error?.status === 404) {
        setRecipes([]);
      } else {
        console.error('Erreur lors de la recherche de recettes par ingrédients:', error);
      }
    }
  }, [executeList]);

  // Créer une recette
  const createRecipe = useCallback(async (data: RecipeRequest) => {
    try {
      const newRecipe = await executeAction(() => recipeService.createRecipe(data));
      if (newRecipe) {
        setRecipes(prev => [...prev, newRecipe].sort((a, b) => a.name.localeCompare(b.name)));
        return newRecipe;
      }
    } catch (error) {
      console.error('Erreur lors de la création de la recette:', error);
      throw error;
    }
  }, [executeAction]);

  // Modifier une recette
  const updateRecipe = useCallback(async (id: number, data: RecipeRequest) => {
    try {
      const updatedRecipe = await executeAction(() => recipeService.updateRecipe(id, data));
      if (updatedRecipe) {
        setRecipes(prev => prev.map(recipe => recipe.id === id ? updatedRecipe : recipe).sort((a, b) => a.name.localeCompare(b.name)));
        return updatedRecipe;
      }
    } catch (error) {
      console.error('Erreur lors de la modification de la recette:', error);
      throw error;
    }
  }, [executeAction]);

  // Supprimer une recette
  const deleteRecipe = useCallback(async (id: number) => {
    try {
      await executeAction(() => recipeService.deleteRecipe(id));
      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la recette:', error);
      throw error;
    }
  }, [executeAction]);

  // Recherche d'autocomplétion
  const searchRecipeAutocomplete = useCallback(async (query: string, limit?: number) => {
    try {
      return await recipeService.getAutocomplete(query, limit);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'autocomplétion de recettes:', error);
      return [];
    }
  }, []);

  // Recherche avec filtres avancés
  const filterRecipes = useCallback(async () => {
    try {
      const data = await executeList(() => recipeService.filterRecipes(
        filters.searchTerm,
        filters.selectedIngredients,
        filters.minTime,
        filters.maxTime,
        filters.selectedOrigins,
        filters.isBabyFriendly,
        filters.scaledPerson
      ));
      const sortedData = (data || []).sort((a, b) => a.name.localeCompare(b.name));
      setRecipes(sortedData);
    } catch (error: any) {
      if (error?.status === 404) {
        setRecipes([]);
      } else {
        console.error('Erreur lors du filtrage des recettes:', error);
      }
    }
  }, [filters, executeList]);

  // Recherche générale (utilise les filtres actuels)
  const searchRecipes = useCallback(async () => {
    // Si on a des filtres avancés (temps, origines ou bébé), utiliser filterRecipes
    if (filters.minTime || filters.maxTime || filters.selectedOrigins.length > 0 || filters.isBabyFriendly !== undefined) {
      await filterRecipes();
    } else if (filters.selectedIngredients.length > 0) {
      await searchRecipesByIngredients(filters.selectedIngredients, filters.scaledPerson);
    } else if (filters.searchTerm.trim()) {
      await searchRecipesByName(filters.searchTerm.trim(), filters.scaledPerson);
    } else {
      await loadRecipes(filters.scaledPerson);
    }
  }, [filters, filterRecipes, searchRecipesByIngredients, searchRecipesByName, loadRecipes]);

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = useCallback(() => {
    return (
      filters.searchTerm.trim() !== '' ||
      filters.selectedIngredients.length > 0 ||
      filters.minTime !== undefined ||
      filters.maxTime !== undefined ||
      filters.selectedOrigins.length > 0 ||
      filters.isBabyFriendly !== undefined
    );
  }, [filters]);

  // Charger toutes les recettes (état par défaut)
  const loadAllRecipes = useCallback(async () => {
    await loadRecipes();
  }, [loadRecipes]);

  // Charger les données au montage
  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const loading = loadingList || loadingAction || loadingSingle;
  const error = listError || actionError || singleError;

  return {
    recipes,
    filters,
    setFilters,
    loading,
    error,
    loadRecipes,
    loadAllRecipes,
    getRecipeById,
    searchRecipes,
    searchRecipesByName,
    searchRecipesByIngredients,
    searchRecipeAutocomplete,
    filterRecipes,
    resetFilters,
    hasActiveFilters,
    createRecipe,
    updateRecipe,
    deleteRecipe
  };
}
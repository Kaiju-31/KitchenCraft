import { useState, useEffect, useCallback } from 'react';
import type { Ingredient, IngredientRequest, IngredientFilters } from '../types';
import { ingredientService } from '../services/ingredientService';
import { useApi } from './useApi';

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [filters, setFilters] = useState<IngredientFilters>({
    searchTerm: '',
    selectedCategories: []
  });

  const {
    loading: loadingList,
    error: listError,
    execute: executeList
  } = useApi<Ingredient[]>();

  const {
    loading: loadingAction,
    error: actionError,
    execute: executeAction
  } = useApi<Ingredient>();

  // Charger les ingrédients
  const loadIngredients = useCallback(async () => {
    try {
      const data = await executeList(() => ingredientService.getAllIngredients());
      const sortedData = (data || []).sort((a, b) => a.name.localeCompare(b.name));
      setIngredients(sortedData);
    } catch (error) {
      console.error('Erreur lors du chargement des ingrédients:', error);
    }
  }, [executeList]);

  // Créer un ingrédient
  const createIngredient = useCallback(async (data: IngredientRequest) => {
    try {
      const newIngredient = await executeAction(() => ingredientService.createIngredient(data));
      if (newIngredient) {
        setIngredients(prev => [...prev, newIngredient].sort((a, b) => a.name.localeCompare(b.name)));
        return newIngredient;
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'ingrédient:', error);
      throw error;
    }
  }, [executeAction]);

  // Modifier un ingrédient
  const updateIngredient = useCallback(async (id: number, data: IngredientRequest) => {
    try {
      const updatedIngredient = await executeAction(() => ingredientService.updateIngredient(id, data));
      if (updatedIngredient) {
        setIngredients(prev => prev.map(ing => ing.id === id ? updatedIngredient : ing).sort((a, b) => a.name.localeCompare(b.name)));
        return updatedIngredient;
      }
    } catch (error) {
      console.error('Erreur lors de la modification de l\'ingrédient:', error);
      throw error;
    }
  }, [executeAction]);

  // Supprimer un ingrédient
  const deleteIngredient = useCallback(async (id: number) => {
    try {
      await executeAction(() => ingredientService.deleteIngredient(id));
      setIngredients(prev => prev.filter(ing => ing.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'ingrédient:', error);
      throw error;
    }
  }, [executeAction]);

  // Recherche d'autocomplétion
  const searchIngredients = useCallback(async (query: string, limit?: number) => {
    try {
      return await ingredientService.getAutocomplete(query, limit);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'ingrédients:', error);
      return [];
    }
  }, []);

  // Filtrer les ingrédients
  useEffect(() => {
    let filtered = ingredients;

    // Filtrage par recherche
    if (filters.searchTerm) {
      filtered = filtered.filter(ingredient =>
        ingredient.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Filtrage par catégories sélectionnées
    if (filters.selectedCategories.length > 0 && !filters.selectedCategories.includes('Tous')) {
      filtered = filtered.filter(ingredient =>
        filters.selectedCategories.includes(ingredient.category)
      );
    }

    // Maintenir l'ordre alphabétique après filtrage
    filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredIngredients(filtered);
  }, [ingredients, filters]);

  // Charger les données au montage
  useEffect(() => {
    loadIngredients();
  }, [loadIngredients]);

  return {
    ingredients,
    filteredIngredients,
    filters,
    setFilters,
    loading: loadingList || loadingAction,
    error: listError || actionError,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    loadIngredients,
    searchIngredients
  };
}
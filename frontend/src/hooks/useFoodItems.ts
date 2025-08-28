import { useState, useEffect } from 'react';
import type { FoodItem, LoadingState } from '../types';
import { foodItemService } from '../services/foodItemService';

export interface FoodItemFilters {
  searchTerm: string;
  selectedBasicCategory: string;
}

export const useFoodItems = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filteredFoodItems, setFilteredFoodItems] = useState<FoodItem[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null
  });
  const [filters, setFilters] = useState<FoodItemFilters>({
    searchTerm: '',
    selectedBasicCategory: 'Tous'
  });

  const loadAllFoodItems = async () => {
    setLoadingState({ isLoading: true, error: null });
    try {
      const data = await foodItemService.getAllFoodItems();
      setFoodItems(data);
      setLoadingState({ isLoading: false, error: null });
    } catch (error) {
      console.error('Erreur lors du chargement des articles alimentaires:', error);
      setLoadingState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  const searchByBarcode = async (barcode: string): Promise<FoodItem | null> => {
    return await foodItemService.searchByBarcode(barcode);
  };

  const createFoodItem = async (foodItem: Partial<FoodItem>): Promise<FoodItem> => {
    const newFoodItem = await foodItemService.createFoodItem(foodItem);
    setFoodItems(prev => [...prev, newFoodItem]);
    return newFoodItem;
  };

  const updateFoodItem = async (id: number, foodItem: Partial<FoodItem>): Promise<FoodItem> => {
    const updatedFoodItem = await foodItemService.updateFoodItem(id, foodItem);
    setFoodItems(prev => prev.map(item => 
      item.id === id ? updatedFoodItem : item
    ));
    return updatedFoodItem;
  };

  const deleteFoodItem = async (id: number): Promise<void> => {
    await foodItemService.deleteFoodItem(id);
    setFoodItems(prev => prev.filter(item => item.id !== id));
  };

  const syncWithOpenFoodFacts = async (id: number): Promise<FoodItem> => {
    const syncedFoodItem = await foodItemService.syncWithOpenFoodFacts(id);
    setFoodItems(prev => prev.map(item => 
      item.id === id ? syncedFoodItem : item
    ));
    return syncedFoodItem;
  };

  // Filtrage automatique
  useEffect(() => {
    let filtered = foodItems;

    // Filtre par terme de recherche
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
        (item.barcode && item.barcode.includes(filters.searchTerm.trim()))
      );
    }

    // Filtre par catégorie
    if (filters.selectedBasicCategory !== 'Tous') {
      filtered = filtered.filter(item => 
        item.basicCategory === filters.selectedBasicCategory
      );
    }

    setFilteredFoodItems(filtered);
  }, [foodItems, filters]);

  useEffect(() => {
    loadAllFoodItems();
  }, []);

  return {
    foodItems: filteredFoodItems,
    loadingState,
    filters,
    setFilters,
    loadAllFoodItems,
    searchByBarcode,
    createFoodItem,
    updateFoodItem,
    deleteFoodItem,
    syncWithOpenFoodFacts
  };
};
import { useState, useEffect } from 'react';
import type {
    WeeklyPlan,
    WeeklyPlanRequest,
    PlanRecipe,
    PlanRecipeRequest,
    ShoppingListItem,
    ShoppingListItemRequest,
    LoadingState
} from '../types';
import * as planService from '../services/planService';

export const usePlans = () => {
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });

  const fetchPlans = async () => {
    setLoadingState({ isLoading: true, error: null });
    try {
      const data = await planService.getAllPlans();
      setPlans(data);
    } catch (error) {
      setLoadingState({ isLoading: false, error: error instanceof Error ? error.message : 'Erreur inconnue' });
    } finally {
      setLoadingState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const createPlan = async (plan: WeeklyPlanRequest): Promise<WeeklyPlan> => {
    const created = await planService.createPlan(plan);
    setPlans(prev => [created, ...prev]);
    return created;
  };

  const updatePlan = async (id: number, plan: WeeklyPlanRequest): Promise<WeeklyPlan> => {
    const updated = await planService.updatePlan(id, plan);
    setPlans(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const deletePlan = async (id: number): Promise<void> => {
    await planService.deletePlan(id);
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  const copyPlan = async (id: number, newStartDate: string): Promise<WeeklyPlan> => {
    const copied = await planService.copyPlan(id, newStartDate);
    setPlans(prev => [copied, ...prev]);
    return copied;
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    loadingState,
    createPlan,
    updatePlan,
    deletePlan,
    copyPlan,
    refetch: fetchPlans,
  };
};

export const usePlanRecipes = (planId: number | null) => {
  const [planRecipes, setPlanRecipes] = useState<PlanRecipe[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });

  const fetchPlanRecipes = async () => {
    if (!planId) return;
    
    setLoadingState({ isLoading: true, error: null });
    try {
      const data = await planService.getPlanRecipes(planId);
      setPlanRecipes(data);
    } catch (error) {
      setLoadingState({ isLoading: false, error: error instanceof Error ? error.message : 'Erreur inconnue' });
    } finally {
      setLoadingState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const addRecipeToPlan = async (recipe: PlanRecipeRequest): Promise<PlanRecipe> => {
    if (!planId) throw new Error('Plan ID requis');
    
    const added = await planService.addRecipeToPlan(planId, recipe);
    setPlanRecipes(prev => [...prev, added]);
    return added;
  };

  const removeRecipeFromPlan = async (planRecipeId: number): Promise<void> => {
    await planService.removeRecipeFromPlan(planRecipeId);
    setPlanRecipes(prev => prev.filter(pr => pr.id !== planRecipeId));
  };

  useEffect(() => {
    fetchPlanRecipes();
  }, [planId]);

  return {
    planRecipes,
    loadingState,
    addRecipeToPlan,
    removeRecipeFromPlan,
    refetch: fetchPlanRecipes,
  };
};

export const useShoppingList = (planId: number | null) => {
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });

  const fetchShoppingList = async () => {
    if (!planId) return;
    
    setLoadingState({ isLoading: true, error: null });
    try {
      const data = await planService.getShoppingList(planId);
      setShoppingList(data);
    } catch (error) {
      setLoadingState({ isLoading: false, error: error instanceof Error ? error.message : 'Erreur inconnue' });
    } finally {
      setLoadingState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const generateShoppingList = async (): Promise<void> => {
    if (!planId) return;
    
    const data = await planService.generateShoppingList(planId);
    setShoppingList(data);
  };

  const updateShoppingListItem = async (
    itemId: number, 
    update: ShoppingListItemRequest
  ): Promise<void> => {
    const updated = await planService.updateShoppingListItem(itemId, update);
    setShoppingList(prev => prev.map(item => item.id === itemId ? updated : item));
  };

  useEffect(() => {
    fetchShoppingList();
  }, [planId]);

  return {
    shoppingList,
    loadingState,
    generateShoppingList,
    updateShoppingListItem,
    refetch: fetchShoppingList,
  };
};
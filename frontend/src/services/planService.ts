import type {
    WeeklyPlan,
    WeeklyPlanRequest,
    PlanRecipe,
    PlanRecipeRequest,
    ShoppingListItem,
    ShoppingListItemRequest
} from '../types';

const API_BASE_URL = '/api/plans';

// Plans
export const getAllPlans = async (): Promise<WeeklyPlan[]> => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des plannings');
  }
  return response.json();
};

export const getPlanById = async (id: number): Promise<WeeklyPlan> => {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération du planning ${id}`);
  }
  return response.json();
};

export const createPlan = async (plan: WeeklyPlanRequest): Promise<WeeklyPlan> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(plan),
  });
  if (!response.ok) {
    throw new Error('Erreur lors de la création du planning');
  }
  return response.json();
};

export const updatePlan = async (id: number, plan: WeeklyPlanRequest): Promise<WeeklyPlan> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(plan),
  });
  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour du planning');
  }
  return response.json();
};

export const deletePlan = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Erreur lors de la suppression du planning');
  }
};

export const copyPlan = async (id: number, newStartDate: string): Promise<WeeklyPlan> => {
  const response = await fetch(`${API_BASE_URL}/${id}/copy?newStartDate=${newStartDate}`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Erreur lors de la copie du planning');
  }
  return response.json();
};

// Recettes du planning
export const addRecipeToPlan = async (planId: number, recipe: PlanRecipeRequest): Promise<PlanRecipe> => {
  const response = await fetch(`${API_BASE_URL}/${planId}/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(recipe),
  });
  if (!response.ok) {
    throw new Error('Erreur lors de l\'ajout de la recette au planning');
  }
  return response.json();
};

export const getPlanRecipes = async (planId: number): Promise<PlanRecipe[]> => {
  const response = await fetch(`${API_BASE_URL}/${planId}/recipes`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des recettes du planning');
  }
  return response.json();
};

export const removeRecipeFromPlan = async (planRecipeId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/recipes/${planRecipeId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Erreur lors de la suppression de la recette du planning');
  }
};

// Liste de courses
export const generateShoppingList = async (planId: number): Promise<ShoppingListItem[]> => {
  const response = await fetch(`${API_BASE_URL}/${planId}/shopping-list/generate`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Erreur lors de la génération de la liste de courses');
  }
  return response.json();
};

export const getShoppingList = async (planId: number): Promise<ShoppingListItem[]> => {
  const response = await fetch(`${API_BASE_URL}/${planId}/shopping-list`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération de la liste de courses');
  }
  return response.json();
};

export const updateShoppingListItem = async (
  itemId: number, 
  update: ShoppingListItemRequest
): Promise<ShoppingListItem> => {
  const response = await fetch(`${API_BASE_URL}/shopping-list/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(update),
  });
  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour de l\'article de la liste de courses');
  }
  return response.json();
};
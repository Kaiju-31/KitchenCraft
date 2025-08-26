// Types pour les ingrédients
export interface Ingredient {
  id: number;
  name: string;
  category: string;
}

// Types pour les recettes et ingrédients de recettes
export interface RecipeIngredient {
  id: number;
  ingredient: Ingredient;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: number;
  name: string;
  type: string;
  description: string;
  origin?: string;
  preparationTime: number;
  cookingTime?: number;
  restTime?: number;
  totalTime: number;
  person: number;
  scaledPerson?: number;
  isBabyFriendly?: boolean;
  ingredients: RecipeIngredient[];
  steps: string[];
}

// Types pour les catégories
export interface Category {
  value: string;
  label: string;
  color: string;
}

// Types pour les requêtes API
export interface IngredientRequest {
  name: string;
  category: string;
}

export interface RecipeRequest {
  name: string;
  type: string;
  description: string;
  origin?: string;
  preparationTime: number;
  cookingTime?: number;
  restTime?: number;
  person: number;
  isBabyFriendly?: boolean;
  ingredients: RecipeIngredientRequest[];
  steps: string[];
}

export interface RecipeIngredientRequest {
  ingredientName: string;
  ingredientCategory: string;
  quantity: number;
  unit: string;
}

// Types pour les réponses d'erreur
export interface ApiError {
  message: string;
  status: number;
}

// Types pour les états de chargement
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Types pour les filtres
export interface IngredientFilters {
  searchTerm: string;
  selectedCategories: string[];
}

export interface RecipeFilters {
  searchTerm: string;
  selectedIngredients: string[];
  scaledPerson: number;
  minTime?: number;
  maxTime?: number;
  selectedOrigins: string[];
  isBabyFriendly?: boolean;
}

// Constantes pour les catégories d'ingrédients
export const INGREDIENT_CATEGORIES: Category[] = [
  { value: 'Tous', label: 'Tous', color: 'from-slate-500 to-slate-600' },
  { value: 'Boissons', label: 'Boissons', color: 'from-cyan-500 to-blue-600' },
  { value: 'Céréales', label: 'Céréales', color: 'from-amber-500 to-yellow-600' },
  { value: 'Condiments', label: 'Condiments', color: 'from-indigo-500 to-blue-600' },
  { value: 'Conserves', label: 'Conserves', color: 'from-slate-600 to-gray-700' },
  { value: 'Épices', label: 'Épices', color: 'from-purple-500 to-purple-600' },
  { value: 'Féculents', label: 'Féculents', color: 'from-amber-600 to-yellow-600' },
  { value: 'Fromages', label: 'Fromages', color: 'from-yellow-500 to-orange-500' },
  { value: 'Fruits', label: 'Fruits', color: 'from-red-500 to-pink-600' },
  { value: 'Herbes', label: 'Herbes', color: 'from-green-600 to-lime-600' },
  { value: 'Légumes', label: 'Légumes', color: 'from-green-500 to-emerald-600' },
  { value: 'Légumineuses', label: 'Légumineuses', color: 'from-emerald-600 to-green-700' },
  { value: 'Matières grasses', label: 'Mat. grasses', color: 'from-yellow-600 to-amber-600' },
  { value: 'Noix et graines', label: 'Noix et graines', color: 'from-orange-600 to-amber-700' },
  { value: 'Œufs', label: 'Œufs', color: 'from-yellow-400 to-orange-500' },
  { value: 'Pain et pâtisserie', label: 'Pain et pâtisserie', color: 'from-amber-500 to-orange-600' },
  { value: 'Poissons', label: 'Poissons', color: 'from-blue-500 to-cyan-600' },
  { value: 'Produits laitiers', label: 'Produits laitiers', color: 'from-sky-400 to-blue-500' },
  { value: 'Protéines', label: 'Protéines', color: 'from-orange-500 to-amber-600' },
  { value: 'Sucreries', label: 'Sucreries', color: 'from-pink-500 to-rose-600' },
  { value: 'Surgelés', label: 'Surgelés', color: 'from-cyan-400 to-sky-500' },
  { value: 'Viandes', label: 'Viandes', color: 'from-red-600 to-red-700' }
];

// Constantes pour les types de recettes
export const RECIPE_TYPES: Category[] = [
  { value: 'Entrée', label: 'Entrée', color: 'from-emerald-500 to-teal-600' },
  { value: 'Plat principal', label: 'Plat principal', color: 'from-orange-500 to-red-600' },
  { value: 'Dessert', label: 'Dessert', color: 'from-pink-500 to-purple-600' },
  { value: 'Collation', label: 'Collation', color: 'from-yellow-500 to-orange-600' }
];

// Types pour les modes d'affichage
export type ViewMode = 'grid' | 'list';
export type RecipeView = 'list' | 'detail' | 'create' | 'edit';

// Types pour le planning hebdomadaire
export interface PlanRecipe {
  id: number;
  weeklyPlanId: number;
  recipe: Recipe;
  plannedDate: string;
  mealType?: string;
  scaledPerson?: number;
  addedDate: string;
}

export interface PlanRecipeRequest {
  recipeId: number;
  plannedDate: string;
  mealType?: string;
  scaledPerson?: number;
}

export interface WeeklyPlan {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  durationWeeks: number;
  description?: string;
  createdDate: string;
  planRecipes?: PlanRecipe[];
  totalRecipes: number;
}

export interface WeeklyPlanRequest {
  name: string;
  startDate: string;
  durationWeeks: number;
  description?: string;
}

export interface ShoppingListItem {
  id: number;
  weeklyPlanId: number;
  ingredient: Ingredient;
  quantityNeeded: number;
  quantityOwned: number;
  quantityToBuy: number;
  unit: string;
  isChecked: boolean;
  isValidated: boolean;
}

export interface ShoppingListItemRequest {
  quantityOwned: number;
  isChecked: boolean;
  isValidated: boolean;
}

// Types pour l'affichage organisé par catégories
export interface ShoppingListByCategory {
  category: string;
  items: ShoppingListItem[];
  totalItems: number;
  checkedItems: number;
}


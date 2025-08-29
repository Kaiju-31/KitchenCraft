// Types pour les ingrédients
export interface Ingredient {
  id: number;
  name: string;
  category: string;
}

// Types pour les articles alimentaires avec données nutritionnelles
export interface FoodItem {
  id: number;
  name: string;
  brand?: string;
  barcode?: string;
  category: string;
  basicCategory: string;
  openFoodFactsId?: string;
  dataSource: 'MANUAL' | 'OPENFOODFACTS';
  lastSync?: string;
  createdAt: string;
  updatedAt?: string;
  
  // Macronutriments (pour 100g, nullable)
  energy?: number; // kJ
  energyKcal?: number; // kcal
  carbohydrates?: number; // g
  sugars?: number; // g
  fiber?: number; // g
  fat?: number; // g
  saturatedFat?: number; // g
  monounsaturatedFat?: number; // g
  polyunsaturatedFat?: number; // g
  transFat?: number; // g
  protein?: number; // g
  salt?: number; // g
  sodium?: number; // mg
  alcohol?: number; // g
  
  // Vitamines (nullable)
  vitaminA?: number; // µg
  vitaminB1?: number; // mg
  vitaminB2?: number; // mg
  vitaminB3?: number; // mg
  vitaminB5?: number; // mg
  vitaminB6?: number; // mg
  vitaminB7?: number; // µg
  vitaminB9?: number; // µg
  vitaminB12?: number; // µg
  vitaminC?: number; // mg
  vitaminD?: number; // µg
  vitaminE?: number; // mg
  vitaminK?: number; // µg
  
  // Minéraux (nullable)
  calcium?: number; // mg
  iron?: number; // mg
  magnesium?: number; // mg
  phosphorus?: number; // mg
  potassium?: number; // mg
  zinc?: number; // mg
  copper?: number; // mg
  manganese?: number; // mg
  selenium?: number; // µg
  iodine?: number; // µg
  chromium?: number; // µg
  molybdenum?: number; // µg
  fluoride?: number; // mg
}

// Types pour les utilisateurs avec mode avancé
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  advancedMode: boolean;
  enabled: boolean;
  createdAt: string;
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

// Constantes pour les catégories d'ingrédients - 7 catégories de base
export const BASIC_INGREDIENT_CATEGORIES: Category[] = [
  { value: 'Tous', label: 'Tous', color: 'from-slate-500 to-slate-600' },
  { value: 'Fruits et Légumes', label: 'Fruits et Légumes', color: 'from-green-500 to-emerald-600' },
  { value: 'Féculents', label: 'Féculents', color: 'from-amber-500 to-yellow-600' },
  { value: 'Légumineuses', label: 'Légumineuses', color: 'from-red-500 to-pink-600' },
  { value: 'Viandes, Poissons, Oeufs', label: 'Viandes, Poissons, Oeufs', color: 'from-orange-500 to-amber-600' },
  { value: 'Produits laitiers', label: 'Produits laitiers', color: 'from-sky-400 to-blue-500' },
  { value: 'Matières grasses', label: 'Matières grasses', color: 'from-yellow-600 to-amber-600' },
  { value: 'Produits sucrés', label: 'Produits sucrés', color: 'from-pink-500 to-rose-600' },
  { value: 'Autres', label: 'Autres', color: 'from-purple-500 to-purple-600' }
];

// Alias pour compatibilité - utilise les catégories de base
export const INGREDIENT_CATEGORIES = BASIC_INGREDIENT_CATEGORIES;

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

// Constantes pour les types de repas avec couleurs pastels
export const MEAL_TYPES: Category[] = [
  { value: '', label: 'Non spécifié', color: 'from-slate-100 to-slate-200' },
  { value: 'Petit-déjeuner', label: 'Petit-déjeuner', color: 'from-amber-100 to-yellow-200' },
  { value: 'Déjeuner', label: 'Déjeuner', color: 'from-blue-100 to-sky-200' },
  { value: 'Dîner', label: 'Dîner', color: 'from-violet-100 to-purple-200' },
  { value: 'Collation', label: 'Collation', color: 'from-emerald-100 to-green-200' }
];


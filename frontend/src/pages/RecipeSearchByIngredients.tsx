import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, ChefHat } from 'lucide-react';
import type { Recipe, ViewMode } from '../types';
import { useAPICache } from '../hooks/useAPICache';
import { useViewMode } from '../hooks/useViewMode';
import { recipeService } from '../services/recipeService';

// Components
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import ViewModeToggle from '../components/ui/ViewModeToggle';
import RecipeCard from '../components/recipe/RecipeCard';
import ItemList from '../components/ui/ItemList';
import { formatTimeDisplay } from '../utils/timeUtils';
import { RECIPE_TYPES } from '../types';

export default function RecipeSearchByIngredients() {
  const { ingredients } = useParams<{ ingredients: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useViewMode('viewMode-recipes', 'grid');

  const scaledPerson = searchParams.get('scaled') ? parseInt(searchParams.get('scaled')!) : undefined;

  // Décoder et parser les ingrédients
  const ingredientsList = ingredients ? decodeURIComponent(ingredients).split(',') : [];

  // Utiliser le cache API pour la recherche
  const { data: recipes, loading, error, refetch } = useAPICache<Recipe[]>(
    ingredients ? `/api/recipes/by-ingredients?ingredients=${encodeURIComponent(ingredients)}${scaledPerson ? `&scaledPerson=${scaledPerson}` : ''}` : null,
    async () => {
      if (!ingredients) return [];
      return await recipeService.searchByIngredientsString(ingredients, scaledPerson);
    },
    {
      ttl: 10 * 60 * 1000, // 10 minutes pour les recherches
      useLocalStorage: true
    }
  );

  // Redirection si pas d'ingrédients dans l'URL
  useEffect(() => {
    if (!ingredients) {
      navigate('/recipes');
    }
  }, [ingredients, navigate]);

  const handleViewRecipe = (recipe: Recipe) => {
    navigate(`/recipes/${recipe.id}`);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    navigate('/recipes', { 
      state: { 
        editingRecipeId: recipe.id, 
        action: 'edit' 
      } 
    });
  };

  const handleDeleteRecipe = async (id: number) => {
    // Implémenter la suppression si nécessaire
    console.log('Delete recipe', id);
  };

  const handleAddToPlan = (recipe: Recipe) => {
    // Implémenter l'ajout au planning si nécessaire
    console.log('Add to plan', recipe);
  };

  // Helper functions pour la vue liste
  const getTypeColor = (type: string) => {
    const recipeType = RECIPE_TYPES.find(t => t.value === type);
    return recipeType?.color || 'from-gray-500 to-gray-600';
  };

  const getTypeLabel = (type: string) => {
    const recipeType = RECIPE_TYPES.find(t => t.value === type);
    const label = recipeType?.label || type;
    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  };

  // Préparer les données pour la vue liste
  const recipeItems = (recipes || []).map(recipe => {
    const description = recipe.description?.length > 45 
      ? recipe.description.substring(0, 45) + '...' 
      : recipe.description;

    return {
      id: recipe.id,
      title: recipe.name,
      icon: ChefHat,
      iconColor: getTypeColor(recipe.type),
      badge: {
        text: getTypeLabel(recipe.type),
        color: getTypeColor(recipe.type)
      },
      tags: [
        ...(recipe.isBabyFriendly ? [{
          text: 'Bébé',
          variant: 'baby' as const
        }] : []),
        ...(recipe.origin ? [{
          text: recipe.origin,
          variant: 'muted' as const
        }] : []),
        {
          text: formatTimeDisplay(recipe.totalTime),
          variant: 'muted' as const
        },
        {
          text: `${recipe.scaledPerson || recipe.person} pers.`,
          variant: 'muted' as const
        }
      ],
      subtitle: description,
      onClick: () => handleViewRecipe(recipe)
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" color="indigo" text="Recherche en cours..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState
          icon={Search}
          title="Erreur de recherche"
          description={error}
          actionLabel="Réessayer"
          onAction={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec titre et navigation */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate('/recipes')}
          variant="outline"
          size="sm"
          icon={ArrowLeft}
        >
          Retour
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Search className="w-8 h-8 text-indigo-600" />
            Recettes avec: {ingredientsList.join(', ')}
          </h1>
          <p className="text-slate-600 mt-2">
            {recipes?.length || 0} recette{(recipes?.length || 0) > 1 ? 's' : ''} trouvée{(recipes?.length || 0) > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Ingrédients recherchés */}
      <div className="flex flex-wrap gap-2">
        {ingredientsList.map((ingredient, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full text-sm font-medium"
          >
            {ingredient.trim()}
          </span>
        ))}
      </div>

      {/* Sélecteur de vue et résultats */}
      <div className="space-y-4">
        {recipes && recipes.length > 0 && (
          <div className="flex justify-end">
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        )}

        {!recipes || recipes.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Aucune recette trouvée"
            description={`Aucune recette ne contient les ingrédients: ${ingredientsList.join(', ')}`}
            actionLabel="Rechercher autre chose"
            onAction={() => navigate('/recipes')}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 xl:gap-8">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onView={handleViewRecipe}
                onEdit={handleEditRecipe}
                onDelete={handleDeleteRecipe}
                onAddToPlan={handleAddToPlan}
              />
            ))}
          </div>
        ) : (
          <ItemList items={recipeItems} />
        )}
      </div>
    </div>
  );
}
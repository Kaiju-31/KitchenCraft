import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, ArrowLeft, ChefHat } from 'lucide-react';
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

export default function RecipeFilter() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useViewMode('viewMode-recipes', 'grid');

  // Extraire les paramètres de filtre de l'URL
  const searchTerm = searchParams.get('search') || undefined;
  const ingredients = searchParams.get('ingredients')?.split(',') || undefined;
  const minTime = searchParams.get('minTime') ? parseInt(searchParams.get('minTime')!) : undefined;
  const maxTime = searchParams.get('maxTime') ? parseInt(searchParams.get('maxTime')!) : undefined;
  const origins = searchParams.get('origins')?.split(',') || undefined;
  const isBabyFriendly = searchParams.get('babyFriendly') ? searchParams.get('babyFriendly') === 'true' : undefined;
  const scaledPerson = searchParams.get('scaled') ? parseInt(searchParams.get('scaled')!) : undefined;

  // Construire la clé de cache
  const cacheKey = searchParams.toString() ? `/api/recipes/filter?${searchParams.toString()}` : null;

  // Utiliser le cache API pour la recherche
  const { data: recipes, loading, error, refetch } = useAPICache<Recipe[]>(
    cacheKey,
    async () => {
      return await recipeService.filterRecipes(
        searchTerm,
        ingredients,
        minTime,
        maxTime,
        origins,
        isBabyFriendly,
        scaledPerson
      );
    },
    {
      ttl: 10 * 60 * 1000, // 10 minutes pour les filtres
      useLocalStorage: true
    }
  );

  // Redirection si aucun filtre
  useEffect(() => {
    if (!searchParams.toString()) {
      navigate('/recipes');
    }
  }, [searchParams, navigate]);

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

  // Générer le titre des filtres actifs
  const generateFilterTitle = () => {
    const filters = [];
    if (searchTerm) filters.push(`"${searchTerm}"`);
    if (ingredients && ingredients.length > 0) filters.push(`avec ${ingredients.join(', ')}`);
    if (minTime || maxTime) {
      if (minTime && maxTime) filters.push(`${minTime}-${maxTime}min`);
      else if (minTime) filters.push(`>${minTime}min`);
      else if (maxTime) filters.push(`<${maxTime}min`);
    }
    if (origins && origins.length > 0) filters.push(origins.join(', '));
    if (isBabyFriendly !== undefined) filters.push(isBabyFriendly ? 'bébé' : 'non-bébé');
    
    return filters.length > 0 ? filters.join(' • ') : 'Filtres actifs';
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
          icon={Filter}
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
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
        >
          Retour
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Filter className="w-8 h-8 text-indigo-600" />
            Filtres: {generateFilterTitle()}
          </h1>
          <p className="text-slate-600 mt-2">
            {recipes?.length || 0} recette{(recipes?.length || 0) > 1 ? 's' : ''} trouvée{(recipes?.length || 0) > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filtres actifs */}
      <div className="space-y-2">
        {searchTerm && (
          <div className="text-sm text-slate-600">
            <span className="font-medium">Recherche:</span> "{searchTerm}"
          </div>
        )}
        {ingredients && ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-slate-600">Ingrédients:</span>
            {ingredients.map((ingredient, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-sm"
              >
                {ingredient.trim()}
              </span>
            ))}
          </div>
        )}
        {(minTime || maxTime) && (
          <div className="text-sm text-slate-600">
            <span className="font-medium">Temps:</span> 
            {minTime && maxTime ? ` ${minTime}-${maxTime} minutes` : 
             minTime ? ` minimum ${minTime} minutes` :
             maxTime ? ` maximum ${maxTime} minutes` : ''}
          </div>
        )}
        {origins && origins.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-slate-600">Origines:</span>
            {origins.map((origin, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
              >
                {origin.trim()}
              </span>
            ))}
          </div>
        )}
        {isBabyFriendly !== undefined && (
          <div className="text-sm text-slate-600">
            <span className="font-medium">Bébé:</span> {isBabyFriendly ? 'Oui' : 'Non'}
          </div>
        )}
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
            icon={Filter}
            title="Aucune recette trouvée"
            description="Aucune recette ne correspond aux filtres sélectionnés"
            actionLabel="Modifier les filtres"
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
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Search, Filter, Plus, X, ChefHat, RotateCcw, Calendar, Clock, Users, Baby } from 'lucide-react';
import type { Recipe, Ingredient, RecipeView, RecipeRequest, ViewMode } from '../types';
import { useViewMode } from '../hooks/useViewMode';
import { RECIPE_TYPES } from '../types';
import { formatTimeDisplay } from '../utils/timeUtils';
import { useRecipes } from '../hooks/useRecipes';
import { useIngredients } from '../hooks/useIngredients';
import { useOrigins } from '../hooks/useOrigins';
import { recipeService } from '../services/recipeService';
import { 
  navigateToRecipeSearchByName,
  navigateToRecipeSearchByIngredients,
  navigateToRecipeFilter
} from '../utils/searchNavigation';
import { usePredictiveCache } from '../hooks/usePredictiveCache';

// Components
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import RecipeCard from '../components/recipe/RecipeCard';
import RecipeDetail from '../components/recipe/RecipeDetail';
import RecipeForm from '../components/forms/RecipeForm';
import IngredientAutocomplete from '../components/forms/IngredientAutocomplete';
import RecipeAutocomplete from '../components/forms/RecipeAutocomplete';
import TimeRangeSlider from '../components/ui/TimeRangeSlider';
import OriginFilter from '../components/ui/OriginFilter';
import BabyFriendlyFilter from '../components/ui/BabyFriendlyFilter';
import ViewModeToggle from '../components/ui/ViewModeToggle';
import ItemList from '../components/ui/ItemList';
import AddToPlanModal from '../components/planning/AddToPlanModal';
import RecipeDetailModal from '../components/recipe/RecipeDetailModal';

export default function Recipes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const [currentView, setCurrentView] = useState<RecipeView>('list');
  const [viewMode, setViewMode] = useViewMode('viewMode-recipes', 'grid');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [modalScaledPerson, setModalScaledPerson] = useState<number>(4);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  // Utiliser filters.selectedIngredients comme source de vérité
  const [ingredientInput, setIngredientInput] = useState('');
  const [scaledPerson, setScaledPerson] = useState(4);
  // État pour la confirmation de suppression
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; recipeId: number | null; recipeName: string }>({ 
    isOpen: false, 
    recipeId: null, 
    recipeName: '' 
  });
  // État pour l'ajout au planning
  const [showAddToPlan, setShowAddToPlan] = useState(false);
  const [recipeToAddToPlan, setRecipeToAddToPlan] = useState<Recipe | null>(null);
  // État pour les recettes populaires
  const [popularRecipes, setPopularRecipes] = useState<string[]>([]);
  const [popularLoading, setPopularLoading] = useState(false);

  const {
    recipes,
    filteredRecipes,
    filters,
    setFilters,
    loading: recipesLoading,
    error: recipesError,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    getRecipeById,
    searchRecipes,
    searchRecipesByName,
    searchRecipeAutocomplete,
    filterRecipes,
    resetFilters,
    hasActiveFilters,
    loadAllRecipes
  } = useRecipes();

  const {
    ingredients,
    loadIngredients,
    loading: ingredientsLoading
  } = useIngredients();

  const {
    origins,
    loading: originsLoading
  } = useOrigins();

  // Activer le pré-chargement prédictif
  const { prefetchContextualData } = usePredictiveCache();

  const loading = recipesLoading || ingredientsLoading || originsLoading;
  const error = recipesError;


  // Charger les recettes populaires au montage
  useEffect(() => {
    const fetchPopularRecipes = async () => {
      setPopularLoading(true);
      try {
        const popular = await recipeService.getPopularRecipes(10, true);
        setPopularRecipes(popular.sort((a, b) => a.localeCompare(b)));
      } catch (error) {
        console.error('Erreur lors du chargement des recettes populaires:', error);
      } finally {
        setPopularLoading(false);
      }
    };

    fetchPopularRecipes();
  }, []);

  // Gérer les états provenant de la navigation (ex: édition depuis RecipeDetail)
  useEffect(() => {
    const state = location.state as { editingRecipeId?: number; action?: string } | null;
    if (state?.action === 'edit' && state.editingRecipeId) {
      const recipeToEdit = recipes.find(r => r.id === state.editingRecipeId);
      if (recipeToEdit) {
        setEditingRecipe(recipeToEdit);
        setCurrentView('edit');
        // Nettoyer l'état de navigation
        navigate('/recipes', { replace: true });
      }
    }
  }, [location.state, recipes, navigate]);

  // Déclencher automatiquement la recherche quand le filtre bébé change
  useEffect(() => {
    // Ne déclencher que si isBabyFriendly a une valeur (true ou false, pas undefined)
    if (filters.isBabyFriendly === true || filters.isBabyFriendly === false) {
      const executeSearch = async () => {
        try {
          await filterRecipes();
        } catch (error) {
          console.error('Erreur lors de la recherche avec filtre bébé:', error);
        }
      };
      executeSearch();
    }
  }, [filters.isBabyFriendly, filterRecipes]);

  const handleViewRecipe = useCallback(async (recipe: Recipe) => {
    try {
      // Toujours récupérer la recette avec son nombre de personnes original
      const detailedRecipe = await getRecipeById(recipe.id, recipe.person);
      if (detailedRecipe) {
        setSelectedRecipe(detailedRecipe);
        // Reset le scaling modal au nombre de personnes de la recette
        setModalScaledPerson(detailedRecipe.person);
        // Update URL for navigation support
        navigate(`/recipes/${recipe.id}`, { replace: false });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la recette:', error);
    }
  }, [getRecipeById, navigate]);

  // Gérer l'ouverture de modal via URL
  useEffect(() => {
    if (id && recipes.length > 0 && !isClosing) {
      const recipeId = parseInt(id, 10);
      // Si on a un ID dans l'URL mais pas la bonne recette sélectionnée
      if (!selectedRecipe || selectedRecipe.id !== recipeId) {
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe) {
          // Appel direct avec le nombre de personnes original de la recette
          getRecipeById(recipe.id, recipe.person).then(detailedRecipe => {
            if (detailedRecipe) {
              setSelectedRecipe(detailedRecipe);
              // Reset le scaling modal au nombre de personnes de la recette
              setModalScaledPerson(detailedRecipe.person);
            }
          }).catch(error => {
            console.error('Erreur lors de la récupération de la recette:', error);
          });
        }
      }
    }
    // Réinitialiser le flag de fermeture quand l'ID change
    if (!id && isClosing) {
      setIsClosing(false);
    }
  }, [id, recipes, selectedRecipe?.id, getRecipeById, isClosing]);

  const handlePopularRecipeSelect = (recipeName: string) => {
    // Naviguer vers la route de recherche optimisée
    navigateToRecipeSearchByName(navigate, recipeName, { scaledPerson });
  };

  const handleModalScaledPersonChange = (person: number) => {
    setModalScaledPerson(person);
    // Pas besoin de recharger la recette, le scaling se fait côté frontend
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setCurrentView('edit');
  };

  const handleDeleteRecipe = async (id: number, recipeName?: string) => {
    const recipe = recipes.find(r => r.id === id);
    setDeleteConfirm({ 
      isOpen: true, 
      recipeId: id, 
      recipeName: recipeName || recipe?.name || 'cette recette' 
    });
  };

  const confirmDeleteRecipe = async () => {
    if (!deleteConfirm.recipeId) return;

    try {
      await deleteRecipe(deleteConfirm.recipeId);
      if (selectedRecipe?.id === deleteConfirm.recipeId) {
        setCurrentView('list');
        setSelectedRecipe(null);
      }
      setDeleteConfirm({ isOpen: false, recipeId: null, recipeName: '' });
    } catch (error) {
      alert('Erreur lors de la suppression de la recette');
    }
  };

  const cancelDeleteRecipe = () => {
    setDeleteConfirm({ isOpen: false, recipeId: null, recipeName: '' });
  };

  const handleAddToPlan = (recipe: Recipe) => {
    setRecipeToAddToPlan(recipe);
    setShowAddToPlan(true);
  };

  const handleCreateRecipe = async (data: RecipeRequest) => {
    try {
      await createRecipe(data);
      setCurrentView('list');
    } catch (error) {
      alert('Erreur lors de la création de la recette');
      throw error;
    }
  };

  const handleUpdateRecipe = async (data: RecipeRequest) => {
    if (!editingRecipe) return;
    
    try {
      await updateRecipe(editingRecipe.id, data);
      setCurrentView('list');
      setEditingRecipe(null);
    } catch (error) {
      alert('Erreur lors de la modification de la recette');
      throw error;
    }
  };

  const handleIngredientAdd = async (ingredient: Ingredient) => {
    if (!filters.selectedIngredients.includes(ingredient.name)) {
      const newSelected = [...filters.selectedIngredients, ingredient.name];
      setFilters({ ...filters, selectedIngredients: newSelected });
    }
    setIngredientInput('');
  };

  const handleIngredientRemove = (ingredientName: string) => {
    const newSelected = filters.selectedIngredients.filter(ing => ing !== ingredientName);
    setFilters({ ...filters, selectedIngredients: newSelected });
  };

  const handleRecipeSelect = (recipeName: string) => {
    // Naviguer vers la route de recherche optimisée
    navigateToRecipeSearchByName(navigate, recipeName, { scaledPerson });
  };

  const handleSearchRecipes = async () => {
    // Si on a des ingrédients sélectionnés, utiliser la recherche par ingrédients
    if (filters.selectedIngredients.length > 0) {
      navigateToRecipeSearchByIngredients(navigate, filters.selectedIngredients, { scaledPerson });
      return;
    }
    
    // Si on a un terme de recherche simple, utiliser la recherche par nom
    if (filters.searchTerm?.trim()) {
      navigateToRecipeSearchByName(navigate, filters.searchTerm, { scaledPerson });
      return;
    }
    
    // Si on a des filtres complexes, utiliser la route de filtre
    if (hasActiveFilters()) {
      navigateToRecipeFilter(navigate, {
        searchTerm: filters.searchTerm,
        ingredients: filters.selectedIngredients,
        minTime: filters.minTime,
        maxTime: filters.maxTime,
        origins: filters.selectedOrigins,
        isBabyFriendly: filters.isBabyFriendly,
        scaledPerson
      });
      return;
    }
    
    // Sinon, faire une recherche locale standard
    setFilters({
      ...filters,
      searchTerm: filters.searchTerm,
      selectedIngredients: filters.selectedIngredients,
      scaledPerson
    });
    await searchRecipes();
  };

  const handleTimeRangeChange = (minTime: number | undefined, maxTime: number | undefined) => {
    setFilters({
      ...filters,
      minTime,
      maxTime
    });
  };

  const handleOriginChange = (selectedOrigins: string[]) => {
    setFilters({
      ...filters,
      selectedOrigins
    });
  };

  const handleBabyFriendlyChange = (isBabyFriendly?: boolean) => {
    setFilters({
      ...filters,
      isBabyFriendly
    });
  };

  const handleResetFilters = async () => {
    resetFilters();
    setIngredientInput('');
    await loadAllRecipes();
  };

  const handleSearchTermChange = (value: string) => {
    setFilters({ ...filters, searchTerm: value });
  };


  const handleScaledPersonChange = async (person: number) => {
    setScaledPerson(person);
    setFilters({ ...filters, scaledPerson: person });
    
    // Si on est en vue détail, recharger la recette avec la nouvelle personne
    if (currentView === 'detail' && selectedRecipe) {
      try {
        const detailedRecipe = await getRecipeById(selectedRecipe.id, person);
        if (detailedRecipe) {
          setSelectedRecipe(detailedRecipe);
        }
      } catch (error) {
        console.error('Erreur lors du rechargement de la recette:', error);
      }
    }
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
  const recipeItems = filteredRecipes.map(recipe => {
    const description = recipe.description?.length > 45 
      ? recipe.description.substring(0, 45) + '...' 
      : recipe.description;
    
    const metadata = [
      {
        icon: Clock,
        text: formatTimeDisplay(recipe.totalTime)
      },
      {
        icon: Users,
        text: `${recipe.scaledPerson || recipe.person} pers.`
      }
    ];

    const tags = [];
    if (recipe.isBabyFriendly) {
      tags.push({
        text: '👶 Bébé',
        variant: 'default' as const
      });
    }
    
    return {
      id: recipe.id,
      title: recipe.name,
      icon: ChefHat,
      iconColor: getTypeColor(recipe.type),
      hideIconOnMobile: true,
      compactMetadataOnMobile: true,
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
        // Sur mobile, ajouter temps et nb personnes en bas
        ...metadata.map(meta => ({
          text: meta.text,
          variant: 'muted' as const
        }))
      ],
      subtitle: description,
      metadata: metadata,
      onClick: () => handleViewRecipe(recipe),
      // Actions unifiées : seul bouton planning sur tous les écrans
      actions: handleAddToPlan ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToPlan(recipe);
          }}
          className="min-w-10 min-h-10 flex items-center justify-center bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 touch-manipulation"
          title="Ajouter au planning"
        >
          <Calendar className="w-4 h-4" />
        </button>
      ) : null
    };
  });

  // Vue détail d'une recette
  if (currentView === 'detail' && selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        scaledPerson={scaledPerson}
        onScaledPersonChange={handleScaledPersonChange}
        onBack={() => setCurrentView('list')}
        onEdit={handleEditRecipe}
        onDelete={(id) => handleDeleteRecipe(id, selectedRecipe?.name)}
      />
    );
  }

  // Formulaire de création/édition
  if (currentView === 'create' || currentView === 'edit') {
    return (
      <RecipeForm
        recipe={editingRecipe || undefined}
        ingredients={ingredients}
        loadIngredients={loadIngredients}
        onSubmit={currentView === 'edit' ? handleUpdateRecipe : handleCreateRecipe}
        onCancel={() => {
          setCurrentView('list');
          setEditingRecipe(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" color="indigo" text="Chargement des recettes..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState
          icon={Search}
          title="Erreur de chargement"
          description={error}
          actionLabel="Réessayer"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  // Vue liste principale
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header avec titre et statistiques */}
      <div className="text-center space-y-3 sm:space-y-4 px-2 sm:px-4">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl xl:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Mes Recettes
        </h1>
        <p className="text-sm xs:text-base sm:text-lg xl:text-xl text-slate-600 max-w-2xl mx-auto px-2 sm:px-4">
          Découvrez, recherchez et filtrez vos recettes préférées
        </p>
        <div className="flex justify-center items-center space-x-4 sm:space-x-8">
          <div className="text-center">
            <div className="text-lg xs:text-xl sm:text-2xl xl:text-3xl font-bold text-indigo-600">{filteredRecipes.length}</div>
            <div className="text-xs sm:text-sm text-slate-500">recettes</div>
          </div>
        </div>
      </div>

      {/* Section Populaire */}
      {popularRecipes.length > 0 && (
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-white/20">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 flex items-center">
              <span className="bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
                ⭐ Recettes Populaires
              </span>
            </h2>
            {popularLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="small" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                {popularRecipes.map((recipeName, index) => (
                  <button
                    key={index}
                    onClick={() => handlePopularRecipeSelect(recipeName)}
                    className="text-left p-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg border border-purple-200 hover:border-purple-300 transition-all duration-200 hover:scale-105 hover:shadow-md"
                  >
                    <span className="text-sm font-medium text-slate-700 hover:text-purple-700 line-clamp-2">
                      {recipeName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Barre de recherche principale */}
      <div className="relative max-w-4xl mx-auto px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="flex-1">
            <SearchBar
              value={filters.searchTerm}
              onChange={handleSearchTermChange}
              placeholder="Rechercher une recette par nom..."
            />
          </div>
          <Button
            onClick={() => setCurrentView('create')}
            variant="success"
            size="lg"
            icon={Plus}
            className="h-12 w-full sm:w-auto"
          >
            <span className="sm:hidden">Nouvelle recette</span>
            <span className="hidden sm:inline">Nouvelle recette</span>
          </Button>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-4">
        <div className="flex flex-col xs:flex-row justify-center items-center gap-2 xs:gap-3 sm:gap-4">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? 'primary' : 'secondary'}
            icon={Filter}
            className="min-h-10 xs:min-h-11 sm:min-h-12 w-full xs:w-auto text-sm xs:text-base"
          >
            <span className="sm:hidden">Filtres</span>
            <span className="hidden sm:inline">Filtres avancés</span>
          </Button>
          
          {hasActiveFilters() && (
            <Button
              onClick={handleResetFilters}
              variant="outline"
              icon={RotateCcw}
              disabled={loading}
              className="min-h-10 xs:min-h-11 sm:min-h-12 w-full xs:w-auto text-sm xs:text-base"
            >
              <span className="sm:hidden">Reset</span>
              <span className="hidden sm:inline">Réinitialiser</span>
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl xs:rounded-2xl sm:rounded-3xl p-3 xs:p-4 sm:p-6 xl:p-8 shadow-xl border border-white/20 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="grid gap-4 xs:gap-5 sm:gap-6 lg:gap-8 grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {/* Recherche par ingrédients */}
              <div className="space-y-3 xs:space-y-4">
                <h3 className="text-base xs:text-lg sm:text-xl font-semibold text-slate-800 flex items-center">
                  <ChefHat className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 mr-1 xs:mr-2 text-indigo-500" />
                  <span className="sm:hidden">Ingrédients</span>
                  <span className="hidden sm:inline">Recherche par ingrédients</span>
                </h3>

                {/* Input ingrédients avec autocomplétion */}
                <div className="relative">
                  <IngredientAutocomplete
                    ingredients={ingredients}
                    onIngredientSelect={handleIngredientAdd}
                    value={ingredientInput}
                    onChange={setIngredientInput}
                    placeholder="Tapez un ingrédient..."
                  />
                </div>

                {/* Ingrédients sélectionnés */}
                {filters.selectedIngredients.length > 0 && (
                  <div className="flex flex-wrap gap-1 xs:gap-2">
                    {filters.selectedIngredients.map((ingredient, idx) => (
                      <span
                        key={idx}
                        className="flex items-center space-x-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-2 xs:px-3 py-1 rounded-full text-xs xs:text-sm font-medium"
                      >
                        <span>{ingredient}</span>
                        <button
                          onClick={() => handleIngredientRemove(ingredient)}
                          className="hover:bg-white/20 rounded-full p-0.5 transition-colors duration-150"
                        >
                          <X className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Filtrage par temps */}
              <div className="space-y-3 xs:space-y-4">
                <TimeRangeSlider
                  minTime={filters.minTime}
                  maxTime={filters.maxTime}
                  onChange={handleTimeRangeChange}
                  disabled={loading}
                />
              </div>

              {/* Filtrage par origine */}
              <div className="space-y-3 xs:space-y-4">
                <OriginFilter
                  availableOrigins={origins}
                  selectedOrigins={filters.selectedOrigins}
                  onChange={handleOriginChange}
                  disabled={loading}
                />
              </div>

              {/* Filtrage par adaptation bébé */}
              <div className="space-y-3 xs:space-y-4">
                <BabyFriendlyFilter
                  isBabyFriendly={filters.isBabyFriendly}
                  onChange={handleBabyFriendlyChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Bouton recherche */}
            <div className="mt-4 xs:mt-5 sm:mt-6 lg:mt-8">
              <Button
                onClick={handleSearchRecipes}
                disabled={loading}
                variant="primary"
                fullWidth
                className="min-h-10 xs:min-h-11 sm:min-h-12 text-sm xs:text-base"
              >
                {loading ? 'Recherche...' : 'Rechercher les recettes'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Sélecteur de vue et résultats */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        {filteredRecipes.length > 0 && (
          <div className="flex justify-end mb-6">
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        )}

        {filteredRecipes.length === 0 ? (
          <div className="px-2 xs:px-4">
            <EmptyState
              icon={Search}
              title="Aucune recette trouvée"
              description="Essayez avec d'autres termes de recherche ou ingrédients"
              actionLabel="Créer ma première recette"
              onAction={() => setCurrentView('create')}
            />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 xl:gap-8">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onView={handleViewRecipe}
                onEdit={handleEditRecipe}
                onDelete={(id) => {
                  const recipe = recipes.find(r => r.id === id);
                  handleDeleteRecipe(id, recipe?.name);
                }}
                onAddToPlan={handleAddToPlan}
              />
            ))}
          </div>
        ) : (
          <ItemList items={recipeItems} />
        )}
      </div>

      {/* Confirmation de suppression */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={cancelDeleteRecipe}
        onConfirm={confirmDeleteRecipe}
        title="Supprimer la recette"
        message={`Êtes-vous sûr de vouloir supprimer la recette "${deleteConfirm.recipeName}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />

      {recipeToAddToPlan && (
        <AddToPlanModal
          isOpen={showAddToPlan}
          onClose={() => {
            setShowAddToPlan(false);
            setRecipeToAddToPlan(null);
          }}
          recipe={recipeToAddToPlan}
        />
      )}

      {/* Modal de détail de recette */}
      <RecipeDetailModal
        isOpen={!!selectedRecipe}
        closeOnOutsideClick={true}
        onClose={() => {
          setIsClosing(true);
          setSelectedRecipe(null);
          navigate('/recipes', { replace: true });
        }}
        onEdit={() => {
          if (selectedRecipe) {
            setIsClosing(true);
            setEditingRecipe(selectedRecipe);
            setCurrentView('edit');
            setSelectedRecipe(null);
            navigate('/recipes', { replace: true });
          }
        }}
        onDelete={() => {
          if (selectedRecipe) {
            setIsClosing(true);
            handleDeleteRecipe(selectedRecipe.id, selectedRecipe.name);
            setSelectedRecipe(null);
            navigate('/recipes', { replace: true });
          }
        }}
        recipe={selectedRecipe}
        user={null}
        scaledPerson={modalScaledPerson}
        onScaledPersonChange={handleModalScaledPersonChange}
      />
    </div>
  );
}
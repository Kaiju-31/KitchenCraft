import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Leaf } from 'lucide-react';
import type { Ingredient, ViewMode } from '../types';
import { useViewMode } from '../hooks/useViewMode';
import { INGREDIENT_CATEGORIES } from '../types';
import { useIngredients } from '../hooks/useIngredients';
import { ingredientService } from '../services/ingredientService';

// Components
import SearchBar from '../components/ui/SearchBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import CategoryFilter from '../components/ui/CategoryFilter';
import ViewModeToggle from '../components/ui/ViewModeToggle';
import ItemCard from '../components/ui/ItemCard';
import ItemList from '../components/ui/ItemList';
import IngredientForm from '../components/forms/IngredientForm';

export default function Ingredients() {
  const [viewMode, setViewMode] = useViewMode('viewMode-ingredients', 'grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  // État pour la confirmation de suppression
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; ingredientId: number | null; ingredientName: string }>({ 
    isOpen: false, 
    ingredientId: null, 
    ingredientName: '' 
  });
  // État pour les ingrédients populaires
  const [popularIngredients, setPopularIngredients] = useState<string[]>([]);
  const [popularLoading, setPopularLoading] = useState(false);

  const {
    ingredients,
    filteredIngredients,
    filters,
    setFilters,
    loading,
    error,
    createIngredient,
    updateIngredient,
    deleteIngredient
  } = useIngredients();

  // Charger les ingrédients populaires au montage
  useEffect(() => {
    const fetchPopularIngredients = async () => {
      setPopularLoading(true);
      try {
        const popular = await ingredientService.getPopularIngredients(10, true);
        setPopularIngredients(popular.sort((a, b) => a.localeCompare(b)));
      } catch (error) {
        console.error('Erreur lors du chargement des ingrédients populaires:', error);
      } finally {
        setPopularLoading(false);
      }
    };

    fetchPopularIngredients();
  }, []);

  const handlePopularIngredientSelect = (ingredientName: string) => {
    setFilters({ ...filters, searchTerm: ingredientName });
  };


  const getCategoryInfo = (category: string) => {
    return INGREDIENT_CATEGORIES.find(cat => cat.value === category) || INGREDIENT_CATEGORIES[0];
  };

  const getAvailableCategories = () => {
    // Obtenir toutes les catégories uniques de TOUS les ingrédients (pas seulement les filtrés)
    const usedCategories = new Set(ingredients.map(ing => ing.category));
    
    // Créer la liste des catégories disponibles
    const availableCategories: Category[] = [];
    
    // Toujours ajouter "Tous" en premier
    const tousCategory = INGREDIENT_CATEGORIES.find(cat => cat.value === 'Tous');
    if (tousCategory) {
      availableCategories.push(tousCategory);
    }
    
    // Ajouter les catégories qui ont des ingrédients
    INGREDIENT_CATEGORIES
      .filter(category => category.value !== 'Tous' && usedCategories.has(category.value))
      .sort((a, b) => a.label.localeCompare(b.label))
      .forEach(category => availableCategories.push(category));
    
    return availableCategories;
  };

  const getCategoryCounts = () => {
    const counts: { [key: string]: number } = {};
    const availableCategories = getAvailableCategories();
    
    availableCategories.forEach(category => {
      if (category.value === 'Tous') {
        counts[category.value] = ingredients.length;
      } else {
        counts[category.value] = ingredients.filter(ing => ing.category === category.value).length;
      }
    });
    return counts;
  };

  const handleAddIngredient = async () => {
    setShowAddModal(true);
  };

  const handleEditIngredient = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
  };

  const handleDeleteIngredient = async (id: number, ingredientName?: string) => {
    const ingredient = filteredIngredients.find(i => i.id === id);
    setDeleteConfirm({ 
      isOpen: true, 
      ingredientId: id, 
      ingredientName: ingredientName || ingredient?.name || 'cet ingrédient' 
    });
  };

  const confirmDeleteIngredient = async () => {
    if (!deleteConfirm.ingredientId) return;

    try {
      await deleteIngredient(deleteConfirm.ingredientId);
      setDeleteConfirm({ isOpen: false, ingredientId: null, ingredientName: '' });
    } catch (error) {
      alert('Erreur lors de la suppression de l\'ingrédient');
    }
  };

  const cancelDeleteIngredient = () => {
    setDeleteConfirm({ isOpen: false, ingredientId: null, ingredientName: '' });
  };

  const handleFormSubmit = async (data: { name: string; category: string }) => {
    try {
      if (editingIngredient) {
        await updateIngredient(editingIngredient.id, data);
        setEditingIngredient(null);
      } else {
        await createIngredient(data);
        setShowAddModal(false);
      }
    } catch (error) {
      alert('Erreur lors de la sauvegarde de l\'ingrédient');
      throw error;
    }
  };

  const handleFormClose = () => {
    setShowAddModal(false);
    setEditingIngredient(null);
  };

  // Préparer les données pour les composants de liste
  const ingredientItems = filteredIngredients.map(ingredient => {
    const categoryInfo = getCategoryInfo(ingredient.category);
    return {
      id: ingredient.id,
      title: ingredient.name,
      icon: Leaf,
      iconColor: categoryInfo.color,
      badge: {
        text: categoryInfo.label,
        color: categoryInfo.color
      },
      onClick: () => handleEditIngredient(ingredient),
      // Actions mobile : seul bouton supprimer
      mobileActions: (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteIngredient(ingredient.id, ingredient.name);
            }}
            className="min-w-10 min-h-10 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 touch-manipulation"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      // Actions tablette : seul bouton supprimer (pas d'edit)
      tabletActions: (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteIngredient(ingredient.id, ingredient.name);
            }}
            className="min-w-10 min-h-10 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 touch-manipulation"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      // Actions desktop : tous les boutons
      actions: (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditIngredient(ingredient);
            }}
            className="min-w-10 min-h-10 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 touch-manipulation"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteIngredient(ingredient.id, ingredient.name);
            }}
            className="min-w-10 min-h-10 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 touch-manipulation"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" color="emerald" text="Chargement des ingrédients..." />
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

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4 px-2 sm:px-4">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl xl:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent pb-3">
          Mes Ingrédients
        </h1>
        <p className="text-sm xs:text-base sm:text-lg xl:text-xl text-slate-600 max-w-2xl mx-auto px-2 sm:px-4">
          Gérez votre inventaire d'ingrédients et découvrez de nouvelles saveurs
        </p>
        <div className="flex justify-center items-center space-x-4 sm:space-x-6 lg:space-x-8">
          <div className="text-center">
            <div className="text-lg xs:text-xl sm:text-2xl xl:text-3xl font-bold text-emerald-600">
              {filteredIngredients.length}
            </div>
            <div className="text-xs sm:text-sm text-slate-500">ingrédients</div>
          </div>
          <div className="text-center">
            <div className="text-lg xs:text-xl sm:text-2xl xl:text-3xl font-bold text-teal-600">
              {new Set(filteredIngredients.map(ing => ing.category)).size}
            </div>
            <div className="text-xs sm:text-sm text-slate-500">catégories</div>
          </div>
        </div>
      </div>

      {/* Section Populaire */}
      {popularIngredients.length > 0 && (
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl xs:rounded-2xl sm:rounded-3xl p-3 xs:p-4 sm:p-6 shadow-lg border border-white/20">
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-slate-800 mb-3 xs:mb-4 flex items-center">
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                ⭐ Ingrédients Populaires
              </span>
            </h2>
            {popularLoading ? (
              <div className="flex justify-center py-6 xs:py-8">
                <LoadingSpinner size="small" />
              </div>
            ) : (
              <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 xs:gap-2 sm:gap-3">
                {popularIngredients.map((ingredientName, index) => (
                  <button
                    key={index}
                    onClick={() => handlePopularIngredientSelect(ingredientName)}
                    className="text-left p-2 xs:p-3 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 rounded-lg border border-emerald-200 hover:border-emerald-300 transition-all duration-200 hover:scale-105 hover:shadow-md"
                  >
                    <span className="text-xs xs:text-sm font-medium text-slate-700 hover:text-emerald-700 line-clamp-2">
                      {ingredientName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Barre de recherche et contrôles */}
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <SearchBar
            value={filters.searchTerm}
            onChange={(value) => setFilters({ ...filters, searchTerm: value })}
            placeholder="Rechercher un ingrédient..."
          />
          <Button
            onClick={handleAddIngredient}
            variant="success"
            size="lg"
            icon={Plus}
            className="h-13 w-full sm:w-auto"
          >
            <span className="sm:hidden">Ajouter un ingrédient</span>
            <span className="hidden sm:inline">Ajouter</span>
          </Button>
        </div>

        {/* Filtres et vue */}
        <div className="flex flex-col gap-4">
          {/* Bouton vue à droite sur mobile, avec filtres */}
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <CategoryFilter
                categories={getAvailableCategories()}
                selectedCategories={filters.selectedCategories}
                onCategoryChange={(categories) => setFilters({ ...filters, selectedCategories: categories })}
                itemCounts={getCategoryCounts()}
                maxVisible={50}
              />
            </div>
            <div className="ml-4">
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des ingrédients */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {filteredIngredients.length === 0 ? (
          <div className="px-2 xs:px-4">
            <EmptyState
              icon={Search}
              title="Aucun ingrédient trouvé"
              description={
                filters.searchTerm || filters.category !== 'ALL'
                  ? 'Essayez avec d\'autres termes de recherche ou changez de catégorie'
                  : 'Commencez par ajouter vos premiers ingrédients'
              }
              actionLabel="Ajouter un ingrédient"
              onAction={handleAddIngredient}
            />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 xs:gap-3 sm:gap-4 xl:gap-6">
            {ingredientItems.map((item) => (
              <ItemCard key={item.id} {...item} />
            ))}
          </div>
        ) : (
          <ItemList items={ingredientItems} />
        )}
      </div>

      {/* Formulaires */}
      <IngredientForm
        ingredient={editingIngredient || undefined}
        isOpen={showAddModal || editingIngredient !== null}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />

      {/* Confirmation de suppression */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={cancelDeleteIngredient}
        onConfirm={confirmDeleteIngredient}
        title="Supprimer l'ingrédient"
        message={`Êtes-vous sûr de vouloir supprimer l'ingrédient "${deleteConfirm.ingredientName}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
}
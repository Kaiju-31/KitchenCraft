import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Scan, RefreshCw, Search, Filter, Edit, Trash2, Grid, List, Eye } from 'lucide-react';
import type { Ingredient, User, ViewMode, IngredientRequest } from '../types';
import { BASIC_INGREDIENT_CATEGORIES } from '../types';

// Components
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import BarcodeScanner from '../components/nutrition/BarcodeScanner';
import IngredientDetail from '../components/nutrition/IngredientDetail';
import AdvancedIngredientForm from '../components/forms/AdvancedIngredientForm';

// Hooks
import { useIngredients } from '../hooks/useIngredients';
import { useKeyboard } from '../hooks/useKeyboard';
import { ingredientService } from '../services/ingredientService';
import { authService } from '../services/authService';

// Mock user - à remplacer par le vrai utilisateur connecté
const mockUser: User = {
  id: 1,
  username: 'test',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  advancedMode: true,
  enabled: true,
  createdAt: new Date().toISOString()
};

export default function IngredientsPage() {
  const navigate = useNavigate();
  const { id, action } = useParams<{ id: string; action?: string }>();
  
  const {
    ingredients,
    filteredIngredients,
    filters,
    setFilters,
    loading,
    error,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    refreshIngredients
  } = useIngredients();

  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Gérer l'URL dynamique pour la vue détaillée et l'édition
  useEffect(() => {
    if (id && ingredients.length > 0) {
      const ingredient = ingredients.find(item => item.id.toString() === id);
      if (ingredient) {
        setSelectedIngredient(ingredient);
        if (action === 'edit') {
          // Mode édition
          setShowForm(true);
          setShowDetail(false);
        } else {
          // Mode vue détaillée
          setShowDetail(true);
          setShowForm(false);
        }
      }
    }
  }, [id, action, ingredients]);

  useKeyboard({
    onEscape: () => {
      if (showDetail && id) {
        navigate('/ingredients');
      }
      setShowForm(false);
      setShowScanner(false);
      setShowDetail(false);
      setShowDeleteConfirm(false);
      setSelectedIngredient(null);
    },
    enabled: true
  });

  const handleSearchTermChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: value
    }));
  };

  const handleCategoryFilterChange = (category: string) => {
    setFilters(prev => ({
      ...prev,
      selectedCategories: category === 'Tous' ? [] : [category]
    }));
  };

  const handleAddNew = () => {
    setSelectedIngredient(null);
    setShowForm(true);
  };

  const handleScanBarcode = () => {
    setShowScanner(true);
  };

  const handleBarcodeFound = async (barcode: string) => {
    try {
      // Étape 1: Chercher d'abord en base de données locale
      const localResult = await ingredientService.findByBarcode(barcode);
      if (localResult) {
        // Produit déjà en base : afficher les détails
        setSelectedIngredient(localResult);
        navigate(`/ingredients/${localResult.id}`);
        setShowDetail(true);
        setShowScanner(false);
        return;
      }

      // Étape 2: Si pas en local, chercher dans OpenFoodFacts (via API FoodItem qui fonctionne)
      console.log('Produit non trouvé en local, recherche OpenFoodFacts...');
      console.log('URL appelée:', '/api/food-items/search/' + encodeURIComponent(barcode));
      
      // Temporaire: utiliser l'API FoodItem qui fonctionne
      const response = await fetch('/api/food-items/search/' + encodeURIComponent(barcode), {
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders(),
        }
      });
      
      console.log('Réponse OpenFoodFacts status:', response.status);
      
      let openFoodFactsResult = null;
      if (response.ok) {
        const foodItem = await response.json();
        console.log('Produit trouvé sur OpenFoodFacts:', foodItem);
        // Convertir FoodItem vers format Ingredient
        openFoodFactsResult = {
          ...foodItem,
          // S'assurer des champs basiques
          category: foodItem.category || 'Autres',
          basicCategory: foodItem.basicCategory || 'Autres'
        };
      } else {
        console.log('Erreur OpenFoodFacts:', await response.text());
      }
      
      if (openFoodFactsResult) {
        // Produit trouvé dans OpenFoodFacts : formulaire prérempli (sans ID pour création)
        const prefilledIngredient: Partial<Ingredient> = {
          ...openFoodFactsResult,
          id: undefined, // Pas d'ID pour création
          barcode: barcode
        };
        setSelectedIngredient(prefilledIngredient as Ingredient);
        setShowForm(true);
      } else {
        // Étape 3: Rien trouvé nulle part : formulaire vide avec barcode
        const newIngredient: Partial<Ingredient> = {
          name: '',
          category: 'Autres',
          basicCategory: 'Autres',
          barcode: barcode,
          dataSource: 'MANUAL'
        };
        setSelectedIngredient(newIngredient as Ingredient);
        setShowForm(true);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche par code-barres:', error);
      // En cas d'erreur, formulaire vide avec barcode
      const newIngredient: Partial<Ingredient> = {
        name: '',
        category: 'Autres',
        basicCategory: 'Autres',
        barcode: barcode,
        dataSource: 'MANUAL'
      };
      setSelectedIngredient(newIngredient as Ingredient);
      setShowForm(true);
    } finally {
      setShowScanner(false);
    }
  };

  const handleViewDetail = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    navigate(`/ingredients/${ingredient.id}`);
    setShowDetail(true);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setShowDetail(false); // Fermer la vue détaillée
    setShowForm(true);
    navigate(`/ingredients/${ingredient.id}/edit`); // URL dynamique pour l'édition
  };

  const handleDelete = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setShowDeleteConfirm(true);
  };

  const handleSync = async (ingredient: Ingredient) => {
    if (!ingredient.barcode) return;
    
    try {
      await ingredientService.syncWithOpenFoodFacts(ingredient.id);
      refreshIngredients();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    }
  };

  const confirmDelete = async () => {
    if (!selectedIngredient) return;
    
    try {
      setDeleteError(null); // Reset erreur précédente
      await deleteIngredient(selectedIngredient.id);
      setShowDeleteConfirm(false);
      setSelectedIngredient(null);
      if (id) navigate('/ingredients');
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      
      let errorMessage = "Impossible de supprimer cet ingrédient.";
      
      // Gérer spécifiquement les erreurs de suppression
      if (error?.status === 409 || error?.status === 500) {
        // Essayer d'extraire le message détaillé du backend
        if (error?.message) {
          try {
            const parsed = JSON.parse(error.message);
            if (parsed?.message) {
              errorMessage = parsed.message;
            }
          } catch (parseError) {
            // Si le parsing échoue, utiliser le message brut s'il contient des infos utiles
            if (error.message.includes('recette') || error.message.includes('recipe') || 
                error.message.includes('shopping') || error.message.includes('utilisé') ||
                error.message.includes('application')) {
              errorMessage = error.message;
            }
          }
        }
        
        // Messages spécifiques selon le type d'erreur
        if (error?.status === 500 && !errorMessage.includes('utilisé') && !errorMessage.includes('recette') && !errorMessage.includes('application')) {
          errorMessage = "Impossible de supprimer cet ingrédient. Il est probablement utilisé dans une recette ou une liste de courses.";
        }
        
        setDeleteError(errorMessage);
        setShowDeleteConfirm(false);
      } else {
        // Pour les autres erreurs
        errorMessage = "Une erreur est survenue lors de la suppression de l'ingrédient.";
        setDeleteError(errorMessage);
        setShowDeleteConfirm(false);
      }
    }
  };

  const handleFormSubmit = async (data: IngredientRequest) => {
    try {
      console.log('=== DEBUG SAUVEGARDE ===');
      console.log('selectedIngredient:', selectedIngredient);
      console.log('data from form:', data);
      
      let payload;
      // Vérifier l'ID dans selectedIngredient OU dans data du formulaire
      const hasExistingId = selectedIngredient?.id || data.id;
      
      if (hasExistingId) {
        payload = { ...selectedIngredient, ...data };
        console.log('Mode UPDATE - payload:', payload);
      } else {
        payload = data;
        console.log('Mode CREATE - payload:', payload);
      }
      
      await ingredientService.saveIngredient(payload);
      setShowForm(false);
      refreshIngredients();
      
      if (id && action === 'edit') {
        // Si on était en mode édition, retourner à la vue détaillée mise à jour
        // Ne pas nettoyer selectedIngredient car on va revenir à la vue détaillée
        navigate(`/ingredients/${id}`);
      } else {
        // Sinon retourner à la liste et nettoyer
        setSelectedIngredient(null);
        navigate('/ingredients');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    if (id && action === 'edit') {
      // Si on était en mode édition, retourner à la vue détaillée
      // Ne pas nettoyer selectedIngredient car on garde l'ingrédient sélectionné
      navigate(`/ingredients/${id}`);
    } else {
      // Sinon nettoyer et retourner à la liste
      setSelectedIngredient(null);
      navigate('/ingredients');
    }
  };

  const handleDetailClose = () => {
    setShowDetail(false);
    setSelectedIngredient(null);
    navigate('/ingredients');
  };

  const getCategoryInfo = (ingredient: Ingredient) => {
    const category = ingredient.basicCategory || ingredient.category;
    return BASIC_INGREDIENT_CATEGORIES.find(cat => cat.value === category) || BASIC_INGREDIENT_CATEGORIES[0];
  };

  const getAvailableCategories = () => {
    const usedCategories = new Set(
      ingredients.map(ing => ing.basicCategory || ing.category)
    );
    
    return BASIC_INGREDIENT_CATEGORIES.filter(category => 
      category.value === 'Tous' || usedCategories.has(category.value)
    );
  };

  const getCategoryCounts = () => {
    const counts: { [key: string]: number } = {};
    const availableCategories = getAvailableCategories();
    
    availableCategories.forEach(category => {
      if (category.value === 'Tous') {
        counts[category.value] = ingredients.length;
      } else {
        counts[category.value] = ingredients.filter(ing => 
          (ing.basicCategory || ing.category) === category.value
        ).length;
      }
    });
    return counts;
  };

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

  const filteredResults = filteredIngredients || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100">
      {/* Header avec effet glassmorphism */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="text-center space-y-4 mb-6">
            <h1 className="text-3xl sm:text-4xl xl:text-6xl font-bold">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Mes Ingrédients
              </span>
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Gérez votre inventaire d'ingrédients avec données nutritionnelles complètes
            </p>
            
            {/* Statistiques */}
            <div className="flex justify-center items-center space-x-8 pt-2">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
                  {filteredResults.length}
                </div>
                <div className="text-sm text-slate-500">ingrédients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-teal-600">
                  {new Set(filteredResults.map(ing => ing.basicCategory || ing.category)).size}
                </div>
                <div className="text-sm text-slate-500">catégories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-cyan-600">
                  {filteredResults.filter(ing => ing.energyKcal || ing.protein).length}
                </div>
                <div className="text-sm text-slate-500">avec nutrition</div>
              </div>
            </div>
          </div>

          {/* Barre de recherche et actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
            <div className="flex-1">
              <SearchBar
                value={filters.searchTerm}
                onChange={handleSearchTermChange}
                placeholder="Rechercher un ingrédient..."
                className="h-12 text-lg"
              />
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="lg"
                icon={Filter}
                className={`h-12 transition-all duration-300 ${
                  showFilters ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : ''
                }`}
              >
                Filtres
              </Button>
              
              <Button
                onClick={handleScanBarcode}
                variant="info"
                size="lg"
                icon={Scan}
                className="h-12 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
              >
                Scanner
              </Button>
              
              <Button
                onClick={handleAddNew}
                variant="success"
                size="lg"
                icon={Plus}
                className="h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                Ajouter
              </Button>
            </div>
          </div>

          {/* Filtres par catégories */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white/50 rounded-2xl border border-white/20 backdrop-blur-sm">
              <div className="flex flex-wrap gap-2">
                {getAvailableCategories().map(category => {
                  const count = getCategoryCounts()[category.value] || 0;
                  const isSelected = filters.selectedCategories.includes(category.value) || 
                                   (filters.selectedCategories.length === 0 && category.value === 'Tous');
                  
                  return (
                    <button
                      key={category.value}
                      onClick={() => handleCategoryFilterChange(category.value)}
                      className={`
                        flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300
                        ${isSelected 
                          ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105` 
                          : 'bg-white/70 text-slate-700 hover:bg-white/90 hover:scale-105'
                        }
                      `}
                    >
                      <span className="font-medium">{category.label}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isSelected ? 'bg-white/20' : 'bg-slate-200'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Toggle vue */}
          <div className="flex justify-end mt-4">
            <div className="flex bg-white/50 rounded-xl p-1 backdrop-blur-sm border border-white/20">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' 
                    : 'text-slate-600 hover:bg-white/70'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' 
                    : 'text-slate-600 hover:bg-white/70'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-20">
        {filteredResults.length === 0 ? (
          <div className="text-center py-20">
            <EmptyState
              icon={Search}
              title="Aucun ingrédient trouvé"
              description={
                filters.searchTerm || filters.selectedCategories.length > 0
                  ? 'Essayez avec d\'autres termes de recherche ou changez de catégorie'
                  : 'Commencez par ajouter vos premiers ingrédients'
              }
              actionLabel="Ajouter un ingrédient"
              onAction={handleAddNew}
            />
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6'
              : 'space-y-3'
          }>
            {filteredResults.map(ingredient => {
              const categoryInfo = getCategoryInfo(ingredient);
              const hasNutrition = ingredient.energyKcal || ingredient.protein || ingredient.carbohydrates || ingredient.fat;
              
              if (viewMode === 'grid') {
                return (
                  <div
                    key={ingredient.id}
                    onClick={() => handleViewDetail(ingredient)}
                    className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer"
                  >
                    {/* Badge catégorie */}
                    <div className={`absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${categoryInfo.color} text-white shadow-lg`}>
                      {categoryInfo.label}
                    </div>
                    
                    {/* Badge nutrition si disponible */}
                    {hasNutrition && (
                      <div className="absolute top-4 left-4 px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                        Nutrition
                      </div>
                    )}

                    {/* Contenu */}
                    <div className="pt-6">
                      <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                        {ingredient.name}
                      </h3>
                      
                      {ingredient.brand && (
                        <p className="text-sm text-slate-500 mb-3">{ingredient.brand}</p>
                      )}
                      
                      {/* Macronutriments pour les cards */}
                      <div className="grid grid-cols-2 gap-2 text-xs mt-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-orange-600">⚡</span>
                          <span className="font-medium text-slate-700">
                            {ingredient.energyKcal ? `${ingredient.energyKcal} kcal` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-red-600">🥩</span>
                          <span className="font-medium text-slate-700">
                            {ingredient.protein ? `${ingredient.protein}g prot` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-amber-600">🍞</span>
                          <span className="font-medium text-slate-700">
                            {ingredient.carbohydrates ? `${ingredient.carbohydrates}g gluc` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-600">🧈</span>
                          <span className="font-medium text-slate-700">
                            {ingredient.fat ? `${ingredient.fat}g lip` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions - Seulement Resync */}
                    {ingredient.barcode && (
                      <div className="flex justify-center mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSync(ingredient);
                          }}
                          className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          title="Synchroniser avec OpenFoodFacts"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div
                    key={ingredient.id}
                    onClick={() => handleViewDetail(ingredient)}
                    className="group bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-700 transition-colors">
                            {ingredient.name}
                          </h3>
                          
                          {ingredient.brand && (
                            <span className="text-sm text-slate-500">
                              • {ingredient.brand}
                            </span>
                          )}
                          
                          <div className={`px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${categoryInfo.color} text-white`}>
                            {categoryInfo.label}
                          </div>
                          
                          {hasNutrition && (
                            <div className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                              Nutrition
                            </div>
                          )}
                        </div>
                        
                        {/* Macronutriments détaillés pour la vue liste */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-orange-600">⚡</span>
                            <span className="font-medium text-slate-700">
                              {ingredient.energyKcal ? `${ingredient.energyKcal} kcal` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-red-600">🥩</span>
                            <span className="font-medium text-slate-700">
                              {ingredient.protein ? `${ingredient.protein}g protéines` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-amber-600">🍞</span>
                            <span className="font-medium text-slate-700">
                              {ingredient.carbohydrates ? `${ingredient.carbohydrates}g glucides` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-yellow-600">🧈</span>
                            <span className="font-medium text-slate-700">
                              {ingredient.fat ? `${ingredient.fat}g lipides` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions - Seulement Resync */}
                      {ingredient.barcode && (
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSync(ingredient);
                            }}
                            className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                            title="Synchroniser avec OpenFoodFacts"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>

      {/* Modaux */}
      <AdvancedIngredientForm
        initialData={selectedIngredient}
        isOpen={showForm}
        onClose={handleFormClose}
        onSave={handleFormSubmit}
        user={mockUser}
      />

      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanResult={handleBarcodeFound}
      />

      {selectedIngredient && (
        <IngredientDetail
          ingredient={selectedIngredient}
          isOpen={showDetail}
          onClose={handleDetailClose}
          onEdit={() => handleEdit(selectedIngredient)}
          onDelete={() => handleDelete(selectedIngredient)}
          onSync={() => handleSync(selectedIngredient)}
          user={mockUser}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Supprimer l'ingrédient"
        message={`Êtes-vous sûr de vouloir supprimer l'ingrédient "${selectedIngredient?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />

      {/* Dialog d'erreur de suppression */}
      <ConfirmDialog
        isOpen={!!deleteError}
        onClose={() => setDeleteError(null)}
        title="Impossible de supprimer l'ingrédient"
        message={deleteError || ""}
        confirmText="Compris"
        showCancelButton={false}
        variant="danger"
      />
    </div>
  );
}
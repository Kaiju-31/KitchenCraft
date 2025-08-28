import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Scan, RefreshCw, Search, Filter, Edit, Trash2, Grid, List, Eye } from 'lucide-react';
import type { FoodItem, User, ViewMode } from '../types';
import { BASIC_INGREDIENT_CATEGORIES } from '../types';

// Components
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import FoodItemForm from '../components/nutrition/FoodItemForm';
import BarcodeScanner from '../components/nutrition/BarcodeScanner';
import FoodItemDetail from '../components/nutrition/FoodItemDetail';

// Hooks
import { useFoodItems } from '../hooks/useFoodItems';
import { useKeyboard } from '../hooks/useKeyboard';

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

export default function FoodItemsPage() {
  const navigate = useNavigate();
  const { itemId } = useParams();
  
  const {
    foodItems,
    loadingState,
    filters,
    setFilters,
    loadAllFoodItems,
    searchByBarcode,
    createFoodItem,
    updateFoodItem,
    deleteFoodItem,
    syncWithOpenFoodFacts
  } = useFoodItems();

  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Gérer l'URL dynamique pour la vue détaillée
  useEffect(() => {
    if (itemId && foodItems.length > 0) {
      const item = foodItems.find(item => item.id.toString() === itemId);
      if (item) {
        setSelectedFoodItem(item);
        setShowDetail(true);
      }
    }
  }, [itemId, foodItems]);

  useKeyboard({
    onEscape: () => {
      if (showDetail && itemId) {
        navigate('/food-items');
      }
      setShowForm(false);
      setShowScanner(false);
      setShowDetail(false);
      setShowDeleteConfirm(false);
      setSelectedFoodItem(null);
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
      selectedBasicCategory: category
    }));
  };

  const handleAddNew = () => {
    setSelectedFoodItem(null);
    setShowForm(true);
  };

  const handleEdit = (foodItem: FoodItem) => {
    setSelectedFoodItem(foodItem);
    setShowForm(true);
  };

  const handleView = (foodItem: FoodItem) => {
    navigate(`/food-items/${foodItem.id}`);
  };

  const handleEditFromDetail = () => {
    setShowDetail(false);
    setShowForm(true);
  };

  const handleDeleteClick = (foodItem: FoodItem) => {
    setSelectedFoodItem(foodItem);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (selectedFoodItem) {
      try {
        await deleteFoodItem(selectedFoodItem.id);
        setSelectedFoodItem(null);
        setShowDeleteConfirm(false);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'article alimentaire');
      }
    }
  };

  const handleSave = async (foodItemData: Partial<FoodItem>) => {
    try {
      if (selectedFoodItem) {
        await updateFoodItem(selectedFoodItem.id, foodItemData);
      } else {
        await createFoodItem(foodItemData);
      }
      setShowForm(false);
      setSelectedFoodItem(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'article alimentaire');
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    try {
      // 1. D'abord chercher en base locale
      const localItem = foodItems.find(item => item.barcode === barcode);
      
      if (localItem) {
        // Trouvé en base locale → ouvrir la vue détaillée
        navigate(`/food-items/${localItem.id}`);
        return;
      }
      
      // 2. Si pas trouvé en local, chercher dans OpenFoodFacts
      const foundItem = await searchByBarcode(barcode);
      if (foundItem) {
        // Trouvé dans OpenFoodFacts → ouvrir la vue détaillée
        setSelectedFoodItem(foundItem);
        setShowDetail(true);
      } else {
        // Aucun article trouvé → créer un nouvel article avec le code-barres pré-rempli
        setSelectedFoodItem({ 
          barcode,
          dataSource: 'MANUAL',
          basicCategory: 'Autres',
          name: '',
          category: ''
        } as Partial<FoodItem> as FoodItem);
        setShowForm(true);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche par code-barres:', error);
      alert('Erreur lors de la recherche par code-barres');
    }
  };

  const handleSync = async (foodItem: FoodItem) => {
    if (!foodItem.barcode) {
      alert('Impossible de synchroniser un article sans code-barres');
      return;
    }

    try {
      await syncWithOpenFoodFacts(foodItem.id);
      alert('Article synchronisé avec OpenFoodFacts !');
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      alert('Erreur lors de la synchronisation avec OpenFoodFacts');
    }
  };

  const getCategoryColor = (category: string) => {
    const categoryData = BASIC_INGREDIENT_CATEGORIES.find(cat => cat.value === category);
    return categoryData?.color || 'from-gray-500 to-gray-600';
  };

  const formatNutritionalInfo = (foodItem: FoodItem) => {
    const macros = [];
    if (foodItem.energyKcal) macros.push(`${foodItem.energyKcal} kcal`);
    if (foodItem.protein) macros.push(`${foodItem.protein}g protéines`);
    if (foodItem.carbohydrates) macros.push(`${foodItem.carbohydrates}g glucides`);
    if (foodItem.fat) macros.push(`${foodItem.fat}g lipides`);
    return macros.length > 0 ? macros.join(', ') : 'Pas d\'info nutritionnelle';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
            Articles alimentaires
          </h1>
          <p className="text-slate-600 mt-1">
            Gérez vos articles alimentaires avec données nutritionnelles
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => setShowScanner(true)}
            className="flex items-center"
          >
            <Scan className="w-4 h-4 mr-2" />
            Scanner
          </Button>
          <Button
            onClick={handleAddNew}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel article
          </Button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={filters.searchTerm}
              onChange={handleSearchTermChange}
              placeholder="Rechercher par nom, marque ou code-barres..."
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
            <Button
              variant="outline"
              onClick={loadAllFoodItems}
              className="flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            
            {/* Toggle vue */}
            <div className="flex border border-slate-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                title="Vue en cartes"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                title="Vue en liste"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filtres par catégorie */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Catégorie</h4>
            <div className="flex flex-wrap gap-2">
              {BASIC_INGREDIENT_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryFilterChange(category.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filters.selectedBasicCategory === category.value
                      ? `bg-gradient-to-r ${category.color} text-white`
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-xl shadow-sm">
        {loadingState.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="large" color="purple" text="Chargement des articles..." />
          </div>
        ) : loadingState.error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="font-medium">Erreur de chargement</p>
              <p className="text-sm mt-1">{loadingState.error}</p>
              <Button onClick={loadAllFoodItems} className="mt-3" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </div>
        ) : foodItems.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Search}
              title={filters.searchTerm || filters.selectedBasicCategory !== 'Tous' 
                ? "Aucun article trouvé" 
                : "Aucun article alimentaire"
              }
              description={filters.searchTerm || filters.selectedBasicCategory !== 'Tous'
                ? "Modifiez vos critères de recherche ou ajoutez un nouvel article"
                : "Commencez par ajouter votre premier article alimentaire"
              }
              actionLabel="Ajouter un article"
              onAction={handleAddNew}
            />
          </div>
        ) : (
          <>
            {/* Vue en grille */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {foodItems.map((foodItem) => (
                  <div
                    key={foodItem.id}
                    className="bg-white rounded-lg border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => handleView(foodItem)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 text-lg line-clamp-2">
                            {foodItem.name}
                          </h3>
                          {foodItem.brand && (
                            <p className="text-slate-600 text-sm mt-1 line-clamp-1">
                              {foodItem.brand}
                            </p>
                          )}
                        </div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getCategoryColor(foodItem.basicCategory)} shrink-0 ml-2`}>
                          {foodItem.basicCategory}
                        </span>
                      </div>

                      {foodItem.barcode && (
                        <p className="text-slate-500 text-xs mb-3 font-mono">
                          {foodItem.barcode}
                        </p>
                      )}

                      <div className="flex items-center justify-center">
                        <span className={`text-xs px-2 py-1 rounded ${
                          foodItem.dataSource === 'OPENFOODFACTS' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {foodItem.dataSource === 'OPENFOODFACTS' ? 'OpenFoodFacts' : 'Manuel'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Vue en liste */
              <div className="divide-y divide-slate-200">
                {foodItems.map((foodItem) => (
                  <div key={foodItem.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => handleView(foodItem)}>
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800 text-lg">
                              {foodItem.name}
                            </h3>
                            {foodItem.brand && (
                              <p className="text-slate-600 text-sm mt-1">
                                Marque: {foodItem.brand}
                              </p>
                            )}
                            {foodItem.barcode && (
                              <p className="text-slate-500 text-xs mt-1 font-mono">
                                Code-barres: {foodItem.barcode}
                              </p>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getCategoryColor(foodItem.basicCategory)}`}>
                              {foodItem.basicCategory}
                            </span>
                            <p className={`text-xs mt-2 px-2 py-1 rounded ${
                              foodItem.dataSource === 'OPENFOODFACTS' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {foodItem.dataSource === 'OPENFOODFACTS' ? 'OpenFoodFacts' : 'Manuel'}
                            </p>
                          </div>
                        </div>
                        
                        {mockUser.advancedMode && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-700">
                              <span className="font-medium">Nutrition (100g):</span> {formatNutritionalInfo(foodItem)}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {foodItem.barcode && foodItem.dataSource !== 'OPENFOODFACTS' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSync(foodItem)}
                            title="Synchroniser avec OpenFoodFacts"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <FoodItemForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedFoodItem(null);
        }}
        onSave={handleSave}
        user={mockUser}
        initialData={selectedFoodItem || undefined}
      />

      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanResult={handleBarcodeScanned}
        closeOnOutsideClick={true}
      />

      <FoodItemDetail
        isOpen={showDetail}
        onClose={() => {
          navigate('/food-items');
          setShowDetail(false);
          setSelectedFoodItem(null);
        }}
        onEdit={handleEditFromDetail}
        onDelete={() => {
          navigate('/food-items');
          setShowDetail(false);
          handleDeleteClick(selectedFoodItem!);
        }}
        foodItem={selectedFoodItem}
        user={mockUser}
        closeOnOutsideClick={true}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer l'article"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedFoodItem?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
}
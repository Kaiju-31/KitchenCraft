import { useState, useMemo } from 'react';
import { Search, Filter, Plus, Clock, Users } from 'lucide-react';
import type {Recipe, PlanRecipeRequest, RECIPE_TYPES} from '../../types';
import { useRecipes } from '../../hooks/useRecipes';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import SearchBar from '../ui/SearchBar';
import CategoryFilter from '../ui/CategoryFilter';
import LoadingSpinner from '../ui/LoadingSpinner';

interface RecipeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecipe: (recipe: PlanRecipeRequest) => Promise<void>;
  selectedDate: string;
  planId: number;
}

export default function RecipeSelector({ 
  isOpen, 
  onClose, 
  onAddRecipe, 
  selectedDate, 
  planId 
}: RecipeSelectorProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [mealType, setMealType] = useState('');
  const [scaledPerson, setScaledPerson] = useState<number>(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    recipes,
    filters,
    setFilters,
    loading,
  } = useRecipes();

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      if (filters.searchTerm && !recipe.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [recipes, filters.searchTerm]);

  const handleAddRecipe = async () => {
    if (!selectedRecipe) return;

    setIsSubmitting(true);
    try {
      await onAddRecipe({
        recipeId: selectedRecipe.id,
        plannedDate: selectedDate,
        mealType: mealType || undefined,
        scaledPerson: scaledPerson !== selectedRecipe.person ? scaledPerson : undefined,
      });
      
      // Reset form
      setSelectedRecipe(null);
      setMealType('');
      setScaledPerson(4);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la recette:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Ajouter une recette - ${formatDate(selectedDate)}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Filtres de recherche */}
        <div className="space-y-4">
          <SearchBar
            value={filters.searchTerm}
            onChange={(value) => setFilters(prev => ({ ...prev, searchTerm: value }))}
            placeholder="Rechercher une recette..."
          />
        </div>

        {/* Liste des recettes */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loading.isLoading ? (
            <LoadingSpinner />
          ) : filteredRecipes.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              Aucune recette trouvée
            </p>
          ) : (
            <div className="grid gap-3">
              {filteredRecipes.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  className={`text-left p-4 rounded-lg border transition-all ${
                    selectedRecipe?.id === recipe.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{recipe.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {recipe.totalTime} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {recipe.person} pers.
                        </span>
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                          {recipe.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Configuration de la recette sélectionnée */}
        {selectedRecipe && (
          <div className="bg-purple-50 rounded-lg p-4 space-y-4">
            <h4 className="font-medium text-purple-800">
              Configuration pour "{selectedRecipe.name}"
            </h4>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Type de repas */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type de repas (optionnel)
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Non spécifié</option>
                  <option value="Petit-déjeuner">Petit-déjeuner</option>
                  <option value="Déjeuner">Déjeuner</option>
                  <option value="Dîner">Dîner</option>
                  <option value="Collation">Collation</option>
                </select>
              </div>

              {/* Nombre de personnes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre de personnes
                </label>
                <input
                  type="number"
                  value={scaledPerson}
                  onChange={(e) => setScaledPerson(parseInt(e.target.value) || 1)}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                {scaledPerson !== selectedRecipe.person && (
                  <p className="text-xs text-purple-600 mt-1">
                    Recette originale pour {selectedRecipe.person} personne{selectedRecipe.person > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            variant="primary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleAddRecipe}
            disabled={!selectedRecipe || isSubmitting}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Ajout...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter au planning
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
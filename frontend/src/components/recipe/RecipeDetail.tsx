import { ArrowLeft, Clock, Users, MapPin, ChefHat, Edit, Trash2, FileDown, Baby } from 'lucide-react';
import type { Recipe } from '../../types';
import { RECIPE_TYPES } from '../../types';
import { formatQuantity } from '../../utils/quantityUtils';
import { formatTimeDisplay } from '../../utils/timeUtils';
import { exportRecipeToPDF } from '../../utils/pdfExport';
import Button from '../ui/Button';

interface RecipeDetailProps {
  recipe: Recipe;
  scaledPerson: number;
  onScaledPersonChange: (person: number) => void;
  onBack: () => void;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (id: number) => void;
}

export default function RecipeDetail({
  recipe,
  scaledPerson,
  onScaledPersonChange,
  onBack,
  onEdit,
  onDelete
}: RecipeDetailProps) {
  const getTypeColor = (type: string) => {
    const recipeType = RECIPE_TYPES.find(t => t.value === type);
    return recipeType?.color || 'from-gray-500 to-gray-600';
  };

  const getTypeLabel = (type: string) => {
    const recipeType = RECIPE_TYPES.find(t => t.value === type);
    return recipeType?.label || type;
  };

  const handleExportPDF = async () => {
    try {
      await exportRecipeToPDF(recipe);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Erreur lors de la génération du PDF');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header avec retour */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 px-4">
        <Button
          onClick={onBack}
          variant="secondary"
          icon={ArrowLeft}
          className="min-h-11 w-full sm:w-auto"
        >
          Retour
        </Button>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
          <Button
            onClick={handleExportPDF}
            variant="secondary"
            icon={FileDown}
            className="min-h-11 w-full sm:w-auto"
          >
            <span className="sm:hidden">PDF</span>
            <span className="hidden sm:inline">Exporter PDF</span>
          </Button>
          {onEdit && (
            <Button
              onClick={() => onEdit(recipe)}
              variant="primary"
              icon={Edit}
              className="min-h-11 w-full sm:w-auto"
            >
              <span className="sm:hidden">Modifier</span>
              <span className="hidden sm:inline">Modifier</span>
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={() => onDelete(recipe.id)}
              variant="danger"
              icon={Trash2}
              className="min-h-11 w-full sm:w-auto"
            >
              <span className="sm:hidden">Supprimer</span>
              <span className="hidden sm:inline">Supprimer</span>
            </Button>
          )}
        </div>
      </div>

      {/* Contenu de la recette */}
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 xl:p-8 shadow-xl border border-white/20">
        {/* En-tête */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <span className={`px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getTypeColor(recipe.type)}`}>
              {getTypeLabel(recipe.type)}
            </span>
            {recipe.isBabyFriendly && (
              <span className="flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium text-pink-700 bg-gradient-to-r from-pink-100 to-pink-200 border border-pink-200">
                <Baby className="w-4 h-4" />
                <span>Recette Bébé</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl xl:text-5xl font-bold text-slate-800 mb-4">
            {recipe.name}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mb-4 sm:mb-6 px-2">
            {recipe.description}
          </p>

          {/* Métadonnées */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 xl:gap-8 text-slate-600">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {recipe.preparationTime && (
                <div className="flex items-center space-x-2 bg-white/40 px-3 py-1 rounded-lg">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Préparation: {formatTimeDisplay(recipe.preparationTime)}</span>
                </div>
              )}
              {recipe.cookingTime && (
                <div className="flex items-center space-x-2 bg-white/40 px-3 py-1 rounded-lg">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Cuisson: {formatTimeDisplay(recipe.cookingTime)}</span>
                </div>
              )}
              {recipe.restTime && (
                <div className="flex items-center space-x-2 bg-white/40 px-3 py-1 rounded-lg">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Repos: {formatTimeDisplay(recipe.restTime)}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 bg-white/40 px-3 py-1 rounded-lg">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-semibold">{scaledPerson} pers.</span>
              </div>
              {recipe.origin && (
                <div className="flex items-center space-x-2 bg-white/40 px-3 py-1 rounded-lg">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">{recipe.origin}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contrôle des portions */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <label className="text-sm font-medium text-slate-700 flex items-center">
              <Users className="w-4 h-4 mr-1" />
              Ajuster pour:
            </label>
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <span className="text-sm text-slate-600">1</span>
              <input
                type="range"
                min="1"
                max="12"
                value={scaledPerson}
                onChange={(e) => onScaledPersonChange(parseInt(e.target.value))}
                className="flex-1 sm:max-w-40 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-slate-600">12</span>
            </div>
            <span className="text-lg font-bold text-indigo-600 min-w-[4rem] text-center bg-white/60 px-3 py-1 rounded-lg">
              {scaledPerson} pers.
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Ingrédients */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6 flex items-center">
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-emerald-500" />
              Ingrédients
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {recipe.ingredients.map((ri, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 sm:p-4 bg-white/60 rounded-xl border border-white/40">
                  <span className="font-medium text-slate-800 text-sm sm:text-base flex-1 pr-2">{ri.ingredient.name}</span>
                  <span className="text-emerald-600 font-semibold text-sm sm:text-base whitespace-nowrap">
                    {formatQuantity(ri.quantity, ri.unit)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Étapes */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">
              Préparation
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {recipe.steps.map((step, idx) => (
                <div key={idx} className="flex space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white/60 rounded-xl border border-white/40">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <p className="text-slate-700 leading-relaxed text-sm sm:text-base">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
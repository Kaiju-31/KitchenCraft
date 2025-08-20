import { Clock, Users, MapPin, Eye, Edit, Trash2, Calendar, Baby } from 'lucide-react';
import type { Recipe } from '../../types';
import { RECIPE_TYPES } from '../../types';
import { formatTimeDisplay } from '../../utils/timeUtils';

interface RecipeCardProps {
  recipe: Recipe;
  onView?: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (id: number) => void;
  onAddToPlan?: (recipe: Recipe) => void;
  className?: string;
}

export default function RecipeCard({
  recipe,
  onView,
  onEdit,
  onDelete,
  onAddToPlan,
  className = ""
}: RecipeCardProps) {
  const getTypeColor = (type: string) => {
    const recipeType = RECIPE_TYPES.find(t => t.value === type);
    return recipeType?.color || 'from-gray-500 to-gray-600';
  };

  const getTypeLabel = (type: string) => {
    const recipeType = RECIPE_TYPES.find(t => t.value === type);
    return recipeType?.label || type;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Ne pas déclencher si on clique sur un bouton
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onView?.(recipe);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:rotate-1 cursor-pointer ${
        recipe.isBabyFriendly 
          ? 'bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 hover:border-pink-300 hover:shadow-pink-200/50' 
          : 'bg-white/80 backdrop-blur-sm border border-white/20'
      } ${className}`}
    >
      {/* En-tête avec type */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getTypeColor(recipe.type)}`}>
            {getTypeLabel(recipe.type)}
          </span>
          {recipe.isBabyFriendly && (
            <span className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-pink-700 bg-gradient-to-r from-pink-100 to-pink-200 border border-pink-200">
              <Baby className="w-3 h-3" />
              <span>Bébé</span>
            </span>
          )}
        </div>
        <div className="text-right text-sm text-slate-500">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatTimeDisplay(recipe.totalTime)}</span>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <h3 className="text-lg sm:text-xl xl:text-2xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
        {recipe.name}
      </h3>

      <p className="text-sm sm:text-base text-slate-600 mb-4 line-clamp-2">
        {recipe.description}
      </p>

      {/* Métadonnées */}
      <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4" />
          <span>{recipe.scaledPerson || recipe.person} pers.</span>
        </div>
        {recipe.origin && (
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{recipe.origin}</span>
          </div>
        )}
      </div>

      {/* Ingrédients */}
      <div className="space-y-2 mb-4">
        <h4 className="font-semibold text-slate-700">Ingrédients:</h4>
        <div className="flex flex-wrap gap-1">
          {recipe.ingredients?.slice(0, 3).map((ri, idx) => (
            <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
              {ri.ingredient.name}
            </span>
          ))}
          {recipe.ingredients?.length > 3 && (
            <span className="text-xs text-slate-400">
              +{recipe.ingredients.length - 3} autres
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-200 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => onView?.(recipe)}
          className="flex items-center space-x-2 px-4 py-2 min-h-11 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          <span>Voir</span>
        </button>

        <div className="flex space-x-2">
          {onAddToPlan && (
            <button
              onClick={() => onAddToPlan(recipe)}
              className="min-w-11 min-h-11 flex items-center justify-center bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
              title="Ajouter au planning"
            >
              <Calendar className="w-5 h-5" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(recipe)}
              className="min-w-11 min-h-11 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              title="Modifier"
            >
              <Edit className="w-5 h-5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(recipe.id)}
              className="min-w-11 min-h-11 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              title="Supprimer"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
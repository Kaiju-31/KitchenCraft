import { useState } from 'react';
import { X, Package, Info, Trash2, Edit, FileDown, ChevronDown, ChevronUp, Clock, Users, MapPin, Baby } from 'lucide-react';
import type { Recipe, User } from '../../types';
import { RECIPE_TYPES } from '../../types';
import { formatQuantity } from '../../utils/quantityUtils';
import { formatTimeDisplay } from '../../utils/timeUtils';
import { exportRecipeToPDF } from '../../utils/pdfExport';
import Button from '../ui/Button';
import { useKeyboard } from '../../hooks/useKeyboard';

interface RecipeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  recipe: Recipe | null;
  user: User | null;
  scaledPerson: number;
  onScaledPersonChange: (person: number) => void;
  closeOnOutsideClick?: boolean;
}

export default function RecipeDetailModal({ 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  recipe, 
  user, 
  scaledPerson,
  onScaledPersonChange,
  closeOnOutsideClick = true 
}: RecipeDetailModalProps) {
  const [showNutritionDetails, setShowNutritionDetails] = useState(false);
  const [showAdvancedNutrition, setShowAdvancedNutrition] = useState(false);
  
  useKeyboard({
    onEscape: onClose,
    enabled: isOpen
  });

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleExportPDF = async () => {
    if (!recipe) return;
    try {
      await exportRecipeToPDF(recipe);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Erreur lors de la génération du PDF');
    }
  };

  if (!isOpen || !recipe) return null;

  const hasNutritionData = (recipe: Recipe) => {
    return recipe.totalEnergyKcal || recipe.totalCarbohydrates || recipe.totalProtein || 
           recipe.totalFat || recipe.totalFiber || recipe.totalSugars || 
           recipe.totalSaturatedFat || recipe.totalSalt;
  };

  const hasVitaminsData = (recipe: Recipe) => {
    return recipe.totalVitaminA || recipe.totalVitaminB1 || recipe.totalVitaminB2 || 
           recipe.totalVitaminB3 || recipe.totalVitaminB5 || recipe.totalVitaminB6 || 
           recipe.totalVitaminB7 || recipe.totalVitaminB9 || recipe.totalVitaminB12 || 
           recipe.totalVitaminC || recipe.totalVitaminD || recipe.totalVitaminE || 
           recipe.totalVitaminK;
  };

  const hasMineralsData = (recipe: Recipe) => {
    return recipe.totalCalcium || recipe.totalIron || recipe.totalMagnesium || 
           recipe.totalPhosphorus || recipe.totalPotassium || recipe.totalZinc || 
           recipe.totalCopper || recipe.totalManganese || recipe.totalSelenium || 
           recipe.totalIodine || recipe.totalChromium || recipe.totalMolybdenum || 
           recipe.totalFluoride || recipe.totalSodium;
  };

  const getTypeColor = (type: string) => {
    const recipeType = RECIPE_TYPES.find(t => t.value === type);
    return recipeType?.color || 'from-gray-500 to-gray-600';
  };

  const getTypeLabel = (type: string) => {
    const recipeType = RECIPE_TYPES.find(t => t.value === type);
    return recipeType?.label || type;
  };

  const scalingRatio = scaledPerson / recipe.person;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">{recipe.name}</h2>
              <div className="flex items-center space-x-4 text-purple-100 text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getTypeColor(recipe.type)}`}>
                  {getTypeLabel(recipe.type)}
                </span>
                {recipe.isBabyFriendly && (
                  <span className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-pink-700 bg-gradient-to-r from-pink-100 to-pink-200 border border-pink-200">
                    <Baby className="w-3 h-3" />
                    <span>Bébé</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleExportPDF} variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
              <FileDown className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            {onEdit && (
              <Button onClick={onEdit} variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            )}
            {onDelete && (
              <Button onClick={onDelete} variant="outline" className="text-white border-red-300 hover:bg-red-500 hover:text-white">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne gauche - Informations générales */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-purple-600" />
                Informations générales
              </h3>
              
              <div className="space-y-4 mb-6">
                <p className="text-slate-600">{recipe.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600">
                      {formatTimeDisplay(recipe.totalTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={scaledPerson}
                        onChange={(e) => onScaledPersonChange(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                      <span className="text-sm text-slate-600">pers.</span>
                    </div>
                  </div>
                  
                  {recipe.origin && (
                    <div className="flex items-center space-x-2 col-span-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">{recipe.origin}</span>
                    </div>
                  )}
                </div>

                {/* Temps de préparation détaillés */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-700 mb-2">Temps de préparation</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500">Préparation:</span>
                      <span className="ml-2 font-medium">{formatTimeDisplay(recipe.preparationTime)}</span>
                    </div>
                    {recipe.cookingTime && (
                      <div>
                        <span className="text-slate-500">Cuisson:</span>
                        <span className="ml-2 font-medium">{formatTimeDisplay(recipe.cookingTime)}</span>
                      </div>
                    )}
                    {recipe.restTime && (
                      <div>
                        <span className="text-slate-500">Repos:</span>
                        <span className="ml-2 font-medium">{formatTimeDisplay(recipe.restTime)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Valeurs nutritionnelles */}
              <div className="mt-8">
                <button
                  onClick={() => setShowNutritionDetails(!showNutritionDetails)}
                  className="flex items-center justify-between w-full p-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-200"
                >
                  <span className="font-medium text-slate-700">Valeurs nutritionnelles (par portion)</span>
                  {showNutritionDetails ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  )}
                </button>
                
                {showNutritionDetails && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                    {hasNutritionData(recipe) ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          {recipe.totalEnergyKcal && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Énergie</span>
                              <span className="font-medium text-slate-800">{Math.round(recipe.totalEnergyKcal)} kcal</span>
                            </div>
                          )}
                          {recipe.totalProtein && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Protéines</span>
                              <span className="font-medium text-slate-800">{recipe.totalProtein.toFixed(1)} g</span>
                            </div>
                          )}
                          {recipe.totalCarbohydrates && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Glucides</span>
                              <span className="font-medium text-slate-800">{recipe.totalCarbohydrates.toFixed(1)} g</span>
                            </div>
                          )}
                          {recipe.totalSugars && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">dont sucres</span>
                              <span className="font-medium text-slate-800">{recipe.totalSugars.toFixed(1)} g</span>
                            </div>
                          )}
                          {recipe.totalFat && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Lipides</span>
                              <span className="font-medium text-slate-800">{recipe.totalFat.toFixed(1)} g</span>
                            </div>
                          )}
                          {recipe.totalSaturatedFat && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">dont saturés</span>
                              <span className="font-medium text-slate-800">{recipe.totalSaturatedFat.toFixed(1)} g</span>
                            </div>
                          )}
                          {recipe.totalFiber && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Fibres</span>
                              <span className="font-medium text-slate-800">{recipe.totalFiber.toFixed(1)} g</span>
                            </div>
                          )}
                          {recipe.totalSalt && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Sel</span>
                              <span className="font-medium text-slate-800">{recipe.totalSalt.toFixed(2)} g</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4">
                          <button
                            onClick={() => setShowAdvancedNutrition(!showAdvancedNutrition)}
                            className="flex items-center justify-between w-full p-3 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors duration-200"
                          >
                            <span className="font-medium text-slate-700">Plus de détails nutritionnels</span>
                            {showAdvancedNutrition ? (
                              <ChevronUp className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                            
                            {showAdvancedNutrition && (
                              <div className="mt-4 space-y-4">
                                {hasVitaminsData(recipe) ? (
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b border-slate-300 pb-2">
                                      Vitamines
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                      {recipe.totalVitaminA && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Vitamine A</span>
                                          <span className="font-medium text-slate-800">{recipe.totalVitaminA.toFixed(1)} µg</span>
                                        </div>
                                      )}
                                      {recipe.totalVitaminB1 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Vitamine B1</span>
                                          <span className="font-medium text-slate-800">{recipe.totalVitaminB1.toFixed(2)} mg</span>
                                        </div>
                                      )}
                                      {recipe.totalVitaminB2 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Vitamine B2</span>
                                          <span className="font-medium text-slate-800">{recipe.totalVitaminB2.toFixed(2)} mg</span>
                                        </div>
                                      )}
                                      {recipe.totalVitaminB3 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Vitamine B3</span>
                                          <span className="font-medium text-slate-800">{recipe.totalVitaminB3.toFixed(2)} mg</span>
                                        </div>
                                      )}
                                      {recipe.totalVitaminB5 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Vitamine B5</span>
                                          <span className="font-medium text-slate-800">{recipe.totalVitaminB5.toFixed(2)} mg</span>
                                        </div>
                                      )}
                                      {recipe.totalVitaminB6 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Vitamine B6</span>
                                          <span className="font-medium text-slate-800">{recipe.totalVitaminB6.toFixed(2)} mg</span>
                                        </div>
                                      )}
                                      {recipe.totalVitaminB7 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Vitamine B7</span>
                                          <span className="font-medium text-slate-800">{recipe.totalVitaminB7.toFixed(1)} µg</span>
                                        </div>
                                      )}
                                      {recipe.totalVitaminB9 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Vitamine B9</span>
                                          <span className="font-medium text-slate-800">{recipe.totalVitaminB9.toFixed(1)} µg</span>
                                        </div>
                                      )}
                                      {recipe.totalVitaminB12 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Vitamine B12</span>
                                          <span className="font-medium text-slate-800">{recipe.totalVitaminB12.toFixed(1)} µg</span>
                                        </div>
                                      )}
                                      {recipe.totalVitaminC && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Vitamine C</span>
                                          <span className="font-medium text-slate-800">{recipe.totalVitaminC.toFixed(1)} mg</span>
                                        </div>
                                      )}
                                      {recipe.totalVitaminD && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Vitamine D</span>
                                          <span className="font-medium text-slate-800">{recipe.totalVitaminD.toFixed(1)} µg</span>
                                        </div>
                                      )}
                                      {recipe.totalVitaminE && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Vitamine E</span>
                                          <span className="font-medium text-slate-800">{recipe.totalVitaminE.toFixed(1)} mg</span>
                                        </div>
                                      )}
                                      {recipe.totalVitaminK && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Vitamine K</span>
                                          <span className="font-medium text-slate-800">{recipe.totalVitaminK.toFixed(1)} µg</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b border-slate-300 pb-2">
                                      Vitamines
                                    </h4>
                                    <p className="text-slate-500 text-sm">
                                      Données non disponibles pour cette recette
                                    </p>
                                  </div>
                                )}

                                {hasMineralsData(recipe) ? (
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b border-slate-300 pb-2">
                                      Minéraux
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                      {recipe.totalCalcium && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Calcium</span>
                                          <span className="font-medium text-slate-800">{recipe.totalCalcium.toFixed(1)} mg</span>
                                        </div>
                                      )}
                                      {recipe.totalIron && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Fer</span>
                                          <span className="font-medium text-slate-800">{recipe.totalIron.toFixed(2)} mg</span>
                                        </div>
                                      )}
                                      {recipe.totalMagnesium && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Magnésium</span>
                                          <span className="font-medium text-slate-800">{recipe.totalMagnesium.toFixed(1)} mg</span>
                                        </div>
                                      )}
                                      {recipe.totalPhosphorus && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Phosphore</span>
                                          <span className="font-medium text-slate-800">{recipe.totalPhosphorus.toFixed(1)} mg</span>
                                        </div>
                                      )}
                                      {recipe.totalPotassium && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Potassium</span>
                                          <span className="font-medium text-slate-800">{recipe.totalPotassium.toFixed(1)} mg</span>
                                        </div>
                                      )}
                                      {recipe.totalSodium && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Sodium</span>
                                          <span className="font-medium text-slate-800">{recipe.totalSodium.toFixed(1)} mg</span>
                                        </div>
                                      )}
                                      {recipe.totalZinc && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Zinc</span>
                                          <span className="font-medium text-slate-800">{recipe.totalZinc.toFixed(2)} mg</span>
                                        </div>
                                      )}
                                      {recipe.totalCopper && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Cuivre</span>
                                          <span className="font-medium text-slate-800">{recipe.totalCopper.toFixed(2)} mg</span>
                                        </div>
                                      )}
                                      {recipe.totalManganese && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Manganèse</span>
                                          <span className="font-medium text-slate-800">{recipe.totalManganese.toFixed(2)} mg</span>
                                        </div>
                                      )}
                                      {recipe.totalSelenium && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Sélénium</span>
                                          <span className="font-medium text-slate-800">{recipe.totalSelenium.toFixed(1)} µg</span>
                                        </div>
                                      )}
                                      {recipe.totalIodine && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Iode</span>
                                          <span className="font-medium text-slate-800">{recipe.totalIodine.toFixed(1)} µg</span>
                                        </div>
                                      )}
                                      {recipe.totalChromium && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Chrome</span>
                                          <span className="font-medium text-slate-800">{recipe.totalChromium.toFixed(1)} µg</span>
                                        </div>
                                      )}
                                      {recipe.totalMolybdenum && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Molybdène</span>
                                          <span className="font-medium text-slate-800">{recipe.totalMolybdenum.toFixed(1)} µg</span>
                                        </div>
                                      )}
                                      {recipe.totalFluoride && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-600">Fluorure</span>
                                          <span className="font-medium text-slate-800">{recipe.totalFluoride.toFixed(2)} mg</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b border-slate-300 pb-2">
                                      Minéraux
                                    </h4>
                                    <p className="text-slate-500 text-sm">
                                      Données non disponibles pour cette recette
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                      </>
                    ) : (
                      <p className="text-slate-500 text-center">
                        Les valeurs nutritionnelles seront calculées automatiquement une fois que les ingrédients auront leurs données nutritionnelles.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite - Ingrédients et étapes */}
            <div>
              {/* Ingrédients */}
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Ingrédients</h3>
              <div className="space-y-2 mb-8">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">{ingredient.ingredient.name}</span>
                    <span className="text-slate-600">
                      {formatQuantity(ingredient.quantity * scalingRatio, ingredient.unit || '')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Étapes */}
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Préparation</h3>
              <div className="space-y-4">
                {recipe.steps.map((step, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-slate-600 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-slate-200 bg-slate-50">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
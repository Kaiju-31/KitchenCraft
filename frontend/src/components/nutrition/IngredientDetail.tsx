import { useState } from 'react';
import { X, Package, Info, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import type { Ingredient, User } from '../../types';
import { BASIC_INGREDIENT_CATEGORIES } from '../../types';
import Button from '../ui/Button';
import { useKeyboard } from '../../hooks/useKeyboard';

interface IngredientDetailProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSync?: () => void;
  ingredient: Ingredient | null;
  user: User | null;
  closeOnOutsideClick?: boolean;
}

export default function IngredientDetail({ isOpen, onClose, onEdit, onDelete, onSync, ingredient, user, closeOnOutsideClick = true }: IngredientDetailProps) {
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);
  
  useKeyboard({
    onEscape: onClose,
    enabled: isOpen
  });

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !ingredient) return null;

  const isAdvancedMode = true; // Toujours afficher les données nutritionnelles pour les ingrédients

  const formatValue = (value: number | undefined | null, unit: string) => {
    if (value === null || value === undefined) return '-';
    return `${value} ${unit}`;
  };

  const getCategoryInfo = (ingredient: Ingredient) => {
    const category = ingredient.basicCategory || ingredient.category;
    return BASIC_INGREDIENT_CATEGORIES.find(cat => cat.value === category) || BASIC_INGREDIENT_CATEGORIES[0];
  };

  const renderNutrientSection = (title: string, nutrients: Array<{label: string, value: number | undefined | null, unit: string}>, forceShow = false) => {
    const hasValues = nutrients.some(n => n.value !== null && n.value !== undefined);
    
    // forceShow = true : affiche toujours la section même sans valeurs (affiche "-" pour les valeurs manquantes)
    // forceShow = false : n'affiche la section que s'il y a au moins une valeur
    if (!hasValues && !forceShow) return null;

    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-2">
          {title}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {nutrients.map((nutrient, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-slate-600">{nutrient.label}</span>
              <span className={`font-medium ${nutrient.value ? 'text-slate-800' : 'text-slate-400'}`}>
                {formatValue(nutrient.value, nutrient.unit)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">{ingredient.name}</h2>
              {ingredient.brand && (
                <p className="text-purple-100 text-sm">{ingredient.brand}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button onClick={onEdit} variant="outline" className="text-white border-white hover:bg-white hover:text-emerald-600">
                Modifier
              </Button>
            )}
            {onSync && ingredient?.barcode && (
              <Button onClick={onSync} variant="outline" className="text-white border-orange-300 hover:bg-orange-500 hover:text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Resync
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
            {/* Informations générales */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-emerald-600" />
                Informations générales
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Catégorie</span>
                  <div className={`px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${getCategoryInfo(ingredient).color} text-white shadow-lg`}>
                    {getCategoryInfo(ingredient).label}
                  </div>
                </div>
                {ingredient.barcode && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Code-barres</span>
                    <span className="font-medium text-slate-800 font-mono">{ingredient.barcode}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Source</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ingredient.dataSource === 'OPENFOODFACTS' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {ingredient.dataSource === 'OPENFOODFACTS' ? 'OpenFoodFacts' : 'Manuel'}
                  </span>
                </div>
                {ingredient.lastSync && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Dernière sync</span>
                    <span className="text-slate-800 text-sm">
                      {new Date(ingredient.lastSync).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Valeurs nutritionnelles */}
            {isAdvancedMode && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Valeurs nutritionnelles (pour 100g)
                </h3>

                {/* Macronutriments */}
                {renderNutrientSection('Macronutriments', [
                  { label: 'Énergie', value: ingredient.energyKcal, unit: 'kcal' },
                  { label: 'Protéines', value: ingredient.protein, unit: 'g' },
                  { label: 'Glucides', value: ingredient.carbohydrates, unit: 'g' },
                  { label: 'dont sucres', value: ingredient.sugars, unit: 'g' },
                  { label: 'Lipides', value: ingredient.fat, unit: 'g' },
                  { label: 'dont saturés', value: ingredient.saturatedFat, unit: 'g' },
                  { label: 'Fibres', value: ingredient.fiber, unit: 'g' },
                  { label: 'Sel', value: ingredient.salt, unit: 'g' }
                ], true)}

                {/* Dropdown pour plus de détails */}
                <div className="mt-6">
                  <button
                    onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
                    className="flex items-center justify-between w-full p-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-200"
                  >
                    <span className="font-medium text-slate-700">Voir plus de détails nutritionnels</span>
                    {showAdvancedDetails ? (
                      <ChevronUp className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
                  
                  {showAdvancedDetails && (
                    <div className="mt-4 space-y-6 animate-in slide-in-from-top-2 duration-300">
                      {/* Vitamines */}
                      {renderNutrientSection('Vitamines', [
                        { label: 'Vitamine A', value: ingredient.vitaminA, unit: 'µg' },
                        { label: 'Vitamine B1', value: ingredient.vitaminB1, unit: 'mg' },
                        { label: 'Vitamine B2', value: ingredient.vitaminB2, unit: 'mg' },
                        { label: 'Vitamine B3', value: ingredient.vitaminB3, unit: 'mg' },
                        { label: 'Vitamine B5', value: ingredient.vitaminB5, unit: 'mg' },
                        { label: 'Vitamine B6', value: ingredient.vitaminB6, unit: 'mg' },
                        { label: 'Vitamine B7', value: ingredient.vitaminB7, unit: 'µg' },
                        { label: 'Vitamine B9', value: ingredient.vitaminB9, unit: 'µg' },
                        { label: 'Vitamine B12', value: ingredient.vitaminB12, unit: 'µg' },
                        { label: 'Vitamine C', value: ingredient.vitaminC, unit: 'mg' },
                        { label: 'Vitamine D', value: ingredient.vitaminD, unit: 'µg' },
                        { label: 'Vitamine E', value: ingredient.vitaminE, unit: 'mg' },
                        { label: 'Vitamine K', value: ingredient.vitaminK, unit: 'µg' }
                      ], true)}

                      {/* Minéraux */}
                      {renderNutrientSection('Minéraux', [
                        { label: 'Calcium', value: ingredient.calcium, unit: 'mg' },
                        { label: 'Fer', value: ingredient.iron, unit: 'mg' },
                        { label: 'Magnésium', value: ingredient.magnesium, unit: 'mg' },
                        { label: 'Phosphore', value: ingredient.phosphorus, unit: 'mg' },
                        { label: 'Potassium', value: ingredient.potassium, unit: 'mg' },
                        { label: 'Sodium', value: ingredient.sodium, unit: 'mg' },
                        { label: 'Zinc', value: ingredient.zinc, unit: 'mg' },
                        { label: 'Cuivre', value: ingredient.copper, unit: 'mg' },
                        { label: 'Manganèse', value: ingredient.manganese, unit: 'mg' },
                        { label: 'Sélénium', value: ingredient.selenium, unit: 'µg' },
                        { label: 'Iode', value: ingredient.iodine, unit: 'µg' },
                        { label: 'Chrome', value: ingredient.chromium, unit: 'µg' },
                        { label: 'Molybdène', value: ingredient.molybdenum, unit: 'µg' },
                        { label: 'Fluorure', value: ingredient.fluoride, unit: 'mg' }
                      ], true)}
                    </div>
                  )}
                </div>
              </div>
            )}
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
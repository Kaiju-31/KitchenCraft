import { X, Package, Info, Trash2 } from 'lucide-react';
import type { FoodItem, User } from '../../types';
import Button from '../ui/Button';
import { useKeyboard } from '../../hooks/useKeyboard';

interface FoodItemDetailProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  foodItem: FoodItem | null;
  user: User | null;
  closeOnOutsideClick?: boolean;
}

export default function FoodItemDetail({ isOpen, onClose, onEdit, onDelete, foodItem, user, closeOnOutsideClick = true }: FoodItemDetailProps) {
  useKeyboard({
    onEscape: onClose,
    enabled: isOpen
  });

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !foodItem) return null;

  const isAdvancedMode = user?.advancedMode || false;

  const formatValue = (value: number | undefined | null, unit: string) => {
    if (value === null || value === undefined) return '-';
    return `${value} ${unit}`;
  };

  const renderNutrientSection = (title: string, nutrients: Array<{label: string, value: number | undefined | null, unit: string}>) => {
    const hasValues = nutrients.some(n => n.value !== null && n.value !== undefined);
    if (!hasValues) return null;

    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-2">
          {title}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {nutrients.map((nutrient, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-slate-600">{nutrient.label}</span>
              <span className="font-medium text-slate-800">
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
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">{foodItem.name}</h2>
              {foodItem.brand && (
                <p className="text-purple-100 text-sm">{foodItem.brand}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button onClick={onEdit} variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
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
            {/* Informations générales */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-purple-600" />
                Informations générales
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-600">Catégorie</span>
                  <span className="font-medium text-slate-800">{foodItem.basicCategory}</span>
                </div>
                {foodItem.barcode && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Code-barres</span>
                    <span className="font-medium text-slate-800 font-mono">{foodItem.barcode}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Source</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    foodItem.dataSource === 'OPENFOODFACTS' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {foodItem.dataSource === 'OPENFOODFACTS' ? 'OpenFoodFacts' : 'Manuel'}
                  </span>
                </div>
                {foodItem.lastSync && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Dernière sync</span>
                    <span className="text-slate-800 text-sm">
                      {new Date(foodItem.lastSync).toLocaleDateString('fr-FR')}
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
                  { label: 'Énergie', value: foodItem.energyKcal, unit: 'kcal' },
                  { label: 'Glucides', value: foodItem.carbohydrates, unit: 'g' },
                  { label: 'Sucres', value: foodItem.sugars, unit: 'g' },
                  { label: 'Lipides', value: foodItem.fat, unit: 'g' },
                  { label: 'Graisses saturées', value: foodItem.saturatedFat, unit: 'g' },
                  { label: 'Protéines', value: foodItem.protein, unit: 'g' },
                  { label: 'Fibres', value: foodItem.fiber, unit: 'g' },
                  { label: 'Sel', value: foodItem.salt, unit: 'g' }
                ])}

                {/* Vitamines */}
                {renderNutrientSection('Vitamines', [
                  { label: 'Vitamine A', value: foodItem.vitaminA, unit: 'µg' },
                  { label: 'Vitamine B1', value: foodItem.vitaminB1, unit: 'mg' },
                  { label: 'Vitamine B2', value: foodItem.vitaminB2, unit: 'mg' },
                  { label: 'Vitamine B3', value: foodItem.vitaminB3, unit: 'mg' },
                  { label: 'Vitamine B6', value: foodItem.vitaminB6, unit: 'mg' },
                  { label: 'Vitamine B9', value: foodItem.vitaminB9, unit: 'µg' },
                  { label: 'Vitamine B12', value: foodItem.vitaminB12, unit: 'µg' },
                  { label: 'Vitamine C', value: foodItem.vitaminC, unit: 'mg' },
                  { label: 'Vitamine D', value: foodItem.vitaminD, unit: 'µg' },
                  { label: 'Vitamine E', value: foodItem.vitaminE, unit: 'mg' },
                  { label: 'Vitamine K', value: foodItem.vitaminK, unit: 'µg' }
                ])}

                {/* Minéraux */}
                {renderNutrientSection('Minéraux', [
                  { label: 'Calcium', value: foodItem.calcium, unit: 'mg' },
                  { label: 'Fer', value: foodItem.iron, unit: 'mg' },
                  { label: 'Magnésium', value: foodItem.magnesium, unit: 'mg' },
                  { label: 'Phosphore', value: foodItem.phosphorus, unit: 'mg' },
                  { label: 'Potassium', value: foodItem.potassium, unit: 'mg' },
                  { label: 'Zinc', value: foodItem.zinc, unit: 'mg' },
                  { label: 'Cuivre', value: foodItem.copper, unit: 'mg' },
                  { label: 'Manganèse', value: foodItem.manganese, unit: 'mg' },
                  { label: 'Sélénium', value: foodItem.selenium, unit: 'µg' },
                  { label: 'Iode', value: foodItem.iodine, unit: 'µg' }
                ])}
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
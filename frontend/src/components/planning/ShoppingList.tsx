import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Check, ShoppingCart, AlertCircle } from 'lucide-react';
import type { ShoppingListItem, ShoppingListByCategory } from '../../types';
import { INGREDIENT_CATEGORIES } from '../../types';
import Button from '../ui/Button';

interface ShoppingListProps {
  items: ShoppingListItem[];
  onUpdateItem: (itemId: number, update: { quantityOwned: number; isChecked: boolean; isValidated: boolean }) => Promise<void>;
  mode: 'validation' | 'shopping';
  onModeChange: (mode: 'validation' | 'shopping') => void;
}

export default function ShoppingList({ items, onUpdateItem, mode, onModeChange }: ShoppingListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const itemsByCategory = useMemo((): ShoppingListByCategory[] => {
    const categoryMap = new Map<string, ShoppingListItem[]>();
    
    // Filtrer les articles selon le mode
    const filteredItems = items.filter(item => {
      if (mode === 'shopping') {
        // En mode shopping, ne montrer que les articles où quantityOwned < quantityNeeded
        return item.quantityOwned < item.quantityNeeded;
      }
      // En mode validation, montrer tous les articles
      return true;
    });
    
    filteredItems.forEach(item => {
      const category = item.ingredient.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)?.push(item);
    });

    return Array.from(categoryMap.entries()).map(([category, categoryItems]) => ({
      category,
      items: categoryItems.sort((a, b) => a.ingredient.name.localeCompare(b.ingredient.name)),
      totalItems: categoryItems.length,
      checkedItems: categoryItems.filter(item => item.isChecked).length,
    })).sort((a, b) => {
      // Trier par ordre des catégories prédéfinies
      const orderA = INGREDIENT_CATEGORIES.findIndex(cat => cat.value === a.category);
      const orderB = INGREDIENT_CATEGORIES.findIndex(cat => cat.value === b.category);
      return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB);
    });
  }, [items, mode]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryColor = (category: string) => {
    return INGREDIENT_CATEGORIES.find(cat => cat.value === category)?.color || 'from-slate-500 to-slate-600';
  };

  const handleQuantityChange = async (item: ShoppingListItem, newQuantity: number) => {
    await onUpdateItem(item.id, {
      quantityOwned: newQuantity,
      isChecked: item.isChecked,
      isValidated: item.isValidated,
    });
  };

  const handleCheckChange = async (item: ShoppingListItem, checked: boolean) => {
    await onUpdateItem(item.id, {
      quantityOwned: item.quantityOwned,
      isChecked: checked,
      isValidated: item.isValidated,
    });
  };

  const handleValidateAll = async () => {
    const promises = items.map(item => 
      onUpdateItem(item.id, {
        quantityOwned: item.quantityOwned,
        isChecked: item.isChecked,
        isValidated: true,
      })
    );
    await Promise.all(promises);
  };

  const totalStats = useMemo(() => {
    const total = items.length;
    const validated = items.filter(item => item.isValidated).length;
    const checked = items.filter(item => item.isChecked).length;
    // Pour toBuy, utiliser la même logique de filtrage qu'en mode shopping
    const toBuy = items.filter(item => item.quantityOwned < item.quantityNeeded).length;
    const checkedToBuy = items.filter(item => item.quantityOwned < item.quantityNeeded && item.isChecked).length;
    
    return { total, validated, checked, toBuy, checkedToBuy };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* En-tête avec mode et statistiques */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">Liste de courses</h3>
          <p className="text-slate-600 text-sm">
            {mode === 'validation' ? 
              `${totalStats.total} articles à valider` : 
              `${totalStats.toBuy} articles à acheter (${totalStats.checkedToBuy} cochés)`
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={mode === 'validation' ? 'primary' : 'ghost'}
            onClick={() => onModeChange('validation')}
            size="sm"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Validation
          </Button>
          <Button
            variant={mode === 'shopping' ? 'primary' : 'ghost'}
            onClick={() => onModeChange('shopping')}
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Courses
          </Button>
        </div>
      </div>

      {/* Actions globales */}
      {mode === 'validation' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-amber-800">Phase de validation</h4>
              <p className="text-sm text-amber-700">
                Renseignez les quantités que vous possédez déjà pour recalculer automatiquement ce qu'il faut acheter.
              </p>
            </div>
            <Button
              onClick={handleValidateAll}
              className="bg-amber-600 hover:bg-amber-700 text-white"
              size="sm"
            >
              Tout valider
            </Button>
          </div>
        </div>
      )}

      {mode === 'shopping' && totalStats.total > totalStats.toBuy && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div>
            <h4 className="font-medium text-green-800">Articles disponibles</h4>
            <p className="text-sm text-green-700">
              {totalStats.total - totalStats.toBuy} article{totalStats.total - totalStats.toBuy > 1 ? 's' : ''} 
              {totalStats.total - totalStats.toBuy > 1 ? ' sont déjà disponibles' : ' est déjà disponible'} 
              en quantité suffisante et {totalStats.total - totalStats.toBuy > 1 ? 'ne sont' : 'n\'est'} donc pas 
              {totalStats.total - totalStats.toBuy > 1 ? ' affichés' : ' affiché'} dans cette liste de courses.
            </p>
          </div>
        </div>
      )}

      {/* Liste par catégories */}
      <div className="space-y-4">
        {itemsByCategory.map((categoryGroup) => (
          <div key={categoryGroup.category} className="bg-white rounded-xl shadow-lg border border-slate-200">
            {/* En-tête de catégorie */}
            <button
              onClick={() => toggleCategory(categoryGroup.category)}
              className="w-full p-4 flex justify-between items-center hover:bg-slate-50 transition-colors rounded-t-xl"
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getCategoryColor(categoryGroup.category)}`} />
                <span className="font-semibold text-slate-800">{categoryGroup.category}</span>
                <span className="text-sm text-slate-500">
                  ({categoryGroup.totalItems} article{categoryGroup.totalItems > 1 ? 's' : ''})
                </span>
                {mode === 'shopping' && categoryGroup.checkedItems > 0 && (
                  <span className="text-sm text-green-600 font-medium">
                    {categoryGroup.checkedItems}/{categoryGroup.totalItems} ✓
                  </span>
                )}
              </div>
              
              {expandedCategories.has(categoryGroup.category) ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {/* Items de la catégorie */}
            {expandedCategories.has(categoryGroup.category) && (
              <div className="border-t border-slate-200">
                {categoryGroup.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 border-b border-slate-100 last:border-b-0 ${
                      item.isChecked ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {mode === 'shopping' && (
                          <button
                            onClick={() => handleCheckChange(item, !item.isChecked)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              item.isChecked 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-slate-300 hover:border-green-400'
                            }`}
                          >
                            {item.isChecked && <Check className="w-4 h-4" />}
                          </button>
                        )}
                        
                        <div className="flex-1">
                          <p className={`font-medium ${item.isChecked ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                            {item.ingredient.name}
                          </p>
                          <div className="text-sm text-slate-600 flex gap-4">
                            <span>Nécessaire: {item.quantityNeeded} {item.unit}</span>
                            {mode === 'validation' && (
                              <span>Possédé: {item.quantityOwned} {item.unit}</span>
                            )}
                            <span className={`font-medium ${item.quantityToBuy > 0 ? 'text-purple-600' : 'text-green-600'}`}>
                              À acheter: {item.quantityToBuy} {item.unit}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Input pour quantité possédée en mode validation */}
                      {mode === 'validation' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={item.quantityOwned}
                            onChange={(e) => handleQuantityChange(item, parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-purple-500"
                            min="0"
                            step="0.1"
                          />
                          <span className="text-xs text-slate-500">{item.unit}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Statistiques en bas */}
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalStats.total}</p>
            <p className="text-sm text-slate-600">Total articles</p>
          </div>
          {mode === 'validation' && (
            <div>
              <p className="text-2xl font-bold text-amber-600">{totalStats.validated}</p>
              <p className="text-sm text-slate-600">Validés</p>
            </div>
          )}
          <div>
            <p className="text-2xl font-bold text-purple-600">{totalStats.toBuy}</p>
            <p className="text-sm text-slate-600">À acheter</p>
          </div>
          {mode === 'shopping' && (
            <div>
              <p className="text-2xl font-bold text-green-600">{totalStats.checked}</p>
              <p className="text-sm text-slate-600">Cochés</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
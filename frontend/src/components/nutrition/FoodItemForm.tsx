import { useState, useEffect } from 'react';
import { Search, Scan, Save, X, Plus } from 'lucide-react';
import type { FoodItem, User } from '../../types';
import { BASIC_INGREDIENT_CATEGORIES } from '../../types';
import Button from '../ui/Button';
import BarcodeScanner from './BarcodeScanner';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useFoodItems } from '../../hooks/useFoodItems';

interface FoodItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (foodItem: Partial<FoodItem>) => void;
  user: User | null;
  initialData?: Partial<FoodItem>;
}

type FormTab = 'basic' | 'macros' | 'vitamins' | 'minerals';

export default function FoodItemForm({ isOpen, onClose, onSave, user, initialData }: FoodItemFormProps) {
  const { searchByBarcode, foodItems } = useFoodItems();
  const [activeTab, setActiveTab] = useState<FormTab>('basic');
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<FoodItem>>({
    name: '',
    brand: '',
    barcode: '',
    basicCategory: 'Autres',
    category: '',
    dataSource: 'MANUAL',
    // Toutes les valeurs nutritionnelles sont optionnelles (nullable)
  });

  const isAdvancedMode = user?.advancedMode || false;
  const categories = BASIC_INGREDIENT_CATEGORIES;

  // Effect pour pré-remplir le formulaire avec les données existantes
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        name: initialData.name || '',
        brand: initialData.brand || '',
        barcode: initialData.barcode || '',
        basicCategory: initialData.basicCategory || 'Autres',
        category: initialData.category || '',
        dataSource: initialData.dataSource || 'MANUAL',
        // Macronutriments
        energyKcal: initialData.energyKcal || undefined,
        carbohydrates: initialData.carbohydrates || undefined,
        sugars: initialData.sugars || undefined,
        fat: initialData.fat || undefined,
        saturatedFat: initialData.saturatedFat || undefined,
        protein: initialData.protein || undefined,
        fiber: initialData.fiber || undefined,
        salt: initialData.salt || undefined,
        // Vitamines
        vitaminA: initialData.vitaminA || undefined,
        vitaminB1: initialData.vitaminB1 || undefined,
        vitaminB2: initialData.vitaminB2 || undefined,
        vitaminB3: initialData.vitaminB3 || undefined,
        vitaminB6: initialData.vitaminB6 || undefined,
        vitaminB9: initialData.vitaminB9 || undefined,
        vitaminB12: initialData.vitaminB12 || undefined,
        vitaminC: initialData.vitaminC || undefined,
        vitaminD: initialData.vitaminD || undefined,
        vitaminE: initialData.vitaminE || undefined,
        vitaminK: initialData.vitaminK || undefined,
        // Minéraux
        calcium: initialData.calcium || undefined,
        iron: initialData.iron || undefined,
        magnesium: initialData.magnesium || undefined,
        phosphorus: initialData.phosphorus || undefined,
        potassium: initialData.potassium || undefined,
        zinc: initialData.zinc || undefined,
        copper: initialData.copper || undefined,
        manganese: initialData.manganese || undefined,
        selenium: initialData.selenium || undefined,
        iodine: initialData.iodine || undefined
      });
    } else if (!initialData && isOpen) {
      // Reset du formulaire si pas de données initiales
      setFormData({
        name: '',
        brand: '',
        barcode: '',
        basicCategory: 'Autres',
        category: '',
        dataSource: 'MANUAL'
      });
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    if (!formData.name?.trim()) {
      setError('Le nom du produit est obligatoire');
      return;
    }

    if (!formData.basicCategory) {
      setError('La catégorie de base est obligatoire');
      return;
    }

    onSave(formData);
    onClose();
  };

  useKeyboard({
    onEnter: handleSave,
    onEscape: onClose,
    enabled: isOpen && !showScanner
  });

  useEffect(() => {
    if (isOpen) {
      // Toujours ouvrir sur l'onglet "Informations"
      setActiveTab('basic');
      
      if (initialData) {
        setFormData({ ...formData, ...initialData });
      } else {
        // Reset form
        setFormData({
          name: '',
          brand: '',
          barcode: '',
          basicCategory: 'Autres',
          category: '',
          dataSource: 'MANUAL',
        });
      }
    }
  }, [isOpen, initialData]);

  const handleInputChange = (field: keyof FoodItem, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? null : value
    }));
  };

  const handleBarcodeScanned = async (barcode: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. D'abord chercher en base locale
      const localFoodItem = foodItems.find(item => item.barcode === barcode);
      
      if (localFoodItem) {
        // Trouvé en base locale - afficher comme pour la recherche
        setFormData(localFoodItem);
        setActiveTab('basic');
        setError(null);
        setLoading(false);
        return;
      }
      
      // 2. Si pas trouvé en local, rechercher via OpenFoodFacts
      const foodItem = await searchByBarcode(barcode);
      
      if (foodItem) {
        setFormData(foodItem);
        setActiveTab('basic');
      } else {
        // Produit non trouvé nulle part - proposer la saisie manuelle
        setFormData(prev => ({
          ...prev,
          barcode,
          dataSource: 'MANUAL'
        }));
        setError('Produit non trouvé ni en base locale ni dans OpenFoodFacts. Vous pouvez le saisir manuellement.');
      }
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      setError('Erreur lors de la recherche. Vous pouvez saisir les informations manuellement.');
      setFormData(prev => ({
        ...prev,
        barcode,
        dataSource: 'MANUAL'
      }));
    }
    
    setLoading(false);
  };

  // Onglets selon le mode utilisateur
  const baseTabs = [
    { id: 'basic' as FormTab, label: 'Informations', icon: Search }
  ];
  
  const advancedTabs = [
    { id: 'basic' as FormTab, label: 'Informations', icon: Search },
    { id: 'macros' as FormTab, label: 'Macronutriments', icon: Plus },
    { id: 'vitamins' as FormTab, label: 'Vitamines', icon: Plus },
    { id: 'minerals' as FormTab, label: 'Minéraux', icon: Plus }
  ];
  
  const tabs = isAdvancedMode ? advancedTabs : baseTabs;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">
              {initialData ? 'Modifier l\'article' : 'Nouvel article alimentaire'}
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScanner(true)}
                className="flex items-center"
              >
                <Scan className="w-4 h-4 mr-2" />
                Scanner
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tabs - seulement si mode avancé ou onglet de base */}
          {isAdvancedMode && (
            <div className="border-b border-slate-200">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600 bg-purple-50'
                        : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2 inline" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-slate-600">Recherche en cours...</p>
              </div>
            )}

            {!loading && (
              <div className="space-y-4">
                {/* Onglet Informations de base - toujours affiché en mode basique */}
                {(activeTab === 'basic' || !isAdvancedMode) && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nom du produit *
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ex: Pomme Golden"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Marque
                      </label>
                      <input
                        type="text"
                        value={formData.brand || ''}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ex: Carrefour"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Code-barres
                      </label>
                      <input
                        type="text"
                        value={formData.barcode || ''}
                        onChange={(e) => handleInputChange('barcode', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ex: 3245412345678"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Catégorie de base *
                      </label>
                      <select
                        value={formData.basicCategory || 'Autres'}
                        onChange={(e) => handleInputChange('basicCategory', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {categories.filter(cat => cat.value !== 'Tous').map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>
                )}

                {/* Onglet Macronutriments - seulement en mode avancé */}
                {isAdvancedMode && activeTab === 'macros' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Énergie (kcal)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.energyKcal || ''}
                        onChange={(e) => handleInputChange('energyKcal', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Glucides (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.carbohydrates || ''}
                        onChange={(e) => handleInputChange('carbohydrates', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Sucres (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.sugars || ''}
                        onChange={(e) => handleInputChange('sugars', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Lipides (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.fat || ''}
                        onChange={(e) => handleInputChange('fat', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Graisses saturées (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.saturatedFat || ''}
                        onChange={(e) => handleInputChange('saturatedFat', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Protéines (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.protein || ''}
                        onChange={(e) => handleInputChange('protein', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Fibres (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.fiber || ''}
                        onChange={(e) => handleInputChange('fiber', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Onglet Vitamines - seulement en mode avancé */}
                {isAdvancedMode && activeTab === 'vitamins' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vitamine A (µg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.vitaminA || ''}
                        onChange={(e) => handleInputChange('vitaminA', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vitamine B1 (mg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.vitaminB1 || ''}
                        onChange={(e) => handleInputChange('vitaminB1', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vitamine B2 (mg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.vitaminB2 || ''}
                        onChange={(e) => handleInputChange('vitaminB2', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vitamine B3 (mg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.vitaminB3 || ''}
                        onChange={(e) => handleInputChange('vitaminB3', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vitamine B5 (mg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.vitaminB5 || ''}
                        onChange={(e) => handleInputChange('vitaminB5', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vitamine B6 (mg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.vitaminB6 || ''}
                        onChange={(e) => handleInputChange('vitaminB6', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vitamine B7 (µg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.vitaminB7 || ''}
                        onChange={(e) => handleInputChange('vitaminB7', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vitamine B9 (µg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.vitaminB9 || ''}
                        onChange={(e) => handleInputChange('vitaminB9', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vitamine B12 (µg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.vitaminB12 || ''}
                        onChange={(e) => handleInputChange('vitaminB12', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vitamine C (mg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.vitaminC || ''}
                        onChange={(e) => handleInputChange('vitaminC', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vitamine D (µg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.vitaminD || ''}
                        onChange={(e) => handleInputChange('vitaminD', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vitamine E (mg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.vitaminE || ''}
                        onChange={(e) => handleInputChange('vitaminE', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vitamine K (µg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.vitaminK || ''}
                        onChange={(e) => handleInputChange('vitaminK', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Onglet Minéraux - seulement en mode avancé */}
                {isAdvancedMode && activeTab === 'minerals' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Sel (g)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.salt || ''}
                        onChange={(e) => handleInputChange('salt', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Sodium (mg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.sodium || ''}
                        onChange={(e) => handleInputChange('sodium', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Calcium (mg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.calcium || ''}
                        onChange={(e) => handleInputChange('calcium', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Fer (mg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.iron || ''}
                        onChange={(e) => handleInputChange('iron', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Magnésium (mg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.magnesium || ''}
                        onChange={(e) => handleInputChange('magnesium', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phosphore (mg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.phosphorus || ''}
                        onChange={(e) => handleInputChange('phosphorus', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Potassium (mg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.potassium || ''}
                        onChange={(e) => handleInputChange('potassium', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Zinc (mg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.zinc || ''}
                        onChange={(e) => handleInputChange('zinc', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Cuivre (mg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.copper || ''}
                        onChange={(e) => handleInputChange('copper', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Manganèse (mg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.manganese || ''}
                        onChange={(e) => handleInputChange('manganese', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Sélénium (µg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.selenium || ''}
                        onChange={(e) => handleInputChange('selenium', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Iode (µg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.iodine || ''}
                        onChange={(e) => handleInputChange('iodine', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Chrome (µg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.chromium || ''}
                        onChange={(e) => handleInputChange('chromium', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Molybdène (µg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.molybdenum || ''}
                        onChange={(e) => handleInputChange('molybdenum', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Fluor (mg)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.fluoride || ''}
                        onChange={(e) => handleInputChange('fluoride', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-slate-200">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={loading} className="flex items-center">
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        </div>
      </div>

      {/* Scanner de code-barres */}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanResult={handleBarcodeScanned}
        closeOnOutsideClick={true}
      />
    </>
  );
}
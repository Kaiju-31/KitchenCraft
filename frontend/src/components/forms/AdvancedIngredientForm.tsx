import { useState, useEffect } from 'react';
import { Search, Scan, Save, X, Plus } from 'lucide-react';
import type { Ingredient, User } from '../../types';
import { BASIC_INGREDIENT_CATEGORIES } from '../../types';
import Button from '../ui/Button';
import BarcodeScanner from '../nutrition/BarcodeScanner';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useIngredients } from '../../hooks/useIngredients';

interface AdvancedIngredientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ingredient: Partial<Ingredient>) => void;
  user: User | null;
  initialData?: Partial<Ingredient>;
}

type FormTab = 'basic' | 'macros' | 'vitamins' | 'minerals';

export default function AdvancedIngredientForm({ isOpen, onClose, onSave, user, initialData }: AdvancedIngredientFormProps) {
  const { searchByBarcode } = useIngredients();
  const [activeTab, setActiveTab] = useState<FormTab>('basic');
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Ingredient>>({
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

  // Mettre à jour le formulaire avec les données initiales
  useEffect(() => {
    console.log('🔥 AdvancedIngredientForm - initialData:', initialData);
    if (initialData) {
      const newFormData = { 
        ...initialData,
        // S'assurer que les champs obligatoires ont des valeurs par défaut
        name: initialData.name || '',
        basicCategory: initialData.basicCategory || 'Autres',
        dataSource: initialData.dataSource || 'MANUAL'
      };
      console.log('🔥 Setting formData:', newFormData);
      setFormData(newFormData);
    } else {
      setFormData({
        name: '',
        brand: '',
        barcode: '',
        basicCategory: 'Autres',
        category: '',
        dataSource: 'MANUAL',
      });
    }
  }, [initialData, isOpen]);

  // Raccourcis clavier
  useKeyboard({
    onEnter: () => !loading && handleSave(),
    onEscape: () => !loading && onClose(),
    enabled: isOpen && !showScanner
  });

  const handleSave = () => {
    if (!formData.name?.trim()) {
      setError('Le nom du produit est obligatoire');
      return;
    }

    if (!formData.basicCategory) {
      setError('La catégorie de base est obligatoire');
      return;
    }

    setError(null);
    onSave(formData);
  };

  const handleBarcodeResult = async (barcode: string) => {
    setShowScanner(false);
    setLoading(true);
    setError(null);

    try {
      const ingredient = await searchByBarcode(barcode);
      if (ingredient) {
        setFormData(ingredient);
        setActiveTab('basic');
      } else {
        setFormData(prev => ({ ...prev, barcode }));
        setError('Produit non trouvé dans OpenFoodFacts. Vous pouvez saisir les informations manuellement.');
      }
    } catch (error) {
      console.error('Erreur scan:', error);
      setFormData(prev => ({ ...prev, barcode }));
      setError('Erreur lors de la recherche. Vous pouvez saisir les informations manuellement.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Ingredient, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleNumberChange = (field: keyof Ingredient, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    handleInputChange(field, numValue);
  };

  // Helper pour afficher les valeurs numériques 
  const getNumberValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    return value.toString();
  };

  const tabs = [
    { id: 'basic' as FormTab, label: 'Informations de base', icon: Plus },
    { id: 'macros' as FormTab, label: 'Macronutriments', icon: Save },
    { id: 'vitamins' as FormTab, label: 'Vitamines', icon: Search },
    { id: 'minerals' as FormTab, label: 'Minéraux', icon: Scan }
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <h2 className="text-xl font-bold">
              {initialData?.id ? 'Modifier l\'ingrédient' : 'Nouvel ingrédient'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          {isAdvancedMode && (
            <div className="flex border-b border-slate-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  disabled={loading}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {loading && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                Recherche en cours...
              </div>
            )}

            {/* Basic Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                {/* Barcode Scanner */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Code-barres
                    </label>
                    <input
                      type="text"
                      value={formData.barcode || ''}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 font-mono"
                      placeholder="Scanner ou saisir manuellement"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <Button
                      onClick={() => setShowScanner(true)}
                      variant="outline"
                      disabled={loading}
                      className="h-12 px-4"
                    >
                      <Scan className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    placeholder="Ex: Tomate cerise"
                    disabled={loading}
                    required
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Marque
                  </label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    placeholder="Ex: Bonduelle"
                    disabled={loading}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={formData.basicCategory || ''}
                    onChange={(e) => handleInputChange('basicCategory', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                    required
                  >
                    {categories.slice(1).map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Macros Tab */}
            {activeTab === 'macros' && isAdvancedMode && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Énergie (kcal)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.energyKcal)}
                    onChange={(e) => handleNumberChange('energyKcal', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Glucides (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.carbohydrates)}
                    onChange={(e) => handleNumberChange('carbohydrates', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sucres (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.sugars)}
                    onChange={(e) => handleNumberChange('sugars', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Lipides (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.fat)}
                    onChange={(e) => handleNumberChange('fat', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Graisses saturées (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.saturatedFat)}
                    onChange={(e) => handleNumberChange('saturatedFat', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Protéines (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.protein)}
                    onChange={(e) => handleNumberChange('protein', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fibres (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.fiber)}
                    onChange={(e) => handleNumberChange('fiber', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sel (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.salt)}
                    onChange={(e) => handleNumberChange('salt', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Vitamins Tab */}
            {activeTab === 'vitamins' && isAdvancedMode && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vitamine A (µg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.vitaminA)}
                    onChange={(e) => handleNumberChange('vitaminA', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vitamine B1 (mg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.vitaminB1)}
                    onChange={(e) => handleNumberChange('vitaminB1', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vitamine B2 (mg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.vitaminB2)}
                    onChange={(e) => handleNumberChange('vitaminB2', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vitamine B3 (mg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.vitaminB3)}
                    onChange={(e) => handleNumberChange('vitaminB3', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vitamine B5 (mg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.vitaminB5)}
                    onChange={(e) => handleNumberChange('vitaminB5', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vitamine B6 (mg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.vitaminB6)}
                    onChange={(e) => handleNumberChange('vitaminB6', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vitamine B7/Biotine (µg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.vitaminB7)}
                    onChange={(e) => handleNumberChange('vitaminB7', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vitamine B9/Folate (µg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.vitaminB9)}
                    onChange={(e) => handleNumberChange('vitaminB9', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vitamine B12 (µg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.vitaminB12)}
                    onChange={(e) => handleNumberChange('vitaminB12', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vitamine C (mg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.vitaminC)}
                    onChange={(e) => handleNumberChange('vitaminC', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vitamine D (µg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.vitaminD)}
                    onChange={(e) => handleNumberChange('vitaminD', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vitamine E (mg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.vitaminE)}
                    onChange={(e) => handleNumberChange('vitaminE', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vitamine K (µg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.vitaminK)}
                    onChange={(e) => handleNumberChange('vitaminK', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Minerals Tab */}
            {activeTab === 'minerals' && isAdvancedMode && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Calcium (mg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.calcium)}
                    onChange={(e) => handleNumberChange('calcium', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fer (mg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.iron)}
                    onChange={(e) => handleNumberChange('iron', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Magnésium (mg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.magnesium)}
                    onChange={(e) => handleNumberChange('magnesium', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phosphore (mg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.phosphorus)}
                    onChange={(e) => handleNumberChange('phosphorus', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Potassium (mg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.potassium)}
                    onChange={(e) => handleNumberChange('potassium', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Zinc (mg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.zinc)}
                    onChange={(e) => handleNumberChange('zinc', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cuivre (mg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.copper)}
                    onChange={(e) => handleNumberChange('copper', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Manganèse (mg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.manganese)}
                    onChange={(e) => handleNumberChange('manganese', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sélénium (µg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.selenium)}
                    onChange={(e) => handleNumberChange('selenium', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Iode (µg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.iodine)}
                    onChange={(e) => handleNumberChange('iodine', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Chrome (µg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.chromium)}
                    onChange={(e) => handleNumberChange('chromium', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Molybdène (µg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.molybdenum)}
                    onChange={(e) => handleNumberChange('molybdenum', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fluorure (mg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={getNumberValue(formData.fluoride)}
                    onChange={(e) => handleNumberChange('fluoride', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 force:ring-emerald-500/20 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              variant="success"
              onClick={handleSave}
              disabled={loading || !formData.name?.trim()}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScanResult={handleBarcodeResult}
        />
      )}
    </>
  );
}
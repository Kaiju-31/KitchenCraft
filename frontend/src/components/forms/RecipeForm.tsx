import { useState } from 'react';
import { ArrowLeft, ChefHat, Plus, Trash2, Edit } from 'lucide-react';
import type { Recipe, Ingredient, RecipeRequest } from '../../types';
import { RECIPE_TYPES } from '../../types';
import { STANDARD_UNITS } from '../../utils/quantityUtils';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import IngredientAutocomplete from './IngredientAutocomplete';
import NewIngredientModal from './NewIngredientModal';
import useKeyboard from '../../hooks/useKeyboard';

interface RecipeFormProps {
  recipe?: Recipe;
  ingredients: Ingredient[];
  loadIngredients: () => Promise<void>;
  onSubmit: (data: RecipeRequest) => Promise<void>;
  onCancel: () => void;
}

interface FormIngredient {
  ingredient: Ingredient;
  quantity: number;
  unit: string;
}

export default function RecipeForm({
  recipe,
  ingredients,
  loadIngredients,
  onSubmit,
  onCancel
}: RecipeFormProps) {
  const [formData, setFormData] = useState({
    name: recipe?.name || '',
    description: recipe?.description || '',
    type: recipe?.type || 'Entrée',
    preparationTime: recipe?.preparationTime || 30,
    cookingTime: recipe?.cookingTime || 0,
    restTime: recipe?.restTime || 0,
    person: recipe?.person || 4,
    origin: recipe?.origin || '',
    isBabyFriendly: recipe?.isBabyFriendly || false,
    steps: recipe?.steps || ['']
  });

  const [formIngredients, setFormIngredients] = useState<FormIngredient[]>(
    recipe?.ingredients.map(ri => ({
      ingredient: ri.ingredient,
      quantity: ri.quantity,
      unit: ri.unit
    })) || []
  );

  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [ingredientUnit, setIngredientUnit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // État pour l'édition en place des ingrédients
  const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('');
  
  // État pour la création de nouveaux ingrédients
  const [showNewIngredientModal, setShowNewIngredientModal] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [pendingIngredientName, setPendingIngredientName] = useState('');

  // Raccourcis clavier globaux pour le formulaire
  useKeyboard({
    onEscape: onCancel,
    enabled: !showIngredientModal && !showNewIngredientModal && editingIngredientIndex === null
  });

  const addIngredient = () => {
    if (!selectedIngredient || !ingredientQuantity.trim() || !ingredientUnit.trim()) return;

    const quantity = parseFloat(ingredientQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Veuillez entrer une quantité valide');
      return;
    }

    const newIngredient: FormIngredient = {
      ingredient: selectedIngredient,
      quantity,
      unit: ingredientUnit.trim()
    };

    const existingIndex = formIngredients.findIndex(
      ri => ri.ingredient.id === selectedIngredient.id
    );

    if (existingIndex !== -1) {
      const updatedIngredients = [...formIngredients];
      updatedIngredients[existingIndex] = newIngredient;
      setFormIngredients(updatedIngredients);
    } else {
      setFormIngredients([...formIngredients, newIngredient]);
    }

    setShowIngredientModal(false);
    setSelectedIngredient(null);
    setIngredientQuantity('');
    setIngredientUnit('');
  };

  const removeIngredient = (ingredientId: number) => {
    setFormIngredients(formIngredients.filter(ri => ri.ingredient.id !== ingredientId));
  };

  // Fonctions pour l'édition en place des ingrédients
  const startEditIngredient = (index: number) => {
    const ingredient = formIngredients[index];
    setEditingIngredientIndex(index);
    setEditQuantity(ingredient.quantity.toString());
    setEditUnit(ingredient.unit);
  };

  const saveIngredientEdit = () => {
    if (editingIngredientIndex === null) return;

    const quantity = parseFloat(editQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Veuillez entrer une quantité valide');
      return;
    }

    if (!editUnit.trim()) {
      alert('Veuillez sélectionner une unité');
      return;
    }

    const updatedIngredients = [...formIngredients];
    updatedIngredients[editingIngredientIndex] = {
      ...updatedIngredients[editingIngredientIndex],
      quantity,
      unit: editUnit
    };

    setFormIngredients(updatedIngredients);
    cancelIngredientEdit();
  };

  const cancelIngredientEdit = () => {
    setEditingIngredientIndex(null);
    setEditQuantity('');
    setEditUnit('');
  };

  // Gestion de la touche Échap pour annuler l'édition
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      cancelIngredientEdit();
    } else if (e.key === 'Enter') {
      saveIngredientEdit();
    }
  };

  // Fonctions pour la création de nouveaux ingrédients
  const handleNewIngredientRequest = (name: string) => {
    setPendingIngredientName(name);
    // Ne plus ouvrir automatiquement le modal, on stocke juste le nom
  };

  const confirmCreateNewIngredient = () => {
    setNewIngredientName(pendingIngredientName);
    setShowNewIngredientModal(true);
    setPendingIngredientName('');
  };

  const handleCreateNewIngredient = (newIngredient: Ingredient) => {
    setSelectedIngredient(newIngredient);
    setShowNewIngredientModal(false);
    setNewIngredientName('');
    // L'ingrédient sera ajouté automatiquement grâce à selectedIngredient
  };

  const handleCloseNewIngredientModal = () => {
    setShowNewIngredientModal(false);
    setNewIngredientName('');
    setPendingIngredientName('');
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const addStep = () => {
    setFormData({ ...formData, steps: [...formData.steps, ''] });
  };

  const removeStep = (index: number) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index);
      setFormData({ ...formData, steps: newSteps });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Veuillez remplir le nom et la description');
      return;
    }

    if (formIngredients.length === 0) {
      alert('Veuillez ajouter au moins un ingrédient');
      return;
    }

    const validSteps = formData.steps.filter(step => step.trim());
    if (validSteps.length === 0) {
      alert('Veuillez ajouter au moins une étape');
      return;
    }

    setIsSubmitting(true);
    try {
      const recipeRequest: RecipeRequest = {
        ...formData,
        steps: validSteps,
        ingredients: formIngredients.map(fi => ({
          ingredientName: fi.ingredient.name,
          ingredientCategory: fi.ingredient.basicCategory,
          quantity: fi.quantity,
          unit: fi.unit
        }))
      };

      await onSubmit(recipeRequest);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={onCancel}
          variant="secondary"
          icon={ArrowLeft}
          disabled={isSubmitting}
        >
          Retour
        </Button>
        <h1 className="text-3xl font-bold text-slate-800">
          {recipe ? 'Modifier la recette' : 'Nouvelle recette'}
        </h1>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          {/* Informations générales */}
          <div className="grid xl:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nom de la recette *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                placeholder="Ex: Salade César"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type de plat
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                disabled={isSubmitting}
              >
                {RECIPE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Temps de préparation (min) *
              </label>
              <input
                type="number"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                min="1"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Temps de cuisson (min)
              </label>
              <input
                type="number"
                value={formData.cookingTime}
                onChange={(e) => setFormData({ ...formData, cookingTime: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                min="0"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Temps de repos (min)
              </label>
              <input
                type="number"
                value={formData.restTime}
                onChange={(e) => setFormData({ ...formData, restTime: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                min="0"
                disabled={isSubmitting}
              />
            </div>

            {/* Affichage temps total calculé */}
            <div className="xl:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-center">
                <span className="text-sm font-medium text-slate-700">Temps total calculé: </span>
                <span className="text-lg font-bold text-indigo-600">
                  {(formData.preparationTime || 0) + (formData.cookingTime || 0) + (formData.restTime || 0)} min
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre de personnes
              </label>
              <input
                type="number"
                value={formData.person}
                onChange={(e) => setFormData({ ...formData, person: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                min="1"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Origine (optionnel)
              </label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                placeholder="Ex: Italie"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBabyFriendly}
                  onChange={(e) => setFormData({ ...formData, isBabyFriendly: e.target.checked })}
                  className="w-5 h-5 text-pink-500 border-2 border-slate-300 rounded focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-200"
                  disabled={isSubmitting}
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">Recette adaptée aux bébés</span>
                  <div className="text-xs text-slate-500 mt-1">
                    Recette sans sel, sans sucre ajouté, adaptée aux tout-petits
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              placeholder="Décrivez votre recette..."
              disabled={isSubmitting}
              required
            />
          </div>
        </div>

        {/* Ingrédients */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              <ChefHat className="w-6 h-6 mr-2 text-emerald-500" />
              Ingrédients ({formIngredients.length})
            </h2>
            <Button
              type="button"
              onClick={() => setShowIngredientModal(true)}
              variant="success"
              icon={Plus}
              disabled={isSubmitting}
            >
              Ajouter
            </Button>
          </div>

          {formIngredients.length > 0 ? (
            <div className="space-y-3">
              {formIngredients.map((fi, idx) => (
                <div key={idx} className="p-4 bg-white/60 rounded-xl border border-white/40">
                  {editingIngredientIndex === idx ? (
                    // Mode édition
                    <div className="space-y-3">
                      <div className="font-medium text-slate-800">{fi.ingredient.name}</div>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <input
                            type="number"
                            step="0.1"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                            placeholder="Quantité"
                            autoFocus
                          />
                        </div>
                        <div className="flex-1">
                          <select
                            value={editUnit}
                            onChange={(e) => setEditUnit(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 bg-white"
                          >
                            <option value="">Unité</option>
                            {STANDARD_UNITS.map(unit => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={saveIngredientEdit}
                            className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200"
                            disabled={isSubmitting}
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={cancelIngredientEdit}
                            className="px-3 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors duration-200"
                            disabled={isSubmitting}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Mode affichage
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div>
                          <span className="font-medium text-slate-800">{fi.ingredient.name}</span>
                          <span className="text-emerald-600 font-semibold ml-4">{fi.quantity} {fi.unit}</span>
                        </div>
                        {fi.ingredient.id < 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => startEditIngredient(idx)}
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          disabled={isSubmitting}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeIngredient(fi.ingredient.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          disabled={isSubmitting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Aucun ingrédient ajouté</p>
          )}
        </div>

        {/* Étapes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Étapes de préparation ({formData.steps.filter(s => s.trim()).length})
            </h2>
            <Button
              type="button"
              onClick={addStep}
              variant="primary"
              icon={Plus}
              disabled={isSubmitting}
            >
              Ajouter une étape
            </Button>
          </div>

          <div className="space-y-4">
            {formData.steps.map((step, idx) => (
              <div key={idx} className="flex space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm mt-2">
                  {idx + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(idx, e.target.value)}
                    placeholder={`Étape ${idx + 1}...`}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                    disabled={isSubmitting}
                  />
                </div>
                {formData.steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(idx)}
                    className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 mt-2"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4 justify-center">
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'En cours...' : (recipe ? 'Modifier la recette' : 'Créer la recette')}
          </Button>
        </div>
      </form>

      {/* Modal ajout ingrédient */}
      <Modal
        isOpen={showIngredientModal}
        onClose={() => setShowIngredientModal(false)}
        title="Ajouter un ingrédient"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Rechercher un ingrédient
            </label>
            <IngredientAutocomplete
              ingredients={ingredients}
              onIngredientSelect={setSelectedIngredient}
              onNewIngredientRequest={handleNewIngredientRequest}
            />
            
            {/* Message de confirmation pour création d'ingrédient */}
            {pendingIngredientName && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  L'ingrédient "{pendingIngredientName}" n'existe pas. Voulez-vous le créer ?
                </p>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={confirmCreateNewIngredient}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Créer
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingIngredientName('')}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quantité
              </label>
              <input
                type="number"
                step="0.1"
                value={ingredientQuantity}
                onChange={(e) => setIngredientQuantity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                placeholder="200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Unité
              </label>
              <select
                value={ingredientUnit}
                onChange={(e) => setIngredientUnit(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 bg-white"
              >
                <option value="">Sélectionner une unité</option>
                {STANDARD_UNITS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={() => setShowIngredientModal(false)}
              variant="secondary"
              fullWidth
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={addIngredient}
              variant="success"
              fullWidth
              disabled={!selectedIngredient || !ingredientQuantity.trim() || !ingredientUnit.trim()}
            >
              Ajouter
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal création nouvel ingrédient */}
      <NewIngredientModal
        isOpen={showNewIngredientModal}
        onClose={handleCloseNewIngredientModal}
        onCreateIngredient={handleCreateNewIngredient}
        onIngredientCreated={loadIngredients}
        initialName={newIngredientName}
      />
    </div>
  );
}
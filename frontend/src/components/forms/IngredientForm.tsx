import { useState, useEffect } from 'react';
import type { Ingredient, IngredientRequest } from '../../types';
import { INGREDIENT_CATEGORIES } from '../../types';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface IngredientFormProps {
  ingredient?: Ingredient;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IngredientRequest) => Promise<void>;
}

export default function IngredientForm({
  ingredient,
  isOpen,
  onClose,
  onSubmit
}: IngredientFormProps) {
  const [formData, setFormData] = useState<IngredientRequest>({
    name: ingredient?.name || '',
    category: ingredient?.category || 'Légumes'
  });

  // Mettre à jour le formulaire quand un ingrédient est passé en props
  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name,
        category: ingredient.category
      });
    } else {
      setFormData({
        name: '',
        category: 'Légumes'
      });
    }
  }, [ingredient]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Veuillez entrer un nom d\'ingrédient');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      // Reset form for next use
      if (!ingredient) {
        setFormData({ name: '', category: 'Légumes' });
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form if it's a create form
      if (!ingredient) {
        setFormData({ name: '', category: 'Légumes' });
      }
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title={ingredient ? 'Modifier l\'ingrédient' : 'Nouvel ingrédient'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nom de l'ingrédient *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
            placeholder="Ex: Tomate"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Catégorie *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
            disabled={isSubmitting}
            required
          >
            {INGREDIENT_CATEGORIES.slice(1).map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            fullWidth
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="success"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? 'En cours...' : (ingredient ? 'Modifier' : 'Ajouter')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
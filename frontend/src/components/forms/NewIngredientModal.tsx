import { useState, useEffect } from 'react';
import { INGREDIENT_CATEGORIES } from '../../types';
import type { Ingredient, IngredientRequest } from '../../types';
import { ingredientService } from '../../services/ingredientService';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import useKeyboard from '../../hooks/useKeyboard';

interface NewIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateIngredient: (ingredient: Ingredient) => void;
  onIngredientCreated?: () => Promise<void>;
  initialName: string;
}

export default function NewIngredientModal({
  isOpen,
  onClose,
  onCreateIngredient,
  onIngredientCreated,
  initialName
}: NewIngredientModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Mettre à jour le nom quand initialName change et que le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setCategory('');
    }
  }, [isOpen, initialName]);

  // Raccourcis clavier pour le formulaire
  useKeyboard({
    onEnter: () => !isCreating && handleSubmit(new Event('submit') as any),
    onEscape: () => !isCreating && onClose(),
    enabled: isOpen
  });

  // Générer un ID temporaire négatif unique
  const generateTempId = () => {
    return -(Date.now() + Math.random() * 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Veuillez entrer un nom d\'ingrédient');
      return;
    }
    
    if (!category) {
      alert('Veuillez sélectionner une catégorie');
      return;
    }

    setIsCreating(true);
    
    try {
      console.log('Création ingrédient:', { name: name.trim(), category });
      
      const ingredientRequest: IngredientRequest = {
        name: name.trim(),
        category
      };

      // Appel API réel pour créer l'ingrédient
      const createdIngredient = await ingredientService.createIngredient(ingredientRequest);
      
      console.log('Ingrédient créé:', createdIngredient);
      
      // Rafraîchir la liste des ingrédients
      if (onIngredientCreated) {
        await onIngredientCreated();
      }
      
      onCreateIngredient(createdIngredient);
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la création de l\'ingrédient:', error);
      alert('Erreur lors de la création de l\'ingrédient. Veuillez réessayer.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setName('');
    setCategory('');
    setIsCreating(false);
    onClose();
  };

  // Filtrer les catégories pour exclure "Tous"
  const availableCategories = INGREDIENT_CATEGORIES.filter(cat => cat.value !== 'Tous');

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Créer un nouvel ingrédient"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nom de l'ingrédient *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
            placeholder="Ex: Paprika fumé"
            autoFocus
            required
            disabled={isCreating}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Catégorie *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 bg-white"
            required
            disabled={isCreating}
          >
            <option value="">Sélectionner une catégorie</option>
            {availableCategories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            onClick={handleClose}
            variant="secondary"
            fullWidth
            disabled={isCreating}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="success"
            fullWidth
            disabled={isCreating}
          >
            {isCreating ? 'Création...' : 'Créer l\'ingrédient'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
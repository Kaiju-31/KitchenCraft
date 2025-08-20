import { useState } from 'react';
import { Calendar, Plus, Users } from 'lucide-react';
import type {WeeklyPlan, Recipe, PlanRecipeRequest} from '../../types';
import { usePlans } from '../../hooks/usePlans';
import * as planService from '../../services/planService';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface AddToPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
}

export default function AddToPlanModal({ isOpen, onClose, recipe }: AddToPlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<WeeklyPlan | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [mealType, setMealType] = useState('');
  const [scaledPerson, setScaledPerson] = useState<number>(recipe.person);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { plans } = usePlans();

  // Filtrer les plannings futurs ou en cours
  const availablePlans = plans.filter(plan => {
    const endDate = new Date(plan.endDate);
    const today = new Date();
    return endDate >= today;
  });

  const getAvailableDates = (plan: WeeklyPlan) => {
    const dates = [];
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan || !selectedDate) {
      return;
    }

    setIsSubmitting(true);
    try {
      const request: PlanRecipeRequest = {
        recipeId: recipe.id,
        plannedDate: selectedDate,
        mealType: mealType || undefined,
        scaledPerson: scaledPerson !== recipe.person ? scaledPerson : undefined,
      };

      await planService.addRecipeToPlan(selectedPlan.id, request);
      
      // Reset form
      setSelectedPlan(null);
      setSelectedDate('');
      setMealType('');
      setScaledPerson(recipe.person);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout au planning:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Ajouter "${recipe.name}" au planning`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sélection du planning */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Planning *
          </label>
          {availablePlans.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Aucun planning disponible</p>
              <p className="text-sm">Créez d'abord un planning</p>
            </div>
          ) : (
            <select
              value={selectedPlan?.id || ''}
              onChange={(e) => {
                const plan = availablePlans.find(p => p.id === parseInt(e.target.value));
                setSelectedPlan(plan || null);
                setSelectedDate(''); // Reset date when plan changes
              }}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              required
            >
              <option value="">Sélectionnez un planning</option>
              {availablePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} ({formatDate(plan.startDate)} - {formatDate(plan.endDate)})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Sélection de la date */}
        {selectedPlan && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date *
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              required
            >
              <option value="">Sélectionnez une date</option>
              {getAvailableDates(selectedPlan).map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Configuration optionnelle */}
        {selectedDate && (
          <div className="space-y-4 bg-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-purple-800">Configuration (optionnel)</h4>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Type de repas */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type de repas
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Non spécifié</option>
                  <option value="Petit-déjeuner">Petit-déjeuner</option>
                  <option value="Déjeuner">Déjeuner</option>
                  <option value="Dîner">Dîner</option>
                  <option value="Collation">Collation</option>
                </select>
              </div>

              {/* Nombre de personnes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre de personnes
                </label>
                <input
                  type="number"
                  value={scaledPerson}
                  onChange={(e) => setScaledPerson(parseInt(e.target.value) || 1)}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                {scaledPerson !== recipe.person && (
                  <p className="text-xs text-purple-600 mt-1">
                    Recette originale pour {recipe.person} personne{recipe.person > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={!selectedPlan || !selectedDate || isSubmitting || availablePlans.length === 0}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Ajout...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter au planning
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
import { useState } from 'react';
import { Calendar, Plus, X } from 'lucide-react';
import type {WeeklyPlanRequest} from '../../types';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import useKeyboard from '../../hooks/useKeyboard';

interface PlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (plan: WeeklyPlanRequest) => Promise<void>;
  initialData?: WeeklyPlanRequest;
  title?: string;
}

export default function PlanForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  title = "Nouveau Planning" 
}: PlanFormProps) {
  const [formData, setFormData] = useState<WeeklyPlanRequest>({
    name: initialData?.name || '',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    durationWeeks: initialData?.durationWeeks || 1,
    description: initialData?.description || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Raccourcis clavier pour le formulaire
  useKeyboard({
    onEnter: () => !isSubmitting && handleSubmit(new Event('submit') as any),
    onEscape: () => !isSubmitting && onClose(),
    enabled: isOpen
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        durationWeeks: 1,
        description: '',
      });
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEndDate = () => {
    const start = new Date(formData.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + (formData.durationWeeks * 7) - 1);
    return end.toLocaleDateString('fr-FR');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom du planning */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nom du planning *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            placeholder="Ex: Planning de la semaine..."
            required
          />
        </div>

        {/* Date de début */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Date de début *
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            required
          />
        </div>

        {/* Durée */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Durée (semaines) *
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="4"
              value={formData.durationWeeks}
              onChange={(e) => setFormData(prev => ({ ...prev, durationWeeks: parseInt(e.target.value) }))}
              className="flex-1"
            />
            <span className="text-lg font-semibold text-purple-600 min-w-[3rem]">
              {formData.durationWeeks} sem.
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Du {new Date(formData.startDate).toLocaleDateString('fr-FR')} au {getEndDate()}
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description (optionnel)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
            rows={3}
            placeholder="Notes, thème du planning..."
          />
        </div>

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
            disabled={isSubmitting || !formData.name.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Création...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Créer le planning
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
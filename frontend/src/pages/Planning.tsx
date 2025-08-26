import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Copy, Trash2 } from 'lucide-react';
import type { WeeklyPlan, ViewMode } from '../types';
import { useViewMode } from '../hooks/useViewMode';
import { usePlans } from '../hooks/usePlans';

// Components
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import PlanForm from '../components/forms/PlanForm';
import ViewModeToggle from '../components/ui/ViewModeToggle';
import ItemList from '../components/ui/ItemList';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function Planning() {
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useViewMode('viewMode-planning', 'grid');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<number | null>(null);

  const {
    plans,
    loadingState: plansLoading,
    createPlan,
    deletePlan,
    copyPlan,
  } = usePlans();

  if (plansLoading.isLoading) {
    return <LoadingSpinner />;
  }

  if (plansLoading.error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{plansLoading.error}</p>
        <Button onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const getWeekDays = (plan: WeeklyPlan) => {
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    const days = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(d.toISOString().split('T')[0]);
    }
    
    return days;
  };

  const handleDeletePlan = (planId: number) => {
    setPlanToDelete(planId);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePlan = async () => {
    if (planToDelete) {
      await deletePlan(planToDelete);
      setPlanToDelete(null);
    }
    setShowDeleteConfirm(false);
  };

  const handleExportPlanningPDF = async () => {
    if (!selectedPlan) return;
    
    try {
      const startDate = new Date(selectedPlan.startDate);
      await exportPlanningToPDF(selectedPlan, planRecipes, startDate);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF du planning:', error);
      alert('Erreur lors de la génération du PDF du planning');
    }
  };

  const handleExportShoppingListPDF = async () => {
    if (!selectedPlan || shoppingList.length === 0) return;
    
    try {
      await exportShoppingListToPDF(shoppingList, selectedPlan.name);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF de la liste de courses:', error);
      alert('Erreur lors de la génération du PDF de la liste de courses');
    }
  };

  // Préparer les données pour la vue liste
  const planItems = plans.map(plan => {
    const isActive = new Date(plan.endDate) >= new Date();
    return {
      id: plan.id,
      title: plan.name,
      icon: Calendar,
      iconColor: isActive ? 'from-purple-500 to-pink-600' : 'from-slate-400 to-slate-500',
      badge: {
        text: isActive ? 'Actif' : 'Terminé',
        color: isActive ? 'from-purple-500 to-pink-600' : 'from-slate-400 to-slate-500'
      },
      subtitle: plan.description || "Planning hebdomadaire",
      // Métadonnées en bas sur mobile/tablette, droite sur desktop
      tags: [
        {
          text: `${plan.durationWeeks} semaine${plan.durationWeeks > 1 ? 's' : ''}`,
          variant: 'muted' as const
        },
        {
          text: `${formatDate(plan.startDate)} → ${formatDate(plan.endDate)}`,
          variant: 'muted' as const
        }
      ],
      onClick: () => {
        // Naviguer vers la page détail du planning
        navigate(`/planning/${plan.id}`);
      },
      // Actions mobile : pas de bouton voir, garder copier et supprimer
      mobileActions: (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyPlan(plan.id, new Date().toISOString().split('T')[0]);
            }}
            className="min-w-10 min-h-10 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 touch-manipulation"
            title="Copier"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePlan(plan.id);
            }}
            className="min-w-10 min-h-10 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 touch-manipulation"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      // Actions tablette : pas de bouton voir, garder copier et supprimer
      tabletActions: (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyPlan(plan.id, new Date().toISOString().split('T')[0]);
            }}
            className="min-w-10 min-h-10 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 touch-manipulation"
            title="Copier"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePlan(plan.id);
            }}
            className="min-w-10 min-h-10 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 touch-manipulation"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      // Actions desktop : tous les boutons
      actions: (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/planning/${plan.id}`);
            }}
            className="min-w-10 min-h-10 flex items-center justify-center bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 touch-manipulation"
            title="Voir"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyPlan(plan.id, new Date().toISOString().split('T')[0]);
            }}
            className="min-w-10 min-h-10 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 touch-manipulation"
            title="Copier"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePlan(plan.id);
            }}
            className="min-w-10 min-h-10 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 touch-manipulation"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-indigo-600" />
            Planning Hebdomadaire
          </h1>
          <p className="text-slate-600 mt-2">
            Organisez vos repas et générez vos listes de courses
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="group relative flex items-center bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 px-6 py-3"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-semibold text-base">Nouveau Planning</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
        </div>
      </div>

      {/* Liste des plannings */}
      <div className="space-y-4">
        {plans.length > 0 && (
          <div className="flex justify-end mb-6">
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        )}

        {plans.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Aucun planning créé"
            description="Commencez par créer votre premier planning hebdomadaire"
            action={
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un planning
              </Button>
            }
          />
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const isActive = new Date(plan.endDate) >= new Date();
              const progressColor = isActive 
                ? 'from-purple-500 to-pink-600' 
                : 'from-slate-400 to-slate-500';
              
              return (
                <div
                  key={plan.id}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:scale-[1.02] hover:rotate-1 cursor-pointer"
                  onClick={() => navigate(`/planning/${plan.id}`)}
                >
                  {/* En-tête avec statut */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${progressColor}`}>
                      {isActive ? 'Actif' : 'Terminé'}
                    </span>
                    <div className="text-right text-sm text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{plan.durationWeeks} sem.</span>
                      </div>
                    </div>
                  </div>

                  {/* Contenu */}
                  <h3 className="text-lg sm:text-xl xl:text-2xl font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors duration-200 line-clamp-2">
                    {plan.name}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 mb-4 line-clamp-2">
                    {plan.description || "Planning hebdomadaire"}
                  </p>

                  {/* Métadonnées */}
                  <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <span>{formatDate(plan.startDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>{plan.totalRecipes} recette{plan.totalRecipes > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Période */}
                  <div className="space-y-2 mb-4">
                    <h4 className="font-semibold text-slate-700">Période:</h4>
                    <div className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg inline-block">
                      {formatDate(plan.startDate)} → {formatDate(plan.endDate)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/planning/${plan.id}`);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 min-h-11 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 text-sm font-medium"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Voir</span>
                    </button>

                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyPlan(plan.id, new Date().toISOString().split('T')[0]);
                        }}
                        className="min-w-11 min-h-11 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                        title="Copier"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlan(plan.id);
                        }}
                        className="min-w-11 min-h-11 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <ItemList items={planItems} />
        )}
      </div>

      {/* Modals */}
      <PlanForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={createPlan}
      />

      {/* Dialog de confirmation pour suppression de planning */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeletePlan}
        title="Supprimer le planning"
        message="Êtes-vous sûr de vouloir supprimer ce planning ? Cette action est irréversible et supprimera également tous les repas et recettes associés."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />

    </div>
  );
}
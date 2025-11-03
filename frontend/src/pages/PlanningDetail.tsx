import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Plus, Copy, Trash2, ShoppingCart, X, Baby, FileDown } from 'lucide-react';
import type { WeeklyPlan, PlanRecipe } from '../types';
import { MEAL_TYPES } from '../types';
import { usePlans, usePlanRecipes, useShoppingList } from '../hooks/usePlans';
import { exportPlanningToPDF, exportShoppingListToPDF } from '../utils/pdfExport';

// Components
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import RecipeSelector from '../components/planning/RecipeSelector';
import ShoppingList from '../components/planning/ShoppingList';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function PlanningDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [currentView, setCurrentView] = useState<'calendar' | 'shopping'>('calendar');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [shoppingMode, setShoppingMode] = useState<'validation' | 'shopping'>('validation');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    plans,
    loadingState: plansLoading,
    copyPlan,
    deletePlan,
  } = usePlans();

  const {
    planRecipes,
    loadingState: recipesLoading,
    addRecipeToPlan,
    removeRecipeFromPlan,
  } = usePlanRecipes(plan?.id || null);

  const {
    shoppingList,
    loadingState: shoppingLoading,
    generateShoppingList,
    updateShoppingListItem,
  } = useShoppingList(plan?.id || null);

  useEffect(() => {
    const loadPlan = async () => {
      if (!id || isNaN(Number(id))) {
        setError('ID de planning invalide');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Attendre que les plans soient chargés
        if (plans.length === 0 && plansLoading.isLoading) {
          return; // Attendre le chargement
        }

        const foundPlan = plans.find(p => p.id === Number(id));
        if (foundPlan) {
          setPlan(foundPlan);
        } else {
          setError('Planning non trouvé');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du planning:', error);
        setError('Erreur lors du chargement du planning');
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [id, plans, plansLoading.isLoading]);

  const handleBack = () => {
    navigate('/planning');
  };

  const handleCopy = async () => {
    if (plan) {
      try {
        await copyPlan(plan.id, new Date().toISOString().split('T')[0]);
        navigate('/planning');
      } catch (error) {
        console.error('Erreur lors de la copie:', error);
      }
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (plan) {
      try {
        await deletePlan(plan.id);
        navigate('/planning');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du planning');
      }
    }
    setShowDeleteConfirm(false);
  };

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

  const getMealTypeColor = (mealType?: string) => {
    const mealTypeData = MEAL_TYPES.find(type => type.value === (mealType || ''));
    return mealTypeData?.color || 'from-slate-100 to-slate-200';
  };

  const getRecipesForDate = (date: string) => {
    const recipes = planRecipes.filter(pr => {
      // Normaliser les dates au format YYYY-MM-DD (enlever l'heure si présente)
      const recipeDate = pr.plannedDate.split('T')[0];
      return recipeDate === date;
    });
    return recipes;
  };

  const handleExportPlanningPDF = async () => {
    if (!plan) return;
    
    try {
      const startDate = new Date(plan.startDate);
      await exportPlanningToPDF(plan, planRecipes, startDate);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF du planning:', error);
      alert('Erreur lors de la génération du PDF du planning');
    }
  };

  const handleExportShoppingListPDF = async () => {
    if (!plan || shoppingList.length === 0) return;
    
    try {
      await exportShoppingListToPDF(shoppingList, plan.name);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF de la liste de courses:', error);
      alert('Erreur lors de la génération du PDF de la liste de courses');
    }
  };

  if (loading || plansLoading.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" color="purple" text="Chargement du planning..." />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState
          icon={Calendar}
          title="Planning non trouvé"
          description={error || "Ce planning n'existe pas ou a été supprimé"}
          actionLabel="Retour aux plannings"
          onAction={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Button
            variant="primary"
            onClick={handleBack}
            className="w-fit"
          >
            ← Retour aux plannings
          </Button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">{plan.name}</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="secondary"
            onClick={handleExportPlanningPDF}
            disabled={planRecipes.length === 0}
            className="w-full sm:w-auto text-sm"
          >
            <FileDown className="w-4 h-4 mr-2" />
            <span className="sm:hidden">PDF</span>
            <span className="hidden sm:inline">PDF Planning</span>
          </Button>
          <div className="flex gap-2">
            <Button
              variant={currentView === 'calendar' ? 'primary' : 'ghost'}
              onClick={() => setCurrentView('calendar')}
              className="flex-1 sm:flex-none text-sm"
            >
              <Calendar className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Calendrier</span>
              <span className="xs:hidden">Cal.</span>
            </Button>
            <Button
              variant={currentView === 'shopping' ? 'primary' : 'ghost'}
              onClick={() => setCurrentView('shopping')}
              className="flex-1 sm:flex-none text-sm"
            >
              <ShoppingCart className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Liste de courses</span>
              <span className="xs:hidden">Liste</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Actions planning */}
      <div className="flex gap-2 justify-center sm:justify-start">
        <Button
          variant="secondary"
          onClick={handleCopy}
          className="flex items-center"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copier ce planning
        </Button>
        <Button
          variant="danger"
          onClick={handleDeleteClick}
          className="flex items-center"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Supprimer
        </Button>
      </div>

      {/* Contenu selon la vue */}
      {currentView === 'calendar' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid gap-4">
            {getWeekDays(plan).map((date) => (
              <div key={date} className="border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-slate-800">
                    {formatDate(date)}
                  </h4>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedDate(date);
                      setShowRecipeSelector(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {getRecipesForDate(date).map((planRecipe) => (
                    <div
                      key={planRecipe.id}
                      className={`rounded-lg p-3 flex justify-between items-center ${
                        planRecipe.recipe.isBabyFriendly 
                          ? 'bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200' 
                          : 'bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{planRecipe.recipe.name}</p>
                          {planRecipe.recipe.isBabyFriendly && (
                            <span className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-pink-700 bg-pink-200 border border-pink-300">
                              <Baby className="w-3 h-3" />
                              <span>Bébé</span>
                            </span>
                          )}
                        </div>
                        {planRecipe.mealType && (
                          <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium text-slate-700 bg-gradient-to-r ${getMealTypeColor(planRecipe.mealType)} border border-white/40`}>
                            {planRecipe.mealType}
                          </span>
                        )}
                        {planRecipe.scaledPerson && (
                          <p className="text-sm text-slate-600">
                            Pour {planRecipe.scaledPerson} personne{planRecipe.scaledPerson > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => removeRecipeFromPlan(planRecipe.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentView === 'shopping' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-slate-800">Liste de courses</h3>
            <div className="flex gap-2">
              <Button 
                onClick={handleExportShoppingListPDF}
                variant="secondary"
                disabled={shoppingList.length === 0}
              >
                <FileDown className="w-4 h-4 mr-2" />
                PDF Liste
              </Button>
              <Button onClick={generateShoppingList}>
                Générer la liste
              </Button>
            </div>
          </div>
          
          {shoppingLoading.isLoading ? (
            <LoadingSpinner />
          ) : shoppingList.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="Aucun article"
              description="Générez votre liste de courses à partir des recettes planifiées"
            />
          ) : (
            <ShoppingList
              items={shoppingList}
              onUpdateItem={updateShoppingListItem}
              mode={shoppingMode}
              onModeChange={setShoppingMode}
            />
          )}
        </div>
      )}

      {/* Modal sélecteur de recettes */}
      {showRecipeSelector && plan && (
        <RecipeSelector
          isOpen={showRecipeSelector}
          onClose={() => setShowRecipeSelector(false)}
          onAddRecipe={addRecipeToPlan}
          selectedDate={selectedDate}
          planId={plan.id}
        />
      )}

      {/* Dialog de confirmation pour suppression de planning */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer le planning"
        message={`Êtes-vous sûr de vouloir supprimer le planning "${plan?.name}" ? Cette action est irréversible et supprimera également tous les repas et recettes associés.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
}
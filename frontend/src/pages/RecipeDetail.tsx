import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Recipe } from '../types';
import { useRecipes } from '../hooks/useRecipes';

// Components
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import RecipeDetail from '../components/recipe/RecipeDetail';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Search } from 'lucide-react';

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [scaledPerson, setScaledPerson] = useState(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { getRecipeById, deleteRecipe } = useRecipes();

  useEffect(() => {
    const loadRecipe = async () => {
      if (!id || isNaN(Number(id))) {
        setError('ID de recette invalide');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const detailedRecipe = await getRecipeById(Number(id), scaledPerson);
        if (detailedRecipe) {
          setRecipe(detailedRecipe);
          // Initialiser scaledPerson avec le nombre de personnes de la recette
          if (scaledPerson === 4 && detailedRecipe.person) {
            setScaledPerson(detailedRecipe.person);
          }
        } else {
          setError('Recette non trouvée');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la recette:', error);
        setError('Erreur lors du chargement de la recette');
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id, getRecipeById]);

  // Recharger avec nouvelle échelle
  useEffect(() => {
    const reloadWithScale = async () => {
      if (recipe && scaledPerson !== recipe.scaledPerson) {
        try {
          const scaledRecipe = await getRecipeById(recipe.id, scaledPerson);
          if (scaledRecipe) {
            setRecipe(scaledRecipe);
          }
        } catch (error) {
          console.error('Erreur lors du rechargement avec échelle:', error);
        }
      }
    };

    reloadWithScale();
  }, [scaledPerson, recipe?.id, getRecipeById]);

  const handleBack = () => {
    navigate('/recipes');
  };

  const handleEdit = (recipe: Recipe) => {
    // Naviguer vers la page recettes avec le mode édition
    navigate('/recipes', { 
      state: { 
        editingRecipeId: recipe.id,
        action: 'edit'
      }
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRecipe(id);
      navigate('/recipes');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la recette');
    }
    setShowDeleteConfirm(false);
  };

  const handleScaledPersonChange = (person: number) => {
    setScaledPerson(person);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" color="indigo" text="Chargement de la recette..." />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState
          icon={Search}
          title="Recette non trouvée"
          description={error || "Cette recette n'existe pas ou a été supprimée"}
          actionLabel="Retour aux recettes"
          onAction={handleBack}
        />
      </div>
    );
  }

  return (
    <>
      <RecipeDetail
        recipe={recipe}
        scaledPerson={scaledPerson}
        onScaledPersonChange={handleScaledPersonChange}
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Dialog de confirmation pour suppression de recette */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => handleDelete(recipe.id)}
        title="Supprimer la recette"
        message={`Êtes-vous sûr de vouloir supprimer la recette "${recipe?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </>
  );
}
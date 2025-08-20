import jsPDF from 'jspdf';
import type { Recipe, WeeklyPlan, ShoppingListItem } from '../types';

// Configuration globale pour jsPDF
const createPDF = () => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Définir la police par défaut qui supporte mieux l'UTF-8
  pdf.setFont('helvetica');
  
  return pdf;
};

// Fonction pour exporter une recette en PDF
export const exportRecipeToPDF = async (recipe: Recipe): Promise<void> => {
  try {
    const pdf = createPDF();

    const isBabyFriendly = recipe.isBabyFriendly;
    let currentY = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Couleurs
    const primaryColor = isBabyFriendly ? [244, 114, 182] : [79, 70, 229]; // rose ou indigo
    const textColor = [30, 41, 59]; // slate-800
    const lightTextColor = [100, 116, 139]; // slate-500

    // En-tête
    pdf.setFontSize(24);
    pdf.setTextColor(...textColor);
    pdf.text(recipe.name, pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;

    // Badge bébé si applicable
    if (isBabyFriendly) {
      pdf.setFillColor(...primaryColor);
      pdf.roundedRect(pageWidth / 2 - 35, currentY, 70, 8, 4, 4, 'F');
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text('RECETTE ADAPTEE AUX BEBES', pageWidth / 2, currentY + 5, { align: 'center' });
      currentY += 15;
    } else {
      currentY += 5;
    }

    // Métadonnées
    pdf.setFontSize(10);
    pdf.setTextColor(...lightTextColor);
    const metaText = `Origine: ${recipe.origin || 'Non specifiee'}  •  ${recipe.person} personnes  •  Temps: ${recipe.totalTime} min`;
    pdf.text(metaText, pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Description
    pdf.setFontSize(12);
    pdf.setTextColor(...textColor);
    pdf.text('Description', margin, currentY);
    currentY += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(...lightTextColor);
    const descLines = pdf.splitTextToSize(recipe.description, contentWidth);
    pdf.text(descLines, margin, currentY);
    currentY += descLines.length * 5 + 10;

    // Temps de préparation
    pdf.setFillColor(248, 250, 252);
    if (isBabyFriendly) pdf.setFillColor(253, 242, 248);
    pdf.rect(margin, currentY, contentWidth, 20, 'F');
    
    const timeData = [
      { label: 'Préparation', value: recipe.preparationTime },
      { label: 'Cuisson', value: recipe.cookingTime || 0 },
      { label: 'Repos', value: recipe.restTime || 0 },
      { label: 'Total', value: recipe.totalTime }
    ];

    timeData.forEach((time, index) => {
      const x = margin + (index * contentWidth / 4) + (contentWidth / 8);
      pdf.setFontSize(14);
      pdf.setTextColor(...textColor);
      pdf.text(time.value.toString(), x, currentY + 8, { align: 'center' });
      pdf.setFontSize(8);
      pdf.setTextColor(...lightTextColor);
      pdf.text(`${time.label} (min)`, x, currentY + 13, { align: 'center' });
    });
    currentY += 30;

    // Ingrédients
    pdf.setFontSize(12);
    pdf.setTextColor(...primaryColor);
    pdf.text(`Ingredients (${recipe.ingredients.length})`, margin, currentY);
    currentY += 10;

    recipe.ingredients.forEach((ingredient) => {
      if (currentY > 250) {
        pdf.addPage();
        currentY = 20;
      }
      
      pdf.setFontSize(10);
      pdf.setTextColor(...textColor);
      pdf.text(ingredient.ingredient.name, margin, currentY);
      pdf.setTextColor(5, 150, 105); // emerald-600
      pdf.text(`${ingredient.quantity} ${ingredient.unit}`, pageWidth - margin, currentY, { align: 'right' });
      currentY += 6;
    });
    currentY += 10;

    // Étapes
    pdf.setFontSize(12);
    pdf.setTextColor(...primaryColor);
    pdf.text('Etapes de preparation', margin, currentY);
    currentY += 10;

    recipe.steps.forEach((step, index) => {
      if (currentY > 240) {
        pdf.addPage();
        currentY = 20;
      }

      // Numéro de l'étape
      pdf.setFillColor(...primaryColor);
      pdf.circle(margin + 5, currentY - 2, 4, 'F');
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text((index + 1).toString(), margin + 5, currentY + 1, { align: 'center' });

      // Texte de l'étape
      pdf.setFontSize(10);
      pdf.setTextColor(...textColor);
      const stepLines = pdf.splitTextToSize(step, contentWidth - 20);
      pdf.text(stepLines, margin + 15, currentY);
      currentY += stepLines.length * 5 + 5;
    });

    // Footer
    currentY = pdf.internal.pageSize.getHeight() - 20;
    pdf.setFontSize(8);
    pdf.setTextColor(...lightTextColor);
    pdf.text(`Genere avec KitchenCraft - ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, currentY, { align: 'center' });

    const filename = `recette-${recipe.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw new Error('Impossible de générer le PDF de la recette');
  }
};

// Fonction pour exporter un planning en PDF
export const exportPlanningToPDF = async (
  plan: WeeklyPlan, 
  planRecipes: any[],
  startDate: Date
): Promise<void> => {
  try {
    const pdf = createPDF();

    let currentY = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Couleurs
    const primaryColor = [79, 70, 229]; // indigo
    const textColor = [30, 41, 59];
    const lightTextColor = [100, 116, 139];
    const babyColor = [244, 114, 182]; // rose

    // En-tête
    pdf.setFontSize(20);
    pdf.setTextColor(...textColor);
    pdf.text(plan.name, pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(...lightTextColor);
    const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    const dateRange = `Du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`;
    const recipeCount = `${planRecipes.length} recettes planifiees`;
    pdf.text(`${dateRange}  •  ${recipeCount}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 20;

    // Générer les jours
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayRecipes = planRecipes.filter(pr => pr.plannedDate.split('T')[0] === dateStr);
      
      if (currentY > 250) {
        pdf.addPage();
        currentY = 20;
      }

      // En-tête du jour
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, currentY, contentWidth, 12, 'F');
      
      pdf.setFontSize(12);
      pdf.setTextColor(...textColor);
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      pdf.text(dayName.charAt(0).toUpperCase() + dayName.slice(1), margin + 5, currentY + 8);
      currentY += 18;

      // Recettes du jour
      if (dayRecipes.length > 0) {
        dayRecipes.forEach((planRecipe) => {
          if (currentY > 270) {
            pdf.addPage();
            currentY = 20;
          }

          // Fond coloré pour les recettes bébé
          if (planRecipe.recipe.isBabyFriendly) {
            pdf.setFillColor(253, 242, 248);
            pdf.rect(margin + 5, currentY - 2, contentWidth - 10, 15, 'F');
          }

          // Nom de la recette
          pdf.setFontSize(10);
          pdf.setTextColor(...textColor);
          pdf.text(planRecipe.recipe.name, margin + 8, currentY + 3);

          // Badge bébé
          if (planRecipe.recipe.isBabyFriendly) {
            pdf.setFillColor(...babyColor);
            pdf.roundedRect(margin + 8 + pdf.getTextWidth(planRecipe.recipe.name) + 5, currentY - 1, 25, 6, 2, 2, 'F');
            pdf.setFontSize(8);
            pdf.setTextColor(255, 255, 255);
            pdf.text('BEBE', margin + 8 + pdf.getTextWidth(planRecipe.recipe.name) + 17.5, currentY + 3, { align: 'center' });
          }

          // Temps
          pdf.setFontSize(9);
          pdf.setTextColor(...lightTextColor);
          pdf.text(`${planRecipe.recipe.totalTime}min`, pageWidth - margin - 5, currentY + 3, { align: 'right' });

          currentY += 8;

          // Informations supplémentaires
          if (planRecipe.mealType || planRecipe.scaledPerson) {
            pdf.setFontSize(8);
            pdf.setTextColor(...lightTextColor);
            let infoText = '';
            if (planRecipe.mealType) infoText += planRecipe.mealType;
            if (planRecipe.scaledPerson) {
              if (infoText) infoText += ' • ';
              infoText += `Pour ${planRecipe.scaledPerson} personne${planRecipe.scaledPerson > 1 ? 's' : ''}`;
            }
            pdf.text(infoText, margin + 8, currentY);
            currentY += 5;
          }

          currentY += 3;
        });
      } else {
        pdf.setFontSize(9);
        pdf.setTextColor(...lightTextColor);
        pdf.text('Aucune recette planifiee', margin + 8, currentY + 3);
        currentY += 8;
      }

      currentY += 5;
    }

    // Footer
    currentY = pdf.internal.pageSize.getHeight() - 20;
    pdf.setFontSize(8);
    pdf.setTextColor(...lightTextColor);
    pdf.text(`Genere avec KitchenCraft - ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, currentY, { align: 'center' });

    const filename = `planning-${plan.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF du planning:', error);
    throw new Error('Impossible de générer le PDF du planning');
  }
};

// Fonction pour exporter la liste de courses en PDF
export const exportShoppingListToPDF = async (
  items: ShoppingListItem[],
  planName: string
): Promise<void> => {
  try {
    const pdf = createPDF();

    let currentY = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Couleurs
    const primaryColor = [5, 150, 105]; // emerald-600
    const textColor = [30, 41, 59];
    const lightTextColor = [100, 116, 139];

    // En-tête
    pdf.setFontSize(20);
    pdf.setTextColor(...textColor);
    pdf.text('Liste de courses', pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(...lightTextColor);
    pdf.text(`Planning: ${planName}  •  ${items.length} articles`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 20;

    // Grouper par catégorie
    const itemsByCategory = items.reduce((acc, item) => {
      const category = item.ingredient.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, ShoppingListItem[]>);

    // Afficher chaque catégorie
    Object.entries(itemsByCategory).forEach(([category, categoryItems]) => {
      if (currentY > 260) {
        pdf.addPage();
        currentY = 20;
      }

      // En-tête de catégorie
      pdf.setFillColor(...primaryColor);
      pdf.rect(margin, currentY, contentWidth, 8, 'F');
      
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`${category} (${categoryItems.length} articles)`, margin + 5, currentY + 5);
      currentY += 15;

      // Articles de la catégorie
      categoryItems.forEach((item) => {
        if (currentY > 275) {
          pdf.addPage();
          currentY = 20;
        }

        // Case à cocher
        pdf.setDrawColor(5, 150, 105);
        pdf.setLineWidth(0.5);
        pdf.rect(margin + 2, currentY - 3, 4, 4);

        // Nom de l'ingrédient
        pdf.setFontSize(10);
        pdf.setTextColor(...textColor);
        pdf.text(item.ingredient.name, margin + 10, currentY);

        // Quantité à acheter
        pdf.setTextColor(...primaryColor);
        pdf.text(`${item.quantityToBuy} ${item.unit}`, pageWidth - margin - 5, currentY, { align: 'right' });

        currentY += 5;

        // Quantité possédée si > 0
        if (item.quantityOwned > 0) {
          pdf.setFontSize(8);
          pdf.setTextColor(...lightTextColor);
          pdf.text(`Possede: ${item.quantityOwned} ${item.unit}`, margin + 10, currentY);
          currentY += 4;
        }

        currentY += 2;
      });

      currentY += 5;
    });

    // Statistiques
    if (currentY > 230) {
      pdf.addPage();
      currentY = 20;
    }

    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, currentY, contentWidth, 25, 'F');

    pdf.setFontSize(12);
    pdf.setTextColor(...textColor);
    pdf.text('Resume', margin + 5, currentY + 8);

    const stats = [
      { label: 'Categories', value: Object.keys(itemsByCategory).length },
      { label: 'Articles totaux', value: items.length },
      { label: 'A acheter', value: items.filter(item => item.quantityToBuy > 0).length }
    ];

    stats.forEach((stat, index) => {
      const x = margin + 20 + (index * (contentWidth - 40) / 3);
      pdf.setFontSize(14);
      pdf.setTextColor(...primaryColor);
      pdf.text(stat.value.toString(), x, currentY + 16, { align: 'center' });
      pdf.setFontSize(8);
      pdf.setTextColor(...lightTextColor);
      pdf.text(stat.label, x, currentY + 21, { align: 'center' });
    });

    // Footer
    currentY = pdf.internal.pageSize.getHeight() - 20;
    pdf.setFontSize(8);
    pdf.setTextColor(...lightTextColor);
    pdf.text(`Genere avec KitchenCraft - ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, currentY, { align: 'center' });

    const filename = `liste-courses-${planName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF de la liste de courses:', error);
    throw new Error('Impossible de générer le PDF de la liste de courses');
  }
};
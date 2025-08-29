package com.kitchencraft.recipe.util;

import com.kitchencraft.recipe.model.Ingredient;
import com.kitchencraft.recipe.model.Recipe;
import com.kitchencraft.recipe.model.RecipeIngredient;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class NutritionCalculator {

    // Méthode pour calculer une valeur nutritionnelle totale pour une recette
    public static BigDecimal calculateTotalNutrient(Recipe recipe, NutrientExtractor extractor) {
        BigDecimal total = BigDecimal.ZERO;
        
        for (RecipeIngredient recipeIngredient : recipe.getIngredients()) {
            Ingredient ingredient = recipeIngredient.getIngredient();
            BigDecimal quantity = BigDecimal.valueOf(recipeIngredient.getQuantity());
            
            if (quantity.compareTo(BigDecimal.ZERO) > 0) {
                // Calculer le ratio (quantité utilisée / 100g) car les valeurs nutritionnelles sont pour 100g
                BigDecimal ratio = quantity.divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP);
                
                BigDecimal nutrientValue = extractor.extract(ingredient);
                if (nutrientValue != null) {
                    total = total.add(nutrientValue.multiply(ratio));
                }
            }
        }
        
        return total.compareTo(BigDecimal.ZERO) > 0 ? total : null;
    }
    
    // Méthode pour calculer une valeur nutritionnelle par portion
    public static BigDecimal calculateNutrientPerPortion(Recipe recipe, NutrientExtractor extractor, Integer scaledPerson) {
        BigDecimal total = calculateTotalNutrient(recipe, extractor);
        if (total == null || scaledPerson == null || scaledPerson <= 0) {
            return null;
        }
        
        // Calculer la valeur par portion
        return total.divide(BigDecimal.valueOf(scaledPerson), 3, RoundingMode.HALF_UP);
    }
    
    // Interface fonctionnelle pour extraire une valeur nutritionnelle d'un ingrédient
    @FunctionalInterface
    public interface NutrientExtractor {
        BigDecimal extract(Ingredient ingredient);
    }
    
    // Extractors statiques pour chaque nutriment
    public static final NutrientExtractor ENERGY_KCAL = Ingredient::getEnergyKcal;
    public static final NutrientExtractor CARBOHYDRATES = Ingredient::getCarbohydrates;
    public static final NutrientExtractor SUGARS = Ingredient::getSugars;
    public static final NutrientExtractor FIBER = Ingredient::getFiber;
    public static final NutrientExtractor FAT = Ingredient::getFat;
    public static final NutrientExtractor SATURATED_FAT = Ingredient::getSaturatedFat;
    public static final NutrientExtractor PROTEIN = Ingredient::getProtein;
    public static final NutrientExtractor SALT = Ingredient::getSalt;
    public static final NutrientExtractor SODIUM = Ingredient::getSodium;
    
    // Vitamines
    public static final NutrientExtractor VITAMIN_A = Ingredient::getVitaminA;
    public static final NutrientExtractor VITAMIN_B1 = Ingredient::getVitaminB1;
    public static final NutrientExtractor VITAMIN_B2 = Ingredient::getVitaminB2;
    public static final NutrientExtractor VITAMIN_B3 = Ingredient::getVitaminB3;
    public static final NutrientExtractor VITAMIN_B5 = Ingredient::getVitaminB5;
    public static final NutrientExtractor VITAMIN_B6 = Ingredient::getVitaminB6;
    public static final NutrientExtractor VITAMIN_B7 = Ingredient::getVitaminB7;
    public static final NutrientExtractor VITAMIN_B9 = Ingredient::getVitaminB9;
    public static final NutrientExtractor VITAMIN_B12 = Ingredient::getVitaminB12;
    public static final NutrientExtractor VITAMIN_C = Ingredient::getVitaminC;
    public static final NutrientExtractor VITAMIN_D = Ingredient::getVitaminD;
    public static final NutrientExtractor VITAMIN_E = Ingredient::getVitaminE;
    public static final NutrientExtractor VITAMIN_K = Ingredient::getVitaminK;
    
    // Minéraux
    public static final NutrientExtractor CALCIUM = Ingredient::getCalcium;
    public static final NutrientExtractor IRON = Ingredient::getIron;
    public static final NutrientExtractor MAGNESIUM = Ingredient::getMagnesium;
    public static final NutrientExtractor PHOSPHORUS = Ingredient::getPhosphorus;
    public static final NutrientExtractor POTASSIUM = Ingredient::getPotassium;
    public static final NutrientExtractor ZINC = Ingredient::getZinc;
    public static final NutrientExtractor COPPER = Ingredient::getCopper;
    public static final NutrientExtractor MANGANESE = Ingredient::getManganese;
    public static final NutrientExtractor SELENIUM = Ingredient::getSelenium;
    public static final NutrientExtractor IODINE = Ingredient::getIodine;
    public static final NutrientExtractor CHROMIUM = Ingredient::getChromium;
    public static final NutrientExtractor MOLYBDENUM = Ingredient::getMolybdenum;
    public static final NutrientExtractor FLUORIDE = Ingredient::getFluoride;
}
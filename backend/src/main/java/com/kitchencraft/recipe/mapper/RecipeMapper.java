package com.kitchencraft.recipe.mapper;

import com.kitchencraft.recipe.dto.RecipeDto;
import com.kitchencraft.recipe.model.Recipe;
import com.kitchencraft.recipe.util.NutritionCalculator;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.stream.Collectors;

public class RecipeMapper {

    public static RecipeDto toDto(Recipe recipe, Integer scaledPerson) {
        final double factor = (scaledPerson != null && recipe.getPerson() != null && recipe.getPerson() > 0)
                ? (double) scaledPerson / recipe.getPerson()
                : 1.0;

        Integer effectiveScaledPerson = scaledPerson != null ? scaledPerson : recipe.getPerson();

        return new RecipeDto(
                recipe.getId(),
                recipe.getName(),
                recipe.getType(),
                recipe.getDescription(),
                recipe.getOrigin(),
                recipe.getPreparationTime(),
                recipe.getCookingTime(),
                recipe.getRestTime(),
                recipe.getTotalTime(),
                recipe.getPerson(),
                effectiveScaledPerson,
                recipe.getIsBabyFriendly(),
                recipe.getIngredients().stream()
                        .map(ri -> RecipeIngredientMapper.toDto(ri, factor))
                        .collect(Collectors.toList()),
                recipe.getSteps(),
                
                // Valeurs nutritionnelles calculées à la volée (par portion/personne)
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.ENERGY_KCAL, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.CARBOHYDRATES, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.SUGARS, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.FIBER, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.FAT, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.SATURATED_FAT, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.PROTEIN, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.SALT, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.SODIUM, effectiveScaledPerson),

                // Vitamines calculées à la volée (par portion/personne)
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.VITAMIN_A, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.VITAMIN_B1, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.VITAMIN_B2, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.VITAMIN_B3, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.VITAMIN_B5, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.VITAMIN_B6, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.VITAMIN_B7, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.VITAMIN_B9, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.VITAMIN_B12, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.VITAMIN_C, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.VITAMIN_D, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.VITAMIN_E, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.VITAMIN_K, effectiveScaledPerson),

                // Minéraux calculés à la volée (par portion/personne)
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.CALCIUM, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.IRON, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.MAGNESIUM, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.PHOSPHORUS, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.POTASSIUM, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.ZINC, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.COPPER, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.MANGANESE, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.SELENIUM, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.IODINE, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.CHROMIUM, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.MOLYBDENUM, effectiveScaledPerson),
                NutritionCalculator.calculateNutrientPerPortion(recipe, NutritionCalculator.FLUORIDE, effectiveScaledPerson)
        );
    }


}

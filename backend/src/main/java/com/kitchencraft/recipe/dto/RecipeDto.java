package com.kitchencraft.recipe.dto;

import com.kitchencraft.recipe.model.Ingredient;

import java.math.BigDecimal;
import java.util.List;

public record RecipeDto(
        Long id,
        String name,
        String type,
        String description,
        String origin,
        Integer preparationTime,
        Integer cookingTime,
        Integer restTime,
        Integer totalTime,
        Integer person,
        Integer scaledPerson,
        Boolean isBabyFriendly,
        List<RecipeIngredientDto> ingredients,
        List<String> steps,
        
        // Valeurs nutritionnelles (par portion/personne)
        BigDecimal totalEnergyKcal,
        BigDecimal totalCarbohydrates,
        BigDecimal totalSugars,
        BigDecimal totalFiber,
        BigDecimal totalFat,
        BigDecimal totalSaturatedFat,
        BigDecimal totalProtein,
        BigDecimal totalSalt,
        BigDecimal totalSodium,

        // Vitamines (par portion/personne)
        BigDecimal totalVitaminA,
        BigDecimal totalVitaminB1,
        BigDecimal totalVitaminB2,
        BigDecimal totalVitaminB3,
        BigDecimal totalVitaminB5,
        BigDecimal totalVitaminB6,
        BigDecimal totalVitaminB7,
        BigDecimal totalVitaminB9,
        BigDecimal totalVitaminB12,
        BigDecimal totalVitaminC,
        BigDecimal totalVitaminD,
        BigDecimal totalVitaminE,
        BigDecimal totalVitaminK,

        // Minéraux (par portion/personne)
        BigDecimal totalCalcium,
        BigDecimal totalIron,
        BigDecimal totalMagnesium,
        BigDecimal totalPhosphorus,
        BigDecimal totalPotassium,
        BigDecimal totalZinc,
        BigDecimal totalCopper,
        BigDecimal totalManganese,
        BigDecimal totalSelenium,
        BigDecimal totalIodine,
        BigDecimal totalChromium,
        BigDecimal totalMolybdenum,
        BigDecimal totalFluoride

) {}

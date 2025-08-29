package com.kitchencraft.recipe.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record IngredientDto(
        Long id,
        String name,
        String category,
        
        // Nouveaux champs pour le système nutritionnel fusionné
        String brand,
        String barcode,
        String basicCategory,
        String openFoodFactsId,
        String dataSource,
        LocalDateTime lastSync,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        
        // Macronutriments (pour 100g, tous nullable)
        BigDecimal energy, // kJ
        BigDecimal energyKcal, // kcal
        BigDecimal carbohydrates, // g
        BigDecimal sugars, // g
        BigDecimal fiber, // g
        BigDecimal fat, // g
        BigDecimal saturatedFat, // g
        BigDecimal monounsaturatedFat, // g
        BigDecimal polyunsaturatedFat, // g
        BigDecimal transFat, // g
        BigDecimal protein, // g
        BigDecimal salt, // g
        BigDecimal sodium, // mg
        BigDecimal alcohol, // g
        
        // Vitamines (toutes nullable)
        BigDecimal vitaminA, // µg
        BigDecimal vitaminB1, // mg
        BigDecimal vitaminB2, // mg
        BigDecimal vitaminB3, // mg
        BigDecimal vitaminB5, // mg
        BigDecimal vitaminB6, // mg
        BigDecimal vitaminB7, // µg
        BigDecimal vitaminB9, // µg
        BigDecimal vitaminB12, // µg
        BigDecimal vitaminC, // mg
        BigDecimal vitaminD, // µg
        BigDecimal vitaminE, // mg
        BigDecimal vitaminK, // µg
        
        // Minéraux (tous nullable)
        BigDecimal calcium, // mg
        BigDecimal iron, // mg
        BigDecimal magnesium, // mg
        BigDecimal phosphorus, // mg
        BigDecimal potassium, // mg
        BigDecimal zinc, // mg
        BigDecimal copper, // mg
        BigDecimal manganese, // mg
        BigDecimal selenium, // µg
        BigDecimal iodine, // µg
        BigDecimal chromium, // µg
        BigDecimal molybdenum, // µg
        BigDecimal fluoride // mg
) {}

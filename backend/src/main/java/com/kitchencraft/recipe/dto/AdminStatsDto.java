package com.kitchencraft.recipe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
    private long totalUsers;
    private long totalRecipes;
    private long totalIngredients;
    private long totalPlans;
    private long activeUsers; // Utilisateurs créés dans les 30 derniers jours
    private String mostPopularRecipeOrigin;
    private String mostUsedIngredientCategory;
}
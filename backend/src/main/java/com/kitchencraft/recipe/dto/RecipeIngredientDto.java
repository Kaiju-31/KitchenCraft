package com.kitchencraft.recipe.dto;

public record RecipeIngredientDto(
        Long id,
        IngredientDto ingredient,
        double quantity,
        String unit
) {
}

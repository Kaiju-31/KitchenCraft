package com.kitchencraft.recipe.mapper;

import com.kitchencraft.recipe.dto.IngredientDto;
import com.kitchencraft.recipe.model.Ingredient;

public class IngredientMapper {

    public static IngredientDto toDto(Ingredient ingredient) {
        if (ingredient == null) return null;
        return new IngredientDto(
                ingredient.getId(),
                ingredient.getName(),
                ingredient.getCategory()
        );
    }
}

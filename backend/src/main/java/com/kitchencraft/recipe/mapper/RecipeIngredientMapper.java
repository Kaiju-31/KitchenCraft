package com.kitchencraft.recipe.mapper;

import com.kitchencraft.recipe.dto.RecipeIngredientDto;
import com.kitchencraft.recipe.model.RecipeIngredient;

public class RecipeIngredientMapper {

    public static RecipeIngredientDto toDto(RecipeIngredient ri, double factor) {
        return new RecipeIngredientDto(
                ri.getId(),
                IngredientMapper.toDto(ri.getIngredient()),
                ri.getQuantity() * factor,
                ri.getUnit()
        );
    }
}

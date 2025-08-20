package com.kitchencraft.recipe.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecipeIngredientRequest {
    private String ingredientName;
    private String ingredientCategory;
    private double quantity;
    private String unit;

    public RecipeIngredientRequest() {}

    public RecipeIngredientRequest(String ingredientName, String ingredientCategory, double quantity, String unit) {
        this.ingredientName = ingredientName;
        this.ingredientCategory = ingredientCategory;
        this.quantity = quantity;
        this.unit = unit;
    }
}

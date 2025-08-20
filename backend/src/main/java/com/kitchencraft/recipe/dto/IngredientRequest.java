package com.kitchencraft.recipe.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IngredientRequest {

    private String name;
    private String category;

    public IngredientRequest() {}

    public IngredientRequest(String name, String category) {
        this.name = name;
        this.category = category;
    }
}

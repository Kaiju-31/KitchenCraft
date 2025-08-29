package com.kitchencraft.recipe.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IngredientRequest {

    private String name;
    private String basicCategory;

    public IngredientRequest() {}

    public IngredientRequest(String name, String basicCategory) {
        this.name = name;
        this.basicCategory = basicCategory;
    }
}

package com.kitchencraft.recipe.dto;

import com.kitchencraft.recipe.model.Ingredient;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateRecipeRequest {
    private String name;
    private String type;
    private String description;
    private String origin;
    private Integer time;
    private Integer person;
    private List<Ingredient> ingredients;
    private List<String> steps;
}

package com.kitchencraft.recipe.dto;

import com.kitchencraft.recipe.model.Ingredient;

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
        List<String> steps

) {}

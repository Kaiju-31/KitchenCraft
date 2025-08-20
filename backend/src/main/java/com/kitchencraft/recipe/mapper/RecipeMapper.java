package com.kitchencraft.recipe.mapper;

import com.kitchencraft.recipe.dto.RecipeDto;
import com.kitchencraft.recipe.model.Recipe;

import java.util.stream.Collectors;

public class RecipeMapper {

    public static RecipeDto toDto(Recipe recipe, Integer scaledPerson) {
        final double factor = (scaledPerson != null && recipe.getPerson() != null && recipe.getPerson() > 0)
                ? (double) scaledPerson / recipe.getPerson()
                : 1.0;

        return new RecipeDto(
                recipe.getId(),
                recipe.getName(),
                recipe.getType(),
                recipe.getDescription(),
                recipe.getOrigin(),
                recipe.getPreparationTime(),
                recipe.getCookingTime(),
                recipe.getRestTime(),
                recipe.getTotalTime(),
                recipe.getPerson(),
                scaledPerson != null ? scaledPerson : recipe.getPerson(),
                recipe.getIsBabyFriendly(),
                recipe.getIngredients().stream()
                        .map(ri -> RecipeIngredientMapper.toDto(ri, factor))
                        .collect(Collectors.toList()),
                recipe.getSteps()
        );
    }

}

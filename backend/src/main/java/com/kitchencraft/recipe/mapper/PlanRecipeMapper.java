package com.kitchencraft.recipe.mapper;

import com.kitchencraft.recipe.dto.PlanRecipeDto;
import com.kitchencraft.recipe.model.PlanRecipe;

public class PlanRecipeMapper {

    public static PlanRecipeDto toDto(PlanRecipe planRecipe) {
        if (planRecipe == null) {
            return null;
        }

        PlanRecipeDto dto = new PlanRecipeDto();
        dto.setId(planRecipe.getId());
        dto.setWeeklyPlanId(planRecipe.getWeeklyPlan().getId());
        dto.setRecipe(RecipeMapper.toDto(planRecipe.getRecipe(), planRecipe.getScaledPerson()));
        dto.setPlannedDate(planRecipe.getPlannedDate());
        dto.setMealType(planRecipe.getMealType());
        dto.setScaledPerson(planRecipe.getScaledPerson());
        dto.setAddedDate(planRecipe.getAddedDate());

        return dto;
    }
}
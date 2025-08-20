package com.kitchencraft.recipe.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PlanRecipeRequest {
    private Long recipeId;
    private LocalDate plannedDate;
    private String mealType;
    private Integer scaledPerson;
}
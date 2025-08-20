package com.kitchencraft.recipe.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PlanRecipeDto {
    private Long id;
    private Long weeklyPlanId;
    private RecipeDto recipe;
    private LocalDate plannedDate;
    private String mealType;
    private Integer scaledPerson;
    private LocalDate addedDate;
}
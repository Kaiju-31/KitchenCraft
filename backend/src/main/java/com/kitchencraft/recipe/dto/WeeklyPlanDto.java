package com.kitchencraft.recipe.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class WeeklyPlanDto {
    private Long id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer durationWeeks;
    private String description;
    private LocalDate createdDate;
    private List<PlanRecipeDto> planRecipes;
    private Integer totalRecipes;
}
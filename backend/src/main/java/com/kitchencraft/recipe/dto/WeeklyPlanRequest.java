package com.kitchencraft.recipe.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class WeeklyPlanRequest {
    private String name;
    private LocalDate startDate;
    private Integer durationWeeks;
    private String description;
}
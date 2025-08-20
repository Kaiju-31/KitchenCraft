package com.kitchencraft.recipe.mapper;

import com.kitchencraft.recipe.dto.WeeklyPlanDto;
import com.kitchencraft.recipe.model.WeeklyPlan;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class WeeklyPlanMapper {

    public WeeklyPlanDto toDto(WeeklyPlan weeklyPlan) {
        if (weeklyPlan == null) {
            return null;
        }

        WeeklyPlanDto dto = new WeeklyPlanDto();
        dto.setId(weeklyPlan.getId());
        dto.setName(weeklyPlan.getName());
        dto.setStartDate(weeklyPlan.getStartDate());
        dto.setEndDate(weeklyPlan.getEndDate());
        dto.setDurationWeeks(weeklyPlan.getDurationWeeks());
        dto.setDescription(weeklyPlan.getDescription());
        dto.setCreatedDate(weeklyPlan.getCreatedDate());
        
        if (weeklyPlan.getPlanRecipes() != null) {
            dto.setPlanRecipes(weeklyPlan.getPlanRecipes().stream()
                    .map(PlanRecipeMapper::toDto)
                    .collect(Collectors.toList()));
            dto.setTotalRecipes(weeklyPlan.getPlanRecipes().size());
        } else {
            dto.setTotalRecipes(0);
        }

        return dto;
    }
}
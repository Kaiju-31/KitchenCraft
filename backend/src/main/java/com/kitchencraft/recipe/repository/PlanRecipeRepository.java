package com.kitchencraft.recipe.repository;

import com.kitchencraft.recipe.model.PlanRecipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PlanRecipeRepository extends JpaRepository<PlanRecipe, Long> {

    List<PlanRecipe> findByWeeklyPlanIdOrderByPlannedDateAsc(Long weeklyPlanId);

    List<PlanRecipe> findByWeeklyPlanIdAndPlannedDate(Long weeklyPlanId, LocalDate plannedDate);

    @Query("SELECT pr.recipe.id, COUNT(pr) FROM PlanRecipe pr GROUP BY pr.recipe.id ORDER BY COUNT(pr) DESC")
    List<Object[]> findMostUsedRecipes();

    @Query("SELECT pr FROM PlanRecipe pr WHERE pr.weeklyPlan.id = :planId AND pr.plannedDate BETWEEN :startDate AND :endDate")
    List<PlanRecipe> findByPlanIdAndDateRange(@Param("planId") Long planId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    void deleteByWeeklyPlanIdAndRecipeId(Long weeklyPlanId, Long recipeId);
}
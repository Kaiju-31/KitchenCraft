package com.kitchencraft.recipe.repository;

import com.kitchencraft.recipe.model.ShoppingListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShoppingListItemRepository extends JpaRepository<ShoppingListItem, Long> {

    @Query("SELECT sli FROM ShoppingListItem sli WHERE sli.weeklyPlan.id = :weeklyPlanId ORDER BY sli.ingredient.basicCategory, sli.ingredient.name")
    List<ShoppingListItem> findByWeeklyPlanIdOrderByIngredientBasicCategory(@Param("weeklyPlanId") Long weeklyPlanId);

    List<ShoppingListItem> findByWeeklyPlanIdAndIsValidated(Long weeklyPlanId, Boolean isValidated);

    @Query("SELECT sli.ingredient.id, COUNT(sli) FROM ShoppingListItem sli GROUP BY sli.ingredient.id ORDER BY COUNT(sli) DESC")
    List<Object[]> findMostUsedIngredients();

    @Query("SELECT sli FROM ShoppingListItem sli WHERE sli.weeklyPlan.id = :planId AND sli.ingredient.basicCategory = :basicCategory ORDER BY sli.ingredient.name")
    List<ShoppingListItem> findByPlanIdAndBasicCategory(@Param("planId") Long planId, @Param("basicCategory") String basicCategory);

    void deleteByWeeklyPlanId(Long weeklyPlanId);
}
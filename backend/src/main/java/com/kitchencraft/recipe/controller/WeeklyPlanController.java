package com.kitchencraft.recipe.controller;

import com.kitchencraft.recipe.dto.*;
import com.kitchencraft.recipe.service.WeeklyPlanService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/plans")
public class WeeklyPlanController {

    private final WeeklyPlanService weeklyPlanService;

    public WeeklyPlanController(WeeklyPlanService weeklyPlanService) {
        this.weeklyPlanService = weeklyPlanService;
    }

    @GetMapping
    public ResponseEntity<List<WeeklyPlanDto>> getAllPlans() {
        List<WeeklyPlanDto> plans = weeklyPlanService.getAllPlans();
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WeeklyPlanDto> getPlanById(@PathVariable Long id) {
        return weeklyPlanService.getPlanById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<WeeklyPlanDto> createPlan(@RequestBody WeeklyPlanRequest request) {
        WeeklyPlanDto created = weeklyPlanService.createPlan(request);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WeeklyPlanDto> updatePlan(@PathVariable Long id, @RequestBody WeeklyPlanRequest request) {
        WeeklyPlanDto updated = weeklyPlanService.updatePlan(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        weeklyPlanService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/copy")
    public ResponseEntity<WeeklyPlanDto> copyPlan(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newStartDate) {
        WeeklyPlanDto copied = weeklyPlanService.copyPlan(id, newStartDate);
        return ResponseEntity.ok(copied);
    }

    // Gestion des recettes dans les plannings
    @PostMapping("/{id}/recipes")
    public ResponseEntity<PlanRecipeDto> addRecipeToPlan(
            @PathVariable Long id,
            @RequestBody PlanRecipeRequest request) {
        PlanRecipeDto added = weeklyPlanService.addRecipeToPlan(id, request);
        return ResponseEntity.ok(added);
    }

    @GetMapping("/{id}/recipes")
    public ResponseEntity<List<PlanRecipeDto>> getPlanRecipes(@PathVariable Long id) {
        List<PlanRecipeDto> recipes = weeklyPlanService.getPlanRecipes(id);
        return ResponseEntity.ok(recipes);
    }

    @DeleteMapping("/recipes/{planRecipeId}")
    public ResponseEntity<Void> removeRecipeFromPlan(@PathVariable Long planRecipeId) {
        weeklyPlanService.removeRecipeFromPlan(planRecipeId);
        return ResponseEntity.noContent().build();
    }

    // Gestion des listes de courses
    @PostMapping("/{id}/shopping-list/generate")
    public ResponseEntity<List<ShoppingListItemDto>> generateShoppingList(@PathVariable Long id) {
        List<ShoppingListItemDto> shoppingList = weeklyPlanService.generateShoppingList(id);
        return ResponseEntity.ok(shoppingList);
    }

    @GetMapping("/{id}/shopping-list")
    public ResponseEntity<List<ShoppingListItemDto>> getShoppingList(@PathVariable Long id) {
        List<ShoppingListItemDto> shoppingList = weeklyPlanService.getShoppingList(id);
        return ResponseEntity.ok(shoppingList);
    }

    @PutMapping("/shopping-list/items/{itemId}")
    public ResponseEntity<ShoppingListItemDto> updateShoppingListItem(
            @PathVariable Long itemId,
            @RequestBody ShoppingListItemRequest request) {
        ShoppingListItemDto updated = weeklyPlanService.updateShoppingListItem(itemId, request);
        return ResponseEntity.ok(updated);
    }
}
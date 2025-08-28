package com.kitchencraft.recipe.service;

import com.kitchencraft.recipe.model.*;
import com.kitchencraft.recipe.repository.*;
import com.kitchencraft.recipe.dto.*;
import com.kitchencraft.recipe.mapper.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class WeeklyPlanService {

    private final WeeklyPlanRepository weeklyPlanRepository;
    private final PlanRecipeRepository planRecipeRepository;
    private final ShoppingListItemRepository shoppingListItemRepository;
    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final WeeklyPlanMapper weeklyPlanMapper;

    public WeeklyPlanService(WeeklyPlanRepository weeklyPlanRepository,
                            PlanRecipeRepository planRecipeRepository,
                            ShoppingListItemRepository shoppingListItemRepository,
                            RecipeRepository recipeRepository,
                            IngredientRepository ingredientRepository,
                            WeeklyPlanMapper weeklyPlanMapper) {
        this.weeklyPlanRepository = weeklyPlanRepository;
        this.planRecipeRepository = planRecipeRepository;
        this.shoppingListItemRepository = shoppingListItemRepository;
        this.recipeRepository = recipeRepository;
        this.ingredientRepository = ingredientRepository;
        this.weeklyPlanMapper = weeklyPlanMapper;
    }

    public List<WeeklyPlanDto> getAllPlans() {
        return weeklyPlanRepository.findAllByOrderByCreatedDateDesc()
                .stream()
                .map(weeklyPlanMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<WeeklyPlanDto> getPlanById(Long id) {
        return weeklyPlanRepository.findById(id)
                .map(weeklyPlanMapper::toDto);
    }

    public WeeklyPlanDto createPlan(WeeklyPlanRequest request) {
        WeeklyPlan plan = new WeeklyPlan();
        plan.setName(request.getName());
        plan.setStartDate(request.getStartDate());
        plan.setDurationWeeks(request.getDurationWeeks());
        plan.setEndDate(request.getStartDate().plusWeeks(request.getDurationWeeks()).minusDays(1));
        plan.setDescription(request.getDescription());

        WeeklyPlan saved = weeklyPlanRepository.save(plan);
        return weeklyPlanMapper.toDto(saved);
    }

    public WeeklyPlanDto updatePlan(Long id, WeeklyPlanRequest request) {
        WeeklyPlan plan = weeklyPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Planning non trouvé avec l'id: " + id));

        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        // Note: On ne modifie pas les dates pour préserver la cohérence

        WeeklyPlan saved = weeklyPlanRepository.save(plan);
        return weeklyPlanMapper.toDto(saved);
    }

    public void deletePlan(Long id) {
        weeklyPlanRepository.deleteById(id);
    }

    public PlanRecipeDto addRecipeToPlan(Long planId, PlanRecipeRequest request) {
        WeeklyPlan plan = weeklyPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Planning non trouvé avec l'id: " + planId));

        Recipe recipe = recipeRepository.findById(request.getRecipeId())
                .orElseThrow(() -> new RuntimeException("Recette non trouvée avec l'id: " + request.getRecipeId()));

        PlanRecipe planRecipe = new PlanRecipe();
        planRecipe.setWeeklyPlan(plan);
        planRecipe.setRecipe(recipe);
        planRecipe.setPlannedDate(request.getPlannedDate());
        planRecipe.setMealType(request.getMealType());
        planRecipe.setScaledPerson(request.getScaledPerson());

        PlanRecipe saved = planRecipeRepository.save(planRecipe);
        return PlanRecipeMapper.toDto(saved);
    }

    public List<PlanRecipeDto> getPlanRecipes(Long planId) {
        return planRecipeRepository.findByWeeklyPlanIdOrderByPlannedDateAsc(planId)
                .stream()
                .map(PlanRecipeMapper::toDto)
                .collect(Collectors.toList());
    }

    public void removeRecipeFromPlan(Long planRecipeId) {
        planRecipeRepository.deleteById(planRecipeId);
    }

    public List<ShoppingListItemDto> generateShoppingList(Long planId) {
        List<PlanRecipe> planRecipes = planRecipeRepository.findByWeeklyPlanIdOrderByPlannedDateAsc(planId);
        
        // Supprimer les anciens items de liste de courses
        shoppingListItemRepository.deleteByWeeklyPlanId(planId);
        
        // Regrouper les ingrédients par ingrédient et unité
        Map<String, ShoppingListItem> ingredientMap = new HashMap<>();
        
        for (PlanRecipe planRecipe : planRecipes) {
            Recipe recipe = planRecipe.getRecipe();
            Integer scaledPerson = planRecipe.getScaledPerson();
            Integer originalPerson = recipe.getPerson();
            
            double scaleFactor = scaledPerson != null ? (double) scaledPerson / originalPerson : 1.0;
            
            for (RecipeIngredient recipeIngredient : recipe.getIngredients()) {
                String key = recipeIngredient.getIngredient().getId() + "_" + recipeIngredient.getUnit();
                
                ShoppingListItem item = ingredientMap.get(key);
                if (item == null) {
                    item = new ShoppingListItem();
                    item.setWeeklyPlan(planRecipe.getWeeklyPlan());
                    item.setIngredient(recipeIngredient.getIngredient());
                    item.setUnit(recipeIngredient.getUnit());
                    item.setQuantityNeeded(BigDecimal.ZERO);
                    ingredientMap.put(key, item);
                }
                
                BigDecimal scaledQuantity = BigDecimal.valueOf(recipeIngredient.getQuantity() * scaleFactor);
                item.setQuantityNeeded(item.getQuantityNeeded().add(scaledQuantity));
            }
        }
        
        // Sauvegarder les items
        List<ShoppingListItem> items = new ArrayList<>(ingredientMap.values());
        items = shoppingListItemRepository.saveAll(items);
        
        return items.stream()
                .map(ShoppingListItemMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<ShoppingListItemDto> getShoppingList(Long planId) {
        return shoppingListItemRepository.findByWeeklyPlanIdOrderByIngredientBasicCategory(planId)
                .stream()
                .map(ShoppingListItemMapper::toDto)
                .collect(Collectors.toList());
    }

    public ShoppingListItemDto updateShoppingListItem(Long itemId, ShoppingListItemRequest request) {
        ShoppingListItem item = shoppingListItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item de liste de courses non trouvé avec l'id: " + itemId));

        item.setQuantityOwned(request.getQuantityOwned());
        item.setIsChecked(request.getIsChecked());
        item.setIsValidated(request.getIsValidated());

        ShoppingListItem saved = shoppingListItemRepository.save(item);
        return ShoppingListItemMapper.toDto(saved);
    }

    public WeeklyPlanDto copyPlan(Long planId, LocalDate newStartDate) {
        WeeklyPlan originalPlan = weeklyPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Planning non trouvé avec l'id: " + planId));

        WeeklyPlan newPlan = new WeeklyPlan();
        newPlan.setName("Copie de " + originalPlan.getName());
        newPlan.setStartDate(newStartDate);
        newPlan.setDurationWeeks(originalPlan.getDurationWeeks());
        newPlan.setEndDate(newStartDate.plusWeeks(originalPlan.getDurationWeeks()).minusDays(1));
        newPlan.setDescription(originalPlan.getDescription());

        WeeklyPlan savedPlan = weeklyPlanRepository.save(newPlan);

        // Copier les recettes
        List<PlanRecipe> originalRecipes = planRecipeRepository.findByWeeklyPlanIdOrderByPlannedDateAsc(planId);
        long daysDiff = newStartDate.toEpochDay() - originalPlan.getStartDate().toEpochDay();

        for (PlanRecipe originalRecipe : originalRecipes) {
            PlanRecipe newPlanRecipe = new PlanRecipe();
            newPlanRecipe.setWeeklyPlan(savedPlan);
            newPlanRecipe.setRecipe(originalRecipe.getRecipe());
            newPlanRecipe.setPlannedDate(originalRecipe.getPlannedDate().plusDays(daysDiff));
            newPlanRecipe.setMealType(originalRecipe.getMealType());
            newPlanRecipe.setScaledPerson(originalRecipe.getScaledPerson());
            planRecipeRepository.save(newPlanRecipe);
        }

        return weeklyPlanMapper.toDto(savedPlan);
    }
}
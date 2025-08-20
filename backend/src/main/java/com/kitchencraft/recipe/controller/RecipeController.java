package com.kitchencraft.recipe.controller;

import com.kitchencraft.recipe.dto.RecipeDto;
import com.kitchencraft.recipe.dto.RecipeRequest;
import com.kitchencraft.recipe.service.RecipeService;
import com.kitchencraft.recipe.exception.BusinessException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@Validated
public class RecipeController {

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @GetMapping
    public ResponseEntity<List<RecipeDto>> getAll(@RequestParam(required = false) Integer scaledPerson) {
        List<RecipeDto> recipes = recipeService.getAllRecipes(scaledPerson);
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeDto> getById(
            @PathVariable @Min(value = 1, message = "L'ID de la recette doit être positif") Long id,
            @RequestParam(required = false) 
            @Min(value = 1, message = "Le nombre de personnes doit être d'au moins 1")
            @Max(value = 100, message = "Le nombre de personnes ne peut pas dépasser 100") 
            Integer scaledPerson) {
        return recipeService.getRecipeById(id, scaledPerson)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> BusinessException.notFound("Recette", id));
    }

    @GetMapping("/by-name")
    public ResponseEntity<List<RecipeDto>> getRecipesByName(
            @RequestParam 
            @NotBlank(message = "Le nom de recherche ne peut pas être vide")
            @Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caractères") 
            String name,
            @RequestParam(required = false) 
            @Min(value = 1, message = "Le nombre de personnes doit être d'au moins 1")
            @Max(value = 100, message = "Le nombre de personnes ne peut pas dépasser 100") 
            Integer scaledPerson) {

        List<RecipeDto> recipes = recipeService.searchRecipesByName(name.trim(), scaledPerson);
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/by-ingredients")
    public ResponseEntity<List<RecipeDto>> getByIngredients(
            @RequestParam 
            @NotBlank(message = "La liste des ingrédients ne peut pas être vide")
            @Size(min = 2, max = 500, message = "La liste des ingrédients doit contenir entre 2 et 500 caractères") 
            String ingredients,
            @RequestParam(required = false) 
            @Min(value = 1, message = "Le nombre de personnes doit être d'au moins 1")
            @Max(value = 100, message = "Le nombre de personnes ne peut pas dépasser 100") 
            Integer scaledPerson) {

        List<RecipeDto> recipes = recipeService.searchByIngredientsString(ingredients.trim(), scaledPerson);
        return ResponseEntity.ok(recipes);
    }

    @PostMapping
    public ResponseEntity<RecipeDto> create(@Valid @RequestBody RecipeRequest request) {
        RecipeDto created = recipeService.createRecipe(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecipeDto> update(
            @PathVariable @Min(value = 1, message = "L'ID de la recette doit être positif") Long id, 
            @Valid @RequestBody RecipeRequest request) {
        RecipeDto updated = recipeService.updateRecipe(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count() {
        long count = recipeService.countAllRecipes();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<List<String>> autocomplete(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {

        List<String> results = recipeService.autocompleteRecipes(q, limit);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/popular")
    public ResponseEntity<List<String>> getPopularRecipes(
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "false") boolean fromPlans) {

        List<String> popular = fromPlans ? 
                recipeService.getPopularRecipesFromPlans(limit) :
                recipeService.getPopularRecipes(limit);
        return ResponseEntity.ok(popular);
    }

    @GetMapping("/search-prefix")
    public ResponseEntity<List<String>> searchByPrefix(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {

        List<String> results = recipeService.findRecipesByPrefix(q, limit);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/search-contains")
    public ResponseEntity<List<String>> searchContaining(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {

        List<String> results = recipeService.findRecipesContaining(q, limit);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<RecipeDto>> filterRecipes(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) List<String> ingredients,
            @RequestParam(required = false) Integer minTime,
            @RequestParam(required = false) Integer maxTime,
            @RequestParam(required = false) List<String> origins,
            @RequestParam(required = false) Boolean isBabyFriendly,
            @RequestParam(required = false) Integer scaledPerson) {

        List<RecipeDto> recipes = recipeService.filterRecipes(
                searchTerm, ingredients, minTime, maxTime, origins, isBabyFriendly, scaledPerson);
        
        return recipes.isEmpty() ?
                ResponseEntity.ok(recipes) :  // Retourner 200 avec liste vide au lieu de 404
                ResponseEntity.ok(recipes);
    }

    @GetMapping("/origins")
    public ResponseEntity<List<String>> getAllOrigins() {
        List<String> origins = recipeService.getAllOrigins();
        return ResponseEntity.ok(origins);
    }
}
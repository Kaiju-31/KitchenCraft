package com.kitchencraft.recipe.controller;

import com.kitchencraft.recipe.dto.IngredientDto;
import com.kitchencraft.recipe.dto.IngredientRequest;
import com.kitchencraft.recipe.service.IngredientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ingredients")
public class IngredientController {

    private final IngredientService ingredientService;

    public IngredientController(IngredientService ingredientService) {
        this.ingredientService = ingredientService;
    }

    @PostMapping
    public ResponseEntity<IngredientDto> createIngredient(@RequestBody IngredientRequest request) {
        return ResponseEntity.ok(ingredientService.createIngredient(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IngredientDto> updateIngredient(@PathVariable Long id, @RequestBody IngredientRequest request) {
        return ResponseEntity.ok(ingredientService.updateIngredient(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIngredient(@PathVariable Long id) {
        ingredientService.deleteIngredient(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<IngredientDto>> getAllIngredients() {
        return ResponseEntity.ok(ingredientService.getAllIngredients());
    }

    @GetMapping("/by-name")
    public ResponseEntity<IngredientDto> getIngredientByName(@RequestParam String name) {
        return ResponseEntity.ok(ingredientService.getIngredientByName(name));
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<List<String>> autocomplete(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {

        List<String> results = ingredientService.autocompleteIngredients(q, limit);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/popular")
    public ResponseEntity<List<String>> getPopularIngredients(
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "false") boolean fromPlans) {

        List<String> popular = fromPlans ? 
                ingredientService.getPopularIngredientsFromPlans(limit) :
                ingredientService.getPopularIngredients(limit);
        return ResponseEntity.ok(popular);
    }

    @GetMapping("/search-prefix")
    public ResponseEntity<List<String>> searchByPrefix(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {

        List<String> results = ingredientService.findIngredientsByPrefix(q, limit);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/search-contains")
    public ResponseEntity<List<String>> searchContaining(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {

        List<String> results = ingredientService.findIngredientsContaining(q, limit);
        return ResponseEntity.ok(results);
    }
}

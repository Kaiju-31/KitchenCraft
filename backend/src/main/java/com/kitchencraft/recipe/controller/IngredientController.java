package com.kitchencraft.recipe.controller;

import com.kitchencraft.recipe.dto.IngredientDto;
import com.kitchencraft.recipe.dto.IngredientRequest;
import com.kitchencraft.recipe.service.IngredientService;
import com.kitchencraft.recipe.model.Ingredient;
import com.kitchencraft.recipe.mapper.IngredientMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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

    // Nouveaux endpoints pour le système nutritionnel fusionné
    
    @GetMapping("/search")
    public ResponseEntity<List<IngredientDto>> searchIngredients(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String basicCategory) {
        List<IngredientDto> results = ingredientService.findByFilters(name, basicCategory);
        return ResponseEntity.ok(results);
    }
    
    @GetMapping("/category/{basicCategory}")
    public ResponseEntity<List<IngredientDto>> getByBasicCategory(@PathVariable String basicCategory) {
        List<IngredientDto> results = ingredientService.findByBasicCategory(basicCategory);
        return ResponseEntity.ok(results);
    }
    
    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<IngredientDto> findByBarcode(@PathVariable String barcode) {
        return ingredientService.findByBarcode(barcode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search-barcode/{barcode}")
    public ResponseEntity<IngredientDto> searchByBarcode(@PathVariable String barcode) {
        IngredientDto result = ingredientService.searchByBarcodeWithFallback(barcode);
        return result != null ? ResponseEntity.ok(result) : ResponseEntity.notFound().build();
    }
    
    @GetMapping("/search-openfoodfacts/{barcode}")
    public ResponseEntity<IngredientDto> searchOpenFoodFactsOnly(@PathVariable String barcode) {
        IngredientDto result = ingredientService.searchOpenFoodFactsOnly(barcode);
        return result != null ? ResponseEntity.ok(result) : ResponseEntity.notFound().build();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<IngredientDto> getIngredientById(@PathVariable Long id) {
        return ResponseEntity.ok(ingredientService.getIngredientById(id));
    }
    
    @PostMapping("/save")
    public ResponseEntity<IngredientDto> saveIngredient(@RequestBody Map<String, Object> ingredientData) {
        try {
            System.out.println("=== DEBUG BACKEND SAVE ===");
            System.out.println("Données reçues: " + ingredientData);
            
            // Convertir la Map en IngredientDto de manière flexible
            IngredientDto ingredientDto = convertToIngredientDto(ingredientData);
            System.out.println("DTO converti: " + ingredientDto);
            
            IngredientDto result = ingredientService.saveIngredient(ingredientDto);
            System.out.println("Sauvegarde réussie: " + result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("=== ERREUR BACKEND SAVE ===");
            System.err.println("Données reçues: " + ingredientData);
            System.err.println("Erreur: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
    
    // Helper methods pour conversions sûres
    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return null;
        if (value instanceof Number) {
            return BigDecimal.valueOf(((Number) value).doubleValue());
        }
        if (value instanceof String str) {
            try {
                return new BigDecimal(str);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
    
    private LocalDateTime toLocalDateTime(Object value) {
        if (value == null) return null;
        if (value instanceof String str && !str.isEmpty()) {
            try {
                return LocalDateTime.parse(str);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }
    
    private Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Long) return (Long) value;
        if (value instanceof Number) return ((Number) value).longValue();
        if (value instanceof String str) {
            try {
                return Long.parseLong(str);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
    
    private IngredientDto convertToIngredientDto(Map<String, Object> data) {
        return new IngredientDto(
            toLong(data.get("id")),
            (String) data.get("name"),
            (String) data.get("category"),
            
            // Nouveaux champs
            (String) data.get("brand"),
            (String) data.get("barcode"),
            (String) data.get("basicCategory"),
            (String) data.get("openFoodFactsId"),
            (String) data.get("dataSource"),
            toLocalDateTime(data.get("lastSync")),
            toLocalDateTime(data.get("createdAt")),
            toLocalDateTime(data.get("updatedAt")),
            
            // Macronutriments
            toBigDecimal(data.get("energy")),
            toBigDecimal(data.get("energyKcal")),
            toBigDecimal(data.get("carbohydrates")),
            toBigDecimal(data.get("sugars")),
            toBigDecimal(data.get("fiber")),
            toBigDecimal(data.get("fat")),
            toBigDecimal(data.get("saturatedFat")),
            toBigDecimal(data.get("monounsaturatedFat")),
            toBigDecimal(data.get("polyunsaturatedFat")),
            toBigDecimal(data.get("transFat")),
            toBigDecimal(data.get("protein")),
            toBigDecimal(data.get("salt")),
            toBigDecimal(data.get("sodium")),
            toBigDecimal(data.get("alcohol")),
            
            // Vitamines
            toBigDecimal(data.get("vitaminA")),
            toBigDecimal(data.get("vitaminB1")),
            toBigDecimal(data.get("vitaminB2")),
            toBigDecimal(data.get("vitaminB3")),
            toBigDecimal(data.get("vitaminB5")),
            toBigDecimal(data.get("vitaminB6")),
            toBigDecimal(data.get("vitaminB7")),
            toBigDecimal(data.get("vitaminB9")),
            toBigDecimal(data.get("vitaminB12")),
            toBigDecimal(data.get("vitaminC")),
            toBigDecimal(data.get("vitaminD")),
            toBigDecimal(data.get("vitaminE")),
            toBigDecimal(data.get("vitaminK")),
            
            // Minéraux
            toBigDecimal(data.get("calcium")),
            toBigDecimal(data.get("iron")),
            toBigDecimal(data.get("magnesium")),
            toBigDecimal(data.get("phosphorus")),
            toBigDecimal(data.get("potassium")),
            toBigDecimal(data.get("zinc")),
            toBigDecimal(data.get("copper")),
            toBigDecimal(data.get("manganese")),
            toBigDecimal(data.get("selenium")),
            toBigDecimal(data.get("iodine")),
            toBigDecimal(data.get("chromium")),
            toBigDecimal(data.get("molybdenum")),
            toBigDecimal(data.get("fluoride"))
        );
    }
    
    @PostMapping("/{id}/sync")
    public ResponseEntity<IngredientDto> syncWithOpenFoodFacts(@PathVariable Long id) {
        try {
            IngredientDto synced = ingredientService.syncWithOpenFoodFacts(id);
            return ResponseEntity.ok(synced);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/stats/nutritional")
    public ResponseEntity<Long> countWithNutritionalData() {
        return ResponseEntity.ok(ingredientService.countItemsWithNutritionalData());
    }
    
    @GetMapping("/stats/openfoodfacts")
    public ResponseEntity<Long> countFromOpenFoodFacts() {
        return ResponseEntity.ok(ingredientService.countItemsFromOpenFoodFacts());
    }
    
    @GetMapping("/openfoodfacts")
    public ResponseEntity<List<IngredientDto>> getAllFromOpenFoodFacts() {
        return ResponseEntity.ok(ingredientService.findAllFromOpenFoodFacts());
    }
    
    @GetMapping("/manual")
    public ResponseEntity<List<IngredientDto>> getAllManual() {
        return ResponseEntity.ok(ingredientService.findAllManual());
    }

}

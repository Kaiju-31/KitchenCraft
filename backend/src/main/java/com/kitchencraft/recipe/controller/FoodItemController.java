package com.kitchencraft.recipe.controller;

import com.kitchencraft.recipe.model.FoodItem;
import com.kitchencraft.recipe.service.FoodItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/food-items")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class FoodItemController {

    private final FoodItemService foodItemService;

    @GetMapping
    public ResponseEntity<List<FoodItem>> getAllFoodItems(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String basicCategory) {
        
        List<FoodItem> foodItems;
        
        if (name != null || basicCategory != null) {
            foodItems = foodItemService.findByFilters(name, basicCategory);
        } else {
            foodItems = foodItemService.findAll();
        }
        
        return ResponseEntity.ok(foodItems);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItem> getFoodItemById(@PathVariable Long id) {
        Optional<FoodItem> foodItem = foodItemService.findById(id);
        return foodItem.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search/{barcode}")
    public ResponseEntity<FoodItem> searchByBarcode(@PathVariable String barcode) {
        FoodItem foodItem = foodItemService.searchByBarcodeWithFallback(barcode);
        if (foodItem != null) {
            return ResponseEntity.ok(foodItem);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/category/{basicCategory}")
    public ResponseEntity<List<FoodItem>> getFoodItemsByCategory(@PathVariable String basicCategory) {
        List<FoodItem> foodItems = foodItemService.findByBasicCategory(basicCategory);
        return ResponseEntity.ok(foodItems);
    }

    @PostMapping
    public ResponseEntity<FoodItem> createFoodItem(@RequestBody FoodItem foodItem) {
        try {
            // S'assurer que les champs obligatoires sont présents
            if (foodItem.getName() == null || foodItem.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (foodItem.getBasicCategory() == null || foodItem.getBasicCategory().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            FoodItem savedFoodItem = foodItemService.save(foodItem);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedFoodItem);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodItem> updateFoodItem(@PathVariable Long id, @RequestBody FoodItem foodItem) {
        try {
            Optional<FoodItem> existingFoodItem = foodItemService.findById(id);
            if (existingFoodItem.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            foodItem.setId(id);
            foodItem.setCreatedAt(existingFoodItem.get().getCreatedAt());
            FoodItem updatedFoodItem = foodItemService.save(foodItem);
            return ResponseEntity.ok(updatedFoodItem);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoodItem(@PathVariable Long id) {
        try {
            Optional<FoodItem> existingFoodItem = foodItemService.findById(id);
            if (existingFoodItem.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            foodItemService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/sync")
    public ResponseEntity<FoodItem> syncWithOpenFoodFacts(@PathVariable Long id) {
        try {
            FoodItem syncedFoodItem = foodItemService.syncWithOpenFoodFacts(id);
            return ResponseEntity.ok(syncedFoodItem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        try {
            Map<String, Object> stats = Map.of(
                "total", foodItemService.findAll().size(),
                "withNutritionalData", foodItemService.countItemsWithNutritionalData(),
                "fromOpenFoodFacts", foodItemService.countItemsFromOpenFoodFacts(),
                "manual", foodItemService.findAllManual().size()
            );
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
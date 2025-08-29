package com.kitchencraft.recipe.service;

import com.kitchencraft.recipe.model.FoodItem;
import com.kitchencraft.recipe.repository.FoodItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;
    private final OpenFoodFactsService openFoodFactsService;

    public List<FoodItem> findAll() {
        return foodItemRepository.findAll();
    }

    public Optional<FoodItem> findById(Long id) {
        return foodItemRepository.findById(id);
    }

    public List<FoodItem> findByFilters(String name, String basicCategory) {
        return foodItemRepository.findByFilters(name, basicCategory);
    }

    public List<FoodItem> findByBasicCategory(String basicCategory) {
        return foodItemRepository.findByBasicCategory(basicCategory);
    }

    public Optional<FoodItem> findByBarcode(String barcode) {
        return foodItemRepository.findByBarcode(barcode);
    }

    public FoodItem searchByBarcodeWithFallback(String barcode) {
        // D'abord vérifier en base de données
        Optional<FoodItem> existingItem = findByBarcode(barcode);
        if (existingItem.isPresent()) {
            return existingItem.get();
        }

        // Sinon chercher dans OpenFoodFacts
        FoodItem fromApi = openFoodFactsService.searchByBarcode(barcode);
        if (fromApi != null) {
            // Sauvegarder en base
            return save(fromApi);
        }

        // Si pas trouvé, retourner null (permet la saisie manuelle)
        return null;
    }

    public FoodItem save(FoodItem foodItem) {
        if (foodItem.getId() == null) {
            foodItem.setCreatedAt(LocalDateTime.now());
        } else {
            foodItem.setUpdatedAt(LocalDateTime.now());
        }
        return foodItemRepository.save(foodItem);
    }

    public void deleteById(Long id) {
        foodItemRepository.deleteById(id);
    }

    public long countByBasicCategory(String category) {
        return foodItemRepository.countByBasicCategory(category);
    }

    public List<FoodItem> findAllFromOpenFoodFacts() {
        return foodItemRepository.findAllFromOpenFoodFacts();
    }

    public List<FoodItem> findAllManual() {
        return foodItemRepository.findAllManual();
    }

    public FoodItem syncWithOpenFoodFacts(Long id) {
        Optional<FoodItem> foodItemOpt = findById(id);
        if (foodItemOpt.isEmpty()) {
            throw new RuntimeException("FoodItem not found with id: " + id);
        }

        FoodItem foodItem = foodItemOpt.get();
        if (foodItem.getBarcode() == null) {
            throw new RuntimeException("Cannot sync item without barcode");
        }

        FoodItem updated = openFoodFactsService.searchByBarcode(foodItem.getBarcode());
        if (updated == null) {
            throw new RuntimeException("Product not found in OpenFoodFacts");
        }

        // Conserver l'ID existant et mettre à jour les données
        updated.setId(foodItem.getId());
        updated.setCreatedAt(foodItem.getCreatedAt());
        
        return save(updated);
    }

    // Statistiques nutritionnelles
    public long countItemsWithNutritionalData() {
        return foodItemRepository.findAll().stream()
                .filter(FoodItem::hasNutritionalData)
                .count();
    }

    public long countItemsFromOpenFoodFacts() {
        return foodItemRepository.findAll().stream()
                .filter(FoodItem::isFromOpenFoodFacts)
                .count();
    }
}
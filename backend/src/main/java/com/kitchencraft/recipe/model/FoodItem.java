package com.kitchencraft.recipe.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "food_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String brand;

    @Column(unique = true)
    private String barcode;

    @Column(nullable = false)
    private String category;

    @Column(name = "basic_category", nullable = false)
    private String basicCategory;

    @Column(name = "openfoodfacts_id")
    private String openFoodFactsId;

    @Column(name = "data_source")
    private String dataSource = "MANUAL";

    @Column(name = "last_sync")
    private LocalDateTime lastSync;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Macronutrients per 100g (all nullable)
    @Column(precision = 8, scale = 3)
    private BigDecimal energy; // kJ

    @Column(name = "energy_kcal", precision = 8, scale = 3)
    private BigDecimal energyKcal; // kcal

    @Column(precision = 8, scale = 3)
    private BigDecimal carbohydrates; // g

    @Column(precision = 8, scale = 3)
    private BigDecimal sugars; // g

    @Column(precision = 8, scale = 3)
    private BigDecimal fiber; // g

    @Column(precision = 8, scale = 3)
    private BigDecimal fat; // g

    @Column(name = "saturated_fat", precision = 8, scale = 3)
    private BigDecimal saturatedFat; // g

    @Column(name = "monounsaturated_fat", precision = 8, scale = 3)
    private BigDecimal monounsaturatedFat; // g

    @Column(name = "polyunsaturated_fat", precision = 8, scale = 3)
    private BigDecimal polyunsaturatedFat; // g

    @Column(name = "trans_fat", precision = 8, scale = 3)
    private BigDecimal transFat; // g

    @Column(precision = 8, scale = 3)
    private BigDecimal protein; // g

    @Column(precision = 8, scale = 3)
    private BigDecimal salt; // g

    @Column(precision = 8, scale = 3)
    private BigDecimal sodium; // mg

    @Column(precision = 8, scale = 3)
    private BigDecimal alcohol; // g

    // Vitamins (all nullable, in mg unless specified)
    @Column(name = "vitamin_a", precision = 8, scale = 3)
    private BigDecimal vitaminA; // µg

    @Column(name = "vitamin_b1", precision = 8, scale = 3)
    private BigDecimal vitaminB1; // mg

    @Column(name = "vitamin_b2", precision = 8, scale = 3)
    private BigDecimal vitaminB2; // mg

    @Column(name = "vitamin_b3", precision = 8, scale = 3)
    private BigDecimal vitaminB3; // mg

    @Column(name = "vitamin_b5", precision = 8, scale = 3)
    private BigDecimal vitaminB5; // mg

    @Column(name = "vitamin_b6", precision = 8, scale = 3)
    private BigDecimal vitaminB6; // mg

    @Column(name = "vitamin_b7", precision = 8, scale = 3)
    private BigDecimal vitaminB7; // µg

    @Column(name = "vitamin_b9", precision = 8, scale = 3)
    private BigDecimal vitaminB9; // µg

    @Column(name = "vitamin_b12", precision = 8, scale = 3)
    private BigDecimal vitaminB12; // µg

    @Column(name = "vitamin_c", precision = 8, scale = 3)
    private BigDecimal vitaminC; // mg

    @Column(name = "vitamin_d", precision = 8, scale = 3)
    private BigDecimal vitaminD; // µg

    @Column(name = "vitamin_e", precision = 8, scale = 3)
    private BigDecimal vitaminE; // mg

    @Column(name = "vitamin_k", precision = 8, scale = 3)
    private BigDecimal vitaminK; // µg

    // Minerals (all nullable, in mg unless specified)
    @Column(precision = 8, scale = 3)
    private BigDecimal calcium; // mg

    @Column(precision = 8, scale = 3)
    private BigDecimal iron; // mg

    @Column(precision = 8, scale = 3)
    private BigDecimal magnesium; // mg

    @Column(precision = 8, scale = 3)
    private BigDecimal phosphorus; // mg

    @Column(precision = 8, scale = 3)
    private BigDecimal potassium; // mg

    @Column(precision = 8, scale = 3)
    private BigDecimal zinc; // mg

    @Column(precision = 8, scale = 3)
    private BigDecimal copper; // mg

    @Column(precision = 8, scale = 3)
    private BigDecimal manganese; // mg

    @Column(precision = 8, scale = 3)
    private BigDecimal selenium; // µg

    @Column(precision = 8, scale = 3)
    private BigDecimal iodine; // µg

    @Column(precision = 8, scale = 3)
    private BigDecimal chromium; // µg

    @Column(precision = 8, scale = 3)
    private BigDecimal molybdenum; // µg

    @Column(precision = 8, scale = 3)
    private BigDecimal fluoride; // mg

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper method to determine if this item has nutritional data
    public boolean hasNutritionalData() {
        return energy != null || energyKcal != null || 
               carbohydrates != null || protein != null || fat != null;
    }

    // Helper method to check if this is from OpenFoodFacts
    public boolean isFromOpenFoodFacts() {
        return "OPENFOODFACTS".equals(dataSource) && openFoodFactsId != null;
    }
}
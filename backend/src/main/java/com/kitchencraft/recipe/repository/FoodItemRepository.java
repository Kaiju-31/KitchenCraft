package com.kitchencraft.recipe.repository;

import com.kitchencraft.recipe.model.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    
    Optional<FoodItem> findByBarcode(String barcode);
    
    Optional<FoodItem> findByOpenFoodFactsId(String openFoodFactsId);
    
    List<FoodItem> findByBasicCategory(String basicCategory);
    
    List<FoodItem> findByCategoryContainingIgnoreCase(String category);
    
    @Query("SELECT f FROM FoodItem f WHERE LOWER(f.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<FoodItem> findByNameContainingIgnoreCase(@Param("name") String name);
    
    @Query("SELECT f FROM FoodItem f WHERE " +
           "(:name IS NULL OR LOWER(f.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:basicCategory IS NULL OR f.basicCategory = :basicCategory)")
    List<FoodItem> findByFilters(@Param("name") String name, @Param("basicCategory") String basicCategory);
    
    @Query("SELECT f FROM FoodItem f WHERE f.dataSource = 'OPENFOODFACTS'")
    List<FoodItem> findAllFromOpenFoodFacts();
    
    @Query("SELECT f FROM FoodItem f WHERE f.dataSource = 'MANUAL'")
    List<FoodItem> findAllManual();
    
    @Query("SELECT COUNT(f) FROM FoodItem f WHERE f.basicCategory = :category")
    long countByBasicCategory(@Param("category") String category);
}
package com.kitchencraft.recipe.repository;

import com.kitchencraft.recipe.model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    Optional<Ingredient> findByNameIgnoreCase(String name);

    // Autocomplétion basique
    @Query("SELECT i.name FROM Ingredient i WHERE LOWER(i.name) LIKE LOWER(CONCAT(:prefix, '%')) ORDER BY i.name")
    List<String> findIngredientNamesByPrefix(@Param("prefix") String prefix, Pageable pageable);

    // Autocomplétion plus souple (contient le texte)
    @Query("SELECT i.name FROM Ingredient i WHERE LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY i.name")
    List<String> findIngredientNamesContaining(@Param("search") String search, Pageable pageable);

    // Recherche par catégorie aussi
    @Query("""
        SELECT i.name FROM Ingredient i 
        WHERE (LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%')) 
               OR LOWER(i.category) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY 
            CASE WHEN LOWER(i.name) LIKE LOWER(CONCAT(:search, '%')) THEN 1 ELSE 2 END,
            i.name
    """)
    List<String> findIngredientNamesWithCategory(@Param("search") String search, Pageable pageable);

    // Catégorie la plus utilisée
    @Query("""
        SELECT i.category
        FROM Ingredient i
        GROUP BY i.category
        ORDER BY COUNT(i) DESC
        LIMIT 1
    """)
    Optional<String> findMostUsedCategory();

    // Ingrédients orphelins (non utilisés dans aucune recette)
    @Query("""
        SELECT i.name
        FROM Ingredient i
        WHERE i.id NOT IN (
            SELECT DISTINCT ri.ingredient.id
            FROM RecipeIngredient ri
        )
    """)
    List<String> findOrphanIngredients();

    // Supprimer par nom
    void deleteByName(String name);

    // Nouvelles méthodes pour le système nutritionnel fusionné
    
    @Query("""
        SELECT i FROM Ingredient i
        WHERE (:name IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', :name, '%')))
        AND (:basicCategory IS NULL OR i.basicCategory = :basicCategory)
        """)
    List<Ingredient> findByFilters(@Param("name") String name, @Param("basicCategory") String basicCategory);
    
    List<Ingredient> findByBasicCategory(String basicCategory);
    
    Optional<Ingredient> findByBarcode(String barcode);
    
    long countByBasicCategory(String basicCategory);
    
    @Query("SELECT i FROM Ingredient i WHERE i.dataSource = 'OPENFOODFACTS'")
    List<Ingredient> findAllFromOpenFoodFacts();
    
    @Query("SELECT i FROM Ingredient i WHERE i.dataSource = 'MANUAL'")
    List<Ingredient> findAllManual();
    
    @Query("SELECT i FROM Ingredient i WHERE i.openFoodFactsId IS NOT NULL")
    List<Ingredient> findAllWithOpenFoodFactsId();
    
    Optional<Ingredient> findByOpenFoodFactsId(String openFoodFactsId);
    
    @Query("SELECT i FROM Ingredient i WHERE i.brand IS NOT NULL ORDER BY i.brand")
    List<Ingredient> findAllWithBrand();
    
    @Query("SELECT DISTINCT i.brand FROM Ingredient i WHERE i.brand IS NOT NULL ORDER BY i.brand")
    List<String> findAllBrands();
    
    @Query("SELECT DISTINCT i.basicCategory FROM Ingredient i WHERE i.basicCategory IS NOT NULL ORDER BY i.basicCategory")
    List<String> findAllBasicCategories();

}

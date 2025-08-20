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

}

package com.kitchencraft.recipe.repository;

import com.kitchencraft.recipe.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByNameContainingIgnoreCase(String name);

    @Query("""
    SELECT DISTINCT r
    FROM Recipe r
    JOIN r.ingredients ri
    JOIN ri.ingredient i
    WHERE LOWER(i.name) IN :ingredientNames
    GROUP BY r.id
    HAVING COUNT(DISTINCT LOWER(i.name)) = :ingredientCount
    """)
    List<Recipe> findByIngredientNames(@Param("ingredientNames") List<String> ingredientNames,
                                       @Param("ingredientCount") long ingredientCount);

    // Autocomplétion par préfixe
    @Query("SELECT r.name FROM Recipe r WHERE LOWER(r.name) LIKE LOWER(CONCAT(:prefix, '%')) ORDER BY r.name")
    List<String> findRecipeNamesByPrefix(@Param("prefix") String prefix, Pageable pageable);

    // Autocomplétion contenant le texte
    @Query("SELECT r.name FROM Recipe r WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY r.name")
    List<String> findRecipeNamesContaining(@Param("search") String search, Pageable pageable);

    // Recherche incluant le type de recette
    @Query("""
        SELECT r.name FROM Recipe r 
        WHERE (LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) 
               OR LOWER(r.type) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY 
            CASE WHEN LOWER(r.name) LIKE LOWER(CONCAT(:search, '%')) THEN 1 ELSE 2 END,
            r.name
    """)
    List<String> findRecipeNamesWithType(@Param("search") String search, Pageable pageable);

    // Test simple : filtrage par temps seulement
    @Query("""
        SELECT r
        FROM Recipe r
        WHERE (:minTime IS NULL OR r.totalTime >= :minTime)
        AND (:maxTime IS NULL OR r.totalTime <= :maxTime)
    """)
    List<Recipe> findRecipesByTimeRange(
            @Param("minTime") Integer minTime,
            @Param("maxTime") Integer maxTime
    );

    // Test simple : filtrage par origine seulement
    @Query("""
        SELECT r
        FROM Recipe r
        WHERE r.origin = :origin
    """)
    List<Recipe> findRecipesByOrigin(@Param("origin") String origin);

    // Filtrage simple pour bébé uniquement
    @Query("SELECT r FROM Recipe r WHERE r.isBabyFriendly = :isBabyFriendly")
    List<Recipe> findByIsBabyFriendly(@Param("isBabyFriendly") Boolean isBabyFriendly);
    
    // Filtrage par nom uniquement
    @Query("SELECT r FROM Recipe r WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Recipe> findByNameContaining(@Param("searchTerm") String searchTerm);
    
    // Filtrage par temps uniquement  
    @Query("SELECT r FROM Recipe r WHERE r.totalTime >= :minTime AND r.totalTime <= :maxTime")
    List<Recipe> findByTimeRange(@Param("minTime") Integer minTime, @Param("maxTime") Integer maxTime);
    
    // Filtrage par origine uniquement
    @Query("SELECT r FROM Recipe r WHERE r.origin IN :origins")
    List<Recipe> findByOriginIn(@Param("origins") List<String> origins);

    // Filtrage simple par ingrédients (reprise de l'ancienne méthode)
    @Query("""
        SELECT DISTINCT r
        FROM Recipe r
        JOIN r.ingredients ri
        JOIN ri.ingredient i
        WHERE LOWER(i.name) IN :ingredientNames
        GROUP BY r.id
        HAVING COUNT(DISTINCT LOWER(i.name)) = :ingredientCount
    """)
    List<Recipe> findRecipesWithIngredients(
            @Param("ingredientNames") List<String> ingredientNames,
            @Param("ingredientCount") long ingredientCount
    );

    // Obtenir toutes les origines distinctes
    @Query("SELECT DISTINCT r.origin FROM Recipe r WHERE r.origin IS NOT NULL ORDER BY r.origin")
    List<String> findAllDistinctOrigins();

    // Origine la plus populaire
    @Query("""
        SELECT r.origin
        FROM Recipe r
        WHERE r.origin IS NOT NULL
        GROUP BY r.origin
        ORDER BY COUNT(r) DESC
        LIMIT 1
    """)
    Optional<String> findMostPopularOrigin();

}

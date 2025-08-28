package com.kitchencraft.recipe.repository;

import com.kitchencraft.recipe.model.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, Long> {
    
    // Compter combien de recettes utilisent un ingrédient donné
    long countByIngredient_Id(Long ingredientId);
    
    // Récupérer les noms des recettes qui utilisent un ingrédient donné
    @Query("SELECT r.name FROM RecipeIngredient ri JOIN ri.recipe r WHERE ri.ingredient.id = :ingredientId")
    List<String> findRecipeNamesByIngredientId(@Param("ingredientId") Long ingredientId);
    
    // Récupérer tous les RecipeIngredient pour un ingrédient donné
    List<RecipeIngredient> findByIngredient_Id(Long ingredientId);
}
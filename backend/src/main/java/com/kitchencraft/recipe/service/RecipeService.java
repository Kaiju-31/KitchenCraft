package com.kitchencraft.recipe.service;

import com.kitchencraft.recipe.dto.*;
import com.kitchencraft.recipe.mapper.RecipeMapper;
import com.kitchencraft.recipe.model.*;
import com.kitchencraft.recipe.repository.IngredientRepository;
import com.kitchencraft.recipe.repository.RecipeRepository;
import com.kitchencraft.recipe.repository.PlanRecipeRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final PlanRecipeRepository planRecipeRepository;

    public RecipeService(RecipeRepository recipeRepository,
                         IngredientRepository ingredientRepository,
                         PlanRecipeRepository planRecipeRepository) {
        this.recipeRepository = recipeRepository;
        this.ingredientRepository = ingredientRepository;
        this.planRecipeRepository = planRecipeRepository;
    }

    public List<RecipeDto> getAllRecipes(Integer scaledPerson) {
        return recipeRepository.findAll().stream()
                .map(r -> RecipeMapper.toDto(r, scaledPerson))
                .toList();
    }

    public Optional<RecipeDto> getRecipeById(Long id, Integer scaledPerson) {
        return recipeRepository.findById(id)
                .map(r -> RecipeMapper.toDto(r, scaledPerson));
    }

    public List<RecipeDto> searchRecipesByName(String name, Integer scaledPerson) {
        if (name == null || name.trim().isEmpty()) {
            return List.of();
        }

        return recipeRepository.findByNameContainingIgnoreCase(name.trim())
                .stream()
                .map(recipe -> RecipeMapper.toDto(recipe, scaledPerson))
                .toList();
    }

    @Transactional
    public RecipeDto createRecipe(RecipeRequest request) {
        Recipe recipe = new Recipe();
        applyBasicFields(recipe, request);

        // populate recipe ingredients
        if (request.getIngredients() != null) {
            request.getIngredients().forEach(riReq -> {
                Ingredient ingredient = ingredientRepository
                        .findByNameIgnoreCase(riReq.getIngredientName())
                        .orElseGet(() -> {
                            Ingredient newIng = new Ingredient();
                            newIng.setName(riReq.getIngredientName());
                            newIng.setCategory(riReq.getIngredientCategory());
                            return ingredientRepository.save(newIng);
                        });

                RecipeIngredient ri = new RecipeIngredient();
                ri.setRecipe(recipe);
                ri.setIngredient(ingredient);
                ri.setQuantity(riReq.getQuantity());
                ri.setUnit(riReq.getUnit());

                recipe.getIngredients().add(ri);
            });
        }

        Recipe saved = recipeRepository.save(recipe);
        return RecipeMapper.toDto(saved, null);
    }

    @Transactional
    public RecipeDto updateRecipe(Long id, RecipeRequest request) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));

        applyBasicFields(recipe, request);

        // replace ingredients: clear then re-add (or use smarter diffing)
        recipe.getIngredients().clear();

        if (request.getIngredients() != null) {
            request.getIngredients().forEach(riReq -> {
                Ingredient ingredient = ingredientRepository
                        .findByNameIgnoreCase(riReq.getIngredientName())
                        .orElseGet(() -> {
                            Ingredient newIng = new Ingredient();
                            newIng.setName(riReq.getIngredientName());
                            newIng.setCategory(riReq.getIngredientCategory());
                            return ingredientRepository.save(newIng);
                        });

                RecipeIngredient ri = new RecipeIngredient();
                ri.setRecipe(recipe);
                ri.setIngredient(ingredient);
                ri.setQuantity(riReq.getQuantity());
                ri.setUnit(riReq.getUnit());

                recipe.getIngredients().add(ri);
            });
        }

        Recipe saved = recipeRepository.save(recipe);
        return RecipeMapper.toDto(saved, null);
    }

    @Transactional
    public void deleteRecipe(Long id) {
        if (!recipeRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found");
        }
        recipeRepository.deleteById(id);
    }

    @Transactional
    public List<RecipeDto> searchByIngredients(List<String> ingredientNames, Integer scaledPerson) {
        if (ingredientNames == null || ingredientNames.isEmpty()) {
            return List.of();
        }

        List<String> lowered = ingredientNames.stream()
                .map(String::toLowerCase)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .toList();

        if (lowered.isEmpty()) {
            return List.of();
        }

        return recipeRepository.findByIngredientNames(lowered, lowered.size())
                .stream()
                .map(r -> RecipeMapper.toDto(r, scaledPerson))
                .toList();
    }

    @Transactional
    public List<RecipeDto> searchByIngredients(List<String> ingredientNames) {
        return searchByIngredients(ingredientNames, null);
    }

    public List<RecipeDto> searchByIngredientsString(String ingredients, Integer scaledPerson) {
        if (ingredients == null || ingredients.trim().isEmpty()) {
            return List.of();
        }

        List<String> ingredientList = List.of(ingredients.split(",")).stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        return searchByIngredients(ingredientList, scaledPerson);
    }

    public boolean recipeExists(Long id) {
        return recipeRepository.existsById(id);
    }

    public long countAllRecipes() {
        return recipeRepository.count();
    }

    public List<String> autocompleteRecipes(String query, int limit) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }

        String search = query.trim();
        Pageable pageable = PageRequest.of(0, Math.min(limit, 50)); // Max 50 résultats

        return recipeRepository.findRecipeNamesWithType(search, pageable);
    }

    public List<String> autocompleteRecipes(String query) {
        return autocompleteRecipes(query, 10);
    }

    public List<String> getPopularRecipes(int limit) {
        Pageable pageable = PageRequest.of(0, Math.min(limit, 50));
        return recipeRepository.findAll(pageable)
                .getContent()
                .stream()
                .map(Recipe::getName)
                .toList();
    }

    public List<String> getPopularRecipes() {
        return getPopularRecipes(20);
    }

    public List<String> getPopularRecipesFromPlans(int limit) {
        List<Object[]> results = planRecipeRepository.findMostUsedRecipes();
        return results.stream()
                .limit(Math.min(limit, 50))
                .map(row -> {
                    Long recipeId = (Long) row[0];
                    return recipeRepository.findById(recipeId)
                            .map(Recipe::getName)
                            .orElse(null);
                })
                .filter(name -> name != null)
                .toList();
    }

    public List<String> findRecipesByPrefix(String prefix, int limit) {
        if (prefix == null || prefix.trim().isEmpty()) {
            return List.of();
        }

        Pageable pageable = PageRequest.of(0, Math.min(limit, 30));
        return recipeRepository.findRecipeNamesByPrefix(prefix.trim(), pageable);
    }

    public List<String> findRecipesContaining(String search, int limit) {
        if (search == null || search.trim().length() < 2) {
            return List.of();
        }

        Pageable pageable = PageRequest.of(0, Math.min(limit, 30));
        return recipeRepository.findRecipeNamesContaining(search.trim(), pageable);
    }

    // Filtrage avancé combiné
    public List<RecipeDto> filterRecipes(String searchTerm, List<String> ingredients, 
                                        Integer minTime, Integer maxTime, 
                                        List<String> origins, Boolean isBabyFriendly, Integer scaledPerson) {
        
        // Si aucun filtre n'est appliqué, retourner toutes les recettes
        if ((searchTerm == null || searchTerm.trim().isEmpty()) &&
            (ingredients == null || ingredients.isEmpty()) &&
            minTime == null && maxTime == null &&
            (origins == null || origins.isEmpty()) &&
            isBabyFriendly == null) {
            
            return getAllRecipes(scaledPerson);
        }
        
        // Préparation des paramètres
        String search = (searchTerm != null && !searchTerm.trim().isEmpty()) ? searchTerm.trim() : null;
        
        // Préparation des ingrédients
        boolean hasIngredientFilter = ingredients != null && !ingredients.isEmpty();
        List<String> loweredIngredients = null;
        Long ingredientCount = 0L;
        if (hasIngredientFilter) {
            loweredIngredients = ingredients.stream()
                    .map(String::toLowerCase)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .distinct()
                    .toList();
            ingredientCount = (long) loweredIngredients.size();
            hasIngredientFilter = !loweredIngredients.isEmpty();
        }
        
        // Préparation des origines
        List<String> cleanOrigins = null;
        if (origins != null && !origins.isEmpty()) {
            cleanOrigins = origins.stream()
                    .filter(o -> o != null && !o.trim().isEmpty())
                    .distinct()
                    .toList();
            if (cleanOrigins.isEmpty()) {
                cleanOrigins = null;
            }
        }
        
        List<Recipe> recipes;
        try {
            // Test spécial pour filtrage bébé uniquement
            if (isBabyFriendly != null && search == null && !hasIngredientFilter && 
                minTime == null && maxTime == null && (cleanOrigins == null || cleanOrigins.isEmpty())) {
                recipes = recipeRepository.findByIsBabyFriendly(isBabyFriendly);
                return recipes.stream()
                        .map(r -> RecipeMapper.toDto(r, scaledPerson))
                        .toList();
            }
            
            // Préparation des listes vides pour éviter les problèmes NULL
            List<String> safeOrigins = (cleanOrigins != null) ? cleanOrigins : List.of();
            List<String> safeIngredients = (loweredIngredients != null) ? loweredIngredients : List.of();
            String safeSearch = (search != null) ? search : "";
            
            // Étape 1: Récupérer les recettes de base selon le critère principal
            if (hasIngredientFilter) {
                recipes = recipeRepository.findRecipesWithIngredients(safeIngredients, ingredientCount);
            } else {
                recipes = recipeRepository.findAll();
            }
            
            // Étape 2: Filtrer en Java par tous les autres critères
            recipes = recipes.stream()
                    .filter(r -> safeSearch.isEmpty() || r.getName().toLowerCase().contains(safeSearch.toLowerCase()))
                    .filter(r -> minTime == null || r.getTotalTime() >= minTime)
                    .filter(r -> maxTime == null || r.getTotalTime() <= maxTime)
                    .filter(r -> safeOrigins.isEmpty() || safeOrigins.contains(r.getOrigin()))
                    .filter(r -> isBabyFriendly == null || r.getIsBabyFriendly().equals(isBabyFriendly))
                    .toList();
            
            return recipes.stream()
                    .map(r -> RecipeMapper.toDto(r, scaledPerson))
                    .toList();
                    
        } catch (Exception e) {
            System.err.println("Erreur lors du filtrage: " + e.getMessage());
            e.printStackTrace();
            
            // Fallback: retourner toutes les recettes en cas d'erreur
            System.out.println("FALLBACK: retour de toutes les recettes");
            return getAllRecipes(scaledPerson);
        }
    }

    // Obtenir toutes les origines disponibles
    public List<String> getAllOrigins() {
        return recipeRepository.findAllDistinctOrigins();
    }

    // helper to set basic scalar fields
    private void applyBasicFields(Recipe recipe, RecipeRequest request) {
        if (request.getName() != null) recipe.setName(request.getName());
        recipe.setType(request.getType());
        recipe.setDescription(request.getDescription());
        recipe.setOrigin(request.getOrigin());
        recipe.setPreparationTime(request.getPreparationTime());
        recipe.setCookingTime(request.getCookingTime());
        recipe.setRestTime(request.getRestTime());
        recipe.setPerson(request.getPerson());
        recipe.setIsBabyFriendly(request.getIsBabyFriendly());
        if (request.getSteps() != null) {
            recipe.setSteps(request.getSteps());
        }
    }

}
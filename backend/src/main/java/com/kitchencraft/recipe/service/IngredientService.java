package com.kitchencraft.recipe.service;

import com.kitchencraft.recipe.dto.IngredientDto;
import com.kitchencraft.recipe.dto.IngredientRequest;
import com.kitchencraft.recipe.mapper.IngredientMapper;
import com.kitchencraft.recipe.model.Ingredient;
import com.kitchencraft.recipe.repository.IngredientRepository;
import com.kitchencraft.recipe.repository.ShoppingListItemRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

import java.util.List;

@Service
public class IngredientService {

    private final IngredientRepository ingredientRepository;
    private final ShoppingListItemRepository shoppingListItemRepository;

    public IngredientService(IngredientRepository ingredientRepository,
                            ShoppingListItemRepository shoppingListItemRepository) {
        this.ingredientRepository = ingredientRepository;
        this.shoppingListItemRepository = shoppingListItemRepository;
    }

    @Transactional
    public IngredientDto createIngredient(IngredientRequest request) {
        // Vérification si l'ingrédient existe déjà
        ingredientRepository.findByNameIgnoreCase(request.getName())
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Ingredient already exists");
                });

        Ingredient ingredient = new Ingredient();
        ingredient.setName(request.getName());
        ingredient.setCategory(request.getCategory());

        return IngredientMapper.toDto(ingredientRepository.save(ingredient));
    }

    @Transactional
    public IngredientDto updateIngredient(Long id, IngredientRequest request) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ingredient not found"));

        ingredient.setName(request.getName());
        ingredient.setCategory(request.getCategory());

        return IngredientMapper.toDto(ingredientRepository.save(ingredient));
    }

    @Transactional
    public void deleteIngredient(Long id) {
        if (!ingredientRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ingredient not found");
        }
        ingredientRepository.deleteById(id);
    }

    public List<IngredientDto> getAllIngredients() {
        return ingredientRepository.findAll()
                .stream()
                .map(IngredientMapper::toDto)
                .toList();
    }

    public IngredientDto getIngredientByName(String name) {
        Ingredient ingredient = ingredientRepository.findByNameIgnoreCase(name)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ingredient not found"));
        return IngredientMapper.toDto(ingredient);
    }

    public List<String> autocompleteIngredients(String query, int limit) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }

        String search = query.trim();
        Pageable pageable = PageRequest.of(0, Math.min(limit, 50)); // Max 50 résultats

        return ingredientRepository.findIngredientNamesWithCategory(search, pageable);
    }

    public List<String> autocompleteIngredients(String query) {
        return autocompleteIngredients(query, 10);
    }

    public List<String> getPopularIngredients(int limit) {
        Pageable pageable = PageRequest.of(0, Math.min(limit, 50));
        return ingredientRepository.findAll(pageable)
                .getContent()
                .stream()
                .map(Ingredient::getName)
                .toList();
    }

    public List<String> getPopularIngredients() {
        return getPopularIngredients(20);
    }

    public List<String> getPopularIngredientsFromPlans(int limit) {
        List<Object[]> results = shoppingListItemRepository.findMostUsedIngredients();
        return results.stream()
                .limit(Math.min(limit, 50))
                .map(row -> {
                    Long ingredientId = (Long) row[0];
                    return ingredientRepository.findById(ingredientId)
                            .map(Ingredient::getName)
                            .orElse(null);
                })
                .filter(name -> name != null)
                .toList();
    }

    public List<String> findIngredientsByPrefix(String prefix, int limit) {
        if (prefix == null || prefix.trim().isEmpty()) {
            return List.of();
        }

        Pageable pageable = PageRequest.of(0, Math.min(limit, 30));
        return ingredientRepository.findIngredientNamesByPrefix(prefix.trim(), pageable);
    }

    public List<String> findIngredientsContaining(String search, int limit) {
        if (search == null || search.trim().length() < 2) {
            return List.of();
        }

        Pageable pageable = PageRequest.of(0, Math.min(limit, 30));
        return ingredientRepository.findIngredientNamesContaining(search.trim(), pageable);
    }

}

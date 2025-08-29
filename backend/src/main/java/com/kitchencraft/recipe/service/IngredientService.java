package com.kitchencraft.recipe.service;

import com.kitchencraft.recipe.dto.IngredientDto;
import com.kitchencraft.recipe.dto.IngredientRequest;
import com.kitchencraft.recipe.mapper.IngredientMapper;
import com.kitchencraft.recipe.model.Ingredient;
import com.kitchencraft.recipe.repository.IngredientRepository;
import com.kitchencraft.recipe.repository.ShoppingListItemRepository;
import com.kitchencraft.recipe.repository.RecipeIngredientRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class IngredientService {

    private final IngredientRepository ingredientRepository;
    private final ShoppingListItemRepository shoppingListItemRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final OpenFoodFactsService openFoodFactsService;

    public IngredientService(IngredientRepository ingredientRepository,
                            ShoppingListItemRepository shoppingListItemRepository,
                            RecipeIngredientRepository recipeIngredientRepository,
                            OpenFoodFactsService openFoodFactsService) {
        this.ingredientRepository = ingredientRepository;
        this.shoppingListItemRepository = shoppingListItemRepository;
        this.recipeIngredientRepository = recipeIngredientRepository;
        this.openFoodFactsService = openFoodFactsService;
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
        ingredient.setBasicCategory(request.getBasicCategory());
        ingredient.setCategory(request.getBasicCategory()); // For backward compatibility
        ingredient.setDataSource("MANUAL");
        ingredient.setCreatedAt(LocalDateTime.now());

        return IngredientMapper.toDto(ingredientRepository.save(ingredient));
    }

    @Transactional
    public IngredientDto updateIngredient(Long id, IngredientRequest request) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ingredient not found"));

        ingredient.setName(request.getName());
        ingredient.setBasicCategory(request.getBasicCategory());
        ingredient.setCategory(request.getBasicCategory()); // For backward compatibility
        ingredient.setUpdatedAt(LocalDateTime.now());

        return IngredientMapper.toDto(ingredientRepository.save(ingredient));
    }

    // Classe interne pour représenter les utilisations d'un ingrédient
    public static class IngredientUsage {
        private final long recipeCount;
        private final long shoppingListCount;
        private final List<String> recipeNames;
        
        public IngredientUsage(long recipeCount, long shoppingListCount, List<String> recipeNames) {
            this.recipeCount = recipeCount;
            this.shoppingListCount = shoppingListCount;
            this.recipeNames = recipeNames;
        }
        
        public boolean isUsed() {
            return recipeCount > 0 || shoppingListCount > 0;
        }
        
        public long getRecipeCount() { return recipeCount; }
        public long getShoppingListCount() { return shoppingListCount; }
        public List<String> getRecipeNames() { return recipeNames; }
    }
    
    public IngredientUsage checkIngredientUsage(Long ingredientId) {
        try {
            // Vérifier utilisation dans les recettes
            long recipeCount = recipeIngredientRepository.countByIngredient_Id(ingredientId);
            List<String> recipeNames = recipeIngredientRepository.findRecipeNamesByIngredientId(ingredientId);
            
            // Vérifier utilisation dans les listes de courses
            long shoppingListCount = shoppingListItemRepository.countByIngredient_Id(ingredientId);
            
            return new IngredientUsage(recipeCount, shoppingListCount, recipeNames);
        } catch (Exception e) {
            System.err.println("Erreur lors de la vérification des utilisations de l'ingrédient " + ingredientId + ": " + e.getMessage());
            e.printStackTrace();
            // En cas d'erreur, considérer que l'ingrédient est utilisé par sécurité
            return new IngredientUsage(1, 0, List.of("Erreur lors de la vérification"));
        }
    }

    @Transactional
    public void deleteIngredient(Long id) {
        try {
            if (!ingredientRepository.existsById(id)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ingredient not found");
            }
            
            ingredientRepository.deleteById(id);
            
        } catch (ResponseStatusException e) {
            throw e;
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Impossible de supprimer cet ingrédient car il est utilisé dans une ou plusieurs recettes. Supprimez d'abord l'ingrédient des recettes concernées.");
        } catch (Exception e) {
            System.err.println("Erreur inattendue lors de la suppression de l'ingrédient " + id + ": " + e.getClass().getName() + " - " + e.getMessage());
            
            // Vérifier si c'est une violation de contrainte
            if (e.getMessage() != null && (e.getMessage().contains("constraint") || e.getMessage().contains("foreign key"))) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, 
                    "Impossible de supprimer cet ingrédient car il est utilisé dans des recettes ou des listes de courses.");
            }
            
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Erreur lors de la suppression de l'ingrédient: " + e.getMessage());
        }
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

        return ingredientRepository.findIngredientNamesWithBasicCategory(search, pageable);
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

    // Nouvelles méthodes pour le système nutritionnel fusionné
    
    public List<IngredientDto> findByFilters(String name, String basicCategory) {
        return ingredientRepository.findByFilters(name, basicCategory)
                .stream()
                .map(IngredientMapper::toDto)
                .toList();
    }

    public List<IngredientDto> findByBasicCategory(String basicCategory) {
        return ingredientRepository.findByBasicCategory(basicCategory)
                .stream()
                .map(IngredientMapper::toDto)
                .toList();
    }

    public Optional<IngredientDto> findByBarcode(String barcode) {
        return ingredientRepository.findByBarcode(barcode)
                .map(IngredientMapper::toDto);
    }

    public IngredientDto searchByBarcodeWithFallback(String barcode) {
        // D'abord vérifier en base de données
        Optional<Ingredient> existingItem = ingredientRepository.findByBarcode(barcode);
        if (existingItem.isPresent()) {
            return IngredientMapper.toDto(existingItem.get());
        }

        // Sinon chercher dans OpenFoodFacts
        Ingredient fromApi = openFoodFactsService.searchByBarcodeAsIngredient(barcode);
        if (fromApi != null) {
            // Sauvegarder en base
            fromApi.setCreatedAt(LocalDateTime.now());
            return IngredientMapper.toDto(ingredientRepository.save(fromApi));
        }

        // Si pas trouvé, retourner null (permet la saisie manuelle)
        return null;
    }
    
    // Nouvelle méthode : rechercher OpenFoodFacts sans sauvegarder automatiquement
    public IngredientDto searchOpenFoodFactsOnly(String barcode) {
        // Utiliser directement l'API Ingredient
        Ingredient ingredient = openFoodFactsService.searchByBarcodeAsIngredient(barcode);
        if (ingredient != null) {
            return IngredientMapper.toDto(ingredient);
        }
        return null;
    }

    public IngredientDto saveIngredient(IngredientDto ingredientDto) {
        Ingredient ingredient;
        
        if (ingredientDto.id() == null) {
            // Création d'un nouvel ingrédient
            ingredient = IngredientMapper.fromDto(ingredientDto);
            ingredient.setCreatedAt(LocalDateTime.now());
            if (ingredient.getDataSource() == null) {
                ingredient.setDataSource("MANUAL");
            }
        } else {
            // Vérifier si l'ingrédient existe vraiment dans notre base
            Optional<Ingredient> existingOpt = ingredientRepository.findById(ingredientDto.id());
            if (existingOpt.isPresent()) {
                // Mise à jour d'un ingrédient existant dans notre base
                ingredient = existingOpt.get();
                
                // Mettre à jour uniquement les champs modifiables
                ingredient.setName(ingredientDto.name());
                ingredient.setCategory(ingredientDto.category());
                ingredient.setBrand(ingredientDto.brand());
                ingredient.setBarcode(ingredientDto.barcode());
                ingredient.setBasicCategory(ingredientDto.basicCategory());
                
                // Données nutritionnelles
                ingredient.setEnergy(ingredientDto.energy());
                ingredient.setEnergyKcal(ingredientDto.energyKcal());
                ingredient.setCarbohydrates(ingredientDto.carbohydrates());
                ingredient.setSugars(ingredientDto.sugars());
                ingredient.setFiber(ingredientDto.fiber());
                ingredient.setFat(ingredientDto.fat());
                ingredient.setSaturatedFat(ingredientDto.saturatedFat());
                ingredient.setMonounsaturatedFat(ingredientDto.monounsaturatedFat());
                ingredient.setPolyunsaturatedFat(ingredientDto.polyunsaturatedFat());
                ingredient.setTransFat(ingredientDto.transFat());
                ingredient.setProtein(ingredientDto.protein());
                ingredient.setSalt(ingredientDto.salt());
                ingredient.setSodium(ingredientDto.sodium());
                ingredient.setAlcohol(ingredientDto.alcohol());
                
                // Vitamines
                ingredient.setVitaminA(ingredientDto.vitaminA());
                ingredient.setVitaminB1(ingredientDto.vitaminB1());
                ingredient.setVitaminB2(ingredientDto.vitaminB2());
                ingredient.setVitaminB3(ingredientDto.vitaminB3());
                ingredient.setVitaminB5(ingredientDto.vitaminB5());
                ingredient.setVitaminB6(ingredientDto.vitaminB6());
                ingredient.setVitaminB7(ingredientDto.vitaminB7());
                ingredient.setVitaminB9(ingredientDto.vitaminB9());
                ingredient.setVitaminB12(ingredientDto.vitaminB12());
                ingredient.setVitaminC(ingredientDto.vitaminC());
                ingredient.setVitaminD(ingredientDto.vitaminD());
                ingredient.setVitaminE(ingredientDto.vitaminE());
                ingredient.setVitaminK(ingredientDto.vitaminK());
                
                // Minéraux
                ingredient.setCalcium(ingredientDto.calcium());
                ingredient.setIron(ingredientDto.iron());
                ingredient.setMagnesium(ingredientDto.magnesium());
                ingredient.setPhosphorus(ingredientDto.phosphorus());
                ingredient.setPotassium(ingredientDto.potassium());
                ingredient.setZinc(ingredientDto.zinc());
                ingredient.setCopper(ingredientDto.copper());
                ingredient.setManganese(ingredientDto.manganese());
                ingredient.setSelenium(ingredientDto.selenium());
                ingredient.setIodine(ingredientDto.iodine());
                ingredient.setChromium(ingredientDto.chromium());
                ingredient.setMolybdenum(ingredientDto.molybdenum());
                ingredient.setFluoride(ingredientDto.fluoride());
                
                // Mettre à jour la date de modification
                ingredient.setUpdatedAt(LocalDateTime.now());
                
                // NE PAS modifier createdAt, openFoodFactsId, dataSource, lastSync pour les entités existantes
            } else {
                // L'ID donné n'existe pas dans notre base - erreur
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Ingredient with ID " + ingredientDto.id() + " not found for update");
            }
        }
        
        return IngredientMapper.toDto(ingredientRepository.save(ingredient));
    }

    public long countByBasicCategory(String category) {
        return ingredientRepository.countByBasicCategory(category);
    }

    public List<IngredientDto> findAllFromOpenFoodFacts() {
        return ingredientRepository.findAllFromOpenFoodFacts()
                .stream()
                .map(IngredientMapper::toDto)
                .toList();
    }

    public List<IngredientDto> findAllManual() {
        return ingredientRepository.findAllManual()
                .stream()
                .map(IngredientMapper::toDto)
                .toList();
    }

    public IngredientDto syncWithOpenFoodFacts(Long id) {
        Optional<Ingredient> ingredientOpt = ingredientRepository.findById(id);
        if (ingredientOpt.isEmpty()) {
            throw new RuntimeException("Ingredient not found with id: " + id);
        }

        Ingredient ingredient = ingredientOpt.get();
        if (ingredient.getBarcode() == null) {
            throw new RuntimeException("Cannot sync item without barcode");
        }

        Ingredient updated = openFoodFactsService.searchByBarcodeAsIngredient(ingredient.getBarcode());
        if (updated == null) {
            throw new RuntimeException("Product not found in OpenFoodFacts");
        }

        // Conserver l'ID existant et mettre à jour les données
        updated.setId(ingredient.getId());
        updated.setCreatedAt(ingredient.getCreatedAt());
        updated.setLastSync(LocalDateTime.now());
        
        return IngredientMapper.toDto(ingredientRepository.save(updated));
    }

    // Statistiques nutritionnelles
    public long countItemsWithNutritionalData() {
        return ingredientRepository.findAll().stream()
                .filter(Ingredient::hasNutritionalData)
                .count();
    }

    public long countItemsFromOpenFoodFacts() {
        return ingredientRepository.findAll().stream()
                .filter(Ingredient::isFromOpenFoodFacts)
                .count();
    }

    public IngredientDto getIngredientById(Long id) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ingredient not found"));
        return IngredientMapper.toDto(ingredient);
    }

}

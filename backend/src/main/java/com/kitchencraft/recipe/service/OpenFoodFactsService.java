package com.kitchencraft.recipe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kitchencraft.recipe.model.Ingredient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OpenFoodFactsService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    private static final String OPENFOODFACTS_API_URL = "https://world.openfoodfacts.org/api/v0/product/";
    
    // Mapping des catégories OpenFoodFacts vers nos catégories de base
    private static final Map<String, String> CATEGORY_MAPPING = new HashMap<>();
    
    static {
        // Fruits et Légumes
        CATEGORY_MAPPING.put("fruits", "Fruits et Légumes");
        CATEGORY_MAPPING.put("fresh-fruits", "Fruits et Légumes");
        CATEGORY_MAPPING.put("frozen-fruits", "Fruits et Légumes");
        CATEGORY_MAPPING.put("dried-fruits", "Fruits et Légumes");
        CATEGORY_MAPPING.put("vegetables", "Fruits et Légumes");
        CATEGORY_MAPPING.put("fresh-vegetables", "Fruits et Légumes");
        CATEGORY_MAPPING.put("frozen-vegetables", "Fruits et Légumes");
        CATEGORY_MAPPING.put("canned-vegetables", "Fruits et Légumes");
        
        // Féculents
        CATEGORY_MAPPING.put("cereals", "Féculents");
        CATEGORY_MAPPING.put("breakfast-cereals", "Féculents");
        CATEGORY_MAPPING.put("bread", "Féculents");
        CATEGORY_MAPPING.put("pasta", "Féculents");
        CATEGORY_MAPPING.put("rice", "Féculents");
        CATEGORY_MAPPING.put("grains", "Féculents");
        CATEGORY_MAPPING.put("potatoes", "Féculents");
        
        // Légumineuses
        CATEGORY_MAPPING.put("legumes", "Légumineuses");
        CATEGORY_MAPPING.put("beans", "Légumineuses");
        CATEGORY_MAPPING.put("lentils", "Légumineuses");
        CATEGORY_MAPPING.put("chickpeas", "Légumineuses");
        CATEGORY_MAPPING.put("peas", "Légumineuses");
        
        // Viandes, Poissons, Oeufs
        CATEGORY_MAPPING.put("meats", "Viandes, Poissons, Oeufs");
        CATEGORY_MAPPING.put("fish", "Viandes, Poissons, Oeufs");
        CATEGORY_MAPPING.put("seafood", "Viandes, Poissons, Oeufs");
        CATEGORY_MAPPING.put("poultry", "Viandes, Poissons, Oeufs");
        CATEGORY_MAPPING.put("eggs", "Viandes, Poissons, Oeufs");
        CATEGORY_MAPPING.put("beef", "Viandes, Poissons, Oeufs");
        CATEGORY_MAPPING.put("pork", "Viandes, Poissons, Oeufs");
        CATEGORY_MAPPING.put("chicken", "Viandes, Poissons, Oeufs");
        
        // Produits laitiers
        CATEGORY_MAPPING.put("dairy", "Produits laitiers");
        CATEGORY_MAPPING.put("milk", "Produits laitiers");
        CATEGORY_MAPPING.put("yogurt", "Produits laitiers");
        CATEGORY_MAPPING.put("cheese", "Produits laitiers");
        CATEGORY_MAPPING.put("cream", "Produits laitiers");
        
        // Matières grasses
        CATEGORY_MAPPING.put("fats", "Matières grasses");
        CATEGORY_MAPPING.put("oils", "Matières grasses");
        CATEGORY_MAPPING.put("butter", "Matières grasses");
        CATEGORY_MAPPING.put("margarine", "Matières grasses");
        
        // Produits sucrés
        CATEGORY_MAPPING.put("sweets", "Produits sucrés");
        CATEGORY_MAPPING.put("chocolate", "Produits sucrés");
        CATEGORY_MAPPING.put("candy", "Produits sucrés");
        CATEGORY_MAPPING.put("desserts", "Produits sucrés");
        CATEGORY_MAPPING.put("ice-cream", "Produits sucrés");
        CATEGORY_MAPPING.put("cookies", "Produits sucrés");
        CATEGORY_MAPPING.put("cakes", "Produits sucrés");
    }

    public Ingredient searchByBarcode(String barcode) {
        return searchByBarcodeAsIngredient(barcode);
    }
    
    private Ingredient mapToIngredient(JsonNode product, String barcode) {
        Ingredient ingredient = new Ingredient();
        
        // Informations de base
        ingredient.setName(getTextValue(product, "product_name", "product_name_fr"));
        ingredient.setBrand(getTextValue(product, "brands"));
        ingredient.setBarcode(barcode);
        ingredient.setOpenFoodFactsId(barcode);
        ingredient.setDataSource("OPENFOODFACTS");
        ingredient.setLastSync(LocalDateTime.now());
        
        // Catégorie - essayer de mapper depuis les catégories OpenFoodFacts
        String category = mapCategory(product);
        ingredient.setBasicCategory(category);
        ingredient.setCategory(getTextValue(product, "categories", "main_category"));
        if (ingredient.getCategory() == null) {
            ingredient.setCategory(category);
        }
        
        // Données nutritionnelles
        JsonNode nutriments = product.get("nutriments");
        if (nutriments != null) {
            mapNutrients(nutriments, ingredient);
        }
        
        return ingredient;
    }
    
    private String mapCategory(JsonNode product) {
        String categories = getTextValue(product, "categories");
        if (categories == null) return "Autres";
        
        String categoriesLower = categories.toLowerCase();
        
        // Essayer de trouver une correspondance
        for (Map.Entry<String, String> entry : CATEGORY_MAPPING.entrySet()) {
            if (categoriesLower.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        
        return "Autres";
    }
    
    private void mapNutrients(JsonNode nutriments, Ingredient ingredient) {
        // Macronutriments
        ingredient.setEnergy(getBigDecimalValue(nutriments, "energy-kj", "energy-kj_100g"));
        ingredient.setEnergyKcal(getBigDecimalValue(nutriments, "energy-kcal", "energy-kcal_100g", "energy_100g"));
        ingredient.setCarbohydrates(getBigDecimalValue(nutriments, "carbohydrates", "carbohydrates_100g"));
        ingredient.setSugars(getBigDecimalValue(nutriments, "sugars", "sugars_100g"));
        ingredient.setFat(getBigDecimalValue(nutriments, "fat", "fat_100g"));
        ingredient.setSaturatedFat(getBigDecimalValue(nutriments, "saturated-fat", "saturated-fat_100g"));
        ingredient.setProtein(getBigDecimalValue(nutriments, "proteins", "proteins_100g"));
        ingredient.setSalt(getBigDecimalValue(nutriments, "salt", "salt_100g"));
        ingredient.setSodium(getBigDecimalValue(nutriments, "sodium", "sodium_100g"));
        ingredient.setFiber(getBigDecimalValue(nutriments, "fiber", "fiber_100g"));
        ingredient.setAlcohol(getBigDecimalValue(nutriments, "alcohol", "alcohol_100g"));
        
        // Graisses détaillées
        ingredient.setMonounsaturatedFat(getBigDecimalValue(nutriments, "monounsaturated-fat", "monounsaturated-fat_100g"));
        ingredient.setPolyunsaturatedFat(getBigDecimalValue(nutriments, "polyunsaturated-fat", "polyunsaturated-fat_100g"));
        ingredient.setTransFat(getBigDecimalValue(nutriments, "trans-fat", "trans-fat_100g"));
        
        // Vitamines
        ingredient.setVitaminA(getBigDecimalValue(nutriments, "vitamin-a", "vitamin-a_100g"));
        ingredient.setVitaminB1(getBigDecimalValue(nutriments, "vitamin-b1", "vitamin-b1_100g"));
        ingredient.setVitaminB2(getBigDecimalValue(nutriments, "vitamin-b2", "vitamin-b2_100g"));
        ingredient.setVitaminB3(getBigDecimalValue(nutriments, "vitamin-b3", "vitamin-b3_100g"));
        ingredient.setVitaminB5(getBigDecimalValue(nutriments, "vitamin-b5", "vitamin-b5_100g"));
        ingredient.setVitaminB6(getBigDecimalValue(nutriments, "vitamin-b6", "vitamin-b6_100g"));
        ingredient.setVitaminB7(getBigDecimalValue(nutriments, "vitamin-b7", "vitamin-b7_100g"));
        ingredient.setVitaminB9(getBigDecimalValue(nutriments, "vitamin-b9", "vitamin-b9_100g"));
        ingredient.setVitaminB12(getBigDecimalValue(nutriments, "vitamin-b12", "vitamin-b12_100g"));
        ingredient.setVitaminC(getBigDecimalValue(nutriments, "vitamin-c", "vitamin-c_100g"));
        ingredient.setVitaminD(getBigDecimalValue(nutriments, "vitamin-d", "vitamin-d_100g"));
        ingredient.setVitaminE(getBigDecimalValue(nutriments, "vitamin-e", "vitamin-e_100g"));
        ingredient.setVitaminK(getBigDecimalValue(nutriments, "vitamin-k", "vitamin-k_100g"));
        
        // Minéraux
        ingredient.setCalcium(getBigDecimalValue(nutriments, "calcium", "calcium_100g"));
        ingredient.setIron(getBigDecimalValue(nutriments, "iron", "iron_100g"));
        ingredient.setMagnesium(getBigDecimalValue(nutriments, "magnesium", "magnesium_100g"));
        ingredient.setPhosphorus(getBigDecimalValue(nutriments, "phosphorus", "phosphorus_100g"));
        ingredient.setPotassium(getBigDecimalValue(nutriments, "potassium", "potassium_100g"));
        ingredient.setZinc(getBigDecimalValue(nutriments, "zinc", "zinc_100g"));
        ingredient.setCopper(getBigDecimalValue(nutriments, "copper", "copper_100g"));
        ingredient.setManganese(getBigDecimalValue(nutriments, "manganese", "manganese_100g"));
        ingredient.setSelenium(getBigDecimalValue(nutriments, "selenium", "selenium_100g"));
        ingredient.setIodine(getBigDecimalValue(nutriments, "iodine", "iodine_100g"));
        ingredient.setChromium(getBigDecimalValue(nutriments, "chromium", "chromium_100g"));
        ingredient.setMolybdenum(getBigDecimalValue(nutriments, "molybdenum", "molybdenum_100g"));
        ingredient.setFluoride(getBigDecimalValue(nutriments, "fluoride", "fluoride_100g"));
    }
    
    private String getTextValue(JsonNode node, String... keys) {
        for (String key : keys) {
            JsonNode valueNode = node.get(key);
            if (valueNode != null && !valueNode.isNull() && valueNode.isTextual()) {
                String value = valueNode.asText().trim();
                if (!value.isEmpty()) {
                    return value;
                }
            }
        }
        return null;
    }
    
    private BigDecimal getBigDecimalValue(JsonNode node, String... keys) {
        for (String key : keys) {
            JsonNode valueNode = node.get(key);
            if (valueNode != null && !valueNode.isNull() && valueNode.isNumber()) {
                double value = valueNode.asDouble();
                if (value >= 0) { // Ignorer les valeurs négatives
                    return BigDecimal.valueOf(value);
                }
            }
        }
        return null;
    }

    // Nouvelle méthode pour récupérer directement un Ingredient
    public Ingredient searchByBarcodeAsIngredient(String barcode) {
        try {
            String url = OPENFOODFACTS_API_URL + barcode + ".json";
            String response = restTemplate.getForObject(url, String.class);
            
            if (response == null) {
                return null;
            }
            
            JsonNode root = objectMapper.readTree(response);
            
            // Vérifier si le produit existe
            if (root.get("status").asInt() != 1) {
                return null;
            }
            
            JsonNode product = root.get("product");
            if (product == null) {
                return null;
            }
            
            return mapToIngredient(product, barcode);
            
        } catch (Exception e) {
            // Log l'erreur mais ne lance pas d'exception
            System.err.println("Erreur lors de la recherche OpenFoodFacts pour le code-barres " + barcode + ": " + e.getMessage());
            return null;
        }
    }
}
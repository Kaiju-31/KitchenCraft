package com.kitchencraft.recipe.mapper;

import com.kitchencraft.recipe.dto.IngredientDto;
import com.kitchencraft.recipe.model.Ingredient;

public class IngredientMapper {

    public static IngredientDto toDto(Ingredient ingredient) {
        if (ingredient == null) return null;
        return new IngredientDto(
                ingredient.getId(),
                ingredient.getName(),
                ingredient.getCategory(),
                
                // Nouveaux champs nutritionnels
                ingredient.getBrand(),
                ingredient.getBarcode(),
                ingredient.getBasicCategory(),
                ingredient.getOpenFoodFactsId(),
                ingredient.getDataSource(),
                ingredient.getLastSync(),
                ingredient.getCreatedAt(),
                ingredient.getUpdatedAt(),
                
                // Macronutriments
                ingredient.getEnergy(),
                ingredient.getEnergyKcal(),
                ingredient.getCarbohydrates(),
                ingredient.getSugars(),
                ingredient.getFiber(),
                ingredient.getFat(),
                ingredient.getSaturatedFat(),
                ingredient.getMonounsaturatedFat(),
                ingredient.getPolyunsaturatedFat(),
                ingredient.getTransFat(),
                ingredient.getProtein(),
                ingredient.getSalt(),
                ingredient.getSodium(),
                ingredient.getAlcohol(),
                
                // Vitamines
                ingredient.getVitaminA(),
                ingredient.getVitaminB1(),
                ingredient.getVitaminB2(),
                ingredient.getVitaminB3(),
                ingredient.getVitaminB5(),
                ingredient.getVitaminB6(),
                ingredient.getVitaminB7(),
                ingredient.getVitaminB9(),
                ingredient.getVitaminB12(),
                ingredient.getVitaminC(),
                ingredient.getVitaminD(),
                ingredient.getVitaminE(),
                ingredient.getVitaminK(),
                
                // Minéraux
                ingredient.getCalcium(),
                ingredient.getIron(),
                ingredient.getMagnesium(),
                ingredient.getPhosphorus(),
                ingredient.getPotassium(),
                ingredient.getZinc(),
                ingredient.getCopper(),
                ingredient.getManganese(),
                ingredient.getSelenium(),
                ingredient.getIodine(),
                ingredient.getChromium(),
                ingredient.getMolybdenum(),
                ingredient.getFluoride()
        );
    }
    
    public static Ingredient fromDto(IngredientDto dto) {
        if (dto == null) return null;
        
        Ingredient ingredient = new Ingredient();
        ingredient.setId(dto.id());
        ingredient.setName(dto.name());
        ingredient.setCategory(dto.category());
        
        // Nouveaux champs nutritionnels
        ingredient.setBrand(dto.brand());
        ingredient.setBarcode(dto.barcode());
        ingredient.setBasicCategory(dto.basicCategory());
        ingredient.setOpenFoodFactsId(dto.openFoodFactsId());
        ingredient.setDataSource(dto.dataSource());
        ingredient.setLastSync(dto.lastSync());
        ingredient.setCreatedAt(dto.createdAt());
        ingredient.setUpdatedAt(dto.updatedAt());
        
        // Macronutriments
        ingredient.setEnergy(dto.energy());
        ingredient.setEnergyKcal(dto.energyKcal());
        ingredient.setCarbohydrates(dto.carbohydrates());
        ingredient.setSugars(dto.sugars());
        ingredient.setFiber(dto.fiber());
        ingredient.setFat(dto.fat());
        ingredient.setSaturatedFat(dto.saturatedFat());
        ingredient.setMonounsaturatedFat(dto.monounsaturatedFat());
        ingredient.setPolyunsaturatedFat(dto.polyunsaturatedFat());
        ingredient.setTransFat(dto.transFat());
        ingredient.setProtein(dto.protein());
        ingredient.setSalt(dto.salt());
        ingredient.setSodium(dto.sodium());
        ingredient.setAlcohol(dto.alcohol());
        
        // Vitamines
        ingredient.setVitaminA(dto.vitaminA());
        ingredient.setVitaminB1(dto.vitaminB1());
        ingredient.setVitaminB2(dto.vitaminB2());
        ingredient.setVitaminB3(dto.vitaminB3());
        ingredient.setVitaminB5(dto.vitaminB5());
        ingredient.setVitaminB6(dto.vitaminB6());
        ingredient.setVitaminB7(dto.vitaminB7());
        ingredient.setVitaminB9(dto.vitaminB9());
        ingredient.setVitaminB12(dto.vitaminB12());
        ingredient.setVitaminC(dto.vitaminC());
        ingredient.setVitaminD(dto.vitaminD());
        ingredient.setVitaminE(dto.vitaminE());
        ingredient.setVitaminK(dto.vitaminK());
        
        // Minéraux
        ingredient.setCalcium(dto.calcium());
        ingredient.setIron(dto.iron());
        ingredient.setMagnesium(dto.magnesium());
        ingredient.setPhosphorus(dto.phosphorus());
        ingredient.setPotassium(dto.potassium());
        ingredient.setZinc(dto.zinc());
        ingredient.setCopper(dto.copper());
        ingredient.setManganese(dto.manganese());
        ingredient.setSelenium(dto.selenium());
        ingredient.setIodine(dto.iodine());
        ingredient.setChromium(dto.chromium());
        ingredient.setMolybdenum(dto.molybdenum());
        ingredient.setFluoride(dto.fluoride());
        
        return ingredient;
    }
}

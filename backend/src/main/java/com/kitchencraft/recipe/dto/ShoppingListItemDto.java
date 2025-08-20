package com.kitchencraft.recipe.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ShoppingListItemDto {
    private Long id;
    private Long weeklyPlanId;
    private IngredientDto ingredient;
    private BigDecimal quantityNeeded;
    private BigDecimal quantityOwned;
    private BigDecimal quantityToBuy;
    private String unit;
    private Boolean isChecked;
    private Boolean isValidated;
}
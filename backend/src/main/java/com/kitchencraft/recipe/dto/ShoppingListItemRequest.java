package com.kitchencraft.recipe.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ShoppingListItemRequest {
    private BigDecimal quantityOwned;
    private Boolean isChecked;
    private Boolean isValidated;
}
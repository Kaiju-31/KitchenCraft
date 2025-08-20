package com.kitchencraft.recipe.mapper;

import com.kitchencraft.recipe.dto.ShoppingListItemDto;
import com.kitchencraft.recipe.model.ShoppingListItem;

public class ShoppingListItemMapper {

    public static ShoppingListItemDto toDto(ShoppingListItem item) {
        if (item == null) {
            return null;
        }

        ShoppingListItemDto dto = new ShoppingListItemDto();
        dto.setId(item.getId());
        dto.setWeeklyPlanId(item.getWeeklyPlan().getId());
        dto.setIngredient(IngredientMapper.toDto(item.getIngredient()));
        dto.setQuantityNeeded(item.getQuantityNeeded());
        dto.setQuantityOwned(item.getQuantityOwned());
        dto.setQuantityToBuy(item.getQuantityToBuy());
        dto.setUnit(item.getUnit());
        dto.setIsChecked(item.getIsChecked());
        dto.setIsValidated(item.getIsValidated());

        return dto;
    }
}
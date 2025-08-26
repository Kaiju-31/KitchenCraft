package com.kitchencraft.recipe.dto;

import com.kitchencraft.recipe.model.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserRoleRequest {
    @NotNull(message = "Role is required")
    private Role.RoleName roleName;
}
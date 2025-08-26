package com.kitchencraft.recipe.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    
    private Long id;
    
    private String firstName;
    
    private String lastName;
    
    private String username;
    
    private String email;
    
    private Set<String> roles;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
package com.kitchencraft.recipe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtAuthenticationResponse {
    
    private String token;
    
    private String type = "Bearer";
    
    private UserDto user;
    
    public JwtAuthenticationResponse(String token, UserDto user) {
        this.token = token;
        this.user = user;
    }
}
package com.kitchencraft.recipe.controller;

import com.kitchencraft.recipe.dto.JwtAuthenticationResponse;
import com.kitchencraft.recipe.dto.LoginRequest;
import com.kitchencraft.recipe.dto.RegisterRequest;
import com.kitchencraft.recipe.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<JwtAuthenticationResponse> register(@Valid @RequestBody RegisterRequest request) {
        JwtAuthenticationResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<JwtAuthenticationResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtAuthenticationResponse response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register-admin")
    public ResponseEntity<JwtAuthenticationResponse> registerAdmin(@Valid @RequestBody RegisterRequest request) {
        JwtAuthenticationResponse response = authService.registerAdmin(request);
        return ResponseEntity.ok(response);
    }
}
package com.kitchencraft.recipe.service;

import com.kitchencraft.recipe.dto.*;
import com.kitchencraft.recipe.exception.BusinessException;
import com.kitchencraft.recipe.mapper.UserMapper;
import com.kitchencraft.recipe.model.Role;
import com.kitchencraft.recipe.model.User;
import com.kitchencraft.recipe.repository.RoleRepository;
import com.kitchencraft.recipe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    
    @Transactional
    public JwtAuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username is already taken!");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email is already in use!");
        }
        
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        Role userRole = roleRepository.findByName(Role.RoleName.ROLE_USER)
            .orElseThrow(() -> new BusinessException("User Role not set."));
        
        user.setRoles(Set.of(userRole));
        
        User savedUser = userRepository.save(user);
        String jwt = jwtService.generateToken(savedUser);
        
        return new JwtAuthenticationResponse(jwt, userMapper.toDto(savedUser));
    }
    
    public JwtAuthenticationResponse authenticate(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );
        
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new BusinessException("User not found"));
        
        String jwt = jwtService.generateToken(user);
        
        return new JwtAuthenticationResponse(jwt, userMapper.toDto(user));
    }
    
    @Transactional
    public JwtAuthenticationResponse registerAdmin(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username is already taken!");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email is already in use!");
        }
        
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        Role adminRole = roleRepository.findByName(Role.RoleName.ROLE_ADMIN)
            .orElseThrow(() -> new BusinessException("Admin Role not set."));
        
        user.setRoles(Set.of(adminRole));
        
        User savedUser = userRepository.save(user);
        String jwt = jwtService.generateToken(savedUser);
        
        return new JwtAuthenticationResponse(jwt, userMapper.toDto(savedUser));
    }
}
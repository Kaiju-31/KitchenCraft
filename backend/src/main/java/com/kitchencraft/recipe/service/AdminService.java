package com.kitchencraft.recipe.service;

import com.kitchencraft.recipe.dto.AdminStatsDto;
import com.kitchencraft.recipe.dto.AdminUserDto;
import com.kitchencraft.recipe.dto.CreateUserRequest;
import com.kitchencraft.recipe.dto.EditUserRequest;
import com.kitchencraft.recipe.exception.BusinessException;
import com.kitchencraft.recipe.model.Role;
import com.kitchencraft.recipe.model.User;
import com.kitchencraft.recipe.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final WeeklyPlanRepository weeklyPlanRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public List<AdminUserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToAdminUserDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminUserDto createUser(CreateUserRequest request) {
        // Vérifications d'unicité
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username is already taken!");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email is already in use!");
        }

        // Validation des rôles
        Set<Role> userRoles = new HashSet<>();
        for (String roleName : request.getRoles()) {
            try {
                Role.RoleName roleEnum = Role.RoleName.valueOf(roleName);
                Role role = roleRepository.findByName(roleEnum)
                    .orElseThrow(() -> new BusinessException("Role not found: " + roleName));
                userRoles.add(role);
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Invalid role: " + roleName);
            }
        }

        // Création de l'utilisateur
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(userRoles);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);
        log.info("Admin created new user: {} with roles: {}", 
                savedUser.getUsername(), 
                userRoles.stream().map(role -> role.getName().toString()).collect(Collectors.joining(", ")));
        
        return convertToAdminUserDto(savedUser);
    }

    public AdminStatsDto getSystemStats() {
        long totalUsers = userRepository.count();
        long totalRecipes = recipeRepository.count();
        long totalIngredients = ingredientRepository.count();
        long totalPlans = weeklyPlanRepository.count();
        
        // Utilisateurs actifs (créés dans les 30 derniers jours)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long activeUsers = userRepository.countByCreatedAtAfter(thirtyDaysAgo);
        
        // Origine la plus populaire
        String mostPopularOrigin = recipeRepository.findMostPopularOrigin()
                .orElse("Aucune");
        
        // Catégorie d'ingrédient la plus utilisée
        String mostUsedCategory = ingredientRepository.findMostUsedCategory()
                .orElse("Aucune");

        return new AdminStatsDto(
                totalUsers,
                totalRecipes,
                totalIngredients,
                totalPlans,
                activeUsers,
                mostPopularOrigin,
                mostUsedCategory
        );
    }

    @Transactional
    public AdminUserDto updateUserRole(Long userId, Role.RoleName newRoleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Role newRole = roleRepository.findByName(newRoleName)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé"));

        // Remplacer tous les rôles par le nouveau
        Set<Role> newRoles = new HashSet<>();
        newRoles.add(newRole);
        user.setRoles(newRoles);
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        log.info("User {} role updated to {}", user.getUsername(), newRoleName);
        
        return convertToAdminUserDto(savedUser);
    }

    @Transactional
    public AdminUserDto updateUser(Long userId, EditUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));

        // Vérifications d'unicité si les valeurs ont changé
        if (!user.getUsername().equals(request.getUsername()) && 
            userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username is already taken!");
        }
        
        if (!user.getEmail().equals(request.getEmail()) && 
            userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email is already in use!");
        }

        // Mise à jour des champs
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        
        // Mise à jour du mot de passe seulement s'il est fourni
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        log.info("Admin updated user: {} (email: {})", savedUser.getUsername(), savedUser.getEmail());
        
        return convertToAdminUserDto(savedUser);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        log.info("Deleting user: {}", user.getUsername());
        userRepository.delete(user);
    }

    public List<String> getOrphanIngredients() {
        return ingredientRepository.findOrphanIngredients();
    }

    @Transactional
    public int cleanupOrphanData() {
        // Supprimer les ingrédients qui ne sont utilisés dans aucune recette
        List<String> orphanIngredients = ingredientRepository.findOrphanIngredients();
        
        int deletedCount = 0;
        for (String ingredientName : orphanIngredients) {
            ingredientRepository.deleteByName(ingredientName);
            deletedCount++;
        }
        
        log.info("Cleaned up {} orphan ingredients", deletedCount);
        return deletedCount;
    }

    private AdminUserDto convertToAdminUserDto(User user) {
        return new AdminUserDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getUsername(),
                user.getEmail(),
                user.getRoles(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.isEnabled()
        );
    }
}
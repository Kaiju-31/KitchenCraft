package com.kitchencraft.recipe.service;

import com.kitchencraft.recipe.dto.AdminStatsDto;
import com.kitchencraft.recipe.dto.AdminUserDto;
import com.kitchencraft.recipe.model.Role;
import com.kitchencraft.recipe.model.User;
import com.kitchencraft.recipe.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    public List<AdminUserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToAdminUserDto)
                .collect(Collectors.toList());
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
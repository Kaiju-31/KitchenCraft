package com.kitchencraft.recipe.controller;

import com.kitchencraft.recipe.dto.*;
import com.kitchencraft.recipe.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    /**
     * Récupère tous les utilisateurs du système
     */
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        log.info("Admin request: Get all users");
        List<AdminUserDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Met à jour le rôle d'un utilisateur
     */
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<AdminUserDto> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        log.info("Admin request: Update user {} role to {}", userId, request.getRoleName());
        AdminUserDto updatedUser = adminService.updateUserRole(userId, request.getRoleName());
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Supprime un utilisateur
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long userId) {
        log.info("Admin request: Delete user {}", userId);
        adminService.deleteUser(userId);
        return ResponseEntity.ok(Map.of(
            "message", "Utilisateur supprimé avec succès",
            "userId", userId.toString()
        ));
    }

    /**
     * Récupère les statistiques du système
     */
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getSystemStats() {
        log.info("Admin request: Get system statistics");
        AdminStatsDto stats = adminService.getSystemStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Récupère les ingrédients orphelins (non utilisés)
     */
    @GetMapping("/ingredients/orphans")
    public ResponseEntity<List<String>> getOrphanIngredients() {
        log.info("Admin request: Get orphan ingredients");
        List<String> orphans = adminService.getOrphanIngredients();
        return ResponseEntity.ok(orphans);
    }

    /**
     * Nettoie les données orphelines
     */
    @DeleteMapping("/data/cleanup")
    public ResponseEntity<Map<String, Object>> cleanupOrphanData() {
        log.info("Admin request: Cleanup orphan data");
        int deletedCount = adminService.cleanupOrphanData();
        return ResponseEntity.ok(Map.of(
            "message", "Nettoyage terminé",
            "deletedCount", deletedCount,
            "description", "Ingrédients orphelins supprimés"
        ));
    }

    /**
     * Endpoint de test pour vérifier les permissions admin
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> adminTest() {
        return ResponseEntity.ok(Map.of(
            "message", "Admin access confirmed",
            "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }
}
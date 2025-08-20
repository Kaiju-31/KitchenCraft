package com.kitchencraft.recipe.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Classe de réponse standardisée pour les erreurs API
 * Utilisée par le GlobalExceptionHandler pour retourner des erreurs cohérentes
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    
    /**
     * Horodatage de l'erreur
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    
    /**
     * Code de statut HTTP
     */
    private int status;
    
    /**
     * Type d'erreur
     */
    private String error;
    
    /**
     * Message d'erreur pour l'utilisateur
     */
    private String message;
    
    /**
     * Chemin de la requête qui a causé l'erreur
     */
    private String path;
    
    /**
     * Détails des erreurs de validation (optionnel)
     */
    private Map<String, String> validationErrors;
    
    /**
     * Informations de débogage (uniquement en développement)
     */
    private String debugInfo;
    
    /**
     * Identifiant de trace pour le suivi des erreurs
     */
    private String traceId;
}
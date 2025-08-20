package com.kitchencraft.recipe.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Exception personnalisée pour les erreurs métier
 * Utilisée pour les violations de règles business spécifiques à l'application
 */
@Getter
public class BusinessException extends RuntimeException {
    
    private final HttpStatus status;
    private final String error;
    
    public BusinessException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
        this.error = "Business Rule Violation";
    }
    
    public BusinessException(String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.error = "Business Rule Violation";
    }
    
    public BusinessException(String message, HttpStatus status, String error) {
        super(message);
        this.status = status;
        this.error = error;
    }
    
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.status = HttpStatus.INTERNAL_SERVER_ERROR;
        this.error = "Business Error";
    }
    
    public BusinessException(String message, Throwable cause, HttpStatus status, String error) {
        super(message, cause);
        this.status = status;
        this.error = error;
    }
    
    // Méthodes statiques pour créer des exceptions communes
    public static BusinessException notFound(String resourceType, Object id) {
        return new BusinessException(
            String.format("%s avec l'ID %s non trouvé", resourceType, id),
            HttpStatus.NOT_FOUND,
            "Resource Not Found"
        );
    }
    
    public static BusinessException alreadyExists(String resourceType, String field, Object value) {
        return new BusinessException(
            String.format("%s avec %s '%s' existe déjà", resourceType, field, value),
            HttpStatus.CONFLICT,
            "Resource Already Exists"
        );
    }
    
    public static BusinessException invalidOperation(String operation, String reason) {
        return new BusinessException(
            String.format("Opération '%s' invalide: %s", operation, reason),
            HttpStatus.BAD_REQUEST,
            "Invalid Operation"
        );
    }
    
    public static BusinessException accessDenied(String resource) {
        return new BusinessException(
            String.format("Accès refusé à la ressource: %s", resource),
            HttpStatus.FORBIDDEN,
            "Access Denied"
        );
    }
}
package com.kitchencraft.recipe.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvException;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Configuration pour charger les variables d'environnement depuis les fichiers .env
 * Utilisé pour le développement local
 */
public class DotEnvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    
    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        ConfigurableEnvironment environment = applicationContext.getEnvironment();
        
        try {
            // Charger le fichier .env s'il existe
            Dotenv dotenv = Dotenv.configure()
                    .directory("./")  // Chercher dans le répertoire courant
                    .ignoreIfMalformed()
                    .ignoreIfMissing()
                    .load();
            
            // Convertir les variables .env en propriétés Spring
            Map<String, Object> dotenvProperties = new HashMap<>();
            dotenv.entries().forEach(entry -> {
                dotenvProperties.put(entry.getKey(), entry.getValue());
            });
            
            // Ajouter les propriétés à l'environnement Spring
            if (!dotenvProperties.isEmpty()) {
                environment.getPropertySources().addLast(new MapPropertySource("dotenv", dotenvProperties));
                System.out.println("✅ Fichier .env chargé avec " + dotenvProperties.size() + " variables");
            }
            
        } catch (DotenvException e) {
            System.out.println("⚠️  Aucun fichier .env trouvé ou erreur de lecture: " + e.getMessage());
        }
    }
}
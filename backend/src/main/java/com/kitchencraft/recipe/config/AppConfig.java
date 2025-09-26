package com.kitchencraft.recipe.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
@Data
public class AppConfig {
    
    private SignupConfig signup = new SignupConfig();
    
    @Data
    public static class SignupConfig {
        private boolean enabled = true;
    }
}
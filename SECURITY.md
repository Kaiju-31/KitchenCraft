# 🔒 Guide de Sécurité - KitchenCraft

## 📋 Résumé des Mesures de Sécurité

Ce document décrit les mesures de sécurité implémentées dans KitchenCraft et les bonnes pratiques à suivre pour un déploiement sécurisé.

## 🛡️ Sécurité Backend (Spring Boot)

### 1. Gestion des Configurations Sensibles

#### ✅ Variables d'Environnement
```bash
# Ne JAMAIS committer ces valeurs
DB_PASSWORD=your_secure_password_here
CACHE_HMAC_KEY=your_hmac_secret_key_32_chars_min
```

#### ✅ Profils Spring
```yaml
# application.yml (non versionné)
spring:
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
  datasource:
    password: ${DB_PASSWORD}
```

#### ✅ Configuration par Environnement
- **Développement** : Logs détaillés, show-sql activé
- **Production** : Logs minimaux, validation stricte, ddl-auto: validate

### 2. Validation des Données

#### ✅ Bean Validation
```java
@NotBlank(message = "Le nom est obligatoire")
@Size(min = 2, max = 100, message = "Entre 2 et 100 caractères")
private String name;
```

#### ✅ Validation des Paramètres
```java
@GetMapping("/{id}")
public ResponseEntity<RecipeDto> getById(
    @PathVariable @Min(value = 1, message = "ID doit être positif") Long id
) {
    // ...
}
```

### 3. Gestion Centralisée des Erreurs

#### ✅ GlobalExceptionHandler
- Masquage des stack traces en production
- Messages d'erreur standardisés
- Logging sécurisé des exceptions
- Codes d'erreur HTTP appropriés

### 4. Protection Contre les Injections

#### ✅ JPA avec Paramètres Nommés
```java
@Query("SELECT r FROM Recipe r WHERE r.name LIKE :name")
List<Recipe> findByNameContaining(@Param("name") String name);
```

#### ✅ Validation des Entrées
- Patterns regex pour les types énumérés
- Limites de taille sur tous les champs texte
- Validation des ranges numériques

## 🔐 Sécurité Frontend (React)

### 1. Cache Sécurisé

#### ✅ Signature HMAC
```typescript
// Vérification d'intégrité des données cachées
const isValid = await verifySignature(data, signature);
if (!isValid) {
  logger.warn('Cache signature validation failed');
  this.invalidate(key);
}
```

#### ✅ Sanitisation des Données
```typescript
// Exclusion automatique des données sensibles
const sensitiveKeys = [
  'password', 'token', 'secret', 'key', 'authorization'
];
```

### 2. Gestion des Erreurs

#### ✅ Error Boundaries
- Capture des erreurs React
- Interfaces de récupération
- Reporting d'erreurs sécurisé
- Pas d'exposition de stack traces

#### ✅ Logging Configuré
```typescript
// Production : logs minimaux
const logger = {
  debug: isDev ? console.log : () => {},
  error: console.error // Toujours actif
};
```

### 3. Protection XSS

#### ✅ JSX par Défaut
- Échappement automatique des variables
- Pas d'utilisation de `dangerouslySetInnerHTML`
- Validation côté client ET serveur

## 🚨 Checklist de Sécurité Pré-Déploiement

### Configuration
- [ ] Variables d'environnement configurées (pas de valeurs par défaut)
- [ ] Profil `prod` activé en production
- [ ] Logs de debug désactivés
- [ ] HTTPS configuré (certificats SSL)
- [ ] CORS configuré de façon restrictive

### Base de Données
- [ ] Credentials PostgreSQL sécurisés
- [ ] Utilisateur dédié avec permissions minimales
- [ ] Sauvegarde automatisée configurée
- [ ] Connexions chiffrées (SSL)

### Application
- [ ] Clé HMAC générée de façon sécurisée (32+ caractères)
- [ ] Validation activée sur tous les endpoints
- [ ] Gestion d'erreurs globale active
- [ ] Monitoring et alertes configurés

### Infrastructure
- [ ] Firewall configuré (ports 22, 80, 443, 5432)
- [ ] Mise à jour système automatique
- [ ] Backup régulier des données
- [ ] Logs système centralisés

## 🔧 Configuration de Production Recommandée

### Variables d'Environnement Critiques
```bash
# Base de données
DB_PASSWORD=$(openssl rand -base64 32)
DB_HOST=localhost  # Pas d'exposition externe

# Cache
VITE_CACHE_HMAC_KEY=$(openssl rand -base64 32)

# Logging
LOG_LEVEL_ROOT=WARN
LOG_LEVEL_APP=INFO
SHOW_SQL=false

# Sécurité
SPRING_PROFILES_ACTIVE=prod
MANAGEMENT_ENDPOINTS=health,info  # Endpoints minimaux
```

### Nginx (Recommandé)
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # Security Headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # API Proxy
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend
    location / {
        root /var/www/kitchencraft;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

## 🚨 Vulnérabilités Corrigées

### ✅ Exposition de Credentials
- **Avant** : Mot de passe en dur dans `application.yml`
- **Après** : Variables d'environnement + fichier exemple

### ✅ Cache Non Sécurisé
- **Avant** : Données stockées sans validation en localStorage
- **Après** : Signature HMAC + validation d'intégrité

### ✅ Logging Excessif
- **Avant** : 20+ console.log en production
- **Après** : Logger configuré par environnement

### ✅ Validation Manquante
- **Avant** : Aucune validation côté serveur
- **Après** : Bean Validation + validation paramètres

### ✅ Gestion d'Erreurs Exposante
- **Avant** : Stack traces potentiellement exposées
- **Après** : GlobalExceptionHandler + messages standardisés

## 🔄 Roadmap Sécurité

### Version 1.1
- [ ] **Authentification JWT** avec Spring Security
- [ ] **Autorisation RBAC** (Admin, User roles)
- [ ] **Rate Limiting** par IP/utilisateur
- [ ] **Audit Logging** des actions sensibles

### Version 1.2
- [ ] **OAuth2** (Google, GitHub)
- [ ] **2FA** (TOTP)
- [ ] **Session Management** avancé
- [ ] **CSRF Protection**

### Version 2.0
- [ ] **WAF** (Web Application Firewall)
- [ ] **Intrusion Detection**
- [ ] **Security Scanning** automatisé
- [ ] **Pen Testing** régulier

## 📞 Signalement de Vulnérabilités

Si vous découvrez une vulnérabilité de sécurité, veuillez :

1. **NE PAS** créer d'issue publique
2. Envoyer un email à : security@kitchencraft.com
3. Inclure une description détaillée
4. Fournir des étapes de reproduction si possible

Nous nous engageons à répondre dans les 48h et à publier un patch dans les 7 jours pour les vulnérabilités critiques.

## 📚 Ressources Sécurité

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [React Security Best Practices](https://reactjs.org/docs/security.html)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

---

**⚠️ Important** : Cette application est actuellement en développement. Ne déployez PAS en production sans implémenter l'authentification et les mesures de sécurité recommandées.
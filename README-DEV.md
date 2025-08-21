# 🚀 KitchenCraft - Environnement de Développement Docker

Guide pour utiliser la stack de développement Docker avec hot reload.

## ⚡ Démarrage Rapide

### Configuration des variables d'environnement
```bash
# Copier et configurer les variables backend
cp backend/.env.example backend/.env

# Copier et configurer les variables frontend  
cp frontend/.env.example frontend/.env.local

# IMPORTANT: Créer le fichier .env racine pour Docker Compose
echo "DB_PASSWORD=$(grep DB_PASSWORD backend/.env | cut -d'=' -f2)" > .env

# Modifier les mots de passe et clés selon vos besoins
```

### Lancer l'environnement de développement
```bash
# Démarrer la stack complète avec hot reload
docker-compose -f docker-compose.dev.yml up --build

# Ou en arrière-plan
docker-compose -f docker-compose.dev.yml up --build -d
```

### Arrêter l'environnement
```bash
docker-compose -f docker-compose.dev.yml down
```

## 🔧 Services Disponibles

| Service | URL | Port | Hot Reload |
|---------|-----|------|------------|
| **Frontend React** | http://localhost:5173 | 5173 | ✅ Vite |
| **Backend Spring Boot** | http://localhost:8080 | 8080 | ✅ DevTools |
| **PostgreSQL** | localhost:5432 | 5432 | - |
| **Debug Backend** | localhost:5005 | 5005 | 🐛 JDWP |

## 🔄 Hot Reload Configuration

### Frontend (React + Vite)
- **Polling activé** : Les changements de fichiers sont détectés même dans les conteneurs Docker
- **Volumes montés** : `src/`, `public/`, configs
- **Auto-refresh** : Le navigateur se recharge automatiquement

### Backend (Spring Boot + DevTools)
- **DevTools activé** : Redémarrage automatique des classes modifiées
- **Debug port 5005** : Connexion IDE pour debugging
- **Volume Maven** : Les dépendances sont persistées
- **Hot swap** : Changements de code détectés automatiquement

## 📁 Volumes et Synchronisation

### Frontend
```yaml
volumes:
  - ./frontend/src:/app/src                    # Code source
  - ./frontend/public:/app/public              # Assets statiques
  - ./frontend/index.html:/app/index.html      # Point d'entrée
  - /app/node_modules                          # Exclure node_modules host
```

### Backend
```yaml
volumes:
  - ./backend/src:/app/src:ro                  # Code source (lecture seule)
  - ./backend/target:/app/target               # Build artifacts
  - ./backend/pom.xml:/app/pom.xml:ro          # Maven config
```

## 🐛 Debugging

### Backend Java Debugging
1. **Port 5005 exposé** pour la connexion IDE
2. **Configuration IDE** :
   - Host: `localhost`
   - Port: `5005`
   - Type: `Remote JVM Debug`

### Frontend React DevTools
- **React DevTools** : Extension navigateur compatible
- **Console Vite** : Logs visibles dans le terminal Docker

## 📝 Variables d'Environnement

### Backend (.env)
```env
# Configuration base de données
DB_URL=jdbc:postgresql://localhost:5432/kitchencraft
DB_USERNAME=postgres
DB_PASSWORD=kitchencraft_2025_SecurePass!

# Configuration logging
LOG_LEVEL_ROOT=INFO
LOG_LEVEL_APP=DEBUG
```

### Frontend (.env.local)
```env
# Configuration sécurité (OBLIGATOIRE)
VITE_CACHE_HMAC_KEY=KitchenCraft2025_SecureHMAC_Key_32chars_Change_This!
VITE_CACHE_ENCRYPTION_ENABLED=false

# Configuration logging
VITE_LOG_LEVEL=info
VITE_LOG_CONSOLE_ENABLED=true

# Error reporting
VITE_ERROR_REPORTING_ENABLED=false
VITE_APP_VERSION=1.1.0
```

## 🔍 Monitoring & Logs

### Voir les logs en temps réel
```bash
# Tous les services
docker-compose -f docker-compose.dev.yml logs -f

# Service spécifique
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f backend
```

### Health Checks
- **Backend** : http://localhost:8080/api/recipes
- **Frontend** : http://localhost:5173
- **Database** : `pg_isready` automatique

## 🚨 Résolution de Problèmes

### Hot Reload ne fonctionne pas
1. **Vérifier les volumes** : `docker-compose -f docker-compose.dev.yml config`
2. **Permissions Windows** : Activer le partage de lecteur Docker
3. **Polling activé** : `CHOKIDAR_USEPOLLING=true` dans le frontend

### Backend ne redémarre pas
1. **DevTools activé** : Vérifier `spring-boot-devtools` dans le pom.xml
2. **Volumes corrects** : `/app/src` et `/app/target` montés
3. **Profile dev** : `SPRING_PROFILES_ACTIVE=dev`

### Erreurs de connexion base de données
1. **Ordre de démarrage** : Attendre que PostgreSQL soit "healthy"
2. **Variables d'environnement** : Vérifier `DB_*` dans docker-compose.dev.yml
3. **Fichier .env racine** : Vérifier qu'il existe avec `DB_PASSWORD=same_as_backend_env`
4. **Réseau** : Tous les services dans `kitchencraft-dev-network`

## 🆚 Différences avec Production

| Aspect | Développement | Production |
|--------|---------------|------------|
| **Build** | Source volumes | Multi-stage build |
| **Hot Reload** | ✅ Activé | ❌ Désactivé |
| **Debug** | Port 5005 exposé | Aucun port debug |
| **Logs** | Verbeux (DEBUG) | Optimisés (INFO) |
| **Performance** | Non optimisé | Optimisé |
| **Sécurité** | Réduite | Renforcée |

## 📚 Commandes Utiles

```bash
# Reconstruire sans cache
docker-compose -f docker-compose.dev.yml build --no-cache

# Redémarrer un service spécifique
docker-compose -f docker-compose.dev.yml restart backend

# Exécuter des commandes dans les conteneurs
docker-compose -f docker-compose.dev.yml exec backend bash
docker-compose -f docker-compose.dev.yml exec frontend sh

# Nettoyer les volumes de développement
docker-compose -f docker-compose.dev.yml down -v
```
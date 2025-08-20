# ⚡ Guide d'Installation Rapide - KitchenCraft

> **Installation et démarrage en moins de 10 minutes**

## 🎯 Installation Express

### 1. Prérequis Rapides
```bash
# Vérifier les versions
java --version    # Java 21+
node --version    # Node.js 18+
npm --version     # npm 8+
docker --version  # Docker (optionnel)
```

### 2. Clonage et Setup Initial
```bash
# Cloner le repository
git clone <repository-url>
cd KitchenCraft

# Copier les configurations
cp backend/.env.example backend/.env
cp backend/src/main/resources/application-example.yml backend/src/main/resources/application.yml
cp frontend/.env.example frontend/.env.local
```

### 3. Base de Données (Option Docker - Recommandée)
```bash
# Démarrer PostgreSQL avec Docker
docker-compose up -d

# Vérifier que PostgreSQL fonctionne
docker-compose ps
```

### 4. Configuration Minimale

#### Backend (.env)
```bash
# Éditez backend/.env
DB_PASSWORD=postgres  # Changez en production !
CACHE_HMAC_KEY=your_32_char_hmac_key_here_change_this  # OBLIGATOIRE
```

#### Frontend (.env.local)
```bash
# Éditez frontend/.env.local  
VITE_CACHE_HMAC_KEY=your_32_char_hmac_key_here_change_this  # Même clé que backend
```

### 5. Démarrage
```bash
# Terminal 1 - Backend
cd backend
mvn spring-boot:run

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

### 6. Vérification
- **Frontend** : [http://localhost:5173](http://localhost:5173)
- **API** : [http://localhost:8080/api/recipes](http://localhost:8080/api/recipes)
- **Swagger** : [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

## 🐛 Problèmes Courants

### Backend ne démarre pas
```bash
# Vérifier Java
java --version
# Doit être 21+

# Vérifier PostgreSQL
docker-compose ps
# Doit montrer postgresql UP

# Logs backend
mvn spring-boot:run -X
```

### Frontend ne démarre pas
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Base de données
```bash
# Reset complet
docker-compose down
docker-compose up -d

# Vérifier connexion
docker exec -it kitchencraft-db-1 psql -U postgres -d kitchencraft
```

### Variables d'environnement
```bash
# Vérifier les fichiers
ls backend/.env
ls backend/src/main/resources/application.yml  
ls frontend/.env.local

# Vérifier contenu (ne doit pas être vide)
cat backend/.env
```

## 🚀 Mode Production Rapide

### 1. Build
```bash
# Backend
cd backend
mvn clean package -DskipTests

# Frontend
cd frontend
npm run build
```

### 2. Variables Production
```bash
# backend/.env
SPRING_PROFILES_ACTIVE=prod
DB_PASSWORD=secure_password_here
LOG_LEVEL_ROOT=WARN
SHOW_SQL=false

# frontend/.env.production
VITE_API_BASE_URL=https://your-domain.com/api
VITE_LOG_LEVEL=warn
```

### 3. Démarrage Production
```bash
# Backend
java -jar backend/target/backend-0.0.1-SNAPSHOT.jar

# Frontend (servir avec nginx ou serveur statique)
npx serve frontend/dist -p 3000
```

## 📋 Checklist Installation

### Étapes Obligatoires
- [ ] Java 21+ installé
- [ ] Node.js 18+ installé  
- [ ] PostgreSQL démarré (Docker ou local)
- [ ] Fichiers `.env` copiés et configurés
- [ ] Clé HMAC configurée (identique backend/frontend)
- [ ] Backend démarré (port 8080)
- [ ] Frontend démarré (port 5173)
- [ ] Tests de base : créer une recette

### Vérifications Post-Installation
- [ ] API accessible : GET /api/recipes retourne `[]`
- [ ] Swagger UI fonctionne
- [ ] Interface frontend affiche "Aucune recette trouvée"
- [ ] Cache monitor visible en développement (coin bas-droite)

## ⚙️ Configuration Avancée (Optionnel)

### Performance
```bash
# Frontend - Cache optimisé
VITE_CACHE_TTL_MINUTES=10
VITE_CACHE_MAX_SIZE_MB=100

# Backend - JVM optimisée
export JAVA_OPTS="-Xmx2g -Xms1g"
```

### Développement
```bash
# Frontend - Debug activé
VITE_DEBUG_CACHE_MONITOR=true
VITE_DEBUG_NETWORK_LOGS=true

# Backend - Logs détaillés
LOG_LEVEL_APP=DEBUG
LOG_LEVEL_SQL=DEBUG
```

### Sécurité
```bash
# Générer clé HMAC sécurisée (32+ caractères)
openssl rand -base64 32

# Générer mot de passe DB sécurisé
openssl rand -base64 24
```

## 🆘 Support Rapide

### Logs Utiles
```bash
# Backend
tail -f logs/kitchencraft.log

# Docker PostgreSQL  
docker logs kitchencraft-db-1

# Frontend (dans le navigateur)
F12 -> Console -> Filtrer "KitchenCraft"
```

### Commandes de Debug
```bash
# Vérifier ports occupés
netstat -tlnp | grep :8080
netstat -tlnp | grep :5432

# Vérifier processus Java
jps -l | grep kitchencraft

# Tester API directement
curl http://localhost:8080/api/recipes
curl http://localhost:8080/actuator/health
```

### Reset Complet
```bash
# Arrêter tout
docker-compose down
pkill -f "spring-boot:run"
pkill -f "vite"

# Nettoyer caches
rm -rf frontend/node_modules
rm -rf backend/target
docker system prune

# Redémarrer
docker-compose up -d
cd backend && mvn spring-boot:run &
cd frontend && npm install && npm run dev
```

## 📞 Aide

- 📖 **Documentation** : Voir [README.md](README.md)
- 🔒 **Sécurité** : Voir [SECURITY.md](SECURITY.md)  
- 🐛 **Issues** : [GitHub Issues](https://github.com/your-repo/issues)
- 💬 **Discussions** : [GitHub Discussions](https://github.com/your-repo/discussions)

---

**✅ Installation réussie ?** Vous devriez voir l'interface KitchenCraft avec un message "Aucune recette trouvée" et pouvoir créer votre première recette !
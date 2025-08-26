# 🍳 KitchenCraft

> **Gestionnaire de recettes culinaires moderne et performant**

KitchenCraft est une application full-stack développée avec Spring Boot et React, conçue pour simplifier la gestion de vos recettes, ingrédients et plannings de repas. L'application met l'accent sur les performances, la sécurité et l'expérience utilisateur.

> ✅ **Production Ready**: Version 1.2 avec système d'authentification JWT complet, interface d'administration
> et sécurité enterprise-grade. Prêt pour déploiement en production sécurisé.
> Consultez [SECURITY.md](SECURITY.md) pour la configuration de sécurité.

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-brightgreen.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Security](https://img.shields.io/badge/security-enterprise%20grade-green.svg)
![Production Ready](https://img.shields.io/badge/production-ready-green.svg)

## 🌟 Fonctionnalités Principales

### 📋 Gestion des Recettes
- **CRUD complet** : Création, lecture, mise à jour et suppression des recettes
- **Recherche avancée** : Par nom, ingrédients, temps de préparation, origine
- **Filtrage intelligent** : Temps de cuisson, nombre de personnes, adaptation bébé
- **Mise à l'échelle automatique** : Ajustement des quantités selon le nombre de convives
- **Organisation par catégories** : Apéritif, entrée, plat principal, dessert

### 🥗 Gestion des Ingrédients
- **Base de données centralisée** : Catalogue complet d'ingrédients
- **Catégorisation** : Légumes, viandes, épices, produits laitiers, etc.
- **Autocomplétion** : Saisie rapide et suggestions intelligentes
- **Recherche et filtres** : Trouvez rapidement vos ingrédients

### 📅 Planification des Repas
- **Planning hebdomadaire** : Organisation des repas par semaine
- **Génération de listes de courses** : Automatique à partir des recettes planifiées
- **Export PDF** : Planning et listes de courses exportables
- **Gestion des périodes** : Planifications flexibles sur plusieurs semaines

### 🔐 Système d'Authentification et Sécurité
- **Authentification JWT** : Connexion sécurisée avec tokens
- **Gestion des utilisateurs** : Inscription, profil, changement de mot de passe
- **Contrôle d'accès basé sur les rôles** : ROLE_USER et ROLE_ADMIN
- **Interface d'administration** : Dashboard avec statistiques et gestion utilisateurs
- **Protection CSRF** : Sécurité contre les attaques cross-site
- **Hashage BCrypt** : Stockage sécurisé des mots de passe

### 👨‍💼 Interface d'Administration
- **Dashboard temps réel** : Statistiques système (utilisateurs, recettes, ingrédients)
- **Gestion des utilisateurs** : Promotion/rétrogradation admin, suppression comptes
- **Outils de maintenance** : Nettoyage données orphelines, optimisation base
- **Monitoring système** : Métriques de performance et usage

### ⚡ Performances et UX
- **Cache intelligent multi-niveaux** : Optimisation des temps de chargement
- **Recherche optimisée** : URLs sémantiques et cache prédictif
- **Interface responsive** : Adaptation mobile, tablette et desktop
- **Lazy loading** : Chargement à la demande des composants

### 🐳 Déploiement Docker
- **Multi-environnements** : Production optimisée + Développement avec hot reload
- **Images multi-stage** : Backend Spring Boot + Frontend React/Nginx
- **Health checks automatiques** : Monitoring de l'état des services
- **Détection d'environnement** : Configuration automatique Local/Docker
- **Monitoring intégré** : Suivi des performances en développement

## 🏗️ Architecture Technique

### Backend (Spring Boot 3.4.1)
```
backend/
├── src/main/java/com/kitchencraft/recipe/
│   ├── controller/          # Contrôleurs REST API
│   │   ├── AuthController.java      # Authentification JWT
│   │   ├── AdminController.java     # Interface administration
│   │   └── UserController.java      # Gestion profils utilisateurs
│   ├── service/            # Logique métier
│   │   ├── AuthService.java        # Services authentification
│   │   ├── AdminService.java       # Services administration
│   │   └── JwtService.java         # Gestion tokens JWT
│   ├── config/             # Configuration sécurité
│   │   ├── SecurityConfig.java     # Spring Security config
│   │   └── JwtAuthenticationFilter.java # Filtre JWT
│   ├── repository/         # Accès aux données (JPA)
│   ├── model/             # Entités JPA (User, Role, etc.)
│   ├── dto/               # Objets de transfert
│   ├── mapper/            # Conversion entités <-> DTOs
│   └── exception/         # Gestion globale des erreurs
├── src/main/resources/
│   ├── application-example.yml  # Configuration exemple
│   └── static/           # Ressources statiques
└── pom.xml              # Dépendances Maven
```

### Frontend (React 19 + TypeScript)
```
frontend/
├── src/
│   ├── components/        # Composants réutilisables
│   │   ├── ui/           # Composants d'interface
│   │   ├── forms/        # Formulaires
│   │   ├── recipe/       # Composants recettes
│   │   ├── planning/     # Composants planning
│   │   ├── auth/         # Authentification (ProtectedRoute, AdminRoute)
│   │   ├── navigation/   # Navigation (AdminNav)
│   │   ├── performance/  # Monitoring de performance
│   │   └── error/        # Gestion d'erreurs
│   ├── contexts/         # React Contexts
│   │   └── AuthContext.tsx    # Contexte d'authentification
│   ├── hooks/            # Hooks personnalisés
│   ├── pages/            # Pages principales
│   │   ├── Login.tsx          # Page de connexion
│   │   ├── SignUp.tsx         # Page d'inscription
│   │   ├── Profile.tsx        # Page profil utilisateur
│   │   ├── AdminDashboard.tsx # Dashboard administrateur
│   │   └── AdminUsers.tsx     # Gestion des utilisateurs
│   ├── services/         # Services API
│   │   ├── authService.ts     # Service authentification
│   │   └── adminService.ts    # Service administration
│   ├── layout/           # Layouts
│   │   ├── Layout.tsx         # Layout principal
│   │   └── AdminLayout.tsx    # Layout administration
│   ├── utils/            # Utilitaires
│   └── types/            # Types TypeScript
├── public/               # Ressources publiques
├── .env.example         # Variables d'environnement exemple
└── vite.config.ts       # Configuration Vite
```

### Base de Données (PostgreSQL)
```
Entités principales :
├── Recipe              # Recettes
├── Ingredient          # Ingrédients
├── RecipeIngredient    # Liaison recette-ingrédient
├── RecipeStep          # Étapes de préparation
├── WeeklyPlan          # Plannings hebdomadaires
├── PlanRecipe          # Liaison planning-recette
├── User                # Utilisateurs avec authentification
└── Role                # Rôles (ROLE_USER, ROLE_ADMIN)
```

## 🚀 Installation et Configuration

### Prérequis
- **Java 21+** (OpenJDK recommandé)
- **Node.js 18+** avec npm
- **PostgreSQL 16+**
- **Docker** (optionnel, pour la base de données)

### 1. Clonage du Repository
```bash
git clone https://github.com/Kaiju-31/KitchenCraft.git
cd KitchenCraft
```

### 2. Configuration de la Base de Données

#### Option A : Docker (Recommandé)
```bash
# Démarrer PostgreSQL avec Docker Compose
docker-compose up -d
```

> **Note** : Pour Docker, un fichier `.env` à la racine du projet est requis (voir étape 3).

#### Option B : Installation Manuelle
```bash
# Créer la base de données
createdb kitchencraft
```

### 3. Configuration des Variables d'Environnement

#### Backend
```bash
# Copier le fichier exemple
cp backend/.env.example backend/.env

# Éditer les variables selon votre environnement
nano backend/.env
```

#### Docker (Production/Développement)
```bash
# Créer le fichier .env racine avec le même mot de passe que backend/.env
echo "DB_PASSWORD=votre_mot_de_passe_secure" > .env

# Le mot de passe doit correspondre à celui dans backend/.env
```

#### Configuration Application
```bash
# Copier la configuration exemple
cp backend/src/main/resources/application-example.yml backend/src/main/resources/application.yml

# Adapter selon votre environnement (dev/prod)
nano backend/src/main/resources/application.yml
```

#### Variables Principales
```env
# Base de données
DB_URL=jdbc:postgresql://localhost:5432/kitchencraft
DB_USERNAME=postgres
DB_PASSWORD=kitchencraft_2025_SecurePass!

# Logging
LOG_LEVEL_ROOT=INFO
LOG_LEVEL_APP=DEBUG
```

### 4. Configuration Frontend

```bash
# Copier le fichier exemple
cp frontend/.env.example frontend/.env.local

# Configurer selon votre environnement
nano frontend/.env.local
```

#### Variables Principales
```env
# Sécurité cache (OBLIGATOIRE)
VITE_CACHE_HMAC_KEY=KitchenCraft2025_SecureHMAC_Key_32chars_Change_This!

# Logging
VITE_LOG_LEVEL=info
VITE_LOG_CONSOLE_ENABLED=true

# Error reporting
VITE_ERROR_REPORTING_ENABLED=false
VITE_APP_VERSION=1.1.0
```

### 5. Démarrage de l'Application

#### Backend
```bash
cd backend

# Installation des dépendances et démarrage
mvn spring-boot:run

# Alternative : compilation puis exécution
mvn clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

#### Frontend
```bash
cd frontend

# Installation des dépendances
npm install

# Démarrage en développement
npm run dev

# Build de production
npm run build
npm run preview
```

### 6. Configuration Authentification JWT

#### Variables JWT Requises
```bash
# Ajouter à backend/.env
JWT_SECRET=your-super-secure-jwt-secret-key-64-characters-minimum
JWT_EXPIRATION=86400000  # 24h en millisecondes
```

#### Initialisation Admin
```bash
# Créer le premier utilisateur administrateur
node init-admin.js

# Credentials par défaut (à changer après première connexion)
# Username: admin
# Password: admin123
```

### 7. Accès à l'Application

- **Frontend** : [http://localhost:5173](http://localhost:5173)
- **Backend API** : [http://localhost:8080/api](http://localhost:8080/api)
- **Documentation API** : [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Health Check** : [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
- **Admin Interface** : [http://localhost:5173/admin](http://localhost:5173/admin) (après connexion admin)

## 🛠️ Commandes de Développement

### Backend
```bash
# Tests
mvn test

# Lancement avec profil spécifique
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Build sans tests
mvn clean package -DskipTests

# Analyse de code
mvn spotbugs:check
mvn checkstyle:check
```

### Frontend
```bash
# Développement avec hot reload
npm run dev

# Build optimisé pour production
npm run build

# Prévisualisation du build
npm run preview

# Linter
npm run lint
npm run lint:fix

# Tests (à implémenter)
npm run test
npm run test:coverage
```

### Base de Données
```bash
# Reset complet (Docker)
docker-compose down
docker-compose up -d

# Sauvegarde
pg_dump kitchencraft > backup.sql

# Restauration
psql kitchencraft < backup.sql
```

## 📊 Endpoints API Principaux

### Authentification
```http
POST   /api/auth/register               # Inscription utilisateur
POST   /api/auth/login                  # Connexion JWT
GET    /api/users/profile               # Profil utilisateur (authentifié)
PUT    /api/users/profile               # Modification profil (authentifié)
PUT    /api/users/change-password       # Changement mot de passe (authentifié)
```

### Administration (ROLE_ADMIN requis)
```http
GET    /api/admin/test                  # Test accès admin
GET    /api/admin/stats                 # Statistiques système
GET    /api/admin/users                 # Liste utilisateurs avec rôles
PUT    /api/admin/users/{id}/role       # Modification rôle utilisateur
DELETE /api/admin/users/{id}            # Suppression utilisateur
GET    /api/admin/ingredients/orphans   # Ingrédients orphelins
DELETE /api/admin/data/cleanup          # Nettoyage données système
```

### Recettes (Authentification requise)
```http
GET    /api/recipes                    # Liste toutes les recettes
GET    /api/recipes/{id}               # Détails d'une recette
GET    /api/recipes/by-name?name=...   # Recherche par nom
GET    /api/recipes/by-ingredients?ingredients=... # Recherche par ingrédients
GET    /api/recipes/filter?...         # Recherche avancée avec filtres
POST   /api/recipes                    # Création d'une recette
PUT    /api/recipes/{id}               # Modification d'une recette
DELETE /api/recipes/{id}               # Suppression d'une recette
```

### Ingrédients (Authentification requise)
```http
GET    /api/ingredients                # Liste tous les ingrédients
GET    /api/ingredients/{id}           # Détails d'un ingrédient
GET    /api/ingredients/search?q=...   # Recherche d'ingrédients
POST   /api/ingredients                # Création d'un ingrédient
PUT    /api/ingredients/{id}           # Modification d'un ingrédient
DELETE /api/ingredients/{id}           # Suppression d'un ingrédient
```

### Plannings (Authentification requise)
```http
GET    /api/plans                      # Liste tous les plannings
GET    /api/plans/{id}                 # Détails d'un planning
POST   /api/plans                      # Création d'un planning
PUT    /api/plans/{id}                 # Modification d'un planning
DELETE /api/plans/{id}                 # Suppression d'un planning
GET    /api/plans/{id}/shopping-list   # Liste de courses
```

## 🔒 Sécurité et Bonnes Pratiques

### Configuration Sécurisée
- ✅ **Variables d'environnement** : Credentials externalisés
- ✅ **Profils Spring** : Configuration par environnement
- ✅ **Validation des données** : Bean Validation côté backend
- ✅ **Gestion d'erreurs** : Pas d'exposition de stack traces
- ✅ **Cache sécurisé** : Signature HMAC des données
- ✅ **Logging configuré** : Niveaux appropriés par environnement

### Sécurité Frontend
- ✅ **Protection XSS** : JSX et sanitisation
- ✅ **Error Boundaries** : Gestion des erreurs React
- ✅ **Cache validé** : Vérification d'intégrité HMAC
- ✅ **Logging sélectif** : Exclusion des données sensibles

### Fonctionnalités Sécurité Implémentées ✅
- ✅ **Authentification JWT** : Spring Security avec tokens sécurisés
- ✅ **Autorisation RBAC** : Rôles et permissions (ROLE_USER, ROLE_ADMIN)
- ✅ **Protected Routes** : Contrôle d'accès frontend granulaire
- ✅ **Method Security** : @PreAuthorize sur endpoints sensibles
- ✅ **Password Hashing** : BCrypt avec salt
- ✅ **CSRF Protection** : Protection contre attaques cross-site

### À Implémenter (Roadmap)
- 🔄 **Rate Limiting** : Protection DDoS par IP/utilisateur
- 🔄 **Audit Logging** : Traçabilité des actions admin
- 🔄 **HTTPS** : Chiffrement en transit (nginx SSL)
- 🔄 **Tests de sécurité** : OWASP ZAP, SonarQube

## 📈 Performance et Monitoring

### Cache Intelligent
- **Multi-niveaux** : Mémoire + localStorage
- **TTL configuré** : Expiration automatique
- **Validation HMAC** : Intégrité des données
- **Prefetching** : Chargement prédictif

### Monitoring Développement
- **CacheMonitor** : Statistiques en temps réel
- **Performance Hooks** : Métriques personnalisées
- **Error Tracking** : Logging centralisé
- **Network Monitoring** : Requêtes et latences

### Optimisations
- **Lazy Loading** : Code splitting automatique
- **Bundle Analysis** : Optimisation des imports
- **Image Optimization** : Formats modernes
- **Service Worker** : Cache offline (roadmap)

## 🧪 Tests et Qualité

### Tests Backend (À Implémenter)
```bash
# Tests unitaires
mvn test

# Tests d'intégration
mvn test -Dtest="*IT"

# Coverage
mvn jacoco:report
```

### Tests Frontend (À Implémenter)
```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

### Outils de Qualité
- **ESLint + Prettier** : Code style JavaScript/TypeScript
- **Checkstyle** : Code style Java
- **SpotBugs** : Analyse statique Java
- **SonarQube** : Qualité et sécurité (roadmap)

## 🚀 Déploiement

### Développement
```bash
# Backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Frontend
npm run dev
```

### Production
```bash
# Build backend
mvn clean package -Pprod

# Build frontend
npm run build

# Variables d'environnement
export SPRING_PROFILES_ACTIVE=prod
export DB_PASSWORD=secure_password
export CACHE_HMAC_KEY=secure_hmac_key

# Démarrage
java -jar backend/target/backend-0.0.1-SNAPSHOT.jar
```

### Docker

#### Prérequis
```bash
# IMPORTANT: Créer d'abord le fichier .env racine
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
echo "DB_PASSWORD=$(grep DB_PASSWORD backend/.env | cut -d'=' -f2)" > .env
```

#### Commandes Docker
```bash
# Production (optimisé)
docker-compose up -d

# Développement (hot reload)
docker-compose -f docker-compose.dev.yml up -d

# Build manuel si nécessaire
docker build -t kitchencraft-backend:prod ./backend
docker build -t kitchencraft-frontend:prod ./frontend
```

## 🤝 Contribution

### Standards de Code
- **Java** : Google Java Style Guide
- **TypeScript** : ESLint + Prettier
- **Git** : Conventional Commits
- **Documentation** : JavaDoc + TSDoc

### Workflow de Contribution
1. Fork du repository
2. Création d'une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commits avec messages conventionnels
4. Tests et validation qualité
5. Push vers la branche (`git push origin feature/AmazingFeature`)
6. Ouverture d'une Pull Request

### Issues et Support
- 🐛 **Bugs** : Utiliser le template de bug report
- 💡 **Features** : Utiliser le template de feature request
- ❓ **Questions** : Utiliser les Discussions GitHub

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🎯 Roadmap

### ✅ Version 1.1 (Complétée)
- [x] **Support Docker complet** : Production + Développement
- [x] **Hot reload environment** : Frontend React + Backend Spring Boot
- [x] **Multi-environment support** : Détection automatique Local/Docker
- [x] **Container optimization** : Multi-stage builds, health checks

### ✅ Version 1.2 (Actuelle) - Authentification et Sécurité
- [x] **Authentification JWT complète** : Spring Security + tokens sécurisés
- [x] **Authorization RBAC** : Contrôle d'accès basé sur les rôles (ROLE_USER/ROLE_ADMIN)
- [x] **Interface d'administration** : Dashboard + gestion utilisateurs
- [x] **Protected Routes** : Sécurisation complète frontend
- [x] **Admin Management** : Outils de maintenance et statistiques système
- [x] **Password Security** : BCrypt + validation robuste

### Version 1.3 (Prochaine)
- [ ] **Tests automatisés complets** : Unit + Integration + E2E pour auth/admin
- [ ] **Service Worker** : Mode offline et cache intelligent
- [ ] **Notifications push** : Rappels et alertes
- [ ] **Rate Limiting** : Protection DDoS et brute force

### Version 1.4
- [ ] **API GraphQL** : Alternative REST plus flexible
- [ ] **Mode collaboratif** : Partage de recettes entre utilisateurs
- [ ] **Import/Export** : Formats standards (JSON, PDF)
- [ ] **Intégration calendrier** : Synchronisation événements

### Version 2.0 (Majeure - Breaking Changes)
- [ ] **OAuth2 Integration** : Google, GitHub, Microsoft (breaking: nouveaux endpoints)
- [ ] **2FA/MFA** : Authentification à deux facteurs (breaking: schéma user)
- [ ] **Application mobile** : React Native cross-platform
- [ ] **Refonte architecture** : Microservices + Event-driven

### Version 2.x (Futures)
- [ ] **IA suggestions** : Recommandations personnalisées
- [ ] **Reconnaissance d'images** : Scan automatique ingrédients
- [ ] **Analyse nutritionnelle** : Calculs détaillés et conseils

---

**Made with ❤️ by Kaiju-31**

Pour plus d'informations, consultez la [documentation complète](docs/) ou ouvrez une [issue](https://github.com/Kaiju-31/KitchenCraft/issues).
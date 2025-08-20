# 🍳 KitchenCraft

> **Gestionnaire de recettes culinaires moderne et performant**

KitchenCraft est une application full-stack développée avec Spring Boot et React, conçue pour simplifier la gestion de vos recettes, ingrédients et plannings de repas. L'application met l'accent sur les performances, la sécurité et l'expérience utilisateur.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

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

### ⚡ Performances et UX
- **Cache intelligent multi-niveaux** : Optimisation des temps de chargement
- **Recherche optimisée** : URLs sémantiques et cache prédictif
- **Interface responsive** : Adaptation mobile, tablette et desktop
- **Lazy loading** : Chargement à la demande des composants
- **Monitoring intégré** : Suivi des performances en développement

## 🏗️ Architecture Technique

### Backend (Spring Boot 3.2.0)
```
backend/
├── src/main/java/com/kitchencraft/recipe/
│   ├── controller/          # Contrôleurs REST API
│   ├── service/            # Logique métier
│   ├── repository/         # Accès aux données (JPA)
│   ├── model/             # Entités JPA
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
│   │   ├── performance/  # Monitoring de performance
│   │   └── error/        # Gestion d'erreurs
│   ├── hooks/            # Hooks personnalisés
│   ├── pages/            # Pages principales
│   ├── services/         # Services API
│   ├── utils/            # Utilitaires
│   ├── types/            # Types TypeScript
│   └── layout/           # Layout principal
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
└── PlanRecipe          # Liaison planning-recette
```

## 🚀 Installation et Configuration

### Prérequis
- **Java 21+** (OpenJDK recommandé)
- **Node.js 18+** avec npm
- **PostgreSQL 16+**
- **Docker** (optionnel, pour la base de données)

### 1. Clonage du Repository
```bash
git clone <repository-url>
cd KitchenCraft
```

### 2. Configuration de la Base de Données

#### Option A : Docker (Recommandé)
```bash
# Démarrer PostgreSQL avec Docker Compose
docker-compose up -d
```

#### Option B : Installation Manuelle
```bash
# Créer la base de données
createdb kitchencraft
```

### 3. Configuration Backend

#### Variables d'Environnement
```bash
# Copier le fichier exemple
cp backend/.env.example backend/.env

# Éditer les variables selon votre environnement
nano backend/.env
```

#### Configuration Application
```bash
# Copier la configuration exemple
cp backend/src/main/resources/application-example.yml backend/src/main/resources/application.yml

# Adapter selon votre environnement (dev/prod)
nano backend/src/main/resources/application.yml
```

#### Variables Principales
```yaml
# Base de données
DB_URL=jdbc:postgresql://localhost:5432/kitchencraft
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe_sécurisé

# Profil Spring (dev/prod)
SPRING_PROFILES_ACTIVE=dev

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
```bash
# API Backend
VITE_API_BASE_URL=http://localhost:8080/api

# Cache et Performance
VITE_CACHE_ENABLED=true
VITE_CACHE_HMAC_KEY=votre_clé_hmac_sécurisée_32_caractères_minimum

# Logging
VITE_LOG_LEVEL=info
VITE_DEBUG_CACHE_MONITOR=true
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

### 6. Accès à l'Application

- **Frontend** : [http://localhost:5173](http://localhost:5173)
- **Backend API** : [http://localhost:8080/api](http://localhost:8080/api)
- **Documentation API** : [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Health Check** : [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

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

### Recettes
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

### Ingrédients
```http
GET    /api/ingredients                # Liste tous les ingrédients
GET    /api/ingredients/{id}           # Détails d'un ingrédient
GET    /api/ingredients/search?q=...   # Recherche d'ingrédients
POST   /api/ingredients                # Création d'un ingrédient
PUT    /api/ingredients/{id}           # Modification d'un ingrédient
DELETE /api/ingredients/{id}           # Suppression d'un ingrédient
```

### Plannings
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

### À Implémenter (Roadmap)
- 🔄 **Authentification JWT** : Spring Security
- 🔄 **Autorisation RBAC** : Rôles et permissions
- 🔄 **Rate Limiting** : Protection DDoS
- 🔄 **Audit Logging** : Traçabilité des actions
- 🔄 **HTTPS** : Chiffrement en transit
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

### Docker (Roadmap)
```bash
# Build images
docker build -t kitchencraft-backend ./backend
docker build -t kitchencraft-frontend ./frontend

# Docker Compose complet
docker-compose -f docker-compose.prod.yml up -d
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

### Version 1.1
- [ ] Authentification JWT
- [ ] Tests automatisés complets
- [ ] Service Worker pour mode offline
- [ ] Notifications push

### Version 1.2
- [ ] API GraphQL
- [ ] Mode collaboratif
- [ ] Import/Export de recettes
- [ ] Intégration calendrier

### Version 2.0
- [ ] Application mobile (React Native)
- [ ] IA pour suggestions de recettes
- [ ] Reconnaissance d'images
- [ ] Analyse nutritionnelle

---

**Made with ❤️ by [Your Name]**

Pour plus d'informations, consultez la [documentation complète](docs/) ou ouvrez une [issue](https://github.com/your-repo/issues).
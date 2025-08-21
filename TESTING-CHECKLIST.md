# 🧪 Checklist de Tests - Variables d'Environnement

Cette checklist doit être validée **AVANT** de push les modifications .env pour s'assurer que tous les environnements fonctionnent correctement.

## 📋 Préparation Initiale

### ✅ Configuration des fichiers .env
- [ ] `backend/.env.example` copié vers `backend/.env` 
- [ ] `frontend/.env.example` copié vers `frontend/.env.local`
- [ ] Mots de passe modifiés dans les .env (pas les valeurs par défaut)
- [ ] Clé HMAC modifiée dans frontend/.env.local (32 caractères minimum)
- [ ] **IMPORTANT**: Créer `.env` à la racine avec `DB_PASSWORD=same_password_as_backend_env`

### ✅ Vérification .gitignore
- [ ] `.env` est bien dans .gitignore (ligne 157)
- [ ] `.env.local` est bien dans .gitignore (ligne 158)
- [ ] Aucun fichier .env n'apparaît dans `git status`

---

## 🖥️ Tests Environnement Local (Natif)

### ✅ Backend Local
```bash
# Test 1: Démarrage backend seul
cd backend
mvn spring-boot:run
```
**Validation :**
- [ ] Message "✅ Fichier .env chargé avec X variables" affiché au démarrage
- [ ] Application démarre sans erreur
- [ ] Se connecte à PostgreSQL avec le mot de passe du .env
- [ ] Logs affichés selon LOG_LEVEL_APP du .env
- [ ] Port 8080 accessible : `curl http://localhost:8080/api/recipes`

**En cas d'erreur "password authentication failed" :**
- Vérifier que le container PostgreSQL tourne
- Vérifier que le fichier `backend/.env` existe
- Vérifier que le mot de passe dans `.env` correspond à celui du container
- **Pour Docker**: Vérifier que `.env` à la racine existe avec la même `DB_PASSWORD` que `backend/.env`
- Recompiler avec `mvn clean compile` après modification du .env

### ✅ Frontend Local  
```bash
# Test 2: Démarrage frontend seul
cd frontend
npm run dev
```
**Validation :**
- [ ] Vite démarre sur port 5173
- [ ] Aucune erreur HMAC dans la console
- [ ] Cache fonctionne avec la clé HMAC du .env.local
- [ ] Logs affichés selon VITE_LOG_LEVEL

### ✅ Test Stack Locale Complète
```bash
# Test 3: Backend + Frontend ensemble
# Terminal 1:
cd backend && mvn spring-boot:run

# Terminal 2: 
cd frontend && npm run dev
```
**Validation :**
- [ ] Frontend accessible : http://localhost:5173
- [ ] API calls fonctionnent (voir Network dans DevTools)
- [ ] Création/modification de recettes fonctionne
- [ ] Aucune erreur 500/400 dans les logs

---

## 🐳 Tests Environnement Docker Production

### ✅ Build et Démarrage
```bash
# Test 4: Docker production
docker-compose up --build -d
```
**Validation :**
- [ ] Les 3 services démarrent : postgres, backend, frontend
- [ ] Tous les services passent les health checks
- [ ] Variables .env chargées : `docker-compose logs backend | grep "DB_PASSWORD"`

### ✅ Test Fonctionnel Production
```bash
# Test 5: Accès production
curl http://localhost/api/recipes
```
**Validation :**
- [ ] Frontend accessible : http://localhost (port 80)
- [ ] API fonctionne via Nginx reverse proxy
- [ ] Base de données persistante (volume postgres_data)
- [ ] Création de recette fonctionne en production

### ✅ Nettoyage Production
```bash
# Test 6: Nettoyage complet
docker-compose down -v
docker system prune -f
```

---

## 🔥 Tests Environnement Docker Développement

### ✅ Build et Hot Reload
```bash
# Test 7: Docker développement
docker-compose -f docker-compose.dev.yml up --build -d
```
**Validation :**
- [ ] Les 3 services démarrent avec images :dev
- [ ] Variables .env chargées dans les conteneurs
- [ ] Frontend sur port 5173, backend sur 8080

### ✅ Test Hot Reload Frontend
```bash
# Test 8: Modification frontend en live
# Modifier un fichier dans frontend/src/
echo 'console.log("Hot reload test");' >> frontend/src/App.tsx
```
**Validation :**
- [ ] Vite détecte le changement dans les logs
- [ ] Page se recharge automatiquement dans le navigateur
- [ ] Modification visible immédiatement

### ✅ Test Hot Reload Backend
```bash
# Test 9: Modification backend (si fonctionnel)
# Modifier un fichier Java et observer les logs
```
**Validation :**
- [ ] DevTools redémarre l'application (logs Spring Boot)
- [ ] API reste accessible après redémarrage
- [ ] Changements pris en compte

### ✅ Nettoyage Développement
```bash
# Test 10: Nettoyage dev
docker-compose -f docker-compose.dev.yml down -v
```

---

## 🔒 Tests Sécurité et Validation

### ✅ Validation Mots de Passe
- [ ] Aucun mot de passe "postgres" en dur dans les logs Docker
- [ ] Variable DB_PASSWORD bien utilisée depuis .env
- [ ] Clé HMAC différente des exemples dans .env.local

### ✅ Test Variables Manquantes
```bash
# Test 11: .env manquant
mv backend/.env backend/.env.backup
docker-compose up backend
```
**Validation :**
- [ ] Service utilise les valeurs par défaut (mot de passe faible)
- [ ] Warning/erreur si variables critiques manquent
- [ ] Restaurer : `mv backend/.env.backup backend/.env`

### ✅ Test Valeurs Incorrectes
```bash
# Test 12: Mauvaise configuration DB
# Modifier temporairement DB_PASSWORD dans .env avec une valeur incorrecte
sed -i 's/kitchencraft_2025_SecurePass!/wrong_password/' backend/.env
docker-compose up backend
```
**Validation :**
- [ ] Backend fail avec erreur de connexion DB explicite
- [ ] Restaurer la bonne valeur dans .env

---

## 📚 Tests Cohérence Documentation

### ✅ README Principal
- [ ] Instructions .env cohérentes avec les fichiers .env.example
- [ ] Commandes de copie exactes et fonctionnelles
- [ ] Exemples de variables à jour

### ✅ README-DEV
- [ ] Instructions Docker dev cohérentes
- [ ] Variables d'exemple correspondent aux .env.example
- [ ] Commandes de test fonctionnent

### ✅ Validation Scripts
```bash
# Test 13: Toutes les commandes des README
# Exécuter une par une les commandes des README et vérifier qu'elles fonctionnent
```

---

## ✅ Validation Finale

### ✅ Checklist Complète
- [ ] **Local natif** : ✅ Backend + Frontend fonctionnels
- [ ] **Docker prod** : ✅ Stack complète fonctionnelle
- [ ] **Docker dev** : ✅ Hot reload fonctionnel
- [ ] **Sécurité** : ✅ Variables protégées, mots de passe forts
- [ ] **Documentation** : ✅ README cohérents et testés

### ✅ Tests de Régression
- [ ] Création de recette fonctionne dans tous les environnements
- [ ] Authentification cache HMAC fonctionne
- [ ] Logs affichés selon les niveaux configurés
- [ ] Aucune variable sensible dans les logs ou le code source

---

## 🚨 En cas de problème

### Rollback rapide
```bash
# Restaurer les anciens fichiers si problème critique
git checkout HEAD -- backend/.env.example frontend/.env.example
git checkout HEAD -- docker-compose.yml docker-compose.dev.yml
git checkout HEAD -- backend/src/main/resources/application.yml
```

### Debug variables
```bash
# Vérifier chargement variables dans Docker
docker-compose exec backend env | grep DB_
docker-compose exec frontend env | grep VITE_
```

---

**🎯 Objectif** : Tous les tests doivent passer avant le commit des modifications .env !
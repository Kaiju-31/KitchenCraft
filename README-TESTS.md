# Tests Automatisés KitchenCraft

Ce document décrit l'utilisation du système de tests automatisés pour KitchenCraft.

## Vue d'ensemble

Le script `test-automation.js` effectue une batterie complète de tests end-to-end qui valide le fonctionnement de l'ensemble de l'application :

- ✅ **Authentification** : Inscription, connexion JWT
- ✅ **CRUD Ingrédients** : Création, lecture d'ingrédients
- ✅ **CRUD Recettes** : Création complète de recettes avec ingrédients et étapes
- ✅ **CRUD Plannings** : Création et gestion de plannings hebdomadaires
- ✅ **Planification** : Ajout de recettes aux plannings
- ✅ **Listes de courses** : Génération automatique de listes de courses
- ✅ **Recherche** : Autocomplétion et recherche populaire
- ✅ **API Endpoints** : Test de tous les endpoints principaux

## Utilisation

### Méthode 1 : Scripts prêts à l'emploi

**Windows :**
```bash
./run-tests.bat
```

**Linux/Mac :**
```bash
./run-tests.sh
```

### Méthode 2 : Exécution directe

```bash
# Prérequis : Node.js 18+ installé
node test-automation.js

# Ou via npm
npm test
```

### Méthode 3 : Via npm avec options

```bash
# Test normal
npm run test

# Test en mode watch (relance automatique)
npm run test:watch

# Test en mode verbeux
npm run test:verbose
```

## Prérequis

1. **Services en cours d'exécution :**
   ```bash
   docker-compose up -d
   ```

2. **Node.js 18+ installé** (fetch natif)

3. **Backend accessible** sur `http://localhost:8080`

4. **Frontend accessible** sur `http://localhost:5173` (optionnel)

## Fonctionnalités du script

### Tests effectués

| Catégorie | Tests | Description |
|-----------|--------|-------------|
| **Infrastructure** | Health Check | Vérification que le backend répond |
| **Authentification** | Signup/Login | Création et connexion utilisateur avec JWT |
| **Ingrédients** | CRUD complet | Création, lecture, autocomplétion |
| **Recettes** | CRUD complet | Création avec ingrédients et étapes |
| **Plannings** | CRUD complet | Création et gestion de plannings |
| **Planification** | Ajout recettes | Association recettes ↔ plannings |
| **Listes de courses** | Génération | Création automatique depuis plannings |
| **Recherche** | Autocomplétion | Tests des fonctions de recherche |
| **API** | Endpoints | Validation de tous les endpoints |

### Rapport de test

Le script génère automatiquement un rapport détaillé incluant :

- ⏱️ **Durée totale** d'exécution
- 📊 **Statistiques** : nombre de tests, réussis, échoués
- 📈 **Taux de réussite** en pourcentage
- 📋 **Détail par test** avec statut et informations
- ⚠️ **Alerte** si intervention humaine nécessaire

### Exemple de sortie

```
============================================================
📊 RAPPORT DE TEST AUTOMATISÉ
============================================================
📊 Durée totale: 0.97s
📊 Tests exécutés: 23
📊 Réussis: 23
📊 Échoués: 0
📊 Taux de réussite: 100.0%

🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !
Aucune intervention humaine requise.
============================================================
```

## Intervention humaine requise

Le script détermine automatiquement si une intervention humaine est nécessaire basé sur :

- **Tests échoués** > 0
- **Taux de réussite** < 80%

En cas d'échec, le rapport indique :
- ⚠️ Les tests qui ont échoué
- 🔍 Les détails des erreurs
- 📝 Les actions recommandées

## Configuration

### Variables d'environnement

```javascript
const BASE_URL = 'http://localhost:8080/api';      // URL du backend
const FRONTEND_URL = 'http://localhost:5173';       // URL du frontend
```

### Personnalisation des tests

Le script est modulaire, vous pouvez :

1. **Ajouter de nouveaux tests** en étendant la classe `TestRunner`
2. **Modifier les données de test** dans chaque méthode
3. **Ajuster les critères de réussite** dans `generateReport()`

## Structure du code

```
test-automation.js
├── TestRunner class
│   ├── Configuration et utilitaires
│   ├── Tests d'infrastructure (health, auth)
│   ├── Tests CRUD (ingredients, recipes, plans)
│   ├── Tests fonctionnels (search, shopping lists)
│   └── Génération de rapport
└── Exécution automatique si lancé directement
```

## Dépannage

### Backend non accessible
```
❌ Backend Health Check (Status: 0)
```
**Solution :** Vérifiez que `docker-compose up -d` est lancé et que le port 8080 est libre.

### Erreurs d'authentification
```
❌ User Signup (Error: 500)
```
**Solution :** Vérifiez que la base de données est initialisée et les migrations appliquées.

### Erreurs de contraintes
```
❌ Create Recipe (Error: Violation des contraintes d'intégrité)
```
**Solution :** Vérifiez la cohérence des données (types de recettes, format des ingrédients).

### Timeout
Le script inclut des timeouts appropriés, mais si nécessaire vous pouvez les ajuster dans la méthode `makeRequest()`.

## Évolution

Ce script peut être étendu pour inclure :

- **Tests de charge** avec plusieurs utilisateurs
- **Tests de régression** automatiques  
- **Intégration CI/CD** avec GitHub Actions
- **Tests de performance** avec métriques
- **Tests de sécurité** approfondis
- **Tests de compatibilité** navigateurs

## Commandes utiles

```bash
# Nettoyer la base avant tests
docker-compose down -v && docker-compose up -d

# Logs en temps réel pendant les tests  
docker-compose logs -f backend

# Vérifier l'état des services
docker-compose ps

# Accéder à la base de données
docker exec -it kitchencraft-db-dev psql -U postgres -d kitchencraft
```
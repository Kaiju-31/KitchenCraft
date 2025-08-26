#!/usr/bin/env node

/**
 * Script de nettoyage des données de test
 * Supprime les utilisateurs, ingrédients, recettes et plannings créés par les tests automatisés
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}🔄 ${msg}${colors.reset}`)
};

const BASE_URL = 'http://localhost:8080/api';

class TestDataCleaner {
  constructor() {
    this.adminToken = null;
    this.cleanupResults = {
      users: 0,
      ingredients: 0,
      recipes: 0,
      plans: 0
    };
  }

  async makeRequest(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.adminToken && { 'Authorization': `Bearer ${this.adminToken}` }),
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const responseData = response.headers.get('content-type')?.includes('application/json') 
        ? await response.json() 
        : await response.text();

      return {
        ok: response.ok,
        status: response.status,
        data: responseData
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: error.message
      };
    }
  }

  async loginAsAdmin() {
    log.step('Connexion en tant qu\'administrateur...');
    
    const response = await this.makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'AdminPassword123!'
      })
    });

    if (response.ok && response.data.token) {
      this.adminToken = response.data.token;
      log.success('Connecté en tant qu\'administrateur');
      return true;
    } else {
      log.error('Impossible de se connecter en tant qu\'administrateur');
      return false;
    }
  }

  async cleanupTestUsers() {
    log.step('Recherche des utilisateurs de test...');
    
    // Note: Cette fonctionnalité nécessiterait un endpoint admin pour lister les utilisateurs
    // Pour l'instant, nous assumons que les utilisateurs de test ont un pattern spécifique
    log.warning('Nettoyage des utilisateurs de test non implémenté (nécessite endpoint admin)');
    return 0;
  }

  async cleanupTestIngredients() {
    log.step('Nettoyage des ingrédients de test...');
    
    // Récupérer tous les ingrédients
    const response = await this.makeRequest(`${BASE_URL}/ingredients`);
    if (!response.ok) {
      log.error('Impossible de récupérer la liste des ingrédients');
      return 0;
    }

    let count = 0;
    const ingredients = response.data;
    
    for (const ingredient of ingredients) {
      // Supprimer les ingrédients qui contiennent "Test" dans le nom
      if (ingredient.name.includes('Test') || ingredient.category === 'Test Category') {
        const deleteResponse = await this.makeRequest(`${BASE_URL}/ingredients/${ingredient.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          count++;
          log.success(`Supprimé: ${ingredient.name}`);
        } else {
          log.error(`Erreur lors de la suppression de ${ingredient.name}`);
        }
      }
    }

    return count;
  }

  async cleanupTestRecipes() {
    log.step('Nettoyage des recettes de test...');
    
    // Récupérer toutes les recettes
    const response = await this.makeRequest(`${BASE_URL}/recipes`);
    if (!response.ok) {
      log.error('Impossible de récupérer la liste des recettes');
      return 0;
    }

    let count = 0;
    const recipes = response.data;
    
    for (const recipe of recipes) {
      // Supprimer les recettes qui contiennent "Test" dans le nom
      if (recipe.name.includes('Test') || recipe.origin === 'Test') {
        const deleteResponse = await this.makeRequest(`${BASE_URL}/recipes/${recipe.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          count++;
          log.success(`Supprimé: ${recipe.name}`);
        } else {
          log.error(`Erreur lors de la suppression de ${recipe.name}`);
        }
      }
    }

    return count;
  }

  async cleanupTestPlans() {
    log.step('Nettoyage des plannings de test...');
    
    // Récupérer tous les plannings
    const response = await this.makeRequest(`${BASE_URL}/plans`);
    if (!response.ok) {
      log.error('Impossible de récupérer la liste des plannings');
      return 0;
    }

    let count = 0;
    const plans = response.data;
    
    for (const plan of plans) {
      // Supprimer les plannings qui contiennent "Test" dans le nom
      if (plan.name.includes('Test')) {
        const deleteResponse = await this.makeRequest(`${BASE_URL}/plans/${plan.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          count++;
          log.success(`Supprimé: ${plan.name}`);
        } else {
          log.error(`Erreur lors de la suppression de ${plan.name}`);
        }
      }
    }

    return count;
  }

  async runCleanup() {
    log.info('🧹 Démarrage du nettoyage des données de test...\n');

    const startTime = Date.now();

    // Connexion admin
    const loginOk = await this.loginAsAdmin();
    if (!loginOk) {
      log.error('Impossible de continuer sans authentification administrateur');
      return;
    }

    // Nettoyage dans l'ordre (dépendances)
    this.cleanupResults.plans = await this.cleanupTestPlans();
    this.cleanupResults.recipes = await this.cleanupTestRecipes();
    this.cleanupResults.ingredients = await this.cleanupTestIngredients();
    this.cleanupResults.users = await this.cleanupTestUsers();

    this.generateReport(startTime);
  }

  generateReport(startTime) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const total = Object.values(this.cleanupResults).reduce((sum, count) => sum + count, 0);

    console.log('\n' + '='.repeat(50));
    log.info('RAPPORT DE NETTOYAGE');
    console.log('='.repeat(50));
    
    log.info(`Durée totale: ${duration}s`);
    log.info(`Total supprimé: ${total} éléments`);
    log.info(`├── Plannings: ${this.cleanupResults.plans}`);
    log.info(`├── Recettes: ${this.cleanupResults.recipes}`);
    log.info(`├── Ingrédients: ${this.cleanupResults.ingredients}`);
    log.info(`└── Utilisateurs: ${this.cleanupResults.users}`);

    if (total > 0) {
      log.success('🎉 Nettoyage terminé avec succès !');
    } else {
      log.info('ℹ️  Aucune donnée de test trouvée à supprimer');
    }

    console.log('='.repeat(50));
  }
}

// Exécution si le script est lancé directement
if (process.argv[1] && process.argv[1].endsWith('cleanup-test-data.js')) {
  const cleaner = new TestDataCleaner();
  cleaner.runCleanup()
    .catch(error => {
      log.error(`Erreur fatale: ${error.message}`);
      console.error(error);
      process.exit(1);
    });
}

export default TestDataCleaner;
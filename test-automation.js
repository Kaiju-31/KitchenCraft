#!/usr/bin/env node

/**
 * Script d'automatisation de test complet pour KitchenCraft
 * Teste le flow complet : signup -> login -> création d'ingrédient, recette, planning
 */

// fetch est disponible nativement dans Node.js 18+

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}🔄 ${msg}${colors.reset}`),
  result: (msg) => console.log(`${colors.magenta}📊 ${msg}${colors.reset}`)
};

const BASE_URL = 'http://localhost:8080/api';
const FRONTEND_URL = 'http://localhost:5173';

class TestRunner {
  constructor() {
    this.token = null;
    this.userId = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async makeRequest(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
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

  recordTest(name, passed, details = '') {
    this.testResults.tests.push({ name, passed, details });
    if (passed) {
      this.testResults.passed++;
      log.success(`${name} ${details ? '(' + details + ')' : ''}`);
    } else {
      this.testResults.failed++;
      log.error(`${name} ${details ? '(' + details + ')' : ''}`);
    }
  }

  async testHealthCheck() {
    log.step('Vérification de la santé du backend...');
    const response = await this.makeRequest(`${BASE_URL}/../health`);
    this.recordTest('Backend Health Check', response.ok, `Status: ${response.status}`);
    return response.ok;
  }

  async testSignup() {
    log.step('Test d\'inscription...');
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };

    const response = await this.makeRequest(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    const passed = response.ok && response.data.token;
    if (passed) {
      this.token = response.data.token;
      this.userId = response.data.user.id;
    }

    this.recordTest('User Signup', passed, 
      passed ? `User created: ${userData.username}` : `Error: ${response.data.message || response.status}`
    );
    
    return passed;
  }

  async testLogin() {
    log.step('Test de connexion...');
    // On utilise les mêmes credentials que pour le signup
    const loginData = {
      username: this.userId ? 'testuser_' + (Date.now() - 1000) : 'admin', // Fallback vers admin si pas de signup
      password: this.userId ? 'TestPassword123!' : 'admin123'
    };

    const response = await this.makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(loginData)
    });

    const passed = response.ok && response.data.token;
    if (passed) {
      this.token = response.data.token;
    }

    this.recordTest('User Login', passed,
      passed ? `Token received` : `Error: ${response.data.message || response.status}`
    );

    return passed;
  }

  async testCreateIngredient() {
    log.step('Test de création d\'ingrédient...');
    const ingredientData = {
      name: `Ingrédient Test ${Date.now()}`,
      category: 'Test Category'
    };

    const response = await this.makeRequest(`${BASE_URL}/ingredients`, {
      method: 'POST',
      body: JSON.stringify(ingredientData)
    });

    const passed = response.ok && response.data.id;
    this.recordTest('Create Ingredient', passed,
      passed ? `ID: ${response.data.id}` : `Error: ${response.data.message || response.status}`
    );

    return passed ? response.data : null;
  }

  async testCreateRecipe() {
    log.step('Test de création de recette...');
    
    // Créons d'abord un ingrédient pour la recette
    const ingredient = await this.testCreateIngredient();
    if (!ingredient) {
      this.recordTest('Create Recipe', false, 'Failed to create ingredient dependency');
      return null;
    }

    const recipeData = {
      name: `Recette Test ${Date.now()}`,
      type: 'Plat principal',
      description: 'Une recette de test automatisée',
      person: 4,
      preparationTime: 15,
      cookingTime: 30,
      restTime: 0,
      totalTime: 45,
      origin: 'Test',
      isBabyFriendly: false,
      ingredients: [{
        ingredientName: ingredient.name,
        ingredientCategory: ingredient.category,
        quantity: 200,
        unit: 'g'
      }],
      steps: [
        'Étape 1 de test',
        'Étape 2 de test'
      ]
    };

    const response = await this.makeRequest(`${BASE_URL}/recipes`, {
      method: 'POST',
      body: JSON.stringify(recipeData)
    });

    const passed = response.ok && response.data.id;
    this.recordTest('Create Recipe', passed,
      passed ? `ID: ${response.data.id}` : `Error: ${response.data.message || response.status}`
    );

    return passed ? response.data : null;
  }

  async testCreateWeeklyPlan() {
    log.step('Test de création de planning hebdomadaire...');
    const planData = {
      name: `Planning Test ${Date.now()}`,
      description: 'Un planning de test automatisé',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      durationWeeks: 1
    };

    const response = await this.makeRequest(`${BASE_URL}/plans`, {
      method: 'POST',
      body: JSON.stringify(planData)
    });

    const passed = response.ok && response.data.id;
    this.recordTest('Create Weekly Plan', passed,
      passed ? `ID: ${response.data.id}` : `Error: ${response.data.message || response.status}`
    );

    return passed ? response.data : null;
  }

  async testAddRecipeToPlan() {
    log.step('Test d\'ajout de recette au planning...');
    
    // Créons une recette et un planning
    const recipe = await this.testCreateRecipe();
    const plan = await this.testCreateWeeklyPlan();

    if (!recipe || !plan) {
      this.recordTest('Add Recipe to Plan', false, 'Failed to create recipe or plan dependency');
      return false;
    }

    const planRecipeData = {
      recipeId: recipe.id,
      plannedDate: new Date().toISOString().split('T')[0],
      mealType: 'DEJEUNER',
      scaledPerson: 4
    };

    const response = await this.makeRequest(`${BASE_URL}/plans/${plan.id}/recipes`, {
      method: 'POST',
      body: JSON.stringify(planRecipeData)
    });

    const passed = response.ok && response.data.id;
    this.recordTest('Add Recipe to Plan', passed,
      passed ? `Plan Recipe ID: ${response.data.id}` : `Error: ${response.data.message || response.status}`
    );

    return passed;
  }

  async testGenerateShoppingList() {
    log.step('Test de génération de liste de courses...');
    
    // Créons un planning avec une recette
    const recipe = await this.testCreateRecipe();
    const plan = await this.testCreateWeeklyPlan();

    if (!recipe || !plan) {
      this.recordTest('Generate Shopping List', false, 'Failed to create dependencies');
      return false;
    }

    // Ajoutons la recette au planning
    const planRecipeData = {
      recipeId: recipe.id,
      plannedDate: new Date().toISOString().split('T')[0],
      mealType: 'DEJEUNER',
      scaledPerson: 4
    };

    await this.makeRequest(`${BASE_URL}/plans/${plan.id}/recipes`, {
      method: 'POST',
      body: JSON.stringify(planRecipeData)
    });

    // Générons la liste de courses
    const response = await this.makeRequest(`${BASE_URL}/plans/${plan.id}/shopping-list/generate`, {
      method: 'POST'
    });

    const passed = response.ok && Array.isArray(response.data);
    this.recordTest('Generate Shopping List', passed,
      passed ? `${response.data.length} items` : `Error: ${response.data.message || response.status}`
    );

    return passed;
  }

  async testDataRetrieval() {
    log.step('Test de récupération des données...');
    
    const tests = [
      { name: 'Get All Ingredients', url: `${BASE_URL}/ingredients` },
      { name: 'Get All Recipes', url: `${BASE_URL}/recipes` },
      { name: 'Get All Plans', url: `${BASE_URL}/plans` },
      { name: 'Get Recipe Count', url: `${BASE_URL}/recipes/count` },
      { name: 'Get Recipe Origins', url: `${BASE_URL}/recipes/origins` }
    ];

    for (const test of tests) {
      const response = await this.makeRequest(test.url);
      this.recordTest(test.name, response.ok,
        response.ok ? `Success` : `Error: ${response.status}`
      );
    }
  }

  async testSearch() {
    log.step('Test des fonctions de recherche...');
    
    const searchTests = [
      { name: 'Ingredient Autocomplete', url: `${BASE_URL}/ingredients/autocomplete?q=test&limit=10` },
      { name: 'Recipe Autocomplete', url: `${BASE_URL}/recipes/autocomplete?q=test&limit=10` },
      { name: 'Popular Ingredients', url: `${BASE_URL}/ingredients/popular?limit=5` },
      { name: 'Popular Recipes', url: `${BASE_URL}/recipes/popular?limit=5` }
    ];

    for (const test of searchTests) {
      const response = await this.makeRequest(test.url);
      this.recordTest(test.name, response.ok,
        response.ok ? `Results: ${Array.isArray(response.data) ? response.data.length : 'OK'}` : `Error: ${response.status}`
      );
    }
  }

  async runAllTests() {
    log.info('🚀 Démarrage des tests automatisés de KitchenCraft...\n');

    const startTime = Date.now();

    // Tests de base
    const healthOk = await this.testHealthCheck();
    if (!healthOk) {
      log.error('Backend non disponible - arrêt des tests');
      return this.generateReport(startTime);
    }

    // Tests d'authentification
    const signupOk = await this.testSignup();
    if (!signupOk) {
      log.warning('Signup failed, trying login with default admin user...');
      await this.testLogin();
    }

    if (!this.token) {
      log.error('Aucun token d\'authentification disponible - arrêt des tests');
      return this.generateReport(startTime);
    }

    // Tests CRUD
    await this.testCreateIngredient();
    await this.testCreateRecipe();
    await this.testCreateWeeklyPlan();
    await this.testAddRecipeToPlan();
    await this.testGenerateShoppingList();

    // Tests de récupération de données
    await this.testDataRetrieval();

    // Tests de recherche
    await this.testSearch();

    return this.generateReport(startTime);
  }

  generateReport(startTime) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const total = this.testResults.passed + this.testResults.failed;
    const successRate = total > 0 ? ((this.testResults.passed / total) * 100).toFixed(1) : 0;

    console.log('\n' + '='.repeat(60));
    log.result('RAPPORT DE TEST AUTOMATISÉ');
    console.log('='.repeat(60));
    
    log.result(`Durée totale: ${duration}s`);
    log.result(`Tests exécutés: ${total}`);
    log.result(`Réussis: ${this.testResults.passed}`);
    log.result(`Échoués: ${this.testResults.failed}`);
    log.result(`Taux de réussite: ${successRate}%`);

    if (this.testResults.failed > 0) {
      console.log('\n❌ TESTS ÉCHOUÉS:');
      this.testResults.tests
        .filter(test => !test.passed)
        .forEach(test => log.error(`  - ${test.name}: ${test.details}`));
    }

    console.log('\n📋 DÉTAIL DES TESTS:');
    this.testResults.tests.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      console.log(`  ${status} ${test.name} ${test.details ? `(${test.details})` : ''}`);
    });

    const needsHumanIntervention = this.testResults.failed > 0 || successRate < 80;

    if (needsHumanIntervention) {
      console.log('\n' + '='.repeat(60));
      log.warning('⚠️  INTERVENTION HUMAINE REQUISE');
      log.warning('Certains tests ont échoué ou le taux de réussite est faible.');
      log.warning('Veuillez vérifier les logs ci-dessus pour plus de détails.');
    } else {
      console.log('\n' + '='.repeat(60));
      log.success('🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !');
      log.success('Aucune intervention humaine requise.');
    }

    console.log('='.repeat(60));
    return {
      success: !needsHumanIntervention,
      results: this.testResults,
      duration: parseFloat(duration),
      successRate: parseFloat(successRate)
    };
  }
}

// Exécution des tests si le script est lancé directement
if (process.argv[1] && process.argv[1].endsWith('test-automation.js')) {
  const runner = new TestRunner();
  runner.runAllTests()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      log.error(`Erreur fatale: ${error.message}`);
      console.error(error);
      process.exit(1);
    });
}

export default TestRunner;
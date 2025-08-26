#!/usr/bin/env node

/**
 * Script de test des endpoints admin
 * Teste tous les endpoints d'administration avec authentification admin
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

class AdminEndpointTester {
  constructor() {
    this.adminToken = null;
    this.userToken = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async makeRequest(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
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
      this.recordTest('Admin Login', true, 'Token reçu');
      return true;
    } else {
      this.recordTest('Admin Login', false, response.data.message || 'Token manquant');
      return false;
    }
  }

  async createTestUser() {
    log.step('Création d\'un utilisateur test pour les permissions...');
    
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

    if (response.ok && response.data.token) {
      this.userToken = response.data.token;
      this.testUserId = response.data.user.id;
      this.recordTest('Create Test User', true, `User ID: ${this.testUserId}`);
      return true;
    } else {
      this.recordTest('Create Test User', false, response.data.message || 'Échec création');
      return false;
    }
  }

  async testAdminEndpoints() {
    log.step('Test des endpoints admin avec token admin...');

    const adminTests = [
      {
        name: 'GET /api/admin/test',
        method: 'GET',
        url: `${BASE_URL}/admin/test`,
        expectedStatus: 200
      },
      {
        name: 'GET /api/admin/users',
        method: 'GET', 
        url: `${BASE_URL}/admin/users`,
        expectedStatus: 200
      },
      {
        name: 'GET /api/admin/stats',
        method: 'GET',
        url: `${BASE_URL}/admin/stats`, 
        expectedStatus: 200
      },
      {
        name: 'GET /api/admin/ingredients/orphans',
        method: 'GET',
        url: `${BASE_URL}/admin/ingredients/orphans`,
        expectedStatus: 200
      }
    ];

    for (const test of adminTests) {
      const response = await this.makeRequest(test.url, {
        method: test.method,
        headers: {
          'Authorization': `Bearer ${this.adminToken}`
        }
      });

      const passed = response.status === test.expectedStatus;
      this.recordTest(test.name, passed, 
        passed ? `Status: ${response.status}` : `Expected: ${test.expectedStatus}, Got: ${response.status}`
      );
    }
  }

  async testUserRoleManagement() {
    log.step('Test de la gestion des rôles utilisateurs...');

    if (!this.testUserId) {
      this.recordTest('User Role Management', false, 'Pas d\'utilisateur test créé');
      return;
    }

    // Test de mise à jour du rôle
    const response = await this.makeRequest(`${BASE_URL}/admin/users/${this.testUserId}/role`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.adminToken}`
      },
      body: JSON.stringify({
        roleName: 'ROLE_ADMIN'
      })
    });

    const passed = response.ok;
    this.recordTest('Update User Role', passed, 
      passed ? 'Rôle mis à jour' : `Error: ${response.data.message || response.status}`
    );
  }

  async testAccessDenialForRegularUser() {
    log.step('Test de refus d\'accès pour utilisateur normal...');

    // Créer un nouvel utilisateur qui reste ROLE_USER
    const regularUserData = {
      firstName: 'Regular',
      lastName: 'User',
      username: `regularuser_${Date.now()}`,
      email: `regular_${Date.now()}@example.com`,
      password: 'RegularPassword123!'
    };

    const createResponse = await this.makeRequest(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(regularUserData)
    });

    if (!createResponse.ok) {
      this.recordTest('Regular User Access Denied', false, 'Impossible de créer utilisateur régulier');
      return;
    }

    // Test d'accès refusé pour un utilisateur normal
    const response = await this.makeRequest(`${BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${createResponse.data.token}`
      }
    });

    // On s'attend à un 403 Forbidden
    const passed = response.status === 403;
    this.recordTest('Regular User Access Denied', passed,
      passed ? 'Accès refusé correctement (403)' : `Expected: 403, Got: ${response.status}`
    );
  }

  async testDataCleanup() {
    log.step('Test du nettoyage des données...');

    const response = await this.makeRequest(`${BASE_URL}/admin/data/cleanup`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.adminToken}`
      }
    });

    const passed = response.ok;
    this.recordTest('Data Cleanup', passed,
      passed ? `Nettoyé: ${response.data.deletedCount || 0} éléments` : `Error: ${response.status}`
    );
  }

  async runAllTests() {
    log.info('🔧 Démarrage des tests des endpoints admin...\n');

    const startTime = Date.now();

    // Connexion admin
    const adminLoginOk = await this.loginAsAdmin();
    if (!adminLoginOk) {
      log.error('Impossible de se connecter en tant qu\'admin - arrêt des tests');
      return this.generateReport(startTime);
    }

    // Création d'un utilisateur test pour les tests de permissions
    await this.createTestUser();

    // Tests des endpoints admin
    await this.testAdminEndpoints();

    // Test de gestion des rôles
    await this.testUserRoleManagement();

    // Test de refus d'accès
    await this.testAccessDenialForRegularUser();

    // Test de nettoyage
    await this.testDataCleanup();

    return this.generateReport(startTime);
  }

  generateReport(startTime) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const total = this.testResults.passed + this.testResults.failed;
    const successRate = total > 0 ? ((this.testResults.passed / total) * 100).toFixed(1) : 0;

    console.log('\n' + '='.repeat(60));
    log.info('RAPPORT DE TEST DES ENDPOINTS ADMIN');
    console.log('='.repeat(60));
    
    log.info(`Durée totale: ${duration}s`);
    log.info(`Tests exécutés: ${total}`);
    log.info(`Réussis: ${this.testResults.passed}`);
    log.info(`Échoués: ${this.testResults.failed}`);
    log.info(`Taux de réussite: ${successRate}%`);

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

    const needsAttention = this.testResults.failed > 0 || successRate < 90;

    if (needsAttention) {
      console.log('\n' + '='.repeat(60));
      log.warning('⚠️  ATTENTION REQUISE');
      log.warning('Certains tests ont échoué. Vérifiez la configuration admin.');
    } else {
      console.log('\n' + '='.repeat(60));
      log.success('🎉 TOUS LES TESTS ADMIN SONT PASSÉS !');
      log.success('Les endpoints d\'administration fonctionnent correctement.');
    }

    console.log('='.repeat(60));
    return {
      success: !needsAttention,
      results: this.testResults,
      duration: parseFloat(duration),
      successRate: parseFloat(successRate)
    };
  }
}

// Exécution si le script est lancé directement
if (process.argv[1] && process.argv[1].endsWith('test-admin-endpoints.js')) {
  const tester = new AdminEndpointTester();
  tester.runAllTests()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      log.error(`Erreur fatale: ${error.message}`);
      console.error(error);
      process.exit(1);
    });
}

export default AdminEndpointTester;
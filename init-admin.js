#!/usr/bin/env node

/**
 * Script d'initialisation de l'utilisateur administrateur
 * Crée un compte admin par défaut pour les tests et la gestion
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}🔄 ${msg}${colors.reset}`)
};

const BASE_URL = 'http://localhost:8080/api';

async function createAdmin() {
  log.step('Création de l\'utilisateur administrateur...');

  const adminData = {
    firstName: 'Admin',
    lastName: 'System',
    username: 'admin',
    email: 'admin@kitchencraft.local',
    password: 'AdminPassword123!'
  };

  try {
    const response = await fetch(`${BASE_URL}/auth/register-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminData)
    });

    const responseData = response.headers.get('content-type')?.includes('application/json') 
      ? await response.json() 
      : await response.text();

    if (response.ok) {
      log.success('Utilisateur administrateur créé avec succès');
      log.info(`Username: ${adminData.username}`);
      log.info(`Password: ${adminData.password}`);
      return true;
    } else {
      if (response.status === 409 || (typeof responseData === 'string' && responseData.includes('already exists'))) {
        log.info('Utilisateur administrateur existe déjà');
        return true;
      } else {
        log.error(`Erreur lors de la création: ${responseData.message || responseData}`);
        return false;
      }
    }
  } catch (error) {
    log.error(`Erreur de connexion: ${error.message}`);
    return false;
  }
}

async function testLogin() {
  log.step('Test de connexion administrateur...');

  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@kitchencraft.local',
        password: 'AdminPassword123!'
      })
    });

    const responseData = await response.json();

    if (response.ok && responseData.token) {
      log.success('Connexion administrateur réussie');
      return true;
    } else {
      log.error(`Erreur de connexion: ${responseData.message || 'Token manquant'}`);
      return false;
    }
  } catch (error) {
    log.error(`Erreur de connexion: ${error.message}`);
    return false;
  }
}

async function checkHealth() {
  log.step('Vérification de la santé du backend...');

  try {
    const response = await fetch(`${BASE_URL}/../health`);
    
    if (response.ok) {
      log.success('Backend opérationnel');
      return true;
    } else {
      log.error(`Backend non accessible: ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Backend non accessible: ${error.message}`);
    return false;
  }
}

async function promoteToAdmin(username) {
  log.info('Admin créé directement avec le bon rôle via /auth/register-admin');
  return true;
}

async function initializeAdmin() {
  console.log('👨‍💼 Initialisation de l\'administrateur KitchenCraft\n');

  // Vérifier le backend
  const healthOk = await checkHealth();
  if (!healthOk) {
    log.error('Backend non accessible. Vérifiez que docker-compose est démarré.');
    process.exit(1);
  }

  // Créer l'admin
  const createOk = await createAdmin();
  if (!createOk) {
    log.error('Impossible de créer l\'utilisateur administrateur.');
    process.exit(1);
  }

  // Promouvoir en admin
  const promoteOk = await promoteToAdmin('admin');
  if (!promoteOk) {
    log.error('Impossible de promouvoir l\'utilisateur en administrateur.');
    process.exit(1);
  }

  // Tester la connexion
  const loginOk = await testLogin();
  if (!loginOk) {
    log.error('Impossible de se connecter avec le compte administrateur.');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(50));
  log.success('🎉 Initialisation terminée avec succès !');
  log.info('L\'utilisateur admin a été créé et promu en administrateur.');
  log.info('Vous pouvez maintenant utiliser les scripts de test et nettoyage.');
  console.log('='.repeat(50));
}

// Exécution si le script est lancé directement
if (process.argv[1] && process.argv[1].endsWith('init-admin.js')) {
  initializeAdmin()
    .catch(error => {
      log.error(`Erreur fatale: ${error.message}`);
      console.error(error);
      process.exit(1);
    });
}
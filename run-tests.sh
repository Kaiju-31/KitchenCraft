#!/bin/bash

echo ""
echo "========================================"
echo " KitchenCraft - Tests Automatisés"
echo "========================================"
echo ""

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé ou n'est pas dans le PATH"
    echo "Veuillez installer Node.js depuis https://nodejs.org/"
    exit 1
fi

# Vérifier que les services sont en cours
echo "🔍 Vérification des services Docker..."
if ! docker-compose ps | grep -q "kitchencraft-backend-dev.*Up"; then
    echo "❌ Le backend n'est pas en cours d'exécution"
    echo "Démarrage des services..."
    docker-compose up -d
    sleep 10
fi

# Attendre que le backend soit prêt
echo "⏳ Attente du démarrage du backend..."
while ! curl -s http://localhost:8080/health > /dev/null 2>&1; do
    echo "Attente du backend..."
    sleep 2
done

echo "✅ Backend prêt !"

# Exécuter les tests
echo ""
echo "🚀 Lancement des tests automatisés..."
echo ""
node test-automation.js

echo ""
echo "========================================"
echo " Tests terminés - Vérifiez le rapport"
echo "========================================"
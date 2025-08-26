@echo off
echo.
echo ========================================
echo  KitchenCraft - Tests Automatises
echo ========================================
echo.

REM Verifier que Node.js est installe
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installe ou n'est pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Verifier que les services sont en cours
echo 🔍 Verification des services Docker...
docker-compose ps | findstr "kitchencraft-backend-dev" | findstr "Up" >nul
if %errorlevel% neq 0 (
    echo ❌ Le backend n'est pas en cours d'execution
    echo Démarrage des services...
    docker-compose up -d
    timeout /t 10 >nul
)

REM Attendre que le backend soit pret
echo ⏳ Attente du demarrage du backend...
:wait_backend
curl -s http://localhost:8080/health >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 2 >nul
    goto wait_backend
)

echo ✅ Backend pret !

REM Executer les tests
echo.
echo 🚀 Lancement des tests automatises...
echo.
node test-automation.js

echo.
echo ========================================
echo  Tests termines - Verifiez le rapport
echo ========================================
pause
# Tests des filtres de recettes

## URLs de test

### 1. Test filtrage par temps uniquement
```
GET http://localhost:8080/api/recipes/filter?minTime=10&maxTime=60
```

### 2. Test filtrage par origine uniquement  
```
GET http://localhost:8080/api/recipes/filter?origins=France&origins=Italie
```

### 3. Test filtrage combiné (temps + origine)
```
GET http://localhost:8080/api/recipes/filter?minTime=15&maxTime=45&origins=France
```

### 4. Test récupération des origines
```
GET http://localhost:8080/api/recipes/origins
```

### 5. Test filtrage avec nom de recette
```
GET http://localhost:8080/api/recipes/filter?searchTerm=pasta&minTime=20&maxTime=40
```

## Instructions
1. Redémarrer le backend : `cd backend && mvn spring-boot:run`
2. Tester les URLs ci-dessus dans le navigateur ou avec curl
3. Vérifier que les réponses JSON ne contiennent pas d'erreurs 500
4. Tester dans l'interface frontend
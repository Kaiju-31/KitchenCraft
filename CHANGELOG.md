# Changelog

All notable changes to KitchenCraft will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-08-20

### Fixed
- **Recipe Creation Bug**: Correction de la validation des types de recettes
  - Le backend acceptait uniquement les valeurs en anglais (APPETIZER, STARTER, MAIN, etc.)
  - Le frontend envoyait les valeurs en français ("Plat principal", "Entrée", etc.)
  - Alignement de la validation Pattern pour accepter les valeurs françaises
  - Résolution de l'erreur HTTP 400 lors de la création de recettes

### Changed
- Pattern de validation dans `RecipeRequest.java` : support des types de recettes en français

## [1.0.0] - 2025-08-20

### Added

#### Recipe Management
- Complete CRUD operations for recipes (create, read, update, delete)
- Advanced search functionality by name, ingredients, cooking time, and origin
- Smart filtering system with cooking time ranges, servings count, and baby-friendly options
- Automatic quantity scaling based on number of guests
- Recipe categorization (appetizer, starter, main course, dessert)
- Step-by-step cooking instructions with ordered lists

#### Ingredient Management
- Centralized ingredient database with comprehensive catalog
- Ingredient categorization system (vegetables, meats, spices, dairy, etc.)
- Autocomplete functionality with intelligent suggestions
- Search and filter capabilities for quick ingredient discovery
- Ingredient form with validation and category assignment

#### Meal Planning System
- Weekly meal planning interface with calendar view
- Automatic shopping list generation from planned recipes
- PDF export functionality for planning and shopping lists
- Flexible multi-week planning management
- Recipe selector modal for easy meal assignment

#### User Interface & Experience
- Responsive design supporting mobile, tablet, and desktop
- Modern React 19 interface with TypeScript
- Tailwind CSS for consistent styling
- Loading states and empty state components
- Confirmation dialogs for destructive actions
- Toast notifications for user feedback

#### Performance Optimizations
- Smart multi-level caching system (memory + localStorage)
- Predictive cache with contextual prefetching
- Lazy loading for optimal performance
- Code splitting and bundle optimization
- URL normalization and search navigation
- Cache monitoring in development mode

#### Technical Infrastructure
- Spring Boot 3.2.0 backend with Java 21
- PostgreSQL 16 database with JPA/Hibernate
- React 19 frontend with Vite build system
- RESTful API architecture
- Docker support for PostgreSQL
- Comprehensive error handling and validation

### Technical Details
- **Backend**: 9 REST controllers, layered architecture (Controller → Service → Repository)
- **Frontend**: 22 React components, 9 custom hooks, 8 pages
- **Database**: 6 main entities with proper relationships
- **Performance**: ~75% cache hit rate, optimized queries with pagination
- **Code Quality**: TypeScript strict mode, ESLint configuration, proper error boundaries

### Security
- Input validation with Bean Validation
- JPA parameterized queries preventing SQL injection
- Environment-based configuration
- Secure cache with HMAC validation (planned)
- CORS configuration for development

---

## Upcoming Releases

### [1.1.0] - Planned
- JWT Authentication system
- User roles and permissions
- Automated testing suite
- Full Docker deployment configuration

### [1.2.0] - Planned
- Mobile application (React Native)
- Advanced search with AI suggestions
- Image recognition for recipes
- Nutritional analysis integration

---

For more details about each release, see the [GitHub Releases](https://github.com/Kaiju-31/KitchenCraft/releases) page.
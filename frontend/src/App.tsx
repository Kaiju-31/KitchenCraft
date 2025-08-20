import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./layout/Layout";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Ingredients from "./pages/Ingredients";
import Planning from "./pages/Planning";
import PlanningDetail from "./pages/PlanningDetail";
import LoadingSpinner from "./components/ui/LoadingSpinner";

// Lazy loading pour les composants de recherche
const RecipeSearchByName = lazy(() => import("./pages/RecipeSearchByName"));
const RecipeSearchByIngredients = lazy(() => import("./pages/RecipeSearchByIngredients"));
const RecipeFilter = lazy(() => import("./pages/RecipeFilter"));

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Recipes />} />
                    <Route path="recipes" element={<Recipes />} />
                    <Route path="recipes/:id" element={<RecipeDetail />} />
                    
                    {/* Routes de recherche avec lazy loading */}
                    <Route 
                        path="search/recipes/name/:name" 
                        element={
                            <Suspense fallback={<LoadingSpinner size="large" />}>
                                <RecipeSearchByName />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path="search/recipes/ingredients/:ingredients" 
                        element={
                            <Suspense fallback={<LoadingSpinner size="large" />}>
                                <RecipeSearchByIngredients />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path="search/recipes/filter" 
                        element={
                            <Suspense fallback={<LoadingSpinner size="large" />}>
                                <RecipeFilter />
                            </Suspense>
                        } 
                    />
                    
                    <Route path="ingredients" element={<Ingredients />} />
                    <Route path="planning" element={<Planning />} />
                    <Route path="planning/:id" element={<PlanningDetail />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

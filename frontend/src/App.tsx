import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./layout/Layout";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Ingredients from "./pages/Ingredients";
import Planning from "./pages/Planning";
import PlanningDetail from "./pages/PlanningDetail";
import FoodItems from "./pages/FoodItems";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import AdminLayout from "./layout/AdminLayout";
import { AuthProvider } from "./contexts/AuthContext";

// Lazy loading pour les composants de recherche
const RecipeSearchByName = lazy(() => import("./pages/RecipeSearchByName"));
const RecipeSearchByIngredients = lazy(() => import("./pages/RecipeSearchByIngredients"));
const RecipeFilter = lazy(() => import("./pages/RecipeFilter"));

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    
                    {/* Protected routes */}
                    <Route 
                        path="/" 
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="" element={<Navigate to="recipes" replace />} />
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
                        <Route path="food-items" element={<FoodItems />} />
                        <Route path="food-items/:itemId" element={<FoodItems />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>

                    {/* Admin routes */}
                    <Route 
                        path="/admin" 
                        element={
                            <ProtectedRoute>
                                <AdminRoute>
                                    <AdminLayout />
                                </AdminRoute>
                            </ProtectedRoute>
                        }
                    >
                        <Route path="" element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                    </Route>
                    
                    {/* Catch all other routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

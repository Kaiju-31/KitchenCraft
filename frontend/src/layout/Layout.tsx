import { Link, Outlet, useLocation } from "react-router-dom";
import { ChefHat, Search, BookOpen, Leaf, Calendar, User, LogOut, Settings, Apple } from "lucide-react";
import CacheMonitor from "../components/performance/CacheMonitor";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { adminService } from "../services/adminService";

export default function Layout() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (user) {
                try {
                    await adminService.testAdminAccess();
                    setIsAdmin(true);
                } catch {
                    setIsAdmin(false);
                }
            }
        };

        checkAdminStatus();
    }, [user]);

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* HEADER avec effet glassmorphism */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg shadow-black/5">
                <nav className="max-w-7xl mx-auto flex justify-between items-center p-3 sm:p-4 xl:px-8">
                    {/* Logo avec effet 3D */}
                    <Link
                        to="/"
                        className="group flex items-center space-x-2 sm:space-x-3 text-lg sm:text-2xl xl:text-3xl font-bold text-slate-800 hover:text-indigo-600 transition-all duration-300"
                    >
                        <div className="relative">
                            <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 xl:w-10 xl:h-10 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 drop-shadow-lg" />
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 -z-10"></div>
                        </div>
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-sm sm:text-base lg:text-lg xl:text-xl">
                            KitchenCraft
                        </span>
                    </Link>

                    {/* Navigation avec effets 3D */}
                    <div className="flex items-center space-x-1 sm:space-x-2 xl:space-x-4">
                        <Link
                            to="/recipes"
                            className={`group relative flex items-center justify-center lg:justify-start lg:space-x-2 px-2 sm:px-3 lg:px-4 xl:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-medium transition-all duration-300 text-sm sm:text-base ${
                                isActive('/recipes')
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                                    : 'text-slate-700 hover:text-indigo-600 hover:bg-white/50 hover:shadow-lg'
                            }`}
                        >
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 xl:w-6 xl:h-6" />
                            <span className="hidden lg:inline xl:text-lg ml-2">Recettes</span>
                            {!isActive('/recipes') && (
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                            )}
                        </Link>

                        <Link
                            to="/ingredients"
                            className={`group relative flex items-center justify-center lg:justify-start lg:space-x-2 px-2 sm:px-3 lg:px-4 xl:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-medium transition-all duration-300 text-sm sm:text-base ${
                                isActive('/ingredients')
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                                    : 'text-slate-700 hover:text-emerald-600 hover:bg-white/50 hover:shadow-lg'
                            }`}
                        >
                            <Leaf className="w-4 h-4 sm:w-5 sm:h-5 xl:w-6 xl:h-6" />
                            <span className="hidden lg:inline xl:text-lg ml-2">Ingrédients</span>
                            {!isActive('/ingredients') && (
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                            )}
                        </Link>

                        <Link
                            to="/planning"
                            className={`group relative flex items-center justify-center lg:justify-start lg:space-x-2 px-2 sm:px-3 lg:px-4 xl:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-medium transition-all duration-300 text-sm sm:text-base ${
                                isActive('/planning')
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                                    : 'text-slate-700 hover:text-purple-600 hover:bg-white/50 hover:shadow-lg'
                            }`}
                        >
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 xl:w-6 xl:h-6" />
                            <span className="hidden lg:inline xl:text-lg ml-2">Planning</span>
                            {!isActive('/planning') && (
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                            )}
                        </Link>


                        {/* User Menu */}
                        <div className="hidden sm:flex items-center space-x-2 ml-4 border-l border-white/20 pl-4">
                            {user && (
                                <>
                                    <Link
                                        to="/profile"
                                        className={`group relative flex items-center justify-center lg:justify-start lg:space-x-2 px-2 sm:px-3 lg:px-4 xl:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-medium transition-all duration-300 text-sm sm:text-base ${
                                            isActive('/profile')
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                                                : 'text-slate-700 hover:text-blue-600 hover:bg-white/50 hover:shadow-lg'
                                        }`}
                                    >
                                        <User className="w-4 h-4 sm:w-5 sm:h-5 xl:w-6 xl:h-6" />
                                        <span className="hidden lg:inline xl:text-lg ml-2">Profil</span>
                                        {!isActive('/profile') && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                        )}
                                    </Link>

                                    {isAdmin && (
                                        <Link
                                            to="/admin"
                                            className={`group relative flex items-center justify-center lg:justify-start lg:space-x-2 px-2 sm:px-3 lg:px-4 xl:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-medium transition-all duration-300 text-sm sm:text-base ${
                                                location.pathname.startsWith('/admin')
                                                    ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/25'
                                                    : 'text-slate-700 hover:text-red-600 hover:bg-white/50 hover:shadow-lg'
                                            }`}
                                        >
                                            <Settings className="w-4 h-4 sm:w-5 sm:h-5 xl:w-6 xl:h-6" />
                                            <span className="hidden lg:inline xl:text-lg ml-2">Admin</span>
                                            {!location.pathname.startsWith('/admin') && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                            )}
                                        </Link>
                                    )}

                                    <button
                                        onClick={handleLogout}
                                        className="group relative flex items-center justify-center lg:justify-start lg:space-x-2 px-2 sm:px-3 lg:px-4 xl:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-medium transition-all duration-300 text-sm sm:text-base text-slate-700 hover:text-red-600 hover:bg-white/50 hover:shadow-lg"
                                    >
                                        <LogOut className="w-4 h-4 sm:w-5 sm:h-5 xl:w-6 xl:h-6" />
                                        <span className="hidden lg:inline xl:text-lg ml-2">Déconnexion</span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile User Menu */}
                        <div className="sm:hidden flex items-center space-x-1 ml-2 border-l border-white/20 pl-2">
                            {user && (
                                <>
                                    <Link
                                        to="/profile"
                                        className={`group relative flex items-center justify-center p-2 rounded-xl font-medium transition-all duration-300 ${
                                            isActive('/profile')
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                                                : 'text-slate-700 hover:text-blue-600 hover:bg-white/50 hover:shadow-lg'
                                        }`}
                                    >
                                        <User className="w-5 h-5" />
                                    </Link>

                                    {isAdmin && (
                                        <Link
                                            to="/admin"
                                            className={`group relative flex items-center justify-center p-2 rounded-xl font-medium transition-all duration-300 ${
                                                location.pathname.startsWith('/admin')
                                                    ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/25'
                                                    : 'text-slate-700 hover:text-red-600 hover:bg-white/50 hover:shadow-lg'
                                            }`}
                                        >
                                            <Settings className="w-5 h-5" />
                                        </Link>
                                    )}

                                    <button
                                        onClick={handleLogout}
                                        className="group relative flex items-center justify-center p-2 rounded-xl font-medium transition-all duration-300 text-slate-700 hover:text-red-600 hover:bg-white/50 hover:shadow-lg"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            {/* CONTENU avec animation d'entrée */}
            <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 xl:px-8 xl:py-12">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Outlet />
                </div>
            </main>

            {/* FOOTER moderne */}
            <footer className="relative backdrop-blur-xl bg-white/30 border-t border-white/20">
                <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 xl:px-8">
                    <div className="flex flex-col sm:flex-row xl:flex-row justify-between items-center space-y-3 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-slate-600">
                            <div className="flex items-center space-x-2">
                                <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="font-medium text-sm sm:text-base">KitchenCraft</span>
                            </div>
                            <span className="hidden sm:block text-slate-400">|</span>
                            <span className="text-xs sm:text-sm text-center">L'art culinaire réinventé</span>
                        </div>

                        <div className="text-xs sm:text-sm text-slate-500 text-center">
                            © {new Date().getFullYear()} KitchenCraft. Conçu avec ❤️ pour les passionnés de cuisine.
                        </div>
                    </div>
                </div>

                {/* Effet de lumière subtile */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-emerald-500/5 pointer-events-none"></div>
            </footer>

            {/* Cache Monitor pour le développement */}
            <CacheMonitor />
        </div>
    );
}
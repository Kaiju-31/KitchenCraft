import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import type { AdminStats } from '../services/adminService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  Users,
  ChefHat,
  TestTube,
  Calendar,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orphanIngredients, setOrphanIngredients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCleanupLoading, setIsCleanupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, orphansData] = await Promise.all([
        adminService.getStats(),
        adminService.getOrphanIngredients()
      ]);
      
      setStats(statsData);
      setOrphanIngredients(orphansData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanup = async () => {
    try {
      setIsCleanupLoading(true);
      const result = await adminService.cleanupData();
      setCleanupMessage(`${result.message}: ${result.deletedCount} éléments supprimés`);
      
      // Recharger les données après nettoyage
      await loadDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du nettoyage');
    } finally {
      setIsCleanupLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner size="large" text="Chargement du dashboard..." />
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
                <button 
                  onClick={() => loadDashboardData()}
                  className="mt-2 text-sm text-red-600 hover:text-red-500"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      name: 'Utilisateurs Total',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Utilisateurs Actifs',
      value: stats?.activeUsers || 0,
      icon: BarChart3,
      color: 'bg-green-500',
    },
    {
      name: 'Recettes',
      value: stats?.totalRecipes || 0,
      icon: ChefHat,
      color: 'bg-yellow-500',
    },
    {
      name: 'Ingrédients',
      value: stats?.totalIngredients || 0,
      icon: TestTube,
      color: 'bg-purple-500',
    },
    {
      name: 'Plannings',
      value: stats?.totalPlans || 0,
      icon: Calendar,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
          <p className="mt-2 text-gray-600">
            Vue d'ensemble du système KitchenCraft
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {cleanupMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-700">{cleanupMessage}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {statsCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`${card.color} p-3 rounded-md`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {card.name}
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {card.value.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informations Système */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informations Système
              </h3>
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Origine de recette la plus populaire
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {stats?.mostPopularRecipeOrigin || 'Aucune donnée'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Catégorie d'ingrédient la plus utilisée
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {stats?.mostUsedIngredientCategory || 'Aucune donnée'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Maintenance */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Maintenance
              </h3>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Ingrédients Orphelins ({orphanIngredients.length})
                </h4>
                {orphanIngredients.length > 0 ? (
                  <div className="max-h-32 overflow-y-auto">
                    <ul className="text-sm text-gray-600 space-y-1">
                      {orphanIngredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-green-600">Aucun ingrédient orphelin</p>
                )}
              </div>

              <button
                onClick={handleCleanup}
                disabled={isCleanupLoading || orphanIngredients.length === 0}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
              >
                {isCleanupLoading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Nettoyage...</span>
                  </div>
                ) : (
                  'Nettoyer les Données Orphelines'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
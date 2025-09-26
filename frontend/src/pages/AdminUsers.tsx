import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import type { AdminUser, CreateUserRequest, EditUserRequest } from '../services/adminService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CreateUserModal from '../components/admin/CreateUserModal';
import EditUserModal from '../components/admin/EditUserModal';
import Button from '../components/ui/Button';
import {
  Trash2,
  User,
  Shield,
  AlertTriangle,
  Plus,
  Edit,
} from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await adminService.getAllUsers();
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: number, currentRole: string) => {
    try {
      setUpdatingUserId(userId);
      const newRole = currentRole === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
      
      const updatedUser = await adminService.updateUserRole(userId, newRole);
      
      setUsers(users.map(user => 
        user.id === userId ? updatedUser : user
      ));
      
      setSuccessMessage(`Rôle mis à jour avec succès`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${username}" ?`)) {
      return;
    }

    try {
      setDeletingUserId(userId);
      await adminService.deleteUser(userId);
      
      setUsers(users.filter(user => user.id !== userId));
      setSuccessMessage(`Utilisateur "${username}" supprimé avec succès`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleCreateUser = async (userData: CreateUserRequest) => {
    try {
      const newUser = await adminService.createUser(userData);
      setUsers([...users, newUser]);
      setSuccessMessage(`Utilisateur "${userData.username}" créé avec succès`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(errorMessage);
      throw err; // Re-throw to let the modal handle it
    }
  };

  const handleUserCreated = () => {
    // This is called when the modal closes after successful creation
    // The success message is already set in handleCreateUser
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (userId: number, userData: EditUserRequest) => {
    try {
      const updatedUser = await adminService.updateUser(userId, userData);
      setUsers(users.map(user => 
        user.id === userId ? updatedUser : user
      ));
      setSuccessMessage(`Utilisateur "${userData.username}" mis à jour avec succès`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw err; // Re-throw to let the modal handle it
    }
  };

  const handleUserUpdated = () => {
    // This is called when the modal closes after successful update
    // The success message is already set in handleUpdateUser
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (roleName: string) => {
    return roleName === 'ROLE_ADMIN' 
      ? 'bg-purple-100 text-purple-800'
      : 'bg-green-100 text-green-800';
  };

  const getRoleDisplayName = (roleName: string) => {
    return roleName === 'ROLE_ADMIN' ? 'Administrateur' : 'Utilisateur';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner size="large" text="Chargement des utilisateurs..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="mt-2 text-gray-600">
              Gérer les comptes utilisateurs et leurs permissions
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer un utilisateur
          </Button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-1 text-sm text-red-600 hover:text-red-500"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Utilisateurs ({users.length})
            </h3>
          </div>
          
          <ul className="divide-y divide-gray-200">
            {users.map((user) => {
              const primaryRole = user.roles[0]?.name || 'ROLE_USER';
              const isUpdating = updatingUserId === user.id;
              const isDeleting = deletingUserId === user.id;
              
              return (
                <li key={user.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(primaryRole)}`}>
                            {primaryRole === 'ROLE_ADMIN' && (
                              <Shield className="w-3 h-3 mr-1" />
                            )}
                            {getRoleDisplayName(primaryRole)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <p>@{user.username} • {user.email}</p>
                          <p>Créé le {formatDate(user.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        disabled={isUpdating || isDeleting}
                        className="bg-blue-600 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </button>
                      
                      <button
                        onClick={() => handleRoleUpdate(user.id, primaryRole)}
                        disabled={isUpdating || isDeleting}
                        className="bg-indigo-600 text-white px-3 py-1 text-sm rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? (
                          <LoadingSpinner size="small" />
                        ) : (
                          primaryRole === 'ROLE_ADMIN' ? 'Rétrograder' : 'Promouvoir'
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        disabled={isUpdating || isDeleting}
                        className="bg-red-600 text-white px-3 py-1 text-sm rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? (
                          <LoadingSpinner size="small" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {users.length === 0 && !isLoading && (
            <div className="px-4 py-8 text-center">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aucun utilisateur trouvé dans le système.
              </p>
            </div>
          )}
        </div>

        {/* Create User Modal */}
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onUserCreated={handleUserCreated}
          onCreateUser={handleCreateUser}
        />

        {/* Edit User Modal */}
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUserUpdated={handleUserUpdated}
          onUpdateUser={handleUpdateUser}
          user={editingUser}
        />
      </div>
    </div>
  );
}
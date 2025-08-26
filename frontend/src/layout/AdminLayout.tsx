import { Outlet } from 'react-router-dom';
import AdminNav from '../components/navigation/AdminNav';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
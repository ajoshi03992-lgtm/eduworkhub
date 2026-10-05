import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { Role } from '../../types';

export function ProtectedRoute({ role }: { role: Role }) {
  const { state } = useApp();
  const user = state.currentUser;

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === 'HOD' ? '/hod/dashboard' : '/teacher/dashboard'} replace />;
  }
  return <Outlet />;
}

import { Navigate } from 'react-router-dom';
import { isLoggedIn, getCurrentUser } from '@/lib/storage';

interface Props {
  children: React.ReactNode;
  role?: 'customer' | 'shopkeeper';
}

const ProtectedRoute = ({ children, role }: Props) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'shopkeeper' ? '/shopkeeper' : '/customer'} replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;

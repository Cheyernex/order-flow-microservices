import { Navigate, Outlet } from 'react-router';
import { useAuth } from 'src/context/AuthContext';

const ProtectedRoute = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

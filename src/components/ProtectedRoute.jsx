import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ role, children }) => {
  const { token, role: currentRole } = useAuth();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (role && currentRole !== role) {
    return <Navigate to={currentRole === 'teacher' ? '/teacher' : '/student'} replace />;
  }

  return children;
};

export default ProtectedRoute;

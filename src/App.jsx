import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const App = () => {
  const { token, role } = useAuth();

  const landing = token ? (role === 'teacher' ? '/teacher' : '/student') : '/';

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to={landing} replace /> : <Login />} />
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={landing} replace />} />
    </Routes>
  );
};

export default App;

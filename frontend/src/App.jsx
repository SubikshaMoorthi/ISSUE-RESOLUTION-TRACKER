import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Import all Dashboard Components
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard'; 
import ResolverDashboard from './pages/ResolverDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Admin Only - Now using AdminDashboard component */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Resolver Only - Now using ResolverDashboard component */}
        <Route path="/resolver-dashboard" element={
          <ProtectedRoute allowedRoles={['RESOLVER']}>
            <ResolverDashboard />
          </ProtectedRoute>
        } />

        {/* User Only - Supports both USER and STUDENT roles */}
        <Route path="/user-dashboard" element={
          <ProtectedRoute allowedRoles={['USER', 'STUDENT']}> 
            <UserDashboard /> 
          </ProtectedRoute>
        } />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
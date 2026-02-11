import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Admin Only */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="p-10">Welcome Admin - Analytics and User Management</div>
          </ProtectedRoute>
        } />

        {/* Resolver Only */}
        <Route path="/resolver-dashboard" element={
          <ProtectedRoute allowedRoles={['RESOLVER']}>
            <div className="p-10">Welcome Resolver - Ticket Queue</div>
          </ProtectedRoute>
        } />

        {/* User Only */}
        <Route path="/user-dashboard" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <div className="p-10">Welcome User - Create and View Issues</div>
          </ProtectedRoute>
        } />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
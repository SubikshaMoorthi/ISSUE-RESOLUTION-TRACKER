import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import './App.css';

import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import RaiseIssue from './pages/RaiseIssue';
import UserAllIssues from './pages/UserAllIssues';
import AdminPerformance from './pages/AdminPerformance';
import AdminDepartments from './pages/AdminDepartments';
import AddUser from './pages/AddUser';
import UserInfo from './pages/UserInfo'; 
import AdminFeedbacks from './pages/AdminFeedbacks';
import ResolverDashboard from './pages/ResolverDashboard';
import ResolverAssignedIssues from './pages/ResolverAssignedIssues';
import ResolverResolvedIssues from './pages/ResolverResolvedIssues';
import ResolverFeedbacks from './pages/ResolverFeedbacks';

function App() {
  const { user, authLoading } = useContext(AuthContext);
  const role = typeof user?.role === 'string' ? user.role.trim().toUpperCase() : '';

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Admin landing page is the Performance Analytics Dashboard */}
        <Route path="/" element={!user ? <Login /> : <Navigate to={
          role === 'ROLE_ADMIN' ? '/admin/performance' : 
          role === 'ROLE_RESOLVER' ? '/resolver-dashboard' : '/user-dashboard'
        } />} />

        {/* User Routes */}
        <Route path="/user-dashboard" element={role === 'ROLE_USER' ? <Layout><UserDashboard /></Layout> : <Navigate to="/" />} />
        <Route path="/user/raise" element={role === 'ROLE_USER' ? <Layout><RaiseIssue /></Layout> : <Navigate to="/" />} />
        <Route path="/user/all-issues" element={role === 'ROLE_USER' ? <Layout><UserAllIssues /></Layout> : <Navigate to="/" />} />
        <Route path="/student-dashboard" element={<Navigate to="/user-dashboard" replace />} />

        {/* Admin Routes */}
        <Route path="/admin/performance" element={role === 'ROLE_ADMIN' ? <Layout><AdminPerformance /></Layout> : <Navigate to="/" />} />
        <Route path="/admin/departments" element={role === 'ROLE_ADMIN' ? <Layout><AdminDepartments /></Layout> : <Navigate to="/" />} />
        <Route path="/admin/all-issues" element={role === 'ROLE_ADMIN' ? <Layout><UserAllIssues /></Layout> : <Navigate to="/" />} />
        <Route path="/admin/add-user" element={role === 'ROLE_ADMIN' ? <Layout><AddUser /></Layout> : <Navigate to="/" />} />
        <Route path="/admin/users" element={role === 'ROLE_ADMIN' ? <Layout><UserInfo /></Layout> : <Navigate to="/" />} />
        <Route path="/admin/feedbacks" element={role === 'ROLE_ADMIN' ? <Layout><AdminFeedbacks /></Layout> : <Navigate to="/" />} />
        <Route path="/admin-dashboard" element={<Navigate to="/admin/performance" replace />} />

        {/* Resolver Routes */}
        <Route path="/resolver-dashboard" element={role === 'ROLE_RESOLVER' ? <Layout><ResolverDashboard /></Layout> : <Navigate to="/" />} />
        <Route path="/resolver/assigned" element={role === 'ROLE_RESOLVER' ? <Layout><ResolverAssignedIssues /></Layout> : <Navigate to="/" />} />
        <Route path="/resolver/resolved" element={role === 'ROLE_RESOLVER' ? <Layout><ResolverResolvedIssues /></Layout> : <Navigate to="/" />} />
        <Route path="/resolver/feedbacks" element={role === 'ROLE_RESOLVER' ? <Layout><ResolverFeedbacks /></Layout> : <Navigate to="/" />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

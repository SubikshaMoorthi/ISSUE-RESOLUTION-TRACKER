import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // 1. If not logged in, send to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 2. If role doesn't match the required access, block access
    if (!allowedRoles.includes(role)) {
        return <div className="p-10 text-red-600 font-bold">403 - Unauthorized Access!</div>;
    }

    return children;
};

export default ProtectedRoute;
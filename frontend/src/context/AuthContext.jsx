import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const normalizeUser = (rawUser) => {
        if (!rawUser || typeof rawUser !== 'object') return null;
        return {
            ...rawUser,
            role: typeof rawUser.role === 'string' ? rawUser.role.trim().toUpperCase() : rawUser.role
        };
    };

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = normalizeUser(JSON.parse(storedUser));
                setUser(parsedUser);
                // one-time migration away from shared localStorage auth
                sessionStorage.setItem('user', JSON.stringify(parsedUser));
                const token = sessionStorage.getItem('token') || localStorage.getItem('token');
                if (token) {
                    sessionStorage.setItem('token', token);
                }
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            } catch (error) {
                console.error('Invalid user data in localStorage:', error);
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setAuthLoading(false);
    }, []);

    const login = (userData) => {
        const normalizedUser = normalizeUser(userData);
        sessionStorage.setItem('token', userData.token);
        sessionStorage.setItem('user', JSON.stringify(normalizedUser));
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(normalizedUser);
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, authLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

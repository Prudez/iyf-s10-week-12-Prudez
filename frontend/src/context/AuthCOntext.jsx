import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            authAPI.getMe()
                .then(setUser)
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);
    
    const login = async (credentials) => {
        const { token, user } = await authAPI.login(credentials);
        localStorage.setItem('token', token);
        setUser(user);
        return user;
    };
    
    const register = async (userData) => {
        const { token, user } = await authAPI.register(userData);
        localStorage.setItem('token', token);
        setUser(user);
        return user;
    };
    
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };
    
    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout
    };
    
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
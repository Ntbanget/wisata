import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  // Direct authentication with token and user object
  const setAuth = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const login = async (email, password, isAdmin = false) => {
    try {
      // Use appropriate endpoint based on role
      const endpoint = isAdmin ? '/auth/admin/login' : '/auth/login';
      const response = await api.post(endpoint, { email, password });
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.error || 'Login failed' };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const response = await api.post('/auth/register', { name, email, password, phone });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.error || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const isCustomer = () => {
    return user && user.role === 'user';
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    setAuth,
    isAdmin,
    isCustomer,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
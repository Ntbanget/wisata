import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireCustomer = false }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    // Not logged in - redirect to appropriate login page
    return requireAdmin ? <Navigate to="/admin/login" replace /> : <Navigate to="/login" replace />;
  }

  // CRITICAL: Enforce role-based access control
  if (requireAdmin && !isAdmin()) {
    // User trying to access admin area - redirect to login
    return <Navigate to="/login" replace />;
  }

  if (requireCustomer && isAdmin()) {
    // Admin trying to access user area - redirect to admin dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
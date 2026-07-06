import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isAuthenticated, requireAdmin = false, user }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin) {
    const isAdmin = user?.roles?.includes('ROLE_ADMIN');
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
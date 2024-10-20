// src/components/PrivateRoute.tsx
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  element: React.ReactElement;
  roles: number[];
  path: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, roles, path }) => {
  const { token, role } = useAuth();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (roles.includes(role!)) {
    return element;
  }

  return <Navigate to="/login" />;
};

export default PrivateRoute;
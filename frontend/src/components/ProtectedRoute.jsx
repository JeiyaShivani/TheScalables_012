import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
        // If user is not allowed, redirect to their respective dashboard
        return <Navigate to={user.role === 'vendor' ? '/vendor' : '/customer'} replace />;
    }

    return children;
};

export default ProtectedRoute;

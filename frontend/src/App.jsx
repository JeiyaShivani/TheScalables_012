import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import VendorDashboard from './pages/VendorDashboard';
import CustomerMarketplace from './pages/CustomerMarketplace';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';

import { Amplify } from "aws-amplify";

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: "ap-south-1_QWHkZVL2m",
            userPoolClientId: "1gq5s6tl2rsiq5lkc8kp5mc0h8"
        }
    }
});

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    <Route
                        path="/vendor"
                        element={
                            <ProtectedRoute allowedRole="vendor">
                                <VendorDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/customer"
                        element={
                            <ProtectedRoute allowedRole="customer">
                                <CustomerMarketplace />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;

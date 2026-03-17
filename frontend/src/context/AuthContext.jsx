import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, signIn, signOut as amplifySignOut, signUp } from 'aws-amplify/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            
            // Reconstruct a user object similar to our original mock, extracting custom attributes if needed
            setUser({
                id: currentUser.userId,
                name: currentUser.username,
                // The role would typically come from custom attributes in a real Cognito setup
                role: 'vendor' // Defaulting for simple MVP transition, ideally parse from ID token claims
            });
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const result = await signIn({ username: email, password });
        if (result.isSignedIn) {
            await checkUser();
            return user;
        }
        throw new Error('Sign in requires further steps');
    };

    const register = async (name, email, password, role) => {
        await signUp({
            username: email,
            password,
            options: {
                userAttributes: {
                    email,
                    name,
                    "custom:role": role
                }
            }
        });
        // We do not auto-login after signup because Cognito usually requires email verification (Confirmation Code)
        // For hackathon purposes, we might just assume auto-verify is on in the User Pool settings.
    };

    const logout = async () => {
        await amplifySignOut();
        setUser(null);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading session...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

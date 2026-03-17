import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, signIn, signOut as amplifySignOut, signUp, confirmSignIn, fetchAuthSession } from 'aws-amplify/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    // const checkUser = async () => {
    //     try {
    //         const currentUser = await getCurrentUser();
    //         const session = await fetchAuthSession();
            
    //         // Reconstruct a user object similar to our original mock, extracting custom attributes
    //         const idTokenPayload = session.tokens?.idToken?.payload;
            
    //         setUser({
    //             id: currentUser.userId,
    //             name: currentUser.username,
    //             role: idTokenPayload?.['custom:role'] || 'customer'
    //         });
    //     } catch (error) {
    //         setUser(null);
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const checkUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            const session = await fetchAuthSession();
            const payload = session.tokens?.idToken?.payload;

            const userData = {
            id: currentUser.userId,
            name: currentUser.username,
            role: payload?.['custom:role'] || 'customer'
        };

        setUser(userData);
        return userData; // 👈 ADD THIS
    } catch {
        setUser(null);
        return null;
    } finally {
        setLoading(false);
    }
    };

    const login = async (email, password) => {
        const result = await signIn({ username: email, password });

        console.log("LOGIN RESULT:", result); // 🔥 MUST KEEP

        if (result.isSignedIn) {
            await checkUser();

            // ⚠️ IMPORTANT: return fresh user AFTER state update
            const session = await fetchAuthSession();
            const payload = session.tokens?.idToken?.payload;

            return {
                role: payload?.['custom:role'] || 'customer'
            };
        }

        const step = result.nextStep?.signInStep;

        if (step === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
            return { nextStep: step };
        }

        if (step === 'CONFIRM_SIGN_UP') {
            throw new Error('Please verify your email before logging in.');
        }

        if (step === 'RESET_PASSWORD') {
            throw new Error('Password reset required.');
        }

        console.log("UNHANDLED STEP:", step);
        throw new Error(`Unhandled sign-in step: ${step}`);
    };

    const confirmNewPassword = async (newPassword) => {
        const result = await confirmSignIn({
        challengeResponse: newPassword,
        options: {
            userAttributes: {
                name: "User" // or store actual name from signup
            }
        }
    });
        if (result.isSignedIn) {
            await checkUser();
            return user;
        }
        throw new Error('Failed to confirm password');
    };

    const register = async (name, email, password, role) => {
        await signUp({
            username: email,
            password,
            options: {
                userAttributes: {
                    email,
                    name,
                    'custom:role': role
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
        <AuthContext.Provider value={{ user, login, register, logout, confirmNewPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
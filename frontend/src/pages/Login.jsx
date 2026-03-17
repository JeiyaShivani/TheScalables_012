import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from 'aws-amplify/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [awaitingNewPassword, setAwaitingNewPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, confirmNewPassword } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
    const checkAlreadyLoggedIn = async () => {
        try {
            const user = await getCurrentUser();
            if (user) {
                navigate('/customer'); // or detect role if needed
            }
        } catch {
            // not logged in → do nothing
        }
    };

    checkAlreadyLoggedIn();
}, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (awaitingNewPassword) {
                const loggedInUser = await confirmNewPassword(newPassword);
                if (loggedInUser?.role === 'vendor') {
                    navigate('/vendor');
                } else {
                    navigate('/customer');
                }
                return;
            }

            const response = await login(email, password);
            
            if (response?.nextStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
                setAwaitingNewPassword(true);
                setError('');
                return;
            }

            // Normal login
            if (response?.role === 'vendor') {
                navigate('/vendor');
            } else {
                navigate('/customer');
            }
        } catch (err) {
            console.error('Login error', err);
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Store className="mx-auto h-12 w-12 text-brand-600" />
                <h2 className="mt-6 text-center text-4xl font-semibold text-brand-600 hover:text-brand-500 tracking-tight">
                    MakerNest
                </h2>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <Link to="/signup" className="font-medium text-brand-600 hover:text-brand-500">
                        create a new account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        {awaitingNewPassword ? (
                            <>
                                <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm text-center font-medium border border-amber-200">
                                    Your account requires a password change upon first login. Please enter a new password below.
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email address</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 transition-colors"
                        >
                            {loading ? 'Processing...' : (awaitingNewPassword ? 'Change Password & Login' : 'Sign in')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;

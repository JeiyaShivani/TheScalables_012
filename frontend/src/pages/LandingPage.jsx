import React from 'react';
import { Link } from 'react-router-dom';
import { Store, UserPlus, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-brand-50 to-white"></div>

            <div className="relative z-10 max-w-3xl text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-brand-100 rounded-full shadow-sm">
                        <Store className="w-12 h-12 text-brand-600" />
                    </div>
                </div>

                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight sm:text-6xl mb-4">
                    MakerNesttttttttttt
                </h1>
                <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto mb-10">
                    Connect local artisans with buyers. High quality, handmade goods straight from the creator's hands to your home.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {user ? (
                        <Link
                            to={user.role === 'vendor' ? '/vendor' : '/customer'}
                            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm hover:shadow-md transition-all"
                        >
                            Go to Dashboard
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/signup"
                                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm hover:shadow-md transition-all"
                            >
                                <UserPlus className="w-5 h-5 mr-2" />
                                Create Account
                            </Link>

                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md transition-all"
                            >
                                <LogIn className="w-5 h-5 mr-2" />
                                Sign In
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* <div className="absolute bottom-8 text-sm text-gray-400 font-medium">
                Prepared for AWS Architecture (S3, DynamoDB, Cognito, Lambda)
            </div> */}
        </div>
    );
};

export default LandingPage;

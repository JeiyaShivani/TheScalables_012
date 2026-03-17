import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Store, ShoppingBag, Home, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ role }) => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const navItems = role === 'vendor'
        ? [{ name: 'Dashboard', path: '/vendor', icon: Store }]
        : [{ name: 'Marketplace', path: '/customer', icon: ShoppingBag }];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col pt-6 pb-4 shadow-sm">
            <div className="px-6 mb-8">
                <h1 className="text-2xl font-bold text-brand-600 flex items-center gap-2">
                    <Store className="w-6 h-6" />
                    Artisan
                </h1>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{role} Portal</p>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive
                                    ? 'bg-brand-50 text-brand-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="px-4 mt-auto space-y-3">
                {user && (
                    <div className="px-3 py-3 border border-gray-100 bg-gray-50 rounded-lg flex items-center gap-3">
                        <div className="bg-brand-100 text-brand-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                            {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Log out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

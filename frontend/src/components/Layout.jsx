import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, role }) => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role={role} />
            <main className="flex-1 p-8 overflow-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;

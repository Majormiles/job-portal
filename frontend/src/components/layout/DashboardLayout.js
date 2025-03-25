import React from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Dashboard />
      </main>
    </div>
  );
};

export default Layout;
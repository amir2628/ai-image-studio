import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';
import { useAppStore } from '../store';

const Layout: React.FC = () => {
  const { sidebarOpen, currentPage } = useAppStore();
  
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <MainContent />;
      case 'history':
        return <HistoryPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <MainContent />;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-surface-950 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-950/30 via-surface-950/50 to-accent-950/30 pointer-events-none" />
      
      <Navbar />
      
      <div className="flex flex-grow relative z-10 pt-6">
        <div 
          className={`${sidebarOpen ? 'w-64 px-6' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden`}
        >
          <Sidebar />
        </div>
        
        <div className="flex-grow relative px-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Layout;
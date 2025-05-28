import React from 'react';
import { LayoutGrid, History, Info } from 'lucide-react';
import { useAppStore } from '../store';

const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage } = useAppStore();
  
  return (
    <div className="h-full glass-panel border-r border-surface-800/50">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-6 pt-2">
          <h2 className="text-sm font-medium text-surface-400 px-3 mb-3">Navigation</h2>
          <nav>
            <ul className="space-y-2">
              <NavItem 
                icon={<LayoutGrid size={18} />} 
                label="Dashboard" 
                active={currentPage === 'dashboard'}
                onClick={() => setCurrentPage('dashboard')}
              />
              <NavItem 
                icon={<History size={18} />} 
                label="History" 
                active={currentPage === 'history'}
                onClick={() => setCurrentPage('history')}
              />
              <NavItem 
                icon={<Info size={18} />} 
                label="About" 
                active={currentPage === 'about'}
                onClick={() => setCurrentPage('about')}
              />
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left
              ${active 
                ? 'bg-primary-500/20 text-primary-400 shadow-glow' 
                : 'text-surface-300 hover:bg-surface-800/70 hover:text-white'}`}
  >
    <span className="text-inherit">{icon}</span>
    <span>{label}</span>
  </button>
);

export default Sidebar;
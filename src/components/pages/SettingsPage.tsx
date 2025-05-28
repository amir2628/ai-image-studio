import React from 'react';
import { useAppStore } from '../../store';
import { Sun, Moon } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useAppStore();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      
      <div className="glass-panel p-6 rounded-xl max-w-2xl">
        <h2 className="text-lg font-medium mb-4">Appearance</h2>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
                      ${theme === 'light' 
                        ? 'bg-primary-600 text-white' 
                        : 'glass-button text-surface-300'}`}
          >
            <Sun size={18} />
            <span>Light</span>
          </button>
          
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
                      ${theme === 'dark' 
                        ? 'bg-primary-600 text-white' 
                        : 'glass-button text-surface-300'}`}
          >
            <Moon size={18} />
            <span>Dark</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
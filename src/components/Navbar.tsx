import React from 'react';
import { Github, Menu, Sparkles } from 'lucide-react';
import { useAppStore } from '../store';

const Navbar: React.FC = () => {
  const { toggleSidebar } = useAppStore();

  return (
    <header className="relative z-20 border-b border-surface-800/50 backdrop-blur-xl bg-surface-900/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button 
              onClick={toggleSidebar}
              className="glass-button p-2.5 text-surface-300 hover:text-white hover:scale-105 transform transition-all duration-200"
              title="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                    AI Image Studio
                  </span>
                </h1>
                <p className="text-sm text-surface-400">ControlNet Playground</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com/amir2628" 
              target="_blank" 
              rel="noopener noreferrer"
              className="glass-button p-2.5 text-surface-300 hover:text-white hover:scale-105 transform transition-all duration-200"
              title="View on GitHub"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
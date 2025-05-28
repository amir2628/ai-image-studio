import React from 'react';
import { useAppStore } from '../../store';
import { Download } from 'lucide-react';

const HistoryPage: React.FC = () => {
  const { generations } = useAppStore();

  const downloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `generation-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Generation History</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generations.map((generation, index) => (
          <div key={index} className="glass-panel p-4 rounded-xl">
            {generation.resultUrl && (
              <div className="relative group">
                <img 
                  src={generation.resultUrl} 
                  alt={generation.prompt} 
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <button
                  onClick={() => downloadImage(generation.resultUrl!)}
                  className="absolute top-2 right-2 glass-button p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Download size={16} />
                </button>
              </div>
            )}
            
            <p className="text-sm text-surface-300 line-clamp-2 mb-2">
              {generation.prompt}
            </p>
            
            <div className="flex items-center justify-between text-xs text-surface-400">
              <span className="capitalize">{generation.preprocessor}</span>
              <span className="px-2 py-1 rounded bg-surface-800">
                {generation.status}
              </span>
            </div>
          </div>
        ))}
        
        {generations.length === 0 && (
          <div className="col-span-full text-center text-surface-400 py-12">
            No generations yet. Start by creating one from the dashboard!
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
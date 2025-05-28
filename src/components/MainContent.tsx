import React from 'react';
import ImageUpload from './ImageUpload';
import ControlPanel from './ControlPanel';
import ResultDisplay from './ResultDisplay';

const MainContent: React.FC = () => {
  return (
    <div className="p-4 h-full grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-auto">
      <div className="space-y-4">
        <ImageUpload />
        <ControlPanel />
      </div>
      <div>
        <ResultDisplay />
      </div>
    </div>
  );
};

export default MainContent;
import React from 'react';
import { Layers, User, Mountain } from 'lucide-react';

type Preprocessor = 'canny' | 'pose' | 'depth';

interface PreprocessorSelectorProps {
  value: Preprocessor;
  onChange: (value: Preprocessor) => void;
  disabled?: boolean;
}

const PreprocessorSelector: React.FC<PreprocessorSelectorProps> = ({ 
  value, 
  onChange,
  disabled = false
}) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      <PreprocessorOption
        value="canny"
        currentValue={value}
        onChange={onChange}
        icon={<Layers size={18} />}
        label="Canny Edge"
        disabled={disabled}
      />
      <PreprocessorOption
        value="pose"
        currentValue={value}
        onChange={onChange}
        icon={<User size={18} />}
        label="Pose"
        disabled={disabled}
      />
      <PreprocessorOption
        value="depth"
        currentValue={value}
        onChange={onChange}
        icon={<Mountain size={18} />}
        label="Depth"
        disabled={disabled}
      />
    </div>
  );
};

interface PreprocessorOptionProps {
  value: Preprocessor;
  currentValue: Preprocessor;
  onChange: (value: Preprocessor) => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}

const PreprocessorOption: React.FC<PreprocessorOptionProps> = ({
  value,
  currentValue,
  onChange,
  icon,
  label,
  disabled = false
}) => {
  const isSelected = value === currentValue;
  
  return (
    <button
      onClick={() => onChange(value)}
      disabled={disabled}
      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200
                 ${isSelected 
                   ? 'bg-primary-900/50 border border-primary-700 text-primary-400' 
                   : 'glass-button text-surface-300 hover:text-white'}
                 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-xs">{label}</span>
    </button>
  );
};

export default PreprocessorSelector;
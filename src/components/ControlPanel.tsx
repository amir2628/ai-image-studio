import React from 'react';
import { Wand2, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store';
import { useMutation } from 'react-query';
import { generateImage } from '../services/api';
import PreprocessorSelector from './PreprocessorSelector';

const ControlPanel: React.FC = () => {
  const { currentGeneration, setCurrentGeneration, addGeneration } = useAppStore();
  
  const generateMutation = useMutation(generateImage, {
    onMutate: () => {
      // Set currentGeneration status to 'uploading' for immediate feedback
      setCurrentGeneration({ status: 'uploading' });
    },
    onSuccess: (data) => {
      // Add the actual generation from the backend to the store
      addGeneration(data);
      // Reset currentGeneration status
      setCurrentGeneration({ status: 'idle' });
    },
    onError: (error) => {
      setCurrentGeneration({ status: 'error' });
      // Optionally, handle the error (e.g., show a message)
    },
  });

  const handleGenerate = () => {
    if (!currentGeneration.image) {
      alert('Please upload an image first');
      return;
    }
    
    if (!currentGeneration.prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }
    
    generateMutation.mutate({
      image: currentGeneration.image,
      prompt: currentGeneration.prompt,
      preprocessor: currentGeneration.preprocessor,
    });
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentGeneration({ prompt: e.target.value });
  };

  const isGenerating = generateMutation.isLoading;
  const isDisabled = !currentGeneration.image || !currentGeneration.prompt.trim() || isGenerating;

  return (
    <div className="glass-panel p-4">
      <h2 className="text-lg font-medium mb-4">Generation Controls</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-surface-300 mb-2">
            Preprocessor
          </label>
          <PreprocessorSelector 
            value={currentGeneration.preprocessor}
            onChange={(value) => setCurrentGeneration({ preprocessor: value })}
            disabled={isGenerating}
          />
        </div>
        
        <div>
          <label htmlFor="prompt" className="block text-sm text-surface-300 mb-2">
            Prompt
          </label>
          <textarea
            id="prompt"
            value={currentGeneration.prompt}
            onChange={handlePromptChange}
            placeholder="Describe what you want to generate..."
            className="input-field w-full h-24 resize-none"
            disabled={isGenerating}
          />
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={isDisabled}
          className={`primary-button w-full flex items-center justify-center py-3 ${
            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw size={18} className="animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 size={18} className="mr-2" />
              Generate Image
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
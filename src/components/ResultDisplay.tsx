import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, AlertCircle, Wand2 } from 'lucide-react';
import { useAppStore } from '../store';
import { getGenerationStatus } from '../services/api';

const API_URL = 'http://localhost:8000';

const ResultDisplay: React.FC = () => {
  const { generations, updateGeneration } = useAppStore();
  const latestGeneration = generations.length > 0 
    ? generations[generations.length - 1] 
    : null;

  const [isPolling, setIsPolling] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [outputPath, setOutputPath] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    console.log('Latest generation:', latestGeneration);
    let interval: NodeJS.Timeout;

    const pollGenerationStatus = async () => {
      if (latestGeneration?.id && (latestGeneration.status === 'processing' || latestGeneration.status === 'uploading')) {
        setIsPolling(true);
        setStatusMessage(`Processing with ${latestGeneration.preprocessor}...`);
        setImageLoadError(false);

        interval = setInterval(async () => {
          try {
            const response = await getGenerationStatus(latestGeneration.id);
            console.log('Poll response:', response);

            // Update the store with the latest backend data
            updateGeneration(latestGeneration.id, {
              status: response.status,
              resultUrl: response.resultUrl,
              output_image_path: response.resultUrl?.replace(`${API_URL}/`, ''),
              error: response.error,
            });

            if (response.status === 'completed' && response.resultUrl) {
              clearInterval(interval);
              setIsPolling(false);
              setStatusMessage('Image generation complete!');
              setOutputPath(response.resultUrl.replace(`${API_URL}/`, ''));
            } else if (response.status === 'error') {
              clearInterval(interval);
              setIsPolling(false);
              setStatusMessage('Generation failed');
              setOutputPath(null);
            } else {
              setStatusMessage(`Processing with ${latestGeneration.preprocessor}...`);
            }
          } catch (error) {
            console.error('Error polling status:', error);
            clearInterval(interval);
            setIsPolling(false);
            setStatusMessage('Error checking generation status');
            setOutputPath(null);
          }
        }, 3000);
      } else {
        setIsPolling(false);
        if (latestGeneration?.status === 'completed' && latestGeneration.resultUrl) {
          setStatusMessage('Image generation complete!');
          setOutputPath(latestGeneration.resultUrl.replace(`${API_URL}/`, ''));
          setImageLoadError(false);
        } else if (latestGeneration?.status === 'error') {
          setStatusMessage('Generation failed');
          setOutputPath(null);
          setImageLoadError(false);
        } else {
          setStatusMessage(null);
          setOutputPath(null);
          setImageLoadError(false);
        }
      }
    };

    pollGenerationStatus();
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [latestGeneration, updateGeneration]);

  const downloadImage = () => {
    if (outputPath && !imageLoadError) {
      const link = document.createElement('a');
      link.href = `${API_URL}/${outputPath}`;
      link.download = `generation-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
          Generated Result
        </h2>
        {outputPath && !imageLoadError && (
          <button 
            onClick={downloadImage}
            className="glass-button p-2.5 text-surface-300 hover:text-white hover:scale-105 transform transition-all duration-200"
            title="Download Image"
          >
            <Download size={20} />
          </button>
        )}
      </div>

      <div className="flex-grow bg-surface-900/60 rounded-2xl overflow-hidden flex items-center justify-center border border-surface-800/50 backdrop-blur-sm relative">
        {!latestGeneration && (
          <div className="text-surface-400 text-center p-8">
            <div className="mb-4 mx-auto w-20 h-20 rounded-full bg-surface-800/80 flex items-center justify-center">
              <Wand2 className="text-surface-500" size={32} />
            </div>
            <p className="text-lg">Generate an image to see the result here</p>
            <p className="text-surface-500 text-sm mt-2">Upload an image and enter a prompt to begin</p>
          </div>
        )}

        {(latestGeneration?.status === 'processing' || latestGeneration?.status === 'uploading') && (
          <div className="text-center p-8">
            <RefreshCw size={40} className="animate-spin mx-auto mb-4 text-primary-400" />
            <p className="text-lg text-primary-300 mb-2">{statusMessage}</p>
            <p className="text-surface-400 text-sm">This may take a few moments</p>
            <div className="w-64 h-2 bg-surface-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>
        )}

        {latestGeneration?.status === 'error' && (
          <div className="text-center p-8">
            <AlertCircle size={40} className="mx-auto mb-4 text-red-400" />
            <p className="text-red-400 text-lg mb-2">Generation failed</p>
            <p className="text-surface-400 text-sm">{latestGeneration.error || 'An unknown error occurred'}</p>
          </div>
        )}

        {latestGeneration?.status === 'completed' && outputPath && (
          <div className="relative w-full h-full">
            <img 
              src={`${API_URL}/${outputPath}`}
              alt="Generated image" 
              className="w-full h-full object-contain" 
              onError={(e) => {
                console.error('Image load error:', e);
                setImageLoadError(true);
                setStatusMessage('Failed to load generated image');
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', `${API_URL}/${outputPath}`);
                setImageLoadError(false);
              }}
            />
            {imageLoadError && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-900/80">
                <p className="text-red-400 text-lg">Failed to load image. Please try again.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {latestGeneration?.prompt && (
        <div className="mt-6 p-4 bg-surface-900/60 rounded-xl border border-surface-800/50 backdrop-blur-sm">
          <p className="text-sm text-surface-300 line-clamp-2">
            <span className="text-primary-400 font-medium">Prompt:</span> {latestGeneration.prompt}
          </p>
          <div className="flex items-center text-xs text-surface-500 mt-2">
            <span className="px-2 py-1 bg-surface-800/50 rounded-full capitalize">
              {latestGeneration.preprocessor}
            </span>
            <span className="mx-2">•</span>
            <span>{new Date(latestGeneration.created_at).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
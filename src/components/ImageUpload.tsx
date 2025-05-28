import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, X } from 'lucide-react';
import { useAppStore } from '../store';

const ImageUpload: React.FC = () => {
  const { currentGeneration, setCurrentGeneration } = useAppStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const imageUrl = URL.createObjectURL(file);
      
      setCurrentGeneration({ 
        image: file,
        imageUrl,
      });
    }
  }, [setCurrentGeneration]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false,
  });

  const removeImage = () => {
    if (currentGeneration.imageUrl) {
      URL.revokeObjectURL(currentGeneration.imageUrl);
    }
    setCurrentGeneration({ 
      image: undefined,
      imageUrl: undefined,
    });
  };

  return (
    <div className="glass-panel p-4">
      <h2 className="text-lg font-medium mb-4">Input Image</h2>
      
      {!currentGeneration.imageUrl ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                    ${isDragActive 
                      ? 'border-primary-500 bg-primary-900/20' 
                      : 'border-surface-700 hover:border-primary-600 hover:bg-primary-900/10'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-3">
            <Upload className="text-surface-400" size={32} />
            <p className="text-surface-300">
              {isDragActive
                ? "Drop the image here..."
                : "Drag & drop an image here, or click to select"}
            </p>
            <p className="text-surface-500 text-xs">
              Supported formats: JPG, PNG, WEBP
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="aspect-square bg-surface-800 rounded-lg overflow-hidden">
            <img 
              src={currentGeneration.imageUrl} 
              alt="Uploaded image" 
              className="w-full h-full object-contain" 
            />
          </div>
          <button 
            onClick={removeImage}
            className="absolute top-2 right-2 bg-surface-900/80 hover:bg-surface-800 p-1.5 rounded-full"
          >
            <X size={16} />
          </button>
          <div className="mt-3 text-center text-xs text-surface-400">
            {currentGeneration.image?.name}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
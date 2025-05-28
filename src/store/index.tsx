import React, { createContext, useContext } from 'react';
import create from 'zustand';

export type Theme = 'light' | 'dark';
export type Page = 'dashboard' | 'history' | 'about';

// This should match your API response structure
export interface Generation {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  prompt: string;
  preprocessor: 'canny' | 'pose' | 'depth';
  output_image_path?: string;
  error_message?: string;
  created_at: string;
  // Frontend-specific fields
  resultUrl?: string;
  error?: string;
}

// For the current generation form state
export interface GenerationParams {
  prompt: string;
  image?: File;
  preprocessor: 'canny' | 'pose' | 'depth';
  imageUrl?: string;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
}

interface StoreState {
  generations: Generation[];
  currentGeneration: GenerationParams;
  sidebarOpen: boolean;
  theme: Theme;
  currentPage: Page;
  setCurrentGeneration: (params: Partial<GenerationParams>) => void;
  addGeneration: (generation: Generation) => void;
  updateGeneration: (id: string, updates: Partial<Generation>) => void;
  setGenerations: (generations: Generation[]) => void;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  setCurrentPage: (page: Page) => void;
}

const useStore = create<StoreState>((set) => ({
  generations: [],
  currentGeneration: {
    prompt: '',
    preprocessor: 'canny',
    status: 'idle',
  },
  sidebarOpen: true,
  theme: 'dark',
  currentPage: 'dashboard',
  setCurrentGeneration: (params) => 
    set((state) => ({ 
      currentGeneration: { ...state.currentGeneration, ...params } 
    })),
  addGeneration: (generation) => 
    set((state) => ({ 
      generations: [...state.generations, generation],
    })),
  updateGeneration: (id, updates) => 
    set((state) => ({
      generations: state.generations.map((gen) => 
        gen.id === id ? { ...gen, ...updates } : gen
      ),
    })),
  setGenerations: (generations) => set({ generations }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  setCurrentPage: (page) => set({ currentPage: page }),
}));

const StoreContext = createContext<ReturnType<typeof useStore> | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StoreContext.Provider value={useStore()}>
      {children}
    </StoreContext.Provider>
  );
};

export const useAppStore = () => {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useAppStore must be used within StoreProvider');
  return store;
};
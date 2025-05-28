import axios from 'axios';

const API_URL = 'http://localhost:8000';

export interface GenerationRequest {
  image: File;
  prompt: string;
  preprocessor: 'canny' | 'pose' | 'depth';
}

export interface GenerationResponse {
  id: string;
  status: string;
  prompt: string;
  preprocessor: string;
  output_image_path?: string;
  resultUrl?: string;
  error_message?: string;
  created_at: string;
}

export const generateImage = async (params: GenerationRequest): Promise<GenerationResponse> => {
  const formData = new FormData();
  formData.append('image', params.image);
  formData.append('prompt', params.prompt);
  formData.append('preprocessor', params.preprocessor);

  const response = await axios.post<{ id: string; status: string; message: string }>(
    `${API_URL}/api/generate`, 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  // Fetch the full generation data after queuing
  const generation = await getGenerationStatus(response.data.id);
  return generation;
};

export const getGenerationStatus = async (id: string): Promise<GenerationResponse> => {
  const response = await axios.get<GenerationResponse>(`${API_URL}/api/generations/${id}`);
  return response.data;
};

export const getGenerationHistory = async (): Promise<GenerationResponse[]> => {
  const response = await axios.get<GenerationResponse[]>(`${API_URL}/api/generations`);
  return response.data;
};
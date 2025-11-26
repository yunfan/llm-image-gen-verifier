
import { ApiResponse, ImageGenerationParams } from '../types';

const API_BASE = 'https://api.bltcy.ai/v1';
const API_ENDPOINT = `${API_BASE}/images/generations`;
const FILES_ENDPOINT = `${API_BASE}/files`;

export const uploadImageFile = async (apiKey: string, file: File): Promise<string> => {
  if (!apiKey) throw new Error('API Key is required for upload');

  const formData = new FormData();
  formData.append('file', file);
  // Some providers might require a 'purpose', adding a default just in case.
  // formData.append('purpose', 'image-generation'); 

  try {
    const response = await fetch(FILES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // Content-Type is automatically set to multipart/form-data with boundary by browser
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `Upload Error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    // User specified that the response contains a 'url' field which should be used.
    if (data.url) {
      return data.url;
    }
    
    // Fallback or specific error if 'url' is missing
    console.warn('Upload response:', data);
    throw new Error("Upload successful, but response did not contain a 'url' field.");

  } catch (error) {
    console.error('File Upload failed:', error);
    throw error;
  }
};

export const sendImageGenRequest = async (
  apiKey: string,
  model: string,
  prompt: string,
  params?: ImageGenerationParams
): Promise<ApiResponse> => {
  if (!apiKey) throw new Error('API Key is required');
  if (!model) throw new Error('Model name is required');
  if (!prompt) throw new Error('Prompt is required');

  // Explicitly construct payload to ensure types are preserved exactly as requested.
  // We avoid generic object filtering to guarantee 'image' remains an array even if it has only one element.
  const payload: any = {
    model: model,
    prompt: prompt,
  };

  if (params) {
    if (params.size) {
      payload.size = params.size;
    }
    if (params.aspect_ratio) {
      payload.aspect_ratio = params.aspect_ratio;
    }
    
    // STRICTLY handle image as an array.
    // If it is an array and has items, assign it directly. 
    // This prevents any accidental conversion to a string.
    if (params.image && Array.isArray(params.image) && params.image.length > 0) {
      payload.image = params.image;
    }
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API Error: ${response.status} ${response.statusText}`
      );
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

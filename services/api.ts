import { ApiResponse, ChatCompletionParams } from '../types';

const API_ENDPOINT = 'https://api.bltcy.ai/v1/chat/completions';

export const sendChatRequest = async (
  apiKey: string,
  model: string,
  prompt: string,
  params?: ChatCompletionParams
): Promise<string> => {
  if (!apiKey) throw new Error('API Key is required');
  if (!model) throw new Error('Model name is required');
  if (!prompt) throw new Error('Prompt is required');

  // Filter out null/undefined parameters to keep the payload clean
  const cleanParams = params ? Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
  ) : {};

  const payload = {
    model: model,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    stream: false, // We use non-streaming to easier parse the full response for images
    ...cleanParams,
  };

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
    
    if (data.choices && data.choices.length > 0 && data.choices[0].message.content) {
      return data.choices[0].message.content;
    } else {
      throw new Error('No content received from the API.');
    }
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};
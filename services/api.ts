
import { ApiResponse, ImageGenerationParams, VideoGenerationParams, KlingTaskResponse, VisionAnalysisParams } from '../types';

const API_BASE = 'https://api.bltcy.ai/v1';
const IMAGE_API_ENDPOINT = `${API_BASE}/images/generations`;
const CHAT_API_ENDPOINT = `${API_BASE}/chat/completions`;
const FILES_ENDPOINT = `${API_BASE}/files`;
const VIDEO_API_BASE = `https://api.uniapi.io/kling/v1/videos/image2video`;

export const uploadImageFile = async (apiKey: string, file: File): Promise<string> => {
  if (!apiKey) throw new Error('上传文件需要 API Key');

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(FILES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `上传错误: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    if (data.url) {
      return data.url;
    }
    
    throw new Error("上传成功，但响应中未包含 'url' 字段。");

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
  if (!apiKey) throw new Error('请输入 API Key');
  if (!model) throw new Error('请输入模型名称');
  if (!prompt) throw new Error('请输入提示词');

  const payload: any = {
    model: model,
    prompt: prompt,
  };

  if (params) {
    if (params.size) payload.size = params.size;
    if (params.aspect_ratio) payload.aspect_ratio = params.aspect_ratio;
    
    // STRICTLY handle image as an array.
    if (params.image && Array.isArray(params.image) && params.image.length > 0) {
      payload.image = params.image;
    }
  }

  try {
    const response = await fetch(IMAGE_API_ENDPOINT, {
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
        errorData.error?.message || `API 错误: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

export const sendVideoGenRequest = async (
  apiKey: string,
  model: string,
  prompt: string,
  params?: VideoGenerationParams
): Promise<any> => { // Returns raw response which might contain task_id
  if (!apiKey) throw new Error('请输入 API Key');
  if (!model) throw new Error('请输入模型名称');
  if (!params?.image) throw new Error('图生视频需要源图片');

  // Construct payload specifically for Kling API
  // https://api.uniapi.io/kling/v1/videos/image2video
  const payload: any = {
    model_name: model, // Specific mapping: model -> model_name
    image: params.image, // Now expects Base64 string from VideoSettings
  };

  // Optional parameters
  if (prompt) payload.prompt = prompt;
  if (params.image_tail) payload.image_tail = params.image_tail;
  if (params.negative_prompt) payload.negative_prompt = params.negative_prompt;
  if (params.cfg_scale !== undefined) payload.cfg_scale = params.cfg_scale;
  if (params.mode) payload.mode = params.mode;
  if (params.duration) payload.duration = params.duration;

  try {
    console.log("Sending Video Request to:", VIDEO_API_BASE);
    
    const response = await fetch(VIDEO_API_BASE, {
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
        errorData.error?.message || `API 错误: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Video API Request failed:', error);
    throw error;
  }
};

export const getKlingVideoStatus = async (
  apiKey: string,
  taskId: string
): Promise<KlingTaskResponse> => {
  if (!apiKey) throw new Error('请输入 API Key');
  if (!taskId) throw new Error('Task ID 不能为空');

  // Endpoint: /kling/v1/videos/image2video/{task_id}
  const endpoint = `${VIDEO_API_BASE}/${taskId}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `查询任务状态失败: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Get Task Status failed:', error);
    throw error;
  }
};

export const sendVisionRequest = async (
  apiKey: string,
  model: string,
  prompt: string,
  params: VisionAnalysisParams
): Promise<ApiResponse> => {
  if (!apiKey) throw new Error('请输入 API Key');
  if (!model) throw new Error('请输入模型名称');
  if (!prompt && params.images.length === 0) throw new Error('请输入提示词或上传图片');

  // Construct multimodal message content
  const content: any[] = [];
  
  // Add text prompt
  if (prompt) {
    content.push({ type: "text", text: prompt });
  } else {
    // Default prompt if user only uploads images (optional behavior, but API usually requires some text or explicit instruction)
    content.push({ type: "text", text: "请分析这些图片。" });
  }

  // Add images
  if (params.images && params.images.length > 0) {
    params.images.forEach(imgDataUrl => {
      content.push({
        type: "image_url",
        image_url: {
          url: imgDataUrl // Expecting data:image/jpeg;base64,... format
        }
      });
    });
  }

  const payload = {
    model: model,
    messages: [
      {
        role: "user",
        content: content
      }
    ],
    max_tokens: 4096 // Reasonable default for analysis
  };

  try {
    const response = await fetch(CHAT_API_ENDPOINT, {
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
        errorData.error?.message || `API 错误: ${response.status} ${response.statusText}`
      );
    }
    
    const json = await response.json();
    
    // Transform OpenAI Chat Completion response to our generic ApiResponse format
    // Extract the content from the first choice
    const messageContent = json.choices?.[0]?.message?.content || "";
    
    return {
      created: json.created || Date.now(),
      data: [{ revised_prompt: messageContent }] // Wrap in array to match ResultDisplay expectations
    };

  } catch (error) {
    console.error('Vision API Request failed:', error);
    throw error;
  }
};


export interface AppConfig {
  apiKey: string;
  model: string;
}

export interface ImageGenerationParams {
  size?: string;
  aspect_ratio?: string;
  image?: string[]; // Array of strings
}

export interface VideoGenerationParams {
  image: string; // Required: Source image
  image_tail?: string; // Optional: Tail frame
  negative_prompt?: string; // Optional: Negative prompt
  cfg_scale?: number; // Optional: 0-1
  mode?: 'std' | 'pro'; // Optional: Generation mode
  duration?: '5' | '10'; // Optional: Duration in seconds
}

export interface VisionAnalysisParams {
  images: string[]; // Array of Data URLs (base64 with prefix)
}

export interface ApiResponse {
  created: number;
  data: any; // Changed to 'any' to handle both Array and Object responses from third-party APIs
}

export interface ParsedContent {
  text: string;
  imageUrls: string[];
  videoUrls: string[];
}

export enum RequestStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  POLLING = 'POLLING', // New status for async tasks
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type AppMode = 'image' | 'video' | 'vision';

export interface KlingTaskResponse {
  code: number;
  message: string;
  data: {
    task_id: string;
    task_status: 'submitted' | 'processing' | 'succeed' | 'failed';
    task_status_msg?: string;
    created_at?: number;
    updated_at?: number;
    task_result?: {
      videos?: Array<{
        id: string;
        url: string;
        duration: string;
      }>;
      images?: Array<{
        url: string;
      }>;
    };
  };
}

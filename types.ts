
export interface AppConfig {
  apiKey: string;
  model: string;
}

export interface ImageGenerationParams {
  size?: string;
  aspect_ratio?: string;
  image?: string[]; // Changed to array of strings
}

export interface ApiResponse {
  created: number;
  data: {
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }[];
}

export interface ParsedContent {
  text: string;
  imageUrls: string[];
}

export enum RequestStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

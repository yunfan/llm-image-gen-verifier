export interface AppConfig {
  apiKey: string;
  model: string;
}

export interface ChatCompletionParams {
  temperature?: number;
  top_p?: number;
  n?: number;
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  logit_bias?: Record<string, number> | null;
  user?: string;
}

export interface ApiResponse {
  id: string;
  choices: {
    message: {
      content: string;
      role: string;
    };
  }[];
  created: number;
  model: string;
  object: string;
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
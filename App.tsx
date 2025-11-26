
import React, { useState, useEffect } from 'react';
import { Send, Sparkles, AlertCircle } from 'lucide-react';
import ConfigPanel from './components/ConfigPanel';
import AdvancedSettings from './components/AdvancedSettings';
import ResultDisplay from './components/ResultDisplay';
import { LoadingOverlay } from './components/LoadingOverlay';
import { sendImageGenRequest } from './services/api';
import { AppConfig, RequestStatus, ImageGenerationParams, ApiResponse } from './types';

function App() {
  // Initialize config from localStorage or defaults
  const [config, setConfig] = useState<AppConfig>(() => {
    const savedConfig = localStorage.getItem('llm_verifier_config');
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (e) {
        console.error("Failed to parse saved config", e);
      }
    }
    return { apiKey: '', model: '' };
  });

  // Persist config to localStorage
  useEffect(() => {
    localStorage.setItem('llm_verifier_config', JSON.stringify(config));
  }, [config]);

  // Config Panel Toggle State
  const [configExpanded, setConfigExpanded] = useState(true);
  
  // Image Generation Parameters
  const [imageParams, setImageParams] = useState<ImageGenerationParams>({
    size: '',
    aspect_ratio: '1:1',
    image: [] // Initial empty array
  });

  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<RequestStatus>(RequestStatus.IDLE);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config.apiKey || !config.model || !prompt) {
      setErrorMsg("Please fill in API Key, Model name, and Prompt.");
      return;
    }

    // Collapse Config Panel only
    setConfigExpanded(false);

    setStatus(RequestStatus.LOADING);
    setResult(null);
    setErrorMsg(null);

    try {
      const response = await sendImageGenRequest(config.apiKey, config.model, prompt, imageParams);
      setResult(response);
      setStatus(RequestStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred.");
      setStatus(RequestStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <LoadingOverlay isVisible={status === RequestStatus.LOADING} />
      
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 rounded-full mb-4 ring-1 ring-cyan-500/30">
            <Sparkles className="text-cyan-400 w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            LLM Image Gen <span className="text-cyan-400">Verifier</span>
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Test image generation endpoints. 
            Inputs are sent to <code className="text-xs bg-slate-900 px-1 py-0.5 rounded border border-slate-800">api.bltcy.ai/v1/images/generations</code>.
          </p>
        </div>

        {/* Configuration */}
        <ConfigPanel 
          config={config} 
          setConfig={setConfig} 
          isExpanded={configExpanded}
          onToggle={() => setConfigExpanded(!configExpanded)}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Image Generation Settings (Always Visible) */}
          <AdvancedSettings 
            apiKey={config.apiKey}
            params={imageParams} 
            setParams={setImageParams} 
          />

          {/* Prompt Input */}
          <div className="relative">
            <div className="absolute top-3 left-3 text-slate-500">
              <span className="text-xs font-mono border border-slate-700 rounded px-1.5 py-0.5">Prompt</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="w-full min-h-[140px] bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 pt-10 text-lg shadow-inner focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all resize-y placeholder-slate-600"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium">Error</h4>
                <p className="text-sm opacity-90">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={status === RequestStatus.LOADING}
            className={`
              w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform
              ${status === RequestStatus.LOADING 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/20 hover:scale-[1.01] active:scale-[0.98]'
              }
            `}
          >
            <Send size={20} />
            <span>Generate Image</span>
          </button>
        </form>

        {/* Results Area */}
        {result && (
          <div className="pt-8 border-t border-slate-800">
            <ResultDisplay apiResponse={result} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { Send, Sparkles, AlertCircle } from 'lucide-react';
import ConfigPanel from './components/ConfigPanel';
import AdvancedSettings from './components/AdvancedSettings';
import ResultDisplay from './components/ResultDisplay';
import { LoadingOverlay } from './components/LoadingOverlay';
import { sendChatRequest } from './services/api';
import { AppConfig, RequestStatus, ChatCompletionParams } from './types';

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

  // Persist config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('llm_verifier_config', JSON.stringify(config));
  }, [config]);

  // Collapse States
  const [configExpanded, setConfigExpanded] = useState(true);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  
  // Default values based on common usage
  const [advancedParams, setAdvancedParams] = useState<ChatCompletionParams>({
    temperature: 0.7,
    top_p: 1.0,
    n: 1,
    max_tokens: 2048,
    presence_penalty: 0,
    frequency_penalty: 0,
    logit_bias: null,
    user: ''
  });

  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<RequestStatus>(RequestStatus.IDLE);
  const [result, setResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config.apiKey || !config.model || !prompt) {
      setErrorMsg("Please fill in API Key, Model name, and Prompt.");
      return;
    }

    // Collapse settings panels to make room for result
    setConfigExpanded(false);
    setAdvancedExpanded(false);

    setStatus(RequestStatus.LOADING);
    setResult(null);
    setErrorMsg(null);

    try {
      // Pass both basic config and advanced parameters
      const responseContent = await sendChatRequest(config.apiKey, config.model, prompt, advancedParams);
      setResult(responseContent);
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
            Test and verify image generation capabilities of OpenAI-compatible endpoints. 
            Inputs are sent to <code className="text-xs bg-slate-900 px-1 py-0.5 rounded border border-slate-800">api.bltcy.ai</code>.
          </p>
        </div>

        {/* Configuration */}
        <ConfigPanel 
          config={config} 
          setConfig={setConfig} 
          isExpanded={configExpanded}
          onToggle={() => setConfigExpanded(!configExpanded)}
        />

        {/* Prompt Input & Advanced Settings */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Advanced Parameters (Collapsible) */}
          <AdvancedSettings 
            params={advancedParams} 
            setParams={setAdvancedParams} 
            isOpen={advancedExpanded}
            onToggle={() => setAdvancedExpanded(!advancedExpanded)}
          />

          <div className="relative">
            <div className="absolute top-3 left-3 text-slate-500">
              <span className="text-xs font-mono border border-slate-700 rounded px-1.5 py-0.5">Prompt</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate (e.g., 'A cyberpunk cat walking in the rain in Tokyo')"
              className="w-full min-h-[160px] bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 pt-10 text-lg shadow-inner focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all resize-y placeholder-slate-600"
            />
            <div className="absolute bottom-3 right-3 text-xs text-slate-600 pointer-events-none">
              Press Generate to send
            </div>
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
            <span>Generate</span>
          </button>
        </form>

        {/* Results Area */}
        {result && (
          <div className="pt-8 border-t border-slate-800">
            <ResultDisplay rawContent={result} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
import React from 'react';
import { AppConfig } from '../types';
import { Settings, Key, Box, ChevronDown, ChevronUp } from 'lucide-react';

interface ConfigPanelProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  isExpanded: boolean;
  onToggle: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, setConfig, isExpanded, onToggle }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300">
      <button 
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-slate-800/30 transition-colors text-left"
      >
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-lg">
          <Settings size={20} />
          <h2>API Configuration</h2>
        </div>
        {isExpanded ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="block text-sm font-medium text-slate-400">
                API Key (sk-...)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key size={16} className="text-slate-500" />
                </div>
                <input
                  type="password"
                  id="apiKey"
                  name="apiKey"
                  value={config.apiKey}
                  onChange={handleChange}
                  placeholder="sk-xxxxxxxxxxxxxxxx"
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors text-slate-200 placeholder-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="model" className="block text-sm font-medium text-slate-400">
                Model Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Box size={16} className="text-slate-500" />
                </div>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={config.model}
                  onChange={handleChange}
                  placeholder="e.g. gpt-4-dalle, midjourney-v6"
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors text-slate-200 placeholder-slate-600"
                />
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Endpoint: <span className="font-mono text-slate-400">https://api.bltcy.ai/v1/chat/completions</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ConfigPanel;
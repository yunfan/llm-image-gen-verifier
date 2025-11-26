
import React, { useState, useRef, useEffect } from 'react';
import { AppConfig, AppMode } from '../types';
import { Settings, Key, Box, ChevronDown, ChevronUp, Check } from 'lucide-react';

interface ConfigPanelProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  isExpanded: boolean;
  onToggle: () => void;
  currentMode: AppMode;
}

export const IMAGE_MODELS = [
  'gemini-3-pro-image-preview',
  'nano-banana-2-4k',
  'claude-sonnet-4-5-20250929'
];

export const VIDEO_MODELS = [
  'kling-video-v2.5-turbo',
  'kling-v1',
  'kling-v1-5',
  'kling-v1-6'
];

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, setConfig, isExpanded, onToggle, currentMode }) => {
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleModelSelect = (modelName: string) => {
    setConfig((prev) => ({ ...prev, model: modelName }));
    setShowModelDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const suggestedModels = currentMode === 'image' ? IMAGE_MODELS : VIDEO_MODELS;

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl shadow-xl overflow-visible transition-all duration-300">
      <button 
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-slate-800/30 transition-colors text-left"
      >
        <div className={`flex items-center gap-2 font-semibold text-lg ${currentMode === 'image' ? 'text-cyan-400' : 'text-violet-400'}`}>
          <Settings size={20} />
          <h2>接口配置</h2>
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

            <div className="space-y-2" ref={dropdownRef}>
              <label htmlFor="model" className="block text-sm font-medium text-slate-400">
                模型名称
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Box size={16} className="text-slate-500" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  id="model"
                  name="model"
                  value={config.model}
                  onChange={handleChange}
                  onFocus={() => setShowModelDropdown(true)}
                  placeholder="选择或输入模型..."
                  autoComplete="off"
                  className="w-full pl-10 pr-10 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors text-slate-200 placeholder-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-cyan-400 transition-colors"
                >
                  <ChevronDown size={16} className={`transform transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showModelDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto custom-scrollbar ring-1 ring-black/20">
                    {suggestedModels.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleModelSelect(m)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-cyan-500/10 hover:text-cyan-300 flex items-center justify-between group transition-colors border-b border-slate-800/50 last:border-0"
                      >
                        <span className={config.model === m ? 'text-cyan-400 font-medium' : 'text-slate-300'}>{m}</span>
                        {config.model === m && <Check size={14} className="text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-2 text-xs text-slate-500 border-t border-slate-800/50 pt-4">
            {currentMode === 'image' ? (
              <p>
                <span className="font-semibold text-cyan-500/80">图片接口:</span> <span className="font-mono text-slate-400 select-all">https://api.bltcy.ai/v1/images/generations</span>
              </p>
            ) : (
              <p>
                <span className="font-semibold text-violet-500/80">视频接口:</span> <span className="font-mono text-slate-400 select-all">https://api.bltcy.ai/kling/v1/videos/image2video</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPanel;

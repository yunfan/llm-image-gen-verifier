import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Sliders, AlertTriangle } from 'lucide-react';
import { ChatCompletionParams } from '../types';

interface AdvancedSettingsProps {
  params: ChatCompletionParams;
  setParams: React.Dispatch<React.SetStateAction<ChatCompletionParams>>;
  isOpen: boolean;
  onToggle: () => void;
}

// Helper component for Slider + Input synchronization
const SliderInput: React.FC<{
  label: string;
  name: keyof ChatCompletionParams;
  value: number;
  min: number;
  max: number;
  step: number;
  desc?: string;
  onChange: (name: string, value: number) => void;
}> = ({ label, name, value, min, max, step, desc, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseFloat(e.target.value);
    if (!isNaN(newVal)) {
      onChange(name as string, newVal);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor={name} className="text-xs font-medium text-slate-400">
          {label}
        </label>
        {desc && <span className="text-[10px] text-slate-600 hidden sm:inline-block">{desc}</span>}
      </div>
      <div className="flex items-center gap-4">
        <input
          type="range"
          id={`${name}-slider`}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="flex-grow h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
        />
        <div className="relative w-20 shrink-0">
          <input
            type="number"
            id={name}
            name={name}
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={handleChange}
            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-sm font-mono focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-200"
          />
        </div>
      </div>
    </div>
  );
};

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ params, setParams, isOpen, onToggle }) => {
  const [logitBiasText, setLogitBiasText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Initialize local text state from props
  useEffect(() => {
    if (params.logit_bias) {
      setLogitBiasText(JSON.stringify(params.logit_bias, null, 2));
    } else {
      setLogitBiasText('');
    }
  }, [params.logit_bias]);

  const handleSliderChange = (name: string, value: number) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let newValue: string | number = value;

    if (type === 'number') {
      newValue = value === '' ? '' : parseFloat(value);
    }
    setParams((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleLogitBiasChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setLogitBiasText(text);
    
    if (text.trim() === '') {
      setJsonError(null);
      setParams(prev => {
        const { logit_bias, ...rest } = prev;
        return rest;
      });
      return;
    }

    try {
      const parsed = JSON.parse(text);
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Must be a JSON object');
      }
      setJsonError(null);
      setParams(prev => ({ ...prev, logit_bias: parsed }));
    } catch (err) {
      setJsonError('Invalid JSON format');
    }
  };

  return (
    <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden mb-6 transition-all duration-300">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-3 bg-slate-900/50 hover:bg-slate-800/50 text-slate-300 transition-colors"
      >
        <div className="flex items-center gap-2 font-medium text-sm">
          <Sliders size={16} className="text-cyan-400" />
          <span>Advanced Parameters</span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="p-6 space-y-8 bg-slate-950/30 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sliders Section */}
            <SliderInput 
              label="Temperature" 
              name="temperature" 
              value={params.temperature ?? 0.7} 
              min={0} max={2} step={0.1}
              desc="Randomness (0-2)"
              onChange={handleSliderChange} 
            />

            <SliderInput 
              label="Top P" 
              name="top_p" 
              value={params.top_p ?? 1} 
              min={0} max={1} step={0.05}
              desc="Nucleus sampling (0-1)"
              onChange={handleSliderChange} 
            />

            <SliderInput 
              label="Presence Penalty" 
              name="presence_penalty" 
              value={params.presence_penalty ?? 0} 
              min={-2} max={2} step={0.1}
              desc="New topic probability (-2 to 2)"
              onChange={handleSliderChange} 
            />

            <SliderInput 
              label="Frequency Penalty" 
              name="frequency_penalty" 
              value={params.frequency_penalty ?? 0} 
              min={-2} max={2} step={0.1}
              desc="Repetition penalty (-2 to 2)"
              onChange={handleSliderChange} 
            />
          </div>

          <div className="h-px bg-slate-800/50 w-full" />

          {/* Standard Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="max_tokens" className="block text-xs font-medium text-slate-400">
                Max Tokens
              </label>
              <input
                type="number"
                id="max_tokens"
                name="max_tokens"
                min="1"
                value={params.max_tokens}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-200 placeholder-slate-600 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="n" className="block text-xs font-medium text-slate-400">
                N (Choices)
              </label>
              <input
                type="number"
                id="n"
                name="n"
                min="1"
                max="10"
                value={params.n}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-200 placeholder-slate-600 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="user" className="block text-xs font-medium text-slate-400">
                User ID
              </label>
              <input
                type="text"
                id="user"
                name="user"
                value={params.user}
                onChange={handleInputChange}
                placeholder="e.g. user-123"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-200 placeholder-slate-600 transition-colors"
              />
            </div>
          </div>

          <div className="h-px bg-slate-800/50 w-full" />

          {/* Logit Bias JSON Editor */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="logit_bias" className="block text-xs font-medium text-slate-400">
                Logit Bias (JSON)
              </label>
              {jsonError && (
                 <div className="flex items-center gap-1 text-red-400 text-[10px]">
                   <AlertTriangle size={12} />
                   <span>{jsonError}</span>
                 </div>
              )}
            </div>
            <textarea
              id="logit_bias"
              rows={3}
              value={logitBiasText}
              onChange={handleLogitBiasChange}
              placeholder='{"5025": -100, "5026": 5}'
              className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-sm font-mono focus:ring-1 outline-none text-slate-200 placeholder-slate-600 transition-colors ${
                jsonError 
                  ? 'border-red-900/50 focus:border-red-500 focus:ring-red-500' 
                  : 'border-slate-700 focus:ring-cyan-500 focus:border-cyan-500'
              }`}
            />
            <p className="text-[10px] text-slate-500">
              Map token IDs to bias values (-100 to 100).
            </p>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdvancedSettings;
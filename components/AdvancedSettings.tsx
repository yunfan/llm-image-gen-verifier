
import React, { useState, useRef, useEffect } from 'react';
import { ImageGenerationParams } from '../types';
import { LayoutTemplate, Maximize, Image as ImageIcon, UploadCloud, X, Loader2, AlertTriangle, Plus, ChevronDown, Check } from 'lucide-react';
import { uploadImageFile } from '../services/api';

interface AdvancedSettingsProps {
  apiKey: string;
  params: ImageGenerationParams;
  setParams: React.Dispatch<React.SetStateAction<ImageGenerationParams>>;
}

const ASPECT_RATIOS = [
  '21:9', '16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16', '9:21'
];

const RESOLUTION_PRESETS = [
  { label: '1k (1920x1080)', value: '1920x1080' },
  { label: '2k (2560x1440)', value: '2560x1440' },
  { label: '4k (3840x2160)', value: '3840x2160' },
  { label: 'Square (1024x1024)', value: '1024x1024' },
];

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ apiKey, params, setParams }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sizeDropdownRef = useRef<HTMLDivElement>(null);
  const sizeInputRef = useRef<HTMLInputElement>(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target as Node)) {
        setShowSizeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRatioSelect = (ratio: string) => {
    setParams(prev => ({ ...prev, aspect_ratio: ratio }));
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams(prev => ({ ...prev, size: e.target.value }));
  };

  const handleSizeSelect = (value: string) => {
    setParams(prev => ({ ...prev, size: value }));
    setShowSizeDropdown(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!apiKey) {
      setUploadError("请先在上方的配置面板中输入 API Key 才能上传文件。");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadedUrl = await uploadImageFile(apiKey, file);
      setParams(prev => ({
        ...prev,
        image: [...(prev.image || []), uploadedUrl]
      }));
    } catch (err: any) {
      setUploadError(err.message || "上传失败");
    } finally {
      setIsUploading(false);
      // Clear input so user can retry same file or add new one
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setParams(prev => ({ 
      ...prev, 
      image: (prev.image || []).filter((_, index) => index !== indexToRemove) 
    }));
    setUploadError(null);
  };

  const currentImages = params.image || [];

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-2 text-cyan-400 font-medium pb-2 border-b border-slate-800/50">
        <LayoutTemplate size={18} />
        <h3>生图参数</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Aspect Ratio & Size */}
        <div className="space-y-6">
          
          {/* Aspect Ratio Grid */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
              <span>画面比例</span>
              <span className="text-slate-600 font-mono">{params.aspect_ratio || '未设置'}</span>
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => handleRatioSelect(ratio)}
                  className={`
                    text-xs py-1.5 px-1 rounded-md border transition-all duration-200
                    ${params.aspect_ratio === ratio 
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                    }
                  `}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Size Input (Combobox) */}
          <div className="space-y-2" ref={sizeDropdownRef}>
            <label htmlFor="size" className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <Maximize size={12} />
              <span>分辨率 (可选)</span>
            </label>
            <div className="relative">
              <input
                ref={sizeInputRef}
                type="text"
                id="size"
                value={params.size || ''}
                onChange={handleSizeChange}
                onFocus={() => setShowSizeDropdown(true)}
                placeholder="例如 1024x1024 或选择预设"
                autoComplete="off"
                className="w-full pl-3 pr-10 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-200 placeholder-slate-700 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-cyan-400 transition-colors"
              >
                <ChevronDown size={14} className={`transform transition-transform ${showSizeDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showSizeDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar ring-1 ring-black/20">
                  {RESOLUTION_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleSizeSelect(preset.value)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-cyan-500/10 hover:text-cyan-300 flex items-center justify-between group transition-colors border-b border-slate-800/50 last:border-0"
                    >
                      <span className={params.size === preset.value ? 'text-cyan-400 font-medium' : 'text-slate-300'}>
                        {preset.label}
                      </span>
                      {params.size === preset.value && <Check size={12} className="text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Image Reference Upload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <ImageIcon size={12} />
              <span>参考图 (上传)</span>
            </label>
            {/* Show error small if exists */}
            {uploadError && (
              <span className="text-[10px] text-red-400 flex items-center gap-1">
                <AlertTriangle size={10} />
                失败
              </span>
            )}
          </div>
          
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 min-h-[160px]">
            
             {/* Image Grid */}
             {currentImages.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {currentImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative group w-20 h-20 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-sm">
                      <img src={imgUrl} alt={`ref-${idx}`} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-red-500/90 text-white rounded-full p-0.5 transition-colors backdrop-blur-sm"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  
                  {/* Small Upload Button (Append) */}
                  <label className="flex flex-col items-center justify-center w-20 h-20 bg-slate-900/50 border border-slate-800 border-dashed rounded-lg hover:bg-slate-800 hover:border-cyan-500/50 hover:text-cyan-400 transition-all cursor-pointer">
                    {isUploading ? (
                      <Loader2 size={16} className="animate-spin text-cyan-500" />
                    ) : (
                      <Plus size={20} className="text-slate-500" />
                    )}
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
             ) : (
                /* Empty State / Big Upload Box */
                <label className={`
                  flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300
                  ${uploadError ? 'border-red-500/30 bg-red-950/10' : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900'}
                `}>
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={24} className="text-cyan-500 animate-spin" />
                      <span className="text-xs text-slate-400">上传中...</span>
                    </div>
                  ) : (
                    <>
                      <div className="p-2 bg-slate-800/50 rounded-full mb-2 group-hover:scale-110 transition-transform">
                        <UploadCloud size={20} className={uploadError ? 'text-red-400' : 'text-slate-400'} />
                      </div>
                      <span className="text-xs text-slate-400">点击上传参考图</span>
                    </>
                  )}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
             )}
             
             {/* Upload Error Text Display (below grid) */}
             {uploadError && !isUploading && (
               <div className="mt-2 text-[10px] text-red-400 text-center px-2">
                 {uploadError}
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdvancedSettings;

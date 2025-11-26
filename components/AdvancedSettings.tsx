
import React, { useState, useRef } from 'react';
import { ImageGenerationParams } from '../types';
import { LayoutTemplate, Maximize, Image as ImageIcon, UploadCloud, X, Loader2, AlertTriangle, Plus } from 'lucide-react';
import { uploadImageFile } from '../services/api';

interface AdvancedSettingsProps {
  apiKey: string;
  params: ImageGenerationParams;
  setParams: React.Dispatch<React.SetStateAction<ImageGenerationParams>>;
}

const ASPECT_RATIOS = [
  '21:9', '16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16', '9:21'
];

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ apiKey, params, setParams }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRatioSelect = (ratio: string) => {
    setParams(prev => ({ ...prev, aspect_ratio: ratio }));
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams(prev => ({ ...prev, size: e.target.value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!apiKey) {
      setUploadError("Please enter your API Key in the configuration panel above to upload files.");
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
      setUploadError(err.message || "Upload failed");
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
        <h3>Image Parameters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Aspect Ratio & Size */}
        <div className="space-y-6">
          
          {/* Aspect Ratio Grid */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
              <span>Aspect Ratio</span>
              <span className="text-slate-600 font-mono">{params.aspect_ratio || 'Not set'}</span>
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

          {/* Size Input */}
          <div className="space-y-2">
            <label htmlFor="size" className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <Maximize size={12} />
              <span>Size (Optional)</span>
            </label>
            <input
              type="text"
              id="size"
              value={params.size || ''}
              onChange={handleSizeChange}
              placeholder="e.g. 1024x1024"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-200 placeholder-slate-700 transition-colors"
            />
          </div>
        </div>

        {/* Right Column: Image Reference Upload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <ImageIcon size={12} />
              <span>Reference Images (Upload)</span>
            </label>
            {/* Show error small if exists */}
            {uploadError && (
              <span className="text-[10px] text-red-400 flex items-center gap-1">
                <AlertTriangle size={10} />
                Failed
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
                      <span className="text-xs text-slate-400">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="p-2 bg-slate-800/50 rounded-full mb-2 group-hover:scale-110 transition-transform">
                        <UploadCloud size={20} className={uploadError ? 'text-red-400' : 'text-slate-400'} />
                      </div>
                      <span className="text-xs text-slate-400">Click to upload reference image</span>
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

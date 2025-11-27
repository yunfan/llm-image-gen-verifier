import React, { useRef, useState } from 'react';
import { VisionAnalysisParams } from '../types';
import { Eye, UploadCloud, Loader2, X, Plus, Image as ImageIcon } from 'lucide-react';

interface VisionSettingsProps {
  params: VisionAnalysisParams;
  setParams: React.Dispatch<React.SetStateAction<VisionAnalysisParams>>;
}

const VisionSettings: React.FC<VisionSettingsProps> = ({ params, setParams }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Convert file to Data URL (Standard Base64 with prefix)
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsProcessing(true);
    // Explicitly cast to File[] because Array.from on FileList can infer as unknown[] in some TS configurations
    const files = Array.from(e.target.files) as File[];
    
    try {
      const promises = files.map(file => fileToDataUrl(file));
      const dataUrls = await Promise.all(promises);
      
      setParams(prev => ({
        ...prev,
        images: [...(prev.images || []), ...dataUrls]
      }));
    } catch (error) {
      console.error("Error processing images", error);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setParams(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const hasImages = params.images && params.images.length > 0;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 text-amber-400 font-medium pb-2 border-b border-slate-800/50">
        <Eye size={18} />
        <h3>视觉分析素材 (读图)</h3>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-medium text-slate-400 flex items-center gap-2">
          <ImageIcon size={12} />
          <span>待分析图片 (支持多选)</span>
        </label>

        <div className="flex flex-wrap gap-4">
          {/* Existing Images */}
          {hasImages && params.images.map((imgUrl, idx) => (
            <div key={idx} className="relative group w-24 h-24 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
              <img src={imgUrl} alt={`vision-${idx}`} className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-black/60 hover:bg-red-500/90 text-white rounded-full p-1 transition-colors backdrop-blur-sm"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {/* Upload Button */}
          <label className={`
            flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
            ${hasImages 
              ? 'bg-slate-900/50 border-slate-800 hover:border-amber-500/50 hover:text-amber-400' 
              : 'w-full h-32 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }
          `}>
            {isProcessing ? (
              <Loader2 size={24} className="text-amber-500 animate-spin" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                {hasImages ? <Plus size={24} /> : <UploadCloud size={24} />}
                {!hasImages && <span className="text-xs">点击上传图片</span>}
              </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              multiple
              className="hidden" 
              onChange={handleUpload}
              disabled={isProcessing}
            />
          </label>
        </div>
        
        {!hasImages && (
          <p className="text-[10px] text-slate-500 text-center">
            上传一张或多张图片，让模型为您解析内容或生成相关提示词。
          </p>
        )}
      </div>
    </div>
  );
};

export default VisionSettings;
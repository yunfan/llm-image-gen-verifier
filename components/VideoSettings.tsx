
import React, { useState, useRef } from 'react';
import { VideoGenerationParams } from '../types';
import { Film, UploadCloud, Loader2, Image as ImageIcon, X, Sliders, Zap, Clock, AlertTriangle } from 'lucide-react';

interface VideoSettingsProps {
  apiKey: string;
  params: VideoGenerationParams;
  setParams: React.Dispatch<React.SetStateAction<VideoGenerationParams>>;
}

const VideoSettings: React.FC<VideoSettingsProps> = ({ apiKey, params, setParams }) => {
  const [isUploadingSource, setIsUploadingSource] = useState(false);
  const [isUploadingTail, setIsUploadingTail] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const tailInputRef = useRef<HTMLInputElement>(null);

  // Helper to convert file to Raw Base64 (stripping data:image/...;base64, prefix)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Split at the comma to remove the Data URL scheme part
        const rawBase64 = result.split(',')[1];
        resolve(rawBase64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async (file: File, target: 'image' | 'image_tail') => {
    const setUploading = target === 'image' ? setIsUploadingSource : setIsUploadingTail;
    setUploading(true);
    setUploadError(null);

    try {
      const base64String = await fileToBase64(file);
      setParams(prev => {
        const newParams = { ...prev, [target]: base64String };
        // Constraint: If tail frame is present, duration must be 5s
        if (target === 'image_tail' && base64String) {
          newParams.duration = '5';
        }
        return newParams;
      });
    } catch (err: any) {
      setUploadError(err.message || "文件处理失败");
    } finally {
      setUploading(false);
      if (sourceInputRef.current) sourceInputRef.current.value = '';
      if (tailInputRef.current) tailInputRef.current.value = '';
    }
  };

  const removeImage = (target: 'image' | 'image_tail') => {
    setParams(prev => ({ ...prev, [target]: '' }));
    setUploadError(null);
  };

  // Helper to render preview (re-attaching prefix for browser display)
  const getPreviewSrc = (rawBase64: string) => {
    return `data:image/jpeg;base64,${rawBase64}`;
  };

  const isTailFrameSet = Boolean(params.image_tail && params.image_tail.length > 0);

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 text-violet-400 font-medium pb-2 border-b border-slate-800/50">
        <Film size={18} />
        <h3>视频参数 (图生视频)</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Source Image */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-2">
            <ImageIcon size={12} />
            <span>首帧图片 (必填)</span>
          </label>
          
          {params.image ? (
            <div className="relative group w-full h-40 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
              <img src={getPreviewSrc(params.image)} alt="Source" className="w-full h-full object-contain" />
              <button 
                type="button"
                onClick={() => removeImage('image')}
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/90 text-white rounded-full p-1 transition-colors backdrop-blur-sm"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className={`
              flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
              ${uploadError ? 'border-red-500/30 bg-red-950/10' : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900'}
            `}>
              {isUploadingSource ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={24} className="text-violet-500 animate-spin" />
                  <span className="text-xs text-slate-400">处理中...</span>
                </div>
              ) : (
                <>
                  <UploadCloud size={24} className="text-slate-500 mb-2" />
                  <span className="text-xs text-slate-400">点击选择图片 (本地 Base64)</span>
                </>
              )}
              <input 
                ref={sourceInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'image')}
                disabled={isUploadingSource}
              />
            </label>
          )}
        </div>

        {/* Tail Image */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon size={12} />
              <span>尾帧图片 (可选)</span>
            </div>
            {isTailFrameSet && <span className="text-[10px] text-amber-500 flex items-center gap-1"><AlertTriangle size={10}/> 锁定时长为5s</span>}
          </label>
          
          {params.image_tail ? (
            <div className="relative group w-full h-40 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
              <img src={getPreviewSrc(params.image_tail)} alt="Tail" className="w-full h-full object-contain" />
              <button 
                type="button"
                onClick={() => removeImage('image_tail')}
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/90 text-white rounded-full p-1 transition-colors backdrop-blur-sm"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className={`
              flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
              ${uploadError ? 'border-red-500/30 bg-red-950/10' : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900'}
            `}>
              {isUploadingTail ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={24} className="text-violet-500 animate-spin" />
                  <span className="text-xs text-slate-400">处理中...</span>
                </div>
              ) : (
                <>
                  <UploadCloud size={24} className="text-slate-500 mb-2" />
                  <span className="text-xs text-slate-400">点击选择图片 (本地 Base64)</span>
                </>
              )}
              <input 
                ref={tailInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'image_tail')}
                disabled={isUploadingTail}
              />
            </label>
          )}
        </div>
      </div>

      {uploadError && !isUploadingSource && !isUploadingTail && (
        <div className="text-xs text-red-400 text-center bg-red-950/20 py-2 rounded-lg border border-red-500/10">
          {uploadError}
        </div>
      )}

      {/* Advanced Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800/50">
        
        {/* Negative Prompt */}
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="negative_prompt" className="text-xs font-medium text-slate-400">
            负向提示词 (可选, &le; 200字符)
          </label>
          <input
            type="text"
            id="negative_prompt"
            value={params.negative_prompt || ''}
            onChange={(e) => setParams(prev => ({ ...prev, negative_prompt: e.target.value }))}
            placeholder="不希望出现的元素，例如：模糊、变形..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-none text-slate-200 placeholder-slate-700 transition-colors"
          />
        </div>

        {/* Mode & Duration */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <Zap size={12} />
              <span>生成模式</span>
            </label>
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setParams(prev => ({ ...prev, mode: 'std' }))}
                className={`flex-1 text-xs py-1.5 rounded transition-colors ${params.mode === 'std' ? 'bg-slate-800 text-violet-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                高性能 (std)
              </button>
              <button
                type="button"
                onClick={() => setParams(prev => ({ ...prev, mode: 'pro' }))}
                className={`flex-1 text-xs py-1.5 rounded transition-colors ${params.mode === 'pro' ? 'bg-slate-800 text-violet-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                高表现 (pro)
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <Clock size={12} />
              <span>视频时长</span>
            </label>
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setParams(prev => ({ ...prev, duration: '5' }))}
                className={`flex-1 text-xs py-1.5 rounded transition-colors ${params.duration === '5' ? 'bg-slate-800 text-violet-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                5秒
              </button>
              <button
                type="button"
                onClick={() => setParams(prev => ({ ...prev, duration: '10' }))}
                disabled={isTailFrameSet}
                title={isTailFrameSet ? "包含尾帧的视频仅支持5秒时长" : ""}
                className={`flex-1 text-xs py-1.5 rounded transition-colors ${
                  isTailFrameSet 
                    ? 'text-slate-700 cursor-not-allowed opacity-50' 
                    : params.duration === '10' ? 'bg-slate-800 text-violet-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                10秒
              </button>
            </div>
          </div>
        </div>

        {/* CFG Scale */}
        <div className="space-y-4">
           <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={12} />
                <span>生成自由度 (CFG Scale)</span>
              </div>
              <span className="font-mono text-violet-400">{params.cfg_scale}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={params.cfg_scale || 0.5}
              onChange={(e) => setParams(prev => ({ ...prev, cfg_scale: parseFloat(e.target.value) }))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
            <div className="flex justify-between text-[10px] text-slate-600 font-mono px-1">
              <span>0.0 (随机)</span>
              <span>1.0 (严格)</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default VideoSettings;

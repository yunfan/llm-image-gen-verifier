
import React, { useState, useEffect } from 'react';
import { ApiResponse } from '../types';
import { ImageIcon, FileText, X, ZoomIn, Link, Check, Video } from 'lucide-react';

interface ResultDisplayProps {
  apiResponse: ApiResponse;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ apiResponse }) => {
  const [selectedMedia, setSelectedMedia] = useState<{url: string, type: 'image' | 'video'} | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Parse response to extract URLs (images or videos)
  const { mediaItems, revisedPrompt } = React.useMemo(() => {
    const items: { url: string, type: 'image' | 'video' }[] = [];
    let promptText = '';

    if (apiResponse && apiResponse.data) {
      // Robustly handle data: it could be an array or a single object depending on the provider/model
      const dataList = Array.isArray(apiResponse.data) ? apiResponse.data : [apiResponse.data];

      dataList.forEach((item: any) => {
        if (!item) return;

        let url = item.url;
        if (!url && item.b64_json) {
          url = `data:image/png;base64,${item.b64_json}`;
        }

        // Some video APIs return nested objects like { video: { url: '...' } }
        if (!url && item.video && item.video.url) {
          url = item.video.url;
        }

        if (url) {
          // Simple heuristic to detect video vs image
          // Kling returns objects with 'url' pointing to mp4, so endsWith check works, 
          // or we check if the item itself came from a video array context (passed via type if needed, but url check is usually enough)
          const isVideo = url.includes('.mp4') || url.includes('video') || item.type === 'video';
          items.push({ url, type: isVideo ? 'video' : 'image' });
        }
        
        if (item.revised_prompt) {
          promptText = item.revised_prompt;
        }
      });
    }
    return { mediaItems: items, revisedPrompt: promptText };
  }, [apiResponse]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedMedia(null);
    };
    if (selectedMedia) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMedia]);

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  if (!apiResponse) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Revised Prompt (if available) */}
      {revisedPrompt && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div className="bg-slate-950/50 px-4 py-2 border-b border-slate-800 flex items-center gap-2 text-slate-400 text-sm font-medium">
            <FileText size={16} />
            <span>修正后的提示词 / 文本输出</span>
          </div>
          <div className="p-6 text-slate-300 leading-relaxed whitespace-pre-wrap font-mono text-sm">
            {revisedPrompt}
          </div>
        </div>
      )}

      {/* Media Section */}
      {mediaItems.length > 0 ? (
        <div className="space-y-4">
           <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium px-1">
             <ImageIcon size={16} />
             <span>生成结果 ({mediaItems.length})</span>
           </div>
           <div className="grid grid-cols-1 gap-6">
             {mediaItems.map((item, idx) => (
               <div 
                 key={idx} 
                 className="group relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all hover:border-slate-600"
               >
                 {item.type === 'video' ? (
                   <div className="relative">
                     {/* Copy Link Button Overlay */}
                     <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                       <button
                         onClick={(e) => {
                           e.preventDefault();
                           handleCopyUrl(item.url);
                         }}
                         className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/50 rounded-lg text-xs font-medium text-slate-300 hover:text-cyan-400 transition-all shadow-xl"
                         title="复制视频链接"
                       >
                         {copiedUrl === item.url ? <Check size={14} className="text-green-400" /> : <Link size={14} />}
                         <span>{copiedUrl === item.url ? '已复制' : '复制链接'}</span>
                       </button>
                     </div>
                     
                     {/* Video Player */}
                     <div className="bg-black/50 w-full aspect-video flex items-center justify-center">
                        <video 
                          controls 
                          src={item.url} 
                          className="w-full h-auto max-h-[600px] mx-auto"
                          preload="metadata"
                        />
                     </div>
                     
                     <div className="absolute top-3 left-3 z-10 pointer-events-none">
                       <div className="px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-white/80 flex items-center gap-1">
                         <Video size={10} />
                         <span>VIDEO</span>
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div className="cursor-pointer relative" onClick={() => setSelectedMedia(item)}>
                     <img 
                       src={item.url} 
                       alt={`Result ${idx + 1}`} 
                       className="w-full h-auto object-contain max-h-[600px] mx-auto bg-grid-pattern"
                       loading="lazy"
                     />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center pointer-events-none">
                       <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-slate-900/80 backdrop-blur rounded-full p-3 text-cyan-400 shadow-xl border border-white/10">
                         <ZoomIn size={32} />
                       </div>
                     </div>
                     
                     {/* Copy Link Button for Image too */}
                     <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={e => e.stopPropagation()}>
                       <button
                         onClick={(e) => {
                           e.preventDefault();
                           handleCopyUrl(item.url);
                         }}
                         className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/50 rounded-lg text-xs font-medium text-slate-300 hover:text-cyan-400 transition-all shadow-xl"
                       >
                         {copiedUrl === item.url ? <Check size={14} className="text-green-400" /> : <Link size={14} />}
                         <span>{copiedUrl === item.url ? '已复制' : '复制链接'}</span>
                       </button>
                     </div>
                   </div>
                 )}
               </div>
             ))}
           </div>
        </div>
      ) : (
        <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-xl p-8 text-center text-slate-500">
           <p className="flex items-center justify-center gap-2">
             <ImageIcon size={16} />
             <span>响应中未发现媒体内容。</span>
           </p>
        </div>
      )}

      {/* Lightbox for Images Only */}
      {selectedMedia && selectedMedia.type === 'image' && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedMedia(null)}
        >
          <button 
            onClick={() => setSelectedMedia(null)}
            className="absolute top-6 right-6 p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-white transition-colors border border-slate-600/50"
          >
            <X size={24} />
          </button>
          <img 
            src={selectedMedia.url} 
            alt="Full screen" 
            className="max-w-[95vw] max-h-[90vh] object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;

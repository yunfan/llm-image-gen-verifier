import React, { useState, useEffect } from 'react';
import { ApiResponse } from '../types';
import { ImageIcon, FileText, X, ZoomIn } from 'lucide-react';

interface ResultDisplayProps {
  apiResponse: ApiResponse;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ apiResponse }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Parse response to extract URLs or base64 data
  const { imageUrls, revisedPrompt } = React.useMemo(() => {
    const urls: string[] = [];
    let promptText = '';

    if (apiResponse.data) {
      apiResponse.data.forEach(item => {
        if (item.url) {
          urls.push(item.url);
        } else if (item.b64_json) {
          urls.push(`data:image/png;base64,${item.b64_json}`);
        }
        
        if (item.revised_prompt) {
          promptText = item.revised_prompt;
        }
      });
    }
    return { imageUrls: urls, revisedPrompt: promptText };
  }, [apiResponse]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    if (selectedImage) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  if (!apiResponse) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Revised Prompt (if available) - Text on top */}
      {revisedPrompt && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div className="bg-slate-950/50 px-4 py-2 border-b border-slate-800 flex items-center gap-2 text-slate-400 text-sm font-medium">
            <FileText size={16} />
            <span>Revised Prompt / Text Output</span>
          </div>
          <div className="p-6 text-slate-300 leading-relaxed whitespace-pre-wrap font-mono text-sm">
            {revisedPrompt}
          </div>
        </div>
      )}

      {/* Image Section - Images below */}
      {imageUrls.length > 0 ? (
        <div className="space-y-4">
           <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium px-1">
             <ImageIcon size={16} />
             <span>Generated Images ({imageUrls.length})</span>
           </div>
           <div className="grid grid-cols-1 gap-6">
             {imageUrls.map((url, idx) => (
               <div 
                 key={idx} 
                 onClick={() => setSelectedImage(url)}
                 className="group relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all hover:border-cyan-500/50 cursor-pointer"
               >
                 <img 
                   src={url} 
                   alt={`Generated result ${idx + 1}`} 
                   className="w-full h-auto object-contain max-h-[600px] mx-auto"
                   loading="lazy"
                 />
                 
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                   <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-slate-900/80 backdrop-blur rounded-full p-3 text-cyan-400 shadow-xl">
                     <ZoomIn size={32} />
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      ) : (
        <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-xl p-8 text-center text-slate-500">
           <p className="flex items-center justify-center gap-2">
             <ImageIcon size={16} />
             <span>No images found in response data.</span>
           </p>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-white transition-colors border border-slate-600/50"
          >
            <X size={24} />
          </button>
          <img 
            src={selectedImage} 
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

import React, { useMemo, useState, useEffect } from 'react';
import { ParsedContent } from '../types';
import { ImageIcon, FileText, X, ZoomIn } from 'lucide-react';

interface ResultDisplayProps {
  rawContent: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ rawContent }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const parsedContent: ParsedContent = useMemo(() => {
    if (!rawContent) return { text: '', imageUrls: [] };

    const imageUrls: string[] = [];
    let text = rawContent;

    // 1. Extract Markdown Images: ![alt](url)
    const markdownImageRegex = /!\[.*?\]\((.*?)\)/g;
    let match;
    while ((match = markdownImageRegex.exec(rawContent)) !== null) {
      if (match[1]) {
        imageUrls.push(match[1]);
      }
    }
    // Remove markdown image syntax from text display for cleaner view
    text = text.replace(markdownImageRegex, '');

    // 2. Extract plain URLs that look like images if they weren't caught by markdown regex
    const urlRegex = /(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|gif|webp|svg))/gi;
    while ((match = urlRegex.exec(text)) !== null) {
      if (!imageUrls.includes(match[1])) {
        imageUrls.push(match[1]);
      }
    }
    
    return {
      text: text.trim(),
      imageUrls,
    };
  }, [rawContent]);

  // Handle Escape key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };
    if (selectedImage) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  if (!rawContent) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Text Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="bg-slate-950/50 px-4 py-2 border-b border-slate-800 flex items-center gap-2 text-slate-400 text-sm font-medium">
          <FileText size={16} />
          <span>Text Response</span>
        </div>
        <div className="p-6 text-slate-300 leading-relaxed whitespace-pre-wrap font-mono text-sm">
          {parsedContent.text || <span className="text-slate-600 italic">No text content returned (only images, or empty).</span>}
        </div>
      </div>

      {/* Image Section */}
      {parsedContent.imageUrls.length > 0 ? (
        <div className="space-y-4">
           <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium px-1">
             <ImageIcon size={16} />
             <span>Generated Images ({parsedContent.imageUrls.length})</span>
           </div>
           <div className="grid grid-cols-1 gap-6">
             {parsedContent.imageUrls.map((url, idx) => (
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
                 
                 {/* Hover Overlay with Zoom Icon */}
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                   <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-slate-900/80 backdrop-blur rounded-full p-3 text-cyan-400 shadow-xl">
                     <ZoomIn size={32} />
                   </div>
                 </div>

                 <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                   {url}
                 </div>
               </div>
             ))}
           </div>
        </div>
      ) : (
        <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-xl p-8 text-center text-slate-500">
           <p className="flex items-center justify-center gap-2">
             <ImageIcon size={16} />
             <span>No images detected in response.</span>
           </p>
           <p className="text-xs mt-2">Make sure the model you selected supports image generation.</p>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-white transition-colors border border-slate-600/50"
            aria-label="Close fullscreen view"
          >
            <X size={24} />
          </button>
          
          <img 
            src={selectedImage} 
            alt="Full screen view" 
            className="max-w-[95vw] max-h-[90vh] object-contain shadow-2xl rounded-sm animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          />
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur px-4 py-2 rounded-full text-xs text-slate-300 border border-slate-700/50 pointer-events-none">
            Click background or press ESC to close
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
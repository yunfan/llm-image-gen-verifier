
import React from 'react';
import { Image, Video, Sparkles } from 'lucide-react';
import { AppMode } from '../types';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode }) => {
  return (
    <div className="hidden md:flex flex-col w-20 bg-slate-900 border-r border-slate-800 h-screen fixed left-0 top-0 items-center py-8 z-20">
      <div className="mb-10 p-2 bg-cyan-500/10 rounded-full">
        <Sparkles className="text-cyan-400 w-6 h-6" />
      </div>

      <div className="flex flex-col gap-6 w-full px-2">
        <button
          onClick={() => setMode('image')}
          className={`
            flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all duration-300 w-full group relative
            ${currentMode === 'image' 
              ? 'bg-slate-800 text-cyan-400 shadow-lg shadow-cyan-900/10' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }
          `}
        >
          <Image size={24} className={currentMode === 'image' ? 'stroke-[2.5px]' : ''} />
          <span className="text-[10px] font-medium">生图</span>
          
          {currentMode === 'image' && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded-l-full"></div>
          )}
        </button>

        <button
          onClick={() => setMode('video')}
          className={`
            flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all duration-300 w-full group relative
            ${currentMode === 'video' 
              ? 'bg-slate-800 text-violet-400 shadow-lg shadow-violet-900/10' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }
          `}
        >
          <Video size={24} className={currentMode === 'video' ? 'stroke-[2.5px]' : ''} />
          <span className="text-[10px] font-medium">生视频</span>
          
          {currentMode === 'video' && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-500 rounded-l-full"></div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
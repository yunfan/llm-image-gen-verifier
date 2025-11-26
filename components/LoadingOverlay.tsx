
import React, { useEffect, useState } from 'react';
import { Loader2, Timer } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: number;
    if (isVisible) {
      const startTime = Date.now();
      interval = window.setInterval(() => {
        setSeconds((Date.now() - startTime) / 1000);
      }, 100);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full mx-4 ring-1 ring-slate-700">
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin relative z-10" />
        </div>
        <h3 className="text-xl font-semibold text-white">正在生成响应</h3>
        <div className="flex items-center gap-2 text-slate-400 font-mono text-lg bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 shadow-inner">
          <Timer size={20} className="text-cyan-500" />
          <span className="tabular-nums">{seconds.toFixed(1)}s</span>
        </div>
        <p className="text-sm text-slate-500 text-center animate-pulse">
          正在向接口发送请求...
        </p>
      </div>
    </div>
  );
};
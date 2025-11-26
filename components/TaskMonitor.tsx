
import React from 'react';
import { Loader2, Server, CheckCircle2, Clock, Hourglass, XCircle } from 'lucide-react';

interface TaskMonitorProps {
  taskId: string;
  status: 'submitted' | 'processing' | 'succeed' | 'failed' | string;
}

const TaskMonitor: React.FC<TaskMonitorProps> = ({ taskId, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'submitted': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'processing': return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
      case 'succeed': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'submitted': return <Hourglass className="animate-pulse" size={24} />;
      case 'processing': return <Loader2 className="animate-spin" size={24} />;
      case 'succeed': return <CheckCircle2 className="animate-in zoom-in duration-300" size={24} />;
      case 'failed': return <XCircle className="animate-in zoom-in duration-300" size={24} />;
      default: return <Server size={24} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'submitted': return '任务已提交，排队中...';
      case 'processing': return '视频正在生成中...';
      case 'succeed': return '任务完成！';
      case 'failed': return '任务失败';
      default: return `状态: ${status}`;
    }
  };

  const getProgressGradient = () => {
     if (status === 'processing') return 'from-violet-600 via-fuchsia-500 to-indigo-600';
     if (status === 'submitted') return 'from-blue-600 via-cyan-500 to-teal-600';
     return 'from-slate-700 to-slate-600';
  };

  return (
    <div className={`w-full bg-slate-900/50 backdrop-blur border rounded-xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 transition-all duration-500 ${getStatusColor()} border-opacity-50`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Info */}
        <div className="flex items-center gap-5 w-full">
          <div className={`p-4 rounded-full bg-slate-950/50 border border-white/5 shadow-inner transition-colors duration-500`}>
            {getStatusIcon()}
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="text-lg font-bold tracking-tight">
              {getStatusText()}
            </h4>
            <div className="flex items-center gap-2 text-xs font-mono opacity-70 bg-black/20 px-2 py-1 rounded w-fit">
              <Server size={12} />
              <span>ID: {taskId}</span>
            </div>
          </div>
        </div>

        {/* Right: Timer Visual */}
        {status !== 'succeed' && status !== 'failed' && (
           <div className="flex flex-col items-center justify-center min-w-[120px] gap-2 pl-6 border-l border-white/5">
             <div className="relative flex items-center justify-center">
               <div className={`absolute inset-0 blur-xl rounded-full animate-pulse opacity-40 ${status === 'processing' ? 'bg-violet-500' : 'bg-blue-500'}`}></div>
               <Clock className="relative z-10 w-6 h-6 animate-pulse opacity-80" />
             </div>
             <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60">
               Auto Polling
             </span>
           </div>
        )}

      </div>
      
      {/* Progress Bar (Indeterminate) */}
      {(status === 'submitted' || status === 'processing') && (
        <div className="mt-6 relative w-full h-1.5 bg-slate-950/50 rounded-full overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r ${getProgressGradient()} w-1/3 animate-[shimmer_2s_infinite_linear] rounded-full`}></div>
        </div>
      )}
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
};

export default TaskMonitor;

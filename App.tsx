
import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, AlertCircle, Menu, Eye } from 'lucide-react';
import ConfigPanel, { VIDEO_MODELS, IMAGE_MODELS, VISION_MODELS } from './components/ConfigPanel';
import AdvancedSettings from './components/AdvancedSettings';
import VideoSettings from './components/VideoSettings';
import VisionSettings from './components/VisionSettings';
import ResultDisplay from './components/ResultDisplay';
import TaskMonitor from './components/TaskMonitor';
import { LoadingOverlay } from './components/LoadingOverlay';
import Sidebar from './components/Sidebar';
import { sendImageGenRequest, sendVideoGenRequest, getKlingVideoStatus, sendVisionRequest } from './services/api';
import { AppConfig, RequestStatus, ImageGenerationParams, ApiResponse, AppMode, VideoGenerationParams, VisionAnalysisParams } from './types';

function App() {
  // Initialize config
  const [config, setConfig] = useState<AppConfig>(() => {
    const savedConfig = localStorage.getItem('llm_verifier_config');
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (e) {
        console.error("Failed to parse saved config", e);
      }
    }
    return { apiKey: '', model: '' };
  });

  useEffect(() => {
    localStorage.setItem('llm_verifier_config', JSON.stringify(config));
  }, [config]);

  // App State
  const [mode, setMode] = useState<AppMode>('image');
  const [configExpanded, setConfigExpanded] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle

  // Params
  const [imageParams, setImageParams] = useState<ImageGenerationParams>({
    size: '',
    aspect_ratio: '1:1',
    image: []
  });
  
  const [videoParams, setVideoParams] = useState<VideoGenerationParams>({
    image: '',
    image_tail: '',
    negative_prompt: '',
    cfg_scale: 0.5,
    mode: 'pro',
    duration: '5'
  });

  const [visionParams, setVisionParams] = useState<VisionAnalysisParams>({
    images: []
  });

  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<RequestStatus>(RequestStatus.IDLE);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Async Task State
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<string>('');
  const pollingTimerRef = useRef<number | null>(null);

  // Handle Mode Switch and Default Model Selection
  const handleModeSwitch = (newMode: AppMode) => {
    setMode(newMode);
    
    // Auto-switch model if needed
    if (newMode === 'video') {
      if (!VIDEO_MODELS.includes(config.model)) {
        setConfig(prev => ({ ...prev, model: VIDEO_MODELS[0] }));
      }
    } else if (newMode === 'vision') {
      if (!VISION_MODELS.includes(config.model)) {
        setConfig(prev => ({ ...prev, model: VISION_MODELS[0] }));
      }
    } else {
      if (!IMAGE_MODELS.includes(config.model)) {
        setConfig(prev => ({ ...prev, model: IMAGE_MODELS[0] }));
      }
    }
    
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  // Reset result when switching modes
  useEffect(() => {
    setResult(null);
    setErrorMsg(null);
    setStatus(RequestStatus.IDLE);
    setActiveTaskId(null);
    setTaskStatus('');
    if (pollingTimerRef.current) {
      window.clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, [mode]);

  // Polling Logic
  useEffect(() => {
    if (activeTaskId && status === RequestStatus.POLLING) {
      pollingTimerRef.current = window.setInterval(async () => {
        try {
          const taskRes = await getKlingVideoStatus(config.apiKey, activeTaskId);
          const currentStatus = taskRes.data.task_status;
          setTaskStatus(currentStatus);

          if (currentStatus === 'succeed') {
             // Task Success
             if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
             
             const videos = taskRes.data.task_result?.videos || [];
             
             setResult({
               created: Date.now(),
               data: videos
             });
             setStatus(RequestStatus.SUCCESS);
             setActiveTaskId(null);

          } else if (currentStatus === 'failed') {
             // Task Failed
             if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
             setErrorMsg(taskRes.data.task_status_msg || "视频生成任务失败");
             setStatus(RequestStatus.ERROR);
             setActiveTaskId(null);
          }

        } catch (err: any) {
          console.error("Polling error:", err);
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, [activeTaskId, status, config.apiKey]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config.apiKey || !config.model) {
      setErrorMsg("请填写 API Key 和 模型名称。");
      return;
    }

    // Validation
    if (mode === 'image' && !prompt) {
      setErrorMsg("生图模式请填写提示词。");
      return;
    }

    if (mode === 'video' && !videoParams.image) {
      setErrorMsg("图生视频必须提供源图片。");
      return;
    }

    if (mode === 'vision' && (!prompt && visionParams.images.length === 0)) {
      setErrorMsg("请提供图片或输入提示词。");
      return;
    }

    setConfigExpanded(false);
    setStatus(RequestStatus.LOADING);
    setResult(null);
    setErrorMsg(null);
    setActiveTaskId(null);

    try {
      if (mode === 'image') {
        const response = await sendImageGenRequest(config.apiKey, config.model, prompt, imageParams);
        setResult(response);
        setStatus(RequestStatus.SUCCESS);
      } else if (mode === 'vision') {
        const response = await sendVisionRequest(config.apiKey, config.model, prompt, visionParams);
        setResult(response);
        setStatus(RequestStatus.SUCCESS);
      } else {
        // Video Generation (Async)
        const response = await sendVideoGenRequest(config.apiKey, config.model, prompt, videoParams);
        
        if (response.data && response.data.task_id) {
          setActiveTaskId(response.data.task_id);
          setTaskStatus(response.data.task_status || 'submitted');
          setStatus(RequestStatus.POLLING);
        } else {
           setResult(response);
           setStatus(RequestStatus.SUCCESS);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "发生了意外错误。");
      setStatus(RequestStatus.ERROR);
    }
  };

  // Theme Colors
  let themeColor = 'text-cyan-400';
  let buttonGradient = 'from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-900/20';
  let modeTitle = '生图';
  
  if (mode === 'video') {
    themeColor = 'text-violet-400';
    buttonGradient = 'from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-violet-900/20';
    modeTitle = '生视频';
  } else if (mode === 'vision') {
    themeColor = 'text-amber-400';
    buttonGradient = 'from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-900/20';
    modeTitle = '读图理解';
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 flex">
      <LoadingOverlay isVisible={status === RequestStatus.LOADING} />
      
      {/* Sidebar (Desktop) */}
      <Sidebar currentMode={mode} setMode={handleModeSwitch} />
      
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-slate-800 rounded-lg text-slate-200 shadow-lg"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/80 flex" onClick={() => setIsSidebarOpen(false)}>
          <div className="w-24 h-full bg-slate-900 pt-20 flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
             <Sidebar currentMode={mode} setMode={handleModeSwitch} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-20 transition-all duration-300">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className={`inline-flex items-center justify-center p-3 bg-slate-900/50 rounded-full mb-4 ring-1 ring-white/10 ${themeColor}`}>
              {mode === 'vision' ? <Eye className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              LLM <span className={themeColor}>{modeTitle}</span> 能力验证
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto">
              {mode === 'vision' 
                ? '上传图片让大模型进行分析、描述或生成提示词。' 
                : `测试 ${mode === 'image' ? '图片' : '视频'} 生成接口。`}
            </p>
          </div>

          {/* Configuration */}
          <ConfigPanel 
            config={config} 
            setConfig={setConfig} 
            isExpanded={configExpanded}
            onToggle={() => setConfigExpanded(!configExpanded)}
            currentMode={mode}
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Conditional Settings Panel */}
            {mode === 'image' && (
              <AdvancedSettings 
                apiKey={config.apiKey}
                params={imageParams} 
                setParams={setImageParams} 
              />
            )}
            
            {mode === 'video' && (
              <VideoSettings 
                apiKey={config.apiKey}
                params={videoParams} 
                setParams={setVideoParams}
              />
            )}

            {mode === 'vision' && (
              <VisionSettings 
                params={visionParams}
                setParams={setVisionParams}
              />
            )}

            {/* Prompt Input */}
            <div className="relative">
              <div className="absolute top-3 left-3 text-slate-500">
                <span className="text-xs font-mono border border-slate-700 rounded px-1.5 py-0.5">
                  提示词 {mode === 'video' && '(可选)'}
                </span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === 'image' ? '描述你想生成的图片内容...' : 
                  mode === 'video' ? '描述视频内容 (可选)...' :
                  '输入问题，例如：描述这几张图片的内容，并给出生成视频的提示词...'
                }
                className="w-full min-h-[140px] bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 pt-10 text-lg shadow-inner focus:ring-2 focus:ring-slate-600 focus:border-slate-500 outline-none transition-all resize-y placeholder-slate-600"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={20} className="mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-medium">错误</h4>
                  <p className="text-sm opacity-90">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={status === RequestStatus.LOADING || status === RequestStatus.POLLING}
              className={`
                w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.98]
                bg-gradient-to-r text-white shadow-lg
                ${(status === RequestStatus.LOADING || status === RequestStatus.POLLING)
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : buttonGradient
                }
              `}
            >
              <Send size={20} />
              <span>
                {mode === 'image' ? '生成图片' : 
                 mode === 'video' ? '生成视频' : 
                 '发送分析请求'}
              </span>
            </button>
          </form>

          {/* Polling Status Monitor */}
          {activeTaskId && status === RequestStatus.POLLING && (
            <TaskMonitor taskId={activeTaskId} status={taskStatus} />
          )}

          {/* Results Area */}
          {result && (
            <div className="pt-8 border-t border-slate-800">
              <ResultDisplay apiResponse={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

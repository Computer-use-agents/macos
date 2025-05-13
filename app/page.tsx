'use client';

import React, { useState, useEffect } from 'react';
import TraceViewer from '../src/components/TraceViewer';
import TraceCarousel from '../src/components/TraceCarousel';
import { TraceData } from '../src/types/trace';

// 获取basePath
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

// 修正图片和视频路径
const fixAssetPaths = (data: TraceData): TraceData => {
  return {
    ...data,
    items: data.items.map(item => ({
      ...item,
      screenshot: item.screenshot.startsWith('http')
        ? item.screenshot
        : `${basePath}${item.screenshot.startsWith('/') ? '' : '/'}${item.screenshot}`,
      video: item.video.startsWith('http')
        ? item.video
        : `${basePath}${item.video.startsWith('/') ? '' : '/'}${item.video}`
    }))
  };
};

// 生成traceIds
const generateTraceIds = (count: number): string[] => {
  return Array.from({ length: count }, (_, i) => `viewer${i + 1}`);
};

// TaskDisplay component to show current task
const TaskDisplay = ({ traceData, activeIndex = 0, darkMode = true }: { traceData: TraceData | null, activeIndex?: number, darkMode?: boolean }) => {
  if (!traceData) {
    return null;
  }

  // 适配夜间/白天模式的样式
  const bgClass = darkMode
    ? 'bg-gray-900/90 border-blue-500/40 shadow-lg'
    : 'bg-white border-blue-500/30 shadow-md';
  const textClass = darkMode ? 'text-gray-100' : 'text-gray-900';
  const taskLabelClass = darkMode
    ? 'text-blue-300 font-bold tracking-wider mr-2'
    : 'text-blue-700 font-bold tracking-wider mr-2';
  const taskContentClass = darkMode
    ? 'font-sans font-medium text-base md:text-lg leading-relaxed break-words text-gray-100'
    : 'font-sans font-medium text-base md:text-lg leading-relaxed break-words text-gray-900';

  return (
    <div
      className={`w-full rounded-xl mb-6 border px-6 py-4 flex items-start ${bgClass} ${textClass}`}
      style={{ fontFamily: `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif` }}
    >
      <span className={taskLabelClass} style={{ fontFamily: 'Segoe UI,Arial,sans-serif' }}>TASK:</span>
      <span className={taskContentClass}>{traceData.task || 'No task information available'}</span>
    </div>
  );
};

export default function Home() {
  const [allTraceData, setAllTraceData] = useState<TraceData[]>([]);
  const [traceIds, setTraceIds] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTraceIndex, setActiveTraceIndex] = useState(0);
  
  useEffect(() => {
    // 动态加载trace文件
    async function loadTraceFiles() {
      try {
        // 尝试加载所有可能的trace文件（从1到20）
        const tracePromises = [];
        
        // 定义一个异步函数来尝试导入单个trace文件
        const tryImportTrace = async (index: number) => {
          try {
            const module = await import(`../src/data/trace${index}.json`);
            return { index, data: module.default };
          } catch (e) {
            return null;
          }
        };
        
        // 并行尝试导入所有可能的trace文件
        for (let i = 1; i <= 20; i++) {
          tracePromises.push(tryImportTrace(i));
        }
        
        // 等待所有导入尝试完成
        const results = await Promise.all(tracePromises);
        
        // 过滤出成功导入的trace文件，并按索引排序
        const successfulImports = results
          .filter(result => result !== null)
          .sort((a, b) => a!.index - b!.index)
          .map(result => fixAssetPaths(result!.data as TraceData));
        
        console.log(`Successfully loaded ${successfulImports.length} trace files`);
        
        // 更新状态
        setAllTraceData(successfulImports);
        setTraceIds(generateTraceIds(successfulImports.length));
      } catch (error) {
        console.error('Error loading trace files:', error);
      }
    }
    
    loadTraceFiles();
  }, []);
  
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <main className={darkMode 
      ? "min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-gray-100" 
      : "min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800"
    }>
      <div className="container mx-auto py-12 px-4 max-w-6xl relative">
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className={`fixed top-4 right-4 rounded-full p-2 transition-all duration-300 z-50 ${
            darkMode 
              ? "bg-white/10 hover:bg-white/20 text-yellow-300" 
              : "bg-gray-200 hover:bg-gray-300 text-indigo-700"
          }`}
          aria-label="Toggle theme"
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <header className="mb-16 text-center">
          <h1 className={`text-4xl font-bold mb-2 ${
            darkMode 
              ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500" 
              : "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
          }`}>
          MacOS Agent: an efficient Computer Use Agent for MacOS
          </h1>
          <p className={`text-xl font-light mb-6 ${
            darkMode ? "text-blue-100 opacity-80" : "text-blue-700 opacity-90"
          }`}>
            BIGAI ML Group
          </p>
          
          <div className="flex justify-center">
            <a 
              href="https://github.com/Computer-use-agents/MacOS-Agent" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-lg transition-all hover:scale-105 ${
                darkMode 
                  ? "bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-800/30" 
                  : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
              }`}
            >
              {darkMode ? (
                <img src={`${basePath}/icon/github-mark-white.svg`} alt="GitHub" className="w-5 h-5" />
              ) : (
                <img src={`${basePath}/icon/github-mark.svg`} alt="GitHub" className="w-5 h-5" />
              )}
              <span className="font-medium">GitHub Repository</span>
            </a>
          </div>
        </header>
        
        {/* 介绍部分 */}
        <section className={`mb-20 ${
          darkMode 
            ? "backdrop-blur-sm bg-white/5 border border-white/10" 
            : "backdrop-blur-sm bg-blue-50/30 border border-blue-100/50"
          } rounded-2xl p-8 shadow-xl`}
        >
          <div className="flex items-center mb-6">
            <div className={`h-2 w-2 rounded-full ${darkMode ? "bg-blue-400" : "bg-blue-500"} mr-2 animate-pulse`}></div>
            <div className={`h-2 w-2 rounded-full ${darkMode ? "bg-purple-400" : "bg-purple-500"} mr-2 animate-pulse delay-150`}></div>
            <div className={`h-2 w-2 rounded-full ${darkMode ? "bg-teal-400" : "bg-teal-500"} animate-pulse delay-300`}></div>
            <h2 className={`text-2xl font-bold ml-4 ${
              darkMode 
                ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400" 
                : "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
            }`}>
              Meet the Automation of Computer Use
            </h2>
          </div>
          
          <div className={`prose max-w-none mb-8 ${darkMode ? "prose-invert" : ""}`}>
            <p className={`text-lg leading-relaxed mb-6 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
            We build a <span className="font-medium">Computer Use Agent</span> that redefines how you interact with macOS. Now it can <span className={`${
                darkMode 
                  ? "bg-gradient-to-r from-blue-900/60 to-purple-900/60" 
                  : "bg-gradient-to-r from-blue-100 to-purple-100"
                } px-2 py-0.5 mx-1 rounded`}
              >
                solve diverse and complex tasks
              </span>  across commonly used applications.
            </p>
          </div>
            
          <div className="grid md:grid-cols-3 gap-8 my-10">
            <div className={`rounded-xl p-6 shadow-lg transition-all duration-300 group ${
              darkMode 
                ? "bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/20 hover:border-blue-400/40" 
                : "bg-white border border-blue-200 hover:border-blue-300"
            }`}>
              <div className={`${darkMode ? "text-blue-400" : "text-blue-600"} text-4xl mb-4 group-hover:scale-110 transition-transform duration-300`}>👁️</div>
              <h3 className={`font-medium text-lg mb-2 ${darkMode ? "text-blue-300" : "text-blue-700"}`}>Multimodal Understanding</h3>
              <p className={`text-sm ${darkMode ? "text-blue-100/80" : "text-blue-900/80"}`}>Interprets screen content and task requirements to provide clear progress tracking and next steps.</p>
            </div>
              
            <div className={`rounded-xl p-6 shadow-lg transition-all duration-300 group ${
              darkMode 
                ? "bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/20 hover:border-purple-400/40" 
                : "bg-white border border-purple-200 hover:border-purple-300"
            }`}>
              <div className={`${darkMode ? "text-purple-400" : "text-purple-600"} text-4xl mb-4 group-hover:scale-110 transition-transform duration-300`}>🔄</div>
              <h3 className={`font-medium text-lg mb-2 ${darkMode ? "text-purple-300" : "text-purple-700"}`}>Long-horizon Reasoning</h3>
              <p className={`text-sm ${darkMode ? "text-purple-100/80" : "text-purple-900/80"}`}>Executes multi-step tasks through natural interactions with the macOS interface.</p>
            </div>
              
            <div className={`rounded-xl p-6 shadow-lg transition-all duration-300 group ${
              darkMode 
                ? "bg-gradient-to-br from-slate-800 to-slate-900 border border-teal-500/20 hover:border-teal-400/40" 
                : "bg-white border border-teal-200 hover:border-teal-300"
            }`}>
              <div className={`${darkMode ? "text-teal-400" : "text-teal-600"} text-4xl mb-4 group-hover:scale-110 transition-transform duration-300`}>🧠</div>
              <h3 className={`font-medium text-lg mb-2 ${darkMode ? "text-teal-300" : "text-teal-700"}`}>Cross-App Workflows</h3>
              <p className={`text-sm ${darkMode ? "text-teal-100/80" : "text-teal-900/80"}`}>Coordinates tasks across different applications with consistent performance and reliability.</p>
            </div>
          </div>
            
          <div className={`${
            darkMode 
              ? "backdrop-blur-md bg-white/5 border border-white/10" 
              : "backdrop-blur-md bg-white border border-blue-100/50"
            } rounded-xl p-6`}
          >
            <p className={`mb-4 leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              This is a fully open-source agent, including the code, prompt, and subsequent data and training code.
            </p>
            
            <div className="flex flex-wrap gap-2 mt-6 mb-4">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                darkMode 
                  ? "bg-gradient-to-r from-green-900/40 to-green-800/40 border border-green-500/30 text-green-400" 
                  : "bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-700"
              }`}>
                <span className={`w-2 h-2 ${darkMode ? "bg-green-400" : "bg-green-600"} rounded-full mr-2`}></span>100% Open Source
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                darkMode 
                  ? "bg-gradient-to-r from-purple-900/40 to-purple-800/40 border border-purple-500/30 text-purple-400" 
                  : "bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-purple-700"
              }`}>
                <span className={`w-2 h-2 ${darkMode ? "bg-purple-400" : "bg-purple-600"} rounded-full mr-2`}></span>Research-Friendly
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                darkMode 
                  ? "bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-500/30 text-blue-400" 
                  : "bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700"
              }`}>
                <span className={`w-2 h-2 ${darkMode ? "bg-blue-400" : "bg-blue-600"} rounded-full mr-2`}></span>macOS Compatible
              </span>
            </div>
          </div>

          {/* Agent Hierarchy Diagram */}
          <div className={`mt-12 ${
            darkMode 
              ? "backdrop-blur-md bg-white/5 border border-white/10" 
              : "backdrop-blur-md bg-white border border-blue-100/50"
            } rounded-xl p-6`}
          >
            <h3 className={`text-xl font-bold mb-4 ${
              darkMode 
                ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400" 
                : "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
            }`}>
              System Architecture
            </h3>
            
            <p className={`mb-6 leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Our Computer Use Agent employs a hierarchical structure that seamlessly connects human intent with application-specific actions:
            </p>

            {/* SVG Diagram */}
            <div className="w-full flex justify-center mb-8">
              <div className={`relative p-8 rounded-xl ${
                darkMode 
                  ? "bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-indigo-500/20" 
                  : "bg-gradient-to-b from-blue-50/80 to-indigo-50/80 border border-indigo-200/50"
                } shadow-lg w-full max-w-4xl overflow-x-auto`}>
                <svg className="w-full" viewBox="0 0 800 550" xmlns="http://www.w3.org/2000/svg">
                  {/* Legend */}
                  <rect x="20" y="20" width="120" height="50" rx="8" ry="8" 
                    fill={darkMode ? "#1e293b" : "#f8fafc"} 
                    fillOpacity="0.6"
                    stroke={darkMode ? "#475569" : "#cbd5e1"} 
                    strokeWidth="1" />
                  <circle cx="35" cy="38" r="5" 
                    fill={darkMode ? "#22c55e" : "#22c55e"} />
                  <text x="45" y="42" 
                    fill={darkMode ? "#a3e635" : "#15803d"} 
                    fontSize="11">Implemented</text>
                  <circle cx="35" cy="58" r="5" 
                    fill={darkMode ? "#eab308" : "#eab308"} />
                  <text x="45" y="62" 
                    fill={darkMode ? "#fde047" : "#ca8a04"} 
                    fontSize="11">In Development</text>
                    
                  {/* Vertical Lines */}
                  <line x1="150" y1="20" x2="150" y2="530" stroke={darkMode ? "#4b5563" : "#9ca3af"} strokeWidth="2" strokeDasharray="4,4" />
                  <line x1="350" y1="20" x2="350" y2="530" stroke={darkMode ? "#4b5563" : "#9ca3af"} strokeWidth="2" strokeDasharray="4,4" />
                  <line x1="550" y1="20" x2="550" y2="530" stroke={darkMode ? "#4b5563" : "#9ca3af"} strokeWidth="2" strokeDasharray="4,4" />
                  
                  {/* Human */}
                  <rect x="30" y="245" width="100" height="60" rx="8" ry="8" 
                    fill={darkMode ? "#334155" : "#f0f9ff"} 
                    stroke={darkMode ? "#94a3b8" : "#60a5fa"} 
                    strokeWidth="2" />
                  <text x="80" y="280" textAnchor="middle" 
                    fill={darkMode ? "#e2e8f0" : "#1e40af"} 
                    fontWeight="bold" 
                    fontSize="16">HUMAN</text>
                  
                  {/* Computer Use Agent */}
                  <rect x="180" y="245" width="140" height="60" rx="8" ry="8" 
                    fill={darkMode ? "#334155" : "#f0f9ff"} 
                    stroke={darkMode ? "#94a3b8" : "#60a5fa"} 
                    strokeWidth="2" />
                  <text x="250" y="270" textAnchor="middle" 
                    fill={darkMode ? "#e2e8f0" : "#1e40af"} 
                    fontWeight="bold" 
                    fontSize="16">Computer</text>
                  <text x="250" y="290" textAnchor="middle" 
                    fill={darkMode ? "#e2e8f0" : "#1e40af"} 
                    fontWeight="bold" 
                    fontSize="16">Use Agent</text>
                  
                  {/* OS Level */}
                  {/* MacAgent */}
                  <rect x="385" y="100" width="130" height="60" rx="8" ry="8" 
                    fill={darkMode ? "#374151" : "#eff6ff"} 
                    stroke={darkMode ? "#6366f1" : "#3b82f6"} 
                    strokeWidth="2" />
                  <text x="450" y="135" textAnchor="middle" 
                    fill={darkMode ? "#c7d2fe" : "#1d4ed8"} 
                    fontWeight="bold" 
                    fontSize="16">MacAgent</text>
                  <circle cx="500" cy="150" r="5" 
                    fill={darkMode ? "#22c55e" : "#22c55e"} />
                  
                  {/* WindowsAgent */}
                  <rect x="385" y="245" width="130" height="60" rx="8" ry="8" 
                    fill={darkMode ? "#374151" : "#eff6ff"} 
                    fillOpacity="0.7"
                    stroke={darkMode ? "#6366f1" : "#3b82f6"} 
                    strokeWidth="2" 
                    strokeDasharray="5,3" />
                  <text x="450" y="280" textAnchor="middle" 
                    fill={darkMode ? "#c7d2fe" : "#1d4ed8"} 
                    fontWeight="bold" 
                    fontSize="16">WindowsAgent</text>
                  <circle cx="500" cy="295" r="5" 
                    fill={darkMode ? "#eab308" : "#eab308"} />
                  
                  {/* iOSAgent */}
                  <rect x="385" y="390" width="130" height="60" rx="8" ry="8" 
                    fill={darkMode ? "#374151" : "#eff6ff"} 
                    fillOpacity="0.7" 
                    stroke={darkMode ? "#6366f1" : "#3b82f6"} 
                    strokeWidth="2" 
                    strokeDasharray="5,3" />
                  <text x="450" y="425" textAnchor="middle" 
                    fill={darkMode ? "#c7d2fe" : "#1d4ed8"} 
                    fontWeight="bold" 
                    fontSize="16">iOSAgent</text>
                  <circle cx="500" cy="440" r="5" 
                    fill={darkMode ? "#eab308" : "#eab308"} />
                  
                  {/* App Level - Placeholder for iOS */}
                  <rect x="585" y="390" width="190" height="60" rx="8" ry="8" 
                    fill={darkMode ? "#1e293b" : "#f8fafc"} 
                    fillOpacity="0.4"
                    stroke={darkMode ? "#475569" : "#cbd5e1"} 
                    strokeWidth="1" 
                    strokeDasharray="4,4" />
                  <rect x="640" y="405" width="85" height="30" rx="5" ry="5" 
                    fill={darkMode ? "#312e81" : "#e0e7ff"} 
                    fillOpacity="0.7"
                    stroke={darkMode ? "#818cf8" : "#6366f1"} 
                    strokeWidth="1.5" 
                    strokeDasharray="4,2" />
                  <text x="682.5" y="425" textAnchor="middle" 
                    fill={darkMode ? "#c7d2fe" : "#4338ca"} 
                    fontWeight="bold" 
                    fontSize="12">xxxAgent</text>
                  <circle cx="715" cy="413" r="4" 
                    fill={darkMode ? "#eab308" : "#eab308"} />
                  
                  {/* App Level - Category Boxes */}
                  {/* Productivity Suite Category */}
                  <rect x="585" y="40" width="190" height="105" rx="8" ry="8" 
                    fill={darkMode ? "#1e293b" : "#f8fafc"} 
                    fillOpacity="0.4"
                    stroke={darkMode ? "#475569" : "#cbd5e1"} 
                    strokeWidth="1" />
                  <text x="680" y="60" textAnchor="middle" 
                    fill={darkMode ? "#94a3b8" : "#64748b"} 
                    fontWeight="medium" 
                    fontSize="12">PRODUCTIVITY SUITE</text>
                    
                  {/* System Category */}
                  <rect x="585" y="160" width="190" height="55" rx="8" ry="8" 
                    fill={darkMode ? "#1e293b" : "#f8fafc"} 
                    fillOpacity="0.4"
                    stroke={darkMode ? "#475569" : "#cbd5e1"} 
                    strokeWidth="1" />
                  <text x="680" y="180" textAnchor="middle" 
                    fill={darkMode ? "#94a3b8" : "#64748b"} 
                    fontWeight="medium" 
                    fontSize="12">SYSTEM</text>
                    
                  {/* Media Category */}
                  <rect x="585" y="230" width="190" height="130" rx="8" ry="8" 
                    fill={darkMode ? "#1e293b" : "#f8fafc"} 
                    fillOpacity="0.4"
                    stroke={darkMode ? "#475569" : "#cbd5e1"} 
                    strokeWidth="1" />
                  <text x="680" y="250" textAnchor="middle" 
                    fill={darkMode ? "#94a3b8" : "#64748b"} 
                    fontWeight="medium" 
                    fontSize="12">MEDIA & COMMUNICATION</text>
                    
                  {/* Word Agent */}
                  <rect x="595" y="70" width="85" height="30" rx="5" ry="5" 
                    fill={darkMode ? "#312e81" : "#e0e7ff"} 
                    stroke={darkMode ? "#818cf8" : "#6366f1"} 
                    strokeWidth="1.5" />
                  <text x="637.5" y="90" textAnchor="middle" 
                    fill={darkMode ? "#c7d2fe" : "#4338ca"} 
                    fontWeight="bold" 
                    fontSize="12">Word</text>
                    
                  {/* Excel Agent */}
                  <rect x="685" y="70" width="85" height="30" rx="5" ry="5" 
                    fill={darkMode ? "#312e81" : "#e0e7ff"} 
                    stroke={darkMode ? "#818cf8" : "#6366f1"} 
                    strokeWidth="1.5" />
                  <text x="727.5" y="90" textAnchor="middle" 
                    fill={darkMode ? "#c7d2fe" : "#4338ca"} 
                    fontWeight="bold" 
                    fontSize="12">Excel</text>
                    
                  {/* PowerPoint Agent */}
                  <rect x="595" y="105" width="85" height="30" rx="5" ry="5" 
                    fill={darkMode ? "#312e81" : "#e0e7ff"} 
                    stroke={darkMode ? "#818cf8" : "#6366f1"} 
                    strokeWidth="1.5" />
                  <text x="637.5" y="125" textAnchor="middle" 
                    fill={darkMode ? "#c7d2fe" : "#4338ca"} 
                    fontWeight="bold" 
                    fontSize="12">PowerPoint</text>
                    
                  {/* TextEdit Agent */}
                  <rect x="685" y="105" width="85" height="30" rx="5" ry="5" 
                    fill={darkMode ? "#312e81" : "#e0e7ff"} 
                    stroke={darkMode ? "#818cf8" : "#6366f1"} 
                    strokeWidth="1.5" />
                  <text x="727.5" y="125" textAnchor="middle" 
                    fill={darkMode ? "#c7d2fe" : "#4338ca"} 
                    fontWeight="bold" 
                    fontSize="12">TextEdit</text>
                   
                  {/* Finder Agent */}
                  <rect x="640" y="185" width="85" height="30" rx="5" ry="5" 
                    fill={darkMode ? "#312e81" : "#e0e7ff"} 
                    stroke={darkMode ? "#818cf8" : "#6366f1"} 
                    strokeWidth="1.5" />
                  <text x="682.5" y="205" textAnchor="middle" 
                    fill={darkMode ? "#c7d2fe" : "#4338ca"} 
                    fontWeight="bold" 
                    fontSize="12">Finder</text>
                    
                  {/* Preview Agent */}
                  <rect x="595" y="260" width="85" height="30" rx="5" ry="5" 
                    fill={darkMode ? "#312e81" : "#e0e7ff"} 
                    stroke={darkMode ? "#818cf8" : "#6366f1"} 
                    strokeWidth="1.5" />
                  <text x="637.5" y="280" textAnchor="middle" 
                    fill={darkMode ? "#c7d2fe" : "#4338ca"} 
                    fontWeight="bold" 
                    fontSize="12">Preview</text>
                    
                  {/* Player Agent */}
                  <rect x="685" y="260" width="85" height="30" rx="5" ry="5" 
                    fill={darkMode ? "#312e81" : "#e0e7ff"} 
                    stroke={darkMode ? "#818cf8" : "#6366f1"} 
                    strokeWidth="1.5" />
                  <text x="727.5" y="280" textAnchor="middle" 
                    fill={darkMode ? "#c7d2fe" : "#4338ca"} 
                    fontWeight="bold" 
                    fontSize="12">Player</text>
                    
                  {/* Browser Agent */}
                  <rect x="595" y="295" width="85" height="30" rx="5" ry="5" 
                    fill={darkMode ? "#312e81" : "#e0e7ff"} 
                    stroke={darkMode ? "#818cf8" : "#6366f1"} 
                    strokeWidth="1.5" />
                  <text x="637.5" y="315" textAnchor="middle" 
                    fill={darkMode ? "#c7d2fe" : "#4338ca"} 
                    fontWeight="bold" 
                    fontSize="12">Browser</text>
                    
                  {/* WeChat Agent */}
                  <rect x="685" y="295" width="85" height="30" rx="5" ry="5" 
                    fill={darkMode ? "#312e81" : "#e0e7ff"} 
                    stroke={darkMode ? "#818cf8" : "#6366f1"} 
                    strokeWidth="1.5" />
                  <text x="727.5" y="315" textAnchor="middle" 
                    fill={darkMode ? "#c7d2fe" : "#4338ca"} 
                    fontWeight="bold" 
                    fontSize="12">WeChat</text>
                    
                  {/* Calendar Agent */}
                  <rect x="640" y="330" width="85" height="30" rx="5" ry="5" 
                    fill={darkMode ? "#312e81" : "#e0e7ff"} 
                    stroke={darkMode ? "#818cf8" : "#6366f1"} 
                    strokeWidth="1.5" />
                  <text x="682.5" y="350" textAnchor="middle" 
                    fill={darkMode ? "#c7d2fe" : "#4338ca"} 
                    fontWeight="bold" 
                    fontSize="12">Calendar</text>
                  
                  {/* Connectors */}
                  {/* Human to CUA */}
                  <path d="M130 275 H180" stroke={darkMode ? "#94a3b8" : "#60a5fa"} strokeWidth="2" />
                  
                  {/* CUA to OS Agents */}
                  <path d="M320 255 Q335 255 350 130 L385 130" stroke={darkMode ? "#94a3b8" : "#60a5fa"} strokeWidth="2" />
                  <path d="M320 275 Q335 275 350 275 L385 275" stroke={darkMode ? "#94a3b8" : "#60a5fa"} strokeWidth="2" strokeDasharray="4,4" />
                  <path d="M320 295 Q335 295 350 420 L385 420" stroke={darkMode ? "#94a3b8" : "#60a5fa"} strokeWidth="2" strokeDasharray="4,4" />
                  
                  {/* MacAgent to App Categories */}
                  <path d="M515 110 C540 110 560 92 585 92" stroke={darkMode ? "#818cf8" : "#6366f1"} strokeWidth="1.5" />
                  <path d="M515 130 C540 130 560 187 585 187" stroke={darkMode ? "#818cf8" : "#6366f1"} strokeWidth="1.5" />
                  <path d="M515 150 C540 150 560 295 585 295" stroke={darkMode ? "#818cf8" : "#6366f1"} strokeWidth="1.5" />
                  
                  {/* iOSAgent to App Categories */}
                  <path d="M515 420 C540 420 560 420 585 420" stroke={darkMode ? "#818cf8" : "#6366f1"} strokeWidth="1.5" strokeDasharray="4,4" />
                  
                  {/* Level Labels */}
                  <text x="250" y="520" textAnchor="middle" 
                    fill={darkMode ? "#d1d5db" : "#4b5563"} 
                    fontSize="14">User Level</text>
                  <text x="450" y="520" textAnchor="middle" 
                    fill={darkMode ? "#d1d5db" : "#4b5563"} 
                    fontSize="14">OS Level</text>
                  <text x="680" y="520" textAnchor="middle" 
                    fill={darkMode ? "#d1d5db" : "#4b5563"}  
                    fontSize="14">App Level</text>
                </svg>
              </div>
            </div>
            
            <div className={`prose max-w-none ${darkMode ? "prose-invert" : ""}`}>
              <p className={`leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                MacOS Agent is a hierarchical multi-agent system with three key components:
              </p>
              <ul className={`${darkMode ? "text-gray-300" : "text-gray-700"} space-y-2 list-disc pl-6 mt-2`}>
                <li>
                  <span className={`${darkMode ? "text-blue-300" : "text-blue-600"} font-medium`}>ComputerUse Agent:</span> The top-level agent that interfaces with human users. It receives natural language instructions and generates high-level execution plans, which are then forwarded to the MacAgent. This agent operates at an abstract level without direct access to application controls.
                </li>
                <li>
                  <span className={`${darkMode ? "text-blue-300" : "text-blue-600"} font-medium`}>MacAgent:</span> The central coordinator that receives plans from the ComputerUse Agent. It analyzes these plans and determines the optimal execution strategy by:
                  <ul className="ml-6 space-y-1 mt-2">
                    <li>Identifying which app agents are needed</li>
                    <li>Generating executable code to orchestrate these agents</li>
                    <li>Managing the reactive workflow between different app agents</li>
                  </ul>
                </li>
                <li>
                  <span className={`${darkMode ? "text-blue-300" : "text-blue-600"} font-medium`}>App Agents:</span> A collection of nine specialized agents that directly interface with macOS applications:
                  <ul className="ml-6 space-y-1 mt-2">
                    <li><span className="font-medium">Document Processing:</span> Word Agent, TextEdit Agent</li>
                    <li><span className="font-medium">Data & Presentations:</span> Excel Agent, PowerPoint Agent</li>
                    <li><span className="font-medium">System & Navigation:</span> Finder Agent, Browser Agent</li>
                    <li><span className="font-medium">Media & Communication:</span> Preview Agent, QuickTime Agent, WeChat Agent, Calendar Agent</li>
                  </ul>
                </li>
              </ul>
              <p className={`mt-4 leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                This architecture enables sophisticated task execution through coordinated agent interactions. The MacAgent's ability to dynamically orchestrate app agents allows for complex workflows while maintaining clear separation of concerns between planning and execution.
              </p>
            </div>
          </div>
        </section>
        
        {/* Trace Carousel Section */}
        <section className={`mt-12 mb-20 ${
          darkMode 
            ? "bg-white/5 border border-white/10" 
            : "bg-white border border-gray-200"
          } rounded-2xl shadow-xl p-6`}
        >
          <h2 className={`text-2xl font-bold mb-8 ${
            darkMode 
              ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400" 
              : "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
          }`}>
            Agent Execution Traces
          </h2>

          {/* Task Display Component in the red box area */}
          <TaskDisplay 
            traceData={allTraceData.length > 0 ? allTraceData[activeTraceIndex] : null} 
            darkMode={darkMode}
          />

          <div className="mb-4">
            <TraceCarousel 
              traceDatas={allTraceData} 
              ids={traceIds} 
              autoplay={true}
              autoplayInterval={8000}
              onActiveIndexChange={setActiveTraceIndex}
            />
          </div>
          
          {/* <div className={`mt-6 ${darkMode ? "text-gray-300" : "text-gray-600"} text-sm leading-relaxed`}>
            <p>Move your mouse over the carousel to see the 3D rotation effect. Use the buttons to navigate between different traces or use keyboard arrow keys. Auto-rotation will pause while you interact with the carousel.</p>
          </div> */}
        </section>
        

        
        {/* BibTeX Citation Section */}
        <section className={`mt-16 ${
          darkMode 
            ? "bg-white/5 border border-white/10" 
            : "bg-white border border-gray-200"
          } rounded-2xl shadow-xl p-6`}
        >
          <h2 className={`text-xl font-bold mb-4 ${
            darkMode 
              ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400" 
              : "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
          }`}>
            Citation
          </h2>
          
          <div className={`${
            darkMode 
              ? "bg-slate-800/80 border border-slate-700" 
              : "bg-gray-50 border border-gray-200"
            } rounded-lg p-4 font-mono text-sm overflow-x-auto`}
          >
            <pre className={darkMode ? "text-gray-300" : "text-gray-700"}>
{`@article{zhang2025tongui,
  title={TongUI: Building Generalized GUI Agents by Learning from Multimodal Web Tutorials},
  author={Zhang, Bofei and Shang, Zirui and Gao, Zhi and Zhang, Wang and Xie, Rui and Ma, Xiaojian and Yuan, Tao and Wu, Xinxiao and Zhu, Song-Chun and Li, Qing},
  journal={arXiv preprint arXiv:2504.12679},
  year={2025}
}

@article{li2025iterative,
  title={Iterative Trajectory Exploration for Multimodal Agents},
  author={Li, Pengxiang and Gao, Zhi and Zhang, Bofei and Mi, Yapeng and Ma, Xiaojian and Shi, Chenrui and Yuan, Tao and Wu, Yuwei and Jia, Yunde and Zhu, Song-Chun and others},
  journal={arXiv preprint arXiv:2504.21561},
  year={2025}
}`}
            </pre>
          </div>
          
          <button
            onClick={() => {
              navigator.clipboard.writeText(`@article{zhang2025tongui,
  title={TongUI: Building Generalized GUI Agents by Learning from Multimodal Web Tutorials},
  author={Zhang, Bofei and Shang, Zirui and Gao, Zhi and Zhang, Wang and Xie, Rui and Ma, Xiaojian and Yuan, Tao and Wu, Xinxiao and Zhu, Song-Chun and Li, Qing},
  journal={arXiv preprint arXiv:2504.12679},
  year={2025}
}

@article{li2025iterative,
  title={Iterative Trajectory Exploration for Multimodal Agents},
  author={Li, Pengxiang and Gao, Zhi and Zhang, Bofei and Mi, Yapeng and Ma, Xiaojian and Shi, Chenrui and Yuan, Tao and Wu, Yuwei and Jia, Yunde and Zhu, Song-Chun and others},
  journal={arXiv preprint arXiv:2504.21561},
  year={2025}
}`);
            }}
            className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-lg ${
              darkMode
                ? "bg-blue-600/60 hover:bg-blue-600/80 text-white"
                : "bg-blue-100 hover:bg-blue-200 text-blue-700"
            } transition-colors`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy to Clipboard
          </button>
        </section>
        
        <footer className={`mt-20 text-center text-sm ${darkMode ? "text-gray-500" : "text-gray-600"}`}>
          <p>Computer Use Agent - macOS Agent | The Next Generation of Intelligent Desktop Automation</p>
          <p className="mt-2">Developed by <span className="font-semibold">BIGAI-ML</span></p>
        </footer>
      
      </div>
    </main>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { TraceItem } from '../types/trace';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import VideoPlayer from './VideoPlayer';

interface TimelineProps {
  items: TraceItem[];
  selectedItem: TraceItem | null;
  onItemSelect: (item: TraceItem) => void;
  activeItemIndex?: number; // 当前活动项的索引
  onVideoTimeUpdate?: (time: number) => void; // 新增：视频时间更新回调
  videoCurrentTime?: number;
  videoIsPlaying?: boolean;
  onVideoPlay?: () => void;
  onVideoPause?: () => void;
  onVideoSeeked?: (time: number) => void;
}

// 递归渲染 JSON，遇到字符串时自动高亮代码块
function renderJsonWithCodeBlocks(obj: any, parentKey?: string): React.ReactNode {
  if (typeof obj === 'string') {
    // 检查是否为代码块
    const codeBlockMatch = obj.match(/```(\w+)?\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      const lang = codeBlockMatch[1] || 'python';
      const code = codeBlockMatch[2].replace(/\n/g, '\n');
      return (
        <SyntaxHighlighter language={lang} style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 13, margin: 0 }}>
          {code}
        </SyntaxHighlighter>
      );
    }
    // 普通字符串
    return <span className="whitespace-pre-wrap break-words text-gray-800">{obj}</span>;
  } else if (Array.isArray(obj)) {
    return (
      <ul className="pl-4 list-disc text-xs text-gray-700">
        {obj.map((item, idx) => (
          <li key={idx}>{renderJsonWithCodeBlocks(item)}</li>
        ))}
      </ul>
    );
  } else if (typeof obj === 'object' && obj !== null) {
    return (
      <div className="pl-2 border-l-2 border-gray-200 my-1 text-xs">
        {Object.entries(obj).map(([k, v], idx) => (
          <div key={idx} className="mb-1">
            <span className="font-semibold text-blue-700 mr-1">{k}:</span>
            {k === 'code' && typeof v === 'string'
              ? (() => {
                  const codeBlockMatch = v.match(/```(\w+)?\n([\s\S]*?)```/);
                  if (codeBlockMatch) {
                    const lang = codeBlockMatch[1] || 'python';
                    const code = codeBlockMatch[2].replace(/\n/g, '\n');
                    return (
                      <SyntaxHighlighter language={lang} style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 13, margin: 0 }}>
                        {code}
                      </SyntaxHighlighter>
                    );
                  } else {
                    return (
                      <SyntaxHighlighter language="python" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 13, margin: 0 }}>
                        {v}
                      </SyntaxHighlighter>
                    );
                  }
                })()
              : renderJsonWithCodeBlocks(v, k)
            }
          </div>
        ))}
      </div>
    );
  }
  return String(obj);
}

function renderAction(action: string): React.ReactNode {
  // 尝试解析为 JSON
  try {
    const obj = JSON.parse(action);
    return renderJsonWithCodeBlocks(obj);
  } catch {
    // 检查是否为 markdown 代码块
    const codeBlockMatch = action.match(/```(py|python)?\\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      const lang = codeBlockMatch[1] || 'python';
      const code = codeBlockMatch[2].replace(/\\n/g, '\n');
      return (
        <SyntaxHighlighter language={lang} style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 13, margin: 0 }}>
          {code}
        </SyntaxHighlighter>
      );
    }
    // 普通文本
    return <span className="whitespace-pre-wrap break-words text-gray-800">{action}</span>;
  }
}

// 美化 thought 区域
function renderThought(thought: string): React.ReactNode {
  // 尝试格式化 JSON
  try {
    const obj = JSON.parse(thought);
    return renderJsonWithCodeBlocks(obj);
  } catch {
    // 普通文本
    return <span className="whitespace-pre-wrap break-words text-gray-700">{thought}</span>;
  }
}

export default function Timeline({ items, selectedItem, onItemSelect, activeItemIndex, onVideoTimeUpdate, videoCurrentTime, videoIsPlaying, onVideoPlay, onVideoPause, onVideoSeeked }: TimelineProps) {
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const timelineRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleImageError = (timestamp: string) => {
    setImageError(prev => ({ ...prev, [timestamp]: true }));
  };

  // 滚动到活动项
  useEffect(() => {
    if (activeItemIndex !== undefined && 
        activeItemIndex >= 0 && 
        activeItemIndex < items.length && 
        itemRefs.current[activeItemIndex] && 
        timelineRef.current) {
      const itemElement = itemRefs.current[activeItemIndex];
      const containerElement = timelineRef.current;
      
      if (itemElement) {
        // 计算应滚动位置，使项目居中
        const itemTop = itemElement.offsetTop;
        const itemHeight = itemElement.offsetHeight;
        const containerHeight = containerElement.offsetHeight;
        const scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
        
        // 平滑滚动到目标位置
        containerElement.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      }
    }
  }, [activeItemIndex, items.length]);

  return (
    <div ref={timelineRef} className="p-8 h-full overflow-y-auto">
      {items.map((item, index) => (
        <div
          key={item.timestamp}
          ref={(el) => { itemRefs.current[index] = el; }}
          className={`mb-8 cursor-pointer rounded-lg border p-4 transition-all hover:shadow-lg flex flex-row gap-0 bg-white/90 items-stretch ${
            index === activeItemIndex
              ? 'border-blue-500 bg-blue-50 shadow-lg'
              : selectedItem?.timestamp === item.timestamp
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200'
          }`}
          onClick={() => onItemSelect(item)}
        >
          {/* 左侧截图+视频 */}
          <div className="flex flex-col basis-1/2 flex-1 pr-2 gap-3 h-full bg-white rounded-lg">
            {/* 截图标题 */}
            <div className="text-xs font-semibold text-blue-700 bg-blue-50 rounded-t-md px-2 py-1 border border-b-0 border-blue-100 text-center">Agent's View</div>
            <div className="w-full h-44 rounded-b-lg overflow-hidden bg-gray-200 flex items-center justify-center shadow border border-t-0 border-blue-100">
              {imageError[item.timestamp] ? (
                <div className="text-gray-400 text-xs text-center">图片加载失败<br />{item.screenshot}</div>
              ) : (
                <img
                  src={item.screenshot}
                  alt={`Screenshot at ${item.timestamp}`}
                  className="w-full h-full object-contain"
                  onError={() => handleImageError(item.timestamp)}
                />
              )}
            </div>
            {/* 视频标题和播放器 */}
            {item.video && (
              <>
                <div className="text-xs font-semibold text-purple-700 bg-purple-50 rounded-t-md px-2 py-1 border border-b-0 border-purple-100 text-center mt-2">Screen Recording</div>
                <div className="w-full h-64 rounded-b-lg overflow-hidden bg-black flex items-center justify-center shadow border border-t-0 border-purple-100">
                  <video
                    src={item.video}
                    controls
                    className="w-full h-full object-contain bg-black"
                    onTimeUpdate={e => onVideoTimeUpdate && onVideoTimeUpdate((e.target as HTMLVideoElement).currentTime)}
                    onPlay={onVideoPlay}
                    onPause={onVideoPause}
                    onSeeked={e => onVideoSeeked && onVideoSeeked((e.target as HTMLVideoElement).currentTime)}
                    ref={el => {
                      if (el) {
                        if (el.playbackRate !== 2) el.playbackRate = 2;
                        if (typeof videoCurrentTime === 'number' && Math.abs(el.currentTime - videoCurrentTime) > 0.2) {
                          el.currentTime = videoCurrentTime;
                        }
                        if (typeof videoIsPlaying === 'boolean') {
                          if (videoIsPlaying && el.paused) el.play().catch(() => {});
                          if (!videoIsPlaying && !el.paused) el.pause();
                        }
                      }
                    }}
                    style={{ background: 'black' }}
                  />
                </div>
              </>
            )}
          </div>

          {/* 右侧内容 */}
          <div className="flex flex-col basis-1/2 flex-1 pl-2 min-w-0 h-full bg-white rounded-lg gap-2">
            <div className="mb-2 text-xs text-gray-500 flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <span>{new Date(item.timestamp).toLocaleString()}</span>
                {item.agent && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {item.agent}
                  </span>
                )}
              </div>
              <span className="text-blue-600">
                {item.timeRange.start}s - {item.timeRange.end}s
              </span>
            </div>
            <div className="flex flex-col gap-2 w-full h-full">
              <div className="flex flex-col min-w-0 text-gray-700">
                <h3 className="mb-2 flex items-center gap-2 text-base font-bold">
                  <span className="inline-block w-1.5 h-5 rounded bg-blue-400 mr-1"></span>
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Thought</span>
                </h3>
                <div className="max-h-40 overflow-auto rounded bg-white/80 border border-gray-100 p-2 text-xs shadow-inner">
                  {renderThought(item.thought)}
                </div>
              </div>
              <div className="flex flex-col flex-1 min-w-0 text-gray-700">
                <h3 className="mb-2 flex items-center gap-2 text-base font-bold">
                  <span className="inline-block w-1.5 h-5 rounded bg-purple-400 mr-1"></span>
                  <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">Action</span>
                </h3>
                <div className="h-full overflow-auto rounded bg-gray-50 border border-gray-200 p-2 text-xs shadow-inner">
                  {renderAction(item.action)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 
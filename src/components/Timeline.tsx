import React, { useState, useRef, useEffect } from 'react';
import { TraceItem } from '../types/trace';

interface TimelineProps {
  items: TraceItem[];
  selectedItem: TraceItem | null;
  onItemSelect: (item: TraceItem) => void;
  activeItemIndex?: number; // 当前活动项的索引
}

export default function Timeline({ items, selectedItem, onItemSelect, activeItemIndex }: TimelineProps) {
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
    <div ref={timelineRef} className="p-4 h-full overflow-y-auto">
      {items.map((item, index) => (
        <div
          key={item.timestamp}
          ref={(el) => { itemRefs.current[index] = el; }}
          className={`mb-6 cursor-pointer rounded-lg border p-4 transition-all hover:shadow-lg ${
            index === activeItemIndex
              ? 'border-blue-500 bg-blue-50 shadow-lg'
              : selectedItem?.timestamp === item.timestamp
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200'
          }`}
          onClick={() => onItemSelect(item)}
        >
          <div className="mb-3 text-sm text-gray-500 flex justify-between">
            <span>{new Date(item.timestamp).toLocaleString()}</span>
            <span className="text-blue-600">
              {item.timeRange.start}s - {item.timeRange.end}s
            </span>
          </div>
          
          <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg bg-gray-200">
            {imageError[item.timestamp] ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
                <div className="text-center">
                  <div className="mb-2">图片加载失败</div>
                  <div className="text-xs text-gray-400">路径: {item.screenshot}</div>
                </div>
              </div>
            ) : (
              <img
                src={item.screenshot}
                alt={`Screenshot at ${item.timestamp}`}
                className="w-full h-full object-contain"
                onError={() => handleImageError(item.timestamp)}
              />
            )}
          </div>
          
          <div className="text-gray-700">
            <h3 className="mb-2 font-semibold">Agent's Thought:</h3>
            <p className="text-sm">{item.thought}</p>
          </div>
          
          <div className="text-gray-700 mt-4">
            <h3 className="mb-2 font-semibold">Action:</h3>
            <p className="text-sm">{item.action}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 
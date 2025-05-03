import React, { useState, useRef, useEffect } from 'react';
import { TraceData, TraceItem } from '../types/trace';
import Timeline from './Timeline';
import VideoPlayer from './VideoPlayer';

interface TraceViewerProps {
  data: TraceData;
  id?: string; // 添加可选的id属性用于区分不同实例
}

export default function TraceViewer({ data, id = 'default' }: TraceViewerProps) {
  const [selectedItem, setSelectedItem] = useState<TraceItem | null>(
    data.items.length > 0 ? data.items[0] : null
  );
  
  // 添加当前视频时间状态
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  // 添加当前活动项的索引状态
  const [activeItemIndex, setActiveItemIndex] = useState<number | undefined>(
    data.items.length > 0 ? 0 : undefined
  );
  
  // 添加分隔线位置状态，默认为30%(3:7比例)
  const [splitPosition, setSplitPosition] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理拖动开始
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // 处理拖动过程
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;
      
      // 计算百分比，并限制在20%到80%之间
      const newSplitPosition = Math.min(80, Math.max(20, (mouseX / containerWidth) * 100));
      setSplitPosition(newSplitPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // 视频时间更新处理函数
  const handleVideoTimeUpdate = (time: number) => {
    setCurrentVideoTime(time);
    
    // 查找当前时间对应的轨迹项
    const newActiveIndex = data.items.findIndex(
      item => time >= item.timeRange.start && time < item.timeRange.end
    );
    
    if (newActiveIndex !== -1 && newActiveIndex !== activeItemIndex) {
      setActiveItemIndex(newActiveIndex);
      // 自动选择当前活动项
      setSelectedItem(data.items[newActiveIndex]);
    }
  };

  return (
    <div ref={containerRef} className="flex h-full bg-gray-100 relative" data-id={id}>
      {/* Timeline section */}
      <div 
        className="overflow-y-auto border-r border-gray-200 bg-white"
        style={{ width: `${splitPosition}%` }}
      >
        <Timeline 
          items={data.items} 
          selectedItem={selectedItem} 
          onItemSelect={setSelectedItem} 
          activeItemIndex={activeItemIndex}
        />
      </div>

      {/* Resizable divider */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize z-10 flex items-center justify-center"
        style={{ left: `${splitPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
      >
        <div className="h-16 w-4 rounded-full flex items-center justify-center">
          <div className="h-10 w-0.5 bg-gray-500"></div>
          <div className="h-10 w-0.5 bg-gray-500 mx-0.5"></div>
          <div className="h-10 w-0.5 bg-gray-500"></div>
        </div>
      </div>

      {/* Video section */}
      <div 
        className="overflow-hidden"
        style={{ width: `${100 - splitPosition}%` }}
      >
        {selectedItem && (
          <VideoPlayer 
            videoUrl={selectedItem.video} 
            onTimeUpdate={handleVideoTimeUpdate}
          />
        )}
        
        {/* 显示当前时间 */}
        <div className="p-2 bg-gray-800 text-white text-center">
          当前时间: {currentVideoTime.toFixed(2)}秒 
          {activeItemIndex !== undefined && ` | 显示轨迹项: #${activeItemIndex + 1}`}
        </div>
      </div>
    </div>
  );
} 
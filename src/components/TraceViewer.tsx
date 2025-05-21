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
  
  // 全局视频同步状态
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // 添加当前活动项的索引状态
  const [activeItemIndex, setActiveItemIndex] = useState<number | undefined>(
    data.items.length > 0 ? 0 : undefined
  );
  
  // 添加分隔线位置状态，默认为75%(3:1比例)
  const [splitPosition, setSplitPosition] = useState(75);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const [isCarouselPlaying, setIsCarouselPlaying] = useState(true);
  const [carouselInterval, setCarouselInterval] = useState(120000);

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
      
      // 计算百分比，并限制在30%到85%之间
      const newSplitPosition = Math.min(85, Math.max(30, (mouseX / containerWidth) * 100));
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
    setCurrentTime(time);
    
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

  // 视频播放/暂停/seek 事件
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleSeeked = (time: number) => setCurrentTime(time);

  return (
    <div ref={containerRef} className="h-full min-h-[800px] bg-gray-100 relative" data-id={id}>
      <Timeline 
        items={data.items} 
        selectedItem={selectedItem} 
        onItemSelect={setSelectedItem} 
        activeItemIndex={activeItemIndex}
        onVideoTimeUpdate={handleVideoTimeUpdate}
        videoCurrentTime={currentTime}
        videoIsPlaying={isPlaying}
        onVideoPlay={handlePlay}
        onVideoPause={handlePause}
        onVideoSeeked={handleSeeked}
      />
    </div>
  );
} 
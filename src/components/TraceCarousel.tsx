import React, { useState, useRef, useEffect } from 'react';
import { TraceData } from '../types/trace';
import TraceViewer from './TraceViewer';

interface TraceCarouselProps {
  traceDatas: TraceData[];
  ids?: string[];
  autoplay?: boolean;
  autoplayInterval?: number;
  onActiveIndexChange?: (index: number) => void;
}

export default function TraceCarousel({ 
  traceDatas, 
  ids = [],
  autoplay = true,
  autoplayInterval = 10000,
  onActiveIndexChange
}: TraceCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoplay);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate IDs if not provided
  const viewerIds = ids.length === traceDatas.length 
    ? ids 
    : traceDatas.map((_, index) => `viewer-${index}`);

  // Notify parent when activeIndex changes
  useEffect(() => {
    if (onActiveIndexChange) {
      onActiveIndexChange(activeIndex);
    }
  }, [activeIndex, onActiveIndexChange]);

  // Navigate to previous trace
  const prevTrace = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex((prevIndex) => 
        prevIndex === 0 ? traceDatas.length - 1 : prevIndex - 1
      );
      setIsTransitioning(false);
    }, 300);
  };

  // Navigate to next trace
  const nextTrace = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex((prevIndex) => 
        (prevIndex + 1) % traceDatas.length
      );
      setIsTransitioning(false);
    }, 300);
  };

  // Go to specific trace
  const goToTrace = (index: number) => {
    if (isTransitioning || index === activeIndex) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  // Toggle autoplay
  const toggleAutoplay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevTrace();
      } else if (e.key === 'ArrowRight') {
        nextTrace();
      } else if (e.key === 'Space' || e.key === ' ') {
        toggleAutoplay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTransitioning, isAutoPlaying]);

  // Autoplay effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isAutoPlaying && traceDatas.length > 1) {
      interval = setInterval(() => {
        // Check if any video is currently playing before switching
        const videoElements = document.querySelectorAll('video');
        const isAnyVideoPlaying = Array.from(videoElements).some(video => !video.paused);
        
        if (!isAnyVideoPlaying) {
          nextTrace();
        }
      }, autoplayInterval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlaying, activeIndex, traceDatas.length, autoplayInterval]);

  // Remove the video play/pause event listeners since we don't need them anymore
  // Clean up autoplay timer on unmount
  useEffect(() => {
    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative pb-16">
      <div className="relative w-full h-[800px] overflow-hidden rounded-3xl border-4 border-blue-200 p-6 shadow-2xl bg-white">
        {/* Carousel container */}
        <div className="w-full h-full relative">
          {traceDatas.map((data, index) => {
            const isActive = index === activeIndex;
            
            return (
              <div
                key={viewerIds[index]}
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <div className="w-full h-full">
                  <TraceViewer data={data} id={viewerIds[index]} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Trace information and controls */}
        <div className="absolute -top-12 left-4 right-4 flex justify-between items-center z-50">
          <div className="bg-black/50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <span>Trace {activeIndex + 1} of {traceDatas.length}</span>
            <button 
              onClick={toggleAutoplay} 
              className={`ml-2 p-1 rounded-full transition-colors ${
                isAutoPlaying ? 'bg-green-500 text-white' : 'bg-gray-500 text-white/80'
              }`}
              aria-label={isAutoPlaying ? 'Pause autoplay' : 'Start autoplay'}
            >
              {isAutoPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-3 z-50">
        <button
          onClick={prevTrace}
          disabled={isTransitioning}
          className="bg-blue-600/80 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
          aria-label="Previous trace"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {traceDatas.map((_, index) => (
          <button
            key={`dot-${index}`}
            onClick={() => goToTrace(index)}
            disabled={isTransitioning || index === activeIndex}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? 'bg-blue-600 scale-125' 
                : 'bg-gray-400 hover:bg-gray-600'
            }`}
            aria-label={`Go to trace ${index + 1}`}
          />
        ))}
        
        <button
          onClick={nextTrace}
          disabled={isTransitioning}
          className="bg-blue-600/80 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
          aria-label="Next trace"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
} 
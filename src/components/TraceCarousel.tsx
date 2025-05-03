import React, { useState, useRef, useEffect } from 'react';
import { TraceData } from '../types/trace';
import TraceViewer from './TraceViewer';

interface TraceCarouselProps {
  traceDatas: TraceData[];
  ids?: string[];
  autoplay?: boolean;
  autoplayInterval?: number;
}

export default function TraceCarousel({ 
  traceDatas, 
  ids = [],
  autoplay = true,
  autoplayInterval = 10000
}: TraceCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoplay);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate IDs if not provided
  const viewerIds = ids.length === traceDatas.length 
    ? ids 
    : traceDatas.map((_, index) => `viewer-${index}`);
  
  // Handle mouse movement to control rotation
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isTransitioning) return;
    setIsUserInteracting(true);
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle based on mouse position relative to center
    const angleX = ((e.clientX - centerX) / (rect.width / 2)) * 8; // Max 8 degrees rotation
    const angleY = ((e.clientY - centerY) / (rect.height / 2)) * 5; // Max 5 degrees tilt
    
    setRotation(angleX);
    setTiltY(angleY);

    // Reset user interaction state after 3 seconds of inactivity
    resetUserInteractionTimeout();
  };

  // Reset user interaction after delay
  const resetUserInteractionTimeout = () => {
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
    }
    
    autoplayTimerRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 3000);
  };

  // Reset rotation when mouse leaves
  const handleMouseLeave = () => {
    setRotation(0);
    setTiltY(0);
    setIsUserInteracting(false);
    
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
    }
  };

  // Navigate to previous trace
  const prevTrace = () => {
    if (isTransitioning) return;
    
    setIsUserInteracting(true);
    resetUserInteractionTimeout();
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
    
    setIsUserInteracting(true);
    resetUserInteractionTimeout();
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
    
    setIsUserInteracting(true);
    resetUserInteractionTimeout();
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
    
    if (isAutoPlaying && !isUserInteracting && traceDatas.length > 1) {
      interval = setInterval(() => {
        nextTrace();
      }, autoplayInterval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlaying, isUserInteracting, activeIndex, traceDatas.length]);

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
      <div 
        ref={containerRef}
        className="relative w-full h-[600px] overflow-hidden rounded-xl shadow-2xl"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Carousel container with 3D effect */}
        <div className="w-full h-full relative perspective-1000">
          {traceDatas.map((data, index) => {
            // Calculate styles based on position relative to active index
            const isActive = index === activeIndex;
            const offset = index - activeIndex;
            
            // Handle wraparound for better visual effect
            const wrappedOffset = offset > traceDatas.length / 2 
              ? offset - traceDatas.length 
              : offset < -traceDatas.length / 2 
                ? offset + traceDatas.length 
                : offset;
            
            // Calculate z-index to ensure proper stacking
            const zIndex = isActive ? traceDatas.length : traceDatas.length - Math.abs(wrappedOffset);
            
            // Calculate transform for 3D effect
            // Active element - rotates with mouse movement
            // Inactive elements - positioned to sides based on their relation to active
            let transform = isActive 
              ? `rotateY(${rotation}deg) rotateX(${-tiltY}deg) translateZ(0)`
              : `rotateY(${rotation + (wrappedOffset * 25)}deg) translateZ(${-250}px) translateX(${wrappedOffset * 200}px)`;
            
            // Apply additional scaling for distance effect
            const scale = isActive ? 1 : 1 - Math.min(0.3, Math.abs(wrappedOffset) * 0.15);
            transform += ` scale(${scale})`;
            
            // Calculate opacity based on distance
            const opacity = isActive ? 1 : Math.max(0.2, 0.8 - Math.abs(wrappedOffset) * 0.2);
            
            // Only render traces that would be visible (performance optimization)
            const isVisible = Math.abs(wrappedOffset) <= 2;
            
            if (!isVisible) return null;
            
            return (
              <div
                key={viewerIds[index]}
                className={`absolute top-0 left-0 w-full h-full transition-3d ${
                  isTransitioning ? 'duration-300' : 'duration-500'
                }`}
                style={{
                  zIndex,
                  transform,
                  opacity,
                  filter: isActive ? 'none' : `blur(${Math.min(4, Math.abs(wrappedOffset) * 2)}px)`,
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
              >
                <div className={`w-full h-full ${isActive && 'shadow-2xl'}`}>
                  <TraceViewer data={data} id={viewerIds[index]} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Trace information and controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50">
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
          {/* <div className="bg-blue-600/80 text-white px-4 py-2 rounded-lg text-sm flex items-center">
            <div className="h-2 w-2 rounded-full bg-white mr-2 animate-pulse"></div>
            <span>Move mouse to rotate view</span>
          </div> */}
        </div>
      </div>

      {/* Navigation controls - now outside the main carousel container */}
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
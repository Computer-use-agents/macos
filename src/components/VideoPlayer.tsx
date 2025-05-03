import React, { useRef, useEffect, useState } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
}

export default function VideoPlayer({ videoUrl, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setError(null);
    }
  }, [videoUrl]);

  const handleError = () => {
    setError(`Error loading video: ${videoUrl}`);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  return (
    <div className="h-full w-full bg-black p-4 flex items-center justify-center">
      {error ? (
        <div className="text-white text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <p>Please check that the video file exists in the correct location.</p>
          <p className="mt-4 text-sm text-gray-400">Path: {videoUrl}</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          className="h-full w-full max-h-[80vh]"
          controls
          autoPlay
          playsInline
          onError={handleError}
          onTimeUpdate={handleTimeUpdate}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
} 
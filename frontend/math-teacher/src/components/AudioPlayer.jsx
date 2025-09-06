import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

const AudioPlayer = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', () => setIsPlaying(false));

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (audio) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const newTime = (clickX / width) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="audio-player flex items-center space-x-3">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        className="flex items-center justify-center w-8 h-8 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>

      {/* Progress Bar */}
      <div className="flex-1">
        <div
          className="w-full h-2 bg-white bg-opacity-20 rounded-full cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-white bg-opacity-60 rounded-full transition-all duration-100"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Time Display */}
      <div className="text-xs opacity-75 min-w-0">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      {/* Volume Icon */}
      <Volume2 className="w-4 h-4 opacity-75" />
    </div>
  );
};

export default AudioPlayer;



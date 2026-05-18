import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

const TRACKS = [
  { id: 1, title: 'SYS_BOOT_SEQUENCE', artist: 'AI // 01', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'MEMORY_LEAK', artist: 'AI // 02', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'KERNEL_PANIC', artist: 'AI // 03', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.4); 
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(err => console.error("Playback error:", err));
      }
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => console.error("Playback error:", err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className="w-full flex md:flex-row flex-col items-center justify-between gap-4 font-vt p-2 border-2 border-magenta bg-void shadow-[4px_4px_0px_#00ffff]">
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={playNext}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        preload="metadata"
      />

      <div className="flex items-center gap-4 md:w-1/3 w-full">
        <div className="w-12 h-12 bg-magenta flex items-center justify-center border-2 border-cyan relative shrink-0">
          <div className="w-6 h-6 border-2 border-void flex items-center justify-center">
             <div className={`w-2 h-2 ${isPlaying ? 'bg-cyan animate-pulse' : 'bg-void'}`}></div>
          </div>
        </div>
        <div className="overflow-hidden min-w-0">
          <p className="text-sm font-pixel text-cyan truncate glitch" data-text={currentTrack.title}>{currentTrack.title}</p>
          <p className="text-xs uppercase text-magenta tracking-widest truncate mt-1">{currentTrack.artist}</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 md:w-1/3 w-full">
        <div className="flex items-center gap-6">
          <button onClick={playPrev} className="text-cyan hover:text-white transition-colors border-2 border-transparent hover:border-cyan p-1">
            <SkipBack size={20} className="fill-current" />
          </button>
          
          <button onClick={togglePlay} className="px-4 py-2 bg-cyan text-void font-pixel text-[10px] uppercase border-2 border-magenta hover:bg-magenta hover:text-cyan hover:border-cyan transition-colors shadow-[2px_2px_0px_#ff00ff]">
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </button>
          
          <button onClick={playNext} className="text-cyan hover:text-white transition-colors border-2 border-transparent hover:border-cyan p-1">
            <SkipForward size={20} className="fill-current" />
          </button>
        </div>
        
        <div className="w-full flex items-center gap-3">
          <span className="text-xs text-magenta">{formatTime(currentTime)}</span>
          <div className="flex-1 h-3 border-2 border-cyan bg-void relative">
            <input 
              type="range" 
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
            />
            <div className="h-full bg-magenta border-r-2 border-cyan" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}></div>
          </div>
          <span className="text-xs text-magenta">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="md:flex items-center justify-end gap-4 w-1/3 hidden">
        <div className="flex items-center gap-2 border-2 border-cyan p-1">
           <button onClick={toggleMute} className="text-cyan hover:text-magenta">
             {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
           </button>
           <input 
             type="range" 
             min="0" 
             max="1" 
             step="0.01" 
             value={isMuted ? 0 : volume}
             onChange={(e) => {
               setVolume(parseFloat(e.target.value));
               if (parseFloat(e.target.value) > 0) setIsMuted(false);
             }}
             className="w-16 h-2 appearance-none bg-void border border-magenta outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan cursor-pointer"
           />
        </div>
        <div className="px-2 py-1 bg-magenta text-void font-pixel text-[8px] uppercase">
          TRK:{currentTrackIndex + 1}/{TRACKS.length}
        </div>
      </div>
    </div>
  );
}

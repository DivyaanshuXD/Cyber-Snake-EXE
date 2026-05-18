import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { Terminal } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-void text-cyan relative overflow-hidden flex flex-col font-vt border-8 border-magenta p-1 screen-tear-periodic">
      
      <div className="absolute inset-0 z-0 scanlines" />
      <div className="absolute inset-0 z-0 static-noise" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="h-24 flex items-center justify-between px-8 bg-void border-b-4 border-cyan">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-magenta flex items-center justify-center border-2 border-cyan">
              <Terminal className="text-void" size={32} />
            </div>
            <h1 className="text-2xl lg:text-3xl font-pixel uppercase text-cyan glitch" data-text="CYBER_SNAKE.EXE">
              CYBER_SNAKE.EXE
            </h1>
          </div>
        </header>

        <div className="md:hidden block w-full p-2 border-b-4 border-magenta bg-void z-30">
          <MusicPlayer />
        </div>

        <main className="flex-1 flex flex-col justify-center items-center p-4 relative z-20">
          <SnakeGame />
        </main>

        <footer className="w-full bg-void border-t-4 border-cyan z-20 flex p-4 mt-auto">
          <div className="w-full flex items-center justify-center md:justify-between px-4 max-w-5xl mx-auto">
            <div className="hidden md:block w-full">
              <MusicPlayer />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

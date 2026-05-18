import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;

type Point = { x: number; y: number };

const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    const isOnSnake = snake.some(s => s.x === newFood.x && s.y === newFood.y);
    if (!isOnSnake) break;
  }
  return newFood;
};

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'>('START');
  const [shake, setShake] = useState(false);

  const engine = useRef({
    snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
    dir: { x: 0, y: -1 },
    buffer: [] as Point[],
    food: { x: 15, y: 5 },
    lastTick: 0,
    speed: 130,
    particles: [] as { x: number, y: number, vx: number, vy: number, life: number, maxLife: number, color: string }[],
  });

  const initGame = useCallback(() => {
    engine.current = {
      snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
      dir: { x: 0, y: -1 },
      buffer: [],
      food: generateFood([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]),
      lastTick: performance.now(),
      speed: 130,
      particles: [],
    };
    setScore(0);
    setGameState('PLAYING');
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState('GAMEOVER');
    setShake(true);
    setTimeout(() => setShake(false), 400);
    setScore(s => {
      if (s > highScore) setHighScore(s);
      return s;
    });
  }, [highScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && gameState === 'PLAYING') return setGameState('PAUSED');
      if (e.key === ' ' && gameState === 'PAUSED') {
        engine.current.lastTick = performance.now();
        return setGameState('PLAYING');
      }

      if (gameState === 'PLAYING') {
        const state = engine.current;
        const lastQueuedDir = state.buffer.length > 0 ? state.buffer[state.buffer.length - 1] : state.dir;
        let newDir: Point | null = null;

        if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && lastQueuedDir.y === 0) newDir = { x: 0, y: -1 };
        else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && lastQueuedDir.y === 0) newDir = { x: 0, y: 1 };
        else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && lastQueuedDir.x === 0) newDir = { x: -1, y: 0 };
        else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && lastQueuedDir.x === 0) newDir = { x: 1, y: 0 };

        if (newDir && state.buffer.length < 3) state.buffer.push(newDir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let requestID: number;

    const gameLoop = (timestamp: number) => {
      const state = engine.current;
      if (!state.lastTick) state.lastTick = timestamp;

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        if (p.life <= 0) state.particles.splice(i, 1);
      }

      if (gameState === 'PLAYING' && timestamp - state.lastTick >= state.speed) {
        state.lastTick = timestamp;

        if (state.buffer.length > 0) state.dir = state.buffer.shift()!;

        const head = state.snake[0];
        const newHead = { x: head.x + state.dir.x, y: head.y + state.dir.y };

        if (
          newHead.x < 0 || newHead.x >= GRID_SIZE ||
          newHead.y < 0 || newHead.y >= GRID_SIZE ||
          state.snake.some(s => s.x === newHead.x && s.y === newHead.y)
        ) {
          handleGameOver();
        } else {
          state.snake.unshift(newHead);
          if (newHead.x === state.food.x && newHead.y === state.food.y) {
            setScore(s => s + 10);
            state.food = generateFood(state.snake);
            state.speed = Math.max(50, state.speed - 3);
            
            for (let i = 0; i < 20; i++) {
              state.particles.push({
                x: newHead.x * CELL_SIZE + CELL_SIZE / 2,
                y: newHead.y * CELL_SIZE + CELL_SIZE / 2,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 10 + Math.random() * 10,
                maxLife: 20,
                color: Math.random() > 0.5 ? '#ff00ff' : '#00ffff'
              });
            }
          } else {
            state.snake.pop();
          }
        }
      }

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.moveTo(i * CELL_SIZE, 0); ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.moveTo(0, i * CELL_SIZE); ctx.lineTo(canvas.width, i * CELL_SIZE);
      }
      ctx.stroke();

      const flash = Math.floor(timestamp / 100) % 2 === 0;
      ctx.fillStyle = flash ? '#ff00ff' : '#00ffff';
      ctx.fillRect(state.food.x * CELL_SIZE + 2, state.food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);

      state.snake.forEach((segment, i) => {
        const isHead = i === 0;
        ctx.fillStyle = isHead ? '#ffffff' : '#00ffff';
        
        ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        
        if (isHead) {
           ctx.fillStyle = '#ff00ff';
           ctx.fillRect(segment.x * CELL_SIZE + 5, segment.y * CELL_SIZE + 5, CELL_SIZE - 10, CELL_SIZE - 10);
        }
      });

      state.particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      });
      ctx.globalAlpha = 1.0;

      requestID = requestAnimationFrame(gameLoop);
    };

    requestID = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestID);
  }, [gameState, handleGameOver]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-4 space-y-6 select-none font-vt">
      
      <div className="w-full flex justify-between items-center px-4 py-2 bg-void border-2 border-cyan shadow-[4px_4px_0px_#ff00ff]">
        <div className="flex flex-col">
          <span className="text-magenta font-pixel text-[8px] uppercase tracking-widest mb-1">DATA_HARVESTED</span>
          <span className="font-pixel text-xl text-cyan glitch" data-text={String(score).padStart(6, '0')}>{String(score).padStart(6, '0')}</span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-cyan font-pixel text-[8px] uppercase tracking-widest mb-1 text-right">MAX_CAPACITY</span>
          <span className="font-pixel text-xl text-magenta">{String(highScore).padStart(6, '0')}</span>
        </div>
      </div>

      <div className="relative group">
        <div className={`bg-void border-4 border-magenta p-1 relative shadow-[8px_8px_0px_#00ffff] ${shake ? 'screen-tear' : ''}`}>
          
          <canvas 
            ref={canvasRef}
            width={GRID_SIZE * CELL_SIZE}
            height={GRID_SIZE * CELL_SIZE}
            className="block"
            style={{ width: 'min(90vw, 400px)', height: 'min(90vw, 400px)' }}
          />

          <AnimatePresence>
            {gameState !== 'PLAYING' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-void/90 flex flex-col items-center justify-center z-20 border-[8px] border-void"
              >
                {gameState === 'START' && (
                  <>
                    <h2 className="text-3xl lg:text-4xl font-pixel text-magenta mb-4 uppercase glitch" data-text="READY_?">READY_?</h2>
                    <button onClick={initGame} className="mt-4 px-6 py-2 bg-cyan text-void font-pixel text-xs border-2 border-magenta hover:bg-magenta hover:text-cyan hover:border-cyan shadow-[4px_4px_0px_#ff00ff] hover:shadow-[4px_4px_0px_#00ffff] transition-all">
                      [ EXECUTABLE ]
                    </button>
                  </>
                )}
                
                {gameState === 'GAMEOVER' && (
                  <>
                    <h2 className="text-2xl font-pixel text-magenta mb-4 text-center glitch" data-text="ERR: ALIGNMENT">ERR: ALIGNMENT</h2>
                    <p className="font-vt text-cyan mb-8 text-2xl uppercase tracking-widest">OVERLOAD: {String(score).padStart(6, '0')}</p>
                    <button onClick={initGame} className="px-6 py-2 bg-cyan text-void font-pixel text-xs border-2 border-magenta hover:bg-magenta hover:text-cyan hover:border-cyan shadow-[4px_4px_0px_#ff00ff] hover:shadow-[4px_4px_0px_#00ffff] transition-all">
                      [ REBOOT ]
                    </button>
                  </>
                )}

                {gameState === 'PAUSED' && (
                  <>
                    <h2 className="text-3xl font-pixel text-cyan mb-6 tracking-widest glitch" data-text="HALTED">HALTED</h2>
                    <button onClick={() => { setGameState('PLAYING'); engine.current.lastTick = performance.now(); }} className="px-6 py-2 bg-magenta text-void font-pixel text-xs border-2 border-cyan hover:bg-cyan hover:text-magenta hover:border-magenta shadow-[4px_4px_0px_#00ffff] hover:shadow-[4px_4px_0px_#ff00ff] transition-all">
                      [ RESUME ]
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex gap-4 justify-center w-full mt-6 flex-wrap">
        <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-void border border-cyan text-cyan font-pixel text-[10px] shadow-[2px_2px_0px_#ff00ff]">W/A/S/D</kbd>
            <span className="text-sm text-magenta uppercase">NAVIGATE</span>
        </div>
        <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-void border border-magenta text-magenta font-pixel text-[10px] shadow-[2px_2px_0px_#00ffff]">SPC</kbd>
            <span className="text-sm text-cyan uppercase">INTERRUPT</span>
        </div>
      </div>

    </div>
  );
}

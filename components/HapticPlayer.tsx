
import React, { useState, useEffect, useRef } from 'react';

interface HapticPlayerProps {
  pattern: number[];
  onFinished: () => void;
  intensityBoost: number;
}

type BeatType = 'KICK' | 'SNARE' | 'GHOST' | null;

const HapticPlayer: React.FC<HapticPlayerProps> = ({ pattern, onFinished, intensityBoost }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBeat, setActiveBeat] = useState<BeatType>(null);
  const [progress, setProgress] = useState(0);
  const [hapticSuccess, setHapticSuccess] = useState<boolean | null>(null);
  const [shockwave, setShockwave] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const visualTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const animationFrame = useRef<number | null>(null);

  // Padrão com Boost e Normalização
  const finalPattern = pattern.map((v, i) => i % 2 === 0 ? Math.max(40, v + (intensityBoost * 30)) : v);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  };

  // Sintetizador Pro: Simula a sensação física através de psychoacoustics
  const triggerSynth = (time: number, durationMs: number, type: BeatType) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const master = ctx.createGain();
    master.connect(ctx.destination);
    const dur = durationMs / 1000;

    if (type === 'KICK') {
      // Camada 1: Sub-punch (45Hz)
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.frequency.setValueAtTime(55, time);
      sub.frequency.exponentialRampToValueAtTime(30, time + dur);
      subGain.gain.setValueAtTime(0.8, time);
      subGain.gain.exponentialRampToValueAtTime(0.001, time + dur);
      sub.connect(subGain).connect(master);
      sub.start(time); sub.stop(time + dur);

      // Camada 2: Click de transiente (Ruído)
      const noise = ctx.createOscillator(); // Fake noise for simplicity
      noise.type = 'square';
      noise.frequency.setValueAtTime(120, time);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.2, time);
      nGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      noise.connect(nGain).connect(master);
      noise.start(time); noise.stop(time + 0.05);

    } else if (type === 'SNARE') {
      const snare = ctx.createOscillator();
      snare.type = 'triangle';
      snare.frequency.setValueAtTime(220, time);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + dur);
      snare.connect(g).connect(master);
      snare.start(time); snare.stop(time + dur);
    }
  };

  const startSequence = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isPlaying) return;

    initAudio();
    setIsPlaying(true);
    
    // Teste de hardware imediato
    const canVibrate = navigator.vibrate ? navigator.vibrate([50, 30, 50]) : false;
    setHapticSuccess(canVibrate);

    let cumulativeTime = 0;
    const LOOP_COUNT = 2;
    const totalTime = (finalPattern.reduce((a, b) => a + b, 0) + 1200) * LOOP_COUNT;
    const audioStartTime = audioCtxRef.current?.currentTime || 0;

    for (let l = 0; l < LOOP_COUNT; l++) {
      finalPattern.forEach((dur, idx) => {
        if (idx % 2 === 0) {
          const type: BeatType = dur > 350 ? 'KICK' : dur > 150 ? 'SNARE' : 'GHOST';
          
          const t1 = setTimeout(() => {
            setActiveBeat(type);
            setShockwave(true);
            if (navigator.vibrate) {
              // Multiplexação: Dá mais "textura" ao motor
              if (type === 'KICK') navigator.vibrate([dur - 20, 10, 10]);
              else navigator.vibrate(dur);
            }
          }, cumulativeTime);

          const t2 = setTimeout(() => {
            setActiveBeat(null);
            setShockwave(false);
          }, cumulativeTime + dur);

          visualTimeouts.current.push(t1, t2);
          triggerSynth(audioStartTime + (cumulativeTime / 1000), dur, type);
        }
        cumulativeTime += dur;
      });
      cumulativeTime += 1200; // Gap entre loops
    }

    const startPerf = performance.now();
    const anim = () => {
      const elapsed = performance.now() - startPerf;
      const p = Math.min(elapsed / totalTime, 1);
      setProgress(p * 100);
      if (p < 1) animationFrame.current = requestAnimationFrame(anim);
    };
    animationFrame.current = requestAnimationFrame(anim);

    setTimeout(() => {
      setIsPlaying(false);
      onFinished();
    }, totalTime);
  };

  useEffect(() => {
    return () => {
      visualTimeouts.current.forEach(clearTimeout);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto space-y-12">
      {/* Indicador de Status Hático */}
      <div className={`px-6 py-2 rounded-full border text-[10px] font-black tracking-[0.2em] uppercase transition-all ${
        hapticSuccess === true ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400' : 
        hapticSuccess === false ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 
        'bg-white/5 border-white/10 text-slate-500'
      }`}>
        {hapticSuccess === null ? 'Toque no centro para calibrar' : 
         hapticSuccess ? 'Motor Hático: Ativo' : 'Haptic Bloqueado: Use Fone 🎧'}
      </div>

      <div className="relative w-72 h-72 group">
        {/* Shockwave effect */}
        <div className={`absolute inset-0 rounded-full border-4 border-cyan-400/50 transition-all duration-100 ${
          shockwave ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
        }`} />
        
        {/* Glow de batida */}
        <div className={`absolute -inset-8 blur-3xl rounded-full transition-all duration-75 ${
          activeBeat === 'KICK' ? 'bg-cyan-500/40 opacity-100' : 
          activeBeat === 'SNARE' ? 'bg-fuchsia-500/30 opacity-80' : 'opacity-0'
        }`} />

        <button
          onMouseDown={startSequence}
          onTouchStart={startSequence}
          disabled={isPlaying}
          className={`relative z-10 w-full h-full rounded-full border-8 transition-all duration-75 flex flex-col items-center justify-center outline-none touch-none ${
            isPlaying ? 'bg-slate-900 border-cyan-400/20' : 'bg-white border-white scale-100 hover:scale-105 active:scale-95'
          } ${activeBeat === 'KICK' ? 'scale-110 !border-white !bg-cyan-500' : ''}`}
        >
          {isPlaying ? (
            <div className="flex flex-col items-center">
              <span className="text-5xl font-black italic text-white animate-pulse tracking-tighter">
                {activeBeat || 'SENTINDO'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
              </div>
              <span className="font-black text-[10px] text-slate-900 uppercase tracking-widest">Sincronizar</span>
            </div>
          )}
        </button>

        {/* Progress ring */}
        <svg className="absolute -inset-6 w-[calc(100%+48px)] h-[calc(100%+48px)] -rotate-90 pointer-events-none">
          <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <circle 
            cx="50%" cy="50%" r="48%" fill="none" 
            stroke="#22d3ee" strokeWidth="8" 
            strokeDasharray="100" strokeDashoffset={100 - progress} 
            pathLength="100" strokeLinecap="round"
            className="transition-all duration-100 ease-linear"
          />
        </svg>
      </div>

      {/* Visualizer bars */}
      <div className="flex items-end justify-center space-x-2 h-16 w-full px-12">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className={`flex-1 rounded-full transition-all duration-75 ${
            activeBeat === 'KICK' ? 'bg-cyan-400 h-16 opacity-100 shadow-[0_0_15px_#22d3ee]' : 
            activeBeat === 'SNARE' ? 'bg-fuchsia-400 h-10 opacity-80' : 
            'bg-white/10 h-2'
          }`} />
        ))}
      </div>
    </div>
  );
};

export default HapticPlayer;

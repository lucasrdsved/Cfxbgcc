
import React, { useState, useEffect, useRef } from 'react';

interface HapticPlayerProps {
  pattern: number[];
  onFinished: () => void;
  intensityBoost: number;
}

type BeatType = 'GHOST' | 'TAP' | 'SNARE' | 'KICK' | 'THUMP' | null;

const HapticPlayer: React.FC<HapticPlayerProps> = ({ pattern, onFinished, intensityBoost }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBeatType, setActiveBeatType] = useState<BeatType>(null);
  const [progress, setProgress] = useState(0);
  const [vibrationStatus, setVibrationStatus] = useState<'IDLE' | 'ALLOWED' | 'BLOCKED' | 'UNSUPPORTED'>('IDLE');
  const [screenShake, setScreenShake] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const visualTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      if (!navigator.vibrate) setVibrationStatus('UNSUPPORTED');
    }
  }, []);

  const boostedPattern = pattern.map((val, idx) => {
    if (idx % 2 === 0) return Math.max(20, val + (intensityBoost * 50)); 
    return val;
  });

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 44100,
      });
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playImpactAudio = (time: number, durationMs: number, type: BeatType) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    const durationSec = durationMs / 1000;

    if (type === 'KICK') {
      // Sub-grave profundo (sensação física)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + durationSec);
      
      gain.gain.setValueAtTime(0.9, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + durationSec);
      
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(time);
      osc.stop(time + durationSec);
    } else if (type === 'SNARE') {
      // Impacto médio
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, time);
      osc.frequency.exponentialRampToValueAtTime(100, time + 0.1);
      
      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + durationSec);
      
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(time);
      osc.stop(time + durationSec);
    } else {
      // Ghost / Tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, time);
      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + durationSec);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(time);
      osc.stop(time + durationSec);
    }
  };

  const startPlayback = () => {
    if (isPlaying) return;
    
    // PASSO CRÍTICO: Tentar vibrar IMEDIATAMENTE no momento do toque
    // navigator.vibrate retorna um booleano indicando se o comando foi aceito
    const success = navigator.vibrate ? navigator.vibrate(60) : false;
    setVibrationStatus(success ? 'ALLOWED' : 'BLOCKED');
    
    initAudio();
    setIsPlaying(true);
    setProgress(0);

    const LOOP_COUNT = 2;
    const totalPatternDuration = boostedPattern.reduce((a, b) => a + b, 0);
    const totalDuration = (totalPatternDuration + 1500) * LOOP_COUNT;

    let cumulative = 0;
    const startTime = audioCtxRef.current?.currentTime || 0;

    for (let i = 0; i < LOOP_COUNT; i++) {
      boostedPattern.forEach((dur, idx) => {
        const isVibrateSegment = idx % 2 === 0;
        if (isVibrateSegment) {
          let type: BeatType = 'KICK';
          if (dur < 120) type = 'GHOST';
          else if (dur < 300) type = 'SNARE';
          else type = 'KICK';

          const t1 = setTimeout(() => {
            setActiveBeatType(type);
            if (type === 'KICK') setScreenShake(true);
            if (navigator.vibrate) navigator.vibrate(dur);
          }, cumulative);

          const t2 = setTimeout(() => {
            setActiveBeatType(null);
            setScreenShake(false);
          }, cumulative + dur);
          
          visualTimeoutsRef.current.push(t1, t2);
          playImpactAudio(startTime + (cumulative / 1000), dur, type);
        }
        cumulative += dur;
      });
      cumulative += 1500;
    }

    const startPerf = performance.now();
    const animate = () => {
      const elapsed = performance.now() - startPerf;
      const p = Math.min(elapsed / totalDuration, 1);
      setProgress(p * 100);
      if (p < 1) animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);

    setTimeout(() => {
      setIsPlaying(false);
      onFinished();
    }, totalDuration);
  };

  useEffect(() => {
    return () => {
      visualTimeoutsRef.current.forEach(clearTimeout);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (navigator.vibrate) navigator.vibrate(0);
    };
  }, []);

  return (
    <div className={`flex flex-col items-center space-y-12 w-full transition-transform duration-75 ${screenShake ? 'scale-[1.02] translate-y-1' : ''}`}>
      
      <div className="w-full flex justify-center">
        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
          vibrationStatus === 'ALLOWED' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
          vibrationStatus === 'BLOCKED' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
          'bg-slate-800 border-white/5 text-slate-500'
        }`}>
          Status Hático: {vibrationStatus} 
          {vibrationStatus === 'BLOCKED' && " (Bloqueado pelo Navegador)"}
        </div>
      </div>

      <div className="relative w-72 h-72">
        {activeBeatType && (
          <div className={`absolute inset-0 rounded-full animate-ping opacity-40 transition-all duration-75 ${
              activeBeatType === 'KICK' ? 'bg-cyan-500 scale-150' : 
              activeBeatType === 'SNARE' ? 'bg-fuchsia-500 scale-125' : 'bg-white scale-110'
            }`} 
          />
        )}
        
        <button
          onClick={startPlayback}
          disabled={isPlaying}
          className={`relative z-10 w-full h-full rounded-full flex flex-col items-center justify-center transition-all duration-75 border-8 shadow-[0_0_80px_rgba(0,0,0,0.8)] outline-none active:scale-90 ${
            activeBeatType === 'KICK' ? 'bg-cyan-500 border-white scale-105 shadow-cyan-500/60' : 
            activeBeatType === 'SNARE' ? 'bg-fuchsia-500 border-white/50 scale-102' :
            'bg-slate-900 border-white/10'
          }`}
        >
          {isPlaying ? (
            <div className="flex flex-col items-center space-y-2 pointer-events-none">
              <span className={`text-6xl font-black italic tracking-tighter text-white transition-transform ${activeBeatType ? 'scale-125' : 'scale-100'}`}>
                {activeBeatType || 'LISTEN'}
              </span>
            </div>
          ) : (
            <div className="group flex flex-col items-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-2xl">
                <svg className="w-12 h-12 text-black fill-current translate-x-1" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
                </svg>
              </div>
              <span className="font-black tracking-[0.4em] uppercase text-xs text-white">Sentir Ritmo</span>
            </div>
          )}
        </button>

        <svg className="absolute -inset-8 w-[calc(100%+64px)] h-[calc(100%+64px)] -rotate-90 pointer-events-none">
          <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <circle 
            cx="50%" cy="50%" r="48%" fill="none" 
            stroke={isPlaying ? '#22d3ee' : 'rgba(255,255,255,0.1)'} 
            strokeWidth="8" 
            strokeDasharray="100" 
            strokeDashoffset={100 - progress} 
            pathLength="100" 
            strokeLinecap="round"
            className="transition-all duration-150 ease-linear" 
          />
        </svg>
      </div>
      
      <div className="text-center space-y-4">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.5em]">Análise de Espectro</p>
        <div className="grid grid-cols-3 gap-8 w-64 mx-auto">
          <div className="flex flex-col items-center space-y-2">
              <div className={`w-1.5 h-8 rounded-full transition-all duration-75 ${activeBeatType === 'GHOST' ? 'bg-white scale-y-125' : 'bg-slate-800'}`}></div>
              <span className="text-[7px] font-black uppercase text-slate-600">High</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
              <div className={`w-1.5 h-12 rounded-full transition-all duration-75 ${activeBeatType === 'SNARE' ? 'bg-fuchsia-500 scale-y-125 shadow-[0_0_10px_rgba(217,70,239,0.5)]' : 'bg-slate-800'}`}></div>
              <span className="text-[7px] font-black uppercase text-slate-600">Mid</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
              <div className={`w-1.5 h-16 rounded-full transition-all duration-75 ${activeBeatType === 'KICK' ? 'bg-cyan-400 scale-y-125 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-slate-800'}`}></div>
              <span className="text-[7px] font-black uppercase text-slate-600">Bass</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HapticPlayer;

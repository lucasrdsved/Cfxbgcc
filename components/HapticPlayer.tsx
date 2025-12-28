
import React, { useState, useEffect, useRef } from 'react';

interface HapticPlayerProps {
  pattern: number[];
  onFinished: () => void;
  intensityBoost: number;
}

type BeatType = 'KICK' | 'SNARE' | 'TICK' | null;

/**
 * HapticPlayer: O coração sensorial do app.
 * Utiliza a Web Audio API para simular impacto físico quando o motor de vibração é insuficiente.
 */
const HapticPlayer: React.FC<HapticPlayerProps> = ({ pattern, onFinished, intensityBoost }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBeat, setActiveBeat] = useState<BeatType>(null);
  const [progress, setProgress] = useState(0);
  const [hapticStatus, setHapticStatus] = useState<'IDLE' | 'OK' | 'BLOCKED'>('IDLE');
  
  const audioCtx = useRef<AudioContext | null>(null);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const animFrame = useRef<number | null>(null);

  // Aplica o boost de intensidade selecionado pelo usuário
  const processedPattern = pattern.map((v, i) => i % 2 === 0 ? v + (intensityBoost * 25) : v);

  const setupAudio = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') audioCtx.current.resume();
  };

  /**
   * Sintetizador de Impacto: Cria uma sensação tátil através do som.
   * KICK: Onda senoidal pura em 50Hz para 'soco' no diafragma.
   * SNARE: Onda triangular em 200Hz para impacto médio.
   */
  const playImpact = (time: number, durationMs: number, type: BeatType) => {
    const ctx = audioCtx.current;
    if (!ctx) return;

    const master = ctx.createGain();
    master.connect(ctx.destination);
    const dur = durationMs / 1000;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'KICK') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(50, time);
      osc.frequency.exponentialRampToValueAtTime(20, time + dur);
      gain.gain.setValueAtTime(0.9, time);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, time);
      gain.gain.setValueAtTime(0.4, time);
    }

    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain).connect(master);
    osc.start(time);
    osc.stop(time + dur);
  };

  const startInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isPlaying) return;

    setupAudio();
    setIsPlaying(true);
    
    // Tenta gatilhar a vibração no momento EXATO do toque para bypass de segurança
    const success = navigator.vibrate ? navigator.vibrate([40, 20, 40]) : false;
    setHapticStatus(success ? 'OK' : 'BLOCKED');

    const loopCount = 2;
    const totalPatternTime = processedPattern.reduce((a, b) => a + b, 0);
    const totalDuration = (totalPatternTime + 1200) * loopCount;
    const startTime = audioCtx.current?.currentTime || 0;

    let cumulative = 0;
    for (let l = 0; l < loopCount; l++) {
      processedPattern.forEach((dur, idx) => {
        if (idx % 2 === 0) {
          const type: BeatType = dur > 350 ? 'KICK' : dur > 150 ? 'SNARE' : 'TICK';
          
          const t1 = setTimeout(() => {
            setActiveBeat(type);
            if (navigator.vibrate) navigator.vibrate(dur);
          }, cumulative);

          const t2 = setTimeout(() => setActiveBeat(null), cumulative + dur);
          
          timeouts.current.push(t1, t2);
          playImpact(startTime + (cumulative / 1000), dur, type);
        }
        cumulative += dur;
      });
      cumulative += 1200;
    }

    // Animação da barra de progresso
    const startPerf = performance.now();
    const frame = () => {
      const elapsed = performance.now() - startPerf;
      const p = Math.min(elapsed / totalDuration, 1);
      setProgress(p * 100);
      if (p < 1) animFrame.current = requestAnimationFrame(frame);
    };
    animFrame.current = requestAnimationFrame(frame);

    setTimeout(() => {
      setIsPlaying(false);
      onFinished();
    }, totalDuration);
  };

  useEffect(() => {
    return () => {
      timeouts.current.forEach(clearTimeout);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-sm space-y-10">
      <div className={`text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border transition-all ${
        hapticStatus === 'OK' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 
        hapticStatus === 'BLOCKED' ? 'bg-red-500/10 border-red-500 text-red-500' : 'text-slate-500 border-white/10'
      }`}>
        {hapticStatus === 'IDLE' ? 'Toque no centro para iniciar' : 
         hapticStatus === 'OK' ? 'Haptic Engine: Ativo' : 'Vibração Bloqueada: Use Fones'}
      </div>

      <div className="relative w-64 h-64 group">
        {/* Glow de impacto */}
        <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-75 ${
          activeBeat === 'KICK' ? 'bg-cyan-500/40 opacity-100 scale-125' : 
          activeBeat === 'SNARE' ? 'bg-fuchsia-500/30 opacity-100 scale-110' : 'opacity-0 scale-100'
        }`} />

        <button
          onMouseDown={startInteraction}
          onTouchStart={startInteraction}
          disabled={isPlaying}
          className={`relative z-10 w-full h-full rounded-full border-4 transition-all duration-75 flex items-center justify-center touch-none outline-none ${
            isPlaying ? 'bg-slate-900 border-cyan-500/20' : 'bg-white border-white hover:scale-105 active:scale-95'
          } ${activeBeat === 'KICK' ? 'scale-110 border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.4)]' : ''}`}
        >
          {isPlaying ? (
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black italic text-white tracking-tighter animate-pulse">
                {activeBeat || 'SENTINDO'}
              </span>
            </div>
          ) : (
            <svg className="w-12 h-12 text-black fill-current" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
          )}
        </button>

        {/* Círculo de progresso radial */}
        <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] -rotate-90 pointer-events-none">
          <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          <circle 
            cx="50%" cy="50%" r="48%" fill="none" stroke="#22d3ee" strokeWidth="6" 
            strokeDasharray="100" strokeDashoffset={100 - progress} 
            pathLength="100" strokeLinecap="round" className="transition-all duration-100 ease-linear"
          />
        </svg>
      </div>

      {/* Visualizer Dinâmico */}
      <div className="flex items-end justify-center space-x-1.5 h-12 w-full px-8">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`flex-1 rounded-full transition-all duration-100 ${
            activeBeat === 'KICK' ? 'bg-cyan-400 h-12' : 
            activeBeat === 'SNARE' ? 'bg-fuchsia-400 h-8' : 'bg-white/10 h-2'
          }`} />
        ))}
      </div>
    </div>
  );
};

export default HapticPlayer;

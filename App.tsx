
import React, { useState, useCallback } from 'react';
import { GameState, SongData, GameSession } from './types';
import { getSongChallenge } from './services/geminiService';
import HapticPlayer from './components/HapticPlayer';
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
  const [session, setSession] = useState<GameSession>({ mode: 'SOLO', score: 0, attempts: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [intensity, setIntensity] = useState(2);
  const [customSongInput, setCustomSongInput] = useState('');
  const [lastResult, setLastResult] = useState<{ correct: boolean, song?: SongData } | null>(null);

  const startNewGame = useCallback(async (customQuery?: string) => {
    setIsLoading(true);
    try {
      const song = await getSongChallenge(customQuery, useThinking);
      setSession(prev => ({ ...prev, currentSong: song }));
      setGameState(session.mode === 'VS' ? GameState.PASSING : GameState.FEELING);
    } catch (error) {
      alert("IA sobrecarregada. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  }, [session.mode, useThinking]);

  const handleGuess = (opt: string) => {
    if (!session.currentSong) return;
    const isCorrect = opt === session.currentSong.title;
    setLastResult({ correct: isCorrect, song: session.currentSong });
    
    if (isCorrect) {
      setSession(s => ({...s, score: s.score + 1}));
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.7 }, colors: ['#22d3ee', '#f06292', '#ffffff'] });
    }
    setGameState(GameState.RESULT);
  };

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-inter selection:bg-cyan-500/30">
      {/* HUD Superior */}
      <nav className="p-6 flex justify-between items-center fixed top-0 w-full z-40 bg-gradient-to-b from-[#05070a] to-transparent">
        <div className="flex items-center space-x-3" onClick={() => setGameState(GameState.LOBBY)}>
          <div className="w-8 h-8 bg-cyan-400 rounded flex items-center justify-center rotate-3 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            <span className="text-black font-black text-xl italic">H</span>
          </div>
          <span className="font-black italic tracking-tighter text-2xl">BEAT.</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
            <span className="text-[10px] font-black text-slate-500 uppercase mr-2">Streak</span>
            <span className="text-cyan-400 font-black">{session.score}</span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-lg min-h-screen flex flex-col justify-center px-6 pt-20 pb-10">
        {isLoading ? (
          <div className="flex flex-col items-center space-y-6 animate-pulse">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-[0_0_40px_rgba(34,211,238,0.2)]"></div>
            <div className="text-center">
              <p className="text-white font-black uppercase tracking-[0.3em] text-xs">Analisando Espectro...</p>
              <p className="text-slate-600 text-[10px] mt-2 font-bold italic">O Gemini está gerando padrões háticos customizados.</p>
            </div>
          </div>
        ) : (
          <div className="animate-zoom-feedback">
            {gameState === GameState.LOBBY && (
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <h1 className="text-8xl font-black italic tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 via-white to-fuchsia-500">
                    Sinta<br/>o Beat.
                  </h1>
                  <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Adivinhe a música pelo motor de vibração</p>
                </div>

                <div className="space-y-4">
                  <div className="glass-card p-6 rounded-[2.5rem] space-y-6">
                    <button onClick={openInNewTab} className="w-full flex items-center justify-center space-x-3 bg-cyan-500/10 border border-cyan-400/30 p-4 rounded-2xl hover:bg-cyan-500/20 transition-all group">
                      <span className="text-xl group-hover:scale-125 transition-transform">🚀</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Abrir em Nova Aba (Haptic Full)</span>
                    </button>
                    
                    <div className="space-y-4 px-2">
                       <label className="flex items-center justify-between cursor-pointer">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deep Reasoning IA</span>
                         <input type="checkbox" checked={useThinking} onChange={() => setUseThinking(!useThinking)} className="w-6 h-6 rounded-full accent-fuchsia-500" />
                       </label>
                       <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                           <span>Força do Motor</span>
                           <span className="text-white">{intensity}x</span>
                         </div>
                         <input type="range" min="1" max="4" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none accent-cyan-400" />
                       </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <button onClick={() => { setSession(p => ({...p, mode: 'SOLO'})); setGameState(GameState.SELECTING); }} className="bg-white text-black p-8 rounded-[2.5rem] flex items-center justify-between group hover:scale-[1.02] transition-all">
                      <div className="flex items-center space-x-6">
                        <span className="text-4xl">🎧</span>
                        <div className="text-left">
                          <h3 className="font-black uppercase text-sm tracking-widest leading-none">Modo Solo</h3>
                          <p className="text-[10px] text-slate-400 font-bold mt-1">IA escolhe para você</p>
                        </div>
                      </div>
                      <span className="text-2xl font-black group-hover:translate-x-2 transition-transform">→</span>
                    </button>

                    <button onClick={() => { setSession(p => ({...p, mode: 'VS'})); setGameState(GameState.SELECTING); }} className="glass-card p-8 rounded-[2.5rem] flex items-center justify-between group hover:scale-[1.02] transition-all">
                      <div className="flex items-center space-x-6">
                        <span className="text-4xl">⚔️</span>
                        <div className="text-left">
                          <h3 className="font-black uppercase text-sm tracking-widest leading-none">Duelo 1v1</h3>
                          <p className="text-[10px] text-slate-500 font-bold mt-1">Desafie um amigo local</p>
                        </div>
                      </div>
                      <span className="text-2xl font-black group-hover:translate-x-2 transition-transform">→</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {gameState === GameState.SELECTING && (
              <div className="space-y-12 text-center">
                <h2 className="text-6xl font-black italic tracking-tighter">Qual o hit?</h2>
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="Nome da música ou artista..."
                    value={customSongInput}
                    onChange={(e) => setCustomSongInput(e.target.value)}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-[2.5rem] p-10 text-white focus:border-cyan-400 outline-none text-center text-2xl font-black transition-all shadow-inner placeholder:text-slate-800"
                  />
                  <div className="absolute inset-0 bg-cyan-400/5 blur-3xl -z-10 group-focus-within:bg-cyan-400/10"></div>
                </div>
                <button onClick={() => startNewGame(customSongInput)} className="w-full bg-cyan-400 text-black p-8 rounded-[2.5rem] font-black uppercase tracking-widest text-xl shadow-[0_0_50px_rgba(34,211,238,0.3)] active:scale-95 transition-all">
                  Gerar Haptics Pro
                </button>
                <button onClick={() => setGameState(GameState.LOBBY)} className="text-slate-600 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">Voltar ao início</button>
              </div>
            )}

            {gameState === GameState.PASSING && (
              <div className="text-center space-y-12">
                <div className="relative inline-block">
                  <div className="text-[12rem] animate-bounce">📱</div>
                  <div className="absolute inset-0 bg-fuchsia-500/20 blur-3xl rounded-full"></div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-6xl font-black italic uppercase leading-none">Entregue o Device</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Quem vai adivinhar deve segurar agora</p>
                </div>
                <button onClick={() => setGameState(GameState.FEELING)} className="w-full bg-white text-black p-10 rounded-[3rem] font-black uppercase tracking-widest text-2xl shadow-2xl">Estou Pronto</button>
              </div>
            )}

            {gameState === GameState.FEELING && session.currentSong && (
              <HapticPlayer pattern={session.currentSong.vibrationPattern} intensityBoost={intensity} onFinished={() => setGameState(GameState.GUESSING)} />
            )}

            {gameState === GameState.GUESSING && session.currentSong && (
              <div className="space-y-12 text-center">
                <h2 className="text-6xl font-black italic tracking-tighter leading-none">O que seu corpo sentiu?</h2>
                <div className="grid gap-4">
                  {session.currentSong.options.map((opt, i) => (
                    <button key={i} onClick={() => handleGuess(opt)} className="glass-card p-8 rounded-[2rem] font-black text-xl hover:bg-white/10 hover:border-cyan-400 transition-all active:scale-95 text-left flex justify-between items-center group">
                      <span className="truncate pr-4">{opt}</span>
                      <span className="opacity-0 group-hover:opacity-100 text-cyan-400 transition-opacity">SENTIR →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gameState === GameState.RESULT && lastResult && (
               <div className="text-center space-y-10">
                  <div className={`text-[10rem] drop-shadow-[0_0_50px_rgba(255,255,255,0.2)] ${lastResult.correct ? 'animate-bounce' : 'animate-shake'}`}>
                    {lastResult.correct ? '👑' : '💀'}
                  </div>
                  <div className="space-y-2">
                    <h2 className={`text-7xl font-black italic tracking-tighter ${lastResult.correct ? 'text-cyan-400' : 'text-red-500'}`}>
                      {lastResult.correct ? 'PRECISO.' : 'SURDO?'}
                    </h2>
                    <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em]">A música correta era</p>
                  </div>
                  <div className="glass-card p-12 rounded-[3.5rem] border-white/10 relative overflow-hidden">
                    <div className={`absolute -top-10 -right-10 w-40 h-40 blur-3xl rounded-full opacity-20 ${lastResult.correct ? 'bg-cyan-400' : 'bg-red-500'}`}></div>
                    <p className="text-4xl font-black italic text-white mb-2 leading-tight">{lastResult.song?.title}</p>
                    <p className="text-slate-500 uppercase font-black text-sm tracking-widest">{lastResult.song?.artist}</p>
                  </div>
                  <button onClick={() => setGameState(GameState.LOBBY)} className="w-full bg-white text-black p-8 rounded-[2.5rem] font-black uppercase text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl">Novo Round</button>
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;


import React, { useState, useCallback } from 'react';
import { GameState, SongData, GameSession } from './types';
import { getSongChallenge } from './services/geminiService';
import HapticPlayer from './components/HapticPlayer';
import confetti from 'canvas-confetti';

/**
 * HapticBeat Pro - App Principal
 * Aplicação focada em acessibilidade sensorial e gamificação rítmica.
 */
const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
  const [session, setSession] = useState<GameSession>({ mode: 'SOLO', score: 0, attempts: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [intensity, setIntensity] = useState(2);
  const [customInput, setCustomInput] = useState('');
  const [lastResult, setLastResult] = useState<{ correct: boolean, song?: SongData } | null>(null);

  const startNewChallenge = useCallback(async (query?: string) => {
    setIsLoading(true);
    try {
      const song = await getSongChallenge(query, useThinking);
      setSession(prev => ({ ...prev, currentSong: song }));
      setGameState(session.mode === 'VS' ? GameState.PASSING : GameState.FEELING);
    } catch (error) {
      alert("Houve um erro ao gerar o padrão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [session.mode, useThinking]);

  const handleGuess = (title: string) => {
    if (!session.currentSong) return;
    const isCorrect = title === session.currentSong.title;
    setLastResult({ correct: isCorrect, song: session.currentSong });
    
    if (isCorrect) {
      setSession(s => ({...s, score: s.score + 1}));
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.7 }, colors: ['#22d3ee', '#f472b6'] });
    }
    setGameState(GameState.RESULT);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-inter selection:bg-cyan-500/20">
      {/* Navbar Minimalista */}
      <nav className="p-6 fixed top-0 w-full z-50 flex justify-between items-center bg-gradient-to-b from-[#05070a] to-transparent">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setGameState(GameState.LOBBY)}>
          <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-black font-black text-lg">H</span>
          </div>
          <span className="font-black italic tracking-tighter text-xl">BEAT PRO</span>
        </div>
        <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full flex items-center space-x-3">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Score</span>
          <span className="text-cyan-400 font-black">{session.score}</span>
        </div>
      </nav>

      <main className="container mx-auto max-w-lg min-h-screen flex flex-col justify-center px-6 pt-24 pb-12">
        {isLoading ? (
          <div className="flex flex-col items-center space-y-6 animate-pulse">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Codificando Ritmo</p>
          </div>
        ) : (
          <div className="animate-zoom-feedback">
            {gameState === GameState.LOBBY && (
              <div className="space-y-12">
                <header className="text-center space-y-4">
                  <h1 className="text-7xl font-black italic tracking-tighter leading-[0.9] bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 to-white">
                    Sentir<br/>é Acreditar.
                  </h1>
                  <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Descubra hits através do motor de vibração</p>
                </header>

                <div className="space-y-4">
                  <div className="glass-card p-6 rounded-[2rem] space-y-5">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Reasoning IA</span>
                      <input type="checkbox" checked={useThinking} onChange={() => setUseThinking(!useThinking)} className="w-6 h-6 accent-cyan-400 rounded-full" />
                    </div>
                    <div className="space-y-2 px-2">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                        <span>Potência Hática</span>
                        <span>{intensity}x</span>
                      </div>
                      <input type="range" min="1" max="4" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-cyan-400" />
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <button onClick={() => { setSession(p => ({...p, mode: 'SOLO'})); setGameState(GameState.SELECTING); }} className="bg-white text-black p-8 rounded-[2rem] flex items-center justify-between group hover:scale-[1.02] transition-all">
                      <div className="text-left">
                        <h3 className="font-black uppercase text-sm tracking-widest leading-none">Modo Solo</h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">A IA escolhe o desafio</p>
                      </div>
                      <span className="text-3xl font-light opacity-30 group-hover:opacity-100 group-hover:translate-x-2 transition-all">→</span>
                    </button>
                    <button onClick={() => { setSession(p => ({...p, mode: 'VS'})); setGameState(GameState.SELECTING); }} className="glass-card p-8 rounded-[2rem] flex items-center justify-between group hover:scale-[1.02] transition-all">
                      <div className="text-left">
                        <h3 className="font-black uppercase text-sm tracking-widest leading-none">Duelo Local</h3>
                        <p className="text-[10px] text-slate-500 font-bold mt-1">Desafie um amigo próximo</p>
                      </div>
                      <span className="text-3xl font-light opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all">→</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {gameState === GameState.SELECTING && (
              <div className="space-y-10 text-center">
                <h2 className="text-5xl font-black italic tracking-tighter">Qual o som?</h2>
                <input 
                  type="text" 
                  placeholder="Ex: Billie Jean..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] p-8 text-white focus:border-cyan-400 outline-none text-center text-xl font-black transition-all"
                />
                <button onClick={() => startNewChallenge(customInput)} className="w-full bg-cyan-400 text-black p-8 rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-xl shadow-cyan-400/20 active:scale-95 transition-all">
                  {customInput ? 'Gerar Desafio' : 'Sorteie uma Música'}
                </button>
                <button onClick={() => setGameState(GameState.LOBBY)} className="text-slate-600 font-black uppercase text-[10px] tracking-widest">Voltar</button>
              </div>
            )}

            {gameState === GameState.FEELING && session.currentSong && (
              <HapticPlayer pattern={session.currentSong.vibrationPattern} intensityBoost={intensity} onFinished={() => setGameState(GameState.GUESSING)} />
            )}

            {gameState === GameState.GUESSING && session.currentSong && (
              <div className="space-y-10">
                <h2 className="text-5xl font-black italic tracking-tighter text-center">O que era?</h2>
                <div className="grid gap-4">
                  {session.currentSong.options.map((opt, i) => (
                    <button key={i} onClick={() => handleGuess(opt)} className="glass-card p-8 rounded-3xl font-black text-lg hover:border-cyan-400 transition-all text-left flex justify-between items-center group">
                      {opt}
                      <span className="opacity-0 group-hover:opacity-100 text-cyan-400">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gameState === GameState.RESULT && lastResult && (
               <div className="text-center space-y-10">
                  <div className={`text-[12rem] ${lastResult.correct ? 'animate-bounce' : 'animate-shake'}`}>
                    {lastResult.correct ? '👑' : '💀'}
                  </div>
                  <div className="space-y-2">
                    <h2 className={`text-6xl font-black italic tracking-tighter ${lastResult.correct ? 'text-cyan-400' : 'text-red-500'}`}>
                      {lastResult.correct ? 'LENDA.' : 'SURDO?'}
                    </h2>
                  </div>
                  <div className="glass-card p-10 rounded-[3rem] border-white/10">
                    <p className="text-3xl font-black italic text-white leading-none mb-2">{lastResult.song?.title}</p>
                    <p className="text-slate-500 uppercase font-black text-[10px] tracking-[0.3em]">{lastResult.song?.artist}</p>
                  </div>
                  <button onClick={() => setGameState(GameState.LOBBY)} className="w-full bg-white text-black p-8 rounded-[2rem] font-black uppercase text-lg shadow-2xl">Novo Round</button>
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;


import React, { useState, useCallback } from 'react';
import { GameState, SongData, GameSession } from './types';
import { getSongChallenge } from './services/geminiService';
import HapticPlayer from './components/HapticPlayer';
import confetti from 'canvas-confetti';

const DEBUG_SONG: SongData = {
  title: "Billie Jean",
  artist: "Michael Jackson",
  vibrationPattern: [450, 250, 200, 250, 450, 250, 200, 800],
  options: ["Billie Jean", "Stayin' Alive", "Beat It", "Smooth Criminal"]
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
  const [session, setSession] = useState<GameSession>({ mode: 'SOLO', score: 0, attempts: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [intensity, setIntensity] = useState(1);
  const [customSongInput, setCustomSongInput] = useState('');
  const [lastResult, setLastResult] = useState<{ correct: boolean, song?: SongData } | null>(null);
  const [feedbackType, setFeedbackType] = useState<'CORRECT' | 'INCORRECT' | null>(null);

  const testVibration = () => {
    if (navigator.vibrate) {
      const success = navigator.vibrate([100, 50, 100, 50, 300]);
      if (!success) {
        alert("O comando de vibração foi enviado, mas o navegador o bloqueou. Tente abrir o app em uma aba separada fora do preview.");
      }
    } else {
      alert("Seu navegador não suporta a API de Vibração (Haptics).");
    }
  };

  const startNewGame = useCallback(async (customQuery?: string) => {
    setIsLoading(true);
    try {
      const song = await getSongChallenge(customQuery, useThinking);
      setSession(prev => ({ ...prev, currentSong: song }));
      
      if (session.mode === 'VS') {
        setGameState(GameState.PASSING);
      } else {
        setGameState(GameState.FEELING);
      }
    } catch (error) {
      alert("Erro ao conectar com a IA. Verifique sua conexão.");
    } finally {
      setIsLoading(false);
    }
  }, [session.mode, useThinking]);

  const handleGuess = (opt: string) => {
    if (!session.currentSong) return;
    
    const isCorrect = opt === session.currentSong.title;
    setLastResult({ correct: isCorrect, song: session.currentSong });
    setFeedbackType(isCorrect ? 'CORRECT' : 'INCORRECT');
    
    if (isCorrect) {
      setSession(s => ({...s, score: s.score + 1}));
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#f0abfc', '#ffffff']
      });
    }

    setSession(s => ({...s, attempts: s.attempts + 1}));

    setTimeout(() => {
      setFeedbackType(null);
      setGameState(GameState.RESULT);
    }, 2000);
  };

  const renderLobby = () => (
    <div className="flex flex-col items-center justify-center space-y-8 py-8 px-4 animate-zoom-feedback">
      <div className="text-center space-y-2">
        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 via-white to-fuchsia-500 leading-tight">
          HapticBeat
        </h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Sinta o Ritmo. Adivinhe o Som.</p>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="glass-card p-6 rounded-[2.5rem] space-y-6 border-white/10 shadow-2xl">
          <div className="flex flex-col space-y-4">
             <button 
                onClick={testVibration}
                className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 transition-all active:scale-95 group"
             >
                <span className="text-2xl group-active:animate-ping">📳</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Testar Vibração</span>
             </button>

             <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

             <div className="px-2 space-y-4">
               <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-black text-[10px] uppercase tracking-widest text-cyan-400">Deep Thinking</span>
                  <input 
                    type="checkbox" 
                    checked={useThinking} 
                    onChange={() => setUseThinking(!useThinking)}
                    className="w-5 h-5 rounded-full accent-fuchsia-500"
                  />
                </label>

                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                    <span>Intensidade Hática</span>
                    <span className="text-white">{intensity}x</span>
                  </div>
                  <input 
                    type="range" min="0" max="3" step="1" 
                    value={intensity} 
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none accent-cyan-400"
                  />
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => { setSession(p => ({...p, mode: 'SOLO'})); setGameState(GameState.SELECTING); }} 
            className="glass-card p-6 rounded-[2rem] hover:border-cyan-500/50 transition-all group flex items-center space-x-6 text-left active:scale-95"
          >
            <div className="text-4xl group-hover:rotate-12 transition-transform">🎧</div>
            <div>
               <h3 className="font-black uppercase text-sm tracking-widest text-white">Modo Solo</h3>
               <p className="text-[10px] text-slate-500 font-bold italic">Adivinhe o que a IA escolher.</p>
            </div>
          </button>

          <button 
            onClick={() => { setSession(p => ({...p, mode: 'VS'})); setGameState(GameState.SELECTING); }} 
            className="glass-card p-6 rounded-[2rem] hover:border-fuchsia-500/50 transition-all group flex items-center space-x-6 text-left active:scale-95"
          >
            <div className="text-4xl group-hover:-rotate-12 transition-transform">⚔️</div>
            <div>
               <h3 className="font-black uppercase text-sm tracking-widest text-white">Duelo Local</h3>
               <p className="text-[10px] text-slate-500 font-bold italic">Desafie um amigo ao seu lado.</p>
            </div>
          </button>
        </div>
        
        <p className="text-center text-[9px] text-slate-600 font-bold leading-relaxed px-8">
          DICA: Se a vibração não funcionar, use fones de ouvido. O som foi otimizado para simular o impacto físico.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020408] text-slate-50 font-inter overflow-x-hidden">
      {feedbackType && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-xl transition-all duration-500 ${feedbackType === 'CORRECT' ? 'bg-cyan-500/20' : 'bg-red-500/20'}`}>
           <div className={`text-center animate-zoom-feedback ${feedbackType === 'INCORRECT' ? 'animate-shake' : ''}`}>
             {feedbackType === 'CORRECT' ? (
                <div className="flex flex-col items-center">
                   <div className="w-36 h-36 bg-cyan-500 rounded-full flex items-center justify-center bg-correct-glow mb-6 border-4 border-white">
                      <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                   </div>
                   <h2 className="text-7xl font-black italic text-white drop-shadow-2xl">LENDÁRIO!</h2>
                </div>
             ) : (
                <div className="flex flex-col items-center">
                   <div className="w-36 h-36 bg-red-600 rounded-full flex items-center justify-center bg-incorrect-glow mb-6 border-4 border-white">
                      <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12"></path></svg>
                   </div>
                   <h2 className="text-7xl font-black italic text-white drop-shadow-2xl">ERRADO!</h2>
                </div>
             )}
           </div>
        </div>
      )}

      <nav className="p-6 flex justify-between items-center sticky top-0 z-50">
        <span className="text-2xl font-black italic tracking-tighter bg-white text-black px-2 py-0.5 rounded cursor-pointer" onClick={() => setGameState(GameState.LOBBY)}>HB.</span>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Score</span>
            <span className="font-black text-cyan-400 text-lg">{session.score}</span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-lg py-4 px-6 pb-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-pulse">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-cyan-500/10 rounded-full"></div>
              <div className="absolute top-0 w-24 h-24 border-8 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-2xl">🧠</div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-white font-black uppercase tracking-[0.4em] text-sm text-center">Codificando Haptics...</p>
              <p className="text-slate-500 text-[10px] font-bold italic max-w-[200px] mx-auto">Gemini está traduzindo o ritmo para o motor de vibração.</p>
            </div>
          </div>
        ) : (
          <>
            {gameState === GameState.LOBBY && renderLobby()}
            
            {gameState === GameState.SELECTING && (
               <div className="space-y-8 text-center py-6 animate-zoom-feedback">
                  <div className="space-y-2">
                    <h2 className="text-5xl font-black italic leading-none">Qual o som?</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Digite uma música ou artista</p>
                  </div>
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Ex: Michael Jackson"
                      value={customSongInput}
                      onChange={(e) => setCustomSongInput(e.target.value)}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-[2.5rem] p-8 text-white focus:border-cyan-500 outline-none transition-all text-center text-xl font-bold placeholder:text-slate-700 shadow-inner"
                    />
                    <div className="absolute inset-0 rounded-[2.5rem] bg-cyan-500/5 blur-xl group-focus-within:bg-cyan-500/10 -z-10 transition-all"></div>
                  </div>
                  
                  <div className="flex flex-col space-y-4">
                    <button 
                      onClick={() => startNewGame(customSongInput)}
                      className="w-full bg-white text-black p-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                      {customSongInput ? 'Criar Desafio' : 'Sorteie uma Músicas'}
                    </button>
                    <button 
                      onClick={() => setGameState(GameState.LOBBY)}
                      className="text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                    >
                      Voltar
                    </button>
                  </div>
               </div>
            )}

            {gameState === GameState.PASSING && (
              <div className="text-center space-y-10 py-12 animate-zoom-feedback">
                <div className="text-8xl animate-bounce">📱</div>
                <div className="space-y-2">
                  <h2 className="text-5xl font-black italic uppercase leading-none">Passe o Celular</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Entregue para o desafiado</p>
                </div>
                <button 
                  onClick={() => setGameState(GameState.FEELING)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-600 p-7 rounded-[2.5rem] font-black uppercase tracking-widest text-xl shadow-2xl"
                >
                  Estou Pronto
                </button>
              </div>
            )}

            {gameState === GameState.FEELING && session.currentSong && (
              <HapticPlayer 
                pattern={session.currentSong.vibrationPattern} 
                intensityBoost={intensity}
                onFinished={() => setGameState(GameState.GUESSING)} 
              />
            )}

            {gameState === GameState.GUESSING && session.currentSong && (
              <div className="space-y-10 text-center animate-zoom-feedback">
                <div className="space-y-2">
                  <h2 className="text-5xl font-black italic tracking-tighter">O que sentiu?</h2>
                  <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.4em]">Escolha a música certa</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {session.currentSong.options.map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleGuess(opt)}
                      className="glass-card p-7 rounded-[2rem] font-black text-lg hover:bg-white/10 hover:border-cyan-500/50 transition-all active:scale-95 text-left flex justify-between items-center group border-white/5"
                    >
                      <span className="truncate pr-4">{opt}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 flex-shrink-0">GO</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gameState === GameState.RESULT && lastResult && (
               <div className="text-center space-y-8 py-6 animate-zoom-feedback">
                  <div className="text-9xl drop-shadow-2xl animate-bounce">{lastResult.correct ? '🔥' : '💀'}</div>
                  
                  <div className="space-y-1">
                    <h2 className={`text-6xl font-black italic tracking-tighter leading-none ${lastResult.correct ? 'text-cyan-400' : 'text-red-500'}`}>
                      {lastResult.correct ? 'PRECISO!' : 'ERRADO!'}
                    </h2>
                  </div>
                  
                  <div className="glass-card p-10 rounded-[3rem] border-white/10 shadow-2xl bg-white/5">
                    <p className="text-3xl font-black italic mb-1 text-white leading-tight">{lastResult.song?.title}</p>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-tighter">{lastResult.song?.artist}</p>
                  </div>

                  <div className="flex flex-col space-y-4 pt-4">
                    <button 
                      onClick={() => setGameState(GameState.LOBBY)}
                      className="bg-white text-black py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                      Tentar Outra
                    </button>
                  </div>
               </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;

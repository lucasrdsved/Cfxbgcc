
import React, { useState, useCallback } from 'react';
import { GameState, SongData, GameSession } from './types';
import { getSongChallenge } from './services/geminiService';
import HapticPlayer from './components/HapticPlayer';
import Lobby from './components/Lobby';
import Selecting from './components/Selecting';
import Guessing from './components/Guessing';
import Result from './components/Result';
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
      console.error(error);
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
      confetti({ 
        particleCount: 150, 
        spread: 70, 
        origin: { y: 0.7 }, 
        colors: ['#22d3ee', '#f472b6'] 
      });
    }
    setGameState(GameState.RESULT);
  };

  const resetToLobby = () => {
    setGameState(GameState.LOBBY);
    setCustomInput('');
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-inter selection:bg-cyan-500/20">
      {/* Navbar Minimalista */}
      <nav className="p-6 fixed top-0 w-full z-50 flex justify-between items-center bg-gradient-to-b from-[#05070a] to-transparent">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={resetToLobby}>
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
              <Lobby 
                session={session}
                useThinking={useThinking}
                setUseThinking={setUseThinking}
                intensity={intensity}
                setIntensity={setIntensity}
                onStartSolo={() => { setSession(p => ({...p, mode: 'SOLO'})); setGameState(GameState.SELECTING); }}
                onStartVS={() => { setSession(p => ({...p, mode: 'VS'})); setGameState(GameState.SELECTING); }}
              />
            )}

            {gameState === GameState.SELECTING && (
              <Selecting 
                customInput={customInput}
                setCustomInput={setCustomInput}
                onStart={startNewChallenge}
                onBack={resetToLobby}
              />
            )}

            {gameState === GameState.FEELING && session.currentSong && (
              <HapticPlayer 
                pattern={session.currentSong.vibrationPattern} 
                intensityBoost={intensity} 
                onFinished={() => setGameState(GameState.GUESSING)} 
              />
            )}

            {gameState === GameState.GUESSING && session.currentSong && (
              <Guessing 
                currentSong={session.currentSong}
                onGuess={handleGuess}
              />
            )}

            {gameState === GameState.RESULT && lastResult && (
               <Result 
                 lastResult={lastResult}
                 onNewRound={resetToLobby}
               />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

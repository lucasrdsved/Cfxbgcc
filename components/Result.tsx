
import React from 'react';
import { SongData } from '../types';

interface ResultProps {
  lastResult: { correct: boolean, song?: SongData };
  onNewRound: () => void;
}

const Result: React.FC<ResultProps> = ({ lastResult, onNewRound }) => {
  return (
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
      <button 
        onClick={onNewRound} 
        className="w-full bg-white text-black p-8 rounded-[2rem] font-black uppercase text-lg shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
      >
        Novo Round
      </button>
    </div>
  );
};

export default Result;

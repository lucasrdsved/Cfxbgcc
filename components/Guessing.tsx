
import React from 'react';
import { SongData } from '../types';

interface GuessingProps {
  currentSong: SongData;
  onGuess: (title: string) => void;
}

const Guessing: React.FC<GuessingProps> = ({ currentSong, onGuess }) => {
  return (
    <div className="space-y-10">
      <h2 className="text-5xl font-black italic tracking-tighter text-center">O que era?</h2>
      <div className="grid gap-4">
        {currentSong.options.map((opt, i) => (
          <button 
            key={i} 
            onClick={() => onGuess(opt)} 
            className="glass-card p-8 rounded-3xl font-black text-lg hover:border-cyan-400 transition-all text-left flex justify-between items-center group"
          >
            {opt}
            <span className="opacity-0 group-hover:opacity-100 text-cyan-400 transition-opacity">→</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Guessing;

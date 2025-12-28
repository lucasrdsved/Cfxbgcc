
import React from 'react';
import { GameSession } from '../types';

interface LobbyProps {
  session: GameSession;
  useThinking: boolean;
  setUseThinking: (val: boolean) => void;
  intensity: number;
  setIntensity: (val: number) => void;
  onStartSolo: () => void;
  onStartVS: () => void;
}

const Lobby: React.FC<LobbyProps> = ({
  useThinking,
  setUseThinking,
  intensity,
  setIntensity,
  onStartSolo,
  onStartVS
}) => {
  return (
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
            <input 
              type="checkbox" 
              checked={useThinking} 
              onChange={() => setUseThinking(!useThinking)} 
              className="w-6 h-6 accent-cyan-400 rounded-full cursor-pointer" 
            />
          </div>
          <div className="space-y-2 px-2">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
              <span>Potência Hática</span>
              <span>{intensity}x</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="4" 
              value={intensity} 
              onChange={(e) => setIntensity(Number(e.target.value))} 
              className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-cyan-400 cursor-pointer" 
            />
          </div>
        </div>

        <div className="grid gap-4">
          <button 
            onClick={onStartSolo} 
            className="bg-white text-black p-8 rounded-[2rem] flex items-center justify-between group hover:scale-[1.02] transition-all"
          >
            <div className="text-left">
              <h3 className="font-black uppercase text-sm tracking-widest leading-none">Modo Solo</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1">A IA escolhe o desafio</p>
            </div>
            <span className="text-3xl font-light opacity-30 group-hover:opacity-100 group-hover:translate-x-2 transition-all">→</span>
          </button>
          <button 
            onClick={onStartVS} 
            className="glass-card p-8 rounded-[2rem] flex items-center justify-between group hover:scale-[1.02] transition-all"
          >
            <div className="text-left">
              <h3 className="font-black uppercase text-sm tracking-widest leading-none">Duelo Local</h3>
              <p className="text-[10px] text-slate-500 font-bold mt-1">Desafie um amigo próximo</p>
            </div>
            <span className="text-3xl font-light opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;

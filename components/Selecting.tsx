
import React from 'react';

interface SelectingProps {
  customInput: string;
  setCustomInput: (val: string) => void;
  onStart: (query?: string) => void;
  onBack: () => void;
}

const Selecting: React.FC<SelectingProps> = ({
  customInput,
  setCustomInput,
  onStart,
  onBack
}) => {
  return (
    <div className="space-y-10 text-center">
      <h2 className="text-5xl font-black italic tracking-tighter">Qual o som?</h2>
      <input 
        type="text" 
        placeholder="Ex: Billie Jean..."
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] p-8 text-white focus:border-cyan-400 outline-none text-center text-xl font-black transition-all"
      />
      <button 
        onClick={() => onStart(customInput)} 
        className="w-full bg-cyan-400 text-black p-8 rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-xl shadow-cyan-400/20 active:scale-95 transition-all"
      >
        {customInput ? 'Gerar Desafio' : 'Sorteie uma Música'}
      </button>
      <button 
        onClick={onBack} 
        className="text-slate-600 font-black uppercase text-[10px] tracking-widest hover:text-slate-400 transition-colors"
      >
        Voltar
      </button>
    </div>
  );
};

export default Selecting;

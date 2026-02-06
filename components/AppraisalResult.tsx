import React from 'react';
import { AppraisalResult } from '../services/geminiService';
import { Button } from './Button';

interface Props {
  result: AppraisalResult;
  onClose: () => void;
}

export const AppraisalResultModal: React.FC<Props> = ({ result, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-scale-in">
      <div className="bg-slate-900/95 border border-cyan-400/50 p-1 rounded-sm w-full max-w-sm shadow-[0_0_30px_rgba(6,182,212,0.2)] relative">
        
        {/* Compact Inner Container */}
        <div className="border border-cyan-900/60 p-4 relative overflow-hidden bg-gradient-to-br from-cyan-950/20 to-slate-900">
            
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400"></div>

            {/* Header: Name + Rank */}
            <div className="flex justify-between items-start mb-2 pb-2 border-b border-cyan-800/50">
                <div className="flex flex-col">
                    <span className="text-[9px] text-cyan-600 uppercase tracking-widest system-font">ĐỐI TƯỢNG</span>
                    <span className="text-cyan-100 font-bold text-lg leading-tight text-glow">{result.targetName}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[9px] text-cyan-600 uppercase tracking-widest system-font">RANK</span>
                    <span className="text-yellow-400 font-bold text-xl leading-none text-shadow-yellow">{result.rank}</span>
                </div>
            </div>

            {/* Body: Description */}
            <div className="mb-3">
                <p className="text-xs text-cyan-200/90 font-mono italic leading-relaxed">
                    "{result.description}"
                </p>
            </div>

            {/* Footer: Value & Close */}
            <div className="flex items-center justify-between pt-2 border-t border-cyan-800/30">
                <div className="flex flex-col">
                     <span className="text-[9px] text-cyan-600 uppercase">GIÁ TRỊ</span>
                     <span className="text-sm font-bold text-yellow-200">{result.estimatedValue}</span>
                </div>
                <Button onClick={onClose} variant="secondary" className="px-3 py-1 text-xs h-8 border-cyan-800 hover:border-cyan-500 text-cyan-400 hover:text-cyan-100">
                    XÁC NHẬN
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};
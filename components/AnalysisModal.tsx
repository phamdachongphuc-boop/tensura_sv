import React from 'react';
import { EntityAnalysis } from '../services/geminiService';
import { Button } from './Button';

interface Props {
  data: EntityAnalysis;
  onClose: () => void;
}

export const AnalysisModal: React.FC<Props> = ({ data, onClose }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-scale-in">
      <div className="raphael-panel w-full max-w-md rounded-sm border border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.3)] relative overflow-hidden">
        
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

        <div className="p-5 relative z-10 font-mono">
            
            {/* Header: Icon & Name */}
            <div className="flex gap-3 mb-3 items-start">
                <div className="mt-1 w-8 h-8 border border-cyan-400 rounded-sm flex items-center justify-center bg-cyan-950/50 shrink-0">
                    <span className="text-lg text-cyan-300 font-bold">?</span>
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] text-cyan-600 uppercase tracking-widest">PHÂN TÍCH HOÀN TẤT</span>
                        <div className="flex gap-2">
                            <span className="text-[9px] bg-cyan-900/50 px-1 text-cyan-300 border border-cyan-800">{data.type}</span>
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-cyan-100 text-glow leading-tight mt-1">{data.name}</h2>
                    <div className="text-[10px] text-cyan-500 mt-0.5">{data.origin}</div>
                </div>
            </div>

            {/* Content Body */}
            <div className="space-y-3 text-xs">
                {/* Description */}
                <div className="bg-slate-900/40 p-2 border-l-2 border-cyan-500/70">
                    <p className="text-cyan-100/90 leading-relaxed">{data.description}</p>
                </div>

                {/* Usage */}
                <div className="bg-slate-900/40 p-2 border-l-2 border-yellow-500/70">
                    <span className="block text-[9px] text-yellow-500 uppercase mb-0.5 font-bold">KÍCH HOẠT</span>
                    <p className="text-yellow-100/90 leading-relaxed">{data.usage}</p>
                </div>
            </div>

            {/* Compact Footer */}
            <div className="mt-4 pt-2 border-t border-cyan-900/30 flex justify-end">
                <Button onClick={onClose} variant="ghost" className="text-xs py-1 px-4 text-cyan-400 border border-cyan-800 hover:bg-cyan-900/30 hover:border-cyan-500 hover:text-white">
                    ĐÓNG DỮ LIỆU
                </Button>
            </div>

        </div>

        {/* Subtle Background Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-5" 
             style={{ backgroundImage: 'radial-gradient(circle, #22d3ee 1px, transparent 1px)', backgroundSize: '15px 15px' }}>
        </div>
      </div>
    </div>
  );
};
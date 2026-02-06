import React from 'react';
import { RadarEntity } from '../services/geminiService';
import { Button } from './Button';

interface Props {
  entities: RadarEntity[];
  onClose: () => void;
  isLoading: boolean;
}

export const RadarDisplay: React.FC<Props> = ({ entities, onClose, isLoading }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-[2px] p-4 animate-scale-in">
      <div className="raphael-panel w-full max-w-lg rounded-sm border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.2)] relative overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Radar Scanner Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle,transparent_20%,#000_120%)]"></div>
        <div className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2 border border-cyan-500/30 rounded-full animate-pulse pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 w-[100%] h-[100%] -translate-x-1/2 -translate-y-1/2 border border-cyan-500/20 rounded-full pointer-events-none"></div>
        
        {/* Header */}
        <div className="bg-cyan-950/80 p-4 border-b border-cyan-500/50 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-yellow-400 animate-ping' : 'bg-cyan-400'}`}></div>
            <div>
                 <h2 className="text-xl font-bold text-cyan-100 system-font tracking-[0.2em] text-glow leading-none">CẢM THỤ MA LỰC</h2>
                 <span className="text-[10px] text-cyan-500 tracking-widest font-mono">MAGIC SENSE :: ACTIVE SCAN</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono relative z-10 min-h-[200px] custom-scrollbar bg-slate-900/50">
          
          {isLoading ? (
             <div className="flex flex-col items-center justify-center h-full gap-4 opacity-70">
                <div className="w-16 h-16 border-4 border-t-cyan-400 border-r-cyan-400/50 border-b-cyan-400/20 border-l-cyan-400/50 rounded-full animate-spin"></div>
                <div className="text-cyan-400 tracking-widest animate-pulse">ĐANG QUÉT XUNG QUANH...</div>
             </div>
          ) : entities.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-cyan-600">
                <span className="text-4xl mb-2 opacity-50">∅</span>
                <span>KHÔNG PHÁT HIỆN DẤU HIỆU SỰ SỐNG</span>
             </div>
          ) : (
            <div className="space-y-3">
              {entities.map((entity, idx) => {
                let colorClass = "text-white"; // LOW
                let borderClass = "border-slate-600";
                let bgClass = "bg-slate-800/40";
                let icon = "⚪";

                if (entity.magicLevel === 'MEDIUM') {
                  colorClass = "text-cyan-400"; // MEDIUM
                  borderClass = "border-cyan-600";
                  bgClass = "bg-cyan-900/20";
                  icon = "🔵";
                } else if (entity.magicLevel === 'HIGH') {
                  colorClass = "text-red-500 text-glow"; // HIGH
                  borderClass = "border-red-600";
                  bgClass = "bg-red-900/20";
                  icon = "🔴";
                }

                return (
                  <div key={idx} className={`p-3 border-l-4 ${borderClass} ${bgClass} flex justify-between items-center group animate-slide-in-right`} style={{animationDelay: `${idx * 100}ms`}}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{icon}</span>
                      <div>
                        <div className={`font-bold ${colorClass} uppercase tracking-wider text-sm`}>{entity.name}</div>
                        <div className="text-[10px] text-slate-400 flex gap-2">
                           <span>Khoảng cách: {entity.distance}</span>
                           <span className="text-slate-600">|</span>
                           <span className={entity.hostility.includes('Thù') ? 'text-red-400' : 'text-slate-400'}>{entity.hostility}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-[10px] font-bold px-2 py-1 border rounded ${borderClass} ${colorClass} opacity-80`}>
                        {entity.magicLevel}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-800/50 bg-cyan-950/80 relative z-10 flex justify-center">
             <Button onClick={onClose} variant="ghost" className="w-full text-cyan-400 border border-cyan-700 hover:bg-cyan-900/50">
                [ NGẮT KẾT NỐI ]
             </Button>
        </div>

      </div>
    </div>
  );
};
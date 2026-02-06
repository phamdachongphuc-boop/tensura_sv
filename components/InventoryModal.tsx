import React from 'react';
import { Button } from './Button';

interface Props {
  inventory: string[];
  onClose: () => void;
  onTakeItem: (item: string) => void;
  onStoreItem: () => void;
  onOpenGacha?: (item: string) => void; // Optional handler for box
}

export const InventoryModal: React.FC<Props> = ({ inventory, onClose, onTakeItem, onStoreItem, onOpenGacha }) => {
  
  const isMysteryBox = (item: string) => item.includes("Hộp Quà Bí Ẩn");

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4 animate-scale-in">
      <div className="raphael-panel w-full max-w-sm rounded-sm border-2 border-cyan-500/60 shadow-[0_0_40px_rgba(6,182,212,0.3)] relative overflow-hidden flex flex-col max-h-[70vh]">
        
        {/* Header */}
        <div className="bg-cyan-950/90 p-3 border-b border-cyan-500/50 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg animate-pulse">⬡</span>
            <h2 className="text-lg font-bold text-cyan-100 system-font tracking-widest text-glow">KHÔNG GIAN ẢO</h2>
          </div>
          <div className="text-[9px] text-cyan-500 font-mono">IMAGINARY SPACE</div>
        </div>

        {/* Inventory Grid */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-900/80 custom-scrollbar relative z-10 min-h-[200px]">
          {inventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-cyan-700 opacity-50 space-y-2">
                <span className="text-4xl">∅</span>
                <span className="text-xs font-mono">KHÔNG GIAN TRỐNG RỖNG</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {inventory.map((item, idx) => {
                  const isBox = isMysteryBox(item);
                  return (
                    <button
                    key={idx}
                    onClick={() => {
                        if (isBox && onOpenGacha) {
                            onOpenGacha(item);
                        } else {
                            onTakeItem(item);
                        }
                    }}
                    className={`group relative flex items-center justify-between p-3 border transition-all text-left
                        ${isBox 
                            ? 'bg-yellow-900/20 border-yellow-500/50 hover:bg-yellow-900/40 hover:border-yellow-400' 
                            : 'bg-cyan-900/20 border-cyan-800 hover:bg-cyan-800/40 hover:border-cyan-400'
                        }
                    `}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`${isBox ? 'text-yellow-500' : 'text-cyan-500'} text-xs font-mono group-hover:${isBox ? 'text-yellow-300' : 'text-cyan-300'}`}>[{idx + 1}]</span>
                            <span className={`${isBox ? 'text-yellow-100 text-glow' : 'text-cyan-100'} text-sm font-bold group-hover:text-white`}>{item}</span>
                        </div>
                        <span className={`text-[9px] ${isBox ? 'text-yellow-400' : 'text-cyan-600'} uppercase opacity-0 group-hover:opacity-100 transition-opacity font-bold tracking-wider`}>
                            {isBox ? 'MỞ QUÀ' : 'LẤY RA'}
                        </span>
                        {/* Hover Effect */}
                        <div className={`absolute inset-0 ${isBox ? 'bg-yellow-400/5' : 'bg-cyan-400/5'} scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}></div>
                    </button>
                  );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-cyan-800/50 bg-cyan-950/90 relative z-10 flex flex-col gap-2">
             <Button 
                onClick={onStoreItem} 
                className="w-full text-xs py-2 bg-slate-800 border-slate-600 hover:bg-cyan-900 hover:border-cyan-500 text-cyan-100 flex items-center justify-center gap-2 group"
             >
                <span className="group-hover:rotate-180 transition-transform duration-500">▼</span>
                [ THU HỒI / CẤT ĐỒ ]
             </Button>
             
             <Button onClick={onClose} variant="ghost" className="w-full text-[10px] text-cyan-600 hover:text-cyan-300">
                ĐÓNG KHÔNG GIAN
             </Button>
        </div>

        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none opacity-5" 
             style={{ backgroundImage: 'radial-gradient(circle, #22d3ee 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

      </div>
    </div>
  );
};
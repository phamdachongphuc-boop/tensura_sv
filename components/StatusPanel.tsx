
import React from 'react';
import { Character } from '../types';
import { Button } from './Button';

interface Props {
  character: Character;
  onClose: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onAnalyze: (term: string) => void;
}

export const StatusPanel: React.FC<Props> = ({ character, onClose, onRefresh, isRefreshing, onAnalyze }) => {
  const { status } = character;
  
  const hpPercent = Math.max(0, Math.min(100, (status.hp / status.maxHp) * 100));
  const mpPercent = Math.max(0, Math.min(100, (status.mp / status.maxMp) * 100));
  const isGod = !!status.isGodMode;
  const difficultyLabel = status.difficulty || 'NORMAL';

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
        case 'EASY': return 'text-green-400';
        case 'HARD': return 'text-orange-500';
        case 'INSTANT_DEATH': return 'text-red-500 animate-pulse';
        default: return 'text-cyan-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-crt-open">
      <div className="raphael-panel w-full max-w-4xl rounded-sm overflow-hidden relative border-t-2 border-cyan-400 h-[90vh] flex flex-col glow-border">
        
        <div className="absolute inset-0 pointer-events-none opacity-10" 
             style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px)', backgroundSize: '100% 4px' }}>
        </div>

        <div className="bg-cyan-950/50 p-4 border-b border-cyan-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-2xl animate-pulse">❖</span>
            <h2 className="text-2xl font-bold text-cyan-100 system-font tracking-[0.2em] text-shimmer">PHÂN TÍCH TRẠNG THÁI</h2>
          </div>
          <button onClick={onClose} className="text-cyan-600 hover:text-cyan-300 transition-colors border border-transparent hover:border-cyan-500 px-2">
            [ ĐÓNG ]
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8 font-mono relative z-10 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b border-cyan-900/50">
            <div>
                <div className="text-[10px] text-cyan-600 uppercase mb-1">Định danh</div>
                <h3 className="text-3xl font-bold text-cyan-300 text-glow flex items-center gap-2">
                    {character.name}
                    {isGod && <span className="text-purple-400 text-lg border border-purple-500 rounded px-2 bg-purple-900/50">∞ GOD</span>}
                </h3>
                <div className="text-cyan-500 mt-1">{status.evolutionStage}</div>
                <div className="mt-2 text-xs text-cyan-200">
                    <span className="opacity-60">Chủng tộc: </span>{character.race} | 
                    <span className="opacity-60 ml-2">Độ khó: </span><span className={`font-bold ${getDifficultyColor(difficultyLabel)}`}>{difficultyLabel}</span>
                </div>
                 <div className="text-xs text-cyan-200 mt-1">
                    <span className="opacity-60">Kỹ năng Độc nhất: </span>
                    <span className="text-yellow-300 cursor-pointer hover:underline" onClick={() => onAnalyze(character.uniqueSkill)}>{character.uniqueSkill}</span>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-xs font-bold text-cyan-300 mb-1">
                        <span>SINH LỰC (HP)</span>
                        <span className={isGod ? 'text-xl text-yellow-300' : ''}>
                            {isGod ? "∞ / ∞" : `${status.hp} / ${status.maxHp}`}
                        </span>
                    </div>
                    <div className="h-4 bg-slate-900/80 border border-cyan-900 relative overflow-hidden rounded-sm">
                        <div className="h-full bg-cyan-600 shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-500 fluid-bar" style={{ width: `${isGod ? 100 : hpPercent}%` }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs font-bold text-cyan-300 mb-1">
                        <span>HẠT MA TỐ (MP)</span>
                        <span className={isGod ? 'text-xl text-yellow-300' : ''}>
                            {isGod ? "∞ / ∞" : `${status.mp} / ${status.maxMp}`}
                        </span>
                    </div>
                    <div className="h-4 bg-slate-900/80 border border-cyan-900 relative overflow-hidden rounded-sm">
                        <div className="h-full bg-yellow-500 shadow-[0_0_10px_rgba(250,204,21,0.6)] transition-all duration-500 fluid-bar" style={{ width: `${isGod ? 100 : mpPercent}%` }}></div>
                    </div>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 flex flex-col gap-6">
                 <div>
                    <h4 className="text-xs font-bold text-cyan-600 uppercase tracking-widest mb-3 border-b border-cyan-800 pb-1">
                        HIỆU ỨNG (EFFECTS)
                    </h4>
                    <div className="flex flex-col gap-2">
                        {status.activeEffects.length === 0 ? (
                            <span className="text-xs text-cyan-800 italic">Không có.</span>
                        ) : (
                            status.activeEffects.map((effect, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => onAnalyze(effect)}
                                    className="text-left px-3 py-2 bg-red-900/10 border border-red-900/30 text-red-300 text-xs hover:bg-red-900/30 transition-all"
                                >
                                    {effect}
                                </button>
                            ))
                        )}
                    </div>
                 </div>

                 <div>
                    <h4 className="text-xs font-bold text-yellow-600 uppercase tracking-widest mb-3 border-b border-yellow-800/50 pb-1 animate-pulse">
                        NHIỆM VỤ TIẾN HÓA (QUESTS)
                    </h4>
                    <div className="flex flex-col gap-3">
                        {(!status.quests || status.quests.length === 0) ? (
                             <div className="text-xs text-slate-500 italic p-2 border border-dashed border-slate-700 rounded bg-slate-900/30">
                                Chưa có điều kiện tiến hóa.
                             </div>
                        ) : (
                            status.quests.map((quest) => {
                                const progress = Math.min(100, (quest.current / quest.required) * 100);
                                return (
                                    <div key={quest.id} className="bg-yellow-900/10 border border-yellow-700/40 p-3 rounded-sm relative overflow-hidden group">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-yellow-200">{quest.name}</span>
                                            {quest.isCompleted && <span className="text-[10px] bg-yellow-500 text-black px-1 font-bold rounded">HOÀN THÀNH</span>}
                                        </div>
                                        <div className="relative h-1.5 bg-slate-900 rounded-full overflow-hidden border border-yellow-900/50">
                                            <div className="absolute top-0 left-0 h-full bg-yellow-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                 </div>
              </div>

              <div className="lg:col-span-1">
                  <h4 className="text-xs font-bold text-cyan-600 uppercase tracking-widest mb-3 border-b border-cyan-800 pb-1">
                    KỸ NĂNG (SKILLS)
                 </h4>
                 <div className="flex flex-col gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                     {status.skills.map((skill, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => onAnalyze(skill)}
                            className="text-left px-3 py-2 bg-cyan-950/30 border border-cyan-800/50 text-cyan-200 text-xs hover:bg-cyan-900/50 transition-all"
                        >
                            {skill}
                        </button>
                     ))}
                 </div>
              </div>

              <div className="lg:col-span-1">
                  <h4 className="text-xs font-bold text-cyan-600 uppercase tracking-widest mb-3 border-b border-cyan-800 pb-1">
                    TÚI ĐỒ (INVENTORY)
                 </h4>
                 <div className="flex flex-col gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                     {(!status.inventory || status.inventory.length === 0) ? (
                         <span className="text-xs text-cyan-800 italic">Trống rỗng.</span>
                     ) : (
                         status.inventory.map((item, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => onAnalyze(item)}
                                className="text-left px-3 py-2 bg-slate-800/30 border border-slate-700 text-slate-300 text-xs hover:bg-cyan-900/20 transition-all"
                            >
                                {item}
                            </button>
                         ))
                     )}
                 </div>
              </div>
          </div>
        </div>

        <div className="p-4 bg-cyan-950/30 border-t border-cyan-800/50 flex justify-center shrink-0">
            <Button 
                onClick={onRefresh} 
                isLoading={isRefreshing}
                variant="ghost"
                className="w-full border border-cyan-600 text-cyan-400"
            >
                {isRefreshing ? "ĐANG ĐỒNG BỘ..." : "[ CẬP NHẬT TRẠNG THÁI ]"}
            </Button>
        </div>

      </div>
    </div>
  );
};

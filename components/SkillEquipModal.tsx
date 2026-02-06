import React from 'react';
import { Button } from './Button';

interface Props {
  skills: string[]; // All learned skills
  equippedSkills: string[];
  onClose: () => void;
  onToggleSkill: (skill: string) => void;
  onUseSkill: (skill: string) => void;
  onAnalyze: (term: string) => void;
}

export const SkillEquipModal: React.FC<Props> = ({ skills, equippedSkills, onClose, onToggleSkill, onUseSkill, onAnalyze }) => {
  
  const isEquipped = (skill: string) => equippedSkills.includes(skill);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-scale-in">
      <div className="raphael-panel w-[350px] aspect-square rounded-sm border-2 border-cyan-500/60 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative overflow-hidden flex flex-col">
        
        {/* Background Hex Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle,transparent_20%,#000_120%)]"></div>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M10 0l8.66 5v10L10 20 1.34 15V5z\' fill=\'%2306b6d4\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'}}></div>

        {/* Header */}
        <div className="bg-cyan-950/90 p-3 border-b border-cyan-500/50 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg animate-spin-slow">❂</span>
            <h2 className="text-sm font-bold text-cyan-100 system-font tracking-widest text-glow">THIẾT LẬP KỸ NĂNG</h2>
          </div>
          <div className="text-[9px] text-cyan-500 font-mono">{equippedSkills.length}/3 ACTIVE</div>
        </div>

        {/* Active Slots Display - CLICK TO USE */}
        <div className="relative z-10">
            <div className="flex justify-center gap-4 py-4 bg-slate-900/40 shrink-0">
                {[0, 1, 2].map(idx => {
                    const skill = equippedSkills[idx];
                    return (
                        <div key={idx} className="relative group">
                            <button
                                onClick={() => skill && onUseSkill(skill)}
                                disabled={!skill}
                                className={`w-12 h-12 flex items-center justify-center border-2 transform rotate-45 transition-all duration-300 relative z-10
                                    ${skill 
                                        ? 'border-cyan-400 bg-cyan-900/30 shadow-[0_0_10px_rgba(34,211,238,0.5)] cursor-pointer hover:bg-cyan-800/60 hover:scale-110 active:scale-95' 
                                        : 'border-slate-700 bg-slate-900/50 cursor-default'
                                    }
                                `}
                            >
                                <div className="transform -rotate-45 text-center">
                                    {skill ? (
                                        <span className="text-lg text-cyan-200">★</span>
                                    ) : (
                                        <span className="text-xs text-slate-600 font-mono">{idx + 1}</span>
                                    )}
                                </div>
                            </button>
                            {/* Tooltip for Skill Name */}
                            {skill && (
                                <div className="absolute top-14 left-1/2 -translate-x-1/2 w-32 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <div className="bg-black/90 text-cyan-300 text-[10px] py-1 px-2 border border-cyan-700 rounded shadow-lg">
                                        [ KÍCH HOẠT ]<br/>
                                        <span className="text-white">{skill}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="text-center text-[9px] text-cyan-600 uppercase tracking-widest mb-1 animate-pulse">
                NHẤP VÀO Ô ĐỂ KÍCH HOẠT KỸ NĂNG
            </div>
        </div>
        
        <div className="border-t border-cyan-800/30 my-1 mx-4"></div>
        <div className="text-center text-[9px] text-cyan-600 uppercase tracking-widest mb-1 mt-1">DANH SÁCH KỸ NĂNG</div>

        {/* Scrollable Skill List */}
        <div className="p-2 overflow-y-auto flex-1 custom-scrollbar relative z-10">
            {skills.length === 0 ? (
                <div className="text-center text-slate-500 text-xs mt-4">Chưa học kỹ năng nào.</div>
            ) : (
                <div className="grid grid-cols-1 gap-1.5">
                    {skills.map((skill, idx) => {
                        const active = isEquipped(skill);
                        return (
                            <div
                                key={idx}
                                className={`flex items-center justify-between px-2 py-2 border transition-all group
                                    ${active 
                                        ? 'bg-cyan-900/40 border-cyan-400 shadow-[inset_0_0_10px_rgba(34,211,238,0.2)]' 
                                        : 'bg-slate-800/30 border-slate-700 hover:border-cyan-600'
                                    }
                                `}
                            >
                                <div className="flex-1 min-w-0 mr-2 cursor-pointer" onClick={() => onToggleSkill(skill)}>
                                     <span className={`text-xs font-mono truncate block ${active ? 'text-cyan-100' : 'text-slate-400 group-hover:text-cyan-200'}`}>
                                        {skill}
                                     </span>
                                </div>

                                <div className="flex gap-2 shrink-0">
                                    {/* Info Button */}
                                    <button 
                                        onClick={() => onAnalyze(skill)}
                                        className="w-5 h-5 flex items-center justify-center border border-slate-600 bg-slate-900/50 text-cyan-500 hover:text-white hover:border-cyan-400 hover:bg-cyan-900 rounded-sm transition-colors text-[10px]"
                                        title="Xem thông tin"
                                    >
                                        ?
                                    </button>
                                    
                                    {/* Equip/Unequip Button */}
                                    <button 
                                        onClick={() => onToggleSkill(skill)}
                                        className={`w-5 h-5 flex items-center justify-center border rounded-sm transition-colors text-[10px]
                                            ${active
                                                ? 'border-red-500/50 text-red-400 hover:bg-red-900/30 hover:text-red-200'
                                                : 'border-cyan-700/50 text-cyan-600 hover:bg-cyan-900/30 hover:text-cyan-200'
                                            }
                                        `}
                                        title={active ? "Thu hồi" : "Trang bị"}
                                    >
                                        {active ? 'x' : '+'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-cyan-800/50 bg-cyan-950/90 relative z-10 flex justify-center shrink-0">
             <Button onClick={onClose} variant="ghost" className="w-full text-xs py-1 text-cyan-400 border border-transparent hover:border-cyan-700 hover:bg-cyan-900/30">
                [ ĐÓNG ]
             </Button>
        </div>

      </div>
    </div>
  );
};
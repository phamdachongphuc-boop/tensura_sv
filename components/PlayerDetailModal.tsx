
import React from 'react';
import { CharacterStatus } from '../types';
import { Button } from './Button';

interface Props {
  username: string;
  avatar: string;
  customAvatar?: string;
  race: string;
  status: CharacterStatus;
  onClose: () => void;
}

export const PlayerDetailModal: React.FC<Props> = ({ username, avatar, customAvatar, race, status, onClose }) => {
  const hpPercent = Math.max(0, Math.min(100, (status.hp / status.maxHp) * 100));
  const mpPercent = Math.max(0, Math.min(100, (status.mp / status.maxMp) * 100));
  const isGod = !!status.isGodMode;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-scale-in">
      <div className="raphael-panel w-full max-w-lg rounded-lg border border-cyan-500/50 shadow-[0_0_60px_rgba(6,182,212,0.3)] relative overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Background Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-10" 
             style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(6, 182, 212, .3) 25%, rgba(6, 182, 212, .3) 26%, transparent 27%, transparent 74%, rgba(6, 182, 212, .3) 75%, rgba(6, 182, 212, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(6, 182, 212, .3) 25%, rgba(6, 182, 212, .3) 26%, transparent 27%, transparent 74%, rgba(6, 182, 212, .3) 75%, rgba(6, 182, 212, .3) 76%, transparent 77%, transparent)', backgroundSize: '30px 30px' }}>
        </div>

        {/* HEADER */}
        <div className="bg-cyan-950/90 p-4 border-b border-cyan-500/50 flex justify-between items-center relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔍</span>
            <div>
                 <h2 className="text-xl font-bold text-cyan-100 system-font tracking-widest text-glow">
                    THÔNG TIN ĐỐI TƯỢNG
                 </h2>
                 <span className="text-[10px] text-cyan-500 font-mono">ANALYSIS RESULT</span>
            </div>
          </div>
          <button onClick={onClose} className="text-cyan-500 hover:text-white px-2">✕</button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto custom-scrollbar relative z-10 space-y-6 bg-slate-900/60">
            
            {/* Identity Card */}
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 border border-cyan-800 rounded">
                <div className="w-16 h-16 rounded-full border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] overflow-hidden shrink-0 bg-black flex items-center justify-center">
                    {customAvatar ? (
                        <img src={customAvatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl">{avatar}</span>
                    )}
                </div>
                <div>
                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                        {username}
                        {isGod && <span className="text-purple-400 text-xs border border-purple-500 px-1 rounded bg-purple-900/50">GOD</span>}
                    </div>
                    <div className="text-xs text-cyan-400 font-mono flex items-center gap-2">
                        <span>{race}</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-yellow-500">{status.evolutionStage}</span>
                    </div>
                </div>
            </div>

            {/* Vitals */}
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-xs font-bold text-cyan-300 mb-1">
                        <span>SINH LỰC (HP)</span>
                        <span className={isGod ? 'text-lg text-yellow-300' : 'font-mono'}>
                            {isGod ? "∞ / ∞" : `${status.hp.toLocaleString()} / ${status.maxHp.toLocaleString()}`}
                        </span>
                    </div>
                    <div className="h-3 bg-slate-900 border border-cyan-900/50 rounded-sm overflow-hidden relative">
                        <div className="absolute inset-0 bg-red-900/20"></div>
                        <div className="h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ width: `${isGod ? 100 : hpPercent}%` }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs font-bold text-cyan-300 mb-1">
                        <span>NĂNG LƯỢNG (MP)</span>
                        <span className={isGod ? 'text-lg text-yellow-300' : 'font-mono'}>
                            {isGod ? "∞ / ∞" : `${status.mp.toLocaleString()} / ${status.maxMp.toLocaleString()}`}
                        </span>
                    </div>
                    <div className="h-3 bg-slate-900 border border-cyan-900/50 rounded-sm overflow-hidden relative">
                        <div className="absolute inset-0 bg-yellow-900/20"></div>
                        <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]" style={{ width: `${isGod ? 100 : mpPercent}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Skills */}
            <div>
                <div className="flex items-center gap-2 mb-3 border-b border-cyan-800 pb-1">
                    <span className="text-cyan-400">⚡</span>
                    <h3 className="text-sm font-bold text-cyan-200 uppercase tracking-wider">KỸ NĂNG ĐÃ HỌC</h3>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {status.skills.length === 0 ? (
                        <div className="text-center text-slate-500 text-xs italic py-4">Không phát hiện kỹ năng nào.</div>
                    ) : (
                        status.skills.map((skill, idx) => (
                            <div key={idx} className="bg-cyan-950/30 border border-cyan-900/50 px-3 py-2 text-xs text-cyan-100 rounded hover:bg-cyan-900/50 transition-colors flex items-center justify-between">
                                <span>{skill}</span>
                                {status.equippedSkills.includes(skill) && (
                                    <span className="text-[9px] bg-yellow-600 text-black px-1 rounded font-bold">EQUIPPED</span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-cyan-950/80 border-t border-cyan-800/50 flex justify-center shrink-0">
            <Button onClick={onClose} variant="ghost" className="border-cyan-700 text-cyan-400 w-full hover:bg-cyan-900/50">
                [ ĐÓNG DỮ LIỆU ]
            </Button>
        </div>

      </div>
    </div>
  );
};

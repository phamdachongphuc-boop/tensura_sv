
import React, { useState, useEffect, useRef } from 'react';
import { BattleState, Character, UserProfile } from '../types';
import { Button } from './Button';
import { authService } from '../services/authService';

interface Props {
  battle: BattleState;
  currentUser: UserProfile;
  userCharacter: Character;
  onClose: () => void;
}

const ULTIMATE_KEYWORDS = ['thần', 'vương', 'long', 'bạo thực', 'raphael', 'uriel', 'michael', 'sariel', 'metatron', 'raguel', 'gabriel', 'beelzebuth', 'lucifer', 'mammon', 'satanael', 'leviathan', 'belphegor', 'asmodeus', 'veldora'];
const GENESIS_KEYWORDS = ['hư không', 'azathoth', 'cthugha', 'sáng thế', 'vô hạn', 'bất diệt', 'god', 'infinity', 'chaos', 'void', '∞'];

export const PvPArena: React.FC<Props> = ({ battle, currentUser, userCharacter, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTurnRef = useRef<number>(0); // Track processed turns to trigger FX only once

  // FX STATE
  const [activeFx, setActiveFx] = useState<{type: 'NORMAL' | 'ULTIMATE' | 'GENESIS', skillName: string} | null>(null);

  const isFinished = battle.status === 'FINISHED';
  const isMyTurn = battle.turn === currentUser.username;
  
  const myHp = currentUser.username === battle.challenger ? battle.p1_hp : battle.p2_hp;
  const myMaxHp = currentUser.username === battle.challenger ? battle.p1_max_hp : battle.p2_max_hp;
  
  const opponentName = currentUser.username === battle.challenger ? battle.target : battle.challenger;
  const opponentHp = currentUser.username === battle.challenger ? battle.p2_hp : battle.p1_hp;
  const opponentMaxHp = currentUser.username === battle.challenger ? battle.p2_max_hp : battle.p1_max_hp;

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    // TRIGGER ANIMATION ON NEW LOG
    if (battle.logs && battle.logs.length > 0) {
        const latestLog = battle.logs[battle.logs.length - 1];
        // Ensure log type is Log entry and not metadata
        if ('skill' in latestLog && latestLog.turn > lastTurnRef.current) {
            lastTurnRef.current = latestLog.turn;
            
            const skillName = latestLog.skill;
            const skillLower = skillName.toLowerCase();
            
            // Determine Tier
            let tier: 'NORMAL' | 'ULTIMATE' | 'GENESIS' = 'NORMAL';
            if (GENESIS_KEYWORDS.some(k => skillLower.includes(k))) {
                tier = 'GENESIS';
            } else if (ULTIMATE_KEYWORDS.some(k => skillLower.includes(k))) {
                tier = 'ULTIMATE';
            }

            // Set FX Active
            setActiveFx({ type: tier, skillName });
            
            // Auto Clear FX after duration
            setTimeout(() => {
                setActiveFx(null);
            }, tier === 'GENESIS' ? 3000 : tier === 'ULTIMATE' ? 2000 : 500);
        }
    }
  }, [battle.logs]);

  const handleSurrender = async () => {
      if (confirm("Bạn có chắc chắn muốn đầu hàng? Bạn sẽ mất 30% sức mạnh.")) {
          setIsProcessing(true);
          await authService.surrenderBattle(battle.id, currentUser.username);
      }
  };

  const handleUseSkill = async (skill: string) => {
      if (!isMyTurn || isProcessing) return;
      
      setIsProcessing(true);
      await authService.performBattleAction(battle, currentUser, skill, userCharacter);
      // Wait a bit to prevent double clicks
      setTimeout(() => setIsProcessing(false), 500);
  };

  const getHpColor = (current: number, max: number) => {
      const pct = (current / max);
      if (pct > 0.5) return 'bg-green-500';
      if (pct > 0.2) return 'bg-yellow-500';
      return 'bg-red-500';
  };

  const getSkillCost = (skill: string) => {
      if (skill === 'Đánh thường') return 0;
      const lower = skill.toLowerCase();
      if (GENESIS_KEYWORDS.some(k => lower.includes(k))) return 0; // Genesis usually God Mode (Inf)
      if (ULTIMATE_KEYWORDS.some(k => lower.includes(k))) return 50;
      return 20;
  };

  // Helper to style log messages based on effects
  const renderLogMessage = (log: any) => {
      let effectClass = "text-white";
      let containerClass = "border-slate-600";
      
      if (log.effect === 'CRIT') {
          effectClass = "text-yellow-400 font-bold text-shadow-yellow";
          containerClass = "border-yellow-600 bg-yellow-900/10";
      } else if (log.effect === 'DOUBLE') {
          effectClass = "text-red-500 font-black animate-pulse text-glow";
          containerClass = "border-red-600 bg-red-900/20";
      } else if (log.effect === 'LIFESTEAL') {
          effectClass = "text-pink-400";
          containerClass = "border-pink-600 bg-pink-900/10";
      } else if (log.effect === 'STUN') {
          effectClass = "text-cyan-400 animate-pulse";
          containerClass = "border-cyan-600 bg-cyan-900/20";
      } else if (log.description.includes("HƯ KHÔNG") || log.description.includes("∞")) {
          // Genesis Effect
          effectClass = "text-purple-300 text-shadow-gold";
          containerClass = "border-purple-500 bg-purple-900/30";
      }

      return (
         <div className={`mb-2 text-sm font-mono border-l-2 pl-2 py-1 rounded-r animate-slide-up ${containerClass}`}>
             <div>
                 <span className="text-yellow-600 text-[10px]">Turn {log.turn}: </span>
                 <span className="font-bold text-cyan-300">{log.actor}</span>
             </div>
             <div className="text-xs text-slate-300">
                 Thi triển: <span className="font-bold text-white">[{log.skill}]</span>
             </div>
             <div className={`${effectClass} mt-1`}>
                 {log.description}
             </div>
         </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-900 text-white animate-fade-in overflow-hidden">
        
        {/* --- FX OVERLAY LAYER --- */}
        {activeFx && (
            <div className={`absolute inset-0 pointer-events-none flex items-center justify-center z-[300]
                ${activeFx.type === 'GENESIS' ? 'fx-genesis-overlay' : ''}
            `}>
                {/* 1. NORMAL SLASH */}
                {activeFx.type === 'NORMAL' && (
                    <div className="anim-slash"></div>
                )}

                {/* 2. ULTIMATE BURST */}
                {activeFx.type === 'ULTIMATE' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center fx-shake">
                        <div className="absolute inset-0 fx-ultimate-bg mix-blend-screen"></div>
                        <div className="relative z-10 text-center">
                            <div className="text-yellow-300 font-black text-4xl md:text-6xl tracking-[0.2em] text-glow animate-pulse">
                                ULTIMATE SKILL
                            </div>
                            <div className="h-[2px] w-full bg-yellow-500 my-2"></div>
                            <div className="text-white font-serif text-2xl md:text-3xl italic text-shadow-gold">
                                "{activeFx.skillName}"
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. GENESIS / GOD MODE */}
                {activeFx.type === 'GENESIS' && (
                    <div className="relative z-10 text-center w-full">
                        <div className="text-purple-400 font-black text-6xl md:text-8xl tracking-[0.5em] fx-genesis-text drop-shadow-[0_0_20px_rgba(168,85,247,1)]">
                            ∞ VOID ∞
                        </div>
                        <div className="text-white font-mono text-xl mt-4 animate-pulse tracking-widest text-shadow-gold">
                            THỰC TẠI ĐANG BỊ PHÁ VỠ...
                        </div>
                        <div className="text-fuchsia-300 text-3xl font-bold mt-2 font-serif">
                            "{activeFx.skillName}"
                        </div>
                    </div>
                )}
            </div>
        )}

        <div className="bg-red-950/80 p-2 flex justify-between items-center border-b border-red-600 shadow-md relative z-[201]">
            <span className="font-bold text-red-100 system-font tracking-widest">KHÔNG GIAN ĐẤU TRƯỜNG</span>
            <div className="flex items-center gap-2">
                 <span className="text-xs text-red-400 font-mono">ID: {battle.id}</span>
                 {/* SURRENDER FLAG BUTTON */}
                 {!isFinished && (
                     <button 
                        onClick={handleSurrender}
                        className="w-8 h-8 flex items-center justify-center bg-green-900/50 border border-green-500 rounded hover:bg-green-800 transition-colors"
                        title="Đầu hàng"
                     >
                        🏳️
                     </button>
                 )}
            </div>
        </div>
        
        <div className={`flex-1 relative overflow-hidden flex flex-col transition-all duration-100 ${activeFx?.type === 'GENESIS' ? 'filter grayscale contrast-150 blur-[1px]' : ''}`}>
            {/* Environment BG */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-30 pointer-events-none"></div>

            <div className={`flex justify-between items-center p-6 md:p-12 relative z-10 h-1/2 ${activeFx?.type === 'ULTIMATE' ? 'scale-95 transition-transform' : ''}`}>
                <div className="text-center relative group">
                    <div className={`w-20 h-20 md:w-32 md:h-32 border-4 rounded-full bg-slate-800 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] z-10 relative transition-transform duration-300 hover:scale-105 ${isMyTurn ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.8)]' : 'border-slate-600'}`}>
                        <span className="text-4xl">👤</span>
                    </div>
                    <div className="mt-2 bg-black/50 px-3 py-1 rounded text-cyan-300 font-bold border border-cyan-500/30">{currentUser.username}</div>
                    <div className="text-xs text-white font-mono bg-black/50 rounded mt-1">{myHp.toLocaleString()}/{myMaxHp.toLocaleString()} HP</div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="text-5xl text-red-500 font-black italic drop-shadow-[0_0_10px_rgba(220,38,38,0.8)] animate-pulse">VS</div>
                    <div className="text-xs text-yellow-500 mt-2 font-mono tracking-widest text-center">
                        REAL-TIME PVP<br/>
                        <span className="text-[10px] text-slate-400">Min Dmg: 250k</span>
                    </div>
                </div>

                <div className="text-center group">
                    <div className={`w-20 h-20 md:w-32 md:h-32 border-4 rounded-full bg-slate-800 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-transform duration-300 hover:scale-105 ${!isMyTurn ? 'border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.8)]' : 'border-slate-600'}`}>
                        <span className="text-4xl">👹</span>
                    </div>
                    <div className="mt-2 bg-black/50 px-3 py-1 rounded text-red-300 font-bold border border-red-500/30">{opponentName}</div>
                    <div className="text-xs text-white font-mono bg-black/50 rounded mt-1">{opponentHp.toLocaleString()}/{opponentMaxHp.toLocaleString()} HP</div>
                </div>
            </div>

            <div className="flex-1 bg-black/60 p-4 overflow-y-auto custom-scrollbar border-t border-slate-700 relative z-10">
                {battle.logs && battle.logs.length === 0 && <div className="text-center text-slate-500 italic">Trận đấu bắt đầu...</div>}
                {battle.logs && battle.logs.map((log, i) => (
                     <div key={i}>{renderLogMessage(log)}</div>
                ))}
                <div ref={scrollRef} />
            </div>

            {isFinished && (
                <div className="absolute inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="text-center p-6 border-2 border-yellow-500 bg-yellow-900/50 rounded animate-scale-in my-4 backdrop-blur-md relative overflow-hidden max-w-md w-full mx-4 shadow-[0_0_50px_rgba(234,179,8,0.4)]">
                        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle,transparent_20%,#450a0a_120%)]"></div>
                        
                        <h2 className="text-4xl font-bold mb-2 system-font tracking-widest text-glow uppercase animate-bounce">
                            {battle.winner === currentUser.username ? <span className="text-yellow-400">CHIẾN THẮNG</span> : <span className="text-red-500">THẤT BẠI</span>}
                        </h2>
                        
                        <div className="text-white font-mono space-y-4 relative z-10 mt-6">
                            <p className="text-lg font-bold">
                                {battle.winner === currentUser.username 
                                    ? "Bạn đã tước đoạt sức mạnh đối thủ!" 
                                    : "Bạn đã bị đối thủ tước đoạt sức mạnh!"}
                            </p>
                            
                            <div className="bg-black/60 p-4 rounded border border-yellow-700/50 text-sm">
                                <div className="grid grid-cols-1 gap-2 text-center">
                                    <div className="font-bold border-b border-white/10 pb-2 mb-2">THÔNG BÁO HỆ THỐNG</div>
                                    <div className={battle.winner === currentUser.username ? "text-green-400" : "text-red-400"}>
                                        {battle.winner === currentUser.username ? "▲" : "▼"} 30% CHỈ SỐ SỨC MẠNH
                                    </div>
                                    <div className={battle.winner === currentUser.username ? "text-green-400" : "text-red-400"}>
                                        {battle.winner === currentUser.username ? "▲" : "▼"} 30% HP & MP TỐI ĐA
                                    </div>
                                    <div className="text-xs text-slate-400 mt-2 italic">
                                        (Cập nhật đã được lưu vào cơ sở dữ liệu)
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                             <Button onClick={onClose} variant="primary" className="w-full border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                                 XÁC NHẬN & QUAY VỀ
                             </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* CONTROLS */}
        <div className="p-4 bg-cyan-900/20 border-t border-cyan-600 relative z-10">
            <div className="mb-4">
                <div className="flex justify-between items-end mb-1 text-cyan-400 font-bold">
                    <span className="text-xl uppercase">{currentUser.username}</span>
                    <div className="text-right">
                        <div className="text-[10px] text-cyan-600">SINH LỰC</div>
                    </div>
                </div>
                <div className="h-4 bg-slate-900 border border-cyan-800 rounded-sm relative overflow-hidden mb-1">
                    <div className={`h-full transition-all duration-500 ${getHpColor(myHp, myMaxHp)}`} style={{width: `${(myHp/myMaxHp)*100}%`}}></div>
                </div>
            </div>

            {!isFinished && (
                <div className="grid grid-cols-2 gap-2">
                     {isMyTurn ? (
                         <>
                             <Button onClick={() => handleUseSkill("Đánh thường")} disabled={isProcessing} className="bg-slate-700 hover:bg-slate-600 text-sm py-3">
                                 👊 Đánh thường
                             </Button>
                             {userCharacter.status.equippedSkills.map((skill, i) => {
                                 const isUlt = ULTIMATE_KEYWORDS.some(k => skill.toLowerCase().includes(k));
                                 const isGenesis = GENESIS_KEYWORDS.some(k => skill.toLowerCase().includes(k));
                                 const cost = getSkillCost(skill);

                                 return (
                                    <Button 
                                        key={i} 
                                        onClick={() => handleUseSkill(skill)} 
                                        disabled={isProcessing} 
                                        className={`text-sm py-3 truncate relative overflow-hidden group flex flex-col items-center justify-center
                                            ${isGenesis
                                                ? 'bg-gradient-to-r from-purple-900 to-black border-purple-500 text-fuchsia-200 shadow-[0_0_20px_rgba(168,85,247,0.8)] border-2 animate-pulse'
                                                : isUlt 
                                                    ? 'bg-gradient-to-r from-red-900 to-yellow-900 border-yellow-500 text-yellow-100 shadow-[0_0_15px_rgba(234,179,8,0.5)] border' 
                                                    : 'bg-cyan-700 hover:bg-cyan-600'
                                            }
                                        `} 
                                        title={skill}
                                    >
                                        <span className="relative z-10 font-bold">{isGenesis ? '∞ ' : isUlt ? '★ ' : '⚡ '}{skill}</span>
                                        <span className={`text-[9px] ${isGenesis ? 'text-purple-300' : 'text-yellow-300'}`}>{cost} Energy</span>
                                    </Button>
                                 )
                             })}
                         </>
                     ) : (
                         <div className="col-span-2 text-center text-red-400 font-bold animate-pulse py-4 border border-red-900/50 bg-red-900/10 rounded flex flex-col items-center justify-center">
                             <span>ĐỐI THỦ ĐANG SUY NGHĨ...</span>
                         </div>
                     )}
                </div>
            )}
        </div>
    </div>
  );
};

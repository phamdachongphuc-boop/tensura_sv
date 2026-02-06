
import React, { useEffect, useState, useRef } from 'react';
import { Character, CharacterStatus, Mail } from '../types';
import { Button } from './Button';
import { authService } from '../services/authService';
import { PlayerDetailModal } from './PlayerDetailModal';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string; 
  username: string; 
  avatar: string; 
  customAvatar?: string; 
  daysSurvived: number;
  ultimateSkillCount: number;
  powerLevel: number; 
  race: string;
  isCurrentUser?: boolean;
  isOnline: boolean;
  detailStatus?: CharacterStatus; 
  isGodMode?: boolean;
}

interface Props {
  currentUserCharacter: Character;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<Props> = ({ currentUserCharacter, onClose }) => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); 
  const [isLoading, setIsLoading] = useState(true);
  const [serverName, setServerName] = useState("");

  const [selectedUserForMenu, setSelectedUserForMenu] = useState<string | null>(null);
  const [showActionButtons, setShowActionButtons] = useState(false); 
  
  const [viewingPlayer, setViewingPlayer] = useState<LeaderboardEntry | null>(null);
  const [deleteConfirmationTarget, setDeleteConfirmationTarget] = useState<string | null>(null);

  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftTargetUser, setGiftTargetUser] = useState<string | null>(null);
  const [giftType, setGiftType] = useState<'SKILL' | 'ITEM'>('ITEM');
  const [giftName, setGiftName] = useState('');
  const [giftMessage, setGiftMessage] = useState('Phần quà trao bởi Admin.');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const init = async () => {
        const sessionUser = await authService.getCurrentUser();
        if (sessionUser) {
            if (sessionUser.isAdmin) setIsAdmin(true);
            if (sessionUser.username === authService.ADMIN_ID) {
                setIsAdmin(true);
                setIsSuperAdmin(true);
            }
        }
        setServerName(authService.getServerName());
        await refreshLeaderboard();
    };
    init();

    const unsubscribe = authService.subscribeToChanges(() => {
        refreshLeaderboard(true);
    });

    return () => {
        unsubscribe();
    };
  }, [currentUserCharacter]);

  const refreshLeaderboard = async (silent = false) => {
    if (!silent) setIsLoading(true);
    
    const allUsers = await authService.getAllUsers();
    const currentSessionUser = await authService.getCurrentUser();

    const entries: LeaderboardEntry[] = allUsers.map((user) => {
        if (user.isBanned) return null;
        if (user.username === authService.ADMIN_ID) return null;

        const saveData = user.saveData;
        let charName = "Unknown Entity";
        let days = 0;
        let power = 0;
        let skillCount = 0;
        let race = "Spirit";
        let avatar = "👤";
        let customAvatar = undefined;
        let detailStatus: CharacterStatus | undefined = undefined;
        let isGodMode = false;

        if (saveData && saveData.character) {
            const char = saveData.character;
            const history = saveData.chatHistory || [];
            charName = char.name;
            race = char.race;
            skillCount = char.status.skills.length;
            detailStatus = char.status;
            isGodMode = !!char.status.isGodMode;
            customAvatar = char.customAvatar;
            days = Math.max(1, Math.floor(history.length / 10));

            if (isGodMode) {
                power = Infinity;
            } else {
                power = (char.status.hp + char.status.maxMp) * 10 + (skillCount * 1000);
            }

            if (race.includes("Slime")) avatar = "💧";
            else if (race.includes("Human")) avatar = "🧑";
            else if (race.includes("Dragon")) avatar = "🐲";
            else avatar = "👤";
        }

        const isMe = currentSessionUser ? user.username === currentSessionUser.username : false;
        const now = Date.now();
        const lastActive = user.lastActive || 0;
        const isOnline = (now - lastActive) < 2 * 60 * 1000;

        return {
            id: user.username, rank: 0, name: charName, username: user.username,
            avatar, customAvatar, daysSurvived: days, ultimateSkillCount: skillCount,
            powerLevel: power, race, isCurrentUser: isMe, isOnline: isOnline || isMe,
            detailStatus, isGodMode
        };
    }).filter(e => e !== null) as LeaderboardEntry[];

    entries.sort((a, b) => b.powerLevel - a.powerLevel);
    const rankedEntries = entries.slice(0, 100).map((entry, index) => ({ ...entry, rank: index + 1 }));

    setData(rankedEntries);
    if (!silent) setIsLoading(false);
  };

  const handleUserClick = (entry: LeaderboardEntry) => {
      if (entry.isCurrentUser) return;
      if (selectedUserForMenu === entry.username) {
          setSelectedUserForMenu(null);
          setShowActionButtons(false);
      } else {
          setSelectedUserForMenu(entry.username);
          setShowActionButtons(true); 
      }
  };

  const handleChallenge = async (entry: LeaderboardEntry) => {
      if (!entry.detailStatus) return;
      const me = await authService.getCurrentUser();
      if (!me) return;
      const myData = await authService.loadGameData(me.username);
      if (!myData || !myData.character) return;
      
      const p1_max = myData.character.status.maxHp;
      const p2_max = entry.detailStatus.maxHp;
      const result = await authService.createBattle(me.username, entry.username, p1_max, p1_max, p2_max, p2_max);
      
      if (result === true) {
          alert(`Đã gửi thách đấu tới [${entry.username}]!`);
          onClose();
      } else {
          alert("Lỗi tạo trận đấu.");
      }
  };

  const getRankStyle = (rank: number, isGodMode?: boolean) => {
    if (isGodMode) return "border-purple-500 bg-purple-900/40 shadow-[0_0_15px_rgba(168,85,247,0.4)]";
    switch (rank) {
      case 1: return "border-yellow-400 bg-yellow-900/20";
      default: return "border-cyan-900 bg-slate-900/40";
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-scale-in">
      <div className="raphael-panel w-full max-w-2xl h-[85vh] rounded-lg border border-cyan-500/50 flex flex-col">
        <div className="bg-cyan-950/80 p-4 border-b border-cyan-500/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <span className="text-xl">🏆</span>
             <h2 className="text-xl font-bold text-cyan-100 system-font tracking-widest whitespace-nowrap">CAO THỦ CHUYỂN SINH</h2>
          </div>
          <Button onClick={onClose} variant="ghost" className="text-cyan-400 whitespace-nowrap">[ X ]</Button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {isLoading ? <div className="text-center text-cyan-400">Đang tải...</div> : 
             data.map((entry) => (
                <div 
                    key={entry.id}
                    onClick={() => handleUserClick(entry)}
                    className={`relative grid grid-cols-12 gap-2 items-center p-3 rounded border transition-all cursor-pointer ${getRankStyle(entry.rank, entry.isGodMode)}`}
                >
                    <div className="col-span-2 text-center text-xl font-bold whitespace-nowrap">
                        {entry.isGodMode ? <span className="text-purple-300">∞</span> : entry.rank}
                    </div>
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700 shrink-0">
                             {entry.customAvatar ? <img src={entry.customAvatar} className="w-full h-full object-cover"/> : entry.avatar}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold truncate text-sm text-cyan-100 flex items-center gap-1 whitespace-nowrap">
                                {entry.username}
                                {entry.isGodMode && <span className="text-[8px] bg-purple-600 px-1 rounded whitespace-nowrap">GOD</span>}
                            </span>
                        </div>
                    </div>
                    <div className="col-span-3 text-right text-xs font-mono text-cyan-200 whitespace-nowrap">
                        {entry.isGodMode ? "∞" : entry.powerLevel.toLocaleString()}
                    </div>
                    <div className="col-span-2 text-right font-bold text-xs whitespace-nowrap">{entry.daysSurvived}d</div>

                    {selectedUserForMenu === entry.username && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-50 flex items-center bg-slate-900 border border-cyan-500 rounded px-2 py-1 animate-scale-in">
                            <button onClick={(e) => { e.stopPropagation(); handleChallenge(entry); }} className="w-8 h-8 flex items-center justify-center bg-red-900/50 border border-red-600 rounded text-red-400 font-bold" title="KHIÊU CHIẾN">⚔</button>
                        </div>
                    )}
                </div>
             ))
            }
        </div>
      </div>
    </div>
  );
};

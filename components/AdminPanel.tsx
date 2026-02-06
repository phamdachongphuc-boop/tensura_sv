
import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { Button } from './Button';
import { Mail, Character, GAME_SERVERS } from '../types';
import { LeaderboardModal } from './LeaderboardModal';

interface Props {
  onLogout: () => void;
  onEnterGame: () => void; 
}

export const AdminPanel: React.FC<Props> = ({ onLogout, onEnterGame }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentServerName, setCurrentServerName] = useState(authService.getServerName());
  
  const [showPlayerListModal, setShowPlayerListModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showSQLModal, setShowSQLModal] = useState(false);
  
  const [deleteConfirmationTarget, setDeleteConfirmationTarget] = useState<string | null>(null);

  const [selectedUserForAction, setSelectedUserForAction] = useState<string | null>(null); 
  const [menuExpanded, setMenuExpanded] = useState(false); 

  const [giftTarget, setGiftTarget] = useState<string | null>(null);
  const [giftType, setGiftType] = useState<'SKILL' | 'ITEM'>('ITEM');
  const [giftName, setGiftName] = useState('');
  const [giftMessage, setGiftMessage] = useState('Phần thưởng tối cao từ Đấng Sáng Tạo.');

  const refreshUsers = async () => {
    setIsLoading(true);
    const allUsers = await authService.getAllUsers();
    setUsers(allUsers);
    setIsLoading(false);
  };

  useEffect(() => {
    if (showPlayerListModal) {
        refreshUsers();
    }
  }, [showPlayerListModal]);

  const handleSwitchServer = (serverId: string) => {
      authService.setServer(serverId);
      setCurrentServerName(authService.getServerName());
      if (showPlayerListModal) {
          refreshUsers();
      }
  };

  const handleUserRowClick = (username: string) => {
    if (selectedUserForAction === username) {
        setSelectedUserForAction(null);
        setMenuExpanded(false);
    } else {
        setSelectedUserForAction(username);
        setMenuExpanded(false); 
    }
  };

  const handleHamburgerClick = (e: React.MouseEvent) => {
      e.stopPropagation(); 
      setMenuExpanded(true);
  };

  const handleBanClick = async (e: React.MouseEvent, username: string) => {
      e.stopPropagation();
      if (window.confirm(`CẢNH BÁO: Bạn có chắc muốn KHÓA (BAN) tài khoản [${username}]? Người dùng sẽ không thể đăng nhập.`)) {
          await authService.banUser(username);
          await refreshUsers();
          setSelectedUserForAction(null);
          setMenuExpanded(false);
      }
  };

  const handleDeleteClick = (e: React.MouseEvent, username: string) => {
      e.stopPropagation();
      setDeleteConfirmationTarget(username);
  };

  const executeDelete = async () => {
      if (deleteConfirmationTarget) {
          await authService.adminDeleteUser(deleteConfirmationTarget);
          await refreshUsers();
          setDeleteConfirmationTarget(null);
          setSelectedUserForAction(null);
          setMenuExpanded(false);
      }
  };

  const handleGiftClick = (e: React.MouseEvent, username: string) => {
      e.stopPropagation();
      setGiftTarget(username);
      setGiftName('');
      setGiftMessage('Phần quà đặc biệt trao bởi Admin pojani0b. Chúc bạn may mắn trong hành trình chuyển sinh.');
      setShowGiftModal(true);
  };

  const handleSendGift = async (e: React.FormEvent) => {
      e.preventDefault();
      if (giftTarget && giftName) {
          if (giftName.includes("∞")) {
              const targetData = await authService.loadGameData(giftTarget);
              if (targetData && targetData.character) {
                  const GOD_HP = 1_000_000_000_000_000;
                  const GOD_STAT = 1_000_000_000;

                  targetData.character.status.hp = GOD_HP;
                  targetData.character.status.maxHp = GOD_HP;
                  targetData.character.status.mp = GOD_HP;
                  targetData.character.status.maxMp = GOD_HP;
                  
                  targetData.character.attributes.strength = GOD_STAT;
                  targetData.character.attributes.magic = GOD_STAT;
                  targetData.character.attributes.agility = GOD_STAT;
                  targetData.character.attributes.defense = GOD_STAT;
                  
                  targetData.character.status.isGodMode = true;
                  targetData.character.status.evolutionStage = "∞ THE CREATOR ∞";

                  await authService.saveGameData(giftTarget, targetData);
                  alert(`Đã kích hoạt chế độ VÔ HẠN (GOD MODE) cho người chơi [${giftTarget}]!`);
              }
          }

          await authService.sendMail(giftTarget, {
              sender: "pojani0b (Admin)",
              title: "Quà tặng từ Admin",
              content: giftMessage,
              type: giftType,
              attachment: giftName
          });
          
          if (!giftName.includes("∞")) {
             alert(`Đã gửi ${giftType} "${giftName}" cho ${giftTarget}`);
          }
          
          setShowGiftModal(false);
          setGiftTarget(null);
      }
  };

  const dummyAdminChar: Character = {
      name: "pojani0b",
      race: "True Dragon",
      uniqueSkill: "Absolute Admin Privilege",
      reincarnationReason: "Ultimate Creator",
      location: "Void Realm",
      attributes: { strength: 99999, magic: 99999, agility: 99999, defense: 99999 },
      status: { 
          hp: 99999, maxHp: 99999, mp: 99999, maxMp: 99999, 
          skills: [], equippedSkills: [], activeEffects: [], inventory: [], 
          quests: [],
          level: 1000, evolutionStage: "SUPREME GOD",
          difficulty: 'NORMAL'
      }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-slate-900 text-white font-mono relative overflow-hidden">
        
        <div className="absolute inset-0 pointer-events-none opacity-20" 
             style={{ backgroundImage: 'linear-gradient(45deg, #1e293b 25%, transparent 25%, transparent 75%, #1e293b 75%, #1e293b), linear-gradient(45deg, #1e293b 25%, transparent 25%, transparent 75%, #1e293b 75%, #1e293b)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}>
        </div>

        <div className="w-full max-w-6xl relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-800/90 p-6 rounded border border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.3)] gap-6 backdrop-blur-md">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold text-red-500 system-font tracking-widest text-glow whitespace-nowrap">ADMINISTRATOR</h1>
                    <p className="text-sm text-red-300 font-mono tracking-[0.3em] mt-1 whitespace-nowrap">ACCESS LEVEL: SUPREME :: ID: pojani0b</p>
                    <div className="mt-2 text-xs text-yellow-500 font-bold border border-yellow-800 bg-yellow-900/30 px-2 py-1 inline-block rounded whitespace-nowrap">
                        ACTIVE SERVER: {currentServerName}
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-4 justify-center">
                    <Button onClick={() => setShowSQLModal(true)} variant="secondary" className="border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-purple-900/20 hover:bg-purple-900/50 whitespace-nowrap">
                        🛠 SETUP DB
                    </Button>
                    <Button onClick={onEnterGame} variant="primary" className="border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] whitespace-nowrap">
                        🎮 VÀO GAME
                    </Button>
                    <Button onClick={onLogout} variant="danger" className="whitespace-nowrap">
                        ĐĂNG XUẤT
                    </Button>
                </div>
            </div>

            <div className="mb-8 p-4 bg-slate-800/80 border border-cyan-800 rounded flex flex-wrap gap-2 justify-center">
                 <span className="w-full text-center text-xs text-cyan-600 uppercase font-bold tracking-widest mb-1 whitespace-nowrap">SERVER CONTROL</span>
                 {GAME_SERVERS.map(sv => (
                     <button
                        key={sv.id}
                        onClick={() => handleSwitchServer(sv.id)}
                        disabled={sv.status === 'MAINTENANCE'}
                        className={`px-4 py-2 text-xs font-bold rounded border transition-all whitespace-nowrap ${
                            authService.getServerId() === sv.id 
                            ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' 
                            : 'bg-slate-700 text-slate-400 border-slate-600 hover:bg-slate-600'
                        }`}
                     >
                         {sv.name}
                     </button>
                 ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <button 
                    onClick={() => setShowPlayerListModal(true)}
                    className="group relative h-40 bg-slate-800 border-2 border-cyan-600 rounded-lg overflow-hidden hover:bg-slate-700 transition-all shadow-[0_0_20px_rgba(8,145,178,0.2)] flex flex-col items-center justify-center gap-3"
                >
                    <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors"></div>
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">👥</div>
                    <span className="text-xl font-bold text-cyan-300 system-font tracking-widest group-hover:text-cyan-100 whitespace-nowrap">QUẢN LÝ USER</span>
                    <span className="text-[10px] text-cyan-600 uppercase whitespace-nowrap">In {currentServerName}</span>
                </button>

                <button 
                    onClick={() => setShowLeaderboard(true)}
                    className="group relative h-40 bg-slate-800 border-2 border-yellow-600 rounded-lg overflow-hidden hover:bg-slate-700 transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] flex flex-col items-center justify-center gap-3"
                >
                    <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors"></div>
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">🏆</div>
                    <span className="text-xl font-bold text-yellow-300 system-font tracking-widest group-hover:text-yellow-100 whitespace-nowrap">BẢNG XẾP HẠNG</span>
                    <span className="text-[10px] text-yellow-600 uppercase whitespace-nowrap">Ranking of {currentServerName}</span>
                </button>
            </div>
        </div>

        {showSQLModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-scale-in p-4">
                <div className="raphael-panel w-full max-w-2xl h-[80vh] flex flex-col border border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
                    <div className="bg-purple-950/80 p-4 border-b border-purple-700 flex justify-between items-center shrink-0">
                        <h2 className="text-xl font-bold text-purple-100 whitespace-nowrap">HƯỚNG DẪN SETUP DATABASE</h2>
                        <Button onClick={() => setShowSQLModal(false)} variant="ghost" className="text-purple-300 border-purple-800">ĐÓNG</Button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto flex-1 bg-slate-900/90 text-sm space-y-4">
                        <div className="bg-red-900/20 border-l-4 border-red-500 p-4 text-red-200">
                            <strong>LƯU Ý:</strong> po-jani0b (Admin) yêu cầu chạy lệnh cẩn thận.
                        </div>
                        <div>
                            <label className="block text-cyan-400 font-bold mb-2">BƯỚC 1: TẠO BẢNG</label>
                            <textarea readOnly className="w-full h-32 bg-black border border-slate-700 text-green-400 font-mono p-3 text-xs"
                                value={`create table if not exists tensura_battles (...)`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {showPlayerListModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-scale-in p-4">
                <div className="raphael-panel w-full max-w-3xl h-[80vh] rounded-lg border border-cyan-500/50 flex flex-col relative overflow-hidden">
                    <div className="bg-cyan-950/90 p-4 border-b border-cyan-700 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">👥</span>
                            <div>
                                <h2 className="text-xl font-bold text-cyan-100 system-font tracking-widest whitespace-nowrap">DANH SÁCH USER</h2>
                                <div className="text-[10px] text-yellow-500 whitespace-nowrap">{currentServerName}</div>
                            </div>
                        </div>
                        <Button onClick={() => setShowPlayerListModal(false)} variant="ghost" className="text-cyan-500 border-cyan-800">ĐÓNG</Button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-slate-900/50 space-y-2">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full"><div className="animate-spin h-8 w-8 border-4 border-cyan-500 rounded-full border-t-transparent"></div></div>
                        ) : users.length === 0 ? (
                            <div className="text-center text-slate-500 mt-10">Trống.</div>
                        ) : (
                            users.map((user) => {
                                const isSelected = selectedUserForAction === user.username;
                                const char = user.saveData?.character;
                                const isBanned = user.isBanned;

                                return (
                                    <div 
                                        key={user.username}
                                        onClick={() => handleUserRowClick(user.username)}
                                        className={`relative flex items-center justify-between p-4 rounded border transition-all cursor-pointer ${isSelected ? 'bg-cyan-900/40 border-cyan-400' : 'bg-slate-800/40 border-slate-700'} ${isBanned ? 'opacity-50 grayscale' : ''}`}
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border bg-slate-800">
                                                {char ? char.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold truncate text-cyan-100 whitespace-nowrap">{user.username} {isBanned && <span className="text-[10px] bg-red-600 px-1 rounded">BANNED</span>}</div>
                                                <div className="text-xs text-slate-400 truncate whitespace-nowrap">{char ? `${char.name} (${char.race})` : 'Chưa tạo NV'}</div>
                                            </div>
                                        </div>

                                        {isSelected && !isBanned && (
                                            <div className="flex items-center animate-scale-in shrink-0 ml-2 relative z-10">
                                                {!menuExpanded ? (
                                                    <button onClick={handleHamburgerClick} className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 hover:bg-cyan-900/50 rounded-full">
                                                        <div className="w-5 h-0.5 bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]"></div>
                                                        <div className="w-5 h-0.5 bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]"></div>
                                                        <div className="w-5 h-0.5 bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]"></div>
                                                    </button>
                                                ) : (
                                                    <div className="flex gap-3 animate-slide-in-right">
                                                        <button onClick={(e) => handleGiftClick(e, user.username)} className="w-10 h-10 flex items-center justify-center bg-yellow-900/30 border border-yellow-500 rounded-full text-2xl" title="Tặng Quà">🎁</button>
                                                        <button onClick={(e) => handleBanClick(e, user.username)} className="w-10 h-10 flex items-center justify-center bg-slate-700/50 border border-slate-500 rounded-full text-xl" title="Ban">🚫</button>
                                                        <button onClick={(e) => handleDeleteClick(e, user.username)} className="w-10 h-10 flex items-center justify-center bg-red-900/50 border border-red-500 rounded-full text-xl font-bold text-red-500" title="Xóa">❌</button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        )}

        {deleteConfirmationTarget && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-scale-in p-4">
                <div className="raphael-panel w-full max-w-md p-6 border-2 border-red-600 text-center">
                    <h3 className="text-xl font-bold text-red-500 mb-6 tracking-widest whitespace-nowrap">XÁC NHẬN XÓA</h3>
                    <p className="text-cyan-100 mb-8 whitespace-nowrap">Bạn có chắc chắn muốn xóa user này khỏi hệ thống online?</p>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => setDeleteConfirmationTarget(null)} variant="secondary">KHÔNG</Button>
                        <Button onClick={executeDelete} variant="danger">CÓ</Button>
                    </div>
                </div>
            </div>
        )}

        {showGiftModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-scale-in p-4">
                <div className="raphael-panel w-full max-w-md p-6 rounded border border-yellow-500">
                    <h3 className="text-xl font-bold text-yellow-400 mb-4 whitespace-nowrap">TẶNG QUÀ CHO: {giftTarget}</h3>
                    <form onSubmit={handleSendGift} className="space-y-4">
                        <div>
                            <label className="block text-xs text-yellow-600 font-bold mb-1 whitespace-nowrap">LOẠI QUÀ</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap"><input type="radio" checked={giftType === 'ITEM'} onChange={() => setGiftType('ITEM')} /> Vật phẩm</label>
                                <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap"><input type="radio" checked={giftType === 'SKILL'} onChange={() => setGiftType('SKILL')} /> Kỹ năng</label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-yellow-600 font-bold mb-1 whitespace-nowrap">TÊN</label>
                            <input type="text" value={giftName} onChange={e => setGiftName(e.target.value)} className="w-full bg-slate-900 border border-yellow-800 p-2 text-white outline-none rounded" required />
                        </div>
                        <div>
                            <label className="block text-xs text-yellow-600 font-bold mb-1 whitespace-nowrap">LỜI NHẮN</label>
                            <textarea value={giftMessage} onChange={e => setGiftMessage(e.target.value)} className="w-full bg-slate-900 border border-yellow-800 p-2 text-white h-24 rounded resize-none" required />
                        </div>
                        <div className="flex gap-3 justify-end mt-4">
                            <Button type="button" onClick={() => setShowGiftModal(false)} variant="ghost">HỦY</Button>
                            <Button type="submit" variant="primary" className="border-yellow-500 text-yellow-100">GỬI</Button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {showLeaderboard && (
            <LeaderboardModal currentUserCharacter={dummyAdminChar} onClose={() => setShowLeaderboard(false)} />
        )}
    </div>
  );
};

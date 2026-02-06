import React, { useState, useEffect } from 'react';
import { GameState, Character, ChatMessage, SaveData, UserProfile } from './types';
import { CharacterCreator } from './components/CharacterCreator';
import { GameInterface } from './components/GameInterface';
import { IntroSequence } from './components/IntroSequence';
import { Button } from './components/Button';
import { MagiculeBackground } from './components/MagiculeBackground';
import { AuthScreen } from './components/AuthScreen';
import { AdminPanel } from './components/AdminPanel';
import { ServerSelectionScreen } from './components/ServerSelectionScreen';
import { authService } from './services/authService';
import { PvPHandler } from './components/PvPHandler';

export const App: React.FC = () => {
  // Start at Server Selection by default now
  const [gameState, setGameState] = useState<GameState>(GameState.SERVER_SELECTION);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  
  // MODALS
  const [showResetConfirm, setShowResetConfirm] = useState(false); // Reset = Delete Account
  const [showDeleteDataConfirm, setShowDeleteDataConfirm] = useState(false); // Delete Save Data
  const [loadingGame, setLoadingGame] = useState(false);

  useEffect(() => {
    // We check session, but if no server selected yet, stay on Selection
    // However, if we refresh page, we might remember the server from localStorage
    const savedServer = localStorage.getItem('tensura_selected_server');
    if (savedServer) {
        // If server was selected previously, check user session
        authService.setServer(savedServer);
        checkSession();
    } else {
        setGameState(GameState.SERVER_SELECTION);
    }
  }, []);

  const checkSession = async () => {
      const localUser = authService.getCurrentUserLocal();
      if (localUser) {
           setCurrentUser(localUser);
           setGameState(localUser.isAdmin ? GameState.ADMIN_PANEL : GameState.MAIN_MENU);
      }
      
      const cloudUser = await authService.getCurrentUser();
      if (cloudUser) {
          setCurrentUser(cloudUser);
          if (cloudUser.isAdmin) {
              setGameState(GameState.ADMIN_PANEL);
          } else if (!localUser) {
              setGameState(GameState.MAIN_MENU);
          }
      } else if (localUser) {
           // Invalid session on this server
           handleLogout();
      } else {
           // Server selected but no user logged in
           setGameState(GameState.AUTH);
      }
  };

  const handleSelectServer = (serverId: string) => {
      authService.setServer(serverId);
      setGameState(GameState.AUTH);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.isAdmin) {
        setGameState(GameState.ADMIN_PANEL);
    } else {
        setGameState(GameState.MAIN_MENU);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCharacter(null);
    setHistory([]);
    setGameState(GameState.AUTH);
  };

  // Completely exit back to Server Selection
  const handleSwitchServer = () => {
      handleLogout();
      localStorage.removeItem('tensura_selected_server');
      setGameState(GameState.SERVER_SELECTION);
  };

  const handleResetAccount = async () => {
    if (currentUser) {
        await authService.deleteAccount(currentUser.username);
        handleLogout();
        setShowResetConfirm(false);
    }
  };

  const handleDeleteGameData = async () => {
      if (currentUser) {
          await authService.deleteGameData(currentUser.username);
          setCharacter(null);
          setHistory([]);
          setShowDeleteDataConfirm(false);
          alert("Đã xóa dữ liệu nhân vật. Bạn có thể bắt đầu cuộc đời mới.");
      }
  }

  const startNewGame = async () => {
    setLoadingGame(true);
    if (currentUser) {
        const existingSave = await authService.loadGameData(currentUser.username);
        if (existingSave) {
            if (!window.confirm("CẢNH BÁO: Tài khoản này đã có dữ liệu nhân vật đang chơi.\nViệc [BẮT ĐẦU MỚI] sẽ ghi đè và xóa mất dữ liệu cũ vĩnh viễn.\n\nBạn có chắc chắn muốn tiếp tục không?")) {
                setLoadingGame(false);
                return;
            }
        }
    }
    setLoadingGame(false);
    setGameState(GameState.CHARACTER_CREATION);
  };

  const loadGame = async () => {
    if (!currentUser) return;
    setLoadingGame(true);
    
    const saveData = await authService.loadGameData(currentUser.username);
    if (saveData) {
        setCharacter(saveData.character);
        setHistory(saveData.chatHistory);
        setGameState(GameState.PLAYING);
    } else {
        alert("Không tìm thấy dữ liệu đã lưu trên hệ thống.");
    }
    setLoadingGame(false);
  };

  const handleAdminEnterGame = () => {
      setGameState(GameState.MAIN_MENU);
  };

  const handleSaveGame = async (data: SaveData): Promise<{ success: boolean, error?: string }> => {
    if (currentUser) {
        const result = await authService.saveGameData(currentUser.username, data);
        return result;
    }
    return { success: false, error: "No user logged in" };
  };

  const handleCharacterComplete = (newChar: Character) => {
    setCharacter(newChar);
    setHistory([]);
    setGameState(GameState.INTRO_SEQUENCE);
  };

  const handleIntroComplete = () => {
    setGameState(GameState.PLAYING);
  };

  const handleRestart = () => {
    setCharacter(null);
    setHistory([]);
    setGameState(GameState.CHARACTER_CREATION);
  };

  const handleExitGame = () => {
    if (currentUser?.isAdmin) {
        setGameState(GameState.ADMIN_PANEL);
    } else {
        setGameState(GameState.MAIN_MENU);
    }
    // Don't clear character here so PvPHandler still has context if needed, or handle clearing carefully
    // Actually for menu flow it's fine.
    // setCharacter(null); 
    // setHistory([]);
  };

  return (
    <div className="min-h-screen text-white relative">
        <MagiculeBackground />

        {/* Global PvP Handler - Active whenever logged in */}
        {currentUser && (
            <PvPHandler currentUser={currentUser} userCharacter={character} />
        )}

        {/* Server Selection */}
        {gameState === GameState.SERVER_SELECTION && (
            <ServerSelectionScreen onSelectServer={handleSelectServer} />
        )}

        {/* Auth Screen */}
        {gameState === GameState.AUTH && (
            <div className="relative">
                <Button 
                    variant="ghost" 
                    onClick={handleSwitchServer}
                    className="absolute top-4 left-4 z-50 text-[10px] text-cyan-500 border-cyan-800"
                >
                    ← CHỌN LẠI SERVER
                </Button>
                <AuthScreen onLoginSuccess={handleLoginSuccess} />
            </div>
        )}

        {/* Admin Panel */}
        {gameState === GameState.ADMIN_PANEL && (
            <AdminPanel onLogout={handleLogout} onEnterGame={handleAdminEnterGame} />
        )}

        {/* Main Menu */}
        {gameState === GameState.MAIN_MENU && currentUser && (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in space-y-12 z-10 relative">
            
            <div className="absolute top-4 right-4 flex items-center gap-4">
                <div className="text-right">
                    <div className="text-[10px] text-cyan-600 uppercase tracking-widest">Đang kết nối</div>
                    <div className="text-cyan-100 font-mono font-bold flex items-center gap-2">
                        {currentUser.username}
                        {currentUser.isAdmin && <span className="text-[9px] bg-red-900 text-red-200 px-1 rounded border border-red-500">ADMIN</span>}
                    </div>
                    <div className="text-[9px] text-yellow-500 font-bold mt-1">
                        {authService.getServerName()}
                    </div>
                </div>
                {currentUser.isAdmin && (
                    <Button variant="secondary" onClick={() => setGameState(GameState.ADMIN_PANEL)} className="text-xs px-2 py-1 bg-slate-800 border-slate-600">
                        ⚙ PANEL
                    </Button>
                )}
                {/* Only keep RESET Account button here if intended, or swap it out. Keeping both as per prompt implied structure "Reset" and "Delete Data" */}
                <Button variant="danger" onClick={() => setShowResetConfirm(true)} className="text-xs px-2 py-1 bg-red-900/40 border-red-800">
                    ⚠ RESET ACC
                </Button>
                <Button variant="secondary" onClick={handleSwitchServer} className="text-xs px-3 py-1 text-cyan-300 border-cyan-800">
                    ĐỔI SERVER
                </Button>
                <Button variant="secondary" onClick={handleLogout} className="text-xs px-3 py-1">
                    ĐĂNG XUẤT
                </Button>
            </div>

            <div className="text-center space-y-4 relative">
                <div className="absolute -inset-10 bg-cyan-500/10 blur-3xl rounded-full"></div>
                <h1 className="text-5xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-500 rpg-font tracking-widest drop-shadow-[0_0_25px_rgba(6,182,212,0.8)]">
                TENSURA
                </h1>
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                <p className="text-xl md:text-2xl text-cyan-100 font-mono tracking-[0.3em] uppercase text-glow">
                  Hệ thống chuyển sinh
                </p>
                <div className="text-[10px] text-cyan-500 font-mono mt-2">
                    SERVER: <span className="text-white font-bold">{authService.getServerName()}</span>
                </div>
            </div>

            <div className="flex flex-col gap-6 w-full max-w-sm z-10">
              <Button onClick={startNewGame} isLoading={loadingGame} className="w-full text-lg py-4 border-2 border-cyan-500 bg-cyan-900/20 hover:bg-cyan-800/40 text-cyan-50 shadow-[0_0_15px_rgba(6,182,212,0.3)] system-font tracking-widest">
                [ BẮT ĐẦU MỚI ]
              </Button>
              <Button 
                onClick={loadGame} 
                isLoading={loadingGame}
                variant="secondary" 
                className="w-full text-lg py-4 border border-slate-600 bg-slate-900/50 hover:bg-slate-800 text-slate-300 system-font tracking-widest"
              >
                [ TIẾP TỤC ]
              </Button>
              
              {/* NEW BUTTON: DELETE DATA */}
              <Button 
                 onClick={() => setShowDeleteDataConfirm(true)}
                 className="w-full text-sm py-3 border border-red-700 bg-red-950/30 hover:bg-red-900/50 text-red-300 font-mono tracking-wider mt-4"
              >
                 🗑 XÓA DỮ LIỆU GAME
              </Button>
            </div>
            
            <footer className="absolute bottom-4 text-cyan-800/60 text-[10px] text-center font-mono">
                RAPHAEL SYSTEM ONLINE. MULTI-SERVER CLOUD.<br/>
                USER ID: {currentUser.username}
            </footer>

            {/* Reset Confirmation Modal (Delete Account) */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-scale-in">
                    <div className="raphael-panel w-full max-w-md border-2 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.4)] p-6 text-center">
                         <h2 className="text-2xl font-bold text-red-500 rpg-font mb-4 tracking-widest text-glow">XÓA TÀI KHOẢN</h2>
                         <p className="text-cyan-100 mb-6 font-mono leading-relaxed">
                            Bạn đang yêu cầu xóa vĩnh viễn tài khoản <span className="text-red-400 font-bold">{currentUser.username}</span> tại máy chủ <span className="text-yellow-400">{authService.getServerName()}</span>.
                            <br/><br/>
                            Hành động này không thể hoàn tác.
                         </p>
                         <div className="flex gap-4 justify-center">
                             <Button onClick={() => setShowResetConfirm(false)} variant="secondary">
                                 HỦY BỎ
                             </Button>
                             <Button onClick={handleResetAccount} variant="danger" className="animate-pulse">
                                 XÁC NHẬN XÓA
                             </Button>
                         </div>
                    </div>
                </div>
            )}
            
            {/* Delete Data Confirmation Modal (Delete Save) */}
            {showDeleteDataConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-scale-in">
                    <div className="raphael-panel w-full max-w-md border-2 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.4)] p-6 text-center">
                         <h2 className="text-2xl font-bold text-red-500 rpg-font mb-4 tracking-widest text-glow">XÓA DỮ LIỆU GAME</h2>
                         <p className="text-cyan-100 mb-6 font-mono leading-relaxed">
                            Bạn sắp xóa toàn bộ tiến trình chơi game hiện tại (cấp độ, kỹ năng, vật phẩm...).
                            <br/>
                            Tài khoản <span className="text-green-400 font-bold">{currentUser.username}</span> vẫn được giữ lại.
                            <br/><br/>
                            Bạn có muốn thiết lập lại cuộc đời mới không?
                         </p>
                         <div className="flex gap-4 justify-center">
                             <Button onClick={() => setShowDeleteDataConfirm(false)} variant="secondary">
                                 KHÔNG
                             </Button>
                             <Button onClick={handleDeleteGameData} variant="danger" className="animate-pulse">
                                 ĐỒNG Ý
                             </Button>
                         </div>
                    </div>
                </div>
            )}
          </div>
        )}

        {/* Character Creation */}
        {gameState === GameState.CHARACTER_CREATION && (
          <CharacterCreator 
            onComplete={handleCharacterComplete} 
            onCancel={() => setGameState(GameState.MAIN_MENU)} 
          />
        )}

        {/* Intro Video Sequence */}
        {gameState === GameState.INTRO_SEQUENCE && character && (
           <IntroSequence 
              onComplete={handleIntroComplete}
              uniqueSkillName={character.uniqueSkill}
           />
        )}

        {/* Gameplay */}
        {gameState === GameState.PLAYING && character && (
          <GameInterface 
            initialCharacter={character} 
            initialHistory={history}
            onExit={handleExitGame}
            onRestart={handleRestart}
            onSave={handleSaveGame}
          />
        )}

    </div>
  );
};
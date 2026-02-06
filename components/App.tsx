
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
  const [gameState, setGameState] = useState<GameState>(GameState.SERVER_SELECTION);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteDataConfirm, setShowDeleteDataConfirm] = useState(false);
  const [loadingGame, setLoadingGame] = useState(false);

  useEffect(() => {
    const savedServer = localStorage.getItem('tensura_selected_server');
    if (savedServer) {
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
           handleLogout();
      } else {
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
          alert("Đã xóa dữ liệu nhân vật.");
      }
  }

  const startNewGame = async () => {
    setLoadingGame(true);
    if (currentUser) {
        const existingSave = await authService.loadGameData(currentUser.username);
        if (existingSave) {
            if (!window.confirm("Bắt đầu mới sẽ xóa dữ liệu cũ vĩnh viễn?")) {
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
        alert("Không tìm thấy dữ liệu.");
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
  };

  return (
    <div className="min-h-screen text-white relative">
        <MagiculeBackground />

        {currentUser && (
            <PvPHandler currentUser={currentUser} userCharacter={character} />
        )}

        {gameState === GameState.SERVER_SELECTION && (
            <ServerSelectionScreen onSelectServer={handleSelectServer} />
        )}

        {gameState === GameState.AUTH && (
            <div className="relative">
                <Button 
                    variant="ghost" 
                    onClick={handleSwitchServer}
                    className="absolute top-4 left-4 z-50 text-[10px] text-cyan-500 border-cyan-800 whitespace-nowrap"
                >
                    ← CHỌN LẠI SERVER
                </Button>
                <AuthScreen onLoginSuccess={handleLoginSuccess} />
            </div>
        )}

        {gameState === GameState.ADMIN_PANEL && (
            <AdminPanel onLogout={handleLogout} onEnterGame={handleAdminEnterGame} />
        )}

        {gameState === GameState.MAIN_MENU && currentUser && (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in space-y-12 z-10 relative">
            
            <div className="absolute top-4 right-4 flex items-center gap-4">
                <div className="text-right">
                    <div className="text-[10px] text-cyan-600 uppercase tracking-widest whitespace-nowrap">Đang kết nối</div>
                    <div className="text-cyan-100 font-mono font-bold flex items-center gap-2 whitespace-nowrap">
                        {currentUser.username}
                        {currentUser.isAdmin && <span className="text-[9px] bg-red-900 text-red-200 px-1 rounded border border-red-500 whitespace-nowrap">ADMIN</span>}
                    </div>
                </div>
                <Button variant="secondary" onClick={handleLogout} className="text-xs px-3 py-1 whitespace-nowrap">ĐĂNG XUẤT</Button>
            </div>

            <div className="text-center space-y-4 relative">
                <h1 className="text-5xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-500 rpg-font tracking-widest drop-shadow-[0_0_25px_rgba(6,182,212,0.8)] whitespace-nowrap">
                TENSURA
                </h1>
                <p className="text-xl md:text-2xl text-cyan-100 font-mono tracking-[0.3em] uppercase text-glow whitespace-nowrap">
                  Hệ thống chuyển sinh
                </p>
            </div>

            <div className="flex flex-col gap-6 w-full max-w-sm z-10">
              <Button onClick={startNewGame} isLoading={loadingGame} className="w-full text-lg py-4 border-2 border-cyan-500 bg-cyan-900/20 text-cyan-50 whitespace-nowrap">
                [ BẮT ĐẦU MỚI ]
              </Button>
              <Button onClick={loadGame} isLoading={loadingGame} variant="secondary" className="w-full text-lg py-4 border border-slate-600 bg-slate-900/50 text-slate-300 whitespace-nowrap">
                [ TIẾP TỤC ]
              </Button>
              <Button onClick={() => setShowDeleteDataConfirm(true)} className="w-full text-sm py-3 border border-red-700 bg-red-950/30 text-red-300 whitespace-nowrap mt-4">
                 🗑 XÓA DỮ LIỆU GAME
              </Button>
            </div>
            
            {showDeleteDataConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-scale-in">
                    <div className="raphael-panel w-full max-w-md border-2 border-red-600 p-6 text-center">
                         <h2 className="text-2xl font-bold text-red-500 rpg-font mb-4 tracking-widest text-glow whitespace-nowrap">XÓA DỮ LIỆU</h2>
                         <p className="text-cyan-100 mb-6 font-mono whitespace-nowrap">Hành động này sẽ xóa vĩnh viễn nhân vật hiện tại?</p>
                         <div className="flex gap-4 justify-center">
                             <Button onClick={() => setShowDeleteDataConfirm(false)} variant="secondary">KHÔNG</Button>
                             <Button onClick={handleDeleteGameData} variant="danger">ĐỒNG Ý</Button>
                         </div>
                    </div>
                </div>
            )}
          </div>
        )}

        {gameState === GameState.CHARACTER_CREATION && (
          <CharacterCreator onComplete={handleCharacterComplete} onCancel={() => setGameState(GameState.MAIN_MENU)} />
        )}

        {gameState === GameState.INTRO_SEQUENCE && character && (
           <IntroSequence onComplete={handleIntroComplete} uniqueSkillName={character.uniqueSkill} />
        )}

        {gameState === GameState.PLAYING && character && (
          <GameInterface initialCharacter={character} initialHistory={history} onExit={handleExitGame} onRestart={handleRestart} onSave={handleSaveGame} />
        )}
    </div>
  );
};

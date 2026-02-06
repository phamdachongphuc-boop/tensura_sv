
import React, { useState, useEffect } from 'react';
import { Mail } from '../types';
import { Button } from './Button';
import { authService } from '../services/authService';

interface Props {
  username: string;
  onClose: () => void;
  onClaim: (mail: Mail) => void;
}

export const MailboxModal: React.FC<Props> = ({ username, onClose, onClaim }) => {
  const [mails, setMails] = useState<Mail[]>([]);
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMails = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    const fetchedMails = await authService.getMailbox(username);
    
    setMails(fetchedMails);
    
    if (selectedMail) {
        const updatedSelected = fetchedMails.find(m => m.id === selectedMail.id);
        if (updatedSelected) setSelectedMail(updatedSelected);
    }

    if (!silent) {
        setIsLoading(false);
        setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchMails(true).then(() => setIsLoading(false));

    const interval = setInterval(() => {
        fetchMails(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [username]);

  const handleSelectMail = async (mail: Mail) => {
      setSelectedMail(mail);
      if (!mail.isRead) {
          await authService.markMailRead(username, mail.id);
          setMails(prev => prev.map(m => m.id === mail.id ? { ...m, isRead: true } : m));
      }
  };

  const handleClaim = async () => {
      if (selectedMail && !selectedMail.isClaimed && selectedMail.attachment) {
          const success = await authService.claimMailReward(username, selectedMail.id);
          if (success) {
              onClaim(selectedMail);
              setMails(prev => prev.map(m => m.id === selectedMail.id ? { ...m, isClaimed: true } : m));
              setSelectedMail(prev => prev ? { ...prev, isClaimed: true } : null);
          }
      }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-scale-in">
      <div className="raphael-panel w-full max-w-5xl h-[85vh] rounded-lg border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.2)] relative overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT COLUMN: MAIL LIST */}
        <div className={`md:w-1/3 border-r border-cyan-800 bg-slate-900/50 flex flex-col ${selectedMail ? 'hidden md:flex' : 'flex w-full'}`}>
            <div className="p-3 bg-cyan-950/80 border-b border-cyan-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xl">📩</span>
                    <span className="font-bold text-cyan-100 system-font tracking-widest">HÒM THƯ</span>
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-xs text-cyan-500">{mails.filter(m => !m.isRead).length} chưa đọc</span>
                    <button 
                        onClick={() => fetchMails(false)}
                        className={`text-cyan-400 hover:text-white transition-colors p-1 ${isRefreshing ? 'animate-spin' : ''}`}
                        title="Làm mới"
                    >
                        ↻
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {isLoading ? (
                    <div className="p-4 flex justify-center">
                        <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : mails.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-sm mt-10">Không có thư nào.</div>
                ) : (
                    mails.map(mail => (
                        <button
                            key={mail.id}
                            onClick={() => handleSelectMail(mail)}
                            className={`w-full text-left p-4 border-b border-cyan-900/30 hover:bg-cyan-900/20 transition-colors relative group
                                ${selectedMail?.id === mail.id ? 'bg-cyan-900/40 border-l-2 border-l-cyan-400' : ''}
                            `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-bold text-sm truncate pr-2 ${mail.isRead ? 'text-slate-400' : 'text-cyan-200 group-hover:text-cyan-100'}`}>
                                    {mail.sender}
                                </span>
                                {!mail.isRead && <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_5px_rgba(34,211,238,0.8)] animate-pulse"></span>}
                            </div>
                            <div className={`text-xs truncate mb-1 ${mail.isRead ? 'text-slate-500' : 'text-white'}`}>
                                {mail.title}
                            </div>
                            <div className="text-[10px] text-slate-600 font-mono flex justify-between">
                                <span>{new Date(mail.timestamp).toLocaleDateString()}</span>
                                {mail.attachment && !mail.isClaimed && <span className="text-yellow-500">🎁</span>}
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>

        {/* RIGHT COLUMN: MAIL CONTENT */}
        <div className={`md:w-2/3 bg-slate-900/30 flex flex-col relative ${!selectedMail ? 'hidden md:flex' : 'flex w-full'}`}>
            {selectedMail ? (
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Header Mobile Navigation */}
                    <div className="md:hidden p-2 border-b border-cyan-800 flex items-center bg-cyan-950/50 shrink-0">
                        <button onClick={() => setSelectedMail(null)} className="flex items-center text-cyan-400 text-xs px-2 py-1">
                            ← Quay lại
                        </button>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar relative">
                        {/* Mail Header Info */}
                        <div className="mb-6 pb-4 border-b border-cyan-900/50">
                            <h2 className="text-2xl font-bold text-cyan-100 mb-2">{selectedMail.title}</h2>
                            <div className="flex justify-between items-center text-xs text-cyan-600 font-mono">
                                <span>Từ: {selectedMail.sender}</span>
                                <span>{new Date(selectedMail.timestamp).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* INTERACTIVE ATTACHMENT BOX */}
                        {selectedMail.attachment && (
                            <button 
                                onClick={() => !selectedMail.isClaimed && handleClaim()}
                                disabled={selectedMail.isClaimed}
                                className={`w-full text-left bg-slate-800/60 border p-4 rounded-lg flex flex-col sm:flex-row items-center gap-4 transition-all mb-6 relative group overflow-hidden
                                    ${selectedMail.isClaimed 
                                        ? 'border-slate-700 opacity-70 grayscale cursor-default' 
                                        : 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] cursor-pointer hover:bg-yellow-900/20 active:scale-95'
                                    }
                                `}
                            >
                                {/* Hint Text for Claiming */}
                                {!selectedMail.isClaimed && (
                                    <div className="absolute top-2 right-2 animate-pulse">
                                        <span className="text-[9px] font-bold text-black bg-yellow-500 px-2 py-1 rounded shadow-lg border border-yellow-200">
                                            CHẠM ĐỂ NHẬN
                                        </span>
                                    </div>
                                )}

                                <div className={`w-14 h-14 border flex items-center justify-center text-2xl rounded shrink-0
                                    ${selectedMail.isClaimed ? 'bg-slate-900 border-slate-600' : 'bg-yellow-900/20 border-yellow-500 animate-bounce'}
                                `}>
                                    {selectedMail.type === 'ITEM' ? '🎁' : '📜'}
                                </div>
                                <div className="text-center sm:text-left flex-1">
                                    <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                                        {selectedMail.isClaimed ? 'Đã nhận vào túi đồ' : 'Phần thưởng đính kèm'}
                                    </div>
                                    <div className={`font-bold text-base ${selectedMail.type === 'ITEM' ? 'text-yellow-400' : 'text-purple-400'}`}>
                                        [{selectedMail.type}] {selectedMail.attachment}
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Mail Body Text */}
                        <div className="text-slate-200 leading-relaxed whitespace-pre-wrap mb-4 text-sm md:text-base">
                            {selectedMail.content}
                        </div>
                    </div>

                    {/* FIXED FOOTER: Navigation Buttons */}
                    <div className="p-4 border-t border-cyan-800/50 bg-slate-950/90 flex justify-between items-center shrink-0 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                         <div className="text-xs text-slate-500 italic">
                            {selectedMail.isClaimed ? "Đã nhận vật phẩm." : (selectedMail.attachment ? "Ấn vào hộp quà ở trên để nhận." : "")}
                         </div>

                         <Button 
                            onClick={() => setSelectedMail(null)} 
                            variant="ghost"
                            className="border-cyan-700 text-cyan-400 hover:bg-cyan-900/30 px-6"
                        >
                            [ QUAY LẠI ]
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-cyan-900/50">
                    <span className="text-6xl mb-4 opacity-50">✉</span>
                    <span className="font-mono text-sm tracking-wider">CHỌN THƯ ĐỂ XEM CHI TIẾT</span>
                </div>
            )}

            <button onClick={onClose} className="absolute top-2 right-2 p-2 text-cyan-600 hover:text-white transition-colors z-20 bg-black/20 rounded-full" title="Thoát hòm thư">✕</button>
        </div>

      </div>
    </div>
  );
};

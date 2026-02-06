import React, { useState, useEffect, useRef } from 'react';
import { authService, WorldChatMessage } from '../services/authService';
import { Button } from './Button';
import { UserProfile } from '../types';

interface Props {
  currentUser: UserProfile;
  onClose: () => void;
}

export const WorldChatModal: React.FC<Props> = ({ currentUser, onClose }) => {
  const [messages, setMessages] = useState<WorldChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = async (silent = false) => {
      if (!silent) setIsLoading(true);
      const history = await authService.getWorldChatHistory(50);
      
      setMessages(prev => {
          // Robust Merge with De-duplication of optimistic messages
          const realMessages = history;
          const optimisticMessages = prev.filter(m => m.id > 1000000000000); 
          
          const filteredOptimistic = optimisticMessages.filter(opt => {
              const matched = realMessages.some(real => 
                  real.username === opt.username &&
                  real.content === opt.content &&
                  Math.abs(real.timestamp - opt.timestamp) < 5000
              );
              return !matched;
          });

          return [...realMessages, ...filteredOptimistic].sort((a, b) => a.timestamp - b.timestamp);
      });
      
      if (!silent) setIsLoading(false);
      if (!silent) scrollToBottom();
  };

  useEffect(() => {
    // 1. Initial Load
    fetchMessages();
    
    // Focus input on open
    setTimeout(() => {
        inputRef.current?.focus();
    }, 300);

    // 2. Subscribe with Status Check
    const unsubscribe = authService.subscribeToWorldChat(
        (payload) => {
            const newMsg = payload.new as WorldChatMessage;
            setMessages(prev => {
                if (prev.some(m => m.id === newMsg.id)) return prev;
                // Remove matching optimistic message if exists
                const filteredPrev = prev.filter(m => !(
                    m.id > 1000000000000 &&
                    m.username === newMsg.username &&
                    m.content === newMsg.content
                ));
                return [...filteredPrev, newMsg];
            });
            scrollToBottom();
        },
        (status) => {
            if (status === 'SUBSCRIBED') {
                setIsConnected(true);
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                setIsConnected(false);
            }
        }
    );

    // 3. Polling Fallback (Every 3s)
    const interval = setInterval(() => {
        fetchMessages(true);
    }, 3000);

    return () => {
        unsubscribe();
        clearInterval(interval);
    };
  }, []);

  const scrollToBottom = () => {
      setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
  };

  const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isSending) return;

      const content = input.trim();
      setInput(''); 
      setIsSending(true);
      
      // Keep focus
      inputRef.current?.focus();

      // Optimistic Update
      const tempId = Date.now();
      const tempMsg: WorldChatMessage = {
          id: tempId,
          server_id: authService.getServerId(),
          username: currentUser.username,
          content: content,
          is_admin: !!currentUser.isAdmin,
          timestamp: Date.now()
      };

      setMessages(prev => [...prev, tempMsg]);
      scrollToBottom();

      const success = await authService.sendWorldChatMessage(currentUser.username, content, !!currentUser.isAdmin);
      
      if (!success) {
          // Remove optimistic message on failure
          setMessages(prev => prev.filter(m => m.id !== tempId));
          alert("LỖI KẾT NỐI: Không thể gửi tin nhắn.");
          setInput(content); 
      }
      
      setIsSending(false);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-scale-in">
      <div className="raphael-panel w-full max-w-2xl h-[70vh] rounded-lg border border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.2)] relative overflow-hidden flex flex-col">
        
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#22c55e_2px,#22c55e_4px)]"></div>

        {/* Header */}
        <div className="bg-green-950/80 p-3 border-b border-green-700 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-lg animate-pulse">🌐</span>
            <div>
                <h2 className="text-lg font-bold text-green-100 system-font tracking-widest text-glow leading-none">KÊNH THẾ GIỚI</h2>
                <div className="flex items-center gap-1 mt-1">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500'}`}></div>
                    <span className={`text-[9px] font-mono tracking-wider ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                        {isConnected ? 'THẦN GIAO CÁCH CẢM: ONLINE' : 'MẤT KẾT NỐI...'}
                    </span>
                </div>
            </div>
          </div>
          <div className="text-[10px] text-green-700 font-bold border border-green-900 px-2 py-1 rounded bg-green-950">
              SV: {authService.getServerName()}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-900/80 relative z-10">
             {isLoading ? (
                 <div className="flex flex-col items-center justify-center h-full gap-2 opacity-70">
                     <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                     <div className="text-center text-green-700 font-mono text-xs">Đang đồng bộ dữ liệu...</div>
                 </div>
             ) : messages.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <span className="text-4xl mb-2 text-slate-600">💭</span>
                    <div className="text-center text-slate-500 font-mono text-xs italic">Kênh chat trống... Hãy gửi lời chào!</div>
                 </div>
             ) : (
                 messages.map((msg, idx) => {
                     const isMe = msg.username === currentUser.username;
                     const isAdmin = msg.is_admin;
                     const isOptimistic = msg.id > 1000000000000;

                     return (
                         <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-slide-up`}>
                             <div className="flex items-center gap-2 mb-1">
                                 {isAdmin && <span className="text-[8px] bg-red-600 text-white px-1 rounded font-bold shadow-sm">ADMIN</span>}
                                 <span className={`text-[10px] font-bold ${isAdmin ? 'text-red-400' : isMe ? 'text-green-300' : 'text-slate-400'}`}>
                                     {msg.username}
                                 </span>
                                 <span className="text-[8px] text-slate-600">
                                     {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                             </div>
                             <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] break-words shadow-sm font-sans transition-all relative
                                 ${isMe 
                                     ? 'bg-green-900/40 border border-green-700 text-green-100 rounded-tr-none' 
                                     : isAdmin 
                                        ? 'bg-red-900/20 border border-red-800 text-red-100 rounded-tl-none'
                                        : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                                 }
                                 ${isOptimistic ? 'opacity-70 border-dashed' : 'opacity-100'}
                             `}>
                                 {msg.content}
                             </div>
                         </div>
                     );
                 })
             )}
             <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-green-800 flex gap-2 relative z-10">
            <input 
                ref={inputRef}
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                disabled={isSending}
                className="flex-1 bg-slate-800 text-green-100 border border-green-900 rounded px-3 py-2 focus:border-green-500 focus:outline-none font-mono text-sm placeholder-green-900/50 disabled:opacity-50 transition-colors"
            />
            <Button type="submit" variant="secondary" disabled={!input.trim() || isSending} className="border-green-700 text-green-400 hover:bg-green-900/50 w-20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                {isSending ? '...' : 'GỬI'}
            </Button>
            <Button type="button" onClick={onClose} variant="ghost" className="text-green-600 border-green-900 hover:border-green-600 hover:text-green-400">
                ĐÓNG
            </Button>
        </form>

      </div>
    </div>
  );
};
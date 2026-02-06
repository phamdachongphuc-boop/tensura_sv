import React from 'react';
import { GAME_SERVERS, ServerConfig } from '../types';
import { Button } from './Button';

interface Props {
  onSelectServer: (serverId: string) => void;
}

export const ServerSelectionScreen: React.FC<Props> = ({ onSelectServer }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in relative z-10">
      
      {/* Title */}
      <div className="text-center mb-10 relative">
        <div className="absolute -inset-10 bg-cyan-500/10 blur-3xl rounded-full"></div>
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-500 rpg-font tracking-widest drop-shadow-[0_0_25px_rgba(6,182,212,0.8)]">
            KẾT NỐI THẾ GIỚI
        </h1>
        <p className="text-cyan-400 font-mono tracking-[0.3em] text-xs mt-2 uppercase">Vui lòng chọn Máy Chủ để khởi tạo linh hồn</p>
      </div>

      {/* Server List */}
      <div className="raphael-panel w-full max-w-2xl p-6 rounded-lg border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.2)] relative overflow-hidden flex flex-col gap-4">
          
          <div className="flex justify-between items-center text-[10px] text-cyan-600 font-bold uppercase tracking-widest px-2 mb-2">
              <span>Danh sách máy chủ</span>
              <span>Trạng thái</span>
          </div>

          <div className="space-y-3">
              {GAME_SERVERS.map((server) => (
                  <ServerItem key={server.id} server={server} onSelect={onSelectServer} />
              ))}
          </div>

          <div className="mt-4 pt-4 border-t border-cyan-800/50 text-center">
              <p className="text-[10px] text-slate-500 font-mono">
                  *Dữ liệu nhân vật được lưu riêng biệt trên mỗi máy chủ.<br/>
                  Admin (2242009) có quyền truy cập toàn bộ hệ thống.
              </p>
          </div>
      </div>

      <div className="mt-4 text-[10px] text-cyan-900 font-mono">
        RAPHAEL MULTI-DIMENSION PROTOCOL v3.0
      </div>
    </div>
  );
};

const ServerItem: React.FC<{ server: ServerConfig, onSelect: (id: string) => void }> = ({ server, onSelect }) => {
    const isMaintenance = server.status === 'MAINTENANCE';
    
    return (
        <button
            onClick={() => !isMaintenance && onSelect(server.id)}
            disabled={isMaintenance}
            className={`w-full group relative p-4 border rounded transition-all duration-300 flex items-center justify-between overflow-hidden
                ${isMaintenance 
                    ? 'bg-slate-900/50 border-slate-700 opacity-50 cursor-not-allowed' 
                    : 'bg-slate-900/80 border-cyan-800 hover:bg-cyan-900/30 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                }
            `}
        >
            {/* Background Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-200%] group-hover:animate-[shineSweep_1.5s_infinite]"></div>

            <div className="flex flex-col items-start relative z-10">
                <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold system-font tracking-wider ${isMaintenance ? 'text-slate-500' : 'text-cyan-100 group-hover:text-white'}`}>
                        {server.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-600">
                        {server.region}
                    </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono text-left group-hover:text-cyan-300">
                    {server.description}
                </div>
            </div>

            <div className="flex flex-col items-end gap-1 relative z-10">
                <div className={`flex items-center gap-2 text-xs font-bold tracking-widest
                    ${isMaintenance ? 'text-red-500' : 'text-green-400'}
                `}>
                    <div className={`w-2 h-2 rounded-full ${isMaintenance ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
                    {server.status}
                </div>
                {!isMaintenance && (
                    <span className="text-[9px] text-cyan-700 group-hover:text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                        [ NHẤP ĐỂ VÀO ]
                    </span>
                )}
            </div>
        </button>
    );
}

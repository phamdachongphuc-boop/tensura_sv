import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { UserProfile } from '../types';
import { Button } from './Button';

interface Props {
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Database Connection Status
  const [dbStatus, setDbStatus] = useState<'CHECKING' | 'ONLINE' | 'ERROR'>('CHECKING');
  const [dbMessage, setDbMessage] = useState('');

  useEffect(() => {
    const checkDB = async () => {
        const result = await authService.checkConnection();
        if (result.online) {
            setDbStatus('ONLINE');
        } else {
            setDbStatus('ERROR');
            setDbMessage(result.message || 'Lỗi không xác định');
        }
    };
    checkDB();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (dbStatus === 'ERROR') {
        setError('Không thể kết nối Database. Vui lòng kiểm tra lại cấu hình Supabase.');
        return;
    }

    setLoading(true);

    try {
        if (isRegistering) {
            if (password !== confirmPassword) {
                setError('Mật khẩu xác nhận không khớp.');
                setLoading(false);
                return;
            }
            if (username.length < 3) {
                setError('Tên đăng nhập phải dài hơn 3 ký tự.');
                setLoading(false);
                return;
            }
            
            // Updated register call handling
            const result = await authService.register(username, password);
            if (result.success) {
                // Auto login after register
                const loginResult = await authService.login(username, password);
                if (loginResult.user) {
                    onLoginSuccess(loginResult.user);
                } else {
                    // This shouldn't happen usually
                    setError(loginResult.error || "Đăng ký thành công nhưng không thể tự động đăng nhập.");
                    setIsRegistering(false); // Switch to login mode
                }
            } else {
                setError(result.error || 'Lỗi đăng ký không xác định.');
            }
        } else {
            const result = await authService.login(username, password);
            if (result.user) {
                onLoginSuccess(result.user);
            } else {
                setError(result.error || 'Tên đăng nhập hoặc mật khẩu không đúng.');
            }
        }
    } catch (err: any) {
        console.error(err);
        setError("Lỗi hệ thống: " + (err.message || err));
    }
    
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in relative z-10">
      
      <div className="text-center mb-8 relative">
        <div className="absolute -inset-10 bg-cyan-500/10 blur-3xl rounded-full"></div>
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-500 rpg-font tracking-widest drop-shadow-[0_0_25px_rgba(6,182,212,0.8)]">
            TENSURA
        </h1>
        <p className="text-cyan-400 font-mono tracking-[0.5em] text-xs mt-2 uppercase">Global System Authentication</p>
      </div>

      <div className="raphael-panel w-full max-w-md p-8 border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.2)] relative overflow-hidden">
        
        {/* Animated Corner Borders */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400"></div>

        <h2 className="text-xl font-bold text-cyan-100 text-center mb-6 system-font tracking-widest border-b border-cyan-800 pb-2">
            {isRegistering ? 'THIẾT LẬP LINH HỒN MỚI' : 'XÁC MINH DANH TÍNH'}
        </h2>

        {/* DATABASE STATUS INDICATOR */}
        <div className="mb-4 flex justify-center">
             {dbStatus === 'CHECKING' && (
                 <span className="text-xs text-yellow-500 animate-pulse font-mono">⟳ Connecting to World System...</span>
             )}
             {dbStatus === 'ONLINE' && (
                 <span className="text-xs text-green-400 font-mono flex items-center gap-2 px-3 py-1 bg-green-900/20 rounded border border-green-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></span>
                    SYSTEM ONLINE
                 </span>
             )}
             {dbStatus === 'ERROR' && (
                 <div className="text-center">
                    <span className="text-xs text-red-500 font-mono font-bold flex items-center gap-2 justify-center mb-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        CONNECTION FAILED
                    </span>
                    <p className="text-[9px] text-red-300 max-w-xs mx-auto">{dbMessage}</p>
                 </div>
             )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-cyan-600 mb-1 uppercase tracking-widest">
                        Định danh (Username)
                    </label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full bg-slate-900/50 border border-cyan-800 py-3 px-4 text-cyan-100 placeholder-cyan-900/50 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] focus:outline-none transition-all font-mono"
                        placeholder="Nhập tên đăng nhập..."
                        required
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-cyan-600 mb-1 uppercase tracking-widest">
                        Mã khóa (Password)
                    </label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-slate-900/50 border border-cyan-800 py-3 px-4 text-cyan-100 placeholder-cyan-900/50 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] focus:outline-none transition-all font-mono"
                        placeholder="••••••••"
                        required
                    />
                </div>
                
                {isRegistering && (
                    <div className="animate-slide-up">
                        <label className="block text-[10px] font-bold text-cyan-600 mb-1 uppercase tracking-widest">
                            Xác nhận mã khóa
                        </label>
                        <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-cyan-800 py-3 px-4 text-cyan-100 placeholder-cyan-900/50 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] focus:outline-none transition-all font-mono"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                )}
            </div>

            {error && (
                <div className="text-red-400 text-xs font-mono text-center bg-red-900/20 p-3 border border-red-800 animate-pulse break-words">
                    ⚠ {error}
                </div>
            )}

            <Button 
                type="submit" 
                isLoading={loading}
                disabled={dbStatus === 'ERROR'}
                className="w-full py-3 bg-cyan-700 hover:bg-cyan-600 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] tracking-[0.2em] group overflow-hidden"
            >
                <span className="relative z-10">{isRegistering ? '[ KHỞI TẠO ]' : '[ KẾT NỐI ]'}</span>
            </Button>
        </form>

        <div className="mt-6 text-center">
            <button 
                onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                    setUsername('');
                    setPassword('');
                    setConfirmPassword('');
                }}
                className="text-xs text-cyan-600 hover:text-cyan-300 transition-colors font-mono underline decoration-cyan-800 underline-offset-4"
            >
                {isRegistering ? "Đã có dữ liệu linh hồn? Đăng nhập" : "Chưa có dữ liệu? Thiết lập mới"}
            </button>
        </div>

      </div>
      
      <div className="mt-4 text-[10px] text-cyan-900 font-mono">
        RAPHAEL SECURITY PROTOCOL v2.5 CLOUD
      </div>
    </div>
  );
};
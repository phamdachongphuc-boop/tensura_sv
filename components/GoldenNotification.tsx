import React, { useEffect, useState } from 'react';

interface Props {
  message: string | null;
  onClose: () => void;
}

export const GoldenNotification: React.FC<Props> = ({ message, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 500); // Wait for fade out animation
      }, 4000); // Show for 4 seconds
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message && !visible) return null;

  return (
    <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[150] transition-all duration-500 ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'} pointer-events-none`}>
      <div className="relative min-w-[300px] md:min-w-[500px] text-center">
        
        {/* Glow Effects */}
        <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
        
        {/* Main Banner */}
        <div className="bg-gradient-to-r from-yellow-900/90 via-black/90 to-yellow-900/90 border-y-2 border-yellow-400 p-1 shadow-[0_0_30px_rgba(234,179,8,0.6)] relative overflow-hidden rounded-sm">
            
            {/* Shine Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/40 to-transparent w-1/2 skew-x-[-20deg] animate-[shineSweep_2s_infinite]"></div>

            <div className="relative z-10 py-3 px-6 flex flex-col items-center justify-center">
                {/* Decoration Icons */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-yellow-500 text-2xl animate-spin-slow">❖</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-500 text-2xl animate-spin-slow">❖</div>

                <div className="text-[10px] text-yellow-300 font-bold tracking-[0.4em] uppercase mb-1 drop-shadow-md">
                    THÔNG BÁO HỆ THỐNG
                </div>
                <div className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-300 to-yellow-600 font-serif tracking-wide text-shadow-gold">
                    {message}
                </div>
            </div>
        </div>
        
        {/* Bottom Tip */}
        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-yellow-500 mx-auto opacity-80"></div>
      </div>
    </div>
  );
};
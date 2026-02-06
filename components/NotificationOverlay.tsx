import React, { useEffect } from 'react';

export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'success';
}

interface Props {
  notifications: Notification[];
  onRemove: (id: number) => void;
}

export const NotificationOverlay: React.FC<Props> = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
      {notifications.map((notif) => (
        <NotificationItem key={notif.id} notification={notif} onRemove={onRemove} />
      ))}
    </div>
  );
};

const NotificationItem: React.FC<{ notification: Notification; onRemove: (id: number) => void }> = ({ notification, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id);
    }, 5000); // Auto dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [notification.id, onRemove]);

  return (
    <div className="pointer-events-auto animate-slide-in-right">
      <div className="bg-black/90 border-t-2 border-b-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)] p-3 relative overflow-hidden">
         {/* Background Glow */}
        <div className="absolute inset-0 bg-yellow-500/5 z-0"></div>
        
        {/* Content */}
        <div className="relative z-10 flex items-start gap-3">
             <div className="mt-1">
                 <div className="w-2 h-2 bg-yellow-400 rotate-45 shadow-[0_0_5px_#facc15]"></div>
             </div>
             <div>
                 <div className="text-[10px] text-yellow-600 font-bold uppercase tracking-widest mb-1 system-font">
                    :: THÔNG BÁO ::
                 </div>
                 <div className="text-yellow-100 font-serif text-sm leading-tight text-shadow-yellow">
                    {notification.message}
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};
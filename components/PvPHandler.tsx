
import React, { useEffect, useState, useRef } from 'react';
import { BattleState, Character, UserProfile } from '../types';
import { authService } from '../services/authService';
import { PvPArena } from './PvPArena';
import { Button } from './Button';

interface Props {
    currentUser: UserProfile;
    userCharacter: Character | null; // Needed for stats in battle
}

export const PvPHandler: React.FC<Props> = ({ currentUser, userCharacter }) => {
    const [activeBattle, setActiveBattle] = useState<BattleState | null>(null);
    const [invite, setInvite] = useState<BattleState | null>(null);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    
    // Use ref to track active battle status inside interval to avoid stale closures without re-triggering effect
    const activeBattleRef = useRef<BattleState | null>(null);
    useEffect(() => { activeBattleRef.current = activeBattle; }, [activeBattle]);

    useEffect(() => {
        if (!currentUser) return;

        // 1. Initial State Check
        const checkState = async () => {
            // Check for existing active battles first
            const existing = await authService.checkActiveBattle(currentUser.username);
            if (existing) {
                setActiveBattle(existing);
            } else {
                // Check for pending invites immediately
                const pending = await authService.checkPendingInvite(currentUser.username);
                if (pending) setInvite(pending);
            }
        };
        checkState();

        // 2. Realtime Subscription
        const unsubscribe = authService.subscribeToBattles(currentUser.username, (payload) => {
            const battle = payload.new as BattleState;
            
            // Case 1: Receiving an invite (PENDING)
            if (battle.status === 'PENDING' && battle.target === currentUser.username) {
                setInvite(battle);
            }

            // Case 2: Battle I accepted or started is now IN_PROGRESS
            if (battle.status === 'IN_PROGRESS' && (battle.challenger === currentUser.username || battle.target === currentUser.username)) {
                setActiveBattle(battle);
                setInvite(null); // Clear invite if accepted
            }

            // Case 3: Update current battle state
            if (activeBattleRef.current && battle.id === activeBattleRef.current.id) {
                setActiveBattle(battle);
            }
            
            // Case 4: Battle Declined
            if (battle.status === 'DECLINED' && battle.challenger === currentUser.username) {
                alert(`Người chơi [${battle.target}] đã từ chối lời thách đấu.`);
            }
        });

        // 3. Polling Fallback (Crucial for reliability)
        pollIntervalRef.current = setInterval(async () => {
            const currentActive = activeBattleRef.current;

            if (!currentActive) {
                // Check if an active battle started without us knowing (rare but possible)
                const checkActive = await authService.checkActiveBattle(currentUser.username);
                if (checkActive) {
                    setActiveBattle(checkActive);
                    setInvite(null);
                } else {
                    // Only check for invites if NOT in battle
                    const pending = await authService.checkPendingInvite(currentUser.username);
                    if (pending) {
                        setInvite(pending);
                    } else {
                        // If no pending invite found from DB, and we have one locally, it means it was cancelled/declined elsewhere
                        // Only clear if we actually have a stale invite
                        setInvite(prev => prev ? null : prev);
                    }
                }
            } else {
                // If in battle, poll for updates
                const current = await authService.getBattle(currentActive.id);
                if (current) {
                    // Simple check for updates
                    setActiveBattle(current);
                }
            }
        }, 2000);

        return () => {
            unsubscribe();
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [currentUser]);

    const handleAccept = async () => {
        if (invite) {
            await authService.acceptBattle(invite.id);
            // We await the next poll/subscription update to set activeBattle
        }
    };

    const handleDecline = async () => {
        if (invite) {
            await authService.declineBattle(invite.id);
            setInvite(null);
        }
    };

    if (activeBattle && userCharacter) {
        return (
            <PvPArena 
                battle={activeBattle} 
                currentUser={currentUser} 
                userCharacter={userCharacter} 
                onClose={() => setActiveBattle(null)}
            />
        );
    }

    if (invite) {
        return (
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-scale-in">
                <div className="raphael-panel w-full max-w-sm p-6 border-2 border-red-500 shadow-[0_0_50px_rgba(220,38,38,0.4)] text-center relative overflow-hidden">
                     {/* Animated Background */}
                    <div className="absolute inset-0 bg-red-900/20 animate-pulse pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="text-4xl mb-4 animate-bounce">⚔️</div>
                        <h2 className="text-xl font-bold text-red-500 mb-2 system-font tracking-widest text-glow">LỜI KHIÊU CHIẾN</h2>
                        <div className="h-[1px] w-full bg-red-800 mb-4"></div>
                        <p className="text-white mb-6 font-mono leading-relaxed">
                            Người chơi tên <span className="font-bold text-cyan-400 text-lg uppercase">{invite.challenger}</span>
                            <br/>
                            Đã gửi thư khiêu chiến!
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button onClick={handleDecline} variant="secondary" className="border-slate-500 w-32">
                                Không muốn
                            </Button>
                            <Button onClick={handleAccept} variant="danger" className="animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.6)] w-32 font-bold">
                                Chấp nhận
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

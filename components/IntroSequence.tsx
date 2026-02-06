import React, { useEffect, useState, useRef } from 'react';

interface Props {
  onComplete: () => void;
  uniqueSkillName: string; 
}

export const IntroSequence: React.FC<Props> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  
  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- SOUND SYNTHESIS ---
  const playTone = (freq: number, type: 'sine' | 'square' | 'triangle', duration: number, vol: number = 0.1) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    // Envelope for sharp "ping" or "click"
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playSystemPing = () => {
    // The iconic high-pitched "Ding" of the World System
    playTone(2000, 'sine', 1.5, 0.3); // Primary High Tone
    setTimeout(() => playTone(1000, 'triangle', 1.0, 0.1), 50); // Undertone
  };

  const playTypingClick = () => {
    // Very short, mechanical click
    const freq = 600 + Math.random() * 200;
    playTone(freq, 'square', 0.03, 0.05);
  };

  const playStaticNoise = () => {
    // Simulating static burst
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const bufferSize = ctx.sampleRate * 0.5; // 0.5 sec
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.05;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    noise.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  };

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const sequence = async () => {
        // Stage 1: Triangle Draw (0s)
        await new Promise(r => setTimeout(r, 500));
        setStage(1);
        playSystemPing();

        // Stage 2: Orb Glow & Kanji (1.5s)
        await new Promise(r => setTimeout(r, 1500));
        setStage(2);
        playStaticNoise();

        // Stage 3: Typing Line 1 (2.0s)
        await new Promise(r => setTimeout(r, 500));
        setStage(3);
        const text1 = "Chào mừng chủ nhân đến với giới mới,";
        for (let i = 0; i <= text1.length; i++) {
            setLine1(text1.slice(0, i));
            if (i % 2 !== 0) playTypingClick();
            await new Promise(r => setTimeout(r, 40));
        }

        // Stage 4: Typing Line 2 (4.0s)
        await new Promise(r => setTimeout(r, 300));
        const text2 = "Raphael sẽ làm trợ lý của chủ nhân.";
        for (let i = 0; i <= text2.length; i++) {
            setLine2(text2.slice(0, i));
            if (i % 2 !== 0) playTypingClick();
            await new Promise(r => setTimeout(r, 40));
        }

        // Stage 5: End
        await new Promise(r => setTimeout(r, 2500));
        onComplete();
    };

    sequence();

    return () => {
        if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden font-mono select-none">
        
        {/* CRT Scanline & Vignette */}
        <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] background-size-[100%_4px,6px_100%]"></div>
        <div className="absolute inset-0 pointer-events-none z-40 bg-radial-gradient(circle, transparent 60%, black 100%)"></div>

        {/* MAIN CONTAINER */}
        <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] flex items-center justify-center">
            
            {/* 1. INVERTED TRIANGLE (SVG) */}
            {/* The class 'votw-triangle' in index.html handles the stroke dash animation */}
            {stage >= 1 && (
                <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10" viewBox="0 0 100 100">
                     <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    <polygon 
                        points="5,5 95,5 50,90" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="1.2"
                        className="votw-triangle"
                        filter="url(#glow)"
                    />
                </svg>
            )}

            {/* 2. GLOWING ORB (Core) */}
            <div className={`absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 transition-opacity duration-1000 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                {/* Core White */}
                <div className="w-16 h-16 bg-white rounded-full shadow-[0_0_50px_20px_rgba(255,255,255,0.6)] animate-pulse"></div>
                {/* Inner Ring */}
                <div className="absolute inset-0 border-2 border-cyan-200 rounded-full animate-ping opacity-50"></div>
            </div>

            {/* 3. KANJI BACKGROUND (Faint) */}
            <div className={`absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl font-black text-white/5 z-0 pointer-events-none transition-all duration-500 jp-font ${stage >= 2 ? 'scale-100 opacity-100 blur-[2px]' : 'scale-150 opacity-0 blur-xl'}`}>
                告
            </div>

            {/* 4. TEXT CONTENT */}
            {stage >= 3 && (
                <div className="absolute top-[55%] w-full text-center z-30 flex flex-col items-center gap-4">
                     {/* NOTICE LABEL */}
                     <div className="bg-white/10 backdrop-blur-md px-4 py-1 border border-white/20 rounded-sm mb-2 animate-fade-in">
                        <span className="text-[10px] text-white tracking-[0.5em] font-bold">NOTICE</span>
                     </div>

                     {/* Line 1 */}
                     <div className="relative">
                        <p className="text-cyan-100 md:text-xl font-bold tracking-wider drop-shadow-[0_0_5px_rgba(34,211,238,0.8)] votw-glitch">
                            {line1}
                        </p>
                     </div>

                     {/* Line 2 */}
                     <div className="relative">
                        <h1 className="text-white md:text-2xl font-black uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,1)]">
                            {line2}<span className="animate-pulse">_</span>
                        </h1>
                     </div>
                </div>
            )}
        </div>
    </div>
  );
};
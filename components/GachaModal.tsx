import React, { useEffect, useState, useRef } from 'react';
import { Button } from './Button';

interface UltimateSkill {
  id: string;
  name: string;
  description: string;
  color: string;
  glow: string;
  icon: string;
}

// Full List of Tensura Ultimate Skills (Virtues & Sins)
const ULTIMATE_SKILLS: UltimateSkill[] = [
  // --- VIRTUE SERIES ---
  {
    id: "Raphael",
    name: "RAPHAEL (Thông Thái Chi Vương)",
    description: "Gia tốc tư duy 1 triệu lần. Phân tích, giám định, hợp nhất và tách biệt kỹ năng. Tối ưu hóa mọi phép thuật.",
    color: "text-red-400",
    glow: "shadow-red-500/50 border-red-500",
    icon: "🧠"
  },
  {
    id: "Uriel",
    name: "URIEL (Thệ Ước Chi Vương)",
    description: "Thao túng không gian vô hạn. Ngục tù vĩnh hằng. Kiểm soát nhiệt độ và rào chắn tuyệt đối (Absolute Defense).",
    color: "text-orange-400",
    glow: "shadow-orange-500/50 border-orange-500",
    icon: "🔥"
  },
  {
    id: "Michael",
    name: "MICHAEL (Công Lý Chi Vương)",
    description: "Thống trị tối thượng (Castle Guard). Triệu hồi và kiểm soát bất kỳ ai có 'Yếu tố Thiên thần'.",
    color: "text-yellow-100",
    glow: "shadow-yellow-200/50 border-yellow-200",
    icon: "👑"
  },
  {
    id: "Sariel",
    name: "SARIEL (Hy Vọng Chi Vương)",
    description: "Thao túng sinh mệnh và cái chết. Hồi phục siêu tốc và khả năng ban sự sống.",
    color: "text-blue-200",
    glow: "shadow-blue-300/50 border-blue-300",
    icon: "✨"
  },
  {
    id: "Metatron",
    name: "METATRON (Thuần Khiết Chi Vương)",
    description: "Thao túng các hạt vật chất ở cấp độ nguyên tử. Phân rã và tái cấu trúc vật chất.",
    color: "text-gray-100",
    glow: "shadow-white/50 border-white",
    icon: "❄️"
  },
  {
    id: "Raguel",
    name: "RAGUEL (Cứu Trợ Chi Vương)",
    description: "Khuếch đại và hỗ trợ đồng minh. Kiểm soát và phân phối năng lượng trên diện rộng.",
    color: "text-green-300",
    glow: "shadow-green-400/50 border-green-400",
    icon: "🔰"
  },
  {
    id: "Gabriel",
    name: "GABRIEL (Kiên Nhẫn Chi Vương)",
    description: "Phòng thủ tuyệt đối trước các đòn tấn công vật lý. Làm chậm thời gian nhận thức của đối thủ.",
    color: "text-indigo-300",
    glow: "shadow-indigo-400/50 border-indigo-400",
    icon: "🛡️"
  },

  // --- SIN SERIES ---
  {
    id: "Beelzebuth",
    name: "BEELZEBUTH (Bạo Thực Chi Vương)",
    description: "Hấp thụ mọi vật chất và năng lượng. Giam giữ kẻ thù trong Dạ dày. Sao chép kỹ năng của đối tượng bị ăn.",
    color: "text-purple-500",
    glow: "shadow-purple-600/50 border-purple-600",
    icon: "👹"
  },
  {
    id: "Lucifer",
    name: "LUCIFER (Kiêu Hãnh Chi Vương)",
    description: "Sao chép kỹ năng của đối thủ chỉ bằng cách nhìn. Điều khiển xác suất sự kiện thành hiện thực.",
    color: "text-fuchsia-400",
    glow: "shadow-fuchsia-500/50 border-fuchsia-500",
    icon: "👁️"
  },
  {
    id: "Mammon",
    name: "MAMMON (Tham Lam Chi Vương)",
    description: "Tước đoạt tâm trí, kỹ năng và sinh mệnh của kẻ thù. Thao túng dục vọng.",
    color: "text-emerald-400",
    glow: "shadow-emerald-500/50 border-emerald-500",
    icon: "💎"
  },
  {
    id: "Satanael",
    name: "SATANAEL (Phẫn Nộ Chi Vương)",
    description: "Biến cơn giận thành năng lượng vô hạn. Sức mạnh tăng dần theo thời gian chiến đấu.",
    color: "text-red-600",
    glow: "shadow-red-700/50 border-red-700",
    icon: "⚡"
  },
  {
    id: "Leviathan",
    name: "LEVIATHAN (Đố Kỵ Chi Vương)",
    description: "Hạ cấp kỹ năng của đối phương. Phá vỡ cấu trúc phòng thủ của kẻ địch mạnh hơn mình.",
    color: "text-cyan-600",
    glow: "shadow-cyan-700/50 border-cyan-700",
    icon: "🌊"
  },
  {
    id: "Belphegor",
    name: "BELPHEGOR (Lười Biếng Chi Vương)",
    description: "Tạo ra ảo ảnh lừa dối thế giới. Tích tụ năng lượng khi không hoạt động để tung đòn hủy diệt.",
    color: "text-slate-400",
    glow: "shadow-slate-500/50 border-slate-500",
    icon: "💤"
  },
  {
    id: "Asmodeus",
    name: "ASMODEUS (Sắc Dục Chi Vương)",
    description: "Kiểm soát cảm xúc và sự sống. Có thể hồi sinh người chết hoặc ban cái chết tức thì.",
    color: "text-pink-500",
    glow: "shadow-pink-600/50 border-pink-600",
    icon: "❤️"
  },
   // --- SPECIAL ---
  {
    id: "Veldora",
    name: "VELDORA (Bão Phong Chi Vương)",
    description: "Triệu hồi Rồng Bão Tố. Hồi phục ma tố tức thời. Thao túng sấm sét và bão tố đen.",
    color: "text-yellow-300",
    glow: "shadow-yellow-400/50 border-yellow-400",
    icon: "🐉"
  }
];

interface Props {
  onComplete: (skillName: string, description: string) => void;
}

export const GachaModal: React.FC<Props> = ({ onComplete }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);
  const [finalResult, setFinalResult] = useState<UltimateSkill | null>(null);
  
  // Use Ref to ensure logic runs once and variables are stable
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // 1. Determine the winner immediately randomly
    // Math.random() ensures a new result every time the component mounts
    const randomIndex = Math.floor(Math.random() * ULTIMATE_SKILLS.length);
    const winner = ULTIMATE_SKILLS[randomIndex];
    
    // 2. Calculate spin animation details
    // Spin between 4 to 6 full rounds for variety
    const randomRotations = 4 + Math.floor(Math.random() * 3); 
    const totalSteps = (ULTIMATE_SKILLS.length * randomRotations) + randomIndex;
    
    let currentStep = 0;
    let speed = 50; // Starting speed (ms)
    let timer: ReturnType<typeof setTimeout>;

    const runSpin = () => {
      // Advance index cyclically
      setActiveIndex(prev => (prev + 1) % ULTIMATE_SKILLS.length);
      currentStep++;

      if (currentStep < totalSteps) {
        // Deceleration logic (Slow down near the end)
        const remaining = totalSteps - currentStep;
        if (remaining < 20) speed += 10;
        if (remaining < 10) speed += 30;
        if (remaining < 5) speed += 60;

        timer = setTimeout(runSpin, speed);
      } else {
        // STOP Exactly on the winner
        // Double check index matches just in case (though math guarantees it)
        setIsSpinning(false);
        setFinalResult(winner);
      }
    };

    // Start the loop
    timer = setTimeout(runSpin, speed);

    return () => clearTimeout(timer);
  }, []);

  const handleClaim = () => {
    if (finalResult) {
      onComplete(finalResult.name, finalResult.description);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-scale-in">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        
        <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-cyan-400 system-font tracking-widest text-glow animate-pulse">
                HỆ THỐNG NGẪU NHIÊN
            </h2>
            <div className="h-[2px] w-32 bg-cyan-500 mx-auto"></div>
            <p className="text-[10px] text-cyan-600 font-mono">RANDOM SKILL ACQUISITION PROTOCOL</p>
        </div>

        {/* The Machine */}
        <div className="relative w-full h-72 bg-slate-900 border-4 border-slate-700 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)] flex items-center justify-center">
            
            {/* Overlay Gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-transparent to-black/90 z-20 pointer-events-none"></div>
            
            {/* Center Highlight Line (The Winning Zone) */}
            <div className="absolute w-full h-28 border-y-2 border-cyan-400/50 bg-cyan-400/5 z-10 backdrop-blur-[1px] shadow-[0_0_20px_rgba(6,182,212,0.1)]"></div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-500 z-20 animate-pulse">◄</div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-cyan-500 z-20 animate-pulse">►</div>

            {/* Scrolling Items Container */}
            <div className="relative w-full h-full flex items-center justify-center">
                {ULTIMATE_SKILLS.map((skill, idx) => {
                    const isActive = idx === activeIndex;
                    
                    // Optimization: Only render the active item and immediate neighbors during spin to save resources?
                    // Actually, for 15 items, React handles it fine. Let's just hide non-active ones during spin for "flashcard" effect.
                    if (!isActive && isSpinning) return null; 

                    return (
                        <div key={idx} className={`absolute transition-all duration-100 flex flex-col items-center justify-center w-64 p-4 rounded-lg
                            ${isActive 
                                ? `scale-110 z-30 opacity-100 ${skill.glow} border-2 bg-slate-800/95` 
                                : 'opacity-0 scale-75'
                            }
                        `}>
                            <div className="text-6xl mb-4 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-bounce">
                                {skill.icon}
                            </div>
                            <div className={`text-xl font-bold ${skill.color} font-mono tracking-wider text-center leading-tight`}>
                                {skill.name.split('(')[0]}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-1 uppercase">
                                {skill.name.includes('(') ? skill.name.split('(')[1].replace(')', '') : 'Ultimate Skill'}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>

        {/* Result Description (Only show when stopped) */}
        {!isSpinning && finalResult && (
             <div className="bg-slate-900/80 border border-cyan-500/30 p-5 rounded-sm text-center w-full animate-slide-in-right shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                <div className="text-[10px] text-cyan-600 uppercase tracking-widest mb-1">KẾT QUẢ THẨM ĐỊNH</div>
                <p className={`font-bold text-lg ${finalResult.color} mb-2 text-glow`}>{finalResult.name}</p>
                <div className="h-[1px] w-1/2 bg-slate-700 mx-auto mb-3"></div>
                <p className="text-sm text-cyan-100/90 italic font-serif leading-relaxed">
                    "{finalResult.description}"
                </p>
             </div>
        )}

        {/* Action Button */}
        <div className="h-16 flex items-center justify-center w-full">
            {!isSpinning ? (
                <Button onClick={handleClaim} className="w-full py-4 text-lg bg-cyan-700 hover:bg-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.5)] border-cyan-400 animate-pulse-fast font-bold tracking-[0.2em]">
                    [ TIẾP NHẬN SỨC MẠNH ]
                </Button>
            ) : (
                <div className="flex flex-col items-center gap-2">
                     <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                     <div className="text-cyan-500 font-mono text-xs animate-pulse tracking-widest">ĐANG TÁI CẤU TRÚC KỸ NĂNG...</div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};
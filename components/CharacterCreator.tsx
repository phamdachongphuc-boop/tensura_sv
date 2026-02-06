
import React, { useState } from 'react';
import { Character, DifficultyLevel } from '../types';
import { Button } from './Button';

const RACES = [
  { 
      id: "Slime", 
      label: "Slime (Chất nhờn)", 
      desc: "Kháng vật lý, Thích ứng cao",
      uniqueSkill: "Kẻ Săn Mồi (Predator)",
      baseSkills: ["Hấp Thụ", "Hòa Tan", "Tự Tái Tạo", "Kháng Vật Lý", "Cảm Thụ Nhiệt Độ"]
  },
  { 
      id: "Human", 
      label: "Human (Dị giới nhân)", 
      desc: "Cân bằng, Tiềm năng ma thuật",
      uniqueSkill: "Kẻ Được Chosen (Chosen One)",
      baseSkills: ["Thông Thạo Ngôn Ngữ", "Võ Thuật", "Ma Pháp Nguyên Tố", "Nấu Ăn"]
  },
  { 
      id: "Kijin", 
      label: "Kijin (Quỷ Nhân)", 
      desc: "Sức mạnh thể chất, Chiến binh",
      uniqueSkill: "Chiến Thần (War God)",
      baseSkills: ["Cường Hóa Cơ Thể", "Hỏa Diệm Thuật", "Kiếm Thuật", "Hào Quang Uy Hiếp"]
  },
  { 
      id: "Demon", 
      label: "Demon (Ác Ma)", 
      desc: "Ma lực khổng lồ, Tinh thần lực",
      uniqueSkill: "Cám Dỗ (Tempter)",
      baseSkills: ["Ma Pháp Đen", "Kháng Phép", "Dịch Chuyển Tức Thời", "Thao Túng Vật Chất"]
  }
];

const DIFFICULTIES: { id: DifficultyLevel, label: string, desc: string, color: string }[] = [
  { id: 'EASY', label: 'Bình Minh (Dễ)', desc: 'Thế giới ôn hòa, phù hợp cho người mới.', color: 'text-green-400 border-green-900/50' },
  { id: 'NORMAL', label: 'Thách Thức (Vừa)', desc: 'Cân bằng giữa nguy hiểm và cơ hội.', color: 'text-cyan-400 border-cyan-900/50' },
  { id: 'HARD', label: 'Địa Ngục (Khó)', desc: 'Ma tố khắc nghiệt, kẻ thù hung tàn.', color: 'text-orange-500 border-orange-900/50' },
  { id: 'INSTANT_DEATH', label: 'Tử Vong (Cực Hạn)', desc: 'Mọi sai lầm đều trả giá bằng tính mạng.', color: 'text-red-500 border-red-900/50 animate-pulse' }
];

interface Props {
  onComplete: (char: Character) => void;
  onCancel: () => void;
}

export const CharacterCreator: React.FC<Props> = ({ onComplete, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    raceIndex: 0,
    reincarnationReason: '',
    location: '',
    difficulty: 'NORMAL' as DifficultyLevel
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const selectedRace = RACES[formData.raceIndex];
    const uniqueSkill = selectedRace.uniqueSkill;
    const startingSkills = [uniqueSkill, "Đại Hiền Giả (Great Sage)", ...selectedRace.baseSkills];
    
    const newCharacter: Character = {
      name: formData.name,
      race: selectedRace.id,
      uniqueSkill: uniqueSkill,
      reincarnationReason: formData.reincarnationReason || "Đột ngột qua đời ở kiếp trước.",
      location: formData.location || "Hang động Veldora",
      attributes: {
        strength: 10,
        magic: 10,
        agility: 10,
        defense: 10
      },
      status: {
        hp: 100,
        maxHp: 100,
        mp: 100,
        maxMp: 100,
        skills: startingSkills,
        equippedSkills: [uniqueSkill],
        activeEffects: [],
        inventory: ["Quà tân thủ 1", "Hộp Quà Bí Ẩn", "Thảo dược Hipokute x5", "Quần áo cơ bản"],
        quests: [],
        level: 1,
        evolutionStage: `Vô danh (${selectedRace.id})`,
        difficulty: formData.difficulty
      }
    };
    onComplete(newCharacter);
  };

  const currentRace = RACES[formData.raceIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in relative z-10">
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-cyan-100 system-font tracking-[0.2em] text-shimmer whitespace-nowrap">
           TÁI CẤU TRÚC LINH HỒN
        </h2>
        <div className="h-[1px] w-32 bg-cyan-500/50 mx-auto mt-2"></div>
      </div>

      <div className="raphael-panel w-full max-w-5xl rounded-lg border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.1)] relative overflow-hidden flex flex-col lg:flex-row min-h-[500px]">
        
        <div className="lg:w-5/12 p-6 md:p-8 bg-slate-900/50 border-r border-cyan-800/30 relative flex flex-col">
            <div className="space-y-6 flex-1">
                <div>
                    <label className="block text-[10px] font-bold text-cyan-500 mb-2 uppercase tracking-widest whitespace-nowrap">
                        01. Định Danh Cá Thể
                    </label>
                    <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-transparent border-b border-cyan-800 py-2 text-2xl font-bold text-cyan-50 focus:border-cyan-400 focus:outline-none transition-all font-serif"
                        placeholder="Nhập tên..."
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-cyan-500 mb-3 uppercase tracking-widest whitespace-nowrap">
                        02. Cấu Trúc Vật Chất (Chủng Tộc)
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                        {RACES.map((race, idx) => (
                            <button
                                key={race.id}
                                type="button"
                                onClick={() => setFormData({...formData, raceIndex: idx})}
                                className={`text-left p-2 rounded-sm border transition-all text-[10px] uppercase tracking-wider whitespace-nowrap
                                    ${formData.raceIndex === idx 
                                        ? 'bg-cyan-900/40 border-cyan-400 text-cyan-100' 
                                        : 'bg-slate-900/30 border-slate-700 text-slate-500 hover:border-cyan-600'
                                    }
                                `}
                            >
                                {race.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-cyan-500 mb-3 uppercase tracking-widest whitespace-nowrap">
                        03. Độ Đậm Đặc Linh Hồn (Độ Khó)
                    </label>
                    <div className="space-y-2">
                        {DIFFICULTIES.map((diff) => (
                            <button
                                key={diff.id}
                                type="button"
                                onClick={() => setFormData({...formData, difficulty: diff.id})}
                                className={`w-full text-left p-2 rounded-sm border transition-all relative overflow-hidden
                                    ${formData.difficulty === diff.id 
                                        ? `bg-cyan-900/40 ${diff.color} shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]` 
                                        : 'bg-slate-900/30 border-slate-700 text-slate-500 hover:border-cyan-800'
                                    }
                                `}
                            >
                                <div className="font-bold text-xs uppercase whitespace-nowrap">{diff.label}</div>
                                <div className="text-[9px] opacity-70 mt-0.5 whitespace-nowrap">{diff.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="lg:w-7/12 p-6 md:p-8 bg-gradient-to-br from-slate-900/80 to-cyan-950/20 relative flex flex-col justify-between">
             <div className="space-y-8">
                <div className="p-4 bg-cyan-900/10 border border-cyan-500/20 rounded">
                    <h3 className="text-cyan-400 font-bold mb-2 text-sm uppercase tracking-widest whitespace-nowrap">Thông tin khởi tạo</h3>
                    <div className="text-xs text-slate-300 space-y-2">
                        <p><span className="text-cyan-600 font-bold whitespace-nowrap">CHỦNG TỘC:</span> {currentRace.label}</p>
                        <p><span className="text-yellow-600 font-bold whitespace-nowrap">KỸ NĂNG:</span> {currentRace.uniqueSkill}</p>
                        <p><span className="text-red-500 font-bold whitespace-nowrap">ĐỘ KHÓ:</span> {DIFFICULTIES.find(d => d.id === formData.difficulty)?.label}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-bold text-cyan-600 mb-2 uppercase tracking-widest whitespace-nowrap">
                            04. Nguyên Nhân Chuyển Sinh
                        </label>
                        <textarea
                            value={formData.reincarnationReason}
                            onChange={e => setFormData({...formData, reincarnationReason: e.target.value})}
                            className="w-full bg-transparent border border-cyan-900/50 rounded-sm p-3 text-xs text-cyan-100 focus:border-cyan-500 focus:outline-none h-24 custom-scrollbar resize-none"
                            placeholder="Chết do tai nạn, làm việc quá sức..."
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-cyan-600 mb-2 uppercase tracking-widest whitespace-nowrap">
                            05. Vị Trí Xuất Hiện
                        </label>
                        <textarea
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                            className="w-full bg-transparent border border-cyan-900/50 rounded-sm p-3 text-xs text-cyan-100 focus:border-cyan-500 focus:outline-none h-24 custom-scrollbar resize-none"
                            placeholder="Hang động Veldora, rừng Jura..."
                        />
                    </div>
                </div>
             </div>

             <div className="mt-10 flex gap-4 pt-6 border-t border-cyan-800/30">
                <Button variant="ghost" onClick={onCancel}>HỦY BỎ</Button>
                <Button onClick={handleSubmit} className="flex-1 py-3 text-lg bg-cyan-700 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] tracking-[0.2em] whitespace-nowrap">
                    [ BẮT ĐẦU ]
                </Button>
             </div>
        </div>
      </div>
    </div>
  );
};

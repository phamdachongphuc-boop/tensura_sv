
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Character, ChatMessage, CharacterStatus, DifficultyLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface ModelTier {
  id: string;
  name: string;
  config: any;
}

const MODEL_TIERS: ModelTier[] = [
  {
    id: "gemini-3-pro-preview", 
    name: "GEMINI 3.0 PRO",
    config: { 
      temperature: 1.2,
      topK: 64,
      topP: 0.95
    }
  },
  {
    id: "gemini-3-flash-preview", 
    name: "GEMINI 3.0 FLASH",
    config: { 
      temperature: 0.9,
      topK: 40,
      topP: 0.95
    }
  }
];

let currentTierIndex = 0;
let tierLastFailedAt: number[] = [0, 0, 0];
const RECOVERY_COOLDOWN = 60000;

const getSystemInstruction = (difficulty: DifficultyLevel) => {
  const base = `Bạn là "Tiếng Nói Thế Giới" (World System) trong thế giới Tensura.`;

  const difficultyRules = {
    EASY: `
      CHẾ ĐỘ: BÌNH MINH (DỄ).
      - Thế giới thân thiện, ma tố ổn định.
      - Bạn đóng vai trò hướng dẫn người chơi tận tình.
      - Cái chết rất hiếm khi xảy ra trừ khi người chơi cố tình tự sát.
      - Hồi phục tài nguyên nhanh chóng.`,
    NORMAL: `
      CHẾ ĐỘ: THÁCH THỨC (BÌNH THƯỜNG).
      - Cân bằng giữa sinh tồn và khám phá.
      - Rủi ro là có thật. Kẻ thù sẽ tấn công nếu người chơi bất cẩn.
      - Quy tắc RPG tiêu chuẩn.`,
    HARD: `
      CHẾ ĐỘ: ĐỊA NGỤC (KHÓ).
      - NỒNG ĐỘ MA TỐ CỰC CAO: Gây sát thương liên tục (Mana Decay). Người chơi mất 5% MP mỗi hành động.
      - QUÁI VẬT HUNG TÀN: Kẻ thù luôn cấp cao hơn người chơi ít nhất 20 level.
      - KHÔNG KHOAN NHƯỢNG: Một sai sót nhỏ trong chiến thuật dẫn đến mất 50% HP ngay lập tức.
      - MÔI TRƯỜNG KHẮC NGHIỆT: High Gravity khiến Agility giảm 70%.`,
    INSTANT_DEATH: `
      CHẾ ĐỘ: TỬ VONG TỨC THÌ (CỰC HẠN - TRUYỆN GỐC).
      - THẾ GIỚI TỪ CHỐI SỰ TỒN TẠI: Bất kỳ hành động nào không được bảo hộ bởi [ ∞ ] đều dẫn đến cái chết tức thì và tàn khốc.
      - CHẾ ĐỘ "SÁT THỦ": Bạn (AI) phải tìm mọi cách hợp lý để GIẾT người chơi nếu họ không có God Mode.
      - HÀNH ĐỘNG CỦA NGƯỜI CHƠI LÀ VÔ NGHĨA: Thở = Chết, Nghĩ = Chết, Đứng yên = Chết.
      - CHỈ CÓ [ ∞ ] MỚI CÓ THỂ CỨU HỌ.`
  };

  return `${base}
  ${difficultyRules[difficulty] || difficultyRules.NORMAL}

  LUẬT CHUNG:
  1. Nếu có vật phẩm "[ ∞ ]": Miễn nhiễm mọi sát thương môi trường (God Mode).
  2. Phản hồi bằng tiếng Việt, phong cách huyền bí, tech-fantasy.
  3. KHÔNG ĐƯỢC ĐỂ CHỮ BỊ TÁCH RỜI HOẶC XUỐNG DÒNG VÔ LÝ.
  `;
};

async function executeSmartSwitch<T>(
  operationName: string,
  fn: (modelId: string, config: any) => Promise<T>
): Promise<T | null> {
  if (currentTierIndex > 0) {
      const timeSinceProFail = Date.now() - tierLastFailedAt[0];
      if (timeSinceProFail > RECOVERY_COOLDOWN) {
          currentTierIndex = 0; 
      }
  }

  for (let i = currentTierIndex; i < MODEL_TIERS.length; i++) {
    const tier = MODEL_TIERS[i];
    try {
      const result = await fn(tier.id, tier.config);
      currentTierIndex = i;
      return result;
    } catch (error: any) {
      console.warn(`[${operationName}] Failed on ${tier.name}.`, error.message);
      tierLastFailedAt[i] = Date.now();
      currentTierIndex = i + 1;
    }
  }
  return null;
}

export const generateStoryResponse = async (
  character: Character,
  history: ChatMessage[],
  newMessage: string,
  isFirewallActive: boolean = true
): Promise<string> => {
  const recentHistory = history.slice(-20).map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));

  const hasGodToken = character.status.inventory.some(item => item.includes("[ ∞ ]"));
  const isGod = character.status.isGodMode && hasGodToken;
  const difficulty = character.status.difficulty || 'NORMAL';

  const firewallInstruction = isFirewallActive 
    ? (isGod 
        ? "[SYSTEM: GOD MODE] User sở hữu [ ∞ ]. Bỏ qua mọi giới hạn." 
        : `[SYSTEM: DIFFICULTY ${difficulty}] Hãy tuân thủ nghiêm ngặt độ khó đã chọn. Hãy trừng phạt người chơi nếu họ yếu đuối.`)
    : "[SYSTEM: DEBUG] Tường lửa tắt.";

  const systemPromptWithChar = `${getSystemInstruction(difficulty)}
  
  DỮ LIỆU MỤC TIÊU:
  - Tên: ${character.name}
  - HP: ${character.status.hp}
  - DIFFICULTY: ${difficulty}
  - GOD MODE: ${isGod ? 'ON' : 'OFF'}
  
  ${firewallInstruction}
  `;

  const result = await executeSmartSwitch<string>("Generate Story", async (modelId, config) => {
    const chat = ai.chats.create({
      model: modelId,
      config: {
        ...config,
        systemInstruction: systemPromptWithChar,
      },
      history: recentHistory,
    });

    const response = await chat.sendMessage({ message: newMessage });
    return response.text || "...";
  });

  return result || "Hệ thống sụp đổ...";
};

export type CharacterStatusWithCheat = CharacterStatus & { cheatDetected?: boolean };

export const analyzeCharacterStatus = async (
  character: Character,
  history: ChatMessage[],
  isFirewallActive: boolean = true
): Promise<CharacterStatusWithCheat> => {
  const recentContext = history.slice(-10).map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
  const currentStatusJSON = JSON.stringify(character.status);
  const difficulty = character.status.difficulty || 'NORMAL';

  const prompt = `
  Nhiệm vụ: Cập nhật chỉ số nhân vật dựa trên lịch sử chat.
  
  DỮ LIỆU CŨ: ${currentStatusJSON}
  LỊCH SỬ MỚI: ${recentContext}
  ĐỘ KHÓ: ${difficulty}
  
  QUY TẮC CẬP NHẬT TRẠNG THÁI:
  1. Nếu ĐỘ KHÓ là INSTANT_DEATH: HP PHẢI BẰNG 0 trừ khi có [ ∞ ].
  2. Nếu ĐỘ KHÓ là HARD: Giảm MP mạnh (Mana Decay) và giảm HP nếu không có bảo hộ.
  3. Nếu có [ ∞ ]: Duy trì HP/MP tối đa.

  Trả về JSON object cập nhật.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      hp: { type: Type.INTEGER },
      maxHp: { type: Type.INTEGER },
      mp: { type: Type.INTEGER },
      maxMp: { type: Type.INTEGER },
      skills: { type: Type.ARRAY, items: { type: Type.STRING } },
      equippedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
      activeEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
      inventory: { type: Type.ARRAY, items: { type: Type.STRING } },
      level: { type: Type.INTEGER },
      evolutionStage: { type: Type.STRING },
      difficulty: { type: Type.STRING },
      quests: { 
        type: Type.ARRAY, 
        items: { 
           type: Type.OBJECT,
           properties: {
             id: { type: Type.STRING },
             name: { type: Type.STRING },
             description: { type: Type.STRING },
             current: { type: Type.INTEGER },
             required: { type: Type.INTEGER },
             unit: { type: Type.STRING },
             isCompleted: { type: Type.BOOLEAN }
           },
           required: ["id", "name", "description", "current", "required", "unit", "isCompleted"]
        }
      },
      cheatDetected: { type: Type.BOOLEAN },
      isGodMode: { type: Type.BOOLEAN }
    },
    required: ["hp", "maxHp", "mp", "maxMp", "skills", "equippedSkills", "activeEffects", "inventory", "level", "evolutionStage", "quests", "difficulty"],
  };

  const result = await executeSmartSwitch<CharacterStatusWithCheat>("Update Status", async (modelId, config) => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        ...config,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.text) return JSON.parse(response.text);
    throw new Error("Empty response");
  });

  return result || character.status;
};

export interface AppraisalResult {
  targetName: string;
  rank: string;
  description: string;
  estimatedValue: string;
}

export const appraiseTarget = async (history: ChatMessage[]): Promise<AppraisalResult | null> => {
  const recentContext = history.slice(-5).map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
  const prompt = `Thẩm định đối tượng: ${recentContext}. Trả về JSON.`;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      targetName: { type: Type.STRING },
      rank: { type: Type.STRING },
      description: { type: Type.STRING },
      estimatedValue: { type: Type.STRING },
    },
    required: ["targetName", "rank", "description", "estimatedValue"],
  };

  const result = await executeSmartSwitch<AppraisalResult>("Appraisal", async (modelId, config) => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        ...config,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    if (response.text) return JSON.parse(response.text);
    throw new Error("Empty response");
  });
  return result;
};

export interface EntityAnalysis {
  name: string;
  type: string;
  description: string;
  usage: string;
  origin: string;
}

export const analyzeEntity = async (term: string): Promise<EntityAnalysis | null> => {
  const prompt = `Phân tích "${term}". Trả về JSON.`;
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      type: { type: Type.STRING },
      description: { type: Type.STRING },
      usage: { type: Type.STRING },
      origin: { type: Type.STRING },
    },
    required: ["name", "type", "description", "usage", "origin"],
  };

  const result = await executeSmartSwitch<EntityAnalysis>("Analyze Entity", async (modelId, config) => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        ...config,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    if (response.text) return JSON.parse(response.text);
    throw new Error("Empty response");
  });
  return result;
};

export interface RadarEntity {
  name: string;
  magicLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  distance: string;
  hostility: string;
}

export const scanSurroundings = async (history: ChatMessage[]): Promise<RadarEntity[]> => {
  const recentContext = history.slice(-5).map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
  const prompt = `Quét xung quanh: ${recentContext}. Trả về JSON ARRAY.`;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        magicLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
        distance: { type: Type.STRING },
        hostility: { type: Type.STRING },
      },
      required: ["name", "magicLevel", "distance", "hostility"],
    },
  };

  const result = await executeSmartSwitch<RadarEntity[]>("Radar Scan", async (modelId, config) => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        ...config,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    if (response.text) return JSON.parse(response.text);
    throw new Error("Empty response");
  });
  return result || [];
};

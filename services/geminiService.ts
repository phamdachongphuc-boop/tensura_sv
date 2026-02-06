
import { GoogleGenAI, Type } from "@google/genai";
import { Character, ChatMessage, DifficultyLevel } from "../types";

// --- START OF FIXED INTERFACES ---
export interface AppraisalResult {
  targetName: string;
  rank: string;
  description: string;
  estimatedValue: string;
}

export interface RadarEntity {
  name: string;
  distance: string;
  hostility: string;
  magicLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface EntityAnalysis {
  name: string;
  type: string;
  origin: string;
  description: string;
  usage: string;
}
// --- END OF FIXED INTERFACES ---

/**
 * Lấy danh sách API Keys từ biến môi trường.
 * Hỗ trợ định dạng: "KEY1,KEY2"
 */
const getApiKeys = (): string[] => {
  const rawValue = process.env.API_KEY || "";
  return rawValue
    .split(",")
    .map(key => key.trim())
    .filter(key => key.length > 0);
};

interface ModelTier {
  id: string;
  name: string;
  config: any;
}

const MODEL_TIERS: ModelTier[] = [
  {
    id: "gemini-3-pro-preview", 
    name: "GEMINI 3.0 PRO",
    config: { temperature: 1.2, topK: 64, topP: 0.95 }
  },
  {
    id: "gemini-3-flash-preview", 
    name: "GEMINI 3.0 FLASH",
    config: { temperature: 0.9, topK: 40, topP: 0.95 }
  }
];

// Chỉ số theo dõi khóa hiện tại để xoay vòng
let currentKeyOffset = 0;

const getSystemInstruction = (difficulty: DifficultyLevel) => {
  const base = `Bạn là "Tiếng Nói Thế Giới" (World System) trong thế giới Tensura.`;
  const difficultyRules = {
    EASY: `CHẾ ĐỘ: BÌNH MINH (DỄ). Thế giới thân thiện, ma tố ổn định.`,
    NORMAL: `CHẾ ĐỘ: THÁCH THỨC (BÌNH THƯỜNG). Cân bằng giữa sinh tồn và khám phá.`,
    HARD: `CHẾ ĐỘ: ĐỊA NGỤC (KHÓ). Ma tố cực cao gây Mana Decay. Kẻ thù hung tàn.`,
    INSTANT_DEATH: `CHẾ ĐỘ: TỬ VONG TỨC THÌ. Thế giới từ chối sự tồn tại. AI tìm mọi cách giết người chơi hợp lý.`
  };
  return `${base}\n${difficultyRules[difficulty] || difficultyRules.NORMAL}\nLUẬT: Phản hồi tiếng Việt, tech-fantasy.`;
};

/**
 * Hàm thực thi thông minh: Thử tất cả các Model và tất cả API Key hiện có
 */
async function executeSmartSwitch<T>(
  operationName: string,
  fn: (ai: GoogleGenAI, modelId: string, config: any) => Promise<T>
): Promise<T | null> {
  const keys = getApiKeys();
  
  if (keys.length === 0) {
    console.error(`[${operationName}] LỖI: Không tìm thấy API_KEY trong cấu hình.`);
    return null;
  }

  // Thử lần lượt từng Model Tier (Pro trước, Flash sau)
  for (const tier of MODEL_TIERS) {
    // Với mỗi Model, thử lần lượt từng API Key khả dụng
    for (let i = 0; i < keys.length; i++) {
      const keyIdx = (currentKeyOffset + i) % keys.length;
      const apiKey = keys[keyIdx];
      
      try {
        // Khởi tạo instance mới cho mỗi lần thử để đảm bảo dùng đúng Key
        const ai = new GoogleGenAI({ apiKey });
        const result = await fn(ai, tier.id, tier.config);
        
        // Nếu thành công, lần sau sẽ bắt đầu từ khóa này để tối ưu
        currentKeyOffset = keyIdx;
        return result;
      } catch (error: any) {
        const errorMsg = error.message || "";
        const isQuotaError = errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("limit");
        
        console.warn(`[${operationName}] Thử nghiệm thất bại (${tier.name}, Key ${keyIdx + 1}):`, errorMsg.slice(0, 100));
        
        // Nếu hết hạn mức, tiếp tục vòng lặp để thử khóa/model tiếp theo
        if (isQuotaError || keys.length > 1) continue;
        
        // Nếu chỉ có 1 key và gặp lỗi khác, thoát sớm
        throw error;
      }
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

  const difficulty = character.status.difficulty || 'NORMAL';
  const systemPrompt = `${getSystemInstruction(difficulty)}\nDỮ LIỆU: ${character.name}, HP: ${character.status.hp}`;

  const result = await executeSmartSwitch<string>("Story", async (ai, modelId, config) => {
    const chat = ai.chats.create({
      model: modelId,
      config: { ...config, systemInstruction: systemPrompt },
      history: recentHistory as any,
    });
    const response = await chat.sendMessage({ message: newMessage });
    return response.text || "...";
  });

  return result || "Hệ thống đang quá tải ma tố, vui lòng thử lại sau giây lát...";
};

export const analyzeCharacterStatus = async (
  character: Character,
  history: ChatMessage[],
  isFirewallActive: boolean = true
): Promise<any> => {
  const recentContext = history.slice(-10).map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
  const prompt = `Cập nhật chỉ số JSON dựa trên diễn biến: ${recentContext}. Dữ liệu hiện tại: ${JSON.stringify(character.status)}`;

  const schema = {
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
      quests: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, current: { type: Type.INTEGER }, required: { type: Type.INTEGER }, isCompleted: { type: Type.BOOLEAN } } } }
    },
    required: ["hp", "maxHp", "mp", "maxMp", "skills", "inventory", "level", "evolutionStage"],
  };

  const result = await executeSmartSwitch<any>("StatusUpdate", async (ai, modelId, config) => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { ...config, responseMimeType: "application/json", responseSchema: schema },
    });
    return response.text ? JSON.parse(response.text) : null;
  });

  return result || character.status;
};

export const appraiseTarget = async (history: ChatMessage[]): Promise<AppraisalResult | null> => {
  return await executeSmartSwitch<AppraisalResult>("Appraisal", async (ai, modelId, config) => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Thẩm định đối tượng từ ngữ cảnh: ${history.slice(-5).map(m => m.content).join("\n")}`,
      config: { 
        ...config, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetName: { type: Type.STRING },
            rank: { type: Type.STRING },
            description: { type: Type.STRING },
            estimatedValue: { type: Type.STRING }
          },
          required: ["targetName", "rank", "description", "estimatedValue"]
        }
      },
    });
    return response.text ? JSON.parse(response.text) : null;
  });
};

export const analyzeEntity = async (term: string): Promise<EntityAnalysis | null> => {
  return await executeSmartSwitch<EntityAnalysis>("Entity", async (ai, modelId, config) => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Phân tích sâu về thực thể/kỹ năng: ${term}`,
      config: { 
        ...config, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            type: { type: Type.STRING },
            origin: { type: Type.STRING },
            description: { type: Type.STRING },
            usage: { type: Type.STRING }
          },
          required: ["name", "type", "origin", "description", "usage"]
        }
      },
    });
    return response.text ? JSON.parse(response.text) : null;
  });
};

export const scanSurroundings = async (history: ChatMessage[]): Promise<RadarEntity[]> => {
  return await executeSmartSwitch<RadarEntity[]>("Radar", async (ai, modelId, config) => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Quét radar ma tố xung quanh: ${history.slice(-5).map(m => m.content).join("\n")}`,
      config: { 
        ...config, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              distance: { type: Type.STRING },
              hostility: { type: Type.STRING },
              magicLevel: { type: Type.STRING }
            },
            required: ["name", "distance", "hostility", "magicLevel"]
          }
        }
      },
    });
    return response.text ? JSON.parse(response.text) : [];
  }) || [];
};

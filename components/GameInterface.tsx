
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Character, ChatMessage, GameState, SaveData, Mail } from '../types';
import { Button } from './Button';
import { StatusPanel } from './StatusPanel';
import { generateStoryResponse, analyzeCharacterStatus, appraiseTarget, AppraisalResult, scanSurroundings, RadarEntity, analyzeEntity, EntityAnalysis } from '../services/geminiService';
import { NotificationOverlay, Notification } from './NotificationOverlay';
import { AppraisalResultModal } from './AppraisalResult';
import { RadarDisplay } from './RadarDisplay';
import { InventoryModal } from './InventoryModal';
import { SkillEquipModal } from './SkillEquipModal';
import { AnalysisModal } from './AnalysisModal';
import { Typewriter } from './Typewriter';
import { GachaModal } from './GachaModal';
import { LeaderboardModal } from './LeaderboardModal';
import { MailboxModal } from './MailboxModal';
import { WorldChatModal } from './WorldChatModal';
import { GoldenNotification } from './GoldenNotification';
import { authService } from '../services/authService';

interface Props {
  initialCharacter: Character;
  initialHistory?: ChatMessage[];
  onExit: () => void;
  onRestart: () => void;
  onSave: (data: SaveData) => Promise<{ success: boolean; error?: string }>; 
}

type SkillMode = 'SENSE' | 'LUCKY';
type AppraisalMode = 'APPRAISAL' | 'THOUGHT';

export const GameInterface: React.FC<Props> = ({ initialCharacter, initialHistory, onExit, onRestart, onSave }) => {
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [history, setHistory] = useState<ChatMessage[]>(initialHistory || []);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // DEATH STATES
  const [showDeathModal, setShowDeathModal] = useState(false);
  const [deathPhase, setDeathPhase] = useState<'CAUSE' | 'CONFIRM'>('CAUSE');

  const [isAutoSaving, setIsAutoSaving] = useState(false);
  
  // FIREWALL DEFAULT: TRUE (ON) for better protection
  const [isFirewallActive, setIsFirewallActive] = useState(true);

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifCounter, setNotifCounter] = useState(0);

  // GOLDEN NOTIFICATION STATE
  const [goldenMsg, setGoldenMsg] = useState<string | null>(null);

  // Analysis State
  const [analyzingItem, setAnalyzingItem] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<EntityAnalysis | null>(null);

  // Appraisal & Thought State
  const [appraisalMode, setAppraisalMode] = useState<AppraisalMode>('APPRAISAL');
  const [isAppraising, setIsAppraising] = useState(false);
  const [appraisalResult, setAppraisalResult] = useState<AppraisalResult | null>(null);
  const appraisalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAppraisalLongPressRef = useRef(false);

  // Radar State
  const [showRadar, setShowRadar] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [radarEntities, setRadarEntities] = useState<RadarEntity[]>([]);

  // Inventory State
  const [showInventory, setShowInventory] = useState(false);
  
  // Gacha State
  const [showGacha, setShowGacha] = useState(false);
  
  // Leaderboard State
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // Mailbox State
  const [showMailbox, setShowMailbox] = useState(false);
  const [hasUnreadMail, setHasUnreadMail] = useState(false);

  // World Chat State
  const [showWorldChat, setShowWorldChat] = useState(false);

  // Skill Equip State
  const [showSkillEquip, setShowSkillEquip] = useState(false);

  // Hidden Skill State
  const [skillMode, setSkillMode] = useState<SkillMode>('SENSE');
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const statusPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isStatusLongPressRef = useRef(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isDead = character.status.hp <= 0 && !character.status.isGodMode;

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [history, scrollToBottom]);

  useEffect(() => {
    // Stop autosave if dead to prevent death loops
    if (isDead) return;

    const autoSaveTimer = setTimeout(async () => {
        if (character && history.length > 0) {
            setIsAutoSaving(true);
            const saveData: SaveData = {
                character,
                chatHistory: history,
                lastSaved: Date.now()
            };
            const result = await onSave(saveData);
            setTimeout(() => setIsAutoSaving(false), 1000);
        }
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [character, history, isDead, onSave]);

  useEffect(() => {
    const checkMail = async () => {
        const user = await authService.getCurrentUser();
        if (user) {
            const mails = await authService.getMailbox(user.username);
            setHasUnreadMail(mails.some(m => !m.isRead));
        }
    };
    checkMail();
    const interval = setInterval(checkMail, 20000);
    return () => clearInterval(interval);
  }, []);

  const addNotification = (message: string, type: 'info' | 'warning' | 'success' | 'error' = 'info') => {
    const newNotif: Notification = { id: notifCounter, message, type: type as any };
    setNotifications(prev => [...prev, newNotif]);
    setNotifCounter(prev => prev + 1);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- MODIFIED INTRO FOR HARDCORE MODE ---
  useEffect(() => {
    if (history.length === 0) {
      const startIntro = async () => {
        setIsProcessing(true);
        // Hardcore Prompt: Force immediate danger and despair
        const introPrompt = `KHỞI ĐẦU CHẾ ĐỘ ĐỊA NGỤC (HELL MODE): 
        Tôi là ${character.name}, một ${character.race}.
        Tôi vừa chuyển sinh tại ${character.location}.
        CẢNH BÁO: Tôi đang ở trong tình trạng vô cùng nguy kịch! (Vd: Đang bị quái vật Rank A săn đuổi, hoặc bị thương nặng sắp chết, hoặc lạc vào lãnh địa của Ma Vương).
        Tỷ lệ tử vong là 80%. Mọi sai lầm sẽ trả giá bằng mạng sống.
        Thế giới này tàn khốc, không có tình thương.
        Hãy mô tả tình huống tuyệt vọng này ngay lập tức!`;
        
        const response = await generateStoryResponse(character, [], introPrompt, isFirewallActive);
        setHistory([{ role: 'model', content: response, timestamp: Date.now() }]);
        setIsProcessing(false);
      };
      startIntro();
    }
  }, []); 

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing || isDead) return;

    const rawInput = input.trim();
    const command = rawInput.toLowerCase();
    
    // Command to UNLOCK (Disable Firewall)
    if (command === 'mở' || command === 'unlock' || command === 'open') {
        setIsFirewallActive(false);
        addNotification("HỆ THỐNG: TƯỜNG LỬA ĐÃ ĐƯỢC VÔ HIỆU HÓA (OFF).", 'warning');
        setHistory(prev => [...prev, { role: 'user', content: "[ADMIN COMMAND]: Kích hoạt chế độ chỉnh sửa (Unlock).", timestamp: Date.now() }]);
        setInput('');
        return;
    }
    
    // Command to LOCK (Enable Firewall)
    if (command === 'đóng' || command === 'lock' || command === 'close') {
        setIsFirewallActive(true);
        addNotification("HỆ THỐNG: TƯỜNG LỬA BẢO VỆ ĐÃ KÍCH HOẠT (ON).", 'success');
        setHistory(prev => [...prev, { role: 'user', content: "[ADMIN COMMAND]: Kích hoạt tường lửa bảo vệ (Lock).", timestamp: Date.now() }]);
        setInput('');
        return;
    }

    const userMsg: ChatMessage = { role: 'user', content: rawInput, timestamp: Date.now() };
    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    const responseText = await generateStoryResponse(character, [...history, userMsg], userMsg.content, isFirewallActive);
    
    const modelMsg: ChatMessage = { role: 'model', content: responseText, timestamp: Date.now() };
    const newHistory = [...history, userMsg, modelMsg];
    setHistory(newHistory);
    setIsProcessing(false);
    
    handleUpdateStatus(newHistory);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUpdateStatus = async (currentHistory = history) => {
    setIsUpdatingStatus(true);
    const prevStatus = { ...character.status };
    const newStatus = await analyzeCharacterStatus(character, currentHistory, isFirewallActive);
    
    // --- ABSOLUTE GOD MODE VALIDATION ---
    // Rule: You MUST have the "[ ∞ ]" token in inventory to be in God Mode.
    // No token = No God Mode. No exceptions.
    
    const hasGodToken = newStatus.inventory.some(item => item.includes("[ ∞ ]"));
    
    if (newStatus.isGodMode && !hasGodToken) {
        console.warn("SECURITY ALERT: User attempted God Mode without Token. Access Denied.");
        // REVOKE GOD MODE
        newStatus.isGodMode = false;
        // Cap stats to mortal limits if they were blown up
        if (newStatus.hp > 1000000) newStatus.hp = 9999;
        if (newStatus.mp > 1000000) newStatus.mp = 9999;
        if (newStatus.maxHp > 1000000) newStatus.maxHp = 9999;
        if (newStatus.maxMp > 1000000) newStatus.maxMp = 9999;
        
        // Notify User
        addNotification("CẢNH BÁO: BẠN KHÔNG CÓ VẬT PHẨM [ ∞ ]. GOD MODE BỊ TỪ CHỐI.", "error");
        
        // Optionally insert a system message to history to scold the user via AI next turn
        setHistory(prev => [...prev, {
            role: 'model', 
            content: "[HỆ THỐNG CẢNH BÁO] Phát hiện nỗ lực xâm nhập trái phép vào trạng thái God Model. Yêu cầu vật phẩm [ ∞ ] bị thiếu. Trạng thái đã bị thu hồi.", 
            timestamp: Date.now() 
        }]);
    }

    if (newStatus.cheatDetected && isFirewallActive && !newStatus.isGodMode) {
        addNotification("CẢNH BÁO: TƯỜNG LỬA NGĂN CHẶN THAY ĐỔI TRÁI PHÉP!", 'error');
        setIsUpdatingStatus(false);
        return; 
    }

    // --- GOLDEN NOTIFICATION LOGIC ---
    
    // 1. New Skills
    const newSkills = newStatus.skills.filter(s => !prevStatus.skills.includes(s));
    if (newSkills.length > 0) {
        setGoldenMsg(`ĐÃ LĨNH NGỘ KỸ NĂNG: ${newSkills.join(', ')}`);
    }

    // 2. New Active Effects (Status Positive/Negative)
    const newEffects = newStatus.activeEffects.filter(e => !prevStatus.activeEffects.includes(e));
    if (newEffects.length > 0) {
        setGoldenMsg(`TRẠNG THÁI MỚI: ${newEffects.join(', ')}`);
    }

    // 3. Quest Completion
    const newCompleted = newStatus.quests.filter(q => q.isCompleted);
    const prevCompleted = prevStatus.quests.filter(q => q.isCompleted);
    if (newCompleted.length > prevCompleted.length) {
        setGoldenMsg("NHIỆM VỤ HOÀN THÀNH - ĐIỀU KIỆN TIẾN HÓA ĐẠT ĐƯỢC");
    }

    // 4. Evolution / Level Up
    if (newStatus.evolutionStage !== prevStatus.evolutionStage) {
        setGoldenMsg(`TIẾN HÓA THÀNH CÔNG: ${newStatus.evolutionStage.toUpperCase()}`);
    } else if (newStatus.level > prevStatus.level) {
        setGoldenMsg(`LEVEL UP! CẤP ĐỘ ${newStatus.level}`);
    }

    // ---------------------------------

    // Check for death condition (Only if NOT God Mode)
    if (newStatus.hp <= 0 && !newStatus.isGodMode) {
        if (prevStatus.hp > 0) {
            addNotification(`CẢNH BÁO: Sát thương chí mạng. HP về 0.`, 'warning');
            
            // START DEATH SEQUENCE
            setDeathPhase('CAUSE');
            setShowDeathModal(true);
            
            // Wait 5 seconds before showing the confirmation screen
            setTimeout(() => {
                setDeathPhase('CONFIRM');
            }, 5000);
        }
    } 

    const { cheatDetected, ...cleanStatus } = newStatus;
    setCharacter(prev => ({ ...prev, status: cleanStatus }));
    setIsUpdatingStatus(false);
  };

  const handleAppraise = async () => {
    setIsAppraising(true);
    addNotification("BÁO CÁO: Đang kích hoạt kỹ năng Thẩm Định...", 'info');
    const result = await appraiseTarget(history);
    if (result) setAppraisalResult(result);
    setIsAppraising(false);
  };

  const handleAnalyzeEntity = async (term: string) => {
    addNotification(`BÁO CÁO: Đang phân tích "${term}"...`, 'info');
    const result = await analyzeEntity(term);
    if (result) {
      setAnalysisData(result);
    } else {
      addNotification("LỖI: Không thể phân tích đối tượng.", 'error');
    }
  };

  const handleToggleSkill = (skill: string) => {
    const isEquipped = character.status.equippedSkills.includes(skill);
    let newEquipped = [...character.status.equippedSkills];
    
    if (isEquipped) {
      newEquipped = newEquipped.filter(s => s !== skill);
      addNotification(`Hệ thống: Đã thu hồi kỹ năng [${skill}].`, 'info');
    } else {
      if (newEquipped.length >= 3) {
        addNotification("Hệ thống: Đã đạt giới hạn 3 kỹ năng trang bị.", 'warning');
        return;
      }
      newEquipped.push(skill);
      addNotification(`Hệ thống: Đã trang bị kỹ năng [${skill}].`, 'success');
    }
    
    setCharacter(prev => ({
      ...prev,
      status: { ...prev.status, equippedSkills: newEquipped }
    }));
  };

  const handleUseSkill = async (skill: string) => {
    if (isProcessing || isDead) return;
    
    // --- MANA CHECK (HARDCORE) ---
    const currentMp = character.status.mp;
    const isUltimate = ['Raphael', 'Uriel', 'Michael', 'Beelzebuth'].some(k => skill.includes(k));
    const manaCost = isUltimate ? Math.floor(character.status.maxMp * 0.5) : Math.floor(character.status.maxMp * 0.1);
    
    // Only check mana if NOT God Mode
    if (!character.status.isGodMode && currentMp < manaCost) {
        addNotification(`CẢNH BÁO: Ma lực không đủ! Cố dùng sẽ dẫn đến tử vong!`, 'error');
        // If user is reckless, allow it but tell AI they are exhausted
        if (!window.confirm("CẢNH BÁO NGUY HIỂM: Ma lực đã cạn kiệt. Cố ép sử dụng kỹ năng sẽ gây phản phệ chết người hoặc bị kẻ địch giết chết do kiệt sức. Bạn có chắc chắn muốn tiếp tục?")) {
            return;
        }
    }

    setShowSkillEquip(false);
    
    // Golden Notification for Skill Usage
    setGoldenMsg(`KÍCH HOẠT KỸ NĂNG: ${skill.toUpperCase()}`);

    // Create prompt with context about Mana usage to force the AI to respect the rules
    const contextMsg = character.status.isGodMode 
        ? `[HỆ THỐNG - GOD MODE] Người chơi kích hoạt [${skill}]. Mana là Vô Hạn. Mọi hiệu ứng là Tuyệt Đối. Không ai có thể cản.`
        : `[HỆ THỐNG] Người dùng kích hoạt [${skill}]. Tiêu hao ${manaCost} MP. MP hiện tại còn: ${Math.max(0, currentMp - manaCost)}. NẾU MP = 0: Hãy mô tả nhân vật ngã quỵ, rơi vào trạng thái 'Suy Kiệt', bị đối thủ tấn công chí mạng hoặc kỹ năng phản phệ nổ tung.`;
    
    const userMsg: ChatMessage = { role: 'user', content: `[SỬ DỤNG KỸ NĂNG]: ${skill}. ${contextMsg}`, timestamp: Date.now() };
    
    // Update local MP immediately for visual feedback
    if (!character.status.isGodMode) {
        setCharacter(prev => ({
            ...prev,
            status: { ...prev.status, mp: Math.max(0, currentMp - manaCost) }
        }));
    }

    setHistory(prev => [...prev, userMsg]);
    setIsProcessing(true);

    const responseText = await generateStoryResponse(character, [...history, userMsg], userMsg.content, isFirewallActive);
    
    const modelMsg: ChatMessage = { role: 'model', content: responseText, timestamp: Date.now() };
    const newHistory = [...history, userMsg, modelMsg];
    setHistory(newHistory);
    setIsProcessing(false);
    
    handleUpdateStatus(newHistory);
  };

  const handleClaimMailReward = async (mail: Mail) => {
    if (!mail.attachment) return;

    // Trigger Golden Notification for Gift
    setGoldenMsg(`ĐÃ NHẬN: ${mail.attachment.toUpperCase()}`);

    const updatedStatus = { ...character.status };
    let msg = "";
    
    // SPECIAL: GOD MODE GIFT CHECK (ADMIN ONLY)
    // The ONLY valid entry point for God Mode.
    // Requires sender to be the Admin account.
    const isAdminSender = mail.sender.includes("1062009");
    const isGodToken = mail.attachment.includes("[ ∞ ]");
    
    if (isGodToken && isAdminSender) {
        updatedStatus.isGodMode = true;
        // Also add the token to inventory so validation passes
        updatedStatus.inventory = [...updatedStatus.inventory, mail.attachment];
        
        // Maximize Stats to Infinity Representation
        updatedStatus.hp = 999999999999999;
        updatedStatus.maxHp = 999999999999999;
        updatedStatus.mp = 999999999999999;
        updatedStatus.maxMp = 999999999999999;
        updatedStatus.evolutionStage = "∞ THE CREATOR ∞";
        addNotification("CẢNH BÁO HỆ THỐNG: PHÁT HIỆN NĂNG LƯỢNG VÔ CỰC!", 'success');
        msg = `[HỆ THỐNG] Đã tiếp nhận "Quà Tặng Tối Cao [ ∞ ]" từ Admin. Xác nhận quyền lực tuyệt đối. Kích hoạt GOD MODE. Bỏ qua mọi giới hạn luật pháp.`;
    } else {
        // STANDARD GIFT (Can be anything else)
        if (mail.type === 'ITEM') {
            updatedStatus.inventory = [...updatedStatus.inventory, mail.attachment];
            addNotification(`Đã nhận vật phẩm: ${mail.attachment}`, 'success');
            
            if (isGodToken && !isAdminSender) {
                 msg = `[HỆ THỐNG] Phát hiện vật phẩm [ ∞ ] giả mạo (Không phải từ Admin). Đã tiêu hủy.`;
                 updatedStatus.inventory = updatedStatus.inventory.filter(i => !i.includes("[ ∞ ]"));
            } else {
                 msg = `[HỆ THỐNG] Đã nhận vật phẩm: "${mail.attachment}".\n⚠️ GIỚI HẠN: Vật phẩm này tuân thủ định luật thế giới. Không được quyền "Sáng Tạo" (Creative) hay thay đổi thực tại.`;
            }
        } else if (mail.type === 'SKILL') {
            if (!updatedStatus.skills.includes(mail.attachment)) {
                updatedStatus.skills = [...updatedStatus.skills, mail.attachment];
                addNotification(`Đã học kỹ năng: ${mail.attachment}`, 'success');
                msg = `[HỆ THỐNG] Đã tiếp nhận kỹ năng: "${mail.attachment}".`;
            } else {
                addNotification(`Bạn đã sở hữu kỹ năng: ${mail.attachment}`, 'info');
            }
        }
    }

    // IMPORTANT: Inject a system message so the AI Firewall knows exactly how to treat this item/skill
    if (msg) {
        setHistory(prev => [...prev, { role: 'model', content: msg, timestamp: Date.now() }]);
    }

    setCharacter(prev => ({ ...prev, status: updatedStatus }));
  };

  const handleScanSurroundings = async () => {
    setIsScanning(true);
    setShowRadar(true);
    try {
        const results = await scanSurroundings(history);
        setRadarEntities(results);
    } catch (e) {
        console.error(e);
        addNotification("Lỗi quét radar: Không thể cảm thụ ma lực.", 'error');
    }
    setIsScanning(false);
  };

  const handleGachaComplete = (skillName: string, description: string) => {
    const newSkills = [...character.status.skills];
    if (!newSkills.includes(skillName)) {
        newSkills.push(skillName);
        setCharacter(prev => ({
            ...prev,
            status: { ...prev.status, skills: newSkills }
        }));
        setGoldenMsg(`THỨC TỈNH: ${skillName.toUpperCase()}`); // Golden Msg
        addNotification(`Đã nhận kỹ năng ẩn: ${skillName}`, 'success');
        setHistory(prev => [...prev, { role: 'model', content: `[HỆ THỐNG] Cá thể đã thức tỉnh kỹ năng tối thượng: ${skillName}.`, timestamp: Date.now() }]);
    } else {
        addNotification(`Kỹ năng ${skillName} đã tồn tại. Sức mạnh được cường hóa.`, 'info');
    }
    setShowGacha(false);
  };

  const handleTakeItem = async (item: string) => {
    setShowInventory(false);
    if(isProcessing || isDead) return;

    let localIsGodMode = character.status.isGodMode;

    // Check if God Box usage directly from inventory
    if (item.includes("[ ∞ ]")) {
        // Ensure it's valid usage - do we consume it? 
        // If we consume it, God Mode should theoretically end if we follow the strict rule "Must have token in inventory".
        // SO: We DO NOT consume the [ ∞ ] token. It stays in inventory as a badge of office.
        localIsGodMode = true;
        setGoldenMsg("KÍCH HOẠT: VẬT PHẨM TỐI CAO [ ∞ ]");
        addNotification("Vật phẩm Vô Cực không thể bị tiêu thụ. Nó là chứng nhận quyền năng.", 'info');
        return; // Don't process as normal consumption
    }

    // FIX: Update local state immediately to remove ONLY the item used.
    // This prevents the AI from getting confused and wiping the inventory because it wasn't mentioned in recent chat.
    const newInventory = [...character.status.inventory];
    const itemIndex = newInventory.indexOf(item);
    if (itemIndex > -1) {
        newInventory.splice(itemIndex, 1);
    }
    
    // Create a temporary character object with updated inventory to pass to AI context
    const updatedCharacter = {
        ...character,
        status: {
            ...character.status,
            inventory: newInventory,
            isGodMode: localIsGodMode
        }
    };
    
    // Update UI immediately
    setCharacter(updatedCharacter);

    // USE ITEM LOGIC: Send command to AI to use the item and update status
    const itemContext = "Vật phẩm thường. Hãy mô tả hiệu ứng thực tế, có giới hạn.";

    const userMsg: ChatMessage = { role: 'user', content: `[SỬ DỤNG VẬT PHẨM]: ${item}. ${itemContext}`, timestamp: Date.now() };
    setHistory(prev => [...prev, userMsg]);
    setIsProcessing(true);

    // Pass the UPDATED character to the story generator
    const responseText = await generateStoryResponse(updatedCharacter, [...history, userMsg], userMsg.content, isFirewallActive);

    const modelMsg: ChatMessage = { role: 'model', content: responseText, timestamp: Date.now() };
    const newHistory = [...history, userMsg, modelMsg];
    setHistory(newHistory);
    setIsProcessing(false);

    handleUpdateStatus(newHistory);
  };

  const handleOpenBox = (item: string) => {
    const newInv = character.status.inventory.filter(i => i !== item);
    setCharacter(prev => ({ ...prev, status: { ...prev.status, inventory: newInv } }));
    setShowInventory(false);
    setShowGacha(true);
    addNotification("Đã mở Hộp Quà Bí Ẩn...", 'success');
  };

  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      <NotificationOverlay notifications={notifications} onRemove={removeNotification} />
      
      {/* GOLDEN NOTIFICATION COMPONENT */}
      <GoldenNotification message={goldenMsg} onClose={() => setGoldenMsg(null)} />

      {/* TOP HEADER MENU */}
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-cyan-500/30 p-2 flex items-center z-10 shadow-[0_5px_20px_rgba(0,0,0,0.5)] glow-border min-h-[60px]">
        <div className="flex flex-col justify-center px-4 border-r border-cyan-800/50 mr-2 shrink-0">
            <h1 className="text-lg font-bold system-font tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">RAPHAEL</h1>
            <div className="flex items-center gap-2">
                {isAutoSaving && <span className="text-[8px] text-cyan-400 animate-pulse tracking-[0.2em]">ĐANG LƯU...</span>}
                <div className={`flex items-center gap-1 text-[8px] font-mono font-bold px-1 rounded ${isFirewallActive ? 'text-green-400 bg-green-900/20' : 'text-red-500 bg-red-900/20 animate-pulse'}`}>
                    {isFirewallActive ? '🛡 TƯỜNG LỬA: BẬT' : '⚠ TƯỜNG LỬA: TẮT'}
                </div>
            </div>
        </div>
        
        {/* SCROLLABLE BUTTON LIST - UPDATED TO ICONS */}
        <div className="flex-1 flex gap-2 items-center justify-start overflow-x-auto custom-scrollbar no-scrollbar scroll-smooth pr-2">
            
            <Button variant="ghost" onClick={() => setShowLeaderboard(true)} className="text-xs sm:text-sm px-3 h-9 border-cyan-900 hover:border-yellow-500 text-yellow-500 whitespace-nowrap">
                🏆 XẾP HẠNG
            </Button>
            
            {/* World Chat -> 🌐 */}
            <Button variant="secondary" onClick={() => setShowWorldChat(true)} className="text-xl px-3 h-9 border-green-700 text-green-400 whitespace-nowrap" title="Chat Thế Giới">
                🌐
            </Button>

            {/* Mailbox -> ✉️ */}
            <Button variant="secondary" onClick={() => setShowMailbox(true)} className="text-xl px-3 h-9 border-cyan-800 text-cyan-200 whitespace-nowrap relative" title="Hộp Thư">
                ✉️
                {hasUnreadMail && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
                {hasUnreadMail && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </Button>

            {/* Inventory -> 🎒 */}
            <Button variant="secondary" onClick={() => setShowInventory(true)} className="text-xl px-3 h-9 border-cyan-800 text-cyan-200 whitespace-nowrap" title="Kho Đồ">
                🎒
            </Button>

            {/* Status -> ⚙️ */}
            <Button variant="secondary" onClick={() => setShowStatus(true)} className="text-xl px-3 h-9 border-cyan-700 text-cyan-200 whitespace-nowrap" title="Trạng Thái">
                ⚙️
            </Button>

            {/* Skills -> 🔥 */}
            <Button variant="secondary" onClick={() => setShowSkillEquip(true)} className="text-xl px-3 h-9 border-cyan-700 text-cyan-200 whitespace-nowrap" title="Kỹ Năng">
                🔥
            </Button>

            <div className="flex-1"></div> {/* Spacer */}

            {/* Exit -> 🚪 */}
            <Button variant="danger" onClick={onExit} className="text-xl px-3 h-9 bg-red-900/20 border-red-800 whitespace-nowrap" title="Thoát">
                🚪
            </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar mask-top-fade">
        {history.map((msg, index) => {
            const isLastModelMessage = index === history.length - 1 && msg.role === 'model' && !isProcessing;

            return (
                <div key={index} className={`flex w-full animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[95%] sm:max-w-[85%] p-4 text-base md:text-lg leading-relaxed whitespace-pre-wrap relative border ${
                        msg.role === 'user' 
                        ? 'bg-slate-900/60 border-slate-600 text-slate-200 rounded-lg rounded-tr-none mr-2' 
                        : 'raphael-panel text-cyan-50 font-serif rounded-lg rounded-tl-none ml-2 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)] glow-border'
                    }`}>
                        {msg.role === 'model' && (
                            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-cyan-500/20">
                                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest system-font animate-pulse">:: THÔNG BÁO ::</span>
                            </div>
                        )}
                        {isLastModelMessage ? (
                            <Typewriter text={msg.content} onComplete={scrollToBottom} />
                        ) : (
                            msg.content
                        )}
                    </div>
                </div>
            );
        })}
        {isProcessing && (
            <div className="flex justify-start ml-2 w-full animate-pulse">
                <div className="raphael-panel p-3 border-cyan-500/20 rounded-lg flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <span className="text-cyan-400 font-mono text-xs tracking-wider">ĐANG PHÂN TÍCH...</span>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className={`bg-slate-900/90 border-t p-4 relative z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] transition-colors duration-500 ${isFirewallActive ? 'border-cyan-900' : 'border-red-900 shadow-[0_0_20px_rgba(220,38,38,0.2)]'}`}>
        <div className="max-w-5xl mx-auto flex justify-between gap-2 mb-2">
            <Button onClick={handleScanSurroundings} isLoading={isScanning} disabled={isDead} className="text-[10px] py-1 border bg-cyan-900/20 border-cyan-700 text-cyan-400 hover:text-cyan-200">
              📡 CẢM THỤ (MAGIC SENSE)
            </Button>
            <Button onClick={handleAppraise} isLoading={isAppraising} disabled={isDead} className="text-[10px] py-1 border bg-yellow-900/20 border-yellow-700 text-yellow-500 hover:text-yellow-200">
              ❖ THẨM ĐỊNH (APPRAISE)
            </Button>
        </div>

        <div className="max-w-5xl mx-auto flex gap-4">
            <div className="relative flex-1">
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isDead ? "..." : "Nhập hành động..."}
                    className="w-full bg-slate-950/80 text-cyan-100 rounded-sm border p-3 pr-12 focus:outline-none resize-none h-16 sm:h-20 font-mono text-base sm:text-sm border-cyan-800"
                    disabled={isProcessing || isDead}
                />
            </div>
            <Button onClick={handleSendMessage} disabled={!input.trim() || isProcessing || isDead} className="h-16 sm:h-20 w-24 bg-cyan-700 border-cyan-500 text-white rounded-sm font-mono tracking-widest">GỬI</Button>
        </div>
      </div>

      {showStatus && <StatusPanel character={character} onClose={() => setShowStatus(false)} onRefresh={() => handleUpdateStatus()} isRefreshing={isUpdatingStatus} onAnalyze={handleAnalyzeEntity} />}
      {appraisalResult && <AppraisalResultModal result={appraisalResult} onClose={() => setAppraisalResult(null)} />}
      {showSkillEquip && <SkillEquipModal skills={character.status.skills} equippedSkills={character.status.equippedSkills || []} onClose={() => setShowSkillEquip(false)} onToggleSkill={handleToggleSkill} onUseSkill={handleUseSkill} onAnalyze={handleAnalyzeEntity} />}
      {showLeaderboard && <LeaderboardModal currentUserCharacter={character} onClose={() => setShowLeaderboard(false)} />}
      {showMailbox && authService.getCurrentUserLocal() && <MailboxModal username={authService.getCurrentUserLocal()!.username} onClose={() => setShowMailbox(false)} onClaim={handleClaimMailReward} />}
      {showWorldChat && authService.getCurrentUserLocal() && <WorldChatModal currentUser={authService.getCurrentUserLocal()!} onClose={() => setShowWorldChat(false)} />}
      {analysisData && <AnalysisModal data={analysisData} onClose={() => setAnalysisData(null)} />}
      
      {/* MODALS */}
      {showRadar && <RadarDisplay entities={radarEntities} onClose={() => setShowRadar(false)} isLoading={isScanning} />}
      {showInventory && <InventoryModal inventory={character.status.inventory} onClose={() => setShowInventory(false)} onTakeItem={handleTakeItem} onStoreItem={() => {}} onOpenGacha={handleOpenBox} />}
      {showGacha && <GachaModal onComplete={handleGachaComplete} />}

      {/* DEATH MODAL */}
      {showDeathModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 animate-fade-in backdrop-blur-sm">
            <div className="raphael-panel w-full max-w-lg p-8 border-2 border-red-600 shadow-[0_0_100px_rgba(220,38,38,0.6)] text-center relative overflow-hidden flex flex-col items-center">
                 <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,#000_120%)] z-0"></div>
                 
                 <div className="relative z-10 space-y-6 w-full">
                     {deathPhase === 'CAUSE' ? (
                         <>
                             <div className="text-6xl mb-4 animate-pulse">💀</div>
                             <h1 className="text-4xl font-bold text-red-500 system-font tracking-[0.3em] text-glow border-b-2 border-red-800 pb-4 inline-block">
                                 TỬ VONG
                             </h1>
                             
                             <div className="bg-red-950/30 p-4 border border-red-900 rounded text-red-200 text-sm italic font-serif h-40 overflow-y-auto custom-scrollbar flex items-center justify-center">
                                "{history.length > 0 ? history[history.length-1].content.slice(0, 300) : "Linh hồn đã tan biến..."}"
                             </div>
                             <div className="text-xs text-red-500 animate-pulse tracking-widest">ĐANG TÁI CẤU TRÚC LINH HỒN... (Vui lòng đợi)</div>
                         </>
                     ) : (
                         <>
                             <div className="text-6xl mb-4 text-cyan-400 animate-spin-slow">⚛</div>
                             <h1 className="text-2xl font-bold text-cyan-300 system-font tracking-widest text-glow pb-4">
                                 LINH HỒN TÁI SINH
                             </h1>
                             
                             <div className="py-4">
                                 <p className="text-cyan-100 font-mono text-base md:text-lg leading-relaxed animate-pulse border-y border-cyan-800 py-4">
                                    "Tôi sẽ đưa bạn về lại dạng linh hồn để bạn thiết lập lại cuộc đời mới, Vui lòng hãy bấm xác nhận !"
                                 </p>
                             </div>

                             <Button 
                                onClick={onRestart} 
                                className="w-full py-4 text-xl bg-cyan-800 hover:bg-cyan-700 border-cyan-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.5)] tracking-widest font-bold"
                             >
                                [ XÁC NHẬN ]
                             </Button>
                         </>
                     )}
                 </div>
            </div>
        </div>
      )}
    </div>
  );
};

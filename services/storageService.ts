
import { UsageLog, PromptConfig, DEFAULT_PROMPTS } from "../types";

const KEYS = {
  STATS: 'mono_assist_stats',
  PROMPTS: 'mono_assist_prompts'
};

// --- Stats Management ---

export const saveUsageStats = (log: Omit<UsageLog, 'id'>) => {
  const logs = getUsageStats();
  const newLog: UsageLog = {
    ...log,
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
  };
  // Keep only last 50 logs to save space
  const updatedLogs = [newLog, ...logs].slice(0, 50);
  localStorage.setItem(KEYS.STATS, JSON.stringify(updatedLogs));
};

export const getUsageStats = (): UsageLog[] => {
  try {
    const data = localStorage.getItem(KEYS.STATS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to parse stats", e);
    return [];
  }
};

export const clearStats = () => {
  localStorage.removeItem(KEYS.STATS);
};

// --- Prompt Management ---

export const getPromptConfig = (): PromptConfig => {
  try {
    const data = localStorage.getItem(KEYS.PROMPTS);
    return data ? { ...DEFAULT_PROMPTS, ...JSON.parse(data) } : DEFAULT_PROMPTS;
  } catch (e) {
    return DEFAULT_PROMPTS;
  }
};

export const savePromptConfig = (config: PromptConfig) => {
  localStorage.setItem(KEYS.PROMPTS, JSON.stringify(config));
};

export const resetPrompts = () => {
  localStorage.removeItem(KEYS.PROMPTS);
  return DEFAULT_PROMPTS;
};

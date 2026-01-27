
export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  STRUCTURING = 'STRUCTURING',
  REVIEW = 'REVIEW',
  GENERATING_PDF = 'GENERATING_PDF',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum CompressionMode {
  STANDARD = 'STANDARD',
  DETAILED = 'DETAILED'
}

export enum PdfStyle {
  CLASSIC = 'CLASSIC',
  ACADEMIC = 'ACADEMIC',
  CREATIVE = 'CREATIVE'
}

export interface ProcessingState {
  status: AppStatus;
  progress: number; // 0 to 100
  fileName: string | null;
  topic: string;
  mode: CompressionMode;
  pdfStyle: PdfStyle;
  previewText: string | null;
  generatedSummary: string | null;
  errorMessage?: string;
  isAdminOpen: boolean;
}

export interface AIResponse {
  text: string;
}

// --- Admin & Stats Interfaces ---

export interface UsageLog {
  id: string;
  timestamp: number;
  model: string;
  inputTokens: number;
  outputTokens: number;
  topic: string;
  mode: CompressionMode;
}

export interface PromptConfig {
  systemRole: string;
  standardInstruction: string;
  detailedInstruction: string;
}

export const DEFAULT_PROMPTS: PromptConfig = {
  systemRole: "Ты — эксперт по анализу образовательного контента, структурированию речи и созданию полезных учебных конспектов на основе транскрибаций. Твоя задача — выделять суть и оформлять её в Markdown.",
  standardInstruction: "Создай лаконичный, максимально сжатый и структурный конспект. Фокусируйся на главных тезисах, выводах и ключевых определениях. Убирай всю воду и лирические отступления.",
  detailedInstruction: "Создай подробный, развернутый конспект. Сохраняй больше контекста, примеров, метафор и пояснений, которые давались в тексте. Структура должна оставаться четкой, но содержание должно быть глубоким."
};

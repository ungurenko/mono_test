
import { CompressionMode } from "../types";
import { getPromptConfig, saveUsageStats } from "./storageService";

const DEFAULT_MODEL = 'openai/gpt-oss-120b';

const buildPrompt = (topic: string, transcript: string, mode: CompressionMode) => {
  // Fetch dynamic configuration
  const config = getPromptConfig();

  const modeInstruction = mode === CompressionMode.STANDARD
    ? config.standardInstruction
    : config.detailedInstruction;

  return `
${config.systemRole}

Урок посвящен теме: ${topic || "Общая тема"}
Тип конспекта: ${mode === CompressionMode.STANDARD ? "Стандартный (сжатый)" : "Подробный (развернутый)"}

ИНСТРУКЦИЯ:
${modeInstruction}

КРИТИЧЕСКИЕ ПРАВИЛА:
1. **Ничего не выдумывай**: Бери только тот текст, который есть в транскрибации.
2. **Сохраняй терминологию**: Если в тексте упоминаются специфические термины или названия моделей, оставляй их в исходном виде.
3. **Структура**: Используй Markdown (## для разделов, ### для подтем, списки для перечислений, **жирный шрифт** для акцентов).
4. **Язык**: Русский.
5. **Вывод**: Верни ТОЛЬКО текст конспекта в Markdown. Без приветствий и лишних пояснений.

Вот транскрибация:
${transcript}
`;
};

interface ApiResponse {
  text: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  model: string;
}

export const analyzeTranscript = async (text: string, topic: string, mode: CompressionMode): Promise<string> => {
  try {
    const prompt = buildPrompt(topic, text, mode);

    // Add timeout to prevent hanging requests (90 seconds to account for Vercel's 60s max)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: DEFAULT_MODEL
      }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Ошибка API: ${response.status}`);
    }

    const data: ApiResponse = await response.json();

    // Log Usage Stats
    if (data.usage) {
      saveUsageStats({
        timestamp: Date.now(),
        model: data.model,
        inputTokens: data.usage.inputTokens,
        outputTokens: data.usage.outputTokens,
        topic: topic || "Без темы",
        mode: mode
      });
    }

    if (!data.text) {
      throw new Error("Пустой ответ от AI.");
    }

    return data.text;
  } catch (error) {
    console.error("AI API Error:", error);

    // Handle timeout errors specifically
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Превышено время ожидания ответа от AI. Попробуйте сократить текст или повторить позже.');
    }

    throw error;
  }
};

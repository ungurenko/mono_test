import type { VercelRequest, VercelResponse } from '@vercel/node';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
  reasoning?: {
    enabled: boolean;
  };
}

interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const DEFAULT_MODEL = 'deepseek/deepseek-v3.2';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { prompt, model = DEFAULT_MODEL } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Invalid prompt' });
    }

    const openRouterRequest: OpenRouterRequest = {
      model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 8000,
      temperature: 0.7,
      reasoning: {
        enabled: true
      }
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': req.headers.origin || 'https://mono-assistant.vercel.app',
        'X-Title': 'Mono-Assistant'
      },
      body: JSON.stringify(openRouterRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return res.status(response.status).json({
        error: `API error: ${response.status}`,
        details: errorText
      });
    }

    const data: OpenRouterResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ error: 'Empty response from AI' });
    }

    const text = data.choices[0].message.content;

    return res.status(200).json({
      text,
      usage: data.usage ? {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens
      } : null,
      model
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

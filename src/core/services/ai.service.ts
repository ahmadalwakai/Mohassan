/**
 * AI Service using Groq API
 * Content moderation, summarization, and analysis
 * Enforces admin-controlled settings and rate limits
 */

import { prisma } from '@/core/db/prisma';
import { AIEventType } from '@prisma/client';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Default AI settings
const DEFAULT_AI_SETTINGS = {
  ai: {
    enabled: true,
    rateLimit: {
      perMinute: 30,
    },
    maxTokens: {
      chat: 2048,
      summarize: 1024,
      moderation: 1024,
    },
    prompts: {
      chat: 'أنت مساعد ذكي يتحدث العربية والإنجليزية. اسمك "Typhoon AI". مهمتك مساعدة المستخدمين في الإجابة على الأسئلة العامة، كتابة وتحرير النصوص، تلخيص المحتوى، الترجمة، وتقديم النصائح والمعلومات. كن ودوداً ومفيداً. أجب باللغة التي يستخدمها المستخدم.',
      moderation: 'أنت مشرف محتوى ذكي. مهمتك فحص المحتوى العربي والإنجليزي للتحقق من مخالفته لسياسات المجتمع. قم بتحليل المحتوى وأعطِ تقييماً موضوعياً بشأن الموافقة عليه أم رفضه.',
      summarize: 'أنت مساعد ذكي متخصص في تحليل وتلخيص المحتوى. قم بتحليل المحتوى وأعطِ ملخصاً موجزاً وكلمات مفتاحية وتقييماً للمشاعر.',
    },
  },
};

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface AISettings {
  ai: {
    enabled: boolean;
    rateLimit: {
      perMinute: number;
    };
    maxTokens: {
      chat: number;
      summarize: number;
      moderation: number;
    };
    prompts: {
      chat: string;
      moderation: string;
      summarize: string;
    };
  };
}

// Cache for settings (update every 5 minutes)
let cachedSettings: AISettings | null = null;
let settingsCacheTime = 0;

/**
 * Get AI settings from SystemSetting with caching
 */
async function getAISettings(): Promise<AISettings> {
  const now = Date.now();
  
  // Return cached settings if fresh (< 5 minutes)
  if (cachedSettings && now - settingsCacheTime < 5 * 60 * 1000) {
    return cachedSettings as AISettings;
  }

  try {
    const record = await prisma.systemSetting.findUnique({
      where: { key: 'ai' },
    });

    if (record?.value) {
      cachedSettings = { ...DEFAULT_AI_SETTINGS, ...JSON.parse(JSON.stringify(record.value)) };
    } else {
      cachedSettings = DEFAULT_AI_SETTINGS;
    }
    
    settingsCacheTime = now;
    return cachedSettings as AISettings;
  } catch (error) {
    console.error('Failed to fetch AI settings:', error);
    return DEFAULT_AI_SETTINGS;
  }
}

/**
 * Check rate limit for AI calls
 */
async function checkRateLimit(userId?: string): Promise<boolean> {
  if (!userId) return true; // Skip rate limit check for system calls

  const settings = await getAISettings();
  const perMinute = settings.ai.rateLimit.perMinute;

  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const requestCount = await prisma.aIEventLog.count({
    where: {
      actorId: userId,
      createdAt: {
        gte: oneMinuteAgo,
      },
    },
  });

  return requestCount < perMinute;
}

/**
 * Enforce token limits and call Groq
 */
async function callGroq(
  messages: GroqMessage[],
  temperature = 0.3,
  type: 'chat' | 'summarize' | 'moderation' = 'chat'
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const settings = await getAISettings();
  
  if (!settings.ai.enabled) {
    throw new Error('AI_DISABLED');
  }

  const maxTokens =
    settings.ai.maxTokens[type as keyof typeof settings.ai.maxTokens] || 1024;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data: GroqResponse = await response.json();
  return data.choices[0]?.message?.content || '';
}

export interface ModerationResult {
  approved: boolean;
  score: number; // 0-100, higher = more problematic
  categories: {
    spam: boolean;
    inappropriate: boolean;
    harassment: boolean;
    misinformation: boolean;
    violence: boolean;
  };
  reason?: string;
  suggestions?: string[];
}

export interface ContentSummary {
  summary: string;
  keywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  language: string;
}

export const aiService = {
  /**
   * Get AI settings (for external access)
   */
  async getSettings(): Promise<AISettings> {
    return getAISettings();
  },

  /**
   * Check if AI is enabled
   */
  async isEnabled(): Promise<boolean> {
    const settings = await getAISettings();
    return settings.ai.enabled;
  },

  /**
   * Moderate content for policy violations
   */
  async moderateContent(
    title: string,
    body: string,
    contentId?: string,
    userId?: string
  ): Promise<ModerationResult> {
    const startTime = Date.now();

    try {
      // Check if AI is enabled
      const settings = await getAISettings();
      if (!settings.ai.enabled) {
        throw new Error('AI_DISABLED');
      }

      // Check rate limit
      const withinLimit = await checkRateLimit(userId);
      if (!withinLimit) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      const systemPrompt = settings.ai.prompts.moderation
        ? `${settings.ai.prompts.moderation}

قم بتحليل المحتوى التالي وأعطِ تقييماً بصيغة JSON فقط بدون أي نص إضافي:

{
  "approved": true/false,
  "score": 0-100,
  "categories": {
    "spam": true/false,
    "inappropriate": true/false,
    "harassment": true/false,
    "misinformation": true/false,
    "violence": true/false
  },
  "reason": "سبب الرفض إن وجد",
  "suggestions": ["اقتراحات للتحسين"]
}`
        : '';

      const userPrompt = `العنوان: ${title}

المحتوى:
${body.substring(0, 3000)}`;

      const response = await callGroq(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        0.3,
        'moderation'
      );

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }

      const result: ModerationResult = JSON.parse(jsonMatch[0]);

      // Log the AI event
      if (contentId && userId) {
        await prisma.aIEventLog.create({
          data: {
            type: AIEventType.MOD_ASSIST,
            model: GROQ_MODEL,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            latencyMs: Date.now() - startTime,
            success: true,
            actorId: userId,
            metadata: {
              title,
              bodyPreview: body.substring(0, 500),
              result: JSON.parse(JSON.stringify(result)),
            },
          },
        });
      }

      return result;
    } catch (error: any) {
      console.error('AI moderation error:', error);

      // Log failure
      if (userId) {
        await prisma.aIEventLog.create({
          data: {
            type: AIEventType.MOD_ASSIST,
            model: GROQ_MODEL,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            latencyMs: Date.now() - startTime,
            success: false,
            actorId: userId,
            error: error.message,
            metadata: { title, error: error.message },
          },
        });
      }

      // Return permissive default on error (let human moderators review)
      return {
        approved: true,
        score: 25,
        categories: {
          spam: false,
          inappropriate: false,
          harassment: false,
          misinformation: false,
          violence: false,
        },
        reason: 'تعذر التحقق التلقائي - سيتم المراجعة يدوياً',
      };
    }
  },

  /**
   * Generate content summary and keywords
   */
  async summarizeContent(
    title: string,
    body: string,
    contentId?: string,
    userId?: string
  ): Promise<ContentSummary> {
    const startTime = Date.now();

    try {
      // Check if AI is enabled
      const settings = await getAISettings();
      if (!settings.ai.enabled) {
        throw new Error('AI_DISABLED');
      }

      // Check rate limit
      const withinLimit = await checkRateLimit(userId);
      if (!withinLimit) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      const systemPrompt = settings.ai.prompts.summarize
        ? `${settings.ai.prompts.summarize}

أعطِ النتيجة بصيغة JSON فقط:

{
  "summary": "ملخص موجز في 2-3 جمل",
  "keywords": ["كلمة1", "كلمة2", "كلمة3", "كلمة4", "كلمة5"],
  "sentiment": "positive/neutral/negative",
  "language": "ar/en/mixed"
}`
        : '';

      const userPrompt = `العنوان: ${title}

المحتوى:
${body.substring(0, 2000)}`;

      const response = await callGroq(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        0.5,
        'summarize'
      );

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }

      const result: ContentSummary = JSON.parse(jsonMatch[0]);

      if (contentId && userId) {
        await prisma.aIEventLog.create({
          data: {
            type: AIEventType.SUMMARIZE,
            model: GROQ_MODEL,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            latencyMs: Date.now() - startTime,
            success: true,
            actorId: userId,
            metadata: {
              title,
              bodyPreview: body.substring(0, 500),
              result: JSON.parse(JSON.stringify(result)),
            },
          },
        });
      }

      return result;
    } catch (error: any) {
      console.error('AI summary error:', error);

      // Log failure
      if (userId) {
        await prisma.aIEventLog.create({
          data: {
            type: AIEventType.SUMMARIZE,
            model: GROQ_MODEL,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            latencyMs: Date.now() - startTime,
            success: false,
            actorId: userId,
            error: error.message,
            metadata: { title, error: error.message },
          },
        });
      }

      return {
        summary: title,
        keywords: [],
        sentiment: 'neutral',
        language: 'ar',
      };
    }
  },

  /**
   * Check if text contains spam patterns
   */
  async isSpam(text: string): Promise<boolean> {
    // Quick heuristic checks before using AI
    const spamPatterns = [
      /(.)\1{10,}/, // Repeated characters
      /(https?:\/\/[^\s]+){5,}/, // Too many links
      /(\b\w+\b)(\s+\1){4,}/, // Repeated words
      /[A-Z]{20,}/, // All caps spam
    ];

    for (const pattern of spamPatterns) {
      if (pattern.test(text)) {
        return true;
      }
    }

    // Use AI for more nuanced detection if text is long enough
    if (text.length > 100) {
      const result = await this.moderateContent('', text);
      return result.categories.spam;
    }

    return false;
  },

  /**
   * Generate auto-reply suggestions for moderators
   */
  async generateModerationReply(
    contentTitle: string,
    violationType: string
  ): Promise<string> {
    try {
      // Check if AI is enabled
      const isEnabled = await this.isEnabled();
      if (!isEnabled) {
        return `تم رفض محتواك "${contentTitle}" لمخالفته سياسات المجتمع (${violationType}). يرجى مراجعة إرشادات النشر والمحاولة مرة أخرى.`;
      }

      const systemPrompt = `أنت مساعد إشراف. اكتب رسالة مهذبة وواضحة للمستخدم توضح سبب رفض محتواه. الرسالة يجب أن تكون:
- مهذبة ومحترمة
- واضحة في شرح السبب
- تقدم اقتراحات للتحسين
- قصيرة (2-3 جمل)`;

      const userPrompt = `عنوان المحتوى المرفوض: ${contentTitle}
نوع المخالفة: ${violationType}

اكتب رسالة للمستخدم:`;

      const response = await callGroq(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        0.7,
        'summarize'
      );

      return response.trim();
    } catch {
      return `تم رفض محتواك "${contentTitle}" لمخالفته سياسات المجتمع (${violationType}). يرجى مراجعة إرشادات النشر والمحاولة مرة أخرى.`;
    }
  },
};

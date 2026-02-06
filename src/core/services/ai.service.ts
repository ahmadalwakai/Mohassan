/**
 * AI Service using Groq API
 * Content moderation, summarization, and analysis
 */

import { prisma } from '@/core/db/prisma';
import { AIEventType } from '@prisma/client';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

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

async function callGroq(messages: GroqMessage[], temperature = 0.3): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

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
      max_tokens: 1024,
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
   * Moderate content for policy violations
   */
  async moderateContent(
    title: string, 
    body: string, 
    contentId?: string,
    userId?: string
  ): Promise<ModerationResult> {
    const startTime = Date.now();
    
    const systemPrompt = `أنت مشرف محتوى ذكي. مهمتك هي فحص المحتوى العربي والإنجليزي للتحقق من مخالفته لسياسات المجتمع.

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
}

معايير التقييم:
- spam: محتوى مكرر، إعلانات مزعجة، روابط مشبوهة
- inappropriate: محتوى للبالغين، ألفاظ نابية
- harassment: تنمر، تهديد، استهداف شخصي
- misinformation: معلومات مضللة أو كاذبة بشكل واضح
- violence: تحريض على العنف أو محتوى عنيف

score: 0 = محتوى ممتاز، 100 = مخالف تماماً
approved: true إذا كان score < 50`;

    const userPrompt = `العنوان: ${title}

المحتوى:
${body.substring(0, 3000)}`;

    try {
      const response = await callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

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
            metadata: { title, bodyPreview: body.substring(0, 500), result: JSON.parse(JSON.stringify(result)) },
          },
        });
      }

      return result;
    } catch (error) {
      console.error('AI moderation error:', error);
      
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
    
    const systemPrompt = `أنت مساعد ذكي متخصص في تحليل وتلخيص المحتوى. قم بتحليل المحتوى التالي وأعطِ النتيجة بصيغة JSON فقط:

{
  "summary": "ملخص موجز في 2-3 جمل",
  "keywords": ["كلمة1", "كلمة2", "كلمة3", "كلمة4", "كلمة5"],
  "sentiment": "positive/neutral/negative",
  "language": "ar/en/mixed"
}`;

    const userPrompt = `العنوان: ${title}

المحتوى:
${body.substring(0, 2000)}`;

    try {
      const response = await callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], 0.5);

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
            metadata: { title, bodyPreview: body.substring(0, 500), result: JSON.parse(JSON.stringify(result)) },
          },
        });
      }

      return result;
    } catch (error) {
      console.error('AI summary error:', error);
      
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
    const systemPrompt = `أنت مساعد إشراف. اكتب رسالة مهذبة وواضحة للمستخدم توضح سبب رفض محتواه. الرسالة يجب أن تكون:
- مهذبة ومحترمة
- واضحة في شرح السبب
- تقدم اقتراحات للتحسين
- قصيرة (2-3 جمل)`;

    const userPrompt = `عنوان المحتوى المرفوض: ${contentTitle}
نوع المخالفة: ${violationType}

اكتب رسالة للمستخدم:`;

    try {
      const response = await callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], 0.7);

      return response.trim();
    } catch {
      return `تم رفض محتواك "${contentTitle}" لمخالفته سياسات المجتمع (${violationType}). يرجى مراجعة إرشادات النشر والمحاولة مرة أخرى.`;
    }
  },
};

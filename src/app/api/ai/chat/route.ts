/**
 * AI Chat Endpoint using Groq API
 * Real-time chat with AI assistant
 * Respects admin-controlled settings and rate limits
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/auth';
import { aiService } from '@/core/services';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }

    // Check if AI is enabled
    const aiEnabled = await aiService.isEnabled();
    if (!aiEnabled) {
      return NextResponse.json(
        { error: 'الذكاء الاصطناعي غير متاح حالياً' },
        { status: 503 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'الذكاء الاصطناعي غير متاح حالياً' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { messages, temperature = 0.7 } = body as { 
      messages: ChatMessage[]; 
      temperature?: number 
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get AI settings for max tokens and custom prompt
    const settings = await aiService.getSettings();
    const maxTokens = settings.ai.maxTokens.chat;

    // Add system prompt for Arabic/English assistant
    const systemMessage: ChatMessage = {
      role: 'system',
      content: settings.ai.prompts.chat || `أنت مساعد ذكي يتحدث العربية والإنجليزية. اسمك "Typhoon AI".
مهمتك مساعدة المستخدمين في:
- الإجابة على الأسئلة العامة
- كتابة وتحرير النصوص
- تلخيص المحتوى
- الترجمة بين العربية والإنجليزية
- تقديم النصائح والمعلومات

كن ودوداً ومفيداً. أجب باللغة التي يستخدمها المستخدم.`
    };

    const fullMessages = [systemMessage, ...messages];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: fullMessages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API error:', error);
      return NextResponse.json(
        { error: `AI service error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || '';

    return NextResponse.json({
      message: assistantMessage,
      usage: data.usage,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

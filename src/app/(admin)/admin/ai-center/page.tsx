'use client';

import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { useState, useCallback, useEffect } from 'react';

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

interface AIStats {
  totalRequests: number;
  success: number;
  failure: number;
  avgLatencyMs: number;
  byType: Record<string, number>;
}

export default function AdminAICenterPage() {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [editedSettings, setEditedSettings] = useState<AISettings | null>(null);
  const [modelName, setModelName] = useState<string>('');
  const [stats, setStats] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ai-center');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setEditedSettings(data.settings);
        setModelName(data.model.name);
        setStats(data.usage.last24h);
      } else {
        showMessage('فشل تحميل الإعدادات', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      showMessage('خطأ في تحميل الإعدادات', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function saveSettings() {
    if (!editedSettings) return;

    try {
      setSaving(true);
      const res = await fetch('/api/admin/ai-center', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedSettings),
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setEditedSettings(data.settings);
        showMessage(data.message || 'تم حفظ الإعدادات بنجاح', 'success');
      } else {
        const error = await res.json();
        showMessage(error.error || 'فشل حفظ الإعدادات', 'error');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showMessage('خطأ في حفظ الإعدادات', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <VStack gap={6} align="stretch">
        <Box color="text.secondary" py={8} textAlign="center">
          جاري التحميل...
        </Box>
      </VStack>
    );
  }

  if (!editedSettings) {
    return (
      <VStack gap={6} align="stretch">
        <Box color="text.secondary" py={8} textAlign="center">
          فشل تحميل الإعدادات
        </Box>
      </VStack>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      {/* Message */}
      {message && (
        <Box
          p={3}
          borderRadius="md"
          bg={message.type === 'success' ? 'green.100' : 'red.100'}
          color={message.type === 'success' ? 'green.800' : 'red.800'}
        >
          {message.text}
        </Box>
      )}

      {/* Header */}
      <Box>
        <Heading size="lg" color="text.primary" mb={2}>
          مركز الذكاء الاصطناعي
        </Heading>
        <Text color="text.secondary">
          التحكم الكامل في سلوك الذكاء الاصطناعي بدون تغيير منطق المنتج الأساسي
        </Text>
      </Box>

      {/* 1. AI STATUS */}
      <Box
        bg="bg.secondary"
        p={6}
        borderRadius="lg"
        borderWidth={1}
        borderColor="border.default"
      >
        <Heading size="md" color="text.primary" mb={4}>
          1. حالة الذكاء الاصطناعي
        </Heading>

        <HStack gap={4} align="center">
          <Text color="text.primary" flex="1">
            تفعيل الذكاء الاصطناعي (عام)
          </Text>
          <Button
            size="sm"
            bg={editedSettings.ai.enabled ? 'green.500' : 'gray.500'}
            color="white"
            onClick={() =>
              setEditedSettings({
                ...editedSettings,
                ai: {
                  ...editedSettings.ai,
                  enabled: !editedSettings.ai.enabled,
                },
              })
            }
          >
            {editedSettings.ai.enabled ? 'مفعّل' : 'معطّل'}
          </Button>
        </HStack>

        <Text color="text.secondary" fontSize="sm" mt={4}>
          عند التعطيل: جميع نقاط نهاية /api/ai/* ستُرجع رسالة 503 آمنة
        </Text>
      </Box>

      {/* 2. MODEL & LIMITS */}
      <Box
        bg="bg.secondary"
        p={6}
        borderRadius="lg"
        borderWidth={1}
        borderColor="border.default"
      >
        <Heading size="md" color="text.primary" mb={4}>
          2. النموذج والحدود
        </Heading>

        {/* Model Name - Read Only */}
        <Box mb={4}>
          <Text color="text.primary" mb={2} fontSize="sm" fontWeight="bold">
            اسم النموذج (للقراءة فقط)
          </Text>
          <Input
            value={modelName}
            readOnly
            bg="bg.primary"
            color="text.secondary"
          />
        </Box>

        {/* Rate Limit */}
        <Box mb={4}>
          <Text color="text.primary" mb={2} fontSize="sm" fontWeight="bold">
            حد المعدل (طلب/دقيقة)
          </Text>
          <Input
            type="number"
            value={editedSettings.ai.rateLimit.perMinute}
            onChange={(e) =>
              setEditedSettings({
                ...editedSettings,
                ai: {
                  ...editedSettings.ai,
                  rateLimit: {
                    perMinute: parseInt(e.target.value) || 1,
                  },
                },
              })
            }
            min={1}
            max={1000}
            color="text.primary"
          />
        </Box>

        {/* Max Tokens */}
        <VStack gap={4} align="stretch">
          <Box>
            <Text color="text.primary" mb={2} fontSize="sm" fontWeight="bold">
              حد الرموز - الدردشة
            </Text>
            <Input
              type="number"
              value={editedSettings.ai.maxTokens.chat}
              onChange={(e) =>
                setEditedSettings({
                  ...editedSettings,
                  ai: {
                    ...editedSettings.ai,
                    maxTokens: {
                      ...editedSettings.ai.maxTokens,
                      chat: parseInt(e.target.value) || 256,
                    },
                  },
                })
              }
              min={256}
              max={4096}
              color="text.primary"
            />
          </Box>

          <Box>
            <Text color="text.primary" mb={2} fontSize="sm" fontWeight="bold">
              حد الرموز - التلخيص
            </Text>
            <Input
              type="number"
              value={editedSettings.ai.maxTokens.summarize}
              onChange={(e) =>
                setEditedSettings({
                  ...editedSettings,
                  ai: {
                    ...editedSettings.ai,
                    maxTokens: {
                      ...editedSettings.ai.maxTokens,
                      summarize: parseInt(e.target.value) || 256,
                    },
                  },
                })
              }
              min={256}
              max={4096}
              color="text.primary"
            />
          </Box>

          <Box>
            <Text color="text.primary" mb={2} fontSize="sm" fontWeight="bold">
              حد الرموز - الإشراف
            </Text>
            <Input
              type="number"
              value={editedSettings.ai.maxTokens.moderation}
              onChange={(e) =>
                setEditedSettings({
                  ...editedSettings,
                  ai: {
                    ...editedSettings.ai,
                    maxTokens: {
                      ...editedSettings.ai.maxTokens,
                      moderation: parseInt(e.target.value) || 256,
                    },
                  },
                })
              }
              min={256}
              max={4096}
              color="text.primary"
            />
          </Box>
        </VStack>
      </Box>

      {/* 3. PROMPTS (EDITABLE) */}
      <Box
        bg="bg.secondary"
        p={6}
        borderRadius="lg"
        borderWidth={1}
        borderColor="border.default"
      >
        <Heading size="md" color="text.primary" mb={4}>
          3. النماذج الإشرافية (قابلة للتحرير)
        </Heading>

        {/* Chat Prompt */}
        <Box mb={4}>
          <Text color="text.primary" mb={2} fontSize="sm" fontWeight="bold">
            نموذج الدردشة
          </Text>
          <Text color="text.secondary" fontSize="xs" mb={2}>
            يُستخدم للإجابة على أسئلة المستخدمين
          </Text>
          <Textarea
            value={editedSettings.ai.prompts.chat}
            onChange={(e) =>
              setEditedSettings({
                ...editedSettings,
                ai: {
                  ...editedSettings.ai,
                  prompts: {
                    ...editedSettings.ai.prompts,
                    chat: e.target.value,
                  },
                },
              })
            }
            minH="100px"
            color="text.primary"
            placeholder="أدخل نموذج الدردشة..."
          />
        </Box>

        {/* Moderation Prompt */}
        <Box mb={4}>
          <Text color="text.primary" mb={2} fontSize="sm" fontWeight="bold">
            نموذج الإشراف على المحتوى
          </Text>
          <Text color="text.secondary" fontSize="xs" mb={2}>
            يُستخدم للتحقق من انتهاكات السياسة
          </Text>
          <Textarea
            value={editedSettings.ai.prompts.moderation}
            onChange={(e) =>
              setEditedSettings({
                ...editedSettings,
                ai: {
                  ...editedSettings.ai,
                  prompts: {
                    ...editedSettings.ai.prompts,
                    moderation: e.target.value,
                  },
                },
              })
            }
            minH="100px"
            color="text.primary"
            placeholder="أدخل نموذج الإشراف..."
          />
        </Box>

        {/* Summarize Prompt */}
        <Box>
          <Text color="text.primary" mb={2} fontSize="sm" fontWeight="bold">
            نموذج التلخيص
          </Text>
          <Text color="text.secondary" fontSize="xs" mb={2}>
            يُستخدم لتلخيص المحتوى واستخراج الكلمات المفتاحية
          </Text>
          <Textarea
            value={editedSettings.ai.prompts.summarize}
            onChange={(e) =>
              setEditedSettings({
                ...editedSettings,
                ai: {
                  ...editedSettings.ai,
                  prompts: {
                    ...editedSettings.ai.prompts,
                    summarize: e.target.value,
                  },
                },
              })
            }
            minH="100px"
            color="text.primary"
            placeholder="أدخل نموذج التلخيص..."
          />
        </Box>
      </Box>

      {/* 4. AI USAGE SNAPSHOT */}
      <Box
        bg="bg.secondary"
        p={6}
        borderRadius="lg"
        borderWidth={1}
        borderColor="border.default"
      >
        <Heading size="md" color="text.primary" mb={4}>
          4. لقطة استخدام الذكاء الاصطناعي (آخر 24 ساعة)
        </Heading>

        {stats ? (
          <VStack gap={4} align="stretch">
            <HStack gap={4} justify="space-between">
              <Box>
                <Text color="text.secondary" fontSize="sm">
                  إجمالي الطلبات
                </Text>
                <Text color="brand.glow" fontSize="2xl" fontWeight="bold">
                  {stats.totalRequests}
                </Text>
              </Box>

              <Box>
                <Text color="text.secondary" fontSize="sm">
                  نجح
                </Text>
                <Text color="green" fontSize="2xl" fontWeight="bold">
                  {stats.success}{' '}
                  <Text as="span" fontSize="sm" color="text.secondary">
                    (
                    {stats.totalRequests > 0
                      ? ((stats.success / stats.totalRequests) * 100).toFixed(1)
                      : 0}
                    %)
                  </Text>
                </Text>
              </Box>

              <Box>
                <Text color="text.secondary" fontSize="sm">
                  فشل
                </Text>
                <Text color="red" fontSize="2xl" fontWeight="bold">
                  {stats.failure}{' '}
                  <Text as="span" fontSize="sm" color="text.secondary">
                    (
                    {stats.totalRequests > 0
                      ? ((stats.failure / stats.totalRequests) * 100).toFixed(1)
                      : 0}
                    %)
                  </Text>
                </Text>
              </Box>

              <Box>
                <Text color="text.secondary" fontSize="sm">
                  متوسط الكمون
                </Text>
                <Text color="text.primary" fontSize="2xl" fontWeight="bold">
                  {stats.avgLatencyMs}ms
                </Text>
              </Box>
            </HStack>
          </VStack>
        ) : (
          <Text color="text.secondary">لا توجد بيانات</Text>
        )}
      </Box>

      {/* Save Button */}
      <HStack gap={4} justify="flex-start">
        <Button
          onClick={saveSettings}
          disabled={saving}
          bg="brand.glow"
          color="white"
          _hover={{ opacity: 0.9 }}
          _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
        >
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
        <Button
          onClick={fetchSettings}
          variant="outline"
          borderColor="border.default"
          disabled={saving}
        >
          إلغاء التغييرات
        </Button>
      </HStack>
    </VStack>
  );
}

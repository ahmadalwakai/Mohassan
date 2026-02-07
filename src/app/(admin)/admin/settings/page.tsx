'use client';

import { Box, Heading, Text, VStack, HStack, Input, Button, Textarea } from '@chakra-ui/react';
import { useState, useCallback, useEffect } from 'react';

interface Settings {
  newsCategories: string[];
  directoryCategories: string[];
  marketTypes: string[];
  forbiddenWords: string[];
  moderationPolicy: {
    warningThreshold: number;
    autoHideFlagsCount: number;
    autoHideThreshold: number;
  };
  aiUsageLimits: {
    dailySearchLimit: number;
    dailySummarizeLimit: number;
    dailyTagLimit: number;
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [editedSettings, setEditedSettings] = useState<Settings | null>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setEditedSettings(data);
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
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedSettings),
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setEditedSettings(data);
        showMessage('تم حفظ الإعدادات بنجاح', 'success');
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

  function updateArraySetting(key: keyof Settings, value: string) {
    if (!editedSettings) return;
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    setEditedSettings({
      ...editedSettings,
      [key]: items,
    });
  }

  function updateNestedSetting(section: string, key: string, value: any) {
    if (!editedSettings) return;
    setEditedSettings({
      ...editedSettings,
      [section]: {
        ...editedSettings[section as keyof Settings] as any,
        [key]: value,
      },
    });
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
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Heading size="lg" color="text.primary" mb={2}>
          إعدادات النظام
        </Heading>
        <Text color="text.secondary" mb={4}>
          إدارة إعدادات المنصة الرئيسية
        </Text>

        {message && (
          <Box
            mb={4}
            p={3}
            borderRadius="md"
            bg={message.type === 'success' ? 'green.100' : 'red.100'}
            color={message.type === 'success' ? 'green.800' : 'red.800'}
          >
            {message.text}
          </Box>
        )}

        <VStack gap={6} align="stretch">
          {/* News Categories */}
          <Box>
            <Heading size="sm" color="text.primary" mb={2}>
              فئات الأخبار
            </Heading>
            <Text color="text.secondary" fontSize="sm" mb={2}>
              أدخل الفئات مفصولة بفواصل
            </Text>
            <Textarea
              value={editedSettings.newsCategories.join(', ')}
              onChange={(e) => updateArraySetting('newsCategories', e.target.value)}
              placeholder="اقتصاد, صحة, تقنية, رياضة..."
              color="text.primary"
              minH="80px"
            />
          </Box>

          {/* Directory Categories */}
          <Box>
            <Heading size="sm" color="text.primary" mb={2}>
              فئات الدليل
            </Heading>
            <Text color="text.secondary" fontSize="sm" mb={2}>
              أدخل الفئات مفصولة بفواصل
            </Text>
            <Textarea
              value={editedSettings.directoryCategories.join(', ')}
              onChange={(e) => updateArraySetting('directoryCategories', e.target.value)}
              placeholder="شركات, محترفون, خدمات, تعليم..."
              color="text.primary"
              minH="80px"
            />
          </Box>

          {/* Market Types */}
          <Box>
            <Heading size="sm" color="text.primary" mb={2}>
              أنواع السوق
            </Heading>
            <Text color="text.secondary" fontSize="sm" mb={2}>
              أدخل الأنواع مفصولة بفواصل
            </Text>
            <Textarea
              value={editedSettings.marketTypes.join(', ')}
              onChange={(e) => updateArraySetting('marketTypes', e.target.value)}
              placeholder="sell, buy, jobs, realestate, lost..."
              color="text.primary"
              minH="80px"
            />
          </Box>

          {/* Forbidden Words */}
          <Box>
            <Heading size="sm" color="text.primary" mb={2}>
              الكلمات المحظورة
            </Heading>
            <Text color="text.secondary" fontSize="sm" mb={2}>
              أدخل الكلمات مفصولة بفواصل (للفلترة التلقائية)
            </Text>
            <Textarea
              value={editedSettings.forbiddenWords.join(', ')}
              onChange={(e) => updateArraySetting('forbiddenWords', e.target.value)}
              placeholder="أدخل الكلمات المحظورة..."
              color="text.primary"
              minH="80px"
            />
          </Box>

          {/* Moderation Policy */}
          <Box borderTop="1px solid" borderTopColor="border.default" pt={4}>
            <Heading size="sm" color="text.primary" mb={4}>
              سياسة الإشراف
            </Heading>
            <VStack gap={4} align="stretch">
              <Box>
                <Text color="text.primary" mb={2}>
                  عتبة التحذيرات (قبل الحظر):
                </Text>
                <Input
                  type="number"
                  value={editedSettings.moderationPolicy.warningThreshold}
                  onChange={(e) => updateNestedSetting('moderationPolicy', 'warningThreshold', parseInt(e.target.value))}
                  min="1"
                  max="10"
                  color="text.primary"
                />
              </Box>
              <Box>
                <Text color="text.primary" mb={2}>
                  عدد الأعلام لإخفاء المحتوى تلقائياً:
                </Text>
                <Input
                  type="number"
                  value={editedSettings.moderationPolicy.autoHideFlagsCount}
                  onChange={(e) => updateNestedSetting('moderationPolicy', 'autoHideFlagsCount', parseInt(e.target.value))}
                  min="1"
                  max="20"
                  color="text.primary"
                />
              </Box>
              <Box>
                <Text color="text.primary" mb={2}>
                  نسبة الثقة لإخفاء المحتوى (0-1):
                </Text>
                <Input
                  type="number"
                  value={editedSettings.moderationPolicy.autoHideThreshold}
                  onChange={(e) => updateNestedSetting('moderationPolicy', 'autoHideThreshold', parseFloat(e.target.value))}
                  min="0"
                  max="1"
                  step="0.1"
                  color="text.primary"
                />
              </Box>
            </VStack>
          </Box>

          {/* AI Usage Limits */}
          <Box borderTop="1px solid" borderTopColor="border.default" pt={4}>
            <Heading size="sm" color="text.primary" mb={4}>
              حدود استخدام الذكاء الاصطناعي (يومياً)
            </Heading>
            <VStack gap={4} align="stretch">
              <Box>
                <Text color="text.primary" mb={2}>
                  حد البحث اليومي:
                </Text>
                <Input
                  type="number"
                  value={editedSettings.aiUsageLimits.dailySearchLimit}
                  onChange={(e) => updateNestedSetting('aiUsageLimits', 'dailySearchLimit', parseInt(e.target.value))}
                  min="10"
                  max="500"
                  color="text.primary"
                />
              </Box>
              <Box>
                <Text color="text.primary" mb={2}>
                  حد الملخص اليومي:
                </Text>
                <Input
                  type="number"
                  value={editedSettings.aiUsageLimits.dailySummarizeLimit}
                  onChange={(e) => updateNestedSetting('aiUsageLimits', 'dailySummarizeLimit', parseInt(e.target.value))}
                  min="10"
                  max="500"
                  color="text.primary"
                />
              </Box>
              <Box>
                <Text color="text.primary" mb={2}>
                  حد التصنيف اليومي:
                </Text>
                <Input
                  type="number"
                  value={editedSettings.aiUsageLimits.dailyTagLimit}
                  onChange={(e) => updateNestedSetting('aiUsageLimits', 'dailyTagLimit', parseInt(e.target.value))}
                  min="10"
                  max="500"
                  color="text.primary"
                />
              </Box>
            </VStack>
          </Box>

          {/* Save Button */}
          <HStack gap={4} mt={6} justify="flex-end">
            <Button
              onClick={() => setEditedSettings(settings)}
              variant="outline"
              disabled={saving}
            >
              إلغاء
            </Button>
            <Button
              onClick={saveSettings}
              colorScheme="green"
              loading={saving}
            >
              حفظ الإعدادات
            </Button>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
}

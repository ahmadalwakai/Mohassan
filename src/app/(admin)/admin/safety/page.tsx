'use client';

import {
  Box, Heading, Text, VStack, HStack, Button, Input, Badge, Textarea,
} from '@chakra-ui/react';
import { Select } from '@/components/ui/select';
import { useState, useCallback, useEffect } from 'react';

// ─── Types ──────────────────────────────────────────────────────────

interface SafetyPolicy {
  id: string;
  maxWarningsBeforeBan: number;
  autoHideFlagsCount: number;
  autoHideConfidence: number;
  maxReportsPerUser: number;
  enableAutoModeration: boolean;
  enableAIModeration: boolean;
  enableUserReporting: boolean;
  requireEmailVerify: boolean;
  newUserCooldownHours: number;
  maxContentPerDay: number;
  autoHideRules: { rules: AutoHideRule[] } | null;
}

interface AutoHideRule {
  contentType: string;
  reportCategory: string;
  threshold: number;
  action: 'HIDE' | 'FLAG';
}

interface BannedKeyword {
  id: string;
  keyword: string;
  reason: string | null;
  severity: string;
  isActive: boolean;
  createdAt: string;
}

interface SimResult {
  verdict: 'ALLOW' | 'FLAG' | 'HIDE' | 'BLOCK';
  matches: { keyword: string; severity: string }[];
  actions: string[];
}

interface PolicyVersion {
  id: string;
  actorId: string;
  note: string | null;
  createdAt: string;
  snapshot: { policy: Record<string, unknown>; keywords: { keyword: string; severity: string }[] };
}

type Tab = 'policy' | 'keywords' | 'simulator' | 'rules' | 'history';

// ─── Helpers ────────────────────────────────────────────────────────

const CONTENT_TYPES = ['*', 'news', 'directory', 'market', 'community', 'initiative'];
const REPORT_CATEGORIES = ['*', 'SPAM', 'INAPPROPRIATE', 'HARASSMENT', 'MISINFORMATION', 'COPYRIGHT', 'OTHER'];

const contentTypeLabel = (t: string) => {
  const m: Record<string, string> = { '*': 'الكل', news: 'أخبار', directory: 'دليل', market: 'سوق', community: 'مجتمع', initiative: 'مبادرات' };
  return m[t] || t;
};
const reportCatLabel = (c: string) => {
  const m: Record<string, string> = { '*': 'الكل', SPAM: 'سبام', INAPPROPRIATE: 'غير لائق', HARASSMENT: 'تحرش', MISINFORMATION: 'معلومات مضللة', COPYRIGHT: 'حقوق ملكية', OTHER: 'أخرى' };
  return m[c] || c;
};

export default function AdminSafetyPage() {
  const [tab, setTab] = useState<Tab>('policy');
  const [policy, setPolicy] = useState<SafetyPolicy | null>(null);
  const [edited, setEdited] = useState<SafetyPolicy | null>(null);
  const [keywords, setKeywords] = useState<BannedKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New keyword form
  const [newKeyword, setNewKeyword] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newSeverity, setNewSeverity] = useState('medium');

  // Simulator state
  const [simTitle, setSimTitle] = useState('');
  const [simBody, setSimBody] = useState('');
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  // History state
  const [versions, setVersions] = useState<PolicyVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  // Auto-hide rules state
  const [rules, setRules] = useState<AutoHideRule[]>([]);
  const [newRule, setNewRule] = useState<AutoHideRule>({ contentType: '*', reportCategory: '*', threshold: 5, action: 'HIDE' });

  const flash = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  // ── Fetch policy ──────────────────────────────────────────────────
  const fetchPolicy = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/safety/policies');
      if (res.ok) {
        const data = await res.json();
        setPolicy(data);
        setEdited(data);
        const autoRules = data.autoHideRules?.rules || [];
        setRules(autoRules);
      }
    } catch { /* silent */ }
  }, []);

  // ── Fetch keywords ────────────────────────────────────────────────
  const fetchKeywords = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/safety/keywords');
      if (res.ok) {
        const data = await res.json();
        setKeywords(data.keywords ?? []);
      }
    } catch { /* silent */ }
  }, []);

  // ── Fetch versions ────────────────────────────────────────────────
  const fetchVersions = useCallback(async () => {
    setVersionsLoading(true);
    try {
      const res = await fetch('/api/admin/safety/versions');
      if (res.ok) {
        const data = await res.json();
        setVersions(data.versions ?? []);
      }
    } catch { /* silent */ }
    finally { setVersionsLoading(false); }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPolicy(), fetchKeywords()]).finally(() => setLoading(false));
  }, [fetchPolicy, fetchKeywords]);

  useEffect(() => {
    if (tab === 'history') fetchVersions();
  }, [tab, fetchVersions]);

  // ── Save policy ───────────────────────────────────────────────────
  async function savePolicy() {
    if (!edited) return;
    try {
      setSaving(true);
      const res = await fetch('/api/admin/safety/policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edited),
      });
      if (res.ok) {
        const data = await res.json();
        setPolicy(data);
        setEdited(data);
        flash('تم حفظ السياسة بنجاح', 'success');
      } else {
        flash('فشل الحفظ', 'error');
      }
    } catch { flash('خطأ', 'error'); }
    finally { setSaving(false); }
  }

  // ── Save auto-hide rules ─────────────────────────────────────────
  async function saveAutoHideRules() {
    if (!edited) return;
    try {
      setSaving(true);
      const res = await fetch('/api/admin/safety/policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...edited, autoHideRules: { rules } }),
      });
      if (res.ok) {
        const data = await res.json();
        setPolicy(data);
        setEdited(data);
        flash('تم حفظ قواعد الإخفاء التلقائي', 'success');
      } else {
        flash('فشل الحفظ', 'error');
      }
    } catch { flash('خطأ', 'error'); }
    finally { setSaving(false); }
  }

  // ── Add keyword ───────────────────────────────────────────────────
  async function addKeyword() {
    if (!newKeyword.trim()) return;
    try {
      const res = await fetch('/api/admin/safety/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newKeyword.trim(), reason: newReason || undefined, severity: newSeverity }),
      });
      if (res.ok) {
        setNewKeyword('');
        setNewReason('');
        fetchKeywords();
        flash('تمت إضافة الكلمة', 'success');
      } else {
        const err = await res.json();
        flash(err.error || 'فشل', 'error');
      }
    } catch { flash('خطأ', 'error'); }
  }

  // ── Remove keyword ────────────────────────────────────────────────
  async function removeKeyword(id: string) {
    try {
      const res = await fetch('/api/admin/safety/keywords', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchKeywords();
        flash('تمت إزالة الكلمة', 'success');
      } else {
        flash('فشل الإزالة', 'error');
      }
    } catch { flash('خطأ', 'error'); }
  }

  // ── Simulate ──────────────────────────────────────────────────────
  async function runSimulation() {
    if (!simTitle.trim() && !simBody.trim()) return;
    setSimLoading(true);
    setSimResult(null);
    try {
      const res = await fetch('/api/admin/safety/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: simTitle, body: simBody }),
      });
      if (res.ok) {
        setSimResult(await res.json());
      } else {
        const err = await res.json();
        flash(err.error || 'فشل المحاكاة', 'error');
      }
    } catch { flash('خطأ', 'error'); }
    finally { setSimLoading(false); }
  }

  // ── Restore version ───────────────────────────────────────────────
  async function restoreVersion(versionId: string) {
    setRestoring(versionId);
    try {
      const res = await fetch('/api/admin/safety/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      });
      if (res.ok) {
        flash('تمت استعادة الإصدار بنجاح', 'success');
        await Promise.all([fetchPolicy(), fetchKeywords(), fetchVersions()]);
      } else {
        const err = await res.json();
        flash(err.error || 'فشل الاستعادة', 'error');
      }
    } catch { flash('خطأ', 'error'); }
    finally { setRestoring(null); }
  }

  function updatePolicy(key: keyof SafetyPolicy, value: unknown) {
    if (!edited) return;
    setEdited({ ...edited, [key]: value });
  }

  function addRule() {
    if (newRule.threshold < 1) return;
    setRules([...rules, { ...newRule }]);
    setNewRule({ contentType: '*', reportCategory: '*', threshold: 5, action: 'HIDE' });
  }

  function removeRule(idx: number) {
    setRules(rules.filter((_, i) => i !== idx));
  }

  if (loading) {
    return <Box py={10} textAlign="center" color="text.secondary">جاري التحميل...</Box>;
  }

  const severityColor = (s: string) =>
    s === 'high' ? 'red' : s === 'medium' ? 'orange' : 'yellow';

  const verdictColor = (v: string) => {
    switch (v) {
      case 'ALLOW': return 'green';
      case 'FLAG': return 'yellow';
      case 'HIDE': return 'orange';
      case 'BLOCK': return 'red';
      default: return 'gray';
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'policy', label: 'السياسة' },
    { key: 'keywords', label: 'الكلمات المحظورة' },
    { key: 'rules', label: 'قواعد الإخفاء التلقائي' },
    { key: 'simulator', label: 'محاكي الأمان' },
    { key: 'history', label: 'السجل' },
  ];

  return (
    <VStack gap={6} align="stretch">
      {msg && (
        <Box p={3} borderRadius="md"
          bg={msg.type === 'success' ? 'green.100' : 'red.100'}
          color={msg.type === 'success' ? 'green.800' : 'red.800'}>
          {msg.text}
        </Box>
      )}

      {/* Tab bar */}
      <HStack gap={2} flexWrap="wrap">
        {tabs.map((t) => (
          <Button key={t.key} size="sm"
            variant={tab === t.key ? 'solid' : 'outline'}
            colorScheme={tab === t.key ? 'blue' : undefined}
            onClick={() => setTab(t.key)}>
            {t.label}
          </Button>
        ))}
      </HStack>

      {/* ═══════ POLICY TAB ═══════ */}
      {tab === 'policy' && (
        <>
          <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
            <Heading size="md" color="text.primary" mb={4}>حدود وعتبات الأمان</Heading>
            {edited && (
              <VStack gap={4} align="stretch">
                <HStack gap={4} flexWrap="wrap">
                  <Box flex={1} minW="220px">
                    <Text color="text.secondary" fontSize="sm" mb={1}>أقصى تحذيرات قبل الحظر</Text>
                    <Input type="number" value={edited.maxWarningsBeforeBan}
                      onChange={(e) => updatePolicy('maxWarningsBeforeBan', parseInt(e.target.value))}
                      color="text.primary" min={1} max={20} />
                  </Box>
                  <Box flex={1} minW="220px">
                    <Text color="text.secondary" fontSize="sm" mb={1}>عدد الأعلام لإخفاء المحتوى</Text>
                    <Input type="number" value={edited.autoHideFlagsCount}
                      onChange={(e) => updatePolicy('autoHideFlagsCount', parseInt(e.target.value))}
                      color="text.primary" min={1} max={50} />
                  </Box>
                  <Box flex={1} minW="220px">
                    <Text color="text.secondary" fontSize="sm" mb={1}>نسبة الثقة للإخفاء التلقائي (0-1)</Text>
                    <Input type="number" value={edited.autoHideConfidence}
                      onChange={(e) => updatePolicy('autoHideConfidence', parseFloat(e.target.value))}
                      color="text.primary" min={0} max={1} step={0.05} />
                  </Box>
                </HStack>
                <HStack gap={4} flexWrap="wrap">
                  <Box flex={1} minW="220px">
                    <Text color="text.secondary" fontSize="sm" mb={1}>أقصى بلاغات لكل مستخدم</Text>
                    <Input type="number" value={edited.maxReportsPerUser}
                      onChange={(e) => updatePolicy('maxReportsPerUser', parseInt(e.target.value))}
                      color="text.primary" min={1} max={100} />
                  </Box>
                  <Box flex={1} minW="220px">
                    <Text color="text.secondary" fontSize="sm" mb={1}>فترة تهدئة المستخدم الجديد (ساعات)</Text>
                    <Input type="number" value={edited.newUserCooldownHours}
                      onChange={(e) => updatePolicy('newUserCooldownHours', parseInt(e.target.value))}
                      color="text.primary" min={0} max={720} />
                  </Box>
                  <Box flex={1} minW="220px">
                    <Text color="text.secondary" fontSize="sm" mb={1}>أقصى محتوى يومياً لكل مستخدم</Text>
                    <Input type="number" value={edited.maxContentPerDay}
                      onChange={(e) => updatePolicy('maxContentPerDay', parseInt(e.target.value))}
                      color="text.primary" min={1} max={500} />
                  </Box>
                </HStack>
              </VStack>
            )}
          </Box>

          <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
            <Heading size="md" color="text.primary" mb={4}>أعلام الميزات</Heading>
            {edited && (
              <VStack gap={3} align="stretch">
                {[
                  { key: 'enableAutoModeration' as const, label: 'الإشراف التلقائي', desc: 'إخفاء المحتوى تلقائياً عند تجاوز العتبة' },
                  { key: 'enableAIModeration' as const, label: 'إشراف الذكاء الاصطناعي', desc: 'استخدام AI لتصنيف المحتوى' },
                  { key: 'enableUserReporting' as const, label: 'بلاغات المستخدمين', desc: 'السماح للمستخدمين بالإبلاغ عن المحتوى' },
                  { key: 'requireEmailVerify' as const, label: 'التحقق من البريد', desc: 'يجب التحقق من البريد للنشر' },
                ].map(({ key, label, desc }) => (
                  <HStack key={key} justify="space-between" p={3} bg="bg.elevated" borderRadius="md">
                    <Box>
                      <Text color="text.primary" fontWeight="bold" fontSize="sm">{label}</Text>
                      <Text color="text.secondary" fontSize="xs">{desc}</Text>
                    </Box>
                    <Button
                      size="sm"
                      colorScheme={edited[key] ? 'green' : 'gray'}
                      onClick={() => updatePolicy(key, !edited[key])}
                    >
                      {edited[key] ? 'مفعّل' : 'معطّل'}
                    </Button>
                  </HStack>
                ))}
              </VStack>
            )}
          </Box>

          <HStack justify="flex-end">
            <Button variant="outline" onClick={() => setEdited(policy)} disabled={saving}>إلغاء</Button>
            <Button colorScheme="green" onClick={savePolicy} loading={saving}>حفظ السياسة</Button>
          </HStack>
        </>
      )}

      {/* ═══════ KEYWORDS TAB ═══════ */}
      {tab === 'keywords' && (
        <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
          <Heading size="md" color="text.primary" mb={4}>الكلمات المحظورة</Heading>

          <HStack gap={2} mb={4} flexWrap="wrap">
            <Input placeholder="كلمة جديدة..." value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              color="text.primary" flex={1} minW="150px" />
            <Input placeholder="السبب (اختياري)" value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              color="text.primary" flex={1} minW="150px" />
            <Select value={newSeverity}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewSeverity(e.target.value)}
              options={[
                { value: 'low', label: 'منخفض' },
                { value: 'medium', label: 'متوسط' },
                { value: 'high', label: 'عالي' },
              ]}
              style={{ width: '110px' }} />
            <Button colorScheme="blue" onClick={addKeyword} disabled={!newKeyword.trim()}>إضافة</Button>
          </HStack>

          {keywords.length === 0 ? (
            <Text color="text.secondary" fontSize="sm">لا توجد كلمات محظورة بعد</Text>
          ) : (
            <VStack gap={2} align="stretch" maxH="400px" overflowY="auto">
              {keywords.map((kw) => (
                <HStack key={kw.id} justify="space-between" p={3} bg="bg.elevated" borderRadius="md">
                  <HStack gap={2}>
                    <Badge colorScheme={severityColor(kw.severity)}>{kw.severity}</Badge>
                    <Text color="text.primary" fontWeight="bold" fontSize="sm">{kw.keyword}</Text>
                    {kw.reason && <Text color="text.secondary" fontSize="xs">({kw.reason})</Text>}
                  </HStack>
                  <Button size="xs" colorScheme="red" variant="outline"
                    onClick={() => removeKeyword(kw.id)}>
                    إزالة
                  </Button>
                </HStack>
              ))}
            </VStack>
          )}
        </Box>
      )}

      {/* ═══════ AUTO-HIDE RULES TAB ═══════ */}
      {tab === 'rules' && (
        <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
          <Heading size="md" color="text.primary" mb={2}>قواعد الإخفاء التلقائي</Heading>
          <Text color="text.secondary" fontSize="sm" mb={4}>
            تحكم بحدود الإخفاء التلقائي حسب نوع المحتوى وفئة البلاغ. القواعد الأكثر تحديداً تأخذ الأولوية.
          </Text>

          {/* Add rule form */}
          <Box bg="bg.elevated" p={4} borderRadius="md" mb={4}>
            <HStack gap={3} flexWrap="wrap" mb={3}>
              <Box>
                <Text color="text.secondary" fontSize="xs" mb={1}>نوع المحتوى</Text>
                <Select value={newRule.contentType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewRule({ ...newRule, contentType: e.target.value })}
                  options={CONTENT_TYPES.map((t) => ({ value: t, label: contentTypeLabel(t) }))}
                  style={{ width: '130px' }} />
              </Box>
              <Box>
                <Text color="text.secondary" fontSize="xs" mb={1}>فئة البلاغ</Text>
                <Select value={newRule.reportCategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewRule({ ...newRule, reportCategory: e.target.value })}
                  options={REPORT_CATEGORIES.map((c) => ({ value: c, label: reportCatLabel(c) }))}
                  style={{ width: '140px' }} />
              </Box>
              <Box>
                <Text color="text.secondary" fontSize="xs" mb={1}>العتبة (بلاغات)</Text>
                <Input type="number" value={newRule.threshold}
                  onChange={(e) => setNewRule({ ...newRule, threshold: parseInt(e.target.value) || 1 })}
                  color="text.primary" min={1} max={100} w="90px" />
              </Box>
              <Box>
                <Text color="text.secondary" fontSize="xs" mb={1}>الإجراء</Text>
                <Select value={newRule.action}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewRule({ ...newRule, action: e.target.value as 'HIDE' | 'FLAG' })}
                  options={[
                    { value: 'HIDE', label: 'إخفاء' },
                    { value: 'FLAG', label: 'تمييز فقط' },
                  ]}
                  style={{ width: '120px' }} />
              </Box>
              <Box pt={4}>
                <Button size="sm" colorScheme="blue" onClick={addRule}>إضافة قاعدة</Button>
              </Box>
            </HStack>
          </Box>

          {/* Rules list */}
          {rules.length === 0 ? (
            <Text color="text.secondary" fontSize="sm" mb={4}>لا توجد قواعد مخصصة. سيتم استخدام العتبة العامة.</Text>
          ) : (
            <VStack gap={2} align="stretch" mb={4}>
              {rules.map((rule, idx) => (
                <HStack key={idx} justify="space-between" p={3} bg="bg.elevated" borderRadius="md">
                  <HStack gap={3} flexWrap="wrap">
                    <Badge colorScheme="blue">{contentTypeLabel(rule.contentType)}</Badge>
                    <Badge colorScheme="purple">{reportCatLabel(rule.reportCategory)}</Badge>
                    <Text color="text.primary" fontSize="sm">عتبة: {rule.threshold}</Text>
                    <Badge colorScheme={rule.action === 'HIDE' ? 'red' : 'yellow'}>{rule.action === 'HIDE' ? 'إخفاء' : 'تمييز'}</Badge>
                  </HStack>
                  <Button size="xs" colorScheme="red" variant="outline" onClick={() => removeRule(idx)}>حذف</Button>
                </HStack>
              ))}
            </VStack>
          )}

          <HStack justify="flex-end">
            <Button colorScheme="green" onClick={saveAutoHideRules} loading={saving}>حفظ القواعد</Button>
          </HStack>
        </Box>
      )}

      {/* ═══════ SIMULATOR TAB ═══════ */}
      {tab === 'simulator' && (
        <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
          <Heading size="md" color="text.primary" mb={2}>محاكي سياسة الأمان</Heading>
          <Text color="text.secondary" fontSize="sm" mb={4}>
            اختبر المحتوى ضد سياسة الأمان الحالية بدون أي كتابة في قاعدة البيانات (dry-run).
          </Text>

          <VStack gap={3} align="stretch" mb={4}>
            <Box>
              <Text color="text.secondary" fontSize="sm" mb={1}>العنوان</Text>
              <Input value={simTitle} onChange={(e) => setSimTitle(e.target.value)}
                placeholder="أدخل عنوان المحتوى للاختبار..." color="text.primary" />
            </Box>
            <Box>
              <Text color="text.secondary" fontSize="sm" mb={1}>المحتوى</Text>
              <Textarea value={simBody} onChange={(e) => setSimBody(e.target.value)}
                placeholder="أدخل نص المحتوى للاختبار..." color="text.primary" rows={5} />
            </Box>
            <HStack justify="flex-end">
              <Button colorScheme="blue" onClick={runSimulation}
                loading={simLoading} disabled={!simTitle.trim() && !simBody.trim()}>
                تشغيل المحاكاة
              </Button>
            </HStack>
          </VStack>

          {simResult && (
            <Box bg="bg.elevated" p={4} borderRadius="md" borderWidth={1}
              borderColor={simResult.verdict === 'ALLOW' ? 'green.500' : simResult.verdict === 'BLOCK' ? 'red.500' : 'orange.500'}>
              <HStack mb={3} justify="space-between">
                <Badge colorScheme={verdictColor(simResult.verdict)} fontSize="md" px={3} py={1}>
                  {simResult.verdict}
                </Badge>
                <Text color="text.secondary" fontSize="xs">محاكاة — لا تغييرات فعلية</Text>
              </HStack>

              {simResult.matches.length > 0 && (
                <Box mb={3}>
                  <Text color="text.secondary" fontSize="sm" fontWeight="bold" mb={2}>الكلمات المطابقة:</Text>
                  <HStack gap={2} flexWrap="wrap">
                    {simResult.matches.map((m, i) => (
                      <Badge key={i} colorScheme={severityColor(m.severity)}>
                        {m.keyword} ({m.severity})
                      </Badge>
                    ))}
                  </HStack>
                </Box>
              )}

              <Box>
                <Text color="text.secondary" fontSize="sm" fontWeight="bold" mb={2}>الإجراءات:</Text>
                <VStack gap={1} align="stretch">
                  {simResult.actions.map((a, i) => (
                    <Text key={i} color="text.primary" fontSize="sm">• {a}</Text>
                  ))}
                </VStack>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* ═══════ HISTORY TAB ═══════ */}
      {tab === 'history' && (
        <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
          <Heading size="md" color="text.primary" mb={4}>سجل الإصدارات</Heading>

          {versionsLoading ? (
            <Box textAlign="center" color="text.secondary" py={6}>جاري التحميل...</Box>
          ) : versions.length === 0 ? (
            <Text color="text.secondary" fontSize="sm">لا توجد إصدارات سابقة بعد. سيتم إنشاء نسخة احتياطية تلقائياً عند كل تغيير.</Text>
          ) : (
            <VStack gap={3} align="stretch">
              {versions.map((v) => (
                <Box key={v.id} bg="bg.elevated" p={4} borderRadius="md" borderWidth={1} borderColor="border.default">
                  <HStack justify="space-between" mb={2}>
                    <VStack gap={0} align="flex-start">
                      <Text color="text.primary" fontSize="sm" fontWeight="bold">
                        {new Date(v.createdAt).toLocaleString('ar')}
                      </Text>
                      {v.note && <Text color="text.secondary" fontSize="xs">{v.note}</Text>}
                    </VStack>
                    <Button size="sm" colorScheme="orange" variant="outline"
                      onClick={() => restoreVersion(v.id)}
                      loading={restoring === v.id}
                      disabled={restoring !== null}>
                      استعادة
                    </Button>
                  </HStack>
                  <HStack gap={4} flexWrap="wrap">
                    <Text color="text.secondary" fontSize="xs">
                      كلمات محظورة: {v.snapshot?.keywords?.length ?? 0}
                    </Text>
                    <Text color="text.secondary" fontSize="xs">
                      إشراف تلقائي: {v.snapshot?.policy?.enableAutoModeration ? 'مفعّل' : 'معطّل'}
                    </Text>
                    <Text color="text.secondary" fontSize="xs" fontFamily="mono">
                      ID: {v.id.slice(0, 8)}
                    </Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      )}
    </VStack>
  );
}

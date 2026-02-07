/**
 * Safety Service
 *
 * Centralised safety-policy enforcement for content mutations.
 *
 * Responsibilities:
 *  1. Load the active SafetyPolicy (cached for a short TTL).
 *  2. Load active BannedKeywords (cached for a short TTL).
 *  3. Screen title + body text against banned keywords.
 *  4. Return a verdict: PASS | BLOCK | FLAG | HIDE  (with matched details).
 *  5. Auto-hide content when report count reaches the policy threshold.
 *  6. Write audit log entries for every automated action.
 *  7. Support per-content-type + per-report-category auto-hide rules.
 *  8. Provide dry-run simulation (no DB writes).
 */

import { prisma } from '@/core/db/prisma';
import { writeAuditLog } from '@/core/logging/audit';

// ─── Types ──────────────────────────────────────────────────────────

export type SafetyVerdict = 'PASS' | 'BLOCK' | 'FLAG' | 'HIDE';

export interface SafetyCheckResult {
  verdict: SafetyVerdict;
  /** Human-readable reason (safe to return to caller for BLOCK). */
  reason: string | null;
  /** Keywords that matched, grouped by severity. */
  matches: { keyword: string; severity: string }[];
}

/** Simulation result (dry-run) - maps to the API response shape */
export interface SimulationResult {
  verdict: 'ALLOW' | 'FLAG' | 'HIDE' | 'BLOCK';
  matches: { keyword: string; severity: 'low' | 'medium' | 'high' }[];
  actions: string[];
}

/** Auto-hide rule for per-content-type + per-report-category thresholds */
export interface AutoHideRule {
  contentType: string;     // e.g. 'news', 'community', '*' for any
  reportCategory: string;  // e.g. 'SPAM', 'HARASSMENT', '*' for any
  threshold: number;
  action: 'HIDE' | 'FLAG';
}

interface CachedPolicy {
  data: {
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
    autoHideRules: unknown;
  };
  fetchedAt: number;
}

interface CachedKeywords {
  data: { keyword: string; severity: string }[];
  fetchedAt: number;
}

// ─── In-memory cache (short TTL) ───────────────────────────────────

const CACHE_TTL_MS = 30_000; // 30 seconds

let _policyCache: CachedPolicy | null = null;
let _keywordCache: CachedKeywords | null = null;

// ─── Helpers ────────────────────────────────────────────────────────

async function getPolicy(): Promise<CachedPolicy['data']> {
  const now = Date.now();
  if (_policyCache && now - _policyCache.fetchedAt < CACHE_TTL_MS) {
    return _policyCache.data;
  }

  let policy = await prisma.safetyPolicy.findFirst();
  if (!policy) {
    policy = await prisma.safetyPolicy.create({ data: {} });
  }

  _policyCache = { data: policy as CachedPolicy['data'], fetchedAt: now };
  return policy as CachedPolicy['data'];
}

async function getKeywords(): Promise<CachedKeywords['data']> {
  const now = Date.now();
  if (_keywordCache && now - _keywordCache.fetchedAt < CACHE_TTL_MS) {
    return _keywordCache.data;
  }

  const rows = await prisma.bannedKeyword.findMany({
    where: { isActive: true },
    select: { keyword: true, severity: true },
  });

  _keywordCache = { data: rows, fetchedAt: now };
  return rows;
}

/**
 * Parse autoHideRules from the policy JSON
 */
function parseAutoHideRules(raw: unknown): AutoHideRule[] {
  if (!raw || typeof raw !== 'object') return [];
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.rules)) return [];
  return (obj.rules as AutoHideRule[]).filter(
    (r) => r.contentType && r.reportCategory && typeof r.threshold === 'number'
  );
}

/**
 * Normalise text for matching: lowercase, collapse whitespace.
 */
function normalise(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ');
}

// ─── Public API ─────────────────────────────────────────────────────

export const safetyService = {
  /**
   * Screen title + body against the active safety policy.
   *
   * Severity mapping:
   *   high   → BLOCK  (reject outright)
   *   medium → HIDE   (accept but set status = HIDDEN)
   *   low    → FLAG   (accept but mark isFlagged in metadata)
   *
   * If auto-moderation is disabled in the policy the check always returns PASS.
   */
  async checkContent(title: string, body: string): Promise<SafetyCheckResult> {
    const policy = await getPolicy();

    // If auto-moderation is off, skip the check entirely
    if (!policy.enableAutoModeration) {
      return { verdict: 'PASS', reason: null, matches: [] };
    }

    const keywords = await getKeywords();
    if (keywords.length === 0) {
      return { verdict: 'PASS', reason: null, matches: [] };
    }

    const haystack = normalise(`${title} ${body}`);
    const matches: SafetyCheckResult['matches'] = [];

    for (const kw of keywords) {
      if (haystack.includes(normalise(kw.keyword))) {
        matches.push({ keyword: kw.keyword, severity: kw.severity });
      }
    }

    if (matches.length === 0) {
      return { verdict: 'PASS', reason: null, matches: [] };
    }

    // Determine worst severity
    const hasHigh = matches.some((m) => m.severity === 'high');
    const hasMedium = matches.some((m) => m.severity === 'medium');

    if (hasHigh) {
      return {
        verdict: 'BLOCK',
        reason: 'يحتوي المحتوى على كلمات محظورة ولا يمكن نشره',
        matches,
      };
    }
    if (hasMedium) {
      return {
        verdict: 'HIDE',
        reason: 'تم إخفاء المحتوى تلقائياً لمراجعة المشرفين',
        matches,
      };
    }
    // low severity
    return {
      verdict: 'FLAG',
      reason: null,
      matches,
    };
  },

  /**
   * Dry-run simulation: check content against safety policy without writing
   * anything to the DB. Used by the admin Safety Policy Simulator.
   */
  async simulate(title: string, body: string): Promise<SimulationResult> {
    const keywords = await getKeywords();
    const haystack = normalise(`${title} ${body}`);
    const matches: SimulationResult['matches'] = [];

    for (const kw of keywords) {
      if (haystack.includes(normalise(kw.keyword))) {
        matches.push({ keyword: kw.keyword, severity: kw.severity as 'low' | 'medium' | 'high' });
      }
    }

    if (matches.length === 0) {
      return { verdict: 'ALLOW', matches: [], actions: ['Content would be published normally.'] };
    }

    const hasHigh = matches.some((m) => m.severity === 'high');
    const hasMedium = matches.some((m) => m.severity === 'medium');

    const actions: string[] = [];
    let verdict: SimulationResult['verdict'] = 'ALLOW';

    if (hasHigh) {
      verdict = 'BLOCK';
      actions.push('Content would be BLOCKED from publishing.');
      actions.push(`Matched ${matches.filter(m => m.severity === 'high').length} high-severity keyword(s).`);
    } else if (hasMedium) {
      verdict = 'HIDE';
      actions.push('Content would be auto-HIDDEN for moderator review.');
      actions.push(`Matched ${matches.filter(m => m.severity === 'medium').length} medium-severity keyword(s).`);
    } else {
      verdict = 'FLAG';
      actions.push('Content would be FLAGGED for review but still published.');
      actions.push(`Matched ${matches.filter(m => m.severity === 'low').length} low-severity keyword(s).`);
    }

    if (matches.length > 1) {
      actions.push(`Total ${matches.length} keyword matches found.`);
    }

    return { verdict, matches, actions };
  },

  /**
   * Check whether a piece of content should be auto-hidden based on its
   * current report count vs. the safety policy threshold.
   *
   * Now supports per-content-type + per-report-category rules via autoHideRules.
   * Falls back to global autoHideFlagsCount if no specific rule matches.
   *
   * Call this after a new report is created.
   * Returns `true` if the content was auto-hidden.
   */
  async autoHideOnReportThreshold(
    contentId: string,
    reportCategory?: string
  ): Promise<boolean> {
    const policy = await getPolicy();
    if (!policy.enableAutoModeration) return false;

    // Get content type
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      select: { id: true, status: true, type: true, metadata: true },
    });

    if (!content || content.status === 'HIDDEN' || content.status === 'DELETED') {
      return false;
    }

    // Check per-content-type rules first
    const rules = parseAutoHideRules(policy.autoHideRules);
    let threshold = policy.autoHideFlagsCount;
    let matchedAction: 'HIDE' | 'FLAG' = 'HIDE';

    // Find most specific matching rule
    const specificRule = rules.find(
      (r) =>
        (r.contentType === content.type || r.contentType === '*') &&
        (reportCategory ? r.reportCategory === reportCategory || r.reportCategory === '*' : r.reportCategory === '*')
    );

    if (specificRule) {
      threshold = specificRule.threshold;
      matchedAction = specificRule.action;
    }

    const reportCount = await prisma.report.count({
      where: {
        contentId,
        status: { in: ['PENDING', 'REVIEWING'] },
      },
    });

    if (reportCount < threshold) return false;

    if (matchedAction === 'FLAG') {
      // Just flag in metadata, don't hide
      await prisma.content.update({
        where: { id: contentId },
        data: {
          moderationMeta: {
            autoFlagged: true,
            trigger: 'report_threshold',
            reportCount,
            threshold,
            flaggedAt: new Date().toISOString(),
          },
        },
      });
      return false;
    }

    // Threshold reached — auto-hide
    await prisma.content.update({
      where: { id: contentId },
      data: {
        status: 'HIDDEN',
        hiddenReason: `تم الإخفاء تلقائياً: ${reportCount} بلاغ${reportCount > 1 ? 'ات' : ''} تجاوزت الحد (${threshold})`,
        moderationTrigger: 'REPORTS',
        moderationMeta: {
          autoAction: true,
          trigger: 'report_threshold',
          reportCount,
          threshold,
          contentType: content.type,
          reportCategory: reportCategory || '*',
          hiddenAt: new Date().toISOString(),
        },
      },
    });

    // Audit
    await writeAuditLog({
      action: 'CONTENT_HIDDEN',
      actorId: 'SYSTEM',
      actorRole: 'ADMIN',
      targetType: 'CONTENT',
      targetId: contentId,
      metadata: {
        autoAction: true,
        trigger: 'report_threshold',
        reportCount,
        threshold,
        contentType: content.type,
        reportCategory: reportCategory || '*',
      },
    });

    return true;
  },

  /**
   * Create a safety policy version snapshot (transactional).
   * Called after any mutation to policy or keywords.
   */
  async createVersionSnapshot(actorId: string, note?: string): Promise<void> {
    try {
      const [policy, keywords] = await Promise.all([
        prisma.safetyPolicy.findFirst(),
        prisma.bannedKeyword.findMany({
          where: { isActive: true },
          select: { keyword: true, severity: true, reason: true },
        }),
      ]);

      await prisma.safetyPolicyVersion.create({
        data: {
          snapshot: JSON.parse(JSON.stringify({ policy, keywords })),
          actorId,
          note: note || null,
        },
      });
    } catch (error) {
      console.error('[SAFETY VERSION ERROR]', error instanceof Error ? error.message : 'Unknown');
    }
  },

  /** Invalidate caches — useful after admin updates the policy or keywords. */
  invalidateCache() {
    _policyCache = null;
    _keywordCache = null;
  },
};

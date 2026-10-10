import fs from 'fs';
import path from 'path';

export interface UserUsage {
  clientId: string;
  count: number;
  limit: number;
  resetDate: string; // YYYY-MM-DD
  lastRequestTime: number;
}

const DAILY_LIMIT = parseInt(process.env.DAILY_MESSAGE_LIMIT || '50', 10);
const QUOTA_FILE = path.resolve(process.cwd(), '.cypher_quota_store.json');

// In-memory quota store backed by local disk
const quotaStore = new Map<string, UserUsage>();

// Initialize from disk if available
try {
  if (fs.existsSync(QUOTA_FILE)) {
    const raw = fs.readFileSync(QUOTA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    for (const [k, v] of Object.entries(parsed)) {
      quotaStore.set(k, v as UserUsage);
    }
  }
} catch (err) {
  console.warn('Failed to load quota file, starting fresh:', err);
}

function persistQuotaStore(): void {
  try {
    const obj: Record<string, UserUsage> = {};
    for (const [k, v] of quotaStore.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(QUOTA_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    // Non-fatal, fallback to memory
  }
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getMidnightResetTimestamp(): number {
  const tomorrow = new Date();
  tomorrow.setUTCHours(24, 0, 0, 0);
  return tomorrow.getTime();
}

export function getUserQuota(clientId: string): {
  count: number;
  limit: number;
  remaining: number;
  resetsAt: number;
  isAllowed: boolean;
} {
  const today = getTodayString();
  let usage = quotaStore.get(clientId);

  if (!usage || usage.resetDate !== today) {
    usage = {
      clientId,
      count: 0,
      limit: DAILY_LIMIT,
      resetDate: today,
      lastRequestTime: Date.now(),
    };
    quotaStore.set(clientId, usage);
    persistQuotaStore();
  }

  const remaining = Math.max(0, usage.limit - usage.count);
  const resetsAt = getMidnightResetTimestamp();

  return {
    count: usage.count,
    limit: usage.limit,
    remaining,
    resetsAt,
    isAllowed: usage.count < usage.limit,
  };
}

export function incrementUserUsage(clientId: string): {
  count: number;
  remaining: number;
  limit: number;
  resetsAt: number;
} {
  const info = getUserQuota(clientId);
  const usage = quotaStore.get(clientId)!;
  usage.count += 1;
  usage.lastRequestTime = Date.now();
  quotaStore.set(clientId, usage);
  persistQuotaStore();

  return {
    count: usage.count,
    remaining: Math.max(0, usage.limit - usage.count),
    limit: usage.limit,
    resetsAt: info.resetsAt,
  };
}

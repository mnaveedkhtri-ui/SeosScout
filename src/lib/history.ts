"use client";

import type { AuditResult } from "@/types/audit";

const KEY = "sitescout-audit-history";
const MAX_ENTRIES = 25;

export interface HistoryEntry {
  id: string;
  url: string;
  overallScore: number;
  fetchedAt: string;
  criticalCount: number;
  warningCount: number;
  result: AuditResult;
}

export function saveAuditToHistory(result: AuditResult): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getHistory();
    const criticalCount = result.recommendations.filter((r) => r.severity === "critical").length;
    const warningCount = result.recommendations.filter((r) => r.severity === "warning").length;

    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url: result.url,
      overallScore: result.overallScore,
      fetchedAt: result.fetchedAt,
      criticalCount,
      warningCount,
      result,
    };

    const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // localStorage full or unavailable — fail silently, history is a bonus feature
  }
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function deleteHistoryEntry(id: string): void {
  if (typeof window === "undefined") return;
  const updated = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

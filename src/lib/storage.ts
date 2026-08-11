/**
 * 답변을 브라우저에 넣고 뺀다. PRD 11-6 저장 구조.
 *
 * 답하는 도중에도 저장되어야 하므로 q2·track은 아직 비어 있을 수 있다.
 */

import { Audience, FollowUpId, STORAGE_KEY, Track } from "@/data/questions";

export type DraftState = {
  q1: string;
  q2: Audience | null;
  track: Track | null;
  answers: Partial<Record<FollowUpId, string>>;
  updatedAt: number;
};

export const emptyDraft: DraftState = {
  q1: "",
  q2: null,
  track: null,
  answers: {},
  updatedAt: 0,
};

function readAudience(value: unknown): Audience | null {
  return value === "self" || value === "team" || value === "guest"
    ? value
    : null;
}

function readTrack(value: unknown): Track | null {
  return value === "A" || value === "B" || value === "C" ? value : null;
}

function parse(raw: string | null): DraftState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DraftState>;
    return {
      q1: typeof parsed.q1 === "string" ? parsed.q1 : "",
      q2: readAudience(parsed.q2),
      track: readTrack(parsed.track),
      answers:
        parsed.answers && typeof parsed.answers === "object"
          ? parsed.answers
          : {},
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : 0,
    };
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cached: DraftState | null = null;

export function subscribeDraft(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 브라우저에서 그려지기 시작했는지만 알아낼 때 쓴다. */
export function subscribeNever(): () => void {
  return () => {};
}

export function getDraftSnapshot(): DraftState | null {
  if (typeof window === "undefined") return null;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parse(raw);
  }
  return cached;
}

export function getServerDraftSnapshot(): DraftState | null {
  return null;
}

export function saveDraft(draft: Omit<DraftState, "updatedAt">): void {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify({ ...draft, updatedAt: Date.now() });
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    return;
  }
  cachedRaw = raw;
  cached = parse(raw);
  listeners.forEach((listener) => listener());
}

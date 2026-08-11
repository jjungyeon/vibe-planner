/**
 * 답변을 브라우저에 넣고 뺀다.
 *
 * 질문 경로는 PRD 11-6 저장 구조를 쓴다.
 * 답하는 도중에도 저장되어야 하므로 q2·track은 아직 비어 있을 수 있다.
 *
 * 빠른 입력 경로의 줄글은 PRD에 저장 구조가 없어 키를 따로 둔다.
 */

import { Audience, FollowUpId, STORAGE_KEY, Track } from "@/data/questions";

export type DraftState = {
  q1: string;
  q2: Audience | null;
  track: Track | null;
  answers: Partial<Record<FollowUpId, string>>;
  updatedAt: number;
};

export type QuickState = {
  text: string;
  exclusions: string;
  updatedAt: number;
};

export const QUICK_STORAGE_KEY = "vibe-free-draft";

export const emptyDraft: DraftState = {
  q1: "",
  q2: null,
  track: null,
  answers: {},
  updatedAt: 0,
};

export const emptyQuick: QuickState = {
  text: "",
  exclusions: "",
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

function parseDraft(raw: string | null): DraftState | null {
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

function parseQuick(raw: string | null): QuickState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<QuickState>;
    return {
      text: typeof parsed.text === "string" ? parsed.text : "",
      exclusions:
        typeof parsed.exclusions === "string" ? parsed.exclusions : "",
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : 0,
    };
  } catch {
    return null;
  }
}

function createStore<T extends { updatedAt: number }>(
  key: string,
  parse: (raw: string | null) => T | null,
) {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null = null;
  let cached: T | null = null;

  return {
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot(): T | null {
      if (typeof window === "undefined") return null;
      let raw: string | null = null;
      try {
        raw = window.localStorage.getItem(key);
      } catch {
        raw = null;
      }
      if (raw !== cachedRaw) {
        cachedRaw = raw;
        cached = parse(raw);
      }
      return cached;
    },
    getServerSnapshot(): T | null {
      return null;
    },
    save(value: Omit<T, "updatedAt">): void {
      if (typeof window === "undefined") return;
      const raw = JSON.stringify({ ...value, updatedAt: Date.now() });
      try {
        window.localStorage.setItem(key, raw);
      } catch {
        return;
      }
      cachedRaw = raw;
      cached = parse(raw);
      listeners.forEach((listener) => listener());
    },
  };
}

const draftStore = createStore<DraftState>(STORAGE_KEY, parseDraft);
const quickStore = createStore<QuickState>(QUICK_STORAGE_KEY, parseQuick);

/** 브라우저에서 그려지기 시작했는지만 알아낼 때 쓴다. */
export function subscribeNever(): () => void {
  return () => {};
}

export const subscribeDraft = draftStore.subscribe;
export const getDraftSnapshot = draftStore.getSnapshot;
export const getServerDraftSnapshot = draftStore.getServerSnapshot;

export function saveDraft(draft: Omit<DraftState, "updatedAt">): void {
  draftStore.save(draft);
}

export const subscribeQuick = quickStore.subscribe;
export const getQuickSnapshot = quickStore.getSnapshot;
export const getServerQuickSnapshot = quickStore.getServerSnapshot;

export function saveQuick(draft: Omit<QuickState, "updatedAt">): void {
  quickStore.save(draft);
}

/** 답한 것이 하나라도 있는지 */
export function hasAnyAnswer(draft: DraftState | null): boolean {
  if (!draft) return false;
  return (
    draft.q1.trim().length > 0 ||
    draft.q2 !== null ||
    draft.track !== null ||
    Object.keys(draft.answers).length > 0
  );
}

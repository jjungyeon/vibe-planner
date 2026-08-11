/**
 * 질문 순서만 다룬다. 답을 화면으로 바꾸는 판정은 planner.ts에 있다.
 */

import { FollowUpId, Track, followUpsFor } from "@/data/questions";
import { DraftState } from "@/lib/storage";

export type StepId = "Q1" | "Q2" | "Q3" | FollowUpId;

/** 종류를 고르기 전에는 가장 긴 갈래 기준으로 보여준다. */
const MAX_TOTAL = 7;

/** 공통 질문 다음에 종류별 후속 질문이 붙는다. */
export function stepIds(track: Track | null): StepId[] {
  const common: StepId[] = ["Q1", "Q2", "Q3"];
  if (!track) return common;
  return [...common, ...followUpsFor(track).map((question) => question.id)];
}

export function totalSteps(track: Track | null): number {
  return track ? stepIds(track).length : MAX_TOTAL;
}

export function isCommon(id: StepId): id is "Q1" | "Q2" | "Q3" {
  return id === "Q1" || id === "Q2" || id === "Q3";
}

/** 새로고침 후 돌아왔을 때 멈춰 있던 자리 */
export function resumeStep(draft: DraftState): number {
  const ids = stepIds(draft.track);
  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i];
    if (id === "Q1") {
      if (!draft.q1.trim()) return i;
      continue;
    }
    if (id === "Q2") {
      if (draft.q2 === null) return i;
      continue;
    }
    if (id === "Q3") {
      if (draft.track === null) return i;
      continue;
    }
    if (draft.answers[id] === undefined) return i;
  }
  return Math.max(0, ids.length - 1);
}

"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  Audience,
  FollowUpId,
  Track,
  UNKNOWN,
  followUpById,
  q1 as Q1,
  q2 as Q2,
  q3 as Q3,
} from "@/data/questions";
import { isCommon, resumeStep, stepIds, totalSteps } from "@/lib/flow";
import {
  DraftState,
  emptyDraft,
  getDraftSnapshot,
  getServerDraftSnapshot,
  saveDraft,
  subscribeDraft,
  subscribeNever,
} from "@/lib/storage";
import { ChoiceList, ChoiceOption } from "@/components/ChoiceList";
import { Progress } from "@/components/Progress";

export default function QuestionsPage() {
  const router = useRouter();

  const inBrowser = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const stored = useSyncExternalStore(
    subscribeDraft,
    getDraftSnapshot,
    getServerDraftSnapshot,
  );
  /** 뒤로 가기·다음으로 옮긴 자리. -1이면 저장된 답에서 이어간다. */
  const [moved, setMoved] = useState(-1);

  if (!inBrowser) return null;

  const draft = stored ?? emptyDraft;
  const steps = stepIds(draft.track);
  const index = Math.min(
    moved < 0 ? resumeStep(draft) : moved,
    steps.length - 1,
  );
  const currentId = steps[index];
  const total = totalSteps(draft.track);
  const followUp = isCommon(currentId) ? null : followUpById[currentId];

  function update(next: Partial<Omit<DraftState, "updatedAt">>) {
    saveDraft({
      q1: draft.q1,
      q2: draft.q2,
      track: draft.track,
      answers: draft.answers,
      ...next,
    });
  }

  /** 종류를 바꾸면 그 뒤에 답한 것은 버린다. */
  function chooseTrack(value: string) {
    const picked = value as Track;
    update({
      track: picked,
      answers:
        draft.track !== null && draft.track !== picked ? {} : draft.answers,
    });
  }

  const answered =
    currentId === "Q1"
      ? draft.q1.trim().length > 0
      : currentId === "Q2"
        ? draft.q2 !== null
        : currentId === "Q3"
          ? draft.track !== null
          : draft.answers[currentId] !== undefined;

  const isLast = draft.track !== null && index === steps.length - 1;

  function goNext() {
    if (!answered) return;
    if (isLast) {
      router.push("/result");
      return;
    }
    setMoved(index + 1);
  }

  const heading = followUp
    ? followUp.question
    : currentId === "Q1"
      ? Q1.question
      : currentId === "Q2"
        ? Q2.question
        : Q3.question;

  const prdItem = followUp
    ? followUp.prdItem
    : currentId === "Q1"
      ? Q1.prdItem
      : currentId === "Q2"
        ? Q2.prdItem
        : Q3.prdItem;

  const note = followUp
    ? followUp.note
    : currentId === "Q1"
      ? Q1.note
      : currentId === "Q2"
        ? Q2.note
        : Q3.note;

  let options: ChoiceOption[] = [];
  let selected: string | null = null;
  let onSelect: (value: string) => void = () => {};

  if (currentId === "Q2") {
    options = Q2.choices.map((choice) => ({
      value: choice.value,
      label: choice.label,
    }));
    selected = draft.q2;
    onSelect = (value) => update({ q2: value as Audience });
  } else if (currentId === "Q3") {
    options = Q3.choices.map((choice) => ({
      value: choice.value,
      label: choice.label,
      detail: choice.detail,
      icon: choice.icon,
    }));
    selected = draft.track;
    onSelect = chooseTrack;
  } else if (followUp) {
    const id: FollowUpId = followUp.id;
    options = [
      ...followUp.choices.map((choice) => ({
        value: choice.value,
        label: choice.label,
      })),
      { value: UNKNOWN, label: "잘 모르겠어요" },
    ];
    selected = draft.answers[id] ?? null;
    onSelect = (value) => update({ answers: { ...draft.answers, [id]: value } });
  }

  return (
    <main className="mx-auto w-full max-w-[640px] px-6 py-16">
      <Progress current={index + 1} total={total} />

      {index === 3 && draft.track !== null ? (
        <p className="mt-4 rounded-box bg-surface px-5 py-3 text-small text-muted">
          고르신 종류는 질문이 {total}개입니다.
        </p>
      ) : null}

      <h1 className="mt-6 text-title font-semibold">{heading}</h1>
      <p className="mt-2 text-small text-muted">
        기획서의 ‘{prdItem}’ 항목 — {note}
      </p>

      <div className="mt-6">
        {currentId === "Q1" ? (
          <input
            type="text"
            value={draft.q1}
            onChange={(event) => update({ q1: event.target.value })}
            placeholder="예) 하루 지출 기록"
            className="h-11 w-full rounded-box border border-line px-5 text-body outline-none focus:border-accent"
          />
        ) : (
          <ChoiceList
            options={options}
            selected={selected}
            onSelect={onSelect}
          />
        )}
      </div>

      <div className="mt-6 flex gap-4">
        {index > 0 ? (
          <button
            type="button"
            onClick={() => setMoved(index - 1)}
            className="h-11 rounded-box border border-line bg-bg px-5 font-semibold text-text"
          >
            뒤로
          </button>
        ) : null}
        <button
          type="button"
          onClick={goNext}
          disabled={!answered}
          className={`h-11 rounded-box px-5 font-semibold ${
            answered
              ? "bg-accent text-white"
              : "border border-line bg-surface text-muted"
          }`}
        >
          {isLast ? "결과 보기" : "다음"}
        </button>
      </div>
    </main>
  );
}

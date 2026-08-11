"use client";

import { Suspense, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AUDIENCE_LABEL, Answers, followUpsFor } from "@/data/questions";
import { presets } from "@/data/presets";
import { plan } from "@/lib/planner";
import { buildPrompt } from "@/lib/buildPrompt";
import {
  getDraftSnapshot,
  getServerDraftSnapshot,
  hasAnyAnswer,
  saveDraft,
  subscribeDraft,
  subscribeNever,
} from "@/lib/storage";
import { CopyButton } from "@/components/CopyButton";

export default function ResultPage() {
  return (
    <Suspense fallback={null}>
      <ResultView />
    </Suspense>
  );
}

function ResultView() {
  const router = useRouter();
  const params = useSearchParams();

  const inBrowser = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const draft = useSyncExternalStore(
    subscribeDraft,
    getDraftSnapshot,
    getServerDraftSnapshot,
  );
  const [asking, setAsking] = useState(false);

  if (!inBrowser) return null;

  const exampleId = params.get("example");
  const preset = exampleId
    ? (presets.find((item) => item.id === exampleId) ?? null)
    : null;

  const source: Partial<Answers> = preset
    ? preset.answers
    : {
        q1: draft?.q1,
        q2: draft?.q2 ?? undefined,
        track: draft?.track ?? undefined,
        answers: draft?.answers,
      };

  const subject = source.q1?.trim() ?? "";
  const audience = source.q2 ?? null;
  const track = source.track ?? null;
  const given = source.answers ?? {};

  const complete =
    subject.length > 0 &&
    audience !== null &&
    track !== null &&
    followUpsFor(track).every((question) => given[question.id] !== undefined);

  if (!complete || audience === null || track === null) {
    return (
      <main className="mx-auto w-full max-w-[720px] px-6 py-16">
        <h1 className="text-title font-semibold">
          아직 답하지 않은 질문이 있습니다
        </h1>
        <p className="mt-4 text-muted">
          질문에 모두 답하면 만들 화면이 나옵니다.
        </p>
        <Link
          href="/questions"
          className="mt-6 inline-flex h-11 items-center rounded-box bg-accent px-5 font-semibold text-white"
        >
          질문으로 가기
        </Link>
      </main>
    );
  }

  const input: Answers = { q1: subject, q2: audience, track, answers: given };
  const result = plan(input);
  const prompt = buildPrompt(input, result);

  function applyPreset() {
    if (!preset) return;
    saveDraft({
      q1: preset.answers.q1,
      q2: preset.answers.q2,
      track: preset.answers.track,
      answers: preset.answers.answers,
    });
    router.push("/questions?start=first");
  }

  function switchToMine() {
    if (hasAnyAnswer(draft)) {
      setAsking(true);
      return;
    }
    applyPreset();
  }

  return (
    <main className="mx-auto w-full max-w-[720px] px-6 py-16">
      <h1 className="text-title font-semibold">만들 화면이 정해졌습니다</h1>
      <p className="mt-2 text-muted">
        {subject} — 쓰는 사람: {AUDIENCE_LABEL[audience]}
      </p>

      {preset ? (
        <div className="mt-6">
          {asking ? (
            <div className="rounded-box border border-line bg-surface p-6">
              <p>지금 답한 내용이 지워집니다. 계속할까요?</p>
              <div className="mt-4 flex gap-4">
                <button
                  type="button"
                  onClick={applyPreset}
                  className="h-11 rounded-box border border-line bg-bg px-5 font-semibold text-text"
                >
                  계속하기
                </button>
                <button
                  type="button"
                  onClick={() => setAsking(false)}
                  className="h-11 rounded-box border border-line bg-bg px-5 font-semibold text-text"
                >
                  그만두기
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={switchToMine}
              className="h-11 rounded-box border border-line bg-bg px-5 font-semibold text-text"
            >
              내 걸로 바꾸기
            </button>
          )}
        </div>
      ) : null}

      <section className="mt-16">
        <h2 className="text-section font-semibold">만들 화면</h2>
        <ol className="mt-4 flex flex-col gap-4">
          {result.screens.map((screen, order) => (
            <li
              key={screen.id}
              className="rounded-box border border-line bg-surface p-6"
            >
              <p className="font-semibold">
                {order + 1}. {screen.name}
              </p>
              <p className="mt-2 text-small text-muted">
                들어갈 것 —{" "}
                {screen.includes.length
                  ? screen.includes.join(", ")
                  : "따로 없음"}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16">
        <h2 className="text-section font-semibold">화면 사이 이동</h2>
        {result.links.length ? (
          <ul className="mt-4 flex flex-col gap-4">
            {result.links.map((link) => (
              <li key={link.text}>{link.text}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-muted">
            만들 화면이 하나뿐이라 이동이 없습니다.
          </p>
        )}
      </section>

      {result.defaultsUsed.length ? (
        <section className="mt-16">
          <h2 className="text-section font-semibold">기본값으로 정해진 것</h2>
          <p className="mt-2 text-small text-muted">
            답하지 않은 것은 아래대로 정했습니다.
          </p>
          <ul className="mt-4 flex flex-col gap-4">
            {result.defaultsUsed.map((item) => (
              <li key={item.id}>
                {item.question} → {item.applied}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-16">
        <h2 className="text-section font-semibold">개발 프롬프트</h2>
        <p className="mt-2 text-small text-muted">
          아래 글을 복사해 바이브코딩 도구에 붙여넣으세요.
        </p>
        <pre className="mt-4 rounded-box border border-line bg-surface p-6 font-sans text-small break-words whitespace-pre-wrap">
          {prompt}
        </pre>
        <div className="mt-6">
          <CopyButton text={prompt} />
        </div>
      </section>
    </main>
  );
}

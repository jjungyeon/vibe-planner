"use client";

import { useState, useSyncExternalStore } from "react";
import { buildFreePrompt } from "@/lib/buildFreePrompt";
import {
  emptyQuick,
  getQuickSnapshot,
  getServerQuickSnapshot,
  saveQuick,
  subscribeNever,
  subscribeQuick,
} from "@/lib/storage";
import { CopyButton } from "@/components/CopyButton";

const HINTS = [
  "무엇을 다루는가",
  "누가 쓰는가",
  "무엇은 안 만들 것인가",
];

/** PRD 11-5 입력 보조 기준 */
const ENOUGH = 30;

export default function QuickPage() {
  const inBrowser = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const stored = useSyncExternalStore(
    subscribeQuick,
    getQuickSnapshot,
    getServerQuickSnapshot,
  );
  const [shown, setShown] = useState(false);

  if (!inBrowser) return null;

  const quick = stored ?? emptyQuick;
  const canGenerate = quick.text.length > 0;
  const prompt = buildFreePrompt(quick.text, quick.exclusions);

  return (
    <main className="mx-auto w-full max-w-[720px] px-6 py-16">
      <h1 className="text-title font-semibold">
        만들려는 것을 자유롭게 적어주세요
      </h1>
      <p className="mt-2 text-muted">
        적은 글은 고치지 않고 그대로 프롬프트에 들어갑니다.
      </p>

      <div className="mt-6 rounded-box bg-surface px-5 py-3">
        <ul className="flex flex-col gap-2 text-small text-muted">
          {HINTS.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      </div>

      <textarea
        value={quick.text}
        onChange={(event) =>
          saveQuick({ text: event.target.value, exclusions: quick.exclusions })
        }
        placeholder="예) 우리 동네 러닝 모임에서 누가 언제 나왔는지 적어두는 웹앱"
        className="mt-4 min-h-[200px] w-full rounded-box border border-line px-5 py-3 text-body outline-none focus:border-accent"
      />

      {quick.text.length < ENOUGH ? (
        <p className="mt-2 text-small text-muted">
          조금 더 자세히 적으면 결과가 좋아집니다.
        </p>
      ) : null}

      <div className="mt-6">
        <label htmlFor="exclusions" className="text-small text-muted">
          안 만들 것이 있다면 적어주세요 (선택)
        </label>
        <input
          id="exclusions"
          type="text"
          value={quick.exclusions}
          onChange={(event) =>
            saveQuick({ text: quick.text, exclusions: event.target.value })
          }
          placeholder="예) 로그인, 결제"
          className="mt-2 h-11 w-full rounded-box border border-line px-5 text-body outline-none focus:border-accent"
        />
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShown(true)}
          disabled={!canGenerate}
          className={`h-11 rounded-box px-5 font-semibold ${
            !canGenerate
              ? "border border-line bg-surface text-muted"
              : shown
                ? "border border-line bg-bg text-text"
                : "bg-accent text-white"
          }`}
        >
          만들기
        </button>
      </div>

      {shown && canGenerate ? (
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
      ) : null}
    </main>
  );
}

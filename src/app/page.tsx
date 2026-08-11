"use client";

import { useState } from "react";
import Link from "next/link";
import { ExampleCards } from "@/components/ExampleCards";

export default function HomePage() {
  const [showExamples, setShowExamples] = useState(false);

  return (
    <main className="mx-auto w-full max-w-[720px] px-6 py-16">
      <h1 className="text-title font-semibold">무엇을 만들지 정하기</h1>
      <p className="mt-4 text-muted">
        질문에 답하면 만들 화면과 개발 프롬프트가 나옵니다.
      </p>

      <div className="mt-16 flex flex-col gap-4">
        <Link
          href="/questions"
          className="inline-flex h-11 items-center justify-center rounded-box bg-accent px-5 font-semibold text-white"
        >
          만들고 싶은 게 있어요
        </Link>
        <Link
          href="/quick"
          className="inline-flex h-11 items-center justify-center rounded-box border border-line bg-bg px-5 font-semibold text-text"
        >
          이미 정해졌어요, 바로 쓸게요
        </Link>
        <button
          type="button"
          onClick={() => setShowExamples(!showExamples)}
          aria-expanded={showExamples}
          className="h-11 rounded-box border border-line bg-bg px-5 font-semibold text-text"
        >
          예시부터 볼래요
        </button>
      </div>

      {showExamples ? (
        <div className="mt-6">
          <p className="text-small text-muted">
            누르면 그 예시의 결과를 바로 볼 수 있습니다.
          </p>
          <div className="mt-4">
            <ExampleCards />
          </div>
        </div>
      ) : null}

      <p className="mt-16 border-t border-line pt-6 text-small text-muted">
        게임, 실시간 채팅, 지도, 파일 올리기는 다루지 않습니다.
      </p>
    </main>
  );
}

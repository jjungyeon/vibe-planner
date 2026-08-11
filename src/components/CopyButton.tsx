"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
    } catch {
      setDone(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={copy}
        className="h-11 rounded-box bg-accent px-5 font-semibold text-white"
      >
        전체 복사
      </button>
      {done ? (
        <span className="text-small text-muted">복사했습니다.</span>
      ) : null}
    </div>
  );
}

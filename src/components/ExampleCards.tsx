import Link from "next/link";
import { presets } from "@/data/presets";

export function ExampleCards() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {presets.map((preset) => (
        <Link
          key={preset.id}
          href={`/result?example=${preset.id}`}
          className="flex min-h-11 items-center rounded-box border border-line bg-surface px-5 py-3"
        >
          {preset.answers.q1}
        </Link>
      ))}
    </div>
  );
}

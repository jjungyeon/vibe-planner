export function Progress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const filled = Math.min(100, Math.round((current / total) * 100));

  return (
    <div>
      <p className="text-small font-semibold text-accent">
        {current} / {total}
      </p>
      <div className="mt-2 h-[2px] w-full bg-line">
        <div className="h-[2px] bg-accent" style={{ width: `${filled}%` }} />
      </div>
    </div>
  );
}

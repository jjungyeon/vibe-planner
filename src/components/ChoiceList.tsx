export type ChoiceOption = {
  value: string;
  label: string;
  detail?: string;
  icon?: string;
};

export function ChoiceList({
  options,
  selected,
  onSelect,
}: {
  options: ChoiceOption[];
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {options.map((option) => {
        const chosen = option.value === selected;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            aria-pressed={chosen}
            className={`min-h-11 w-full rounded-box border px-5 py-3 text-left ${
              chosen
                ? "border-accent font-semibold text-accent"
                : "border-line text-text"
            }`}
          >
            <span>
              {option.icon ? `${option.icon} ` : ""}
              {option.label}
            </span>
            {option.detail ? (
              <span className="block text-small text-muted">
                {option.detail}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

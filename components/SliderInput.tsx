"use client";

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  suffix?: string;
  hint?: string;
}

/**
 * Kombinerad slider + sifferfält för inmatning av kronbelopp.
 */
export default function SliderInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = "kr/mån",
  hint,
}: SliderInputProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
            }}
            className="w-28 rounded border border-gray-300 px-2 py-0.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-500">{suffix}</span>
        </div>
      </div>
      <div className="relative h-2 rounded-full bg-gray-200">
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-blue-500"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-2 w-full cursor-pointer opacity-0"
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{(min / 1000).toFixed(0)}k</span>
        <span>{(max / 1000).toFixed(0)}k</span>
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

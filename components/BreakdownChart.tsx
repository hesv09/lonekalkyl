"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatKr } from "@/lib/taxCalculations";
import { COLORS } from "./ResultCard";

interface BreakdownData {
  name: string;
  netSalary: number;
  incomeTax: number;
  employersFee: number;
  otherCosts: number;
  pension: number;
  corporateTax: number;
  dividend: number;
}

interface BreakdownChartProps {
  data: BreakdownData[];
}

const LEGEND_LABELS: Record<string, string> = {
  netSalary: "Nettolön",
  incomeTax: "Skatt på lön",
  employersFee: "Arbetsgivaravgift",
  otherCosts: "Övriga kostnader",
  pension: "Pension",
  corporateTax: "Bolagsskatt",
  dividend: "Möjlig utdelning",
};

/** Anpassad tooltip för Recharts */
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex justify-between gap-4">
          <span className="text-gray-600">{LEGEND_LABELS[entry.name] ?? entry.name}</span>
          <span className="font-medium">{formatKr(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

/** Anpassad legend */
function CustomLegend() {
  return (
    <div className="flex flex-wrap gap-3 justify-center mt-2">
      {Object.entries(LEGEND_LABELS).map(([key, label]) => (
        <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
          <span
            className="inline-block h-3 w-3 rounded-sm flex-shrink-0"
            style={{ backgroundColor: COLORS[key as keyof typeof COLORS] }}
          />
          {label}
        </div>
      ))}
    </div>
  );
}

/**
 * Staplat stapeldiagram som visar hur fakturerat belopp
 * fördelas på nettolön, skatter, kostnader och utdelning.
 */
export default function BreakdownChart({ data }: BreakdownChartProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-800">
        Fördelning av fakturerat belopp
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="netSalary" stackId="a" fill={COLORS.netSalary} name="netSalary" />
          <Bar dataKey="incomeTax" stackId="a" fill={COLORS.incomeTax} name="incomeTax" />
          <Bar dataKey="employersFee" stackId="a" fill={COLORS.employersFee} name="employersFee" />
          <Bar dataKey="otherCosts" stackId="a" fill={COLORS.otherCosts} name="otherCosts" />
          <Bar dataKey="pension" stackId="a" fill={COLORS.pension} name="pension" />
          <Bar dataKey="corporateTax" stackId="a" fill={COLORS.corporateTax} name="corporateTax" />
          <Bar dataKey="dividend" stackId="a" fill={COLORS.dividend} name="dividend" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <CustomLegend />
    </div>
  );
}

export type { BreakdownData };

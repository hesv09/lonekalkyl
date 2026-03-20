"use client";

import { useState, useMemo } from "react";
import {
  calculate,
  formatKr,
  type CalculatorInputs,
} from "@/lib/taxCalculations";
import ResultCard from "./ResultCard";
import BreakdownChart, { type BreakdownData } from "./BreakdownChart";
import YearlySummary from "./YearlySummary";

/** Tre fördefinierade lönenivåer för jämförelsevy */
const COMPARISON_SALARIES = [
  { name: "Låg lön", salary: 35_000 },
  { name: "Mellanlön", salary: 55_000 },
  { name: "Hög lön", salary: 75_000 },
];

// ── Kompakt nummerinput ────────────────────────────────────────────────────

interface NumInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}

function NumInput({ label, value, onChange, hint }: NumInputProps) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <label className="text-xs font-medium text-gray-500 whitespace-nowrap">{label}</label>
      <div className="flex items-center rounded-lg border border-gray-300 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        <input
          type="number"
          value={value}
          min={0}
          step={500}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v) && v >= 0) onChange(v);
          }}
          className="w-full min-w-0 rounded-lg bg-transparent px-3 py-2 text-sm tabular-nums text-gray-900 focus:outline-none"
        />
        <span className="pr-3 text-xs text-gray-400 flex-shrink-0">kr</span>
      </div>
      {hint && <p className="text-xs text-gray-400 leading-tight">{hint}</p>}
    </div>
  );
}

// ── KPI-kort ───────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number;
  sub?: string;
  accent?: "green" | "blue" | "amber" | "default";
  large?: boolean;
}

function KpiCard({ label, value, sub, accent = "default", large }: KpiCardProps) {
  const accentClass =
    accent === "green" ? "text-green-700" :
    accent === "blue"  ? "text-blue-700"  :
    accent === "amber" ? "text-amber-600" :
    "text-gray-900";

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
      <span className="text-xs text-gray-500 mb-1">{label}</span>
      <span className={`${large ? "text-3xl" : "text-2xl"} font-bold tabular-nums ${accentClass}`}>
        {formatKr(value)}
      </span>
      {sub && <span className="text-xs text-gray-400 mt-1">{sub}</span>}
    </div>
  );
}

// ── Huvudkomponent ─────────────────────────────────────────────────────────

/**
 * Lönekalkylator för konsult med eget bolag.
 * All state hanteras lokalt – inga externa databaser.
 */
export default function Calculator() {
  const [invoicedAmount, setInvoicedAmount] = useState(100_000);
  const [grossSalary, setGrossSalary]       = useState(50_000);
  const [otherCosts, setOtherCosts]         = useState(5_000);
  const [pensionContribution, setPension]   = useState(3_000);
  const [showComparison, setShowComparison] = useState(false);

  const inputs: CalculatorInputs = {
    invoicedAmount,
    grossSalary,
    otherCosts,
    pensionContribution,
  };

  const result      = useMemo(() => calculate(inputs), [inputs]);
  const chartData: BreakdownData[] = useMemo(() => [{ name: "Din mix", ...result.breakdown }], [result]);

  const comparisonData: BreakdownData[] = useMemo(
    () => COMPARISON_SALARIES.map(({ name, salary }) => {
      const r = calculate({ ...inputs, grossSalary: salary });
      return { name, ...r.breakdown };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [invoicedAmount, otherCosts, pensionContribution],
  );

  const effectiveTaxRate = grossSalary > 0
    ? (result.incomeTax / grossSalary * 100).toFixed(1)
    : "0";

  const totalDisposable = Math.max(0, result.netSalary) + Math.max(0, result.possibleDividend);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6">

      {/* ── Header ── */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Lönekalkylator för konsult</h1>
        <p className="mt-1 text-sm text-gray-500">
          Simulera hur ditt fakturerade belopp fördelas. Skatteberäkningar per{" "}
          <span className="font-medium text-gray-700">Skatteverkets tabell 32, Stockholm 2026</span>{" "}
          (SKVFS 2025:20).
        </p>
      </div>

      {/* ── Kompakt inputpanel ── */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Förutsättningar</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <NumInput
            label="Fakturerat belopp"
            value={invoicedAmount}
            onChange={setInvoicedAmount}
            hint="exkl. moms / mån"
          />
          <NumInput
            label="Bruttolön att ta ut"
            value={grossSalary}
            onChange={setGrossSalary}
            hint="lön före skatt / mån"
          />
          <NumInput
            label="Övriga bolagskostnader"
            value={otherCosts}
            onChange={setOtherCosts}
            hint="hyra, abonnemang etc."
          />
          <NumInput
            label="Pensionsavsättning"
            value={pensionContribution}
            onChange={setPension}
            hint="via bolaget / mån"
          />
        </div>
      </div>

      {/* ── Stora KPI-kort ── */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          label="Nettolön / månad"
          value={Math.max(0, result.netSalary)}
          sub="utbetald efter skatt"
          accent="green"
          large
        />
        <KpiCard
          label="Skatt på lön"
          value={result.incomeTax}
          sub={`${effectiveTaxRate}% effektiv skattesats`}
          accent="amber"
        />
        <KpiCard
          label="Möjlig utdelning"
          value={Math.max(0, result.possibleDividend)}
          sub="efter bolagsskatt"
          accent="blue"
        />
        <KpiCard
          label="Totalt disponibelt"
          value={totalDisposable}
          sub="nettolön + utdelning / mån"
          accent="green"
          large
        />
      </div>

      {/* ── Huvud: Resultatkort + Diagram ── */}
      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Resultatkort – nu till vänster och bredare */}
        <div className="flex flex-col gap-4">
          <ResultCard
            invoicedAmount={invoicedAmount}
            netSalary={result.netSalary}
            incomeTax={result.incomeTax}
            employersFee={result.employersFee}
            grossSalary={grossSalary}
            otherCosts={otherCosts}
            pension={pensionContribution}
            corporateTax={result.corporateTax}
            dividend={result.possibleDividend}
            companyRemainder={result.companyRemainder}
          />
          <p className="text-xs text-gray-400 leading-relaxed">
            Beräkningarna är avsedda som simulering och är inte bindande skatterådgivning.
            Konsultera alltid en redovisningskonsult för ditt specifika fall.
          </p>
        </div>

        {/* Diagram – höger kolumn */}
        <BreakdownChart data={showComparison ? comparisonData : chartData} />
      </div>

      {/* ── Årssammanfattning ── */}
      <div className="mb-6">
        <YearlySummary
          invoicedAmount={invoicedAmount}
          netSalary={result.netSalary}
          incomeTax={result.incomeTax}
          employersFee={result.employersFee}
          grossSalary={grossSalary}
          otherCosts={otherCosts}
          pension={pensionContribution}
          corporateTax={result.corporateTax}
          dividend={result.possibleDividend}
        />
      </div>

      {/* ── Jämförelsevy ── */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowComparison((v) => !v)}
          className="rounded-lg border border-blue-300 bg-blue-50 px-5 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
        >
          {showComparison ? "Visa din mix i diagrammet" : "Jämför lönenivåer i diagrammet (låg / medel / hög)"}
        </button>
      </div>

      {showComparison && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm overflow-x-auto">
          <h2 className="mb-3 text-base font-semibold text-gray-800">
            Jämförelse – tre lönenivåer
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-2 text-left text-gray-500 font-normal">Post</th>
                {COMPARISON_SALARIES.map(({ name }) => (
                  <th key={name} className="pb-2 text-right text-gray-700 font-semibold">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Bruttolön",           COMPARISON_SALARIES.map((s) => s.salary)],
                  ["Arbetsgivaravgift",   comparisonData.map((d) => d.employersFee)],
                  ["Skatt på lön",        comparisonData.map((d) => d.incomeTax)],
                  ["Nettolön",            comparisonData.map((d) => d.netSalary)],
                  ["Kvar i bolaget",      COMPARISON_SALARIES.map(({ salary }) =>
                    calculate({ ...inputs, grossSalary: salary }).companyRemainder)],
                  ["Bolagsskatt",         comparisonData.map((d) => d.corporateTax)],
                  ["Möjlig utdelning",    comparisonData.map((d) => d.dividend)],
                ] as [string, number[]][]
              ).map(([label, values]) => (
                <tr key={label} className="border-b border-gray-100 last:border-0">
                  <td className="py-1.5 text-gray-600">{label}</td>
                  {values.map((v, i) => (
                    <td key={i} className={`py-1.5 text-right font-medium tabular-nums ${v < 0 ? "text-red-600" : ""}`}>
                      {formatKr(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

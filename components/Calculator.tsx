"use client";

import { useState, useMemo } from "react";
import {
  calculate,
  formatKr,
  type CalculatorInputs,
} from "@/lib/taxCalculations";
import SliderInput from "./SliderInput";
import ResultCard from "./ResultCard";
import BreakdownChart, { type BreakdownData } from "./BreakdownChart";

/** Tre fördefinierade lönenivåer för jämförelsevy */
const COMPARISON_SALARIES = [
  { name: "Låg lön", salary: 35_000 },
  { name: "Mellanlön", salary: 55_000 },
  { name: "Hög lön", salary: 75_000 },
];

interface SummaryKpiProps {
  label: string;
  value: number;
  sub?: string;
}

function SummaryKpi({ label, value, sub }: SummaryKpiProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm text-center">
      <span className="text-xs text-gray-500 mb-1">{label}</span>
      <span className="text-xl font-bold text-gray-900">{formatKr(value)}</span>
      {sub && <span className="text-xs text-gray-400 mt-0.5">{sub}</span>}
    </div>
  );
}

/**
 * Huvudkomponent för lönekalkylator.
 * All state hanteras lokalt – inga externa databaser.
 */
export default function Calculator() {
  // --- Indata ---
  const [invoicedAmount, setInvoicedAmount] = useState(100_000);
  const [grossSalary, setGrossSalary] = useState(50_000);
  const [otherCosts, setOtherCosts] = useState(5_000);
  const [pensionContribution, setPensionContribution] = useState(3_000);
  const [showComparison, setShowComparison] = useState(false);

  const inputs: CalculatorInputs = {
    invoicedAmount,
    grossSalary,
    otherCosts,
    pensionContribution,
  };

  // --- Beräkningar för nuvarande indata ---
  const result = useMemo(() => calculate(inputs), [inputs]);

  // --- Data för stapeldiagrammet ---
  const chartData: BreakdownData[] = useMemo(
    () => [
      {
        name: "Din mix",
        ...result.breakdown,
      },
    ],
    [result]
  );

  // --- Jämförelsevy: tre lönenivåer med samma övriga parametrar ---
  const comparisonData: BreakdownData[] = useMemo(
    () =>
      COMPARISON_SALARIES.map(({ name, salary }) => {
        const r = calculate({ ...inputs, grossSalary: salary });
        return { name, ...r.breakdown };
      }),
    [invoicedAmount, otherCosts, pensionContribution]
  );

  const effectiveTaxRate =
    grossSalary > 0
      ? Math.round((result.incomeTax / grossSalary) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Lönekalkylator för konsult
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Simulera hur ditt fakturerade belopp fördelas beroende på löneuttag.
          Skatteberäkningar baseras på Skatteverkets tabell 32 (Stockholm 2026, SKVFS 2025:20).
        </p>
      </div>

      {/* KPI-sammanfattning */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryKpi label="Nettolön" value={result.netSalary} sub="utbetald/mån" />
        <SummaryKpi label="Skatt på lön" value={result.incomeTax} sub={`${effectiveTaxRate}% effektiv`} />
        <SummaryKpi label="Möjlig utdelning" value={Math.max(0, result.possibleDividend)} sub="efter bolagsskatt" />
        <SummaryKpi label="Kvar totalt" value={Math.max(0, result.netSalary + result.possibleDividend)} sub="lön + utdelning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Vänster: Indata + diagram */}
        <div className="flex flex-col gap-6">
          {/* Indata */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">Indata</h2>
            <div className="flex flex-col gap-5">
              <SliderInput
                label="Fakturerat belopp"
                value={invoicedAmount}
                min={20_000}
                max={300_000}
                step={1_000}
                onChange={setInvoicedAmount}
                hint="Vad du fakturerar kunden exkl. moms"
              />
              <SliderInput
                label="Bruttolön att ta ut"
                value={grossSalary}
                min={0}
                max={150_000}
                step={500}
                onChange={setGrossSalary}
                hint="Lön före skatt – beräknas enligt tabell 32 Stockholm"
              />
              <SliderInput
                label="Övriga fasta kostnader"
                value={otherCosts}
                min={0}
                max={50_000}
                step={500}
                onChange={setOtherCosts}
                hint="Hyra, abonnemang, utrustning etc."
              />
              <SliderInput
                label="Pensionsavsättning"
                value={pensionContribution}
                min={0}
                max={50_000}
                step={500}
                onChange={setPensionContribution}
                hint="Valfri pensionsavsättning via bolaget"
              />
            </div>
          </div>

          {/* Diagram */}
          <BreakdownChart data={showComparison ? comparisonData : chartData} />

          {/* Toggle jämförelsevy */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowComparison((v) => !v)}
              className="rounded-lg border border-blue-300 bg-blue-50 px-5 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
            >
              {showComparison
                ? "Visa din mix"
                : "Jämför lönenivåer (låg / medel / hög)"}
            </button>
          </div>

          {/* Jämförelsetabell */}
          {showComparison && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm overflow-x-auto">
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
                      ["Bruttolön", COMPARISON_SALARIES.map((s) => s.salary)],
                    ] as [string, number[]][]
                  )
                    .concat(
                      [
                        ["Arbetsgivaravgift", comparisonData.map((d) => d.employersFee)],
                        ["Skatt på lön", comparisonData.map((d) => d.incomeTax)],
                        ["Nettolön", comparisonData.map((d) => d.netSalary)],
                        ["Kvar i bolaget (före skatt)", COMPARISON_SALARIES.map(({ salary }) =>
                          calculate({ ...inputs, grossSalary: salary }).companyRemainder)],
                        ["Bolagsskatt", comparisonData.map((d) => d.corporateTax)],
                        ["Möjlig utdelning", comparisonData.map((d) => d.dividend)],
                      ] as [string, number[]][]
                    )
                    .map(([label, values]) => (
                      <tr key={label} className="border-b border-gray-100 last:border-0">
                        <td className="py-1.5 text-gray-600">{label}</td>
                        {(values as number[]).map((v, i) => (
                          <td key={i} className={`py-1.5 text-right font-medium ${v < 0 ? "text-red-600" : ""}`}>
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

        {/* Höger: Resultatkort */}
        <div>
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
          <p className="mt-3 text-xs text-gray-400 leading-relaxed">
            Beräkningarna är avsedda som simulering och är inte bindande skatterådgivning.
            Konsultera alltid en redovisningskonsult för ditt specifika fall.
          </p>
        </div>
      </div>
    </div>
  );
}

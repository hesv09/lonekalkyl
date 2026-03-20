"use client";

import { formatKr } from "@/lib/taxCalculations";

interface YearlySummaryProps {
  netSalary: number;
  incomeTax: number;
  employersFee: number;
  grossSalary: number;
  otherCosts: number;
  pension: number;
  corporateTax: number;
  dividend: number;
  dividendAfterTax: number;
  invoicedAmount: number;
}

interface YearlyRowProps {
  label: string;
  monthly: number;
  yearly: number;
  accent?: "green" | "red" | "blue" | "gray";
  bold?: boolean;
}

function YearlyRow({ label, monthly, yearly, accent, bold }: YearlyRowProps) {
  const accentClass =
    accent === "green" ? "text-green-700" :
    accent === "red"   ? "text-red-600"   :
    accent === "blue"  ? "text-blue-700"  :
    "text-gray-700";

  return (
    <tr className={`border-b border-gray-100 last:border-0 ${bold ? "font-semibold" : ""}`}>
      <td className={`py-2 text-sm ${bold ? "text-gray-900" : "text-gray-600"}`}>{label}</td>
      <td className={`py-2 text-right text-sm tabular-nums ${accentClass}`}>
        {formatKr(monthly)}
      </td>
      <td className={`py-2 text-right text-sm tabular-nums ${accentClass} font-medium`}>
        {formatKr(yearly)}
      </td>
    </tr>
  );
}

/**
 * Årssammanfattning – multiplicerar månadsvärdena ×12 och
 * presenterar dem bredvid månadsvärdena i en kompakt tabell.
 */
export default function YearlySummary(props: YearlySummaryProps) {
  const {
    netSalary,
    incomeTax,
    employersFee,
    grossSalary,
    otherCosts,
    pension,
    corporateTax,
    dividend,
    dividendAfterTax,
    invoicedAmount,
  } = props;

  const totalDisposable = Math.max(0, netSalary) + Math.max(0, dividendAfterTax);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Månads- och årsöversikt</h2>
        <span className="rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-500">
          Årsbelopp = månadsbelopp × 12
        </span>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
              Post
            </th>
            <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
              /månad
            </th>
            <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
              /år
            </th>
          </tr>
        </thead>
        <tbody>
          <YearlyRow
            label="Fakturerat"
            monthly={invoicedAmount}
            yearly={invoicedAmount * 12}
          />
          <YearlyRow
            label="Bruttolön"
            monthly={grossSalary}
            yearly={grossSalary * 12}
          />
          <YearlyRow
            label="Arbetsgivaravgift (31,42 %)"
            monthly={employersFee}
            yearly={employersFee * 12}
            accent="red"
          />
          {otherCosts > 0 && (
            <YearlyRow
              label="Övriga fasta kostnader"
              monthly={otherCosts}
              yearly={otherCosts * 12}
              accent="gray"
            />
          )}
          {pension > 0 && (
            <YearlyRow
              label="Pensionsavsättning"
              monthly={pension}
              yearly={pension * 12}
              accent="gray"
            />
          )}
          <YearlyRow
            label="Skatt på lön (tabell 32)"
            monthly={incomeTax}
            yearly={incomeTax * 12}
            accent="red"
          />
          <YearlyRow
            label="Bolagsskatt (20,0 %)"
            monthly={corporateTax}
            yearly={corporateTax * 12}
            accent="red"
          />

          {/* Separator before totals */}
          <tr><td colSpan={3} className="pt-1" /></tr>

          <YearlyRow
            label="Nettolön (utbetald)"
            monthly={Math.max(0, netSalary)}
            yearly={Math.max(0, netSalary) * 12}
            accent="green"
            bold
          />
          <YearlyRow
            label="Möjlig utdelning (före skatt)"
            monthly={Math.max(0, dividend)}
            yearly={Math.max(0, dividend) * 12}
            accent="blue"
          />
          {dividend > 0 && (
            <YearlyRow
              label="Kapitalskatt 3:12 (20,0 %)"
              monthly={Math.round(Math.max(0, dividend) * 0.20)}
              yearly={Math.round(Math.max(0, dividend) * 0.20) * 12}
              accent="red"
            />
          )}
          <YearlyRow
            label="Utdelning efter skatt"
            monthly={Math.max(0, dividendAfterTax)}
            yearly={Math.max(0, dividendAfterTax) * 12}
            accent="blue"
            bold
          />
          <YearlyRow
            label="Totalt disponibelt (lön + utdelning)"
            monthly={totalDisposable}
            yearly={totalDisposable * 12}
            accent="green"
            bold
          />
        </tbody>
      </table>
    </div>
  );
}

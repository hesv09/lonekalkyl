"use client";

import { formatKr } from "@/lib/taxCalculations";

interface ResultRowProps {
  label: string;
  value: number;
  highlight?: boolean;
  negative?: boolean;
  sub?: boolean;
  color?: string;
}

function ResultRow({ label, value, highlight, negative, sub, color }: ResultRowProps) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 ${
        sub ? "pl-4 text-sm text-gray-600" : "font-medium"
      } ${highlight ? "border-t border-gray-200 pt-2 mt-1" : ""}`}
    >
      <span className="flex items-center gap-2">
        {color && (
          <span
            className="inline-block h-3 w-3 rounded-sm flex-shrink-0"
            style={{ backgroundColor: color }}
          />
        )}
        {label}
      </span>
      <span className={negative ? "text-red-600" : highlight ? "text-blue-700" : ""}>
        {negative ? "−" : ""}
        {formatKr(Math.abs(value))}
      </span>
    </div>
  );
}

interface ResultCardProps {
  invoicedAmount: number;
  netSalary: number;
  incomeTax: number;
  employersFee: number;
  grossSalary: number;
  otherCosts: number;
  pension: number;
  corporateTax: number;
  dividend: number;
  companyRemainder: number;
}

const COLORS = {
  netSalary: "#22c55e",
  incomeTax: "#f59e0b",
  employersFee: "#f97316",
  otherCosts: "#94a3b8",
  pension: "#8b5cf6",
  corporateTax: "#ef4444",
  dividend: "#3b82f6",
};

export default function ResultCard(props: ResultCardProps) {
  const {
    invoicedAmount,
    netSalary,
    incomeTax,
    employersFee,
    grossSalary,
    otherCosts,
    pension,
    corporateTax,
    dividend,
    companyRemainder,
  } = props;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-gray-800">Resultat</h2>

      <div className="divide-y divide-gray-100">
        {/* Fakturerat belopp */}
        <ResultRow label="Fakturerat belopp" value={invoicedAmount} highlight />

        {/* Lönekostnader */}
        <div className="py-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Lönekostnad</p>
          <ResultRow label="Bruttolön" value={grossSalary} sub color={COLORS.netSalary} negative />
          <ResultRow label="Arbetsgivaravgift (31,42 %)" value={employersFee} sub color={COLORS.employersFee} negative />
        </div>

        {/* Övriga kostnader */}
        {(otherCosts > 0 || pension > 0) && (
          <div className="py-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Övriga kostnader</p>
            {otherCosts > 0 && <ResultRow label="Fasta kostnader" value={otherCosts} sub color={COLORS.otherCosts} negative />}
            {pension > 0 && <ResultRow label="Pensionsavsättning" value={pension} sub color={COLORS.pension} negative />}
          </div>
        )}

        {/* Bolag */}
        <div className="py-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Bolaget</p>
          <ResultRow
            label="Kvar i bolaget (före skatt)"
            value={companyRemainder}
            sub
            negative={companyRemainder < 0}
          />
          <ResultRow label="Bolagsskatt (20,6 %)" value={corporateTax} sub color={COLORS.corporateTax} negative />
          <ResultRow
            label="Möjlig utdelning"
            value={dividend}
            sub
            color={COLORS.dividend}
            negative={dividend < 0}
          />
        </div>

        {/* Lön netto */}
        <div className="py-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Lön (tabell 32)</p>
          <ResultRow label="Skatt på lön" value={incomeTax} sub color={COLORS.incomeTax} negative />
          <ResultRow label="Nettolön (utbetald)" value={netSalary} highlight color={COLORS.netSalary} />
        </div>
      </div>
    </div>
  );
}

export { COLORS };

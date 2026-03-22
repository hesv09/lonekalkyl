"use client";

import { useState } from "react";

// ── Exempeldata (fast scenario) ──────────────────────────────────────────────
// Rolf driver en byggfirma. Fakturerar 695 kr/h × 150 h/mån = 104 250 kr/mån.
// Tar ut 50 000 kr/mån i bruttolön. Bolagskostnader 10 000 kr/mån. Tabell 32.

const EX = {
  invoiced: 104_250,
  gross: 50_000,
  otherCosts: 10_000,
  employerFee: 15_710,     // 50 000 × 31,42 %
  totalSalaryCost: 65_710, // 50 000 + 15 710
  incomeTax: 11_383,       // tabell 32, interpolerat
  netSalary: 38_617,       // 50 000 − 11 383
  companyRemainder: 28_540, // 104 250 − 65 710 − 10 000
  corporateTax: 5_708,     // 28 540 × 20 %
  afterCorporateTax: 22_832,
  dividendTax: 4_566,      // 22 832 × 20 %
  dividendNet: 18_266,     // 22 832 × 80 %
  totalDisposable: 56_883, // 38 617 + 18 266
} as const;

function kr(n: number): string {
  return n.toLocaleString("sv-SE") + " kr";
}

// ── Delade UI-primitiver ─────────────────────────────────────────────────────

function Row({
  label,
  value,
  indent,
  bold,
  positive,
  negative,
  divider,
  highlight,
}: {
  label: string;
  value: string;
  indent?: boolean;
  bold?: boolean;
  positive?: boolean;
  negative?: boolean;
  divider?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "flex justify-between items-center px-3 py-2 rounded-lg text-sm",
        divider ? "border-t-2 border-gray-300 mt-1 pt-3" : "",
        highlight ? "bg-green-50 ring-1 ring-green-200" : "bg-white/60",
        indent ? "ml-4" : "",
      ].join(" ")}
    >
      <span className={bold ? "font-semibold text-gray-800" : "text-gray-600"}>{label}</span>
      <span
        className={[
          "tabular-nums font-mono",
          bold ? "font-bold" : "font-medium",
          positive ? "text-green-700" : negative ? "text-red-600" : "text-gray-800",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800 leading-relaxed">
      {children}
    </div>
  );
}

// ── Steg 1 ───────────────────────────────────────────────────────────────────

function Step1() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-gray-700 leading-relaxed">
        När du driver eget bolag är du <strong>inte anställd någonstans</strong> — du är ägare av ett
        aktiebolag (AB). Det är ditt bolag som arbetar, fakturerar och tar emot pengar. Du personligen
        får betalt av <em>ditt eget bolag</em> — inte direkt av kunden.
      </p>

      {/* Flödesdiagram */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-4">
        <div className="flex flex-col items-center gap-1">
          <div className="rounded-2xl bg-slate-100 border border-slate-200 px-6 py-4 text-center shadow-sm w-36">
            <div className="text-2xl mb-1">🏢</div>
            <div className="font-semibold text-slate-700 text-sm">Kund</div>
            <div className="text-xs text-slate-500">Uppdragsgivaren</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
          <div className="hidden sm:block text-2xl text-slate-400">→</div>
          <div className="sm:hidden text-2xl text-slate-400">↓</div>
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-center">
            <div className="text-xs font-semibold text-amber-700">Faktura</div>
            <div className="text-sm font-bold text-amber-800">{kr(EX.invoiced)} / mån</div>
          </div>
          <div className="hidden sm:block text-2xl text-slate-400">→</div>
          <div className="sm:hidden text-2xl text-slate-400">↓</div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="rounded-2xl bg-indigo-50 border-2 border-indigo-300 px-6 py-4 text-center shadow-sm w-36">
            <div className="text-2xl mb-1">🏛️</div>
            <div className="font-semibold text-indigo-700 text-sm">Ditt AB</div>
            <div className="text-xs text-indigo-500">Äger pengarna</div>
          </div>
        </div>
      </div>

      <InfoBox>
        <strong>Viktigt:</strong> Pengarna hamnar i <em>bolagets</em> konto, inte ditt privata. Det
        är sedan bolaget som betalar ut din lön och eventuell utdelning till dig.
      </InfoBox>

      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-1">I Rolfs fall:</p>
        <p>
          Rolf driver en liten byggfirma och fakturerar sin kund <strong>695 kr/timme × 150
          timmar = {kr(EX.invoiced)} per månad</strong> (exklusive moms). Kunden betalar den
          fakturan till Rolfs AB. Rolf har alltså {kr(EX.invoiced)} i bolaget att fördela.
        </p>
      </div>
    </div>
  );
}

// ── Steg 2 ───────────────────────────────────────────────────────────────────

function Step2() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-gray-700 leading-relaxed">
        Du väljer själv hur mycket lön du vill ta ut. Men lön är <strong>dyrare än bara bruttolönen</strong> — bolaget
        måste också betala <em>arbetsgivaravgift</em> ovanpå. Det är pengar som aldrig ens syns på ditt lönebesked.
      </p>

      <div className="flex flex-col gap-1.5">
        <Row label="Bruttolön (vad du ser på lönebeskedet)" value={kr(EX.gross)} positive />
        <Row label="+ Arbetsgivaravgift (31,42 %)" value={kr(EX.employerFee)} negative indent />
        <Row label="= Total lönekostnad för bolaget" value={kr(EX.totalSalaryCost)} bold divider />
      </div>

      <InfoBox>
        <strong>Vad är arbetsgivaravgiften?</strong> Det är en skatt som bolaget betalar till staten.
        Pengarna finansierar din allmänna pension, sjukförsäkring, föräldrapenning och a-kassa.
        Satsen är 31,42 % av din bruttolön (2026).
      </InfoBox>

      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-1">I Rolfs fall:</p>
        <p>
          Rolf vill ta ut <strong>{kr(EX.gross)} i bruttolön</strong>. Bolaget betalar då dessutom{" "}
          <strong>{kr(EX.employerFee)} i arbetsgivaravgift</strong>. Total lönekostnad:{" "}
          <strong>{kr(EX.totalSalaryCost)}</strong>.
        </p>
      </div>
    </div>
  );
}

// ── Steg 3 ───────────────────────────────────────────────────────────────────

function Step3() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-gray-700 leading-relaxed">
        Du får inte behålla hela bruttolönen. Skatteverket drar <em>kommunalskatt</em> direkt på din lön
        innan pengarna når ditt konto. Hur mycket beror på vilken skattetabell du tillhör — det styrs
        av var i landet du bor.
      </p>

      <div className="flex flex-col gap-1.5">
        <Row label="Bruttolön" value={kr(EX.gross)} />
        <Row label="− Skatt (skattetabell 32, ~22,8 %)" value={"−" + kr(EX.incomeTax)} negative indent />
        <Row label="= Nettolön (utbetalt till dig)" value={kr(EX.netSalary)} positive bold divider highlight />
      </div>

      <InfoBox>
        <strong>Varför tabell 32?</strong> Skattetabellerna heter efter ungefär hur hög kommunalskatten
        är i din kommun. Tabell 32 innebär att du bor i en kommun med ~32 % kommunalskatt. Stockholm
        ligger runt tabell 30, medan andra kommuner kan ligga på tabell 34–35.
      </InfoBox>

      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-1">I Rolfs fall:</p>
        <p>
          Av {kr(EX.gross)} i bruttolön drar Skatteverket <strong>{kr(EX.incomeTax)} i skatt</strong>.
          Rolf får <strong>{kr(EX.netSalary)} netto</strong> insatt på sitt privatkonto varje månad.
        </p>
      </div>
    </div>
  );
}

// ── Steg 4 ───────────────────────────────────────────────────────────────────

function Step4() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-gray-700 leading-relaxed">
        Efter att bolaget betalat din lön (inklusive arbetsgivaravgift) och sina löpande kostnader
        finns det pengar kvar. Men även bolaget betalar skatt — <em>bolagsskatt</em> på 20 % av vinsten.
      </p>

      <div className="flex flex-col gap-1.5">
        <Row label="Fakturerat till kund" value={kr(EX.invoiced)} />
        <Row label="− Lönekostnad (lön + arbetsgivaravgift)" value={"−" + kr(EX.totalSalaryCost)} negative indent />
        <Row label="− Bolagskostnader (mobil, bokföring, kläder …)" value={"−" + kr(EX.otherCosts)} negative indent />
        <Row label="= Kvar i bolaget (vinst före skatt)" value={kr(EX.companyRemainder)} bold divider />
        <Row label="− Bolagsskatt (20 %)" value={"−" + kr(EX.corporateTax)} negative indent />
        <Row label="= Kvar efter bolagsskatt" value={kr(EX.afterCorporateTax)} positive bold highlight />
      </div>

      <InfoBox>
        <strong>Bolagets pengar ≠ dina pengar.</strong> Det som finns kvar i bolaget tillhör bolaget,
        inte dig personligen. Du kan ta ut dem som utdelning — men det kräver ett extra steg (och mer skatt).
        Det är just det nästa steg handlar om.
      </InfoBox>

      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-1">I Rolfs fall:</p>
        <p>
          Efter lönekostnaden ({kr(EX.totalSalaryCost)}) och bolagskostnaderna ({kr(EX.otherCosts)})
          återstår <strong>{kr(EX.companyRemainder)}</strong>. Bolagsskatten på 20 % tar{" "}
          {kr(EX.corporateTax)}. Kvar i bolaget: <strong>{kr(EX.afterCorporateTax)}</strong>.
        </p>
      </div>
    </div>
  );
}

// ── Steg 5 ───────────────────────────────────────────────────────────────────

function Step5() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-gray-700 leading-relaxed">
        Pengarna som finns kvar i bolaget kan du ta ut som <em>utdelning</em>. Men även utdelning
        beskattas — med 20 % enligt de så kallade 3:12-reglerna.
      </p>

      <div className="flex flex-col gap-1.5">
        <Row label="Möjlig utdelning (kvar efter bolagsskatt)" value={kr(EX.afterCorporateTax)} />
        <Row label="− Skatt på utdelning (20 %, 3:12)" value={"−" + kr(EX.dividendTax)} negative indent />
        <Row label="= Netto utdelning till dig" value={kr(EX.dividendNet)} positive bold divider highlight />
      </div>

      <InfoBox>
        <strong>Vad är 3:12-reglerna?</strong> De är ett skattesystem för ägare av fåmansbolag (bolag
        med få ägare, som ditt AB). Tanken är att förhindra att höginkomsttagare tar ut all sin
        inkomst som billig utdelning istället för lön. Utdelning beskattas med 20 % upp till ett
        visst belopp per år (gränsbeloppet). Tar du ut mer beskattas det som vanlig lön (~50 %).
      </InfoBox>

      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-1">I Rolfs fall:</p>
        <p>
          Av {kr(EX.afterCorporateTax)} i möjlig utdelning tar skatten {kr(EX.dividendTax)}.
          Rolf får <strong>{kr(EX.dividendNet)} netto</strong> i utdelning.
        </p>
      </div>
    </div>
  );
}

// ── Summering ────────────────────────────────────────────────────────────────

function Summary() {
  const totalTax =
    EX.incomeTax + EX.employerFee + EX.corporateTax + EX.dividendTax;
  const effectiveTaxRate = ((totalTax / EX.invoiced) * 100).toFixed(1);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-gray-700 leading-relaxed">
        Här är hela bilden — från faktura till fickan.
      </p>

      {/* Visuellt flöde */}
      <div className="flex flex-col gap-2">
        {/* Fakturerat */}
        <div className="rounded-xl bg-slate-800 text-white px-4 py-3 flex justify-between items-center">
          <span className="font-semibold">Fakturerat (in till bolaget)</span>
          <span className="text-xl font-bold tabular-nums">{kr(EX.invoiced)}</span>
        </div>

        <div className="pl-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-lg">↓</span>
            <span>Kostnader och skatter längs vägen</span>
          </div>

          {/* Bolagskostnader (inte skatt, men synliggörs i flödet) */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 flex justify-between text-sm">
            <span className="text-slate-600">− Bolagskostnader (mobil, bokföring m.m.)</span>
            <span className="tabular-nums font-mono font-semibold text-slate-600">
              −{kr(EX.otherCosts)}
            </span>
          </div>

          {[
            { label: "Arbetsgivaravgift (31,42%)", value: EX.employerFee },
            { label: "Inkomstskatt på din lön (tabell 32)", value: EX.incomeTax },
            { label: "Bolagsskatt (20%)", value: EX.corporateTax },
            { label: "Skatt på utdelning (20%, 3:12)", value: EX.dividendTax },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg bg-red-50 border border-red-100 px-3 py-1.5 flex justify-between text-sm"
            >
              <span className="text-red-700">− {label}</span>
              <span className="tabular-nums font-mono font-semibold text-red-700">
                −{kr(value)}
              </span>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="border-t-2 border-dashed border-gray-300 my-1" />

        {/* Nettolön */}
        <div className="rounded-xl bg-green-100 border border-green-300 px-4 py-3 flex justify-between items-center">
          <div>
            <div className="font-semibold text-green-800">→ Nettolön (utbetalt lön)</div>
            <div className="text-xs text-green-700">Insatt på ditt privatkonto</div>
          </div>
          <span className="text-xl font-bold tabular-nums text-green-800">{kr(EX.netSalary)}</span>
        </div>

        {/* Utdelning */}
        <div className="rounded-xl bg-blue-100 border border-blue-300 px-4 py-3 flex justify-between items-center">
          <div>
            <div className="font-semibold text-blue-800">→ Utdelning netto</div>
            <div className="text-xs text-blue-700">Efter bolagsskatt + 3:12</div>
          </div>
          <span className="text-xl font-bold tabular-nums text-blue-800">{kr(EX.dividendNet)}</span>
        </div>

        {/* Totalt */}
        <div className="rounded-xl bg-green-600 text-white px-4 py-4 flex justify-between items-center shadow-md">
          <div>
            <div className="font-bold text-lg">Totalt disponibelt / mån</div>
            <div className="text-green-200 text-sm">Nettolön + utdelning</div>
          </div>
          <span className="text-2xl font-bold tabular-nums">{kr(EX.totalDisposable)}</span>
        </div>
      </div>

      {/* Skattekvot */}
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Effektiv total skattebörda</span>
          <span className="text-2xl font-bold text-gray-900">{effectiveTaxRate} %</span>
        </div>
        <div className="text-xs text-gray-500">
          Summa av alla skatter och avgifter ({kr(totalTax)}) delat på fakturerat belopp ({kr(EX.invoiced)}).
          Bolagskostnader ({kr(EX.otherCosts)}) räknas inte som skatt och ingår inte i siffran.
        </div>
        {/* Stapelvisualisering */}
        <div className="mt-3 flex gap-0.5 h-4 rounded-full overflow-hidden">
          <div
            className="bg-green-500"
            style={{ width: `${(EX.netSalary / EX.invoiced) * 100}%` }}
            title={`Nettolön ${kr(EX.netSalary)}`}
          />
          <div
            className="bg-blue-400"
            style={{ width: `${(EX.dividendNet / EX.invoiced) * 100}%` }}
            title={`Utdelning ${kr(EX.dividendNet)}`}
          />
          <div
            className="bg-slate-300"
            style={{ width: `${(EX.otherCosts / EX.invoiced) * 100}%` }}
            title={`Bolagskostnader ${kr(EX.otherCosts)}`}
          />
          <div
            className="bg-red-400"
            style={{ width: `${(totalTax / EX.invoiced) * 100}%` }}
            title={`Skatter ${kr(totalTax)}`}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />Nettolön</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" />Utdelning</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-slate-300 inline-block" />Bolagskostnader</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" />Skatter & avgifter</span>
        </div>
      </div>

      <div className="text-xs text-gray-400 text-center">
        Exempelberäkning: Rolf fakturerar 695 kr/h × 150 h = {kr(EX.invoiced)}/mån, tar ut {kr(EX.gross)}/mån i lön,
        har {kr(EX.otherCosts)}/mån i bolagskostnader, skattetabell 32.
      </div>
    </div>
  );
}

// ── Stegkonfiguration ────────────────────────────────────────────────────────

const STEPS = [
  {
    title: "Du fakturerar ett bolag",
    emoji: "📄",
    subtitle: "Hur pengar flödar in",
    content: <Step1 />,
  },
  {
    title: "Bolaget betalar din lön",
    emoji: "💼",
    subtitle: "Lön + arbetsgivaravgift",
    content: <Step2 />,
  },
  {
    title: "Skatten på din lön",
    emoji: "🧾",
    subtitle: "Från brutto till netto",
    content: <Step3 />,
  },
  {
    title: "Vad är kvar i bolaget?",
    emoji: "🏦",
    subtitle: "Vinst och bolagsskatt",
    content: <Step4 />,
  },
  {
    title: "Utdelning och 3:12",
    emoji: "💰",
    subtitle: "Ta ut pengar från bolaget",
    content: <Step5 />,
  },
] as const;

// ── Huvudkomponent ────────────────────────────────────────────────────────────

export default function Guide() {
  const [step, setStep] = useState(0); // 0-indexed; 5 = summary
  const total = STEPS.length;
  const showSummary = step === total;

  const current = showSummary ? null : STEPS[step];

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Så funkar det</h1>
        <p className="mt-1 text-sm text-gray-500">
          En genomgång i 5 steg med ett fast exempel — Rolf fakturerar{" "}
          <strong className="text-gray-700">104 250 kr/mån</strong> (695 kr/h × 150 h), tar ut{" "}
          <strong className="text-gray-700">50 000 kr/mån</strong> i lön och har{" "}
          <strong className="text-gray-700">10 000 kr/mån</strong> i bolagskostnader (tabell 32).
        </p>
      </div>

      {/* Steg-indikator */}
      {!showSummary && (
        <div className="mb-5 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={[
                "flex-1 h-1.5 rounded-full transition-colors",
                i < step
                  ? "bg-green-400"
                  : i === step
                  ? "bg-indigo-500"
                  : "bg-gray-200",
              ].join(" ")}
              aria-label={`Gå till steg ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Kort */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Kortets header */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200 px-5 py-4">
          {showSummary ? (
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-indigo-500 mb-0.5">
                  Sammanfattning
                </div>
                <h2 className="text-lg font-bold text-gray-900">Hela bilden</h2>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{current!.emoji}</span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-indigo-500 mb-0.5">
                    Steg {step + 1} / {total}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{current!.title}</h2>
                  <p className="text-xs text-gray-500">{current!.subtitle}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Kortets innehåll */}
        <div className="px-5 py-5">
          {showSummary ? <Summary /> : current!.content}
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between bg-gray-50">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Föregående
          </button>

          <span className="text-xs text-gray-400">
            {showSummary ? "Sammanfattning" : `${step + 1} / ${total}`}
          </span>

          {showSummary ? (
            <button
              onClick={() => setStep(0)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 transition-colors"
            >
              Börja om
            </button>
          ) : step === total - 1 ? (
            <button
              onClick={() => setStep(total)}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors shadow-sm"
            >
              Visa sammanfattning →
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Nästa →
            </button>
          )}
        </div>
      </div>

      {/* Steg-länker under kortet */}
      {!showSummary && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={[
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                i === step
                  ? "bg-indigo-600 text-white"
                  : i < step
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200",
              ].join(" ")}
            >
              {i + 1}. {s.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

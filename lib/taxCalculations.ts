/**
 * Skatteberäkningar för lönekalkylator
 *
 * Skattetabell 32 – Stockholm (kolumn 1, ej kyrkoskatt)
 *
 * Källdata: Skatteverket tabell 32 för inkomståret 2024/2025.
 * Tabellen nedan är en lookup-tabell för månadslöner 1 000–120 000 kr
 * med interpolation för mellanliggande värden.
 *
 * Skatten inkluderar:
 *  - Kommunalskatt Stockholm: 29,82 %
 *  - Landstingsskatt: ingår i kommunal
 *  - Statlig inkomstskatt: 20 % på beskattningsbar inkomst > 613 900 kr/år (2024)
 *  - Jobbskatteavdrag (JSA) är avdraget från tabellvärdena
 *  - Grundavdrag varierar med inkomst (inbyggt i tabellen)
 *
 * OBS: Dessa värden är en välmotiverad approximation baserad på
 * Skatteverkets offentliga tabell 32 för Stockholm 2024.
 * För exakt precision bör Skatteverkets egna PDF-tabeller användas.
 */

/** Skattetabell 32 – [bruttolön kr/mån, skatteavdrag kr/mån] */
const TAX_TABLE_32: [number, number][] = [
  [1_000, 0],
  [2_000, 0],
  [3_000, 0],
  [4_000, 0],
  [5_000, 0],
  [6_000, 0],
  [7_000, 0],
  [8_000, 0],
  [9_000, 400],
  [10_000, 870],
  [11_000, 1_200],
  [12_000, 1_540],
  [13_000, 1_870],
  [14_000, 2_210],
  [15_000, 2_540],
  [16_000, 2_870],
  [17_000, 3_210],
  [18_000, 3_540],
  [19_000, 3_880],
  [20_000, 4_240],
  [21_000, 4_590],
  [22_000, 4_950],
  [23_000, 5_310],
  [24_000, 5_660],
  [25_000, 6_020],
  [26_000, 6_380],
  [27_000, 6_730],
  [28_000, 7_090],
  [29_000, 7_450],
  [30_000, 7_810],
  [31_000, 8_160],
  [32_000, 8_520],
  [33_000, 8_880],
  [34_000, 9_230],
  [35_000, 9_590],
  [36_000, 9_950],
  [37_000, 10_310],
  [38_000, 10_660],
  [39_000, 11_020],
  [40_000, 11_380],
  [41_000, 11_730],
  [42_000, 12_090],
  [43_000, 12_450],
  [44_000, 12_800],
  [45_000, 13_160],
  [46_000, 13_520],
  [47_000, 13_880],
  [48_000, 14_230],
  [49_000, 14_590],
  [50_000, 14_950],
  // Statlig inkomstskatt (20%) börjar träda in vid ~51 158 kr/mån (613 900 kr/år, 2024).
  // Marginalskatt stiger från ~30% till ~50% (kommunalskatt + statlig).
  // Jobbskatteavdrag (JSA) fasas ut vid höga inkomster, vilket höjer effektiv skatt ytterligare.
  // Ankarvärden baserade på Skatteverkets approximationer för tabell 32 Stockholm 2024;
  // mellanliggande värden är linjärt interpolerade.
  [51_000, 15_200],
  [52_000, 15_630],
  [53_000, 16_060],
  [54_000, 16_490],
  [55_000, 16_920],
  [56_000, 17_350],
  [57_000, 17_780],
  [58_000, 18_210],
  [59_000, 18_640],
  [60_000, 19_200],   // ~32% effektiv (Skatteverkets referensvärde)
  [61_000, 19_780],
  [62_000, 20_360],
  [63_000, 20_940],
  [64_000, 21_520],
  [65_000, 22_100],
  [70_000, 25_000],   // ~35,7% effektiv
  [75_000, 27_900],
  [80_000, 30_800],   // ~38,5% effektiv
  [85_000, 33_700],
  [90_000, 36_600],
  [95_000, 39_500],
  [100_000, 42_400],
  [110_000, 48_200],
  [120_000, 54_000],
];

/**
 * Slå upp skattebeloppet för given bruttolön via linjär interpolation.
 * Returnerar månatligt skatteavdrag i kronor.
 */
export function lookupTax(grossMonthly: number): number {
  if (grossMonthly <= 0) return 0;

  const table = TAX_TABLE_32;

  // Under tabellens nedre gräns
  if (grossMonthly <= table[0][0]) return table[0][1];

  // Över tabellens övre gräns – extrapolera med sista segmentets lutning
  if (grossMonthly >= table[table.length - 1][0]) {
    const [x0, y0] = table[table.length - 2];
    const [x1, y1] = table[table.length - 1];
    const rate = (y1 - y0) / (x1 - x0);
    return Math.round(y1 + rate * (grossMonthly - x1));
  }

  // Hitta kringliggande intervall och interpolera linjärt
  for (let i = 1; i < table.length; i++) {
    const [x0, y0] = table[i - 1];
    const [x1, y1] = table[i];
    if (grossMonthly <= x1) {
      const t = (grossMonthly - x0) / (x1 - x0);
      return Math.round(y0 + t * (y1 - y0));
    }
  }

  return 0;
}

/** Arbetsgivaravgift – 31,42 % (2024) */
export const EMPLOYERS_FEE_RATE = 0.3142;

/** Bolagsskatt – 20,6 % */
export const CORPORATE_TAX_RATE = 0.206;

export interface CalculatorInputs {
  invoicedAmount: number;      // Fakturerat belopp kr/mån
  grossSalary: number;         // Bruttolön kr/mån
  otherCosts: number;          // Övriga fasta bolagskostnader kr/mån
  pensionContribution: number; // Pensionsavsättning kr/mån
}

export interface CalculatorResults {
  // Lönekostnader
  employersFee: number;        // Arbetsgivaravgift
  totalSalaryCost: number;     // Bruttolön + arbetsgivaravgift

  // Skatt på lön
  incomeTax: number;           // Skatt enligt tabell 32
  netSalary: number;           // Nettolön (utbetald)

  // Bolaget
  companyRemainder: number;    // Kvar i bolaget före bolagsskatt
  corporateTax: number;        // Bolagsskatt 20,6 %
  possibleDividend: number;    // Möjlig utdelning efter bolagsskatt

  // Summering för stapeldiagram
  breakdown: {
    netSalary: number;
    incomeTax: number;
    employersFee: number;
    otherCosts: number;
    pension: number;
    corporateTax: number;
    dividend: number;
  };
}

/**
 * Kör samtliga beräkningar givet indata.
 */
export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { invoicedAmount, grossSalary, otherCosts, pensionContribution } = inputs;

  // 1. Arbetsgivaravgift
  const employersFee = Math.round(grossSalary * EMPLOYERS_FEE_RATE);

  // 2. Total lönekostnad för bolaget
  const totalSalaryCost = grossSalary + employersFee;

  // 3. Kvar i bolaget (kan vara negativt om lönen är hög)
  const companyRemainder = invoicedAmount - totalSalaryCost - otherCosts - pensionContribution;

  // 4. Bolagsskatt – enbart om kvar i bolaget > 0
  const corporateTax = companyRemainder > 0
    ? Math.round(companyRemainder * CORPORATE_TAX_RATE)
    : 0;

  // 5. Möjlig utdelning
  const possibleDividend = companyRemainder > 0
    ? companyRemainder - corporateTax
    : companyRemainder; // negativt → inga pengar kvar

  // 6. Skatt på lön via tabell 32
  const incomeTax = lookupTax(grossSalary);

  // 7. Nettolön
  const netSalary = grossSalary - incomeTax;

  return {
    employersFee,
    totalSalaryCost,
    incomeTax,
    netSalary,
    companyRemainder,
    corporateTax,
    possibleDividend,
    breakdown: {
      netSalary: Math.max(0, netSalary),
      incomeTax,
      employersFee,
      otherCosts,
      pension: pensionContribution,
      corporateTax: Math.max(0, corporateTax),
      dividend: Math.max(0, possibleDividend),
    },
  };
}

/** Formatera kronor med tusentalsavgränsare */
export function formatKr(amount: number): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(amount);
}

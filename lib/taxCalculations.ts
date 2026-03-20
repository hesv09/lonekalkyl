/**
 * Skatteberäkningar för lönekalkylator
 *
 * Skattetabell 32 – Stockholm (kolumn 1, ej kyrkoskatt)
 *
 * Källdata: SKVFS 2025:20 "Skatteavdrag för månadslön 2026 Tabell 32"
 * https://skatteverket.se/download/18.1522bf3f19aea8075ba61b/1765290451072/allmanna-tabeller-manad-tabell-32.pdf
 *
 * PDF-strukturen:
 *  - Sidor 1–4: absoluta skatteavdrag i kronor för löner 1 – 80 000 kr/mån
 *  - Sida 5:    skatteavdrag i PROCENT för löner > 80 000 kr/mån
 *               (omvandlat till kr via: skatt = round(midpunkt × pct / 100))
 *
 * Tabellvärdena inkluderar redan:
 *  - Kommunalskatt Stockholm
 *  - Jobbskatteavdrag (JSA)
 *  - Grundavdrag (inbyggt i tabellberäkningen)
 *  - Statlig inkomstskatt 20 % (träder in ~54 500–55 500 kr/mån för 2026,
 *    syns som ökat marginalavdrag fr.o.m. 55 100 kr i tabellen)
 *
 * Lookup-tabellen nedan innehåller ett urval av representativa punkter
 * (en per ~1 000 kr för 0–80 000, sedan övergångspunkter för %-sektionen).
 * Mellanliggande värden beräknas via linjär interpolation i lookupTax().
 */

/** Skattetabell 32 – [bruttolön kr/mån, skatteavdrag kr/mån] */
const TAX_TABLE_32: [number, number][] = [
  // ── Absoluta belopp från PDF sidor 1–4 (kolumn 1) ──────────────────────
  // Varje punkt representerar mittpunkten i ett 100 kr-intervall.
  // Urval: en punkt per ~1 000 kr-steg.
  [1_000,  0],     // 0.0 %
  [2_050,  150],   // 7.3 %
  [3_050,  238],   // 7.8 %
  [4_050,  326],   // 8.0 %
  [5_050,  422],   // 8.4 %
  [6_050,  506],   // 8.4 %
  [7_050,  598],   // 8.5 %
  [8_050,  782],   // 9.7 %
  [9_050,  983],   // 10.9 %
  [10_050, 1_183], // 11.8 %
  [11_050, 1_383], // 12.5 %
  [12_050, 1_583], // 13.1 %
  [13_050, 1_783], // 13.7 %
  [14_050, 1_981], // 14.1 %
  [15_050, 2_174], // 14.4 %
  [16_050, 2_372], // 14.8 %
  [17_050, 2_607], // 15.3 %
  [18_050, 2_843], // 15.8 %
  [19_050, 3_078], // 16.2 %
  [20_100, 3_337], // 16.6 %
  [21_100, 3_573], // 16.9 %
  [22_100, 3_808], // 17.2 %
  [23_100, 4_045], // 17.5 %
  [24_100, 4_289], // 17.8 %
  [25_100, 4_533], // 18.1 %
  [26_100, 4_776], // 18.3 %
  [27_100, 5_020], // 18.5 %
  [28_100, 5_264], // 18.7 %
  [29_100, 5_508], // 18.9 %
  [30_100, 5_751], // 19.1 %
  [31_100, 5_995], // 19.3 %
  [32_100, 6_239], // 19.4 %
  [33_100, 6_483], // 19.6 %
  [34_100, 6_726], // 19.7 %
  [35_100, 6_970], // 19.9 %
  [36_100, 7_214], // 20.0 %
  [37_100, 7_458], // 20.1 %
  [38_100, 7_701], // 20.2 %
  [39_100, 7_945], // 20.3 %
  [40_100, 8_215], // 20.5 %
  [41_100, 8_535], // 20.8 %
  [42_100, 8_855], // 21.0 %
  [43_100, 9_175], // 21.3 %
  [44_100, 9_495], // 21.5 %
  [45_100, 9_815], // 21.8 %
  [46_100, 10_135], // 22.0 %
  [47_100, 10_455], // 22.2 %
  [48_100, 10_775], // 22.4 %
  [49_100, 11_095], // 22.6 %
  [50_100, 11_415], // 22.8 %
  [51_100, 11_735], // 23.0 %
  [52_100, 12_055], // 23.1 %
  [53_100, 12_375], // 23.3 %
  [54_100, 12_695], // 23.5 %
  // Statlig inkomstskatt 20 % börjar träda in ~54 500–55 500 kr/mån (2026).
  // Marginalskatt stiger markant: ~32 % → ~52 % per extra krona.
  [55_100, 13_048], // 23.7 % – statlig skatt börjar fasas in
  [56_100, 13_568], // 24.2 % – marginalskatt ~52 % i detta intervall
  [57_100, 14_088], // 24.7 %
  [58_100, 14_608], // 25.1 %
  [59_100, 15_128], // 25.6 %
  [60_100, 15_648], // 26.0 %
  [61_100, 16_168], // 26.5 %
  [62_100, 16_688], // 26.9 %
  [63_100, 17_208], // 27.3 %
  [64_100, 17_728], // 27.7 %
  [65_100, 18_248], // 28.0 %
  [66_100, 18_768], // 28.4 %
  [67_100, 19_288], // 28.7 %
  [68_100, 19_808], // 29.1 %
  [69_100, 20_328], // 29.4 %
  [70_100, 20_848], // 29.7 %
  [71_100, 21_368], // 30.1 %
  [72_100, 21_888], // 30.4 %
  [73_100, 22_408], // 30.7 %
  [74_100, 22_928], // 30.9 %
  [75_100, 23_448], // 31.2 %
  [76_100, 23_968], // 31.5 %
  [77_100, 24_488], // 31.8 %
  [78_100, 25_008], // 32.0 %
  [79_100, 25_528], // 32.3 %
  [79_900, 25_944], // 32.5 % – sista absoluta kr-värdet (79 801–80 000)

  // ── Omräknat från %-tabell i PDF sida 5 (kr = round(midpunkt × pct/100)) ─
  // Varje band representerar en ny procentsats eller ett ~10 000 kr-ankare.
  [80_100,   25_632],  // 32 %
  [80_300,   26_499],  // 33 %
  [84_800,   28_832],  // 34 %
  [89_900,   31_465],  // 35 %
  [95_300,   34_308],  // 36 %
  [101_500,  37_555],  // 37 %
  [108_000,  41_040],  // 38 %
  [116_300,  45_357],  // 39 %
  [125_900,  50_360],  // 40 %
  [136_800,  56_088],  // 41 %
  [149_900,  62_958],  // 42 %
  [165_600,  71_208],  // 43 %
  [184_900,  81_356],  // 44 %
  [208_800,  93_960],  // 45 %
  [242_200, 111_412],  // 46 %
  [286_200, 134_514],  // 47 %
  [349_800, 167_904],  // 48 %
  [449_800, 220_402],  // 49 %
  [629_700, 314_850],  // 50 %
  [827_926, 422_242],  // 51 % – maxnivå i tabellen
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

/** Arbetsgivaravgift – 31,42 % (2026) */
export const EMPLOYERS_FEE_RATE = 0.3142;

/** Bolagsskatt – 20,0 % */
export const CORPORATE_TAX_RATE = 0.20;

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
  corporateTax: number;        // Bolagsskatt 20,0 %
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

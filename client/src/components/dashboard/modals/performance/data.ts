import { PieChart, LineChart, BarChart3, Wallet } from "lucide-react";

export const mockKPIs = {
  honorarios: 5851040,
  despesas: 1215533,
  resultadoOperacional: 4635507,
  inspecoes: 1106,
};

export const mockMarketShare = [
  { name: "Aon", value: 50.5, color: "#CE62D9" },
  { name: "Marsh", value: 18.8, color: "#9B7ED9" },
  { name: "Inter", value: 7.6, color: "#00BCD4" },
  { name: "Swiss Re", value: 5.5, color: "#22C55E" },
  { name: "Gallagher", value: 5.0, color: "#F97316" },
  { name: "Howden", value: 3.0, color: "#EAB308" },
  { name: "Lockton", value: 2.9, color: "#EC4899" },
  { name: "Mitsui", value: 1.3, color: "#8B5CF6" },
  { name: "Assurê", value: 0.9, color: "#06B6D4" },
  { name: "Wiz", value: 0.9, color: "#84CC16" },
  { name: "Free Job", value: 0.8, color: "#F43F5E" },
  { name: "Fator", value: 0.7, color: "#A855F7" },
];

export const mockBusinessData = {
  months: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
  series: [
    { year: 2021, color: "#F97316", data: [80, 120, 100, 140, 90, 160, 300, 140, 80, 120, 180, 100] },
    { year: 2022, color: "#00BCD4", data: [100, 140, 130, 120, 110, 140, 150, 130, 100, 90, 140, 80] },
    { year: 2023, color: "#22C55E", data: [120, 130, 140, 100, 150, 130, 200, 160, 140, 100, 120, 90] },
    { year: 2024, color: "#EAB308", data: [90, 100, 120, 80, 130, 100, 180, 120, 100, 80, 150, 70] },
    { year: 2025, color: "#CE62D9", data: [60, 80, 50, 40, 60, 40, 120, 80, 60, 50, 80, 40] },
  ],
};

export const mockOperationalData = [
  { 
    name: "Alexander", 
    years: [
      { year: 2021, value: 95000, percentage: 9.6 },
      { year: 2022, value: 175000, percentage: 17.2 },
      { year: 2023, value: 280000, percentage: 28.6 },
      { year: 2024, value: 255000, percentage: 25.1 },
    ]
  },
  { 
    name: "André", 
    years: [
      { year: 2021, value: 85000, percentage: 8.5 },
      { year: 2022, value: 130000, percentage: 13.1 },
      { year: 2023, value: 390000, percentage: 37.4 },
      { year: 2024, value: 300000, percentage: 29.3 },
    ]
  },
  { 
    name: "Binda", 
    years: [
      { year: 2024, value: 5000, percentage: 0.6 },
    ]
  },
  { 
    name: "Hélio", 
    years: [
      { year: 2023, value: 85000, percentage: 8.3 },
      { year: 2024, value: 220000, percentage: 21.1 },
    ]
  },
  { 
    name: "Marcus Vinicius", 
    years: [
      { year: 2021, value: 500000, percentage: 99.0 },
      { year: 2022, value: 175000, percentage: 33.5 },
      { year: 2023, value: 145000, percentage: 28.1 },
      { year: 2024, value: 240000, percentage: 23.6 },
    ]
  },
  { 
    name: "Saboia", 
    years: [
      { year: 2021, value: 15000, percentage: 1.7 },
      { year: 2022, value: 50000, percentage: 4.9 },
      { year: 2023, value: 85000, percentage: 8.3 },
      { year: 2024, value: 250000, percentage: 24.8 },
      { year: 2025, value: 220000, percentage: 21.3 },
    ]
  },
];

export const yearColors: Record<number, string> = {
  2021: "#F97316",
  2022: "#00BCD4", 
  2023: "#22C55E",
  2024: "#EAB308",
  2025: "#CE62D9",
};

export type TabType = "market" | "business" | "operational" | "expenses";

export const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "market", label: "Market Share", icon: PieChart },
  { id: "business", label: "Business", icon: LineChart },
  { id: "operational", label: "Operational", icon: BarChart3 },
  { id: "expenses", label: "Operational Expenses", icon: Wallet },
];

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export const mockDetailsData = [
  { id: 1, player: "Aon", segur: "ALS", guy: "MVR", honorario: 285000, despesa: 42000, resultado: 243000, inspecoes: 45 },
  { id: 2, player: "Marsh", segur: "HEA", guy: "Alexander", honorario: 198000, despesa: 31000, resultado: 167000, inspecoes: 32 },
  { id: 3, player: "Swiss Re", segur: "ARR", guy: "André", honorario: 156000, despesa: 28000, resultado: 128000, inspecoes: 28 },
  { id: 4, player: "Gallagher", segur: "RES", guy: "Saboia", honorario: 142000, despesa: 25000, resultado: 117000, inspecoes: 24 },
  { id: 5, player: "Lockton", segur: "HEA", guy: "Hélio", honorario: 118000, despesa: 19000, resultado: 99000, inspecoes: 21 },
  { id: 6, player: "Inter", segur: "ALS", guy: "MVR", honorario: 95000, despesa: 15000, resultado: 80000, inspecoes: 18 },
  { id: 7, player: "Howden", segur: "ARR", guy: "Alexander", honorario: 78000, despesa: 12000, resultado: 66000, inspecoes: 14 },
  { id: 8, player: "Mitsui", segur: "RES", guy: "André", honorario: 65000, despesa: 9500, resultado: 55500, inspecoes: 12 },
];

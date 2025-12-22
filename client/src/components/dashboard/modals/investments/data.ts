import { TrendingDown, Trophy, Target } from "lucide-react";

export const mockAllocations = [
  { id: "cdb", name: "CDB", value: 262176.88, color: "#CE62D9", percentage: 53 },
  { id: "lci", name: "LCI/LCA/LCD", value: 153155.23, color: "#9B7ED9", percentage: 31 },
  { id: "tesouro", name: "Tesouro", value: 50187.85, color: "#00BCD4", percentage: 10 },
  { id: "fundo-cp", name: "Fundo FIRF CP", value: 22122.31, color: "#F97316", percentage: 4 },
  { id: "fundo-lp", name: "Fundo FIRF LP", value: 7736.69, color: "#22C55E", percentage: 2 },
];

export const mockHighlights = {
  topWinner: { name: "Tesouro Tesouro Prefixado 2027", icon: Trophy },
  topLoser: { name: "CDB AFINZ", icon: TrendingDown },
  maiorPosicao: { name: "CDB VOLKSWAGEN", value: 60629.63, icon: Target },
};

export const mockKPIs = {
  patrimonioTotal: 498685.27,
  valorAplicado: 480530.98,
  resultado: 18154.29,
  rentabilidade: 3.78,
};

export const mockPortfolio = [
  { id: "1", investidor: "Marcus", instituicao: "XP", tipo: "CDB", detalhe: "CDB VOLKSWAGEN 112%", aplicado: 50000, bruto: 60629.63, liquido: 58500, ganhoPerda: 8500, rentabilidade: 17.0, dtAplicacao: "15/01/24", dtVencimento: "15/01/26" },
  { id: "2", investidor: "Marcus", instituicao: "Nubank", tipo: "CDB", detalhe: "CDB AFINZ 115%", aplicado: 30000, bruto: 34500, liquido: 33200, ganhoPerda: 3200, rentabilidade: 10.7, dtAplicacao: "20/03/24", dtVencimento: "20/03/25" },
  { id: "3", investidor: "Marcus", instituicao: "BTG", tipo: "LCI", detalhe: "LCI BTG 94%", aplicado: 80000, bruto: 86400, liquido: 86400, ganhoPerda: 6400, rentabilidade: 8.0, dtAplicacao: "01/02/24", dtVencimento: "01/02/26" },
  { id: "4", investidor: "Empresa", instituicao: "Tesouro", tipo: "Tesouro", detalhe: "Tesouro Prefixado 2027", aplicado: 40000, bruto: 50187.85, liquido: 48500, ganhoPerda: 8500, rentabilidade: 21.25, dtAplicacao: "10/06/23", dtVencimento: "01/01/27" },
  { id: "5", investidor: "Marcus", instituicao: "Inter", tipo: "LCA", detalhe: "LCA Inter 92%", aplicado: 25000, bruto: 26755.23, liquido: 26755.23, ganhoPerda: 1755.23, rentabilidade: 7.02, dtAplicacao: "05/05/24", dtVencimento: "05/11/25" },
  { id: "6", investidor: "Empresa", instituicao: "XP", tipo: "Fundo", detalhe: "FIRF CP XP", aplicado: 20000, bruto: 22122.31, liquido: 21500, ganhoPerda: 1500, rentabilidade: 7.5, dtAplicacao: "01/01/24", dtVencimento: "-" },
  { id: "7", investidor: "Marcus", instituicao: "Rico", tipo: "CDB", detalhe: "CDB Original 110%", aplicado: 15000, bruto: 16200, liquido: 15800, ganhoPerda: 800, rentabilidade: 5.3, dtAplicacao: "10/04/24", dtVencimento: "10/04/25" },
  { id: "8", investidor: "Empresa", instituicao: "BTG", tipo: "Fundo", detalhe: "FIRF LP BTG", aplicado: 7000, bruto: 7736.69, liquido: 7500, ganhoPerda: 500, rentabilidade: 7.14, dtAplicacao: "15/02/24", dtVencimento: "-" },
];

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyShort(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Target,
  BarChart3,
  LineChart,
  Users,
  Building2,
  Calendar,
  ChevronDown,
  Sparkles,
  Activity,
  Wallet,
  PieChart,
  Layers,
  FileText,
} from "lucide-react";

interface PerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockKPIs = {
  honorarios: 5851040,
  despesas: 1215533,
  resultadoOperacional: 4635507,
  inspecoes: 1106,
};

const mockMarketShare = [
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

const mockBusinessData = {
  months: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
  series: [
    { year: 2021, color: "#F97316", data: [80, 120, 100, 140, 90, 160, 300, 140, 80, 120, 180, 100] },
    { year: 2022, color: "#00BCD4", data: [100, 140, 130, 120, 110, 140, 150, 130, 100, 90, 140, 80] },
    { year: 2023, color: "#22C55E", data: [120, 130, 140, 100, 150, 130, 200, 160, 140, 100, 120, 90] },
    { year: 2024, color: "#EAB308", data: [90, 100, 120, 80, 130, 100, 180, 120, 100, 80, 150, 70] },
    { year: 2025, color: "#CE62D9", data: [60, 80, 50, 40, 60, 40, 120, 80, 60, 50, 80, 40] },
  ],
};

const mockOperationalData = [
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

const yearColors: Record<number, string> = {
  2021: "#F97316",
  2022: "#00BCD4", 
  2023: "#22C55E",
  2024: "#EAB308",
  2025: "#CE62D9",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

type TabType = "market" | "business" | "operational" | "expenses";

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "market", label: "Market Share", icon: PieChart },
  { id: "business", label: "Business", icon: LineChart },
  { id: "operational", label: "Operational", icon: BarChart3 },
  { id: "expenses", label: "Operational Expenses", icon: Wallet },
];

function KPICard({ 
  icon: Icon, 
  label, 
  value, 
  colorClass,
  iconColorClass,
  delay 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string;
  colorClass: string;
  iconColorClass: string;
  delay: number;
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, x: 3 }}
      className="relative group cursor-pointer"
    >
      <div className={`absolute inset-0 ${colorClass} opacity-0 group-hover:opacity-20 rounded-xl blur-xl transition-opacity duration-300`} />
      <Card className="relative glass border-white/10 bg-[rgba(15,15,35,0.8)] overflow-visible">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${colorClass} border border-white/10`}>
              <Icon className={`w-4 h-4 ${iconColorClass}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{label}</p>
              <p className={`text-lg font-bold ${iconColorClass}`}>
                {value}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PremiumTabs({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab: TabType; 
  onTabChange: (tab: TabType) => void;
}) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-[rgba(15,15,35,0.6)] border border-white/10 backdrop-blur-sm">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              isActive 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground/80"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid={`tab-${tab.id}`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-lg border border-primary/30"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <Icon className={`w-4 h-4 relative z-10 ${isActive ? "text-primary" : ""}`} />
            <span className="relative z-10 hidden sm:inline">{tab.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function MarketShareChart({ data }: { data: typeof mockMarketShare }) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const isHovered = hoveredBar === item.name;
        const widthPercent = (item.value / maxValue) * 100;
        
        return (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 group cursor-pointer"
            onMouseEnter={() => setHoveredBar(item.name)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            <div className="w-20 text-right">
              <span className={`text-xs font-medium transition-colors ${isHovered ? "text-foreground" : "text-muted-foreground"}`}>
                {item.name}
              </span>
            </div>
            <div className="flex-1 relative">
              <div className="h-7 rounded-lg bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-lg relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{ duration: 0.8, delay: index * 0.05, ease: "easeOut" }}
                  style={{ 
                    background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}99 100%)`,
                    boxShadow: isHovered ? `0 0 20px ${item.color}40` : 'none'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
                </motion.div>
              </div>
            </div>
            <div className="w-14 text-right">
              <Badge 
                variant="outline" 
                className={`text-xs border-white/20 transition-all ${isHovered ? "border-primary/50 text-primary" : ""}`}
              >
                {item.value}%
              </Badge>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function BusinessLineChart({ data }: { data: typeof mockBusinessData }) {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const width = 600;
  const height = 280;
  const padding = { top: 40, right: 30, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const allValues = data.series.flatMap(s => s.data);
  const maxValue = Math.max(...allValues);
  const minValue = 0;
  
  const xScale = (index: number) => padding.left + (index / (data.months.length - 1)) * chartWidth;
  const yScale = (value: number) => padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;

  const gridLines = [0, 50000, 100000, 150000, 200000, 250000, 300000, 350000];

  return (
    <div className="relative">
      <div className="flex items-center justify-end gap-4 mb-4">
        {data.series.map((series) => (
          <motion.div
            key={series.year}
            className={`flex items-center gap-2 cursor-pointer transition-opacity ${
              hoveredYear && hoveredYear !== series.year ? "opacity-40" : "opacity-100"
            }`}
            onMouseEnter={() => setHoveredYear(series.year)}
            onMouseLeave={() => setHoveredYear(null)}
            whileHover={{ scale: 1.05 }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: series.color }}
            />
            <span className="text-xs text-muted-foreground">{series.year}</span>
          </motion.div>
        ))}
      </div>
      
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          {data.series.map((series) => (
            <linearGradient key={`gradient-${series.year}`} id={`line-gradient-${series.year}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={series.color} stopOpacity="0" />
            </linearGradient>
          ))}
          <filter id="glow-line">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {gridLines.map((value, i) => (
          <g key={value}>
            <line
              x1={padding.left}
              y1={yScale(value)}
              x2={width - padding.right}
              y2={yScale(value)}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="4,4"
            />
            <text
              x={padding.left - 10}
              y={yScale(value)}
              textAnchor="end"
              alignmentBaseline="middle"
              className="text-[10px] fill-muted-foreground"
            >
              {formatCurrency(value)}
            </text>
          </g>
        ))}

        {data.months.map((month, i) => (
          <g key={month}>
            <line
              x1={xScale(i)}
              y1={padding.top}
              x2={xScale(i)}
              y2={height - padding.bottom}
              stroke="rgba(255,255,255,0.05)"
            />
            <text
              x={xScale(i)}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              className="text-[11px] fill-muted-foreground"
            >
              {month}
            </text>
          </g>
        ))}

        {data.series.map((series, seriesIndex) => {
          const isActive = !hoveredYear || hoveredYear === series.year;
          const points = series.data.map((value, i) => `${xScale(i)},${yScale(value * 1000)}`).join(" ");
          const pathD = `M ${series.data.map((value, i) => `${xScale(i)},${yScale(value * 1000)}`).join(" L ")}`;
          
          const areaPath = `
            M ${xScale(0)},${yScale(series.data[0] * 1000)}
            ${series.data.map((value, i) => `L ${xScale(i)},${yScale(value * 1000)}`).join(" ")}
            L ${xScale(series.data.length - 1)},${height - padding.bottom}
            L ${xScale(0)},${height - padding.bottom}
            Z
          `;

          return (
            <motion.g
              key={series.year}
              initial={{ opacity: 0 }}
              animate={{ opacity: isActive ? 1 : 0.2 }}
              transition={{ duration: 0.3 }}
            >
              <motion.path
                d={areaPath}
                fill={`url(#line-gradient-${series.year})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
              />
              <motion.path
                d={pathD}
                fill="none"
                stroke={series.color}
                strokeWidth={isActive && hoveredYear === series.year ? 3 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={isActive && hoveredYear === series.year ? "url(#glow-line)" : undefined}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: seriesIndex * 0.2 }}
              />
              {series.data.map((value, i) => (
                <motion.circle
                  key={i}
                  cx={xScale(i)}
                  cy={yScale(value * 1000)}
                  r={isActive && hoveredYear === series.year ? 5 : 3}
                  fill={series.color}
                  stroke="rgba(10,10,31,0.8)"
                  strokeWidth={2}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                />
              ))}
            </motion.g>
          );
        })}
      </svg>
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        <span className="text-xs text-muted-foreground">Honorários por Mês</span>
      </div>
    </div>
  );
}

function OperationalBarChart({ data }: { data: typeof mockOperationalData }) {
  const [hoveredPerson, setHoveredPerson] = useState<string | null>(null);
  const allYears = [2021, 2022, 2023, 2024, 2025];
  const maxValue = 500000;
  const barWidth = 16;
  const barGap = 4;
  const groupWidth = allYears.length * (barWidth + barGap);

  return (
    <div className="relative">
      <div className="flex items-center justify-end gap-4 mb-4">
        {allYears.map((year) => (
          <div key={year} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: yearColors[year] }}
            />
            <span className="text-xs text-muted-foreground">{year}</span>
          </div>
        ))}
      </div>

      <div className="flex items-end justify-between gap-6 h-64 px-4">
        {data.map((person, personIndex) => (
          <div
            key={person.name}
            className="flex flex-col items-center gap-2 flex-1"
            onMouseEnter={() => setHoveredPerson(person.name)}
            onMouseLeave={() => setHoveredPerson(null)}
          >
            <div className="flex items-end gap-1 h-52">
              {allYears.map((year) => {
                const yearData = person.years.find(y => y.year === year);
                const heightPercent = yearData ? (yearData.value / maxValue) * 100 : 0;
                const isHovered = hoveredPerson === person.name;
                
                return (
                  <motion.div
                    key={year}
                    className="relative group cursor-pointer"
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.6, delay: personIndex * 0.1 + allYears.indexOf(year) * 0.05 }}
                    style={{ 
                      width: barWidth,
                      minHeight: yearData ? 8 : 0,
                    }}
                  >
                    <div 
                      className="absolute inset-0 rounded-t-md transition-all duration-300"
                      style={{ 
                        background: `linear-gradient(180deg, ${yearColors[year]} 0%, ${yearColors[year]}80 100%)`,
                        boxShadow: isHovered ? `0 0 15px ${yearColors[year]}40` : 'none',
                        transform: isHovered ? 'scaleX(1.1)' : 'scaleX(1)',
                      }}
                    />
                    {yearData && heightPercent > 15 && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-foreground font-medium whitespace-nowrap"
                      >
                        {yearData.percentage}%
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <span className={`text-[10px] text-center transition-colors ${
              hoveredPerson === person.name ? "text-foreground font-medium" : "text-muted-foreground"
            }`}>
              {person.name}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-2 px-4">
        <div className="flex flex-col items-start">
          <span className="text-[10px] text-muted-foreground">0</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-muted-foreground">500,000</span>
        </div>
      </div>
    </div>
  );
}

export function PerformanceModal({ isOpen, onClose }: PerformanceModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("market");
  const [dateFilter, setDateFilter] = useState<"envio" | "pago" | "acerto">("envio");
  const [use12Months, setUse12Months] = useState(true);

  return (
    <Modal
      id="performance-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Performance"
      subtitle="Dinâmica da Empresa - Performance e Desempenho"
      maxWidth="5xl"
      footer={
        <div className="flex items-center justify-between w-full gap-4 flex-wrap">
          <Button 
            variant="ghost"
            className="gap-2 text-muted-foreground"
            data-testid="button-details"
          >
            <FileText className="w-4 h-4" />
            Detalhes
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={onClose} className="gap-2" data-testid="button-close-performance">
            Fechar
          </Button>
        </div>
      }
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[rgba(15,15,35,0.6)] border border-white/10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10">
              <span className="text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-wider">
                MVRX
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Dinâmica da Empresa</p>
              <p className="text-xs text-muted-foreground">Performance e Desempenho</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <RadioGroup 
              value={dateFilter} 
              onValueChange={(v) => setDateFilter(v as typeof dateFilter)}
              className="flex items-center gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="envio" id="envio" className="border-destructive text-destructive" />
                <Label htmlFor="envio" className="text-xs text-muted-foreground cursor-pointer">Envio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pago" id="pago" className="border-white/30" />
                <Label htmlFor="pago" className="text-xs text-muted-foreground cursor-pointer">Pago</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="acerto" id="acerto" className="border-white/30" />
                <Label htmlFor="acerto" className="text-xs text-muted-foreground cursor-pointer">Acerto</Label>
              </div>
            </RadioGroup>

            <div className="h-6 w-px bg-white/10" />

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Período:</span>
              <Select defaultValue="inicio">
                <SelectTrigger className="w-24 h-8 text-xs bg-transparent border-white/20">
                  <SelectValue placeholder="Início" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inicio">Início</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="fim">
                <SelectTrigger className="w-24 h-8 text-xs bg-transparent border-white/20">
                  <SelectValue placeholder="Fim" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fim">Fim</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="12months" 
                checked={use12Months}
                onCheckedChange={(checked) => setUse12Months(checked as boolean)}
                className="border-white/30"
              />
              <Label htmlFor="12months" className="text-xs text-muted-foreground cursor-pointer">12 meses</Label>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          <motion.div variants={itemVariants} className="space-y-3">
            <KPICard
              icon={DollarSign}
              label="Honorários"
              value={`R$ ${formatCurrency(mockKPIs.honorarios)}`}
              colorClass="bg-gradient-to-br from-amber-500/20 to-amber-600/10"
              iconColorClass="text-amber-400"
              delay={0}
            />
            <KPICard
              icon={Receipt}
              label="Despesas"
              value={`R$ ${formatCurrency(mockKPIs.despesas)}`}
              colorClass="bg-gradient-to-br from-rose-500/20 to-rose-600/10"
              iconColorClass="text-rose-400"
              delay={0.1}
            />
            <KPICard
              icon={Target}
              label="Resultado Operacional"
              value={`R$ ${formatCurrency(mockKPIs.resultadoOperacional)}`}
              colorClass="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10"
              iconColorClass="text-emerald-400"
              delay={0.2}
            />
            <KPICard
              icon={Activity}
              label="Inspeções"
              value={mockKPIs.inspecoes.toString()}
              colorClass="bg-gradient-to-br from-blue-500/20 to-blue-600/10"
              iconColorClass="text-blue-400"
              delay={0.3}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <PremiumTabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            <Card className="glass border-white/10 bg-[rgba(15,15,35,0.6)] min-h-[380px]">
              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "market" && (
                    <motion.div
                      key="market"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MarketShareChart data={mockMarketShare} />
                    </motion.div>
                  )}
                  
                  {activeTab === "business" && (
                    <motion.div
                      key="business"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <BusinessLineChart data={mockBusinessData} />
                    </motion.div>
                  )}
                  
                  {activeTab === "operational" && (
                    <motion.div
                      key="operational"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <OperationalBarChart data={mockOperationalData} />
                    </motion.div>
                  )}
                  
                  {activeTab === "expenses" && (
                    <motion.div
                      key="expenses"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-center h-64"
                    >
                      <div className="text-center space-y-3">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 inline-block">
                          <Wallet className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-muted-foreground">Despesas Operacionais</p>
                        <p className="text-xs text-muted-foreground/60">Em desenvolvimento...</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Modal>
  );
}

export { PerformanceModal as FinancialModal };

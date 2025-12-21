import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Plus, 
  ArrowUpRight, 
  Sparkles,
  Trophy,
  Target,
  PieChart,
  Building2,
  User,
  Layers,
  ImagePlus,
  ChevronDown,
  Wallet
} from "lucide-react";

interface InvestmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockAllocations = [
  { id: "cdb", name: "CDB", value: 262176.88, color: "#CE62D9", percentage: 53 },
  { id: "lci", name: "LCI/LCA/LCD", value: 153155.23, color: "#9B7ED9", percentage: 31 },
  { id: "tesouro", name: "Tesouro", value: 50187.85, color: "#00BCD4", percentage: 10 },
  { id: "fundo-cp", name: "Fundo FIRF CP", value: 22122.31, color: "#F97316", percentage: 4 },
  { id: "fundo-lp", name: "Fundo FIRF LP", value: 7736.69, color: "#22C55E", percentage: 2 },
];

const mockHighlights = {
  topWinner: { name: "Tesouro Tesouro Prefixado 2027", icon: Trophy },
  topLoser: { name: "CDB AFINZ", icon: TrendingDown },
  maiorPosicao: { name: "CDB VOLKSWAGEN", value: 60629.63, icon: Target },
};

const mockKPIs = {
  patrimonioTotal: 498685.27,
  valorAplicado: 480530.98,
  resultado: 18154.29,
  rentabilidade: 3.78,
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrencyShort(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

interface PremiumDonutChartProps {
  data: typeof mockAllocations;
  size?: number;
  strokeWidth?: number;
  hoveredSegment: string | null;
  onHover: (id: string | null) => void;
}

function PremiumDonutChart({ data, size = 280, strokeWidth = 45, hoveredSegment, onHover }: PremiumDonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  
  const total = data.reduce((acc, item) => acc + item.value, 0);
  
  let currentAngle = -90;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    const strokeDasharray = (percentage / 100) * circumference;
    const strokeDashoffset = circumference - strokeDasharray;
    const rotation = startAngle + 90;
    
    return {
      ...item,
      percentage,
      strokeDasharray,
      strokeDashoffset,
      rotation,
      startAngle,
      endAngle: startAngle + angle,
    };
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <defs>
          {data.map((item, index) => (
            <linearGradient
              key={`gradient-${item.id}`}
              id={`gradient-${item.id}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={item.color} stopOpacity="1" />
              <stop offset="100%" stopColor={item.color} stopOpacity="0.6" />
            </linearGradient>
          ))}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
            <feOffset dx="2" dy="2" />
            <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />
            <feFlood floodColor="#000000" floodOpacity="0.5" />
            <feComposite in2="shadowDiff" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        
        {segments.map((segment, index) => {
          const isHovered = hoveredSegment === segment.id;
          const scale = isHovered ? 1.05 : 1;
          const extraStroke = isHovered ? 8 : 0;
          
          return (
            <motion.g
              key={segment.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
              }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.5,
                ease: "easeOut"
              }}
            >
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={`url(#gradient-${segment.id})`}
                strokeWidth={strokeWidth + extraStroke}
                strokeDasharray={`${segment.strokeDasharray} ${circumference}`}
                strokeLinecap="round"
                filter={isHovered ? "url(#glow)" : undefined}
                style={{
                  transformOrigin: `${center}px ${center}px`,
                  transform: `rotate(${segment.rotation}deg)`,
                }}
                animate={{
                  strokeWidth: strokeWidth + extraStroke,
                }}
                transition={{ duration: 0.2 }}
                onMouseEnter={() => onHover(segment.id)}
                onMouseLeave={() => onHover(null)}
                className="cursor-pointer transition-all duration-300"
                data-testid={`chart-segment-${segment.id}`}
              />
            </motion.g>
          );
        })}
      </svg>
      
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl" />
            <div className="relative glass rounded-full p-6 border border-white/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={hoveredSegment || "total"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-lg font-bold text-foreground"
                >
                  {hoveredSegment 
                    ? segments.find(s => s.id === hoveredSegment)?.name
                    : "Total"
                  }
                </motion.p>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.p
                  key={hoveredSegment ? `${hoveredSegment}-pct` : "total-pct"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                >
                  {hoveredSegment 
                    ? `${segments.find(s => s.id === hoveredSegment)?.percentage.toFixed(0)}%`
                    : "100%"
                  }
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function KPICard({ 
  icon: Icon, 
  label, 
  value, 
  suffix,
  gradient,
  delay 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string;
  suffix?: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="relative group"
    >
      <div className={`absolute inset-0 ${gradient} opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-opacity duration-300`} />
      <Card className="relative glass border-white/10 bg-[rgba(15,15,35,0.8)] overflow-visible">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${gradient} bg-opacity-20 border border-white/10`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">{label}</p>
              <p className="text-xl font-bold text-foreground mt-0.5">
                {value}
                {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function HighlightCard({ 
  title, 
  name, 
  value,
  icon: Icon,
  colorClass,
  iconColorClass
}: { 
  title: string; 
  name: string;
  value?: number;
  icon: React.ElementType;
  colorClass: string;
  iconColorClass: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative group"
    >
      <Card className="glass border-white/10 bg-[rgba(15,15,35,0.6)] h-full">
        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
          <div className={`p-3 rounded-xl ${colorClass} border border-white/10`}>
            <Icon className={`w-5 h-5 ${iconColorClass}`} />
          </div>
          <Badge variant="outline" className={`text-[10px] border-white/20 ${iconColorClass}`}>
            {title}
          </Badge>
          <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">
            {name}
          </p>
          {value && (
            <p className="text-sm font-bold text-primary">
              ({formatCurrency(value)})
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AllocationLegend({ 
  data, 
  hoveredSegment, 
  onHover 
}: { 
  data: typeof mockAllocations; 
  hoveredSegment: string | null;
  onHover: (id: string | null) => void;
}) {
  return (
    <div className="space-y-2">
      {data.map((item, index) => {
        const isHovered = hoveredSegment === item.id;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            onMouseEnter={() => onHover(item.id)}
            onMouseLeave={() => onHover(null)}
            className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
              isHovered 
                ? "bg-white/10 scale-[1.02]" 
                : "bg-white/5 hover:bg-white/8"
            }`}
            data-testid={`legend-item-${item.id}`}
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: isHovered ? 1.2 : 1 }}
                className="w-3 h-3 rounded-full shadow-lg"
                style={{ 
                  backgroundColor: item.color,
                  boxShadow: isHovered ? `0 0 12px ${item.color}` : 'none'
                }}
              />
              <span className={`text-sm transition-colors ${isHovered ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-mono transition-colors ${isHovered ? "text-foreground" : "text-muted-foreground"}`}>
                {formatCurrency(item.value)}
              </span>
              <Badge 
                variant="outline" 
                className="text-xs border-white/20 min-w-[45px] justify-center"
                style={{ 
                  borderColor: isHovered ? item.color : undefined,
                  color: isHovered ? item.color : undefined
                }}
              >
                {item.percentage}%
              </Badge>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function InvestmentsModal({ isOpen, onClose }: InvestmentsModalProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"tipo" | "investidor" | "instituicao">("tipo");

  return (
    <Modal
      id="investments-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Gestão de Aportes"
      subtitle="Acompanhe seus investimentos e alocação de carteira"
      maxWidth="4xl"
      footer={
        <div className="flex items-center justify-between w-full gap-4 flex-wrap">
          <Button 
            variant="outline" 
            className="gap-2 border-primary/30 text-primary"
            data-testid="button-import-image"
          >
            <ImagePlus className="w-4 h-4" />
            Importar por Imagem
          </Button>
          <div className="flex items-center gap-3">
            <RadioGroup 
              value={viewMode} 
              onValueChange={(v) => setViewMode(v as typeof viewMode)}
              className="flex items-center gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tipo" id="tipo" className="border-white/30" />
                <Label htmlFor="tipo" className="text-sm text-muted-foreground cursor-pointer">Por Tipo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="investidor" id="investidor" className="border-white/30" />
                <Label htmlFor="investidor" className="text-sm text-muted-foreground cursor-pointer">Por Investidor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="instituicao" id="instituicao" className="border-white/30" />
                <Label htmlFor="instituicao" className="text-sm text-muted-foreground cursor-pointer">Por Instituição</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      }
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <KPICard
                icon={Wallet}
                label="Patrimônio Total"
                value={formatCurrency(mockKPIs.patrimonioTotal)}
                gradient="bg-gradient-to-br from-primary to-primary/50"
                delay={0}
              />
              <KPICard
                icon={DollarSign}
                label="Valor Aplicado"
                value={formatCurrency(mockKPIs.valorAplicado)}
                gradient="bg-gradient-to-br from-accent to-accent/50"
                delay={0.1}
              />
              <KPICard
                icon={TrendingUp}
                label="Resultado"
                value={formatCurrency(mockKPIs.resultado)}
                gradient="bg-gradient-to-br from-success to-success/50"
                delay={0.2}
              />
              <KPICard
                icon={Target}
                label="Rentabilidade"
                value={mockKPIs.rentabilidade.toFixed(2)}
                suffix="%"
                gradient="bg-gradient-to-br from-amber-500 to-amber-500/50"
                delay={0.3}
              />
            </div>

            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-foreground">Destaques</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <HighlightCard
                  title="Top Winner"
                  name={mockHighlights.topWinner.name}
                  icon={Trophy}
                  colorClass="bg-gradient-to-br from-amber-500/20 to-amber-600/10"
                  iconColorClass="text-amber-400"
                />
                <HighlightCard
                  title="Top Loser"
                  name={mockHighlights.topLoser.name}
                  icon={TrendingDown}
                  colorClass="bg-gradient-to-br from-red-500/20 to-red-600/10"
                  iconColorClass="text-red-400"
                />
                <HighlightCard
                  title="Maior Posição"
                  name={mockHighlights.maiorPosicao.name}
                  value={mockHighlights.maiorPosicao.value}
                  icon={Target}
                  colorClass="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10"
                  iconColorClass="text-emerald-400"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold text-foreground">Detalhes da Alocação</h3>
              </div>
              <Card className="glass border-white/10 bg-[rgba(15,15,35,0.6)]">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="font-medium text-muted-foreground border-b border-white/10 pb-2">Grupo</div>
                    <div className="font-medium text-muted-foreground border-b border-white/10 pb-2 text-right">Valores (R$)</div>
                    {mockAllocations.map((item) => (
                      <motion.div
                        key={item.id}
                        className="contents"
                        onMouseEnter={() => setHoveredSegment(item.id)}
                        onMouseLeave={() => setHoveredSegment(null)}
                      >
                        <div 
                          className={`py-1.5 transition-colors cursor-pointer flex items-center gap-2 ${
                            hoveredSegment === item.id ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          {item.name}
                        </div>
                        <div 
                          className={`py-1.5 text-right font-mono transition-colors cursor-pointer ${
                            hoveredSegment === item.id ? "text-foreground font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {formatCurrency(item.value)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Alocação</h3>
            </div>
            <Card className="glass border-white/10 bg-[rgba(15,15,35,0.6)] flex-1">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-full blur-3xl scale-150" />
                  <PremiumDonutChart
                    data={mockAllocations}
                    size={280}
                    strokeWidth={42}
                    hoveredSegment={hoveredSegment}
                    onHover={setHoveredSegment}
                  />
                </div>
                
                <motion.div 
                  className="w-full mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <AllocationLegend
                    data={mockAllocations}
                    hoveredSegment={hoveredSegment}
                    onHover={setHoveredSegment}
                  />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <Button
            variant="ghost"
            className="w-full gap-2 text-muted-foreground border border-white/10 bg-white/5"
            data-testid="button-expand-portfolio"
          >
            <Wallet className="w-4 h-4" />
            Carteira de Investimentos
            <ChevronDown className="w-4 h-4 ml-auto" />
          </Button>
        </motion.div>
      </motion.div>
    </Modal>
  );
}

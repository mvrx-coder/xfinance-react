import { useState } from "react";
import { motion } from "framer-motion";
import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Trophy,
  Target,
  PieChart,
  Layers,
  ImagePlus,
  Wallet
} from "lucide-react";

import {
  mockAllocations,
  mockHighlights,
  mockKPIs,
  containerVariants,
  itemVariants,
  formatCurrency,
} from "./investments/data";
import { KPICard } from "./investments/KPICard";
import { HighlightCard } from "./investments/HighlightCard";
import { AllocationLegend } from "./investments/AllocationLegend";
import { PremiumDonutChart } from "./investments/PremiumDonutChart";
import { PortfolioGrid } from "./investments/PortfolioGrid";

interface InvestmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
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

        <PortfolioGrid />
      </motion.div>
    </Modal>
  );
}

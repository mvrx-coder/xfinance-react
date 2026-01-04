/**
 * KPICardPremium - Card de KPI com visual premium
 * 
 * Features:
 * - AnimatedCounter: valores animam de 0 ao valor final
 * - Sparkline: mini gráfico de tendência
 * - Goal Progress: barra de progresso animada
 * - Trend Badge: indicador de tendência positiva/negativa
 * - Cores por tipo de ícone
 */

"use client"

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, FileText, Target, Activity, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface KPICardPremiumProps {
  title: string;
  value: string;
  trend?: number;
  icon: "dollar" | "file" | "target" | "activity" | "trending";
  isActive?: boolean;
  onClick?: () => void;
  compact?: boolean;
  sparklineData?: number[];
  previousValue?: string;
  goalProgress?: number;
}

const iconMap: Record<string, LucideIcon> = {
  dollar: DollarSign,
  file: FileText,
  target: Target,
  activity: Activity,
  trending: TrendingUp,
};

const accentColors: Record<string, string> = {
  dollar: "#CE62D9",
  file: "#06B6D4",
  target: "#10B981",
  activity: "#F59E0B",
  trending: "#8B5CF6",
};

function AnimatedCounter({ value }: { value: string }) {
  const numericValue = Number.parseFloat(value.replace(/[^\d.-]/g, ""));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / 1000, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(numericValue * easeOutQuart);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [numericValue]);

  const formattedValue = value.replace(/[\d.-]+/, displayValue.toFixed(value.includes(".") ? 2 : 0));
  return <span>{formattedValue}</span>;
}

export function KPICardPremium({ 
  title, 
  value, 
  trend, 
  icon, 
  isActive = false, 
  onClick, 
  compact = false,
  sparklineData,
  previousValue,
  goalProgress,
}: KPICardPremiumProps) {
  const Icon = iconMap[icon];
  const isPositive = trend ? trend > 0 : false;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const accentColor = accentColors[icon] || "#CE62D9";

  if (compact) {
    return (
      <motion.div 
        whileHover={{ scale: 1.02, y: -2 }} 
        whileTap={{ scale: 0.98 }} 
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={onClick}
        className={`h-full ${onClick ? "cursor-pointer" : ""}`}
      >
        <Card
          className={`
            relative overflow-hidden p-4 backdrop-blur-xl h-full flex flex-col justify-between
            bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-900/50
            border border-white/5
            ${isActive ? "ring-2 shadow-lg" : "hover:border-white/10"}
            transition-all duration-300
          `}
          style={{
            boxShadow: isActive
              ? `0 0 25px ${accentColor}40, 0 8px 30px -8px rgba(0,0,0,0.5)`
              : "0 4px 16px -4px rgba(0,0,0,0.3)",
            ...(isActive && { ringColor: `${accentColor}50` }),
          }}
          data-testid={`kpi-card-${icon}`}
        >
          <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <motion.div
                  className="p-1.5 rounded-lg border"
                  style={{
                    backgroundColor: `${accentColor}15`,
                    borderColor: `${accentColor}30`,
                  }}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate">{title}</span>
                  {previousValue && (
                    <span className="text-[9px] text-slate-500 font-mono tabular-nums">Ant: {previousValue}</span>
                  )}
                </div>
              </div>

              {trend !== undefined && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`
                    flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium
                    backdrop-blur-sm border
                    ${isPositive
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                    }
                  `}
                >
                  <TrendIcon className="w-2.5 h-2.5" />
                  <span className="font-mono tabular-nums">{Math.abs(trend)}%</span>
                </motion.div>
              )}
            </div>

            <div className="text-lg font-bold font-mono tabular-nums text-white tracking-tight mb-1">
              <AnimatedCounter value={value} />
            </div>

            {sparklineData && sparklineData.length > 0 && (
              <div className="h-6 -mx-1 opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData.map((val, idx) => ({ value: val, index: idx }))}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={accentColor}
                      strokeWidth={1.5}
                      dot={false}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {goalProgress !== undefined && (
              <div className="mt-auto space-y-0.5">
                <div className="flex items-center justify-between text-[9px] text-slate-500 font-medium">
                  <span>Meta</span>
                  <span className="font-mono tabular-nums">{goalProgress}%</span>
                </div>
                <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${accentColor}, ${accentColor}dd)`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(goalProgress, 100)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                  />
                </div>
              </div>
            )}
          </div>

          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />

          <div
            className="absolute top-0 right-0 w-12 h-12 opacity-10"
            style={{
              background: `radial-gradient(circle at top right, ${accentColor}, transparent)`,
            }}
          />
        </Card>
      </motion.div>
    );
  }

  // Versão normal (não compact)
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -4 }} 
      whileTap={{ scale: 0.98 }} 
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onClick}
      className={onClick ? "cursor-pointer" : ""}
    >
      <Card
        className={`
          relative overflow-hidden p-6 backdrop-blur-xl
          bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-900/50
          border border-white/5
          ${isActive ? "ring-2 shadow-lg" : "hover:border-white/10"}
          transition-all duration-300
        `}
        style={{
          boxShadow: isActive
            ? `0 0 30px ${accentColor}40, 0 10px 40px -10px rgba(0,0,0,0.5)`
            : "0 4px 20px -4px rgba(0,0,0,0.3)",
        }}
        data-testid={`kpi-card-${icon}`}
      >
        <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          animate={{
            background: [
              `radial-gradient(circle at 20% 50%, ${accentColor}10 0%, transparent 50%)`,
              `radial-gradient(circle at 80% 50%, ${accentColor}10 0%, transparent 50%)`,
              `radial-gradient(circle at 20% 50%, ${accentColor}10 0%, transparent 50%)`,
            ],
          }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-2.5 rounded-xl border"
                style={{
                  backgroundColor: `${accentColor}15`,
                  borderColor: `${accentColor}30`,
                }}
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Icon className="w-5 h-5" style={{ color: accentColor }} />
              </motion.div>
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider font-sans block">
                  {title}
                </span>
                {previousValue && (
                  <span className="text-[10px] text-slate-500 font-mono tabular-nums">Anterior: {previousValue}</span>
                )}
              </div>
            </div>

            {trend !== undefined && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                  backdrop-blur-sm border
                  ${isPositive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                  }
                `}
              >
                <TrendIcon className="w-3.5 h-3.5" />
                <span className="font-mono tabular-nums">{Math.abs(trend)}%</span>
              </motion.div>
            )}
          </div>

          <div className="text-3xl font-bold font-mono tabular-nums text-white tracking-tight mb-3">
            <AnimatedCounter value={value} />
          </div>

          {sparklineData && sparklineData.length > 0 && (
            <div className="h-10 -mx-2 mb-2 opacity-60 hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData.map((val, idx) => ({ value: val, index: idx }))}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={accentColor}
                    strokeWidth={2}
                    dot={false}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {goalProgress !== undefined && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>Meta Atingida</span>
                <span className="font-mono tabular-nums">{goalProgress}%</span>
              </div>
              <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${accentColor}, ${accentColor}dd)`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(goalProgress, 100)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        <div
          className="absolute top-0 right-0 w-20 h-20 opacity-10"
          style={{
            background: `radial-gradient(circle at top right, ${accentColor}, transparent)`,
          }}
        />
      </Card>
    </motion.div>
  );
}


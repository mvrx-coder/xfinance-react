import { motion, AnimatePresence } from "framer-motion";
import { mockAllocations } from "./data";

interface PremiumDonutChartProps {
  data: typeof mockAllocations;
  size?: number;
  strokeWidth?: number;
  hoveredSegment: string | null;
  onHover: (id: string | null) => void;
}

export function PremiumDonutChart({ data, size = 280, strokeWidth = 45, hoveredSegment, onHover }: PremiumDonutChartProps) {
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

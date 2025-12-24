import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Sparkles,
} from "lucide-react";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info" | "default";
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    gradient: "from-success/20 to-success/5",
    border: "border-success/30",
    iconColor: "text-success",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]",
  },
  error: {
    icon: AlertCircle,
    gradient: "from-destructive/20 to-destructive/5",
    border: "border-destructive/30",
    iconColor: "text-destructive",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.2)]",
  },
  warning: {
    icon: AlertTriangle,
    gradient: "from-warning/20 to-warning/5",
    border: "border-warning/30",
    iconColor: "text-warning",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]",
  },
  info: {
    icon: Info,
    gradient: "from-accent/20 to-accent/5",
    border: "border-accent/30",
    iconColor: "text-accent",
    glow: "shadow-[0_0_20px_rgba(0,188,212,0.2)]",
  },
  default: {
    icon: Sparkles,
    gradient: "from-primary/20 to-primary/5",
    border: "border-primary/30",
    iconColor: "text-primary",
    glow: "shadow-[0_0_20px_rgba(206,98,217,0.2)]",
  },
};

const toastVariants = {
  hidden: { 
    opacity: 0, 
    x: 100,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
    },
  },
  exit: { 
    opacity: 0, 
    x: 100,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [progress, setProgress] = useState(100);
  const config = toastConfig[toast.type];
  const Icon = config.icon;
  const duration = toast.duration || 5000;

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateProgress = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const percentage = (remaining / duration) * 100;
      setProgress(percentage);

      if (percentage > 0) {
        requestAnimationFrame(updateProgress);
      }
    };

    const animation = requestAnimationFrame(updateProgress);
    const timeout = setTimeout(() => onDismiss(toast.id), duration);

    return () => {
      cancelAnimationFrame(animation);
      clearTimeout(timeout);
    };
  }, [toast.id, duration, onDismiss]);

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`relative overflow-hidden w-[380px] rounded-xl glass-strong border ${config.border} ${config.glow}`}
      data-testid={`toast-${toast.id}`}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-50`} />
      
      {/* Content */}
      <div className="relative flex items-start gap-4 p-4">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.gradient} border border-white/10 flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <h4 className="text-sm font-bold text-foreground">{toast.title}</h4>
          {toast.message && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {toast.message}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 glass border border-white/10 -mt-1"
          onClick={() => onDismiss(toast.id)}
          data-testid={`button-close-toast-${toast.id}`}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
        <motion.div
          className={`h-full bg-gradient-to-r ${config.gradient.replace('/20', '/60').replace('/5', '/30')}`}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3" data-testid="toast-container">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

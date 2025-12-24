import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

interface StatusMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

interface StatusBarProps {
  messages: StatusMessage[];
  onDismiss?: (id: string) => void;
}

const statusConfig = {
  success: {
    icon: CheckCircle2,
    gradient: "from-success/15 to-success/5",
    border: "border-success/30",
    text: "text-success",
  },
  error: {
    icon: AlertCircle,
    gradient: "from-destructive/15 to-destructive/5",
    border: "border-destructive/30",
    text: "text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    gradient: "from-warning/15 to-warning/5",
    border: "border-warning/30",
    text: "text-warning",
  },
  info: {
    icon: Info,
    gradient: "from-accent/15 to-accent/5",
    border: "border-accent/30",
    text: "text-accent",
  },
};

const messageVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", damping: 20, stiffness: 300 }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95,
    transition: { duration: 0.15 }
  },
};

export function StatusBar({ messages, onDismiss }: StatusBarProps) {
  if (messages.length === 0) return null;

  return (
    <div className="px-3 py-2" data-testid="status-bar">
      <AnimatePresence mode="popLayout">
        {messages.map((msg) => {
          const config = statusConfig[msg.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={msg.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              className={`flex items-center justify-between gap-3 px-4 py-3 mb-2 last:mb-0 rounded-xl glass border ${config.border} bg-gradient-to-r ${config.gradient}`}
              data-testid={`status-${msg.id}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${config.gradient} border border-white/10`}>
                  <Icon className={`w-4 h-4 ${config.text}`} />
                </div>
                <span className="text-sm font-medium text-foreground">{msg.message}</span>
              </div>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDismiss(msg.id)}
                  className="glass border border-white/10"
                  data-testid={`button-dismiss-${msg.id}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

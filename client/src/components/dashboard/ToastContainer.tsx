import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const toastConfig: Record<
  ToastType,
  { icon: typeof CheckCircle; className: string; progressColor: string }
> = {
  success: {
    icon: CheckCircle,
    className:
      "bg-card border border-success/30 shadow-lg shadow-success/10",
    progressColor: "bg-success",
  },
  error: {
    icon: AlertCircle,
    className:
      "bg-card border border-destructive/30 shadow-lg shadow-destructive/10",
    progressColor: "bg-destructive",
  },
  warning: {
    icon: AlertTriangle,
    className:
      "bg-card border border-warning/30 shadow-lg shadow-warning/10",
    progressColor: "bg-warning",
  },
  info: {
    icon: Info,
    className: "bg-card border border-accent/30 shadow-lg shadow-accent/10",
    progressColor: "bg-accent",
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 5000;
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.id, duration, onDismiss]);

  return (
    <div
      className={`relative overflow-hidden rounded-lg p-4 min-w-[300px] max-w-[400px] animate-in slide-in-from-right-full duration-300 ${config.className}`}
      data-testid={`toast-${toast.id}`}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`w-5 h-5 flex-shrink-0 ${
            toast.type === "success"
              ? "text-success"
              : toast.type === "error"
                ? "text-destructive"
                : toast.type === "warning"
                  ? "text-warning"
                  : "text-accent"
          }`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {toast.message}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          onClick={() => onDismiss(toast.id)}
          data-testid={`button-close-toast-${toast.id}`}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
        <div
          className={`h-full transition-all duration-100 ${config.progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      id="toast-container"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-3"
      data-testid="toast-container"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

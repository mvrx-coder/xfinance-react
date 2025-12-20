import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type StatusType = "success" | "error" | "warning" | "info";

interface StatusMessage {
  id: string;
  type: StatusType;
  message: string;
}

interface StatusBarProps {
  messages: StatusMessage[];
  onDismiss?: (id: string) => void;
}

const statusConfig: Record<
  StatusType,
  { icon: typeof CheckCircle; className: string }
> = {
  success: {
    icon: CheckCircle,
    className:
      "bg-success/10 border-l-4 border-l-success text-success",
  },
  error: {
    icon: AlertCircle,
    className:
      "bg-destructive/10 border-l-4 border-l-destructive text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    className:
      "bg-warning/10 border-l-4 border-l-warning text-warning",
  },
  info: {
    icon: Info,
    className: "bg-accent/10 border-l-4 border-l-accent text-accent",
  },
};

export function StatusBar({ messages, onDismiss }: StatusBarProps) {
  if (messages.length === 0) return null;

  return (
    <div
      id="status-msg"
      className="mx-2 mb-2 space-y-2"
      data-testid="status-bar"
    >
      {messages.map((msg) => {
        const config = statusConfig[msg.type];
        const Icon = config.icon;

        return (
          <div
            key={msg.id}
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg ${config.className}`}
            data-testid={`status-message-${msg.id}`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{msg.message}</span>
            </div>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDismiss(msg.id)}
                data-testid={`button-dismiss-${msg.id}`}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}

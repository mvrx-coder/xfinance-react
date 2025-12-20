import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function Modal({
  id,
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "lg",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id={`${id}-mask`}
      className="fixed inset-0 z-50 flex items-center justify-center"
      data-testid={`modal-${id}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        data-testid={`modal-backdrop-${id}`}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        id={id}
        className={`relative w-full ${maxWidthClasses[maxWidth]} mx-4 bg-card border border-card-border rounded-xl shadow-2xl animate-in zoom-in-95 fade-in duration-200`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <h2
            id={`${id}-title`}
            className="text-lg font-semibold text-foreground"
            data-testid={`modal-title-${id}`}
          >
            {title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid={`button-close-modal-${id}`}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/50 bg-muted/30 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface ModalFormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}

export function ModalFormField({
  label,
  children,
  required,
  htmlFor,
}: ModalFormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

interface ModalFormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2;
}

export function ModalFormGrid({ children, columns = 2 }: ModalFormGridProps) {
  return (
    <div
      className={`grid gap-4 ${columns === 2 ? "md:grid-cols-2" : "grid-cols-1"}`}
    >
      {children}
    </div>
  );
}

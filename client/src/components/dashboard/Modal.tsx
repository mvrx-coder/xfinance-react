import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
    },
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.15,
    },
  },
};

export function Modal({
  id,
  isOpen,
  onClose,
  title,
  subtitle,
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id={`${id}-mask`}
          className="fixed inset-0 z-50 flex items-center justify-center"
          data-testid={`modal-${id}`}
        >
          {/* Backdrop with blur */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-background/60 backdrop-blur-xl"
            onClick={onClose}
            data-testid={`modal-backdrop-${id}`}
          />

          {/* Modal Content */}
          <motion.div
            ref={modalRef}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            id={id}
            className={`relative w-full ${maxWidthClasses[maxWidth]} mx-4 glass-strong rounded-2xl shadow-2xl border border-white/15 overflow-hidden`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
          >
            {/* Gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary" />

            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2
                    id={`${id}-title`}
                    className="text-lg font-bold text-foreground"
                    data-testid={`modal-title-${id}`}
                  >
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="glass border border-white/10 -mt-1"
                data-testid={`button-close-modal-${id}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-gradient-to-r from-muted/20 via-transparent to-muted/20">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ModalFormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
}

export function ModalFormGrid({ children, columns = 2 }: ModalFormGridProps) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div className={`grid ${colClasses[columns]} gap-5`}>
      {children}
    </div>
  );
}

interface ModalFormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  hint?: string;
  htmlFor?: string;
}

export function ModalFormField({ 
  label, 
  required = false, 
  children, 
  className = "",
  hint,
  htmlFor,
}: ModalFormFieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-foreground flex items-center gap-1">
        {label}
        {required && <span className="text-primary">*</span>}
      </label>
      {children}
      {hint && (
        <span className="text-xs text-muted-foreground">{hint}</span>
      )}
    </div>
  );
}

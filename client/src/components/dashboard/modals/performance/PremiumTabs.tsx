import { motion } from "framer-motion";
import { tabs, TabType } from "./data";

interface PremiumTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function PremiumTabs({ activeTab, onTabChange }: PremiumTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-[rgba(15,15,35,0.6)] border border-white/10 backdrop-blur-sm">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              isActive 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground/80"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid={`tab-${tab.id}`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-lg border border-primary/30"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <Icon className={`w-4 h-4 relative z-10 ${isActive ? "text-primary" : ""}`} />
            <span className="relative z-10 hidden sm:inline">{tab.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

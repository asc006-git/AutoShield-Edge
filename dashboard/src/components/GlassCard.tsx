"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "glow" | "danger" | "warning";
  hoverable?: boolean;
  animate?: boolean;
}

const variantClasses: Record<string, string> = {
  default: "glass-panel",
  glow: "glass-panel-glow",
  danger: "glass-panel-danger",
  warning: "glass-panel-warning",
};

function GlassCard({
  children,
  className = "",
  variant = "default",
  hoverable = true,
  animate = true,
}: GlassCardProps) {
  const baseClasses = ["rounded-xl p-5", variantClasses[variant], hoverable && "glass-panel-hover", className]
    .filter(Boolean)
    .join(" ");

  if (animate) {
    return (
      <motion.div
        className={baseClasses}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={baseClasses}>{children}</div>;
}

export { GlassCard };
export default GlassCard;

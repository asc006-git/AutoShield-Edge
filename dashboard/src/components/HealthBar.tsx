"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "@/context/DashboardContext";
import { Shield, ShieldAlert, Wifi, Zap, Cpu } from "lucide-react";

export default function HealthBar() {
  const { healthScore, activeThreatCount, simulationState, mitigationState } = useDashboard();

  // Color mappings based on score
  const getStatusColors = (score: number) => {
    if (score >= 85) return {
      text: "text-cyber-green",
      bg: "bg-cyber-green",
      border: "border-cyber-green/30",
      glow: "shadow-[0_0_15px_rgba(5,255,196,0.3)]",
      gradient: "from-cyber-green to-cyber-blue",
      label: "SECURE"
    };
    if (score >= 40) return {
      text: "text-cyber-yellow",
      bg: "bg-cyber-yellow",
      border: "border-cyber-yellow/30",
      glow: "shadow-[0_0_15px_rgba(255,179,0,0.3)]",
      gradient: "from-cyber-yellow to-orange-500",
      label: "COMPROMISED (MITIGATING)"
    };
    return {
      text: "text-cyber-red",
      bg: "bg-cyber-red",
      border: "border-cyber-red/40",
      glow: "shadow-[0_0_20px_rgba(255,0,85,0.4)] animate-pulse",
      gradient: "from-cyber-red to-pink-600",
      label: "CRITICAL BREACH"
    };
  };

  const status = getStatusColors(healthScore);

  return (
    <header className="glass-panel border-b border-cyber-border w-full px-6 py-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-black/20">
      
      {/* Target Details */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className={`p-2.5 rounded border ${status.border} ${status.glow} bg-black/40`}>
          {activeThreatCount > 0 ? (
            <ShieldAlert className={`h-6 w-6 ${status.text} animate-bounce`} />
          ) : (
            <Shield className="h-6 w-6 text-cyber-blue" />
          )}
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono tracking-widest uppercase">Target Vehicle Profile</span>
            <span className="text-[10px] bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue px-2 py-0.5 rounded font-mono">
              EDGE-NODE-01
            </span>
          </div>
          <h2 className="font-orbitron font-semibold text-sm text-gray-200 tracking-wide mt-0.5">
            TESLA MODEL S / PLAID V2X
          </h2>
          <span className="text-[9px] text-gray-500 font-mono tracking-wider block">
            VIN: 5YJSA1E1XGFA826C9 • FIRMWARE: v12.1.2-IMMUNE
          </span>
        </div>
      </div>

      {/* Cyber Health Score Slide bar */}
      <div className="flex-1 max-w-xl w-full mx-0 md:mx-8">
        <div className="flex justify-between items-center mb-1 text-xs font-mono">
          <span className="text-gray-400 font-orbitron tracking-wider flex items-center gap-1.5">
            VEHICLE CYBER HEALTH: 
            <span className={`font-bold font-orbitron tracking-normal text-sm ${status.text}`}>
              {healthScore}%
            </span>
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded bg-black/50 border border-white/5 ${status.text}`}>
            {status.label}
          </span>
        </div>

        {/* Health Bar Slider */}
        <div className="h-3 bg-black/50 border border-cyber-border rounded-full overflow-hidden p-[2px]">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${status.gradient}`}
            initial={{ width: "98%" }}
            animate={{ width: `${healthScore}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
          />
        </div>
      </div>

      {/* Connection telemetry and simulation status */}
      <div className="flex items-center gap-6 w-full md:w-auto justify-end">
        
        {/* Active Simulation Mode Tag */}
        <AnimatePresence mode="wait">
          {simulationState !== "idle" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyber-red/10 border border-cyber-red/30 text-cyber-red text-xs font-mono animate-pulse"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>SIMULATING: {simulationState.toUpperCase()}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Self-healing Status Tag */}
        <AnimatePresence mode="wait">
          {mitigationState !== "idle" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono border
                ${mitigationState === "mitigating" 
                  ? "bg-cyber-yellow/10 border-cyber-yellow/30 text-cyber-yellow" 
                  : "bg-cyber-green/10 border-cyber-green/30 text-cyber-green"
                }
              `}
            >
              <Cpu className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: mitigationState === "mitigating" ? "2s" : "0s" }} />
              <span>AGENT: {mitigationState.toUpperCase()}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* V2X Connection Latency */}
        <div className="text-right hidden sm:block">
          <div className="flex items-center gap-1.5 justify-end">
            <Wifi className="h-4 w-4 text-cyber-blue" />
            <span className="text-xs font-mono font-semibold text-gray-200">5G / V2X INTERFACE</span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono tracking-wider">
            LATENCY: 8ms • LOSS: 0.00%
          </span>
        </div>

      </div>

    </header>
  );
}

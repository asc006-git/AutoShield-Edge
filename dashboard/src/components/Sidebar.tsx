"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useDashboard } from "@/context/DashboardContext";
import {
  LayoutDashboard,
  Cpu,
  ShieldAlert,
  Activity,
  BookOpen,
  Shield,
  Terminal,
  Server,
} from "lucide-react";

const menuItems = [
  { name: "Overview", path: "/overview", icon: LayoutDashboard },
  { name: "Behavioral Cyber Twin", path: "/cyber-twin", icon: Cpu },
  { name: "Threat Detection", path: "/threat-detection", icon: ShieldAlert },
  { name: "Cyber Health Analytics", path: "/cyber-health", icon: Activity },
  { name: "Threat Story Engine", path: "/threat-story", icon: BookOpen },
  { name: "Autonomous Defense Agent", path: "/defense-agent", icon: Shield },
  { name: "Attack Simulator", path: "/attack-simulator", icon: Terminal },
  { name: "System Architecture", path: "/system-architecture", icon: Server },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { vehicleStats, simulationState } = useDashboard();

  const isThreatActive = simulationState !== "idle";

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 glass-panel border-r border-[var(--ash-border)] flex flex-col z-40">
      <div className="p-6 pb-4">
        <h1 className="font-orbitron font-bold text-lg tracking-wider text-white text-glow">
          AUTOSHIELD EDGE
        </h1>
        <p className="text-[10px] text-gray-600 font-mono tracking-widest mt-0.5">
          v2.0.0-EDGE.AI
        </p>
        <div className="h-px bg-white/[0.06] mt-4" />
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} href={item.path} className="relative block">
              <motion.div
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                  isActive
                    ? "text-white font-medium"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
                }`}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-500"}`} />
                <span>{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--ash-border)]">
        <div className="flex items-center gap-2 mb-3">
          <Server className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-[10px] font-orbitron tracking-wider text-gray-600">
            EDGE TELEMETRY
          </span>
        </div>

        <div className="space-y-1.5 text-[11px] font-mono">
          <div className="flex justify-between items-center py-1 border-b border-white/[0.03]">
            <span className="text-gray-600">CAN INGRESS</span>
            <span className="text-gray-300 font-semibold">
              {vehicleStats.canRate.toLocaleString()} pkt/s
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-white/[0.03]">
            <span className="text-gray-600">MODEL INFERENCE</span>
            <span className="text-gray-300 font-semibold">
              {vehicleStats.inferenceLatency} ms
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-white/[0.03]">
            <span className="text-gray-600">EDGE CPU LOAD</span>
            <span className="text-gray-300 font-semibold">
              {vehicleStats.cpuLoad}%
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-600">MEM USAGE</span>
            <span className="text-gray-300 font-semibold">
              {vehicleStats.memoryUsage}%
            </span>
          </div>
        </div>

        <div className="mt-3 p-2 rounded bg-white/[0.02] border border-white/[0.05] text-center">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-white/60"
              animate={{ opacity: isThreatActive ? [0.3, 1, 0.3] : 0.6 }}
              transition={{ duration: 1.5, repeat: isThreatActive ? Infinity : 0, ease: "easeInOut" }}
            />
            <span className="text-gray-500 font-orbitron tracking-wider">
              {isThreatActive ? "THREAT DETECTED" : "SYSTEM SECURED"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

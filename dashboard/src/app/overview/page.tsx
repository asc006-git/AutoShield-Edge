"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Activity, AlertTriangle, Cpu, Radio, Clock, HardDrive, Zap, Wifi, Terminal } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useDashboard } from "@/context/DashboardContext";
import GlassCard from "@/components/GlassCard";
import VehicleVisualization from "@/components/VehicleVisualization";
import CyberHealthGauge from "@/components/CyberHealthGauge";

const MAX_CHART_POINTS = 30;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
} as const;

export default function OverviewPage() {
  const {
    healthScore,
    activeThreatCount,
    simulationState,
    mitigationState,
    vehicleStats,
    threatLogs,
    ecuStatuses,
  } = useDashboard();

  const [canHistory, setCanHistory] = useState<{ time: string; rate: number }[]>([]);

  useEffect(() => {
    setCanHistory((prev) => {
      const time = new Date().toLocaleTimeString();
      const next = [...prev, { time, rate: vehicleStats.canRate }];
      if (next.length > MAX_CHART_POINTS) return next.slice(-MAX_CHART_POINTS);
      return next;
    });
  }, [vehicleStats.canRate]);

  const getDefenseStatus = () => {
    switch (mitigationState) {
      case "idle": return { label: "Monitoring", icon: Shield };
      case "monitoring": return { label: "Monitoring", icon: Shield };
      case "mitigating": return { label: "Mitigating", icon: Cpu };
      case "mitigated": return { label: "Restored", icon: Shield };
      default: return { label: "Standby", icon: Shield };
    }
  };

  const defenseStatus = getDefenseStatus();
  const DefenseIcon = defenseStatus.icon;

  const recentLogs = threatLogs.slice(0, 8);

  const getSeverityIndicator = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "bg-white";
      case "HIGH": return "bg-gray-300";
      case "MEDIUM": return "bg-gray-500";
      case "LOW": return "bg-gray-700";
      default: return "bg-gray-700";
    }
  };

  const getSeverityTextClass = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "text-white font-semibold";
      case "HIGH": return "text-gray-300";
      case "MEDIUM": return "text-gray-400";
      case "LOW": return "text-gray-500";
      default: return "text-gray-500";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ACTIVE": return "border-white/20 text-gray-300";
      case "MITIGATING": return "border-white/10 text-gray-400";
      case "MITIGATED": return "border-white/10 text-gray-500";
      case "DISMISSED": return "border-white/5 text-gray-600";
      default: return "border-white/5 text-gray-600";
    }
  };

  const kpis = [
    {
      label: "Cyber Health",
      value: `${healthScore}%`,
      icon: Shield,
      sub: healthScore >= 80 ? "Secure" : healthScore >= 40 ? "Degraded" : "Critical",
    },
    {
      label: "CAN Packet Rate",
      value: `${vehicleStats.canRate.toLocaleString()}`,
      icon: Activity,
      sub: "pkt/s",
    },
    {
      label: "Active Threats",
      value: `${activeThreatCount}`,
      icon: AlertTriangle,
      sub: activeThreatCount > 0 ? "Action Required" : "All Clear",
    },
    {
      label: "Defense Status",
      value: defenseStatus.label,
      icon: DefenseIcon,
      sub: mitigationState === "mitigated" ? "System Restored" : "Active",
    },
  ];

  const quickStats = [
    { label: "CPU Load", value: `${vehicleStats.cpuLoad}%`, icon: Cpu },
    { label: "Memory Usage", value: `${vehicleStats.memoryUsage}%`, icon: HardDrive },
    { label: "Inference Latency", value: `${vehicleStats.inferenceLatency}ms`, icon: Clock },
    { label: "Data Reduction", value: vehicleStats.dataReduction, icon: Zap },
  ];

  const totalEcuCount = Object.keys(ecuStatuses).length;
  const secureCount = Object.values(ecuStatuses).filter((e) => e.status === "secure").length;

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold font-orbitron tracking-wider text-gray-100">
              COMMAND CENTER
            </h1>
            <p className="text-sm text-gray-500 font-mono mt-1">
              Real-time vehicle cyber immune system — edge-AI behavioral monitoring and autonomous self-healing
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-mono text-gray-600 tracking-wider">SYSTEM STATUS</p>
            <p className={`text-xs font-mono mt-0.5 ${simulationState !== "idle" ? "text-white" : "text-gray-400"}`}>
              {simulationState !== "idle" ? "INCIDENT ACTIVE" : "ALL NOMINAL"}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <GlassCard key={kpi.label} className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <Icon className="h-5 w-5 text-gray-300" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-gray-500 tracking-wider uppercase">{kpi.label}</p>
                <p className="text-lg font-semibold font-orbitron text-gray-100 mt-0.5">{kpi.value}</p>
                <p className="text-[10px] font-mono text-gray-600">{kpi.sub}</p>
              </div>
            </GlassCard>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <VehicleVisualization />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-orbitron tracking-wider text-gray-300 flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-gray-400" />
                CAN TRAFFIC
              </h3>
              <span className="text-[10px] font-mono text-gray-500">{vehicleStats.canRate.toLocaleString()} pkt/s</span>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={canHistory}>
                  <defs>
                    <linearGradient id="canGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" tick={{ fontSize: 8, fill: "#555" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: "#555" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    contentStyle={{
                      background: "#111",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: "#ccc",
                    }}
                    labelStyle={{ color: "#888" }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} fill="url(#canGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="flex justify-center py-4">
            <CyberHealthGauge score={healthScore} size={200} />
          </GlassCard>

          <GlassCard>
            <h3 className="text-xs font-orbitron tracking-wider text-gray-300 mb-3 flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-gray-400" />
              SYSTEM METRICS
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickStats.map((stat) => {
                const StatIcon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-black/30 border border-white/5">
                    <StatIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-[9px] font-mono text-gray-600">{stat.label}</p>
                      <p className="text-xs font-semibold font-mono text-gray-200">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-600">
              <span>ECUs: {totalEcuCount}</span>
              <span>{secureCount} Secure</span>
            </div>
          </GlassCard>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-orbitron tracking-wider text-gray-300 flex items-center gap-2">
              <Radio className="h-4 w-4 text-gray-400" />
              RECENT ACTIVITY
            </h3>
            <span className="text-[10px] font-mono text-gray-600">
              {threatLogs.length} {threatLogs.length === 1 ? "event" : "events"}
            </span>
          </div>
          <div className="space-y-1.5">
            {recentLogs.length > 0 ? (
              recentLogs.map((log, idx) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-black/30 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getSeverityIndicator(log.severity)}`} />
                  <span className="text-[10px] font-mono text-gray-600 w-16 flex-shrink-0">
                    {log.timestamp}
                  </span>
                  <span className={`text-[10px] font-mono flex-shrink-0 w-14 ${getSeverityTextClass(log.severity)}`}>
                    {log.severity}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 flex-shrink-0 w-24 truncate">
                    {log.source} &rarr; {log.target}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 flex-1 truncate">
                    {log.type}
                  </span>
                  <span className={`text-[9px] font-mono flex-shrink-0 px-1.5 py-0.5 rounded border ${getStatusBadgeClass(log.status)}`}>
                    {log.status}
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10">
                <Shield className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                <p className="text-xs font-mono text-gray-600">No threat events recorded</p>
                <p className="text-[10px] font-mono text-gray-700 mt-1">All systems nominal — vehicle is secure</p>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

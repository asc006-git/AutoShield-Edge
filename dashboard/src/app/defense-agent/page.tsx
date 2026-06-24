"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard, DefenseLog } from "@/context/DashboardContext";
import GlassCard from "@/components/GlassCard";
import {
  Shield,
  Activity,
  AlertTriangle,
  ShieldOff,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Play,
  RotateCcw,
  Radio,
  Wifi,
  Ban,
  FileCheck,
  ShieldBan,
  RotateCw,
} from "lucide-react";

const LEVELS = [
  { id: 0, title: "Monitor", subtitle: "Baseline observation", icon: Activity },
  { id: 1, title: "Alert", subtitle: "Anomaly detected", icon: AlertTriangle },
  { id: 2, title: "Contain", subtitle: "Isolate affected node", icon: ShieldOff },
  { id: 3, title: "Mitigate", subtitle: "Active countermeasures", icon: Shield },
  { id: 4, title: "Emergency Response", subtitle: "Full system recovery", icon: ShieldCheck },
];

const DEFENSE_ACTIONS = [
  { id: 0, label: "ECU Isolation", desc: "Isolating compromised nodes", icon: Wifi },
  { id: 1, label: "CAN Filtering", desc: "Filtering malicious frames", icon: Ban },
  { id: 2, label: "Whitelist Enforcement", desc: "Validating message IDs", icon: FileCheck },
  { id: 3, label: "Safe Mode Activation", desc: "Engaging safety protocols", icon: ShieldBan },
  { id: 4, label: "Recovery Procedures", desc: "Restoring normal operation", icon: RotateCw },
];

const ECUS = [
  { id: "0x0A", label: "CGW", x: 80, y: 24 },
  { id: "0x12", label: "ECU", x: 190, y: 24 },
  { id: "0x32", label: "ABS", x: 300, y: 24 },
  { id: "0x1A", label: "TCU", x: 410, y: 24 },
];

const BUS_EDGES = [
  [0, 1], [1, 2], [2, 3],
];

export default function DefenseAgentPage() {
  const {
    isAutonomousMode,
    setAutonomousMode,
    defenseLogs,
    mitigationState,
    simulationState,
    executeMitigation,
    stopSimulation,
  } = useDashboard();

  const [activeLevel, setActiveLevel] = useState(0);
  const [escalating, setEscalating] = useState(false);
  const progressRef = useRef(0);

  useEffect(() => {
    if (simulationState !== "idle") {
      setActiveLevel(0);
      setEscalating(true);
      progressRef.current = 0;
      const interval = setInterval(() => {
        progressRef.current += 1;
        if (progressRef.current > 4) {
          clearInterval(interval);
          setEscalating(false);
          return;
        }
        setActiveLevel(progressRef.current);
      }, 2200);
      return () => clearInterval(interval);
    }
    setActiveLevel(0);
    setEscalating(false);
  }, [simulationState]);

  const currentLevel = escalating
    ? activeLevel
    : mitigationState === "idle" || simulationState === "idle"
      ? 0
      : mitigationState === "mitigated"
        ? 4
        : mitigationState === "mitigating"
          ? 3
          : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-orbitron tracking-wider text-ash-100 flex items-center gap-3">
          <Shield className="h-6 w-6 text-ash-300" />
          AUTONOMOUS DEFENSE AGENT
        </h1>
        <p className="text-sm text-ash-400 font-mono mt-1">
          Self-healing IDS engine. Autonomous policy enforcement with real-time CAN bus isolation, ECU recovery, and adaptive countermeasures.
        </p>
      </div>

      <GlassCard hoverable={false} className="overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-orbitron font-semibold text-ash-300 tracking-widest">
            RESPONSE ESCALATION PROTOCOL
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${simulationState !== "idle" ? "bg-ash-100 animate-pulse" : "bg-ash-600"}`} />
            <span className="text-ash-500">{simulationState !== "idle" ? "ESCALATING" : "STANDBY"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1">
          {LEVELS.map((level, idx) => {
            const isActive = currentLevel >= level.id;
            const isCurrent = currentLevel === level.id;
            const Icon = level.icon;
            return (
              <React.Fragment key={level.id}>
                <motion.div
                  className="flex flex-col items-center gap-2 flex-1 min-w-0"
                  animate={{
                    scale: isCurrent ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                      isActive
                        ? "border-ash-100 bg-ash-900 text-ash-100"
                        : "border-ash-800 bg-ash-950 text-ash-600"
                    }`}
                    animate={isCurrent ? {
                      boxShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 20px rgba(255,255,255,0.15)", "0 0 0px rgba(255,255,255,0)"],
                    } : {}}
                    transition={isCurrent ? { duration: 1.5, repeat: Infinity } : {}}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                  <span className={`text-[10px] font-orbitron font-semibold tracking-wider text-center ${
                    isActive ? "text-ash-200" : "text-ash-600"
                  }`}>
                    {level.title}
                  </span>
                  <span className={`text-[8px] font-mono text-center leading-tight ${
                    isActive ? "text-ash-400" : "text-ash-700"
                  }`}>
                    {level.subtitle}
                  </span>
                </motion.div>
                {idx < LEVELS.length - 1 && (
                  <div className="flex-1 max-w-12 flex items-center justify-center">
                    <svg width="48" height="8" viewBox="0 0 48 8" className="overflow-visible">
                      <line x1="0" y1="4" x2="48" y2="4" stroke={currentLevel > idx ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)"} strokeWidth="1.5" />
                      {currentLevel > idx && (
                        <motion.circle
                          r="3"
                          fill="#f5f5f5"
                          initial={{ cx: 0, cy: 4 }}
                          animate={{ cx: [0, 48, 0], cy: 4 }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                        />
                      )}
                    </svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-ash-500">
          <span>Level {currentLevel}: {LEVELS[currentLevel].title}</span>
          <span className="text-ash-400">{simulationState !== "idle" ? `Active Response • ${Math.round((currentLevel / 4) * 100)}% Complete` : "System Nominal"}</span>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <GlassCard hoverable={false}>
            <h3 className="text-xs font-orbitron font-semibold text-ash-300 tracking-widest mb-5 border-b border-white/5 pb-3">
              AGENT CONFIGURATION
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-ash-950 p-4 rounded-xl border border-white/5">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-semibold text-ash-200 block">AUTONOMOUS MODE</span>
                  <span className="text-[10px] text-ash-500 font-mono leading-snug block">
                    Agent executes self-healing policies without operator intervention
                  </span>
                </div>
                <button
                  onClick={() => setAutonomousMode(!isAutonomousMode)}
                  className="focus:outline-none transition-colors flex-shrink-0"
                >
                  {isAutonomousMode ? (
                    <ToggleRight className="h-9 w-9 text-ash-100" />
                  ) : (
                    <ToggleLeft className="h-9 w-9 text-ash-600" />
                  )}
                </button>
              </div>

              {!isAutonomousMode && simulationState !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-xl border border-ash-600/30 bg-ash-950 flex flex-col gap-3"
                >
                  <div className="flex gap-2.5 items-start text-xs font-mono text-ash-300 leading-relaxed">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-ash-100 animate-pulse" />
                    <div>
                      <span className="font-bold text-ash-100">MANUAL OVERRIDE REQUIRED</span>
                      <p className="text-[10px] text-ash-500 mt-1">
                        Attack detected: <span className="text-ash-200 font-semibold">{simulationState.toUpperCase()}</span>. Autonomous mode disabled.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={executeMitigation}
                      disabled={mitigationState === "mitigating" || mitigationState === "mitigated"}
                      className="flex-1 py-2 rounded bg-ash-200 hover:bg-ash-100 text-ash-950 font-semibold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Play className="h-3.5 w-3.5 fill-ash-950" />
                      EXECUTE DEFENSE
                    </button>
                    <button
                      onClick={stopSimulation}
                      className="py-2 px-3 rounded border border-white/10 hover:bg-ash-900 text-ash-400 font-mono text-xs transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {simulationState !== "idle" && isAutonomousMode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-xl border border-white/10 bg-ash-950 flex items-center gap-2.5"
                >
                  <Radio className="h-4 w-4 text-ash-300 animate-pulse" />
                  <div className="text-[10px] font-mono text-ash-400">
                    <span className="text-ash-200 font-semibold">AUTONOMOUS DEFENSE ENGAGED</span>
                    <br />Response protocol actively executing at Level {currentLevel}
                  </div>
                </motion.div>
              )}

              <div className="flex items-center justify-between text-[10px] font-mono p-1">
                <span className="text-ash-500">Agent Status</span>
                <span className="text-ash-200 font-semibold flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${simulationState !== "idle" ? "bg-ash-100 animate-pulse" : "bg-ash-500"}`} />
                  {simulationState !== "idle" ? "ACTIVE" : "STANDBY"}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-7">
          <GlassCard hoverable={false} className="h-full">
            <h3 className="text-xs font-orbitron font-semibold text-ash-300 tracking-widest mb-4 border-b border-white/5 pb-3 flex items-center gap-2">
              <Radio className="h-3.5 w-3.5 text-ash-400" />
              DEFENSE ACTIVATION SEQUENCE
            </h3>

            <div className="relative w-full aspect-[16/9] bg-ash-950 rounded-lg border border-white/5 overflow-hidden">
              <div className="absolute inset-0 monochrome-grid-dense opacity-30" />

              <svg viewBox="0 0 500 280" className="w-full h-full">
                <defs>
                  <linearGradient id="busGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {BUS_EDGES.map(([from, to], idx) => {
                  const f = ECUS[from];
                  const t = ECUS[to];
                  const isActive = currentLevel > 0;
                  return (
                    <g key={`bus-${idx}`}>
                      <line
                        x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="2"
                      />
                      {isActive && (
                        <motion.line
                          x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                          stroke="rgba(255,255,255,0.4)"
                          strokeWidth="1.5"
                          strokeDasharray="4 6"
                          initial={{ strokeDashoffset: 0 }}
                          animate={{ strokeDashoffset: -20 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        />
                      )}
                    </g>
                  );
                })}

                {ECUS.map((ecu, idx) => {
                  const isCompromised = simulationState !== "idle" && idx === 0;
                  const isIsolated = currentLevel >= 2 && isCompromised;
                  const isRecovered = currentLevel >= 4;

                  let nodeState = "idle";
                  if (isRecovered) nodeState = "recovered";
                  else if (currentLevel >= 3) nodeState = "mitigating";
                  else if (isIsolated) nodeState = "isolated";
                  else if (isCompromised) nodeState = "compromised";
                  else if (currentLevel >= 1) nodeState = "alert";

                  const nodeGlow = nodeState === "compromised" || nodeState === "isolated" || nodeState === "mitigating";

                  return (
                    <g key={ecu.id}>
                      {nodeGlow && (
                        <motion.circle
                          cx={ecu.x} cy={ecu.y} r="20"
                          fill="none"
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="1"
                          animate={{ r: [20, 28, 20], opacity: [0.3, 0, 0.3] }}
                          transition={{ repeat: Infinity, duration: 2, delay: idx * 0.3 }}
                        />
                      )}
                      {isIsolated && (
                        <motion.rect
                          x={ecu.x - 22} y={ecu.y - 22}
                          width="44" height="44"
                          rx="4"
                          fill="none"
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        />
                      )}
                      {isRecovered && (
                        <motion.circle
                          cx={ecu.x} cy={ecu.y} r="18"
                          fill="none"
                          stroke="rgba(255,255,255,0.4)"
                          strokeWidth="2"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                        />
                      )}
                      <circle
                        cx={ecu.x} cy={ecu.y} r="10"
                        fill={nodeState === "idle" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.12)"}
                        stroke={
                          nodeState === "compromised" ? "rgba(255,255,255,0.5)" :
                          nodeState === "isolated" ? "rgba(255,255,255,0.4)" :
                          nodeState === "mitigating" ? "rgba(255,255,255,0.3)" :
                          nodeState === "recovered" ? "rgba(255,255,255,0.4)" :
                          nodeState === "alert" ? "rgba(255,255,255,0.2)" :
                          "rgba(255,255,255,0.1)"
                        }
                        strokeWidth="1.5"
                      />
                      {nodeState !== "idle" && (
                        <motion.circle
                          cx={ecu.x} cy={ecu.y} r="6"
                          fill="rgba(255,255,255,0.6)"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0.4, 0.8, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                      )}
                      <text
                        x={ecu.x} y={ecu.y + 28}
                        textAnchor="middle"
                        fill="#a3a3a3"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {ecu.label}
                      </text>
                      <text
                        x={ecu.x} y={ecu.y - 16}
                        textAnchor="middle"
                        fill="#525252"
                        fontSize="7"
                        fontFamily="monospace"
                      >
                        {ecu.id}
                      </text>
                    </g>
                  );
                })}

                {currentLevel > 0 && (
                  <motion.text
                    x={250} y={68}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.3)"
                    fontSize="7"
                    fontFamily="monospace"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    CAN BUS v2.0B • 500 kbps
                  </motion.text>
                )}

                <line x1="20" y1="80" x2="480" y2="80" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

                {DEFENSE_ACTIONS.map((action, idx) => {
                  const isActionActive = currentLevel > idx;
                  const isActionCurrent = currentLevel === idx;
                  const yPos = 94 + idx * 36;
                  const Icon = action.icon;

                  return (
                    <g key={action.id}>
                      <motion.rect
                        x="30" y={yPos} width="440" height="28"
                        rx="4"
                        fill={isActionCurrent ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)"}
                        stroke={isActionActive ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)"}
                        strokeWidth="1"
                        initial={false}
                        animate={isActionCurrent ? {
                          stroke: ["rgba(255,255,255,0.15)", "rgba(255,255,255,0.3)", "rgba(255,255,255,0.15)"],
                        } : {}}
                        transition={isActionCurrent ? { duration: 1.5, repeat: Infinity } : {}}
                      />

                      <circle
                        cx="46" cy={yPos + 14} r="6"
                        fill={isActionActive ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.1)"}
                      />
                      {isActionActive && (
                        <motion.circle
                          cx="46" cy={yPos + 14} r="10"
                          fill="none"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="1"
                          animate={{ r: [10, 16, 10], opacity: [0.3, 0, 0.3] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                      )}

                      <text
                        x="64" y={yPos + 12}
                        fill={isActionActive ? "#d4d4d4" : "#525252"}
                        fontSize="10"
                        fontFamily="var(--font-orbitron), monospace"
                        fontWeight="600"
                      >
                        {action.label}
                      </text>
                      <text
                        x="64" y={yPos + 23}
                        fill={isActionActive ? "#737373" : "#404040"}
                        fontSize="8"
                        fontFamily="monospace"
                      >
                        {action.desc}
                      </text>

                      {isActionActive && (
                        <g transform={`translate(440, ${yPos + 4})`}>
                          <motion.line
                            x1="0" y1="10" x2="16" y2="10"
                            stroke="rgba(255,255,255,0.4)"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                            animate={{ strokeDashoffset: [-10, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
                          />
                          <motion.line
                            x1="16" y1="10" x2="12" y2="6"
                            stroke="rgba(255,255,255,0.4)"
                            strokeWidth="1.5"
                          />
                          <motion.line
                            x1="16" y1="10" x2="12" y2="14"
                            stroke="rgba(255,255,255,0.4)"
                            strokeWidth="1.5"
                          />
                        </g>
                      )}

                      {isActionCurrent && simulationState !== "idle" && (
                        <motion.line
                          x1="30" y1={yPos + 28} x2="470" y2={yPos + 28}
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="1"
                          initial={{ scaleX: 0, transformOrigin: "0px 0px" }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.5 }}
                        />
                      )}
                    </g>
                  );
                })}

                {currentLevel === 4 && simulationState !== "idle" && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  >
                    <rect x="160" y="230" width="180" height="24" rx="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    <text
                      x="250" y="246"
                      textAnchor="middle"
                      fill="#f5f5f5"
                      fontSize="10"
                      fontFamily="var(--font-orbitron), monospace"
                      fontWeight="bold"
                    >
                      SYSTEM RECOVERY COMPLETE
                    </text>
                  </motion.g>
                )}
              </svg>

              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[8px] font-mono text-ash-600">
                <span>DEFENSE ACTIVE: {currentLevel}/5</span>
                <span>{simulationState !== "idle" ? `PROTOCOL: LEVEL ${currentLevel}` : "STANDING BY"}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <GlassCard hoverable={false}>
        <h3 className="text-xs font-orbitron font-semibold text-ash-300 tracking-widest mb-4 border-b border-white/5 pb-3 flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-ash-400" />
          DEFENSE ACTION LOG
        </h3>

        <div className="overflow-x-auto border border-white/5 rounded-lg bg-ash-950 max-h-64 overflow-y-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="bg-ash-975 text-ash-500 border-b border-white/5 font-orbitron tracking-wider text-[9px]">
                <th className="p-2.5 font-semibold">TIMESTAMP</th>
                <th className="p-2.5 font-semibold">POLICY</th>
                <th className="p-2.5 font-semibold">ACTION</th>
                <th className="p-2.5 font-semibold">TARGET ECU</th>
                <th className="p-2.5 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {defenseLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-ash-600 text-[10px]">
                    No defense actions recorded. Agent is in standby.
                  </td>
                </tr>
              ) : (
                <AnimatePresence initial={false}>
                  {defenseLogs.map((log) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.25 }}
                      className="hover:bg-white/[0.02]"
                    >
                      <td className="p-2.5 whitespace-nowrap text-ash-500 text-[10px]">{log.timestamp}</td>
                      <td className="p-2.5 whitespace-nowrap text-ash-200 font-semibold text-[10px]">{log.policyId}</td>
                      <td className="p-2.5">
                        <div>
                          <span className="font-semibold text-ash-200 text-[11px]">{log.action}</span>
                          <span className="text-[9px] text-ash-500 block leading-tight mt-0.5">{log.details}</span>
                        </div>
                      </td>
                      <td className="p-2.5 whitespace-nowrap text-ash-300 font-mono text-[10px]">{log.targetEcu}</td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className={`font-semibold flex items-center gap-1.5 text-[10px] ${
                          log.status === "EXECUTED" || log.status === "VERIFIED"
                            ? "text-ash-200"
                            : log.status === "FAILED"
                              ? "text-ash-400"
                              : "text-ash-500"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            log.status === "EXECUTED" || log.status === "VERIFIED"
                              ? "bg-ash-200"
                              : log.status === "FAILED"
                                ? "bg-ash-400"
                                : "bg-ash-600 animate-pulse"
                          }`} />
                          {log.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

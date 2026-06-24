"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  Sliders,
  Radio,
  Gauge,
  Terminal,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { useDashboard, AttackType } from "@/context/DashboardContext";
import GlassCard from "@/components/GlassCard";
import CyberHealthGauge from "@/components/CyberHealthGauge";

interface AttackConfig {
  id: AttackType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  target: string;
  targetLabel: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
}

export default function AttackSimulatorPage() {
  const {
    healthScore,
    simulationState,
    mitigationState,
    triggerAttack,
    stopSimulation,
  } = useDashboard();

  const [consoleLog, setConsoleLog] = useState<string[]>([
    "[SYSTEM] Attack simulator initialized. Secure sandbox ready.",
    "[SYSTEM] All vehicle ECUs reporting normal status.",
  ]);

  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLog]);

  const attacks: AttackConfig[] = [
    {
      id: "normal",
      label: "Normal Operation",
      icon: ShieldCheck,
      target: "All ECUs",
      targetLabel: "System-wide",
      severity: "LOW",
      description: "Restore normal vehicle state. All ECUs secure and reporting nominal telemetry.",
    },
    {
      id: "dos",
      label: "DoS Attack",
      icon: Zap,
      target: "0x0A",
      targetLabel: "Central Gateway",
      severity: "CRITICAL",
      description: "CAN bus flood attack targeting the central gateway. Overwhelms bus with high-priority frames.",
    },
    {
      id: "fuzzy",
      label: "Fuzzy Attack",
      icon: Sliders,
      target: "0x32",
      targetLabel: "ABS Module",
      severity: "CRITICAL",
      description: "Payload entropy fuzzing against the ABS braking module. Random bit injection into safety-critical CAN IDs.",
    },
    {
      id: "gear",
      label: "Gear Spoofing",
      icon: Radio,
      target: "0x1A",
      targetLabel: "Transmission TCU",
      severity: "HIGH",
      description: "Transmission gear position manipulation. False gear ratio values injected into drive cycle.",
    },
    {
      id: "rpm",
      label: "RPM Spoofing",
      icon: Gauge,
      target: "0x12",
      targetLabel: "Engine ECU",
      severity: "HIGH",
      description: "Engine RPM signal manipulation. Artificially inflated tachometer readings affecting torque calculations.",
    },
  ];

  const currentAttack = attacks.find((a) => a.id === simulationState);

  const handleAttack = (attack: AttackConfig) => {
    if (attack.id === "normal" || simulationState === attack.id) {
      stopSimulation();
      setConsoleLog((prev) => [
        ...prev,
        attack.id === "normal"
          ? "[SYSTEM] Normal operation restored. All systems nominal."
          : "[SYSTEM] Simulation halted. Vehicle bus state reset.",
      ]);
      return;
    }
    triggerAttack(attack.id);
  };

  useEffect(() => {
    if (simulationState === "idle" || simulationState === "normal") return;
    const attack = attacks.find((a) => a.id === simulationState);
    if (!attack) return;

    const t1 = setTimeout(() => {
      setConsoleLog((prev) => [
        ...prev,
        `[WARN] Attack vector engaged: ${attack.label}`,
        `[INFO] Targeting ECU ${attack.target} (${attack.targetLabel})...`,
      ]);
    }, 600);

    const t2 = setTimeout(() => {
      setConsoleLog((prev) => [
        ...prev,
        "[WARN] Malicious packet injection in progress. Bus load escalating.",
      ]);
    }, 1600);

    const t3 = setTimeout(() => {
      setConsoleLog((prev) => [
        ...prev,
        `[CRITICAL] ECU ${attack.target} compromised. Anomaly score: 0.94`,
        "[INFO] Edge-IDS ensemble consensus engine analyzing traffic patterns...",
      ]);
    }, 2600);

    const t4 = setTimeout(() => {
      setConsoleLog((prev) => [
        ...prev,
        "[CRITICAL] Consensus threshold exceeded. Confidence: 97.2%",
        "[INFO] Autonomous defense sequence initializing...",
      ]);
    }, 3600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [simulationState]);

  useEffect(() => {
    if (mitigationState === "mitigating") {
      setConsoleLog((prev) => [
        ...prev,
        "[INFO] Self-healing policy deployed. Isolating compromised bus segment.",
        "[INFO] Switching to backup communication channel.",
      ]);
    } else if (mitigationState === "mitigated") {
      setConsoleLog((prev) => [
        ...prev,
        "[SUCCESS] Mitigation complete. Compromised ECUs recalibrated.",
        "[SYSTEM] Telemetry stabilizing. System state: RESTORED.",
      ]);
    }
  }, [mitigationState]);

  const isAttacked = simulationState !== "idle" && simulationState !== "normal";
  const isMitigating = mitigationState === "mitigating";
  const isMitigated = mitigationState === "mitigated";

  const getResponseLevel = () => {
    if (isMitigated) return "RESTORED";
    if (isMitigating) return "MITIGATING";
    if (isAttacked) return "ACTIVE";
    return "STANDBY";
  };

  const getSystemState = () => {
    if (isMitigated) return "STABLE";
    if (isMitigating) return "RECOVERING";
    if (isAttacked) return "COMPROMISED";
    return "SECURE";
  };

  const isEcuHighlighted = (ecu: string) => {
    if (simulationState === "dos" && ecu === "cgw") return true;
    if (simulationState === "fuzzy" && (ecu === "cgw" || ecu === "abs")) return true;
    if (simulationState === "gear" && ecu === "tcu") return true;
    if (simulationState === "rpm" && ecu === "ecu") return true;
    return false;
  };

  const isWheelPulsing = simulationState === "gear" || simulationState === "rpm";
  const isBodyGlowing = simulationState === "dos" || simulationState === "fuzzy";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-orbitron tracking-wider text-white flex items-center gap-2">
          <Terminal className="h-6 w-6 text-white" />
          ATTACK SIMULATOR
        </h1>
        <p className="text-sm text-gray-400 font-mono mt-1">
          Demo environment. Simulated cyber attacks run inside a virtualized CAN bus sandbox.
        </p>
      </div>

      <div className="p-4 rounded-xl border border-gray-700 bg-black/60 flex gap-4 items-start">
        <AlertTriangle className="h-6 w-6 text-gray-400 flex-shrink-0" />
        <div className="font-mono text-xs text-gray-400">
          <span className="font-bold tracking-wider text-gray-300">SECURE SANDBOX</span>
          <p className="text-gray-500 mt-1 leading-relaxed">
            All attacks execute inside an isolated virtual CAN interface. No physical vehicle hardware is affected.
            Toggle any attack to observe real-time IDS detection, health score degradation, and autonomous healing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <GlassCard>
          <span className="text-[10px] text-gray-500 font-mono block">CURRENT ATTACK</span>
          <span className="text-sm font-bold font-orbitron tracking-wider text-white mt-1 block">
            {isAttacked && currentAttack ? currentAttack.label.toUpperCase() : "NONE"}
          </span>
        </GlassCard>
        <GlassCard>
          <span className="text-[10px] text-gray-500 font-mono block">HEALTH SCORE</span>
          <span className="text-sm font-bold font-orbitron tracking-wider text-white mt-1 block">
            {healthScore}%
          </span>
        </GlassCard>
        <GlassCard>
          <span className="text-[10px] text-gray-500 font-mono block">RESPONSE LEVEL</span>
          <span className="text-sm font-bold font-orbitron tracking-wider text-white mt-1 block">
            {getResponseLevel()}
          </span>
        </GlassCard>
        <GlassCard variant={isAttacked ? "danger" : "default"}>
          <span className="text-[10px] text-gray-500 font-mono block">SYSTEM STATE</span>
          <span className="text-sm font-bold font-orbitron tracking-wider text-white mt-1 block">
            {getSystemState()}
          </span>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {attacks.map((attack) => {
              const isActive = simulationState === attack.id;
              const isNormal = attack.id === "normal";
              const Icon = attack.icon;

              return (
                <GlassCard
                  key={attack.id}
                  variant={isActive && !isNormal ? "danger" : "default"}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] text-gray-500 font-mono">
                        TARGET: {attack.targetLabel}
                      </span>
                      {!isNormal && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded border border-gray-600 text-gray-400">
                          {attack.severity}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className={`p-2 rounded border transition-all ${
                          isActive && !isNormal
                            ? "border-white bg-white/10 text-white"
                            : "border-gray-600 text-gray-400 bg-black/40"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="font-orbitron font-semibold text-xs tracking-wider text-white">
                        {attack.label}
                      </h3>
                    </div>

                    <p className="text-[11px] text-gray-400 font-mono leading-normal">
                      {attack.description}
                    </p>

                    <div className="mt-3 p-2.5 rounded bg-black/60 border border-gray-700 text-[10px] font-mono text-gray-500">
                      {isNormal
                        ? "Restores all ECUs to secure baseline. Clears all active threats."
                        : `ECU ${attack.target} — ${attack.targetLabel}`}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAttack(attack)}
                    className={`w-full py-2.5 rounded text-xs font-semibold font-mono flex items-center justify-center gap-1.5 transition-all border mt-4 ${
                      isActive && !isNormal
                        ? "bg-white text-black border-white"
                        : "bg-black/40 text-gray-300 border-gray-600 hover:border-white hover:text-white"
                    }`}
                  >
                    {isActive && !isNormal
                      ? "STOP ATTACK"
                      : isNormal
                      ? "RESTORE NORMAL"
                      : "LAUNCH ATTACK"}
                  </button>
                </GlassCard>
              );
            })}
          </div>

          <GlassCard>
            <h3 className="text-sm font-orbitron font-semibold text-white tracking-wider mb-3 border-b border-gray-700 pb-2 flex items-center gap-2">
              <Activity className="h-4 w-4 text-white" />
              VEHICLE CAN BUS TOPOLOGY
            </h3>
            <div className="bg-black/60 rounded-lg border border-gray-700 p-4">
              <svg viewBox="0 0 400 200" className="w-full h-auto">
                <rect
                  x="60" y="50" width="280" height="95" rx="12"
                  fill="black"
                  stroke={isBodyGlowing ? "white" : "#333"}
                  strokeWidth={isBodyGlowing ? 2 : 1}
                  className={isBodyGlowing ? "animate-pulse" : ""}
                  style={isBodyGlowing ? { filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))" } : {}}
                />

                <line x1="200" y1="50" x2="200" y2="30" stroke="#333" strokeWidth="1" />
                <line x1="130" y1="50" x2="130" y2="30" stroke="#333" strokeWidth="1" />
                <line x1="270" y1="50" x2="270" y2="30" stroke="#333" strokeWidth="1" />
                <rect x="120" y="22" width="160" height="8" rx="2" fill="black" stroke="#333" strokeWidth="1" />

                <g className={isWheelPulsing ? "animate-pulse" : ""}>
                  <rect x="105" y="145" width="40" height="14" rx="4" fill="black" stroke={isWheelPulsing ? "white" : "#444"} strokeWidth={isWheelPulsing ? 1.5 : 1} />
                  <rect x="255" y="145" width="40" height="14" rx="4" fill="black" stroke={isWheelPulsing ? "white" : "#444"} strokeWidth={isWheelPulsing ? 1.5 : 1} />
                </g>

                <g>
                  <circle cx="200" cy="85" r="16" fill="black" stroke={isEcuHighlighted("cgw") ? "white" : "#444"} strokeWidth={isEcuHighlighted("cgw") ? 2 : 1} className={isEcuHighlighted("cgw") ? "animate-pulse" : ""} style={isEcuHighlighted("cgw") ? { filter: "drop-shadow(0 0 6px rgba(255,255,255,0.5))" } : {}} />
                  <text x="200" y="89" textAnchor="middle" fill="white" fontSize="7" fontFamily="monospace">CGW</text>
                  <text x="200" y="111" textAnchor="middle" fill="#555" fontSize="6" fontFamily="monospace">0x0A</text>
                </g>

                <g>
                  <circle cx="200" cy="118" r="12" fill="black" stroke={isEcuHighlighted("ecu") ? "white" : "#444"} strokeWidth={isEcuHighlighted("ecu") ? 2 : 1} className={isEcuHighlighted("ecu") ? "animate-pulse" : ""} style={isEcuHighlighted("ecu") ? { filter: "drop-shadow(0 0 6px rgba(255,255,255,0.5))" } : {}} />
                  <text x="200" y="121" textAnchor="middle" fill="white" fontSize="6" fontFamily="monospace">ECU</text>
                  <text x="200" y="137" textAnchor="middle" fill="#555" fontSize="5" fontFamily="monospace">0x12</text>
                </g>

                <g>
                  <circle cx="100" cy="85" r="12" fill="black" stroke={isEcuHighlighted("tcu") ? "white" : "#444"} strokeWidth={isEcuHighlighted("tcu") ? 2 : 1} className={isEcuHighlighted("tcu") ? "animate-pulse" : ""} style={isEcuHighlighted("tcu") ? { filter: "drop-shadow(0 0 6px rgba(255,255,255,0.5))" } : {}} />
                  <text x="100" y="88" textAnchor="middle" fill="white" fontSize="6" fontFamily="monospace">TCU</text>
                  <text x="100" y="104" textAnchor="middle" fill="#555" fontSize="5" fontFamily="monospace">0x1A</text>
                </g>

                <g>
                  <circle cx="300" cy="85" r="12" fill="black" stroke={isEcuHighlighted("abs") ? "white" : "#444"} strokeWidth={isEcuHighlighted("abs") ? 2 : 1} className={isEcuHighlighted("abs") ? "animate-pulse" : ""} style={isEcuHighlighted("abs") ? { filter: "drop-shadow(0 0 6px rgba(255,255,255,0.5))" } : {}} />
                  <text x="300" y="88" textAnchor="middle" fill="white" fontSize="6" fontFamily="monospace">ABS</text>
                  <text x="300" y="104" textAnchor="middle" fill="#555" fontSize="5" fontFamily="monospace">0x32</text>
                </g>
              </svg>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <GlassCard>
            <div className="flex justify-center">
              <CyberHealthGauge score={healthScore} />
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-orbitron font-semibold text-white tracking-wider mb-3 border-b border-gray-700 pb-2 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-white" />
              CONSOLE LOG
            </h3>
            <div
              ref={consoleRef}
              className="bg-black/80 rounded-lg border border-gray-700 p-3 font-mono text-[10px] leading-relaxed h-64 overflow-y-auto flex flex-col gap-1.5"
            >
              {consoleLog.map((line, idx) => {
                let color = "text-gray-400";
                if (line.includes("[CRITICAL]")) color = "text-white font-bold";
                else if (line.includes("[WARN]")) color = "text-gray-300";
                else if (line.includes("[SUCCESS]")) color = "text-white font-bold";
                else if (line.includes("[SYSTEM]")) color = "text-gray-500";
                return (
                  <motion.div
                    key={idx}
                    className={color}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {line}
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-gray-600 border-t border-gray-700 pt-3">
              <span>CAN Bus: Virtualized</span>
              <button
                onClick={() => {
                  stopSimulation();
                  setConsoleLog([
                    "[SYSTEM] Console reset. Sandbox reinitialized.",
                    "[SYSTEM] All ECUs reporting normal status.",
                  ]);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "@/context/DashboardContext";
import GlassCard from "@/components/GlassCard";
import {
  AreaChart, Area, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import {
  Activity, Cpu, Sliders, TrendingUp, Hash, RefreshCw,
  AlertCircle, Radio, BarChart3, Eye, Zap, Network, ArrowUpRight
} from "lucide-react";

export default function CyberTwinPage() {
  const {
    ecuStatuses,
    cyberTwinStats,
    simulationState,
    mitigationState,
    setSelectedEcu,
  } = useDashboard();

  const [envelopeData, setEnvelopeData] = useState<{ tick: number; upper: number; lower: number; actual: number; baseline: number }[]>([]);
  const [hexFrames, setHexFrames] = useState<string[]>([]);
  const [canIdDiversity, setCanIdDiversity] = useState<{ id: string; count: number }[]>([]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; opacity: number }[]>([]);
  const [trafficNodes, setTrafficNodes] = useState<{ id: string; active: boolean }[]>([]);

  const getTargetEcuForAttack = useMemo(() => {
    return (attack: string) => {
      switch (attack) {
        case "dos": return "0x0A";
        case "gear": return "0x1A";
        case "fuzzy": return "0x32";
        case "rpm": return "0x12";
        default: return "";
      }
    };
  }, []);

  const isTarget = useMemo(() =>
    simulationState !== "idle" && cyberTwinStats.selectedEcu === getTargetEcuForAttack(simulationState),
    [simulationState, cyberTwinStats.selectedEcu, getTargetEcuForAttack]
  );

  const drift = cyberTwinStats.signalDrift;
  let twinIntegrity = 100 - Math.min(100, Math.floor(drift * 100));
  if (isTarget) {
    twinIntegrity = mitigationState === "mitigated" ? 82 : 24;
  }

  const integrityLabel = twinIntegrity > 85 ? "STABLE" : twinIntegrity > 60 ? "DEGRADED" : "BREACHED";
  const integrityClass = twinIntegrity > 85 ? "text-white" : twinIntegrity > 60 ? "text-ash-300" : "text-ash-100";

  useEffect(() => {
    const generateTick = (tick: number) => {
      const isEcuTarget = simulationState !== "idle" && cyberTwinStats.selectedEcu === getTargetEcuForAttack(simulationState);
      let upper = 65, lower = 35, base = 50, baseline = 50;
      const jitter = Math.sin(tick * 0.5) * 8 + (Math.random() * 4 - 2);

      if (cyberTwinStats.selectedEcu === "0x0A") { upper = 220; lower = 160; base = 190; baseline = 190; }
      else if (cyberTwinStats.selectedEcu === "0x32") { upper = 45; lower = 15; base = 30; baseline = 30; }
      else if (cyberTwinStats.selectedEcu === "0x2C") { upper = 90; lower = 30; base = 60; baseline = 60; }

      let actual = base + jitter;

      if (isEcuTarget) {
        if (simulationState === "dos") actual = base + 120 + Math.random() * 20;
        else if (simulationState === "gear") actual = upper + 15 + Math.sin(tick * 1.2) * 2;
        else if (simulationState === "fuzzy") actual = tick % 2 === 0 ? upper + 35 : lower - 25;
        else if (simulationState === "rpm") actual = lower - 15 + Math.random() * 2;
      }

      return { tick, upper: Number(upper.toFixed(1)), lower: Number(lower.toFixed(1)), actual: Number(actual.toFixed(1)), baseline };
    };

    const initial = [];
    for (let i = 0; i < 20; i++) initial.push(generateTick(i));
    setEnvelopeData(initial);

    const interval = setInterval(() => {
      setEnvelopeData((prev) => {
        const nextTick = prev.length ? prev[prev.length - 1].tick + 1 : 0;
        const next = [...prev, generateTick(nextTick)];
        if (next.length > 20) next.shift();
        return next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [cyberTwinStats.selectedEcu, simulationState, getTargetEcuForAttack]);

  useEffect(() => {
    const interval = setInterval(() => {
      const isEcuTarget = simulationState !== "idle" && cyberTwinStats.selectedEcu === getTargetEcuForAttack(simulationState);
      const rh = () => Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, "0");

      let frame = "";
      if (simulationState === "idle" || !isEcuTarget) {
        frame = `ID: ${cyberTwinStats.selectedEcu}0  DLC: 8  DATA: ${rh()} 00 ${rh()} FF 00 24 1A 5C`;
      } else {
        if (simulationState === "dos") frame = `ID: ${cyberTwinStats.selectedEcu}0  DLC: 8  DATA: FF FF FF FF FF FF FF FF  [FLOOD]`;
        else if (simulationState === "gear") frame = `ID: ${cyberTwinStats.selectedEcu}0  DLC: 8  DATA: 08 A2 4E 00 FF 12 FC C1  [SPOOF]`;
        else if (simulationState === "fuzzy") frame = `ID: 0x${rh()}A  DLC: 8  DATA: ${rh()} ${rh()} ${rh()} ${rh()} ${rh()} ${rh()} ${rh()} ${rh()}`;
        else if (simulationState === "rpm") frame = `ID: ${cyberTwinStats.selectedEcu}0  DLC: 4  DATA: 02 10 03 5A  [RPM]`;
      }

      setHexFrames((prev) => [frame, ...prev].slice(0, 10));
    }, 400);

    return () => clearInterval(interval);
  }, [cyberTwinStats.selectedEcu, simulationState, getTargetEcuForAttack]);

  useEffect(() => {
    const canIds = ["0x0A", "0x12", "0x1A", "0x24", "0x32", "0x2C", "0x48"];
    const interval = setInterval(() => {
      setCanIdDiversity((prev) => {
        const id = canIds[Math.floor(Math.random() * canIds.length)];
        const existing = prev.find((p) => p.id === id);
        if (existing) {
          return prev.map((p) => p.id === id ? { ...p, count: p.count + 1 } : p);
        }
        return [...prev, { id, count: 1 }];
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => {
        const newP = { id: Date.now() + Math.random(), x: Math.random() * 100, y: Math.random() * 100, opacity: 0.9 };
        const updated = [...prev, newP].map((p) => ({ ...p, opacity: p.opacity - 0.09 })).filter((p) => p.opacity > 0);
        return updated.slice(-12);
      });
    }, 180);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canIds = ["0x0A", "0x12", "0x1A", "0x24", "0x32", "0x2C"];
    const interval = setInterval(() => {
      setTrafficNodes((prev) => {
        const activeIds = canIds.filter(() => Math.random() > 0.6);
        return canIds.map((id) => ({ id, active: activeIds.includes(id) }));
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const trafficNodesPositions = useMemo(() => ({
    "0x0A": { x: 50, y: 15 }, "0x12": { x: 30, y: 45 },
    "0x1A": { x: 70, y: 45 }, "0x24": { x: 20, y: 75 },
    "0x32": { x: 80, y: 75 }, "0x2C": { x: 50, y: 90 },
  }), []);

  const canIdMaxCount = Math.max(...canIdDiversity.map((d) => d.count), 1);

  const anomalyThreshold = twinIntegrity < 50;

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold font-orbitron tracking-wider text-white flex items-center gap-3">
          <Activity className="h-6 w-6 text-ash-400" />
          BEHAVIORAL CYBER TWIN
        </h1>
        <p className="text-sm text-ash-500 font-mono mt-1">
          Digital behavioral modeling of vehicular CAN bus. Compares mathematical normal envelopes with live telemetry feature spaces.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-5 flex flex-col gap-6">
          <GlassCard hoverable={false} className="flex-1">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
              <Cpu className="h-4 w-4 text-ash-400" />
              <h3 className="text-sm font-orbitron font-semibold tracking-wider text-white">
                AUDITED TRANSCEIVERS
              </h3>
            </div>

            <div className="space-y-2">
              {Object.values(ecuStatuses).map((ecu) => {
                const isSelected = ecu.id === cyberTwinStats.selectedEcu;
                const isEcuTarget = simulationState !== "idle" && ecu.id === getTargetEcuForAttack(simulationState);
                return (
                  <motion.button
                    key={ecu.id}
                    onClick={() => setSelectedEcu(ecu.id)}
                    layout
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={`w-full text-left p-3 rounded-lg border font-mono transition-all duration-300 text-xs flex justify-between items-center ${
                      isSelected
                        ? "bg-white/10 border-white/25 text-white"
                        : "bg-ash-950/30 border-white/5 text-ash-400 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{ecu.name}</div>
                      <div className="text-[10px] text-ash-600 mt-0.5">
                        CAN ID: {ecu.id}  PKT: {ecu.packetRate}/s
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {isEcuTarget && (
                        <span className="text-[9px] text-ash-300 bg-white/10 px-1.5 py-0.5 rounded">
                          TARGET
                        </span>
                      )}
                      <span className={`w-2 h-2 rounded-full ${
                        ecu.status === "compromised"
                          ? "bg-white monochrome-pulse"
                          : ecu.status === "warn"
                          ? "bg-ash-300 monochrome-pulse"
                          : "bg-ash-600"
                      }`} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard variant={anomalyThreshold ? "danger" : "default"} hoverable={false}>
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
              <Network className="h-4 w-4 text-ash-400" />
              <h3 className="text-sm font-orbitron font-semibold tracking-wider text-white">
                CAN TRAFFIC FLOW
              </h3>
            </div>

            <div className="relative w-full aspect-[4/3] bg-black/40 border border-white/5 rounded-lg overflow-hidden">
              <div className="absolute inset-0 monochrome-grid-dense opacity-[0.2]" />

              {Object.entries(trafficNodesPositions).map(([id, pos]) => {
                const node = trafficNodes.find((n) => n.id === id);
                const isActive = node?.active ?? false;
                return (
                  <div
                    key={id}
                    className={`absolute w-2 h-2 rounded-full transition-all duration-500 ${
                      isActive ? "bg-white shadow-[0_0_6px_rgba(255,255,255,0.3)]" : "bg-ash-700"
                    }`}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
                  />
                );
              })}

              {trafficNodes.filter((n) => n.active).map((n) => {
                const from = trafficNodesPositions[n.id as keyof typeof trafficNodesPositions];
                if (!from) return null;
                const others = Object.entries(trafficNodesPositions)
                  .filter(([k]) => k !== n.id && trafficNodes.some((t) => t.id === k && t.active));
                if (!others.length) return null;
                const [toId, toPos] = others[Math.floor(Math.random() * others.length)];
                return (
                  <motion.div
                    key={`flow-${n.id}-${toId}`}
                    className="absolute h-[1px] bg-gradient-to-r from-white/30 to-transparent"
                    style={{ left: `${from.x}%`, top: `${from.y}%`, width: "40px" }}
                    animate={{
                      left: [`${from.x}%`, `${toPos.x}%`],
                      top: [`${from.y}%`, `${toPos.y}%`],
                      opacity: [0.6, 0],
                      width: ["40px", "0px"],
                    }}
                    transition={{ duration: 1.2, ease: "linear", repeat: Infinity }}
                  />
                );
              })}

              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute w-1 h-1 bg-white/80 rounded-full"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: p.opacity }}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 0] }}
                  transition={{ duration: 0.6 }}
                />
              ))}

              <div className="absolute bottom-1.5 left-1.5 text-[8px] font-mono text-ash-600">
                {trafficNodes.filter((n) => n.active).length} ACTIVE NODES
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6">
          <GlassCard hoverable={false}>
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
              <Radio className="h-4 w-4 text-ash-400" />
              <h3 className="text-sm font-orbitron font-semibold tracking-wider text-white">
                TWIN INTEGRITY COMPARATOR
              </h3>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 py-2">
              <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="72" cy="72" r="58" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <motion.circle
                    cx="72" cy="72" r="58"
                    fill="transparent"
                    stroke={twinIntegrity > 85 ? "#ffffff" : twinIntegrity > 60 ? "#a3a3a3" : "#666666"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 58}
                    animate={{ strokeDashoffset: (2 * Math.PI * 58) * (1 - twinIntegrity / 100) }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                  <span className={`text-3xl font-bold font-orbitron ${integrityClass}`}>
                    {twinIntegrity}%
                  </span>
                  <span className="text-[9px] text-ash-600 uppercase tracking-widest mt-0.5">MATCHED</span>
                </div>
              </div>

              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-ash-600 text-[10px] uppercase tracking-wider">Deviation Drift</span>
                  <div className={`text-sm font-semibold mt-1 ${anomalyThreshold ? "text-white" : "text-ash-300"}`}>
                    {drift.toFixed(3)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-ash-600 text-[10px] uppercase tracking-wider">Signal Integrity</span>
                  <div className={`text-sm font-semibold mt-1 ${integrityClass}`}>
                    {integrityLabel}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-ash-600 text-[10px] uppercase tracking-wider">Envelope Status</span>
                  <div className={`text-sm font-semibold mt-1 ${anomalyThreshold ? "text-white" : "text-ash-400"}`}>
                    {anomalyThreshold ? "BREACHED" : "INTACT"}
                  </div>
                </div>
              </div>
            </div>

            {anomalyThreshold && (
              <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10 font-mono text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-ash-300 flex-shrink-0" />
                <span className="text-ash-300">Profile envelope breach detected. Signal deviation exceeds 99% probability bounds.</span>
              </div>
            )}
          </GlassCard>

          <GlassCard hoverable={false}>
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
              <BarChart3 className="h-4 w-4 text-ash-400" />
              <h3 className="text-sm font-orbitron font-semibold tracking-wider text-white">
                CAN ID DIVERSITY
              </h3>
            </div>

            <div className="space-y-1.5">
              {canIdDiversity.length === 0 && (
                <div className="text-xs font-mono text-ash-600 text-center py-4">
                  Sampling CAN identifiers...
                </div>
              )}
              {canIdDiversity.slice(-6).map((item) => {
                const pct = Math.max(4, (item.count / canIdMaxCount) * 100);
                const ecu = Object.values(ecuStatuses).find((e) => e.id === item.id);
                return (
                  <div key={item.id} className="flex items-center gap-3 font-mono text-xs">
                    <span className="w-12 text-ash-500 text-[10px]">{item.id}</span>
                    <div className="flex-1 h-4 bg-ash-950/50 rounded-sm overflow-hidden border border-white/5">
                      <motion.div
                        className="h-full bg-white/20"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <span className="w-8 text-right text-ash-400 text-[10px]">{item.count}</span>
                    <span className="w-24 text-ash-600 text-[9px] truncate hidden sm:block">
                      {ecu?.name?.split(" ")[0] ?? ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

      </div>

      <GlassCard hoverable={false}>
        <div>
          <div className="flex flex-wrap justify-between items-start border-b border-white/5 pb-3 mb-4 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-ash-400" />
                <h3 className="text-sm font-orbitron font-semibold tracking-wider text-white">
                  BEHAVIORAL PROFILE ENVELOPE
                </h3>
              </div>
              <p className="text-xs text-ash-600 font-mono mt-0.5">
                Shaded region defines 99% probability boundaries. White line: live signal. Dashed: learned baseline.
              </p>
            </div>
            <div className="flex gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 text-ash-500 bg-white/5 border border-white/10 px-2.5 py-1 rounded">
                <span className="w-2 h-2 rounded bg-white/20" />
                Envelope
              </span>
              <span className="flex items-center gap-1.5 text-ash-500 bg-white/5 border border-white/10 px-2.5 py-1 rounded">
                <span className="w-2 h-2 bg-white" />
                Signal
              </span>
              <span className="flex items-center gap-1.5 text-ash-500 bg-white/5 border border-white/10 px-2.5 py-1 rounded">
                <span className="w-2 h-0.5 bg-ash-600" />
                Baseline
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 w-full h-72 bg-black/20 rounded-lg p-2 border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={envelopeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="monoEnvelope" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.06} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="monoSignal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={anomalyThreshold ? "#aaaaaa" : "#ffffff"} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={anomalyThreshold ? "#aaaaaa" : "#ffffff"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="tick" stroke="#525252" fontSize={9} fontFamily="monospace" hide />
                  <YAxis stroke="#525252" fontSize={9} fontFamily="monospace" domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(5,5,5,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontFamily: "monospace",
                      fontSize: "11px",
                      color: "#fff",
                    }}
                  />
                  <ReferenceLine y={envelopeData.length > 0 ? envelopeData[0].baseline : 50} stroke="#666" strokeDasharray="4 4" strokeWidth={1} />
                  <Area type="monotone" dataKey="upper" stroke="rgba(255,255,255,0.12)" fill="url(#monoEnvelope)" strokeWidth={1} strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="lower" stroke="rgba(255,255,255,0.12)" fill="transparent" strokeWidth={1} strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="actual" stroke={anomalyThreshold ? "#aaaaaa" : "#ffffff"} strokeWidth={1.5} fill="url(#monoSignal)" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="flex lg:flex-col gap-3 font-mono text-xs">
              <div className="flex-1 lg:flex-none p-3 rounded-lg bg-black/40 border border-white/5">
                <span className="text-ash-600 text-[10px] uppercase tracking-wider block mb-1">Msg Frequency</span>
                <div className={`text-base font-semibold font-orbitron ${cyberTwinStats.msgFrequency > cyberTwinStats.msgFrequencyNormal * 1.3 ? "text-white" : "text-ash-300"}`}>
                  {cyberTwinStats.msgFrequency.toFixed(1)}
                  <span className="text-[10px] text-ash-600 font-mono ml-1">Hz</span>
                </div>
                <div className="text-[10px] text-ash-600 mt-0.5">Normal: {cyberTwinStats.msgFrequencyNormal} Hz</div>
              </div>
              <div className="flex-1 lg:flex-none p-3 rounded-lg bg-black/40 border border-white/5">
                <span className="text-ash-600 text-[10px] uppercase tracking-wider block mb-1">Payload Entropy</span>
                <div className={`text-base font-semibold font-orbitron ${cyberTwinStats.payloadEntropy > 2.0 ? "text-white" : "text-ash-300"}`}>
                  {cyberTwinStats.payloadEntropy.toFixed(3)}
                </div>
                <div className="text-[10px] text-ash-600 mt-0.5">Normal: {cyberTwinStats.payloadEntropyNormal.toFixed(2)}</div>
              </div>
              <div className="flex-1 lg:flex-none p-3 rounded-lg bg-black/40 border border-white/5">
                <span className="text-ash-600 text-[10px] uppercase tracking-wider block mb-1">Signal Drift</span>
                <div className={`text-base font-semibold font-orbitron ${anomalyThreshold ? "text-white" : "text-ash-300"}`}>
                  {(drift * 100).toFixed(1)}
                  <span className="text-[10px] text-ash-600 font-mono ml-1">%</span>
                </div>
                <div className="text-[10px] text-ash-600 mt-0.5">Threshold: 5.0%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs font-mono text-ash-600 pt-3 border-t border-white/5">
          <span>Rolling Window: 20 samples @ 800ms</span>
          <span className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3 text-ash-600" />
            Feature Extraction: 13 engineered elements
          </span>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-6 flex flex-col gap-6">
          <GlassCard hoverable={false}>
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
              <Sliders className="h-4 w-4 text-ash-400" />
              <h3 className="text-sm font-orbitron font-semibold tracking-wider text-white">
                ROLLING STATISTICS FEATURE ENVELOPE
              </h3>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                <div>
                  <span className="text-ash-400 block">Message Rate</span>
                  <span className="text-[10px] text-ash-600">CAN frames per second</span>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${cyberTwinStats.msgFrequency > cyberTwinStats.msgFrequencyNormal * 1.3 ? "text-white" : "text-ash-200"}`}>
                    {cyberTwinStats.msgFrequency.toFixed(1)} Hz
                  </span>
                  <div className="text-[10px] text-ash-600">
                    Baseline: {cyberTwinStats.msgFrequencyNormal} Hz
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                <div>
                  <span className="text-ash-400 block">Payload Entropy</span>
                  <span className="text-[10px] text-ash-600">Shannon entropy of data bytes</span>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${cyberTwinStats.payloadEntropy > 2.0 ? "text-white" : "text-ash-200"}`}>
                    {cyberTwinStats.payloadEntropy.toFixed(3)}
                  </span>
                  <div className="text-[10px] text-ash-600">
                    Baseline: {cyberTwinStats.payloadEntropyNormal.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                <div>
                  <span className="text-ash-400 block">Timing Variance</span>
                  <span className="text-[10px] text-ash-600">Inter-message gap jitter</span>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${isTarget ? "text-white" : "text-ash-200"}`}>
                    {isTarget ? "0.048" : "0.002"} ms&sup2;
                  </span>
                  <div className="text-[10px] text-ash-600">
                    {isTarget ? "HIGH VARIANCE" : "STABLE"}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center py-2.5">
                <div>
                  <span className="text-ash-400 block">Compression Factor</span>
                  <span className="text-[10px] text-ash-600">Data reduction ratio</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-ash-200">350:1</span>
                  <div className="text-[10px] text-ash-600">Linearized</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-6">
          <GlassCard hoverable={false} className="flex-1">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-ash-400" />
                <h3 className="text-sm font-orbitron font-semibold tracking-wider text-white">
                  RAW BUS DECOMPRESSION STREAM
                </h3>
              </div>
              <RefreshCw className="h-3 w-3 text-ash-600 animate-spin" />
            </div>

            <div className="bg-black/50 p-3 rounded-lg font-mono text-[10px] h-64 overflow-hidden border border-white/5">
              {hexFrames.length === 0 && (
                <div className="text-ash-600 text-center py-8">Awaiting CAN frame data...</div>
              )}
              <AnimatePresence initial={false}>
                {hexFrames.map((frame, idx) => {
                  const isFlood = frame.includes("FLOOD");
                  const isSpoof = frame.includes("SPOOF");
                  const isDiag = frame.includes("DIAG");
                  const isAnomalous = isFlood || isSpoof || isDiag;
                  return (
                    <motion.div
                      key={`${frame}-${idx}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.25 }}
                      className={`truncate py-1 ${isAnomalous ? "text-white" : idx === 0 ? "text-ash-300" : "text-ash-600"}`}
                    >
                      <span className="text-ash-700 mr-2">[{hexFrames.length - 1 - idx}]</span>
                      {frame}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-ash-600 pt-2 border-t border-white/5">
              <span>Buffer: {hexFrames.length}/10 frames</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Live capture
              </span>
            </div>
          </GlassCard>
        </div>

      </div>

    </div>
  );
}

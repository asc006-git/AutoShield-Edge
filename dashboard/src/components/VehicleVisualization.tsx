"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "@/context/DashboardContext";

interface NodeData {
  id: string;
  label: string;
  x: number;
  y: number;
  ecuId: string;
}

interface ConnectionData {
  from: string;
  to: string;
}

const NODES: NodeData[] = [
  { id: "cgw", label: "CGW", x: 500, y: 70, ecuId: "0x0A" },
  { id: "ecu", label: "ECU", x: 310, y: 170, ecuId: "0x12" },
  { id: "tcu", label: "TCU", x: 180, y: 350, ecuId: "0x1A" },
  { id: "abs", label: "ABS", x: 690, y: 170, ecuId: "0x32" },
  { id: "eps", label: "EPS", x: 820, y: 350, ecuId: "0x24" },
  { id: "ivi", label: "IVI", x: 500, y: 630, ecuId: "0x2C" },
];

const CONNECTIONS: ConnectionData[] = [
  { from: "cgw", to: "ecu" },
  { from: "cgw", to: "tcu" },
  { from: "cgw", to: "abs" },
  { from: "cgw", to: "eps" },
  { from: "cgw", to: "ivi" },
  { from: "ecu", to: "abs" },
  { from: "tcu", to: "eps" },
];

const VEHICLE_ZONES = [
  {
    id: "front",
    label: "FRONT / POWERTRAIN",
    path: "M 317,170 Q 500,155 683,170 L 683,260 Q 500,245 317,260 Z",
  },
  {
    id: "cabin",
    label: "CABIN / IVI / FUSION",
    path: "M 317,260 Q 500,245 683,260 L 683,440 Q 500,455 317,440 Z",
  },
  {
    id: "rear",
    label: "REAR / BMS / CHARGE",
    path: "M 317,440 Q 500,455 683,440 L 683,528 Q 500,540 317,528 Z",
  },
];

const ZONE_METRICS: Record<string, { label: string; metrics: { label: string; value: string }[] }> = {
  front: {
    label: "FRONT / POWERTRAIN CYBER POSTURE",
    metrics: [
      { label: "BATTERY HV ISOLATION", value: "1.2 GΩ" },
      { label: "MOTOR INVERTER TEMP", value: "68°C" },
      { label: "DC-DC CONVERTER EFF", value: "98.3%" },
      { label: "FRONT RADAR UNIT", value: "ONLINE / SECURE" },
      { label: "CAN BUS A INTEGRITY", value: "ENCRYPTED" },
    ],
  },
  cabin: {
    label: "CABIN / IVI / ADAS FUSION CYBER POSTURE",
    metrics: [
      { label: "INFOTAINMENT INTEGRITY", value: "VERIFIED" },
      { label: "ADAS SENSOR FUSION", value: "LOCKED / SECURE" },
      { label: "DRIVER MONITORING", value: "ACTIVE / CLEAN" },
      { label: "V2X AUTHENTICATION", value: "TRUSTED / PKI" },
      { label: "E-CALL SYSTEM", value: "STANDBY / OK" },
    ],
  },
  rear: {
    label: "REAR / BMS / CHARGING CYBER POSTURE",
    metrics: [
      { label: "BATTERY PACK TEMP", value: "36°C / NOMINAL" },
      { label: "CELL BALANCING", value: "±2 mV / STABLE" },
      { label: "CHARGE PORT LOCK", value: "ENGAGED / AUTH" },
      { label: "REAR MOTOR INVERTER", value: "94.1% EFF" },
      { label: "BMS FIRMWARE", value: "v3.2.1 / VALID" },
    ],
  },
  wheels: {
    label: "WHEELS / BRAKE / STEERING CYBER POSTURE",
    metrics: [
      { label: "TPMS LF", value: "42 PSI / OK" },
      { label: "TPMS RF", value: "41 PSI / OK" },
      { label: "TPMS LR", value: "40 PSI / OK" },
      { label: "TPMS RR", value: "41 PSI / OK" },
      { label: "ABS MODULE STATUS", value: "SECURE / CAL" },
      { label: "STEERING TORQUE SENSOR", value: "CALIBRATED" },
    ],
  },
};

const GLOW_FILTER = "drop-shadow(0 0 12px rgba(255,255,255,0.15))";

export default function VehicleVisualization() {
  const {
    healthScore,
    activeThreatCount,
    simulationState,
    ecuStatuses,
    setSelectedEcu,
  } = useDashboard();

  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [wheelZoneOpen, setWheelZoneOpen] = useState(false);

  const hasThreat = simulationState !== "idle" && activeThreatCount > 0;

  const getNodeStatus = (ecuId: string) => {
    return ecuStatuses[ecuId]?.status || "secure";
  };

  const isNodeThreatened = (ecuId: string) => {
    if (!hasThreat) return false;
    const status = getNodeStatus(ecuId);
    return status === "compromised" || status === "warn";
  };

  const handleNodeClick = (ecuId: string) => {
    setSelectedEcu(ecuId);
  };

  const handleZoneClick = (zoneId: string) => {
    setSelectedZone(prev => prev === zoneId ? null : zoneId);
  };

  const handleWheelClick = () => {
    setWheelZoneOpen(prev => !prev);
  };

  const handleCloseTooltip = () => {
    setSelectedZone(null);
    setWheelZoneOpen(false);
  };

  const gaugeRadius = 64;
  const gaugeCx = 80;
  const gaugeCy = 80;
  const gaugeStroke = 7;
  const gaugeCirc = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCirc * (1 - healthScore / 100);

  return (
    <div className="relative w-full overflow-hidden rounded-xl glass-panel" style={{ minHeight: "560px" }}>
      <div className="absolute inset-0 monochrome-grid-dense opacity-50 pointer-events-none" />

      {/* Cyber Health Gauge */}
      <div className="absolute top-4 right-4 z-20">
        <div className="glass-panel-glow rounded-xl p-3 flex items-center justify-center"
          style={{ width: "170px", height: "170px" }}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx={gaugeCx} cy={gaugeCy} r={gaugeRadius}
              fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={gaugeStroke} />
            <motion.circle cx={gaugeCx} cy={gaugeCy} r={gaugeRadius}
              fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={gaugeStroke}
              strokeLinecap="round"
              strokeDasharray={gaugeCirc}
              animate={{ strokeDashoffset: gaugeOffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              transform="rotate(-90 80 80)"
              style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.25))" }}
            />
            <text x="80" y="86" textAnchor="middle" fill="white"
              fontSize="30" fontFamily="var(--font-orbitron)" fontWeight="bold"
              style={{ filter: "drop-shadow(0 0 12px rgba(255,255,255,0.2))" }}>
              {healthScore}%
            </text>
            <text x="80" y="108" textAnchor="middle" fill="rgba(255,255,255,0.35)"
              fontSize="8" fontFamily="monospace" letterSpacing="3">
              CYBER HEALTH
            </text>
            {hasThreat && (
              <text x="80" y="124" textAnchor="middle" fill="rgba(255,255,255,0.5)"
                fontSize="7" fontFamily="monospace" letterSpacing="1.5">
                <motion.tspan
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}>
                  THREAT ACTIVE
                </motion.tspan>
              </text>
            )}
          </svg>
        </div>
      </div>

      {/* Main SVG */}
      <svg viewBox="0 0 1000 700" className="w-full h-full select-none" style={{ minHeight: "560px" }}>
        <defs>
          <filter id="vg">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ng">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Title */}
        <text x="36" y="40" fill="rgba(255,255,255,0.08)" fontSize="9" fontFamily="monospace" letterSpacing="4">
          VEHICLE CYBER TOPOLOGY — ZONE SELECT
        </text>

        {/* Connection lines */}
        {CONNECTIONS.map((conn, idx) => {
          const from = NODES.find(n => n.id === conn.from)!;
          const to = NODES.find(n => n.id === conn.to)!;
          const threatened = isNodeThreatened(from.ecuId) || isNodeThreatened(to.ecuId);

          return (
            <g key={idx}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={threatened ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.06)"}
                strokeWidth={threatened ? 2 : 1} />
              <motion.line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={threatened ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)"}
                strokeWidth={threatened ? 1.5 : 0.8}
                strokeDasharray={threatened ? "3 5" : "4 8"}
                animate={{ strokeDashoffset: [0, -24] }}
                transition={{ repeat: Infinity, ease: "linear", duration: threatened ? 0.6 : 2 }}
                style={threatened ? { filter: GLOW_FILTER } : undefined} />
              {/* Data flow dot */}
              <motion.circle r={2.5} fill="rgba(255,255,255,0.4)"
                style={threatened ? { filter: GLOW_FILTER } : undefined}
                animate={{
                  cx: [from.x, to.x],
                  cy: [from.y, to.y],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: threatened ? 0.8 : 2.5,
                  ease: "linear",
                }} />
            </g>
          );
        })}

        {/* CAN Nodes */}
        {NODES.map((node, idx) => {
          const status = getNodeStatus(node.ecuId);
          const threatened = status === "compromised" || status === "warn";
          const isSecure = status === "secure";

          return (
            <g key={node.id}>
              {(status === "compromised") && (
                <motion.circle cx={node.x} cy={node.y} r={20}
                  fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5}
                  animate={{ r: [20, 30], opacity: [0.5, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }} />
              )}
              {(status === "warn") && (
                <motion.circle cx={node.x} cy={node.y} r={18}
                  fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1}
                  animate={{ r: [18, 24], opacity: [0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />
              )}
              <g
                onClick={() => handleNodeClick(node.ecuId)}
                onMouseEnter={() => setActiveZone(node.id)}
                onMouseLeave={() => setActiveZone(null)}
                className="cursor-pointer"
                style={{ filter: threatened ? GLOW_FILTER : "none" }}
              >
                <circle cx={node.x} cy={node.y} r={threatened ? 14 : 11}
                  fill={threatened ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)"}
                  stroke={isSecure ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.4)"}
                  strokeWidth={isSecure ? 1 : 1.5} />
                <circle cx={node.x} cy={node.y} r={threatened ? 6 : 4}
                  fill={threatened ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)"}
                  style={threatened ? { filter: GLOW_FILTER } : undefined} />
                {threatened && (
                  <motion.circle cx={node.x} cy={node.y} r={4}
                    fill="rgba(255,255,255,0.5)"
                    animate={{ r: [4, 8], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    style={{ filter: GLOW_FILTER }} />
                )}
              </g>
              <text x={node.x} y={node.y + (threatened ? 26 : 24)}
                textAnchor="middle" fill="rgba(255,255,255,0.5)"
                fontSize={threatened ? 10 : 9}
                fontFamily="var(--font-orbitron)" fontWeight={600}
                style={threatened ? { filter: GLOW_FILTER } : undefined}>
                {node.label}
              </text>
              <text x={node.x} y={node.y - (threatened ? 22 : 20)}
                textAnchor="middle" fill="rgba(255,255,255,0.15)"
                fontSize={7} fontFamily="monospace">
                {node.ecuId}
              </text>
            </g>
          );
        })}

        {/* Vehicle group with glow */}
        <g filter="url(#vg)" style={{ filter: "drop-shadow(0 0 30px rgba(255,255,255,0.04))" }}>

          {/* Main body */}
          <path d="M 400,168 Q 500,155 600,168 C 655,183 678,212 683,250 L 683,435 C 678,478 655,508 600,522 Q 500,535 400,522 C 345,508 322,478 317,435 L 317,250 C 322,212 345,183 400,168 Z"
            fill="#0f0f0f" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* Glass roof */}
          <path d="M 368,215 Q 500,200 632,215 Q 648,238 653,262 L 653,425 Q 648,452 632,478 Q 500,492 368,478 Q 352,452 347,425 L 347,262 Q 352,238 368,215 Z"
            fill="#0a0a0a" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

          {/* Hood section */}
          <path d="M 400,168 Q 500,155 600,168 C 620,175 635,185 645,200 Q 500,192 355,200 C 365,185 380,175 400,168 Z"
            fill="#121212" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

          {/* Trunk section */}
          <path d="M 368,478 Q 500,492 632,478 C 648,465 662,450 670,438 Q 500,448 330,438 C 338,450 352,465 368,478 Z"
            fill="#121212" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

          {/* Hood crease lines */}
          <path d="M 355,200 Q 500,192 645,200" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <path d="M 330,438 Q 500,448 670,438" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

          {/* Center spine line */}
          <line x1="500" y1="170" x2="500" y2="525" stroke="rgba(255,255,255,0.02)" strokeWidth="0.3" strokeDasharray="3,6" />

          {/* A-character lines (side sculpting) */}
          <path d="M 317,290 Q 400,278 500,276 Q 600,278 683,290" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <path d="M 317,420 Q 400,410 500,408 Q 600,410 683,420" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

          {/* Door lines */}
          <line x1="320" y1="310" x2="320" y2="400" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <line x1="680" y1="310" x2="680" y2="400" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

          {/* Wheel arches */}
          <path d="M 310,248 Q 320,238 335,238 Q 350,238 360,248" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
          <path d="M 640,248 Q 650,238 665,238 Q 680,238 690,248" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
          <path d="M 310,448 Q 320,458 335,458 Q 350,458 360,448" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
          <path d="M 640,448 Q 650,458 665,458 Q 680,458 690,448" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />

          {/* Wheels */}
          {[
            { cx: 335, cy: 265 },
            { cx: 665, cy: 265 },
            { cx: 335, cy: 468 },
            { cx: 665, cy: 468 },
          ].map((w, i) => (
            <g key={i}>
              <circle cx={w.cx} cy={w.cy} r="16" fill="#050505" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <circle cx={w.cx} cy={w.cy} r="7" fill="#1a1a1a" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              <line x1={w.cx - 5} y1={w.cy} x2={w.cx + 5} y2={w.cy} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1={w.cx} y1={w.cy - 5} x2={w.cx} y2={w.cy + 5} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
            </g>
          ))}

          {/* Side mirrors */}
          <rect x="306" y="242" width="11" height="28" rx="4" fill="#141414" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <rect x="683" y="242" width="11" height="28" rx="4" fill="#141414" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

          {/* Headlights */}
          <path d="M 392,168 L 418,164 L 414,178 L 388,176 Z" fill="#1c1c1c" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <path d="M 608,168 L 582,164 L 586,178 L 612,176 Z" fill="#1c1c1c" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

          {/* Taillights */}
          <path d="M 392,524 L 418,528 L 414,515 L 388,517 Z" fill="#1c1c1c" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <path d="M 608,524 L 582,528 L 586,515 L 612,517 Z" fill="#1c1c1c" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

        </g>

        {/* Vehicle label */}
        <text x="500" y="575" textAnchor="middle" fill="rgba(255,255,255,0.06)"
          fontSize="7" fontFamily="monospace" letterSpacing="6">
          TESLA MODEL S — PLAID V2X
        </text>

        {/* Interactive Zones */}
        {VEHICLE_ZONES.map((zone) => (
          <g key={zone.id}>
            <path
              d={zone.path}
              fill={selectedZone === zone.id ? "rgba(255,255,255,0.04)" : "transparent"}
              stroke={activeZone === zone.id ? "rgba(255,255,255,0.15)" : "transparent"}
              strokeWidth={1}
              strokeDasharray="4 4"
              className="cursor-pointer transition-all duration-300"
              onClick={() => handleZoneClick(zone.id)}
              onMouseEnter={() => setActiveZone(zone.id)}
              onMouseLeave={() => setActiveZone(null)}
            />
            <text
              x={500}
              y={zone.id === "front" ? 228 : zone.id === "cabin" ? 360 : 488}
              textAnchor="middle"
              fill={selectedZone === zone.id ? "rgba(255,255,255,0.3)" : activeZone === zone.id ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.04)"}
              fontSize="8"
              fontFamily="monospace"
              letterSpacing="3"
              className="pointer-events-none transition-all duration-300"
            >
              {zone.id === "front" ? "FRONT" : zone.id === "cabin" ? "CABIN" : "REAR"}
            </text>
          </g>
        ))}

        {/* Wheel clickable zones */}
        {[
          { cx: 335, cy: 265, id: "wheel-lf" },
          { cx: 665, cy: 265, id: "wheel-rf" },
          { cx: 335, cy: 468, id: "wheel-lr" },
          { cx: 665, cy: 468, id: "wheel-rr" },
        ].map((w) => (
          <circle key={w.id} cx={w.cx} cy={w.cy} r="20"
            fill={wheelZoneOpen ? "rgba(255,255,255,0.04)" : "transparent"}
            stroke={activeZone === w.id ? "rgba(255,255,255,0.15)" : "transparent"}
            strokeWidth={1}
            strokeDasharray="4 4"
            className="cursor-pointer transition-all duration-300"
            onClick={handleWheelClick}
            onMouseEnter={() => setActiveZone(w.id)}
            onMouseLeave={() => setActiveZone(null)} />
        ))}
      </svg>

      {/* Zone info tooltip */}
      <AnimatePresence>
        {(selectedZone && ZONE_METRICS[selectedZone]) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute bottom-4 left-4 right-4 md:left-8 md:right-auto md:w-80 z-20 glass-panel-glow rounded-xl p-4 border border-white/10"
            style={{ boxShadow: "0 0 40px rgba(255,255,255,0.04)" }}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[9px] font-mono text-gray-500 tracking-widest">
                {ZONE_METRICS[selectedZone].label}
              </span>
              <button
                onClick={handleCloseTooltip}
                className="text-gray-600 hover:text-white transition-colors text-xs leading-none"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5">
              {ZONE_METRICS[selectedZone].metrics.map((m, i) => (
                <div key={i}
                  className="flex justify-between items-center py-1 px-2 rounded bg-black/30 border border-white/5 text-[10px] font-mono">
                  <span className="text-gray-400 tracking-wide">{m.label}</span>
                  <span className="text-white font-semibold"
                    style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.15))" }}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {wheelZoneOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute bottom-4 left-4 right-4 md:left-8 md:right-auto md:w-80 z-20 glass-panel-glow rounded-xl p-4 border border-white/10"
            style={{ boxShadow: "0 0 40px rgba(255,255,255,0.04)" }}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[9px] font-mono text-gray-500 tracking-widest">
                {ZONE_METRICS.wheels.label}
              </span>
              <button
                onClick={handleCloseTooltip}
                className="text-gray-600 hover:text-white transition-colors text-xs leading-none"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5">
              {ZONE_METRICS.wheels.metrics.map((m, i) => (
                <div key={i}
                  className="flex justify-between items-center py-1 px-2 rounded bg-black/30 border border-white/5 text-[10px] font-mono">
                  <span className="text-gray-400 tracking-wide">{m.label}</span>
                  <span className="text-white font-semibold"
                    style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.15))" }}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom status bar */}
      <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[8px] font-mono text-gray-600 tracking-wider pointer-events-none z-10">
        <span>NODE COUNT: {Object.keys(ecuStatuses).length} ECU</span>
        <span className="text-center">
          {hasThreat ? "⚠ THREAT DETECTED — PRESS ECU TO INVESTIGATE" : "◆ STANDING BY — ALL BUSES NOMINAL"}
        </span>
        <span className="text-right">{hasThreat ? "ALERT LEVEL: ACTIVE" : "STATUS: SECURE"}</span>
      </div>
    </div>
  );
}

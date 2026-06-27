"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { usePipeline } from "@/context/PipelineContext";

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

const GLOW_FILTER = "drop-shadow(0 0 12px rgba(255,255,255,0.15))";

export default function VehicleVisualization() {
  const {
    pipelineStatus,
    selectedAttack,
  } = usePipeline();

  const [activeNode, setActiveNode] = useState<string | null>(null);

  const activeThreatCount = pipelineStatus === "running" && selectedAttack !== "normal" ? 1 : 0;
  const simulationState = pipelineStatus === "running" ? selectedAttack : "idle";
  const hasThreat = simulationState !== "idle" && activeThreatCount > 0;

  const getNodeStatus = (ecuId: string) => {
    // In a real app, this would pull from backend stage data
    return "secure";
  };

  const isNodeThreatened = (ecuId: string) => {
    if (!hasThreat) return false;
    const status = getNodeStatus(ecuId);
    return status === "compromised" || status === "warn";
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl glass-panel" style={{ minHeight: "560px" }}>
      <div className="absolute inset-0 monochrome-grid-dense opacity-50 pointer-events-none" />

      {/* Title */}
      <div className="absolute top-4 left-6 z-10">
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
          VEHICLE ECU TOPOLOGY
        </span>
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
        {NODES.map((node) => {
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
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
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
      </svg>

      {/* Bottom status bar */}
      <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[8px] font-mono text-gray-600 tracking-wider pointer-events-none z-10">
        <span>NODE COUNT: 6 ECU</span>
        <span className="text-center">
          {hasThreat ? "⚠ THREAT DETECTED" : "◆ STANDING BY — ALL BUSES NOMINAL"}
        </span>
        <span className="text-right">{hasThreat ? "ALERT LEVEL: ACTIVE" : "STATUS: SECURE"}</span>
      </div>
    </div>
  );
}
